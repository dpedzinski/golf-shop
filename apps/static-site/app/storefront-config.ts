export type StorefrontConfig = {
  productApiUrl: string;
  mcpServerUrl: string;
  gecx: {
    enabled: boolean;
    projectId: string;
    location: string;
    appId: string;
    deploymentId: string;
    agentId: string;
    languageCode: string;
    chatTitle: string;
    oauthClientId: string;
    mockAssistant: boolean;
  };
};

function envValue(name: string, fallback = ""): string {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return process.env[name] ?? viteEnv?.[name] ?? fallback;
}

export function getStorefrontConfig(): StorefrontConfig {
  return {
    productApiUrl: envValue("VITE_PRODUCT_API_URL"),
    mcpServerUrl: envValue("VITE_MCP_SERVER_URL"),
    gecx: {
      enabled: envValue("VITE_GECX_ENABLE_WIDGET", "true") !== "false",
      projectId: envValue("VITE_GECX_PROJECT_ID"),
      location: envValue("VITE_GECX_LOCATION", "us"),
      appId: envValue("VITE_GECX_APP_ID", "golf-store-customer-service"),
      deploymentId: envValue("VITE_GECX_DEPLOYMENT_ID"),
      agentId: envValue("VITE_GECX_AGENT_ID", "golf-store-assistant"),
      languageCode: envValue("VITE_GECX_LANGUAGE_CODE", "en"),
      chatTitle: envValue("VITE_GECX_CHAT_TITLE", "Golf Store Assistant"),
      oauthClientId: envValue("VITE_GECX_OAUTH_CLIENT_ID"),
      mockAssistant: envValue("VITE_GECX_MOCK_ASSISTANT", "false") === "true",
    },
  };
}
