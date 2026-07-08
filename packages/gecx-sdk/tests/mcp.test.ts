import { McpClient } from '../src';

describe('McpClient', () => {
  it('sends tools/call JSON-RPC payloads', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [{ type: 'text', text: '{}' }],
          isError: false,
        },
      })
    );
    const client = new McpClient({
      endpoint: 'https://mcp.example.test/mcp/',
      fetch: fetchMock as typeof fetch,
    });

    await client.callTool('search_products', { q: 'putter', limit: 3 });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'search_products',
        arguments: { q: 'putter', limit: 3 },
      },
    });
  });

  it('returns listed tools from the MCP response', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        jsonrpc: '2.0',
        id: 1,
        result: {
          tools: [{ name: 'search_products' }],
        },
      })
    );
    const client = new McpClient({
      endpoint: 'https://mcp.example.test/mcp/',
      fetch: fetchMock as typeof fetch,
    });

    await expect(client.listTools()).resolves.toEqual([{ name: 'search_products' }]);
  });
});
