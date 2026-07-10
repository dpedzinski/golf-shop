#!/usr/bin/env node

const args = parseArgs(process.argv.slice(2));

const projectId = args.flags.project ?? process.env.PROJECT_ID ?? process.env.GOOGLE_CLOUD_PROJECT;
const location = args.flags.location ?? process.env.CES_LOCATION ?? "us";
const appId = args.flags.app ?? process.env.CES_APP_ID ?? "golf-store-customer-service";
const deploymentId = args.flags.deployment ?? process.env.CES_DEPLOYMENT_ID ?? process.env.VITE_GECX_DEPLOYMENT_ID;
const sessionId =
  args.flags.session ??
  process.env.CES_SESSION_ID ??
  `product-openapi-${new Date().toISOString().replace(/[^0-9A-Za-z]/g, "").slice(0, 14)}`;
const positionalPrompt = args.positionals.join(" ").trim();
const prompt =
  args.flags.prompt ?? (positionalPrompt || "I am an experienced player shopping for forged irons. Show me current options.");
const expectedTool = args.flags["expect-tool"] ?? "searchProducts";
const baseUrl = args.flags["base-url"] ?? process.env.CES_BASE_URL ?? "https://ces.googleapis.com";
const timeZone = args.flags["time-zone"] ?? process.env.TZ ?? "America/New_York";
const assertTool = args.flags.assert !== false;

if (!projectId) {
  fail("Missing --project, PROJECT_ID, or GOOGLE_CLOUD_PROJECT.");
}
if (!deploymentId) {
  fail("Missing --deployment, CES_DEPLOYMENT_ID, or VITE_GECX_DEPLOYMENT_ID.");
}

const appPath = `projects/${projectId}/locations/${location}/apps/${appId}`;
const deployment = deploymentId.startsWith("projects/") ? deploymentId : `${appPath}/deployments/${deploymentId}`;

const chatToken = await generateChatToken({ appPath, baseUrl, deployment, sessionId });
const response = await runSession({
  appPath,
  baseUrl,
  chatToken,
  deployment,
  prompt,
  sessionId,
  timeZone,
});

const toolSeen = includesString(response, expectedTool);
const text = extractText(response);
const result = {
  app: appPath,
  deployment,
  expectedTool,
  prompt,
  sessionId,
  text,
  toolSeen,
  raw: response,
};

console.log(JSON.stringify(result, null, 2));

if (assertTool && !toolSeen) {
  fail(
    `Did not find "${expectedTool}" in the structured CES response. ` +
      "The agent may still have called the tool without returning trace data; rerun with --no-assert to inspect only."
  );
}

async function generateChatToken({ appPath, baseUrl, deployment, sessionId }) {
  const response = await fetch(`${baseUrl}/v1/${appPath}/sessions/${encodeURIComponent(sessionId)}:generateChatToken`, {
    body: JSON.stringify({ deployment }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await parseResponse(response);
  if (!payload.chatToken) {
    fail(`CES did not return chatToken: ${JSON.stringify(payload)}`);
  }
  return payload.chatToken;
}

async function runSession({ appPath, baseUrl, chatToken, deployment, prompt, sessionId, timeZone }) {
  const response = await fetch(`${baseUrl}/v1/${appPath}/sessions/${encodeURIComponent(sessionId)}:runSession`, {
    body: JSON.stringify({
      config: {
        deployment,
        timeZone,
      },
      inputs: [{ text: prompt }],
    }),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${chatToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  return parseResponse(response);
}

async function parseResponse(response) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    fail(`${response.url} failed with ${response.status}: ${JSON.stringify(payload ?? text)}`);
  }
  return payload;
}

function extractText(value) {
  const chunks = [];
  visit(value, (item) => {
    if (item && typeof item === "object" && typeof item.text === "string") {
      chunks.push(item.text);
    }
  });
  return chunks.join("\n").trim();
}

function includesString(value, needle) {
  let found = false;
  visit(value, (item) => {
    if (typeof item === "string" && item.includes(needle)) {
      found = true;
    }
  });
  return found;
}

function visit(value, callback) {
  callback(value);
  if (Array.isArray(value)) {
    for (const item of value) visit(item, callback);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) visit(item, callback);
  }
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
    if (key === "no-assert") {
      flags.assert = false;
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

function fail(message) {
  console.error(message);
  process.exit(1);
}
