import type { FetchLike } from './product-api';

export interface CesClientOptions {
  projectId: string;
  location: string;
  appId: string;
  deploymentId: string;
  baseUrl?: string;
  fetch?: FetchLike;
}

export interface CesSessionOutput {
  text?: string;
  turnCompleted?: boolean;
  turnIndex?: number;
  payload?: Record<string, unknown>;
  diagnosticInfo?: Record<string, unknown>;
}

export interface CesRunSessionResponse {
  outputs?: CesSessionOutput[];
}

export interface CesSendMessageOptions {
  sessionId: string;
  text: string;
  timeZone?: string;
}

export function buildCesAppPath(projectId: string, location: string, appId: string): string {
  return `projects/${projectId}/locations/${location}/apps/${appId}`;
}

export function buildCesDeploymentPath(appPath: string, deploymentId: string): string {
  return deploymentId.startsWith('projects/') ? deploymentId : `${appPath}/deployments/${deploymentId}`;
}

export class CesClient {
  private readonly appPath: string;
  private readonly baseUrl: string;
  private readonly deployment: string;
  private readonly fetchImpl: FetchLike;
  private readonly tokens = new Map<string, string>();

  constructor(options: CesClientOptions) {
    if (!options.projectId || !options.location || !options.appId || !options.deploymentId) {
      throw new Error('CesClient requires projectId, location, appId, and deploymentId.');
    }
    this.appPath = buildCesAppPath(options.projectId, options.location, options.appId);
    this.baseUrl = options.baseUrl ?? 'https://ces.googleapis.com';
    this.deployment = buildCesDeploymentPath(this.appPath, options.deploymentId);
    this.fetchImpl = options.fetch ?? ((input, init) => fetch(input, init));
  }

  async sendMessage(options: CesSendMessageOptions): Promise<CesRunSessionResponse> {
    const token = await this.getChatToken(options.sessionId);
    const response = await this.fetchImpl(this.sessionUrl(options.sessionId, 'runSession'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          deployment: this.deployment,
          ...(options.timeZone ? { timeZone: options.timeZone } : {}),
        },
        inputs: [{ text: options.text }],
      }),
    });
    return parseCesResponse<CesRunSessionResponse>(response);
  }

  private async getChatToken(sessionId: string): Promise<string> {
    const cached = this.tokens.get(sessionId);
    if (cached) return cached;

    const response = await this.fetchImpl(this.sessionUrl(sessionId, 'generateChatToken'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deployment: this.deployment }),
    });
    const data = await parseCesResponse<{ chatToken: string }>(response);
    this.tokens.set(sessionId, data.chatToken);
    return data.chatToken;
  }

  private sessionUrl(sessionId: string, method: 'generateChatToken' | 'runSession'): string {
    return `${this.baseUrl}/v1/${this.appPath}/sessions/${encodeURIComponent(sessionId)}:${method}`;
  }
}

async function parseCesResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`CES request failed with ${response.status}: ${message}`);
  }
  return response.json() as Promise<T>;
}
