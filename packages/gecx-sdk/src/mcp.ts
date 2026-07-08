import type { FetchLike } from './product-api';

export interface McpClientOptions {
  endpoint: string;
  fetch?: FetchLike;
}

export interface McpJsonRpcResponse<T> {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface McpInitializeResult {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  serverInfo?: {
    name: string;
    version?: string;
  };
}

export interface McpToolCallResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

export class McpClient {
  private readonly endpoint: string;
  private readonly fetchImpl: FetchLike;
  private requestId = 0;

  constructor(options: McpClientOptions) {
    if (!options.endpoint) {
      throw new Error('McpClient requires an endpoint.');
    }
    this.endpoint = options.endpoint;
    this.fetchImpl = options.fetch ?? ((input, init) => fetch(input, init));
  }

  initialize(): Promise<McpInitializeResult> {
    return this.request<McpInitializeResult>('initialize', {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: {
        name: '@bread-prototype/gecx-sdk',
        version: '0.1.0',
      },
    });
  }

  async listTools(): Promise<McpTool[]> {
    const response = await this.request<{ tools: McpTool[] }>('tools/list');
    return response.tools;
  }

  callTool(name: string, argumentsValue: Record<string, unknown> = {}): Promise<McpToolCallResult> {
    return this.request<McpToolCallResult>('tools/call', {
      name,
      arguments: argumentsValue,
    });
  }

  async request<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    const payload = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      ...(params ? { params } : {}),
    };
    const response = await this.fetchImpl(this.endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`MCP request failed with ${response.status}: ${text}`);
    }
    const data = (await response.json()) as McpJsonRpcResponse<T>;
    if (data.error) {
      throw new Error(`MCP error ${data.error.code}: ${data.error.message}`);
    }
    return data.result as T;
  }
}
