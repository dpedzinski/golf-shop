import { describe, expect, it, vi } from 'vitest';
import { CesClient, buildCesAppPath, buildCesDeploymentPath } from '../src';

describe('CesClient', () => {
  it('builds app and deployment resource paths', () => {
    const appPath = buildCesAppPath('demo-project', 'us', 'golf-store');

    expect(appPath).toBe('projects/demo-project/locations/us/apps/golf-store');
    expect(buildCesDeploymentPath(appPath, 'web')).toBe('projects/demo-project/locations/us/apps/golf-store/deployments/web');
  });

  it('generates a chat token and sends a message', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ chatToken: 'token-1' }))
      .mockResolvedValueOnce(Response.json({ outputs: [{ text: 'Hello' }] }));
    const client = new CesClient({
      projectId: 'demo-project',
      location: 'us',
      appId: 'golf-store',
      deploymentId: 'web',
      baseUrl: 'https://ces.example.test',
      fetch: fetchMock as typeof fetch,
    });

    await expect(client.sendMessage({ sessionId: 'session-1', text: 'I need irons' })).resolves.toEqual({
      outputs: [{ text: 'Hello' }],
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://ces.example.test/v1/projects/demo-project/locations/us/apps/golf-store/sessions/session-1:generateChatToken',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          deployment: 'projects/demo-project/locations/us/apps/golf-store/deployments/web',
        }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://ces.example.test/v1/projects/demo-project/locations/us/apps/golf-store/sessions/session-1:runSession',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token-1' }),
      })
    );
  });
});
