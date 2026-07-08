import { componentDefinitions } from './components';
import { elementNameForKind } from './element-names';
import type { CxWidgetPayload } from './types';

export * from './components';
export * from './dialogflow';
export * from './element-names';
export * from './types';

export function defineCxComponents(registry: CustomElementRegistry = customElements): void {
  for (const [name, constructor] of Object.entries(componentDefinitions)) {
    if (!registry.get(name)) {
      registry.define(name, constructor);
    }
  }
}

export function renderCxWidget(target: Element | string, payload: CxWidgetPayload): HTMLElement {
  defineCxComponents();
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) {
    throw new Error(`Unable to find render target: ${String(target)}`);
  }
  const element = document.createElement(elementNameForKind(payload.kind));
  element.payload = payload;
  container.append(element);
  return element;
}

export const CXComponents = {
  define: defineCxComponents,
  render: renderCxWidget,
};

if (typeof window !== 'undefined') {
  defineCxComponents();
  Object.assign(window, { CXComponents });
}
