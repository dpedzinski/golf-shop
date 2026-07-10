import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const API_ROOT = "https://ces.googleapis.com/v1beta";

const args = parseArgs(process.argv.slice(2));
const evaluationFiles = args.positionals.map((file) => resolve(file));
const projectId = args.flags.project ?? process.env.PROJECT_ID ?? process.env.GOOGLE_CLOUD_PROJECT;
const location = args.flags.location ?? process.env.CES_LOCATION ?? "us";
const appId = args.flags.app ?? process.env.CES_APP_ID;
const toolset = args.flags.toolset ?? process.env.CES_TOOLSET_NAME;
const agent = args.flags.agent ?? process.env.CES_AGENT_NAME;
const agentTools = csvValues(args.flags["agent-tools"] ?? process.env.CES_AGENT_TOOLS);
const appVersion = args.flags["app-version"] ?? process.env.CES_APP_VERSION_NAME;
const artifactPath = args.flags.artifact ? resolve(args.flags.artifact) : null;
const dryRun = Boolean(args.flags["dry-run"]);
const shouldRun = Boolean(args.flags.run);
const timeoutSeconds = Number(args.flags["timeout-seconds"] ?? process.env.CES_EVALUATION_TIMEOUT_SECONDS ?? "900");
const pollSeconds = Number(args.flags["poll-interval-seconds"] ?? process.env.CES_EVALUATION_POLL_SECONDS ?? "10");

if (!projectId) {
  fail("Missing --project or PROJECT_ID.");
}
if (!appId) {
  fail("Missing --app or CES_APP_ID.");
}
if (!evaluationFiles.length) {
  fail("Pass at least one evaluation JSON file.");
}

const appName = resourceName(appId, `projects/${projectId}/locations/${location}/apps`);
const toolsetName = toolset ? resourceName(toolset, `${appName}/toolsets`) : "";
const agentName = agent ? resourceName(agent, `${appName}/agents`) : "";
const agentToolNames = agentTools.map((tool) => resourceName(tool, `${appName}/tools`));
const appVersionName = appVersion ? resourceName(appVersion, `${appName}/versions`) : "";

const substitutions = {
  APP_NAME: appName,
  MCP_TOOLSET_NAME: toolsetName,
  AGENT_NAME: agentName,
  PRODUCT_SEARCH_TOOL_NAME: `${appName}/tools/searchProducts`,
  APP_VERSION_NAME: appVersionName,
  PROJECT_ID: projectId,
  CES_LOCATION: location,
  CES_APP_ID: appName.split("/").at(-1),
};

const evaluations = [];
for (const file of evaluationFiles) {
  evaluations.push(await loadEvaluation(file, substitutions, appName));
}

const token = dryRun ? "" : accessToken();
let syncedAgentTools = null;
if (agentToolNames.length) {
  if (dryRun) {
    syncedAgentTools = { action: "dry-run", agent: agentName || null, tools: agentToolNames };
  } else {
    if (!agentName) {
      fail("Missing --agent or CES_AGENT_NAME for --agent-tools.");
    }
    syncedAgentTools = await syncAgentTools(token, agentName, agentToolNames);
  }
}

const syncedEvaluations = [];
for (const evaluation of evaluations) {
  if (dryRun) {
    syncedEvaluations.push({
      action: "dry-run",
      displayName: evaluation.body.displayName,
      file: evaluation.file,
      id: evaluation.id,
      name: evaluation.name,
    });
    continue;
  }

  const action = await upsertEvaluation(token, evaluation);
  syncedEvaluations.push({
    action,
    displayName: evaluation.body.displayName,
    file: evaluation.file,
    id: evaluation.id,
    name: evaluation.name,
  });
}

let evaluationRun = null;
if (shouldRun && !dryRun) {
  evaluationRun = await runEvaluations(token, syncedEvaluations.map((evaluation) => evaluation.name));
}

const artifact = {
  appName,
  appVersionName: appVersionName || null,
  dryRun,
  evaluationRun,
  syncedAgentTools,
  syncedEvaluations,
};

if (artifactPath) {
  await mkdir(dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
}

assertRunPassed(evaluationRun);

console.log(JSON.stringify(artifact, null, 2));

async function loadEvaluation(file, values, parentAppName) {
  let source = await readFile(file, "utf8");
  for (const [key, value] of Object.entries(values)) {
    source = source.replaceAll(`{{${key}}}`, value);
  }

  const parsed = JSON.parse(source);
  const id = evaluationId(parsed, file);
  const name = `${parentAppName}/evaluations/${id}`;
  const body = sanitizeEvaluation({ ...parsed, name });

  if (!body.displayName) {
    fail(`${file} is missing displayName.`);
  }
  if (!body.golden && !body.scenario) {
    fail(`${file} must define golden or scenario.`);
  }

  return { body, file, id, name };
}

function evaluationId(evaluation, file) {
  const explicit = evaluation.evaluationId ?? evaluation.name;
  if (typeof explicit === "string" && explicit.trim()) {
    const id = explicit.includes("/evaluations/") ? explicit.split("/evaluations/").at(-1) : explicit;
    return normalizeId(id);
  }
  return normalizeId(evaluation.displayName ?? file);
}

function normalizeId(value) {
  const id = String(value)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!id) {
    fail(`Could not derive evaluation id from ${value}.`);
  }
  return id;
}

function sanitizeEvaluation(evaluation) {
  const allowedKeys = [
    "description",
    "displayName",
    "evaluationMetricsConfigOverride",
    "evaluationMetricsThresholdOverride",
    "golden",
    "name",
    "scenario",
    "tags",
  ];
  return Object.fromEntries(allowedKeys.filter((key) => evaluation[key] !== undefined).map((key) => [key, evaluation[key]]));
}

async function upsertEvaluation(token, evaluation) {
  const existing = await apiRequest(token, `${API_ROOT}/${evaluation.name}`, { method: "GET", tolerate404: true });

  if (!existing) {
    await apiRequest(token, `${API_ROOT}/${appName}/evaluations?evaluationId=${encodeURIComponent(evaluation.id)}`, {
      body: evaluation.body,
      method: "POST",
    });
    return "created";
  }

  await apiRequest(token, `${API_ROOT}/${evaluation.name}`, {
    body: evaluation.body,
    method: "PATCH",
  });
  return "updated";
}

async function runEvaluations(token, evaluationNames) {
  const started = await apiRequest(token, `${API_ROOT}/${appName}:runEvaluation`, {
    body: {
      app: appName,
      appVersion: appVersionName || undefined,
      config: {
        evaluationChannel: "TEXT",
        toolCallBehaviour: "FAKE",
      },
      displayName: `Storefront irons regression ${new Date().toISOString()}`,
      evaluations: evaluationNames,
      goldenRunMethod: "NAIVE",
      runCount: 1,
    },
    method: "POST",
  });

  const operation = await pollOperation(token, started.name);
  const runName = operation.response?.name ?? operation.response?.evaluationRun ?? operation.metadata?.evaluationRun;
  if (!runName) {
    return { operation };
  }

  const run = await pollEvaluationRun(token, runName);
  return { operation, run };
}

async function syncAgentTools(token, agentName, requiredTools) {
  const agent = await apiRequest(token, `${API_ROOT}/${agentName}`, { method: "GET" });
  const tools = Array.from(new Set([...(agent.tools ?? []), ...requiredTools])).sort();
  await apiRequest(token, `${API_ROOT}/${agentName}?updateMask=tools`, {
    body: { tools },
    method: "PATCH",
  });
  return { action: "updated", agent: agentName, tools };
}

async function pollOperation(token, operationName) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let operation = await apiRequest(token, `${API_ROOT}/${operationName}`, { method: "GET" });
  while (!operation.done) {
    if (Date.now() > deadline) {
      fail(`Timed out waiting for CES operation ${operationName}.`);
    }
    await sleep(pollSeconds * 1000);
    operation = await apiRequest(token, `${API_ROOT}/${operationName}`, { method: "GET" });
  }
  if (operation.error) {
    fail(`CES operation failed: ${JSON.stringify(operation.error)}`);
  }
  return operation;
}

async function pollEvaluationRun(token, runName) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let run = await apiRequest(token, `${API_ROOT}/${runName}`, { method: "GET" });
  while (run.state === "RUNNING" || run.state === "EVALUATION_RUN_STATE_UNSPECIFIED") {
    if (Date.now() > deadline) {
      fail(`Timed out waiting for CES evaluation run ${runName}.`);
    }
    await sleep(pollSeconds * 1000);
    run = await apiRequest(token, `${API_ROOT}/${runName}`, { method: "GET" });
  }
  return run;
}

function assertRunPassed(evaluationRun) {
  const run = evaluationRun?.run;
  if (!run) return;
  if (run.state === "ERROR") {
    fail(`CES evaluation run errored: ${JSON.stringify(run.errorInfo ?? run.error ?? run)}`);
  }

  const summaries = Object.entries(run.evaluationRunSummaries ?? {});
  const failed = summaries.filter(([, summary]) => Number(summary.failedCount ?? 0) > 0 || Number(summary.errorCount ?? 0) > 0);
  if (failed.length) {
    fail(`CES evaluation run had failures: ${JSON.stringify(Object.fromEntries(failed), null, 2)}`);
  }
}

async function apiRequest(token, url, options) {
  const response = await fetch(url, {
    body: options.body ? JSON.stringify(removeUndefined(options.body)) : undefined,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: options.method,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (response.status === 404 && options.tolerate404) {
    return null;
  }
  if (!response.ok) {
    fail(`${options.method} ${url} failed with ${response.status}: ${JSON.stringify(payload ?? text)}`);
  }
  return payload;
}

function removeUndefined(value) {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, removeUndefined(item)])
  );
}

function accessToken() {
  if (process.env.CES_ACCESS_TOKEN) return process.env.CES_ACCESS_TOKEN;
  if (process.env.GOOGLE_OAUTH_ACCESS_TOKEN) return process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  return execFileSync("gcloud", ["auth", "print-access-token"], { encoding: "utf8" }).trim();
}

function resourceName(value, parent) {
  if (value.startsWith("projects/")) return value;
  return `${parent}/${value}`;
}

function parseArgs(rawArgs) {
  const flags = {};
  const positionals = [];

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    const key = arg.slice(2);
    if (["dry-run", "run"].includes(key)) {
      flags[key] = true;
      continue;
    }

    const value = rawArgs[index + 1];
    if (!value || value.startsWith("--")) {
      fail(`Missing value for ${arg}.`);
    }
    flags[key] = value;
    index += 1;
  }

  return { flags, positionals };
}

function csvValues(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
