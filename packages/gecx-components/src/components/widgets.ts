import { ELEMENT_NAMES, elementNameForKind } from '../element-names';
import type {
  CxAction,
  CxCardComparePayload,
  CxCardInfoPayload,
  CxCardOffer,
  CxCardOffersPayload,
  CxChoiceListPayload,
  CxCtaGroupPayload,
  CxDataTablePayload,
  CxFinancingDisclosurePayload,
  CxFinancingOption,
  CxFinancingOptionsPayload,
  CxFormField,
  CxFormPanelPayload,
  CxLoyaltyTier,
  CxLoyaltyTiersPayload,
  CxMonthlyPaymentEstimatePayload,
  CxPaymentPlanPayload,
  CxProductComparisonPayload,
  CxProductListPayload,
  CxProductOffer,
  CxProductOffersPayload,
  CxProductSummary,
  CxRichCardPayload,
  CxStatusBannerPayload,
  CxWidgetPayload,
} from '../types';
import {
  compactValues,
  createActions,
  createBody,
  createElement,
  createHeader,
  createMedia,
  estimateMonthlyPayment,
  formatCurrency,
  isObject,
  safeUrl,
} from '../utils';
import { CxElement } from './base';

function cardShell(tone?: string): HTMLElement {
  return createElement('section', { className: `cx-card ${tone ? `cx-tone-${tone}` : ''}`.trim() });
}

function appendIf(parent: HTMLElement, child: Node | null): void {
  if (child) parent.append(child);
}

function renderDefinitions(items: Array<{ label: string; value?: string | number | null }>): HTMLElement | null {
  const visible = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== '');
  if (!visible.length) return null;
  const grid = createElement('dl', { className: 'cx-grid two' });
  for (const item of visible) {
    const wrapper = createElement('div', { className: 'cx-definition' });
    wrapper.append(createElement('dt', { text: item.label }), createElement('dd', { text: item.value }));
    grid.append(wrapper);
  }
  return grid;
}

function cardOfferDefinitions(offer: CxCardOffer): Array<{ label: string; value?: string }> {
  return [
    { label: 'Intro APR', value: offer.introApr },
    { label: 'Ongoing APR', value: offer.ongoingApr },
    { label: 'Annual fee', value: offer.annualFee },
    { label: 'Rewards', value: offer.rewards },
    { label: 'Promo window', value: offer.promoWindow },
    { label: 'Repayment terms', value: offer.repaymentTerms },
    { label: 'Eligibility', value: offer.eligibilityNotes },
  ];
}

function termsAction(offer: CxCardOffer): CxAction | undefined {
  const href = safeUrl(offer.termsUrl);
  if (!href) return undefined;
  return {
    id: `${offer.id}-terms`,
    label: 'View terms',
    kind: 'link',
    href,
    variant: 'ghost',
  };
}

function renderCardOffer(offer: CxCardOffer, onAction: (action: CxAction, offer: CxCardOffer) => void): HTMLElement {
  const shell = cardShell();
  appendIf(
    shell,
    createHeader({
      eyebrow: offer.issuer,
      title: offer.name,
      subtitle: offer.headlineOffer,
    })
  );
  appendIf(shell, renderDefinitions(cardOfferDefinitions(offer)));
  if (offer.caveats?.length) {
    const list = createElement('ul', { className: 'cx-disclosure' });
    for (const caveat of offer.caveats) list.append(createElement('li', { text: caveat }));
    shell.append(list);
  }
  const actions = [offer.primaryAction, ...(offer.actions ?? []), termsAction(offer)].filter((action): action is CxAction =>
    Boolean(action)
  );
  appendIf(shell, createActions(actions, (action) => onAction(action, offer)));
  return shell;
}

function renderFinancingOption(
  option: CxFinancingOption,
  onAction: (action: CxAction, option: CxFinancingOption) => void
): HTMLElement {
  const shell = cardShell();
  appendIf(shell, createHeader({ eyebrow: option.type.replace('-', ' '), title: option.name, subtitle: option.summary }));
  appendIf(
    shell,
    renderDefinitions([
      { label: 'APR', value: option.apr },
      { label: 'Term', value: option.term },
      { label: 'Fees', value: option.fees },
      { label: 'Eligibility', value: option.eligibilityNotes },
    ])
  );
  appendIf(shell, createActions(option.action ? [option.action] : undefined, (action) => onAction(action, option)));
  return shell;
}

function renderEmpty(message: string): HTMLElement {
  const shell = cardShell('warning');
  shell.append(createElement('p', { className: 'cx-muted', text: message }));
  return shell;
}

function formatPrice(value: string | number | undefined): string | undefined {
  if (typeof value === 'number') return formatCurrency(value);
  return value;
}

function offerActions(offer: CxProductOffer): CxAction[] {
  return [offer.action, ...(offer.actions ?? [])].filter((action): action is CxAction => Boolean(action));
}

function renderProductOffer(offer: CxProductOffer, onAction: (action: CxAction, offer: CxProductOffer) => void): HTMLElement {
  const shell = createElement('article', { className: 'cx-offer' });
  const header = createElement('div', { className: 'cx-stack' });
  const title = createElement('h4', { className: 'cx-offer-title', text: offer.headline });
  header.append(title);
  const meta = [offer.label, formatPrice(offer.price), offer.expiresAt ? `Ends ${offer.expiresAt}` : undefined].filter(Boolean).join(' | ');
  if (meta) header.append(createElement('div', { className: 'cx-offer-meta', text: meta }));
  if (offer.badge) header.append(createElement('span', { className: 'cx-pill', text: offer.badge }));
  shell.append(header);
  if (offer.description) shell.append(createElement('p', { className: 'cx-muted', text: offer.description }));
  if (offer.eligibilityNotes) shell.append(createElement('p', { className: 'cx-disclosure', text: offer.eligibilityNotes }));
  appendIf(shell, createActions(offerActions(offer), (action) => onAction(action, offer)));
  return shell;
}

function renderProductOffers(
  offers: CxProductOffer[] | undefined,
  onAction: (action: CxAction, offer: CxProductOffer) => void
): HTMLElement | null {
  if (!offers?.length) return null;
  const list = createElement('div', { className: 'cx-offer-list' });
  for (const offer of offers) list.append(renderProductOffer(offer, onAction));
  return list;
}

function productActions(product: CxProductSummary): CxAction[] {
  return [product.action, ...(product.actions ?? [])].filter((action): action is CxAction => Boolean(action));
}

function renderProduct(product: CxProductSummary, onAction: (action: CxAction, product: CxProductSummary) => void): HTMLElement {
  const shell = cardShell();
  shell.classList.add('cx-product-card');
  appendIf(shell, createMedia(product.image));
  appendIf(
    shell,
    createHeader({
      eyebrow: [product.brand, product.category].filter(Boolean).join(' | ') || undefined,
      title: product.name,
      subtitle: product.description,
    })
  );
  appendIf(
    shell,
    renderDefinitions([
      { label: 'Price', value: formatPrice(product.price) },
      { label: 'Rating', value: product.rating === undefined ? undefined : `${product.rating} / 5` },
      { label: 'Reviews', value: product.reviewCount },
      { label: 'Inventory', value: product.inventoryStatus },
      { label: 'Best fit', value: product.fit },
    ])
  );
  if (product.tags?.length) {
    const row = createElement('div', { className: 'cx-row' });
    for (const tag of product.tags) row.append(createElement('span', { className: 'cx-pill', text: tag }));
    shell.append(row);
  }
  appendIf(shell, renderProductOffers(product.offers, (action) => onAction(action, product)));
  appendIf(shell, createActions(productActions(product), (action) => onAction(action, product)));
  return shell;
}

function renderLoyaltyTier(tier: CxLoyaltyTier): HTMLElement {
  const shell = cardShell();
  appendIf(
    shell,
    createHeader({
      eyebrow: tier.annualSpend,
      title: tier.name,
      subtitle: [tier.earningRate, tier.redemptionRate].filter(Boolean).join(' | ') || undefined,
    })
  );
  const benefits = createElement('ul', { className: 'cx-disclosure' });
  for (const benefit of tier.benefits) benefits.append(createElement('li', { text: benefit }));
  shell.append(benefits);
  if (tier.caveats?.length) {
    const caveats = createElement('ul', { className: 'cx-disclosure' });
    for (const caveat of tier.caveats) caveats.append(createElement('li', { text: caveat }));
    shell.append(caveats);
  }
  return shell;
}

export class CxRichCardElement extends CxElement<CxRichCardPayload> {
  protected renderPayload(payload: CxRichCardPayload): Node {
    const shell = cardShell(payload?.tone);
    appendIf(shell, createMedia(payload?.image));
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    appendIf(shell, renderDefinitions(payload?.metadata ?? []));
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxChoiceListElement extends CxElement<CxChoiceListPayload> {
  protected renderPayload(payload: CxChoiceListPayload): Node {
    const shell = cardShell(payload?.tone);
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const list = createElement('div', { className: 'cx-stack' });
    for (const option of payload?.options ?? []) {
      const button = createElement('button', {
        className: `cx-button ${option.selected ? 'primary' : 'secondary'}`,
        text: option.description ? `${option.label} - ${option.description}` : option.label,
        attrs: { type: 'button', disabled: option.disabled ? 'true' : undefined },
      });
      button.addEventListener('click', () => {
        this.dispatchAction(
          option.action ?? {
            id: option.id,
            label: option.label,
            kind: 'select',
            payload: { value: option.value ?? option.id },
          },
          option
        );
      });
      list.append(button);
    }
    shell.append(list);
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxDataTableElement extends CxElement<CxDataTablePayload> {
  protected renderPayload(payload: CxDataTablePayload): Node {
    const shell = cardShell(payload?.tone);
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const wrap = createElement('div', { className: 'cx-table-wrap' });
    const table = createElement('table');
    if (payload?.caption) table.append(createElement('caption', { text: payload.caption }));
    const thead = createElement('thead');
    const headRow = createElement('tr');
    for (const column of payload?.columns ?? []) {
      headRow.append(createElement('th', { text: column.label, attrs: { style: `text-align:${column.align ?? 'left'}` } }));
    }
    thead.append(headRow);
    const tbody = createElement('tbody');
    for (const row of payload?.rows ?? []) {
      const tr = createElement('tr');
      for (const column of payload?.columns ?? []) {
        tr.append(
          createElement('td', {
            text: row[column.key] ?? '',
            attrs: { style: `text-align:${column.align ?? 'left'}` },
          })
        );
      }
      tbody.append(tr);
    }
    table.append(thead, tbody);
    wrap.append(table);
    shell.append(wrap);
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxFormPanelElement extends CxElement<CxFormPanelPayload> {
  protected renderPayload(payload: CxFormPanelPayload): Node {
    const shell = cardShell(payload?.tone);
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const form = createElement('form', { className: 'cx-stack' });
    for (const field of payload?.fields ?? []) {
      form.append(this.renderField(field));
    }
    const submit = createElement('button', {
      className: 'cx-button primary',
      text: payload?.submitLabel ?? 'Submit',
      attrs: { type: 'submit' },
    });
    form.append(submit);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const values: Record<string, string | boolean> = {};
      for (const field of payload?.fields ?? []) {
        values[field.id] = field.type === 'checkbox' ? data.get(field.id) === 'on' : String(data.get(field.id) ?? '');
      }
      this.dispatchSubmit(values);
    });
    shell.append(form);
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }

  private renderField(field: CxFormField): HTMLElement {
    const label = createElement('label', { className: 'cx-stack' });
    label.append(createElement('span', { className: 'cx-muted', text: `${field.label}${field.required ? ' *' : ''}` }));
    if (field.type === 'select') {
      const select = createElement('select', { attrs: { name: field.id, required: field.required ? 'true' : undefined } });
      for (const option of field.options ?? []) {
        select.append(createElement('option', { text: option.label, attrs: { value: option.value } }));
      }
      label.append(select);
      return label;
    }
    if (field.type === 'textarea') {
      const textarea = createElement('textarea', {
        attrs: {
          name: field.id,
          placeholder: field.placeholder,
          required: field.required ? 'true' : undefined,
        },
      });
      if (field.value !== undefined) textarea.value = String(field.value);
      label.append(textarea);
      return label;
    }
    const input = createElement('input', {
      attrs: {
        name: field.id,
        type: field.type,
        placeholder: field.placeholder,
        required: field.required ? 'true' : undefined,
      },
    });
    if (field.value !== undefined) {
      if (field.type === 'checkbox') input.checked = Boolean(field.value);
      else input.value = String(field.value);
    }
    label.append(input);
    return label;
  }
}

export class CxStatusBannerElement extends CxElement<CxStatusBannerPayload> {
  protected renderPayload(payload: CxStatusBannerPayload): Node {
    const shell = cardShell(payload?.status ?? payload?.tone ?? 'info');
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxCardOffersElement extends CxElement<CxCardOffersPayload> {
  protected renderPayload(payload: CxCardOffersPayload): Node {
    const shell = createElement('section', { className: 'cx-stack' });
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const offers = payload?.offers ?? [];
    if (!offers.length) shell.append(renderEmpty('No card offers are currently available.'));
    for (const offer of offers) shell.append(renderCardOffer(offer, (action, source) => this.dispatchAction(action, source)));
    if (payload?.disclosure) shell.append(createElement('p', { className: 'cx-disclosure', text: payload.disclosure }));
    return shell;
  }
}

export class CxCardInfoElement extends CxElement<CxCardInfoPayload> {
  protected renderPayload(payload: CxCardInfoPayload): Node {
    if (!payload?.card) return renderEmpty('Card information is unavailable.');
    const shell = renderCardOffer(payload.card, (action, source) => this.dispatchAction(action, source));
    appendIf(shell, renderDefinitions(payload.details ?? []));
    return shell;
  }
}

export class CxCardCompareElement extends CxElement<CxCardComparePayload> {
  protected renderPayload(payload: CxCardComparePayload): Node {
    const shell = cardShell(payload?.tone);
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const cards = payload?.cards ?? [];
    if (!cards.length) return renderEmpty('No cards were provided for comparison.');
    const rows = payload?.rows ?? this.defaultComparisonRows(cards);
    const tablePayload: CxDataTablePayload = {
      kind: 'data-table',
      columns: [{ key: 'feature', label: 'Feature' }, ...cards.map((card) => ({ key: card.id, label: card.name }))],
      rows: rows.map((row) => {
        const values: Record<string, string> = { feature: row.label };
        cards.forEach((card, index) => {
          values[card.id] = row.values[index] ?? 'Not provided';
        });
        return values;
      }),
    };
    const table = document.createElement(ELEMENT_NAMES['data-table']);
    table.payload = tablePayload;
    shell.append(table);
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }

  private defaultComparisonRows(cards: CxCardOffer[]): Array<{ label: string; values: string[] }> {
    return [
      { label: 'Issuer', values: cards.map((card) => card.issuer) },
      { label: 'Headline offer', values: cards.map((card) => card.headlineOffer ?? 'Not provided') },
      { label: 'Intro APR', values: cards.map((card) => card.introApr ?? 'Not provided') },
      { label: 'Ongoing APR', values: cards.map((card) => card.ongoingApr ?? 'Not provided') },
      { label: 'Annual fee', values: cards.map((card) => card.annualFee ?? 'Not provided') },
      { label: 'Rewards', values: cards.map((card) => card.rewards ?? 'Not provided') },
      { label: 'Repayment terms', values: cards.map((card) => card.repaymentTerms ?? 'Not provided') },
      { label: 'Caveats', values: cards.map((card) => compactValues(card.caveats ?? []) || 'Not provided') },
    ];
  }
}

export class CxFinancingOptionsElement extends CxElement<CxFinancingOptionsPayload> {
  protected renderPayload(payload: CxFinancingOptionsPayload): Node {
    const shell = createElement('section', { className: 'cx-stack' });
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const options = payload?.options ?? [];
    if (!options.length) shell.append(renderEmpty('No financing options are currently available.'));
    for (const option of options) shell.append(renderFinancingOption(option, (action, source) => this.dispatchAction(action, source)));
    if (payload?.disclosure) shell.append(createElement('p', { className: 'cx-disclosure', text: payload.disclosure }));
    return shell;
  }
}

export class CxPaymentPlanElement extends CxElement<CxPaymentPlanPayload> {
  protected renderPayload(payload: CxPaymentPlanPayload): Node {
    const shell = cardShell(payload?.tone);
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const currency = payload?.currency ?? 'USD';
    const grid = createElement('div', { className: 'cx-grid two' });
    for (const plan of payload?.plans ?? []) {
      const monthly = plan.monthlyPayment ?? estimateMonthlyPayment(payload.purchaseAmount, plan.months, plan.apr, plan.fees);
      const card = cardShell();
      appendIf(card, createHeader({ title: plan.label, subtitle: `${plan.months} months` }));
      appendIf(
        card,
        renderDefinitions([
          { label: 'Estimated monthly payment', value: formatCurrency(monthly, currency) },
          { label: 'APR', value: plan.apr === undefined ? 'Not provided' : `${plan.apr}%` },
          { label: 'Fees', value: plan.fees === undefined ? undefined : formatCurrency(plan.fees, currency) },
          { label: 'Notes', value: plan.notes },
        ])
      );
      appendIf(card, createActions(plan.action ? [plan.action] : undefined, (action) => this.dispatchAction(action, plan)));
      grid.append(card);
    }
    shell.append(grid);
    if (payload?.disclosure) shell.append(createElement('p', { className: 'cx-disclosure', text: payload.disclosure }));
    return shell;
  }
}

export class CxMonthlyPaymentEstimateElement extends CxElement<CxMonthlyPaymentEstimatePayload> {
  protected renderPayload(payload: CxMonthlyPaymentEstimatePayload): Node {
    const shell = cardShell(payload?.tone);
    const monthly = estimateMonthlyPayment(payload?.principal ?? 0, payload?.months ?? 1, payload?.apr, payload?.fees);
    appendIf(shell, createHeader(payload ?? { title: 'Monthly payment estimate' }));
    appendIf(shell, createBody(payload?.body));
    appendIf(
      shell,
      renderDefinitions([
        { label: 'Estimated monthly payment', value: formatCurrency(monthly, payload?.currency ?? 'USD') },
        { label: 'Amount financed', value: formatCurrency((payload?.principal ?? 0) + (payload?.fees ?? 0), payload?.currency ?? 'USD') },
        { label: 'Term', value: `${payload?.months ?? 1} months` },
        { label: 'APR', value: payload?.apr === undefined ? 'Not provided' : `${payload.apr}%` },
      ])
    );
    shell.append(
      createElement('p', {
        className: 'cx-disclosure',
        text:
          payload?.disclosure ??
          'Estimate only. This does not represent approval, final pricing, or financial advice.',
      })
    );
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxFinancingDisclosureElement extends CxElement<CxFinancingDisclosurePayload> {
  protected renderPayload(payload: CxFinancingDisclosurePayload): Node {
    const shell = cardShell(payload?.required ? 'warning' : payload?.tone);
    appendIf(shell, createHeader(payload ?? { title: 'Financing disclosure' }));
    appendIf(shell, createBody(payload?.body));
    const list = createElement('ul', { className: 'cx-disclosure' });
    for (const disclosure of payload?.disclosures ?? []) list.append(createElement('li', { text: disclosure }));
    shell.append(list);
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxCtaGroupElement extends CxElement<CxCtaGroupPayload> {
  protected renderPayload(payload: CxCtaGroupPayload): Node {
    const shell = cardShell(payload?.tone);
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const actionContainer = createActions(payload?.actions, (action) => this.dispatchAction(action));
    if (actionContainer) {
      if (payload?.layout === 'stack') actionContainer.classList.add('cx-cta-stack');
      shell.append(actionContainer);
    }
    if (payload?.disclosure) shell.append(createElement('p', { className: 'cx-disclosure', text: payload.disclosure }));
    return shell;
  }
}

export class CxProductListElement extends CxElement<CxProductListPayload> {
  protected renderPayload(payload: CxProductListPayload): Node {
    const shell = createElement('section', { className: 'cx-stack' });
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const products = payload?.products ?? [];
    if (!products.length) shell.append(renderEmpty(payload?.emptyMessage ?? 'No products are currently available.'));
    const grid = createElement('div', { className: 'cx-grid cx-product-grid' });
    for (const product of products) {
      grid.append(renderProduct(product, (action, source) => this.dispatchAction(action, source)));
    }
    if (products.length) shell.append(grid);
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxProductOffersElement extends CxElement<CxProductOffersPayload> {
  protected renderPayload(payload: CxProductOffersPayload): Node {
    const shell = createElement('section', { className: 'cx-stack' });
    appendIf(
      shell,
      createHeader({
        title: payload?.title ?? payload?.product?.name,
        subtitle: payload?.subtitle ?? payload?.product?.description,
      })
    );
    appendIf(shell, createBody(payload?.body));
    const offers = payload?.offers ?? [];
    if (!offers.length) shell.append(renderEmpty(payload?.emptyMessage ?? 'No offers are currently available for this product.'));
    appendIf(shell, renderProductOffers(offers, (action, source) => this.dispatchAction(action, source)));
    if (payload?.disclosure) shell.append(createElement('p', { className: 'cx-disclosure', text: payload.disclosure }));
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxProductComparisonElement extends CxElement<CxProductComparisonPayload> {
  protected renderPayload(payload: CxProductComparisonPayload): Node {
    const shell = cardShell(payload?.tone);
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const products = payload?.products ?? [];
    if (!products.length) return renderEmpty('No products were provided for comparison.');
    const rows = payload?.rows ?? this.defaultRows(products);
    const tablePayload: CxDataTablePayload = {
      kind: 'data-table',
      columns: [{ key: 'feature', label: 'Feature' }, ...products.map((product) => ({ key: product.id, label: product.name }))],
      rows: rows.map((row) => {
        const values: Record<string, string> = { feature: row.label };
        products.forEach((product, index) => {
          values[product.id] = row.values[index] ?? 'Not provided';
        });
        return values;
      }),
    };
    const table = document.createElement(ELEMENT_NAMES['data-table']);
    table.payload = tablePayload;
    shell.append(table);
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }

  private defaultRows(products: CxProductSummary[]): Array<{ label: string; values: string[] }> {
    return [
      { label: 'Brand', values: products.map((product) => product.brand ?? 'Not provided') },
      { label: 'Category', values: products.map((product) => product.category ?? 'Not provided') },
      { label: 'Price', values: products.map((product) => formatPrice(product.price) ?? 'Not provided') },
      { label: 'Rating', values: products.map((product) => (product.rating === undefined ? 'Not provided' : `${product.rating} / 5`)) },
      { label: 'Inventory', values: products.map((product) => product.inventoryStatus ?? 'Not provided') },
      { label: 'Best fit', values: products.map((product) => product.fit ?? 'Not provided') },
    ];
  }
}

export class CxLoyaltyTiersElement extends CxElement<CxLoyaltyTiersPayload> {
  protected renderPayload(payload: CxLoyaltyTiersPayload): Node {
    const shell = createElement('section', { className: 'cx-stack' });
    appendIf(shell, createHeader(payload ?? {}));
    appendIf(shell, createBody(payload?.body));
    const tiers = payload?.tiers ?? [];
    if (!tiers.length) shell.append(renderEmpty('No loyalty tiers are currently available.'));
    const grid = createElement('div', { className: 'cx-grid two' });
    for (const tier of tiers) grid.append(renderLoyaltyTier(tier));
    if (tiers.length) shell.append(grid);
    if (payload?.disclosure) shell.append(createElement('p', { className: 'cx-disclosure', text: payload.disclosure }));
    appendIf(shell, createActions(payload?.actions, (action) => this.dispatchAction(action)));
    return shell;
  }
}

export class CxWidgetHostElement extends CxElement<CxWidgetPayload> {
  protected renderPayload(payload: CxWidgetPayload): Node {
    if (!isObject(payload) || typeof payload.kind !== 'string') {
      return renderEmpty('Widget payload is missing a kind.');
    }
    const name = elementNameForKind(payload.kind as CxWidgetPayload['kind']);
    const element = document.createElement(name);
    element.payload = payload;
    return element;
  }
}

export const componentDefinitions = {
  [ELEMENT_NAMES['rich-card']]: CxRichCardElement,
  [ELEMENT_NAMES['choice-list']]: CxChoiceListElement,
  [ELEMENT_NAMES['data-table']]: CxDataTableElement,
  [ELEMENT_NAMES['form-panel']]: CxFormPanelElement,
  [ELEMENT_NAMES['status-banner']]: CxStatusBannerElement,
  [ELEMENT_NAMES['widget-host']]: CxWidgetHostElement,
  [ELEMENT_NAMES['card-offers']]: CxCardOffersElement,
  [ELEMENT_NAMES['card-info']]: CxCardInfoElement,
  [ELEMENT_NAMES['card-compare']]: CxCardCompareElement,
  [ELEMENT_NAMES['financing-options']]: CxFinancingOptionsElement,
  [ELEMENT_NAMES['payment-plan']]: CxPaymentPlanElement,
  [ELEMENT_NAMES['monthly-payment-estimate']]: CxMonthlyPaymentEstimateElement,
  [ELEMENT_NAMES['financing-disclosure']]: CxFinancingDisclosureElement,
  [ELEMENT_NAMES['cta-group']]: CxCtaGroupElement,
  [ELEMENT_NAMES['product-list']]: CxProductListElement,
  [ELEMENT_NAMES['product-offers']]: CxProductOffersElement,
  [ELEMENT_NAMES['product-comparison']]: CxProductComparisonElement,
  [ELEMENT_NAMES['loyalty-tiers']]: CxLoyaltyTiersElement,
};
