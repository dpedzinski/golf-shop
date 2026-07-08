import {
  defineCxComponents,
  registerDialogflowBridge,
  renderCxWidget,
  toCustomTemplateForPayload,
  toRichContentFallback,
} from '../src';
import { cardOffersPayload, demoPayloads } from './sample-payloads';

defineCxComponents();

const root = document.querySelector('#demo-root');
if (root) {
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

document.addEventListener('cx-action', (event) => {
  const output = document.querySelector('#event-log');
  if (output) {
    output.textContent = JSON.stringify((event as CustomEvent).detail.action, null, 2);
  }
});

document.addEventListener('cx-submit', (event) => {
  const output = document.querySelector('#event-log');
  if (output) {
    output.textContent = JSON.stringify((event as CustomEvent).detail.values, null, 2);
  }
});
