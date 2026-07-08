import {
  defineCxComponents,
  registerDialogflowBridge,
  renderCxWidget,
  toCustomTemplateForPayload,
  toRichContentFallback,
} from '../src';
import { cardOffersPayload, componentGallerySamples, demoPayloads, type CxGallerySample } from './sample-payloads';

defineCxComponents();

const isGalleryPage = window.location.pathname.endsWith('/demo/gallery.html');

const root = document.querySelector('#demo-root');
if (root && isGalleryPage) {
  renderGalleryPage();
} else if (root) {
  for (const payload of demoPayloads) {
    renderCxWidget(root, payload);
  }
}

const standaloneTarget = document.querySelector('#standalone-target');
if (standaloneTarget) {
  renderCxWidget(standaloneTarget, cardOffersPayload);
}

const templateOutput = document.querySelector('#custom-template-json');
if (templateOutput) {
  templateOutput.textContent = JSON.stringify(toCustomTemplateForPayload(cardOffersPayload), null, 2);
}

const fallbackOutput = document.querySelector('#fallback-json');
if (fallbackOutput) {
  fallbackOutput.textContent = JSON.stringify(toRichContentFallback(cardOffersPayload), null, 2);
}

const dfMessenger = document.querySelector('df-messenger');
if (dfMessenger) {
  const addRichContent = registerDialogflowBridge(dfMessenger, {
    onAction: (detail) => {
      console.info('CX action', detail.action.id);
    },
  });

  const previewButton = document.querySelector('#render-rich-content');
  previewButton?.addEventListener('click', () => {
    void addRichContent(toCustomTemplateForPayload(cardOffersPayload));
  });
}

document.addEventListener('cx-action', (event) => logWidgetEvent('cx-action', event, 'action'));
document.addEventListener('cx-submit', (event) => logWidgetEvent('cx-submit', event, 'values'));
document.addEventListener('cx-error', (event) => logWidgetEvent('cx-error', event));

function renderGalleryPage(): void {
  document.title = 'CX Component Gallery';
  injectGalleryStyles();

  const main = createDemoElement('main', { className: 'gallery-shell' });
  const sidebar = createDemoElement('aside', { className: 'gallery-sidebar' });
  const homeLink = createDemoElement('a', {
    className: 'home-link',
    text: 'Back to demo index',
    attrs: { href: '/' },
  });
  const heading = createDemoElement('div');
  heading.append(
    createDemoElement('p', { className: 'eyebrow', text: 'SDK inspector' }),
    createDemoElement('h1', { text: 'CX Component Gallery' })
  );
  const nav = createDemoElement('nav', {
    className: 'component-nav',
    attrs: { id: 'component-nav', 'aria-label': 'Component list' },
  });
  for (const sample of componentGallerySamples) {
    nav.append(createDemoElement('a', { text: sample.label, attrs: { href: `#${sample.id}` } }));
  }
  sidebar.append(homeLink, heading, nav);

  const previewRoot = createDemoElement('section', {
    className: 'gallery-root',
    attrs: { id: 'gallery-root', 'aria-label': 'Component previews' },
  });
  previewRoot.append(...componentGallerySamples.map(renderGallerySample));

  const eventPanel = createDemoElement('aside', { className: 'event-panel', attrs: { 'aria-live': 'polite' } });
  const eventIntro = createDemoElement('div');
  eventIntro.append(
    createDemoElement('p', { className: 'eyebrow', text: 'Latest event' }),
    createDemoElement('p', {
      className: 'description',
      text: 'Actions, submits, and render errors from the previews appear here.',
    })
  );
  eventPanel.append(eventIntro, createDemoElement('pre', { text: '{}', attrs: { id: 'event-log' } }));

  main.append(sidebar, previewRoot, eventPanel);
  document.body.replaceChildren(main);
}

function renderGallerySample(sample: CxGallerySample): HTMLElement {
  const section = createDemoElement('section', {
    className: 'gallery-card',
    attrs: { id: sample.id, 'aria-labelledby': `${sample.id}-title` },
  });
  const header = createDemoElement('div', { className: 'gallery-card-header' });
  const titleBlock = createDemoElement('div', { className: 'gallery-title-block' });
  titleBlock.append(
    createDemoElement('p', { className: 'eyebrow', text: sample.elementName }),
    createDemoElement('h2', { text: sample.label, attrs: { id: `${sample.id}-title` } }),
    createDemoElement('p', { className: 'description', text: sample.description })
  );
  const meta = createDemoElement('div', { className: 'meta-row' });
  meta.append(createDemoElement('code', { text: sample.kind }), createDemoElement('code', { text: sample.elementName }));
  header.append(titleBlock, meta);

  const preview = createDemoElement('div', { className: 'preview-frame' });
  const target = createDemoElement('div', { className: 'preview-target' });
  preview.append(target);
  if (sample.kind === 'widget-host') {
    const element = document.createElement(sample.elementName) as HTMLElement & { payload: unknown };
    element.payload = sample.payload;
    target.append(element);
  } else {
    renderCxWidget(target, sample.payload);
  }

  const payloadPanel = createDemoElement('details', { className: 'payload-panel' });
  payloadPanel.open = sample.id === 'rich-card';
  payloadPanel.append(createDemoElement('summary', { text: 'Payload JSON' }));
  payloadPanel.append(createDemoElement('pre', { text: JSON.stringify(sample.payload, null, 2) }));

  section.append(header, preview, payloadPanel);
  return section;
}

function createDemoElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: { className?: string; text?: string; attrs?: Record<string, string | undefined> } = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    if (value !== undefined) element.setAttribute(name, value);
  }
  return element;
}

function logWidgetEvent(type: string, event: Event, detailKey?: 'action' | 'values'): void {
  const output = document.querySelector('#event-log');
  if (!output) return;

  const customEvent = event as CustomEvent;
  if (!isGalleryPage && detailKey) {
    output.textContent = JSON.stringify(customEvent.detail[detailKey], null, 2);
    return;
  }

  const source = event.target instanceof HTMLElement ? event.target.localName : 'unknown';
  output.textContent = safeStringify({
    type,
    source,
    detail: customEvent.detail,
  });
}

function safeStringify(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, item) => {
      if (item instanceof Error) return { name: item.name, message: item.message };
      return item;
    },
    2
  );
}

function injectGalleryStyles(): void {
  if (document.querySelector('#gallery-styles')) return;
  const style = document.createElement('style');
  style.id = 'gallery-styles';
  style.textContent = `
    body { background: #f5f7fb; }
    .gallery-shell {
      color: #172033;
      display: grid;
      gap: 24px;
      grid-template-columns: minmax(180px, 240px) minmax(0, 1fr) minmax(260px, 360px);
      margin: 0 auto;
      max-width: 1480px;
      padding: 24px;
    }
    .gallery-sidebar,
    .event-panel {
      align-self: start;
      position: sticky;
      top: 18px;
    }
    .gallery-sidebar,
    .event-panel,
    .gallery-card {
      background: #ffffff;
      border: 1px solid #d9e0ea;
      border-radius: 8px;
    }
    .gallery-sidebar,
    .event-panel,
    .gallery-card,
    .gallery-title-block {
      display: grid;
      gap: 18px;
    }
    .gallery-sidebar,
    .event-panel {
      padding: 18px;
    }
    .home-link {
      color: #155eef;
      font-size: 13px;
      font-weight: 800;
    }
    .description {
      color: #667085;
      font-size: 14px;
      line-height: 1.55;
    }
    .eyebrow {
      color: #155eef;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0;
      margin: 0;
      text-transform: uppercase;
    }
    .component-nav {
      display: grid;
      gap: 6px;
      max-height: calc(100vh - 220px);
      overflow: auto;
    }
    .component-nav a {
      border: 1px solid transparent;
      border-radius: 6px;
      color: #344054;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 10px;
    }
    .component-nav a:hover,
    .component-nav a:focus-visible {
      background: #eef2f7;
      border-color: #d9e0ea;
      color: #155eef;
      outline: none;
    }
    .gallery-root {
      display: grid;
      gap: 18px;
      min-width: 0;
    }
    .gallery-card {
      gap: 16px;
      overflow: hidden;
      padding: 18px;
      scroll-margin-top: 18px;
    }
    .gallery-card-header {
      align-items: start;
      display: flex;
      gap: 16px;
      justify-content: space-between;
    }
    .gallery-title-block {
      gap: 6px;
      max-width: 720px;
    }
    .gallery-card h2,
    .gallery-shell h1,
    .gallery-shell p {
      margin: 0;
    }
    .gallery-shell h1 {
      font-size: 24px;
      line-height: 1.15;
    }
    .gallery-card h2 {
      font-size: 20px;
      line-height: 1.2;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: flex-end;
    }
    .meta-row code {
      background: #eef4ff;
      border: 1px solid #c7d7fe;
      border-radius: 999px;
      color: #1849a9;
      font-size: 12px;
      font-weight: 800;
      padding: 5px 8px;
    }
    .preview-frame {
      background: #ffffff;
      border: 1px solid #d9e0ea;
      border-radius: 8px;
      padding: 16px;
    }
    .preview-target {
      display: block;
      max-width: 760px;
    }
    .payload-panel {
      border-top: 1px solid #d9e0ea;
      padding-top: 12px;
    }
    .payload-panel summary {
      color: #344054;
      cursor: pointer;
      font-size: 13px;
      font-weight: 800;
    }
    .gallery-shell pre {
      background: #101828;
      border-radius: 8px;
      color: #e6edf7;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 12px;
      line-height: 1.55;
      margin: 12px 0 0;
      max-height: 420px;
      overflow: auto;
      padding: 14px;
    }
    .event-panel pre {
      margin: 0;
      max-height: calc(100vh - 170px);
    }
    @media (max-width: 1180px) {
      .gallery-shell { grid-template-columns: minmax(180px, 240px) minmax(0, 1fr); }
      .event-panel { grid-column: 1 / -1; position: static; }
    }
    @media (max-width: 760px) {
      .gallery-shell { grid-template-columns: 1fr; padding: 14px; }
      .gallery-sidebar { position: static; }
      .component-nav { display: flex; max-height: none; overflow-x: auto; padding-bottom: 4px; }
      .component-nav a { white-space: nowrap; }
      .gallery-card-header { display: grid; }
      .meta-row { justify-content: flex-start; }
    }
  `;
  document.head.append(style);
}
