import { baseStyles } from '../styles';
import type { CxAction, CxActionEventDetail, CxSubmitEventDetail } from '../types';
import { parseJsonAttribute } from '../utils';

export abstract class CxElement<TPayload = unknown> extends HTMLElement {
  static observedAttributes = ['data-payload'];

  private localPayload: unknown;
  protected readonly renderRoot: ShadowRoot;

  constructor() {
    super();
    this.renderRoot = this.attachShadow({ mode: 'open' });
  }

  get payload(): unknown {
    return this.localPayload ?? this.dfPayload ?? parseJsonAttribute(this.getAttribute('data-payload'));
  }

  set payload(value: unknown) {
    this.localPayload = value;
    if (this.isConnected) this.render();
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  protected render(): void {
    try {
      const style = document.createElement('style');
      style.textContent = baseStyles;
      this.renderRoot.replaceChildren(style, this.renderPayload(this.payload as TPayload));
    } catch (error) {
      this.dispatchCxError(error);
      const style = document.createElement('style');
      style.textContent = baseStyles;
      const fallback = document.createElement('div');
      fallback.className = 'cx-card cx-tone-error';
      fallback.textContent = 'This widget could not be rendered.';
      this.renderRoot.replaceChildren(style, fallback);
    }
  }

  protected abstract renderPayload(payload: TPayload): Node;

  protected dispatchAction(action: CxAction, source?: unknown): void {
    const detail: CxActionEventDetail = {
      action,
      source,
      payload: this.payload,
      responseId: this.dfResponseId ?? null,
    };
    this.dispatchEvent(new CustomEvent('cx-action', { bubbles: true, composed: true, detail }));
  }

  protected dispatchSubmit(values: Record<string, string | boolean>): void {
    const detail: CxSubmitEventDetail = {
      values,
      payload: this.payload,
      responseId: this.dfResponseId ?? null,
    };
    this.dispatchEvent(new CustomEvent('cx-submit', { bubbles: true, composed: true, detail }));
  }

  protected dispatchCxError(error: unknown): void {
    this.dispatchEvent(
      new CustomEvent('cx-error', {
        bubbles: true,
        composed: true,
        detail: { error, payload: this.payload, responseId: this.dfResponseId ?? null },
      })
    );
  }
}
