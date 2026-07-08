export interface GecxMessengerConfig {
  projectId: string;
  location: string;
  agentId: string;
  languageCode?: string;
  chatTitle?: string;
  oauthClientId?: string;
  container?: Element | string;
  scriptUrl?: string;
}

export interface MountedGecxMessenger {
  element: HTMLElement;
  script: HTMLScriptElement;
}

const DEFAULT_SCRIPT_URL = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js';

export function mountGecxMessenger(config: GecxMessengerConfig): MountedGecxMessenger {
  if (typeof document === 'undefined') {
    throw new Error('mountGecxMessenger can only run in a browser.');
  }
  const container = resolveContainer(config.container);
  const script = ensureMessengerScript(config.scriptUrl ?? DEFAULT_SCRIPT_URL);
  const element = document.createElement('df-messenger');
  element.setAttribute('project-id', config.projectId);
  element.setAttribute('location', config.location);
  element.setAttribute('agent-id', config.agentId);
  element.setAttribute('language-code', config.languageCode ?? 'en');
  if (config.oauthClientId) {
    element.setAttribute('oauth-client-id', config.oauthClientId);
  }

  const bubble = document.createElement('df-messenger-chat-bubble');
  bubble.setAttribute('chat-title', config.chatTitle ?? 'Golf Store Assistant');
  element.append(bubble);
  container.append(element);

  return { element, script };
}

function resolveContainer(container?: Element | string): Element {
  if (!container) return document.body;
  if (typeof container !== 'string') return container;
  const element = document.querySelector(container);
  if (!element) {
    throw new Error(`Unable to find GECX messenger container: ${container}`);
  }
  return element;
}

function ensureMessengerScript(src: string): HTMLScriptElement {
  const existing = Array.from(document.scripts).find((script) => script.src === src);
  if (existing) return existing;

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.append(script);
  return script;
}
