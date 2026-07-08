import type { CxAction, CxImage } from './types';

export function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseJsonAttribute(value: string | null): unknown {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function safeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, window.location.href);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
      return url.href;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function appendText(parent: Node, value: unknown): void {
  parent.appendChild(document.createTextNode(String(value ?? '')));
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: {
    className?: string;
    text?: string | number | boolean | null;
    attrs?: Record<string, string | undefined>;
  } = {},
  children: Array<Node | string | number | boolean | null | undefined> = []
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined && options.text !== null) appendText(element, options.text);
  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    if (value !== undefined) element.setAttribute(name, value);
  }
  for (const child of children) {
    if (child === undefined || child === null) continue;
    if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
      appendText(element, child);
    } else {
      element.appendChild(child);
    }
  }
  return element;
}

export function createHeader(payload: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}): HTMLElement | null {
  if (!payload.eyebrow && !payload.title && !payload.subtitle) return null;
  const header = createElement('header', { className: 'cx-header' });
  if (payload.eyebrow) header.append(createElement('div', { className: 'cx-eyebrow', text: payload.eyebrow }));
  if (payload.title) header.append(createElement('h3', { className: 'cx-title', text: payload.title }));
  if (payload.subtitle) header.append(createElement('div', { className: 'cx-subtitle', text: payload.subtitle }));
  return header;
}

export function createBody(body: string | string[] | undefined): HTMLElement | null {
  const lines = asArray(body);
  if (!lines.length) return null;
  const wrapper = createElement('div', { className: 'cx-body' });
  for (const line of lines) {
    wrapper.append(createElement('p', { text: line }));
  }
  return wrapper;
}

export function createMedia(image: CxImage | undefined): HTMLElement | null {
  const src = safeUrl(image?.src);
  if (!src) return null;
  const wrapper = createElement('div', { className: 'cx-media' });
  const img = createElement('img', { attrs: { src, alt: image?.alt ?? '' } });
  wrapper.append(img);
  return wrapper;
}

export function createActions(actions: CxAction[] | undefined, onAction: (action: CxAction) => void): HTMLElement | null {
  if (!actions?.length) return null;
  const row = createElement('div', { className: 'cx-row' });
  for (const action of actions) {
    const href = action.kind === 'link' ? safeUrl(action.href) : undefined;
    const className = `cx-button ${action.variant ?? (href ? 'secondary' : 'primary')}`.trim();
    if (href) {
      const anchor = createElement('a', {
        className,
        text: action.label,
        attrs: {
          href,
          target: action.target ?? '_blank',
          rel: action.target === '_self' ? undefined : 'noopener noreferrer',
        },
      });
      anchor.addEventListener('click', () => onAction(action));
      row.append(anchor);
    } else {
      const button = createElement('button', {
        className,
        text: action.label,
        attrs: { type: 'button' },
      });
      button.addEventListener('click', () => onAction(action));
      row.append(button);
    }
  }
  return row;
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function estimateMonthlyPayment(principal: number, months: number, apr = 0, fees = 0): number {
  const financed = Math.max(0, principal + fees);
  if (!months || months <= 0) return financed;
  const monthlyRate = Math.max(0, apr) / 100 / 12;
  if (monthlyRate === 0) return financed / months;
  return (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export function compactValues(values: Array<string | undefined | null>): string {
  return values.filter((value): value is string => Boolean(value)).join(' | ');
}
