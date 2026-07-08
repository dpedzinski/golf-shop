import { ELEMENT_NAMES, elementNameForKind } from './element-names';
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
  CxFinancingOptionsPayload,
  CxFormPanelPayload,
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
  DialogflowBridgeOptions,
  DialogflowCustomTemplateItem,
  DialogflowMessengerLike,
  DialogflowRichContent,
} from './types';
import { asArray, compactValues, escapeHtml, estimateMonthlyPayment, formatCurrency, safeUrl } from './utils';

type RichItem = Record<string, unknown>;

function compactLines(values: Array<string | undefined | null>): string[] {
  return values.filter((value): value is string => Boolean(value));
}

export function toCustomTemplate(name: string, payload: unknown): DialogflowRichContent {
  const item: DialogflowCustomTemplateItem = {
    type: 'custom_template',
    name,
    payload,
  };
  return { richContent: [[item]] };
}

export function toCustomTemplateForPayload(payload: CxWidgetPayload): DialogflowRichContent {
  return toCustomTemplate(elementNameForKind(payload.kind), payload);
}

export function toRichContentFallback(payload: CxWidgetPayload): DialogflowRichContent {
  switch (payload.kind) {
    case 'rich-card':
      return { richContent: [richCardFallback(payload)] };
    case 'choice-list':
      return { richContent: [choiceFallback(payload)] };
    case 'data-table':
      return { richContent: [[htmlItem(tableHtml(payload))]] };
    case 'form-panel':
      return { richContent: [formFallback(payload)] };
    case 'status-banner':
      return { richContent: [statusFallback(payload)] };
    case 'card-offers':
      return { richContent: cardOffersFallback(payload) };
    case 'card-info':
      return { richContent: [cardInfoFallback(payload)] };
    case 'card-compare':
      return { richContent: [[htmlItem(cardCompareHtml(payload))]] };
    case 'financing-options':
      return { richContent: financingOptionsFallback(payload) };
    case 'payment-plan':
      return { richContent: [[htmlItem(paymentPlanHtml(payload))]] };
    case 'monthly-payment-estimate':
      return { richContent: [monthlyEstimateFallback(payload)] };
    case 'financing-disclosure':
      return { richContent: [disclosureFallback(payload)] };
    case 'cta-group':
      return { richContent: [ctaGroupFallback(payload)] };
    case 'product-list':
      return { richContent: productListFallback(payload) };
    case 'product-offers':
      return { richContent: productOffersFallback(payload) };
    case 'product-comparison':
      return { richContent: [[htmlItem(productComparisonHtml(payload))]] };
    case 'loyalty-tiers':
      return { richContent: loyaltyTiersFallback(payload) };
    default:
      return { richContent: [[descriptionItem('Unsupported widget', ['This widget type does not have a fallback renderer.'])]] };
  }
}

export function registerDialogflowBridge(
  dfMessenger: DialogflowMessengerLike,
  options: DialogflowBridgeOptions = {}
): (customPayload: DialogflowRichContent) => Promise<{ status: string; reason: string | null }> {
  const functionName = options.functionName ?? 'addRichContent';
  const addRichContent = async (customPayload: DialogflowRichContent) => {
    try {
      dfMessenger.renderCustomCard?.(customPayload.richContent);
      return { status: 'OK', reason: null };
    } catch (error) {
      options.onError?.(error);
      return { status: 'ERROR', reason: error instanceof Error ? error.message : 'Unable to render rich content' };
    }
  };

  if (options.toolId && typeof dfMessenger.registerClientSideFunction === 'function') {
    dfMessenger.registerClientSideFunction(options.toolId, functionName, addRichContent);
  }

  if (options.onAction) {
    document.addEventListener('cx-action', (event) => {
      options.onAction?.((event as CustomEvent).detail);
    });
  }

  return addRichContent;
}

function richCardFallback(payload: CxRichCardPayload): RichItem[] {
  const items: RichItem[] = [];
  if (payload.image?.src && safeUrl(payload.image.src)) {
    items.push({ type: 'image', rawUrl: safeUrl(payload.image.src), accessibilityText: payload.image.alt ?? payload.title ?? '' });
  }
  if (payload.title || payload.subtitle) {
    items.push({
      type: 'info',
      title: escapeHtml(payload.title ?? ''),
      subtitle: escapeHtml(compactValues([payload.subtitle, ...asArray(payload.body)])),
      anchor: anchorFromAction(payload.actions?.find((action) => action.kind === 'link')),
    });
  } else if (payload.body) {
    items.push(descriptionItem('Details', asArray(payload.body)));
  }
  items.push(...actionsAsChips(payload.actions));
  return items;
}

function choiceFallback(payload: CxChoiceListPayload): RichItem[] {
  const items: RichItem[] = [];
  if (payload.title || payload.body) {
    items.push(descriptionItem(payload.title ?? 'Choose an option', compactLines([payload.subtitle, ...asArray(payload.body)])));
  }
  items.push({
    type: 'chips',
    options: payload.options.map((option) => ({
      text: escapeHtml(option.label),
      anchor: anchorFromAction(option.action),
    })),
  });
  return items;
}

function formFallback(payload: CxFormPanelPayload): RichItem[] {
  const lines = payload.fields.map((field) => `${field.label}${field.required ? ' (required)' : ''}`);
  return [descriptionItem(payload.title ?? 'Form details', [...asArray(payload.body), ...lines]), ...actionsAsChips(payload.actions)];
}

function statusFallback(payload: CxStatusBannerPayload): RichItem[] {
  return [
    descriptionItem(payload.title ?? payload.status ?? 'Status', compactLines([payload.subtitle, ...asArray(payload.body)])),
    ...actionsAsChips(payload.actions),
  ];
}

function cardOffersFallback(payload: CxCardOffersPayload): RichItem[][] {
  const cards = payload.offers.map((offer) => cardInfoFallback({ kind: 'card-info', card: offer }));
  if (payload.disclosure) cards.push([descriptionItem('Disclosure', [payload.disclosure])]);
  return cards.length ? cards : [[descriptionItem(payload.title ?? 'Card offers', ['No card offers are currently available.'])]];
}

function cardInfoFallback(payload: CxCardInfoPayload): RichItem[] {
  const offer = payload.card;
  const lines = [
    offer.headlineOffer,
    `Issuer: ${offer.issuer}`,
    offer.introApr ? `Intro APR: ${offer.introApr}` : undefined,
    offer.ongoingApr ? `Ongoing APR: ${offer.ongoingApr}` : undefined,
    offer.annualFee ? `Annual fee: ${offer.annualFee}` : undefined,
    offer.rewards ? `Rewards: ${offer.rewards}` : undefined,
    offer.eligibilityNotes ? `Eligibility: ${offer.eligibilityNotes}` : undefined,
    ...(offer.caveats ?? []),
  ].filter(Boolean) as string[];
  return [
    descriptionItem(offer.name, lines),
    ...actionsAsChips([offer.primaryAction, termsAction(offer)].filter((action): action is CxAction => Boolean(action))),
  ];
}

function financingOptionsFallback(payload: CxFinancingOptionsPayload): RichItem[][] {
  const cards = payload.options.map((option) => [
    descriptionItem(option.name, [
      option.summary,
      option.apr ? `APR: ${option.apr}` : undefined,
      option.term ? `Term: ${option.term}` : undefined,
      option.fees ? `Fees: ${option.fees}` : undefined,
      option.eligibilityNotes ? `Eligibility: ${option.eligibilityNotes}` : undefined,
    ].filter(Boolean) as string[]),
    ...actionsAsChips(option.action ? [option.action] : undefined),
  ]);
  if (payload.disclosure) cards.push([descriptionItem('Disclosure', [payload.disclosure])]);
  return cards.length ? cards : [[descriptionItem(payload.title ?? 'Financing options', ['No financing options are currently available.'])]];
}

function monthlyEstimateFallback(payload: CxMonthlyPaymentEstimatePayload): RichItem[] {
  const monthly = estimateMonthlyPayment(payload.principal, payload.months, payload.apr, payload.fees);
  return [
    descriptionItem(payload.title ?? 'Monthly payment estimate', [
      `Estimated monthly payment: ${formatCurrency(monthly, payload.currency ?? 'USD')}`,
      `Term: ${payload.months} months`,
      payload.apr === undefined ? 'APR: Not provided' : `APR: ${payload.apr}%`,
      payload.disclosure ?? 'Estimate only. This does not represent approval, final pricing, or financial advice.',
    ]),
  ];
}

function disclosureFallback(payload: CxFinancingDisclosurePayload): RichItem[] {
  return [descriptionItem(payload.title ?? 'Financing disclosure', [...asArray(payload.body), ...payload.disclosures])];
}

function ctaGroupFallback(payload: CxCtaGroupPayload): RichItem[] {
  const items: RichItem[] = [];
  if (payload.title || payload.subtitle || payload.body) {
    items.push(descriptionItem(payload.title ?? 'Actions', compactLines([payload.subtitle, ...asArray(payload.body)])));
  }
  items.push(...actionsAsChips(payload.actions));
  if (payload.disclosure) items.push(descriptionItem('Disclosure', [payload.disclosure]));
  return items;
}

function productListFallback(payload: CxProductListPayload): RichItem[][] {
  const cards = payload.products.map((product) => productInfoFallback(product));
  return cards.length ? cards : [[descriptionItem(payload.title ?? 'Products', [payload.emptyMessage ?? 'No products are currently available.'])]];
}

function productOffersFallback(payload: CxProductOffersPayload): RichItem[][] {
  const cards = payload.offers.map((offer) => productOfferFallback(offer));
  if (payload.disclosure) cards.push([descriptionItem('Disclosure', [payload.disclosure])]);
  return cards.length
    ? cards
    : [[descriptionItem(payload.title ?? payload.product?.name ?? 'Product offers', [payload.emptyMessage ?? 'No offers are currently available.'])]];
}

function productInfoFallback(product: CxProductSummary): RichItem[] {
  const offerCtas = (product.offers ?? []).flatMap((offer) =>
    [offer.action, ...(offer.actions ?? [])].filter((action): action is CxAction => Boolean(action))
  );
  const lines = [
    product.description,
    product.brand ? `Brand: ${product.brand}` : undefined,
    product.category ? `Category: ${product.category}` : undefined,
    product.price === undefined ? undefined : `Price: ${typeof product.price === 'number' ? formatCurrency(product.price) : product.price}`,
    product.rating === undefined ? undefined : `Rating: ${product.rating} / 5`,
    product.reviewCount === undefined ? undefined : `Reviews: ${product.reviewCount}`,
    product.inventoryStatus ? `Inventory: ${product.inventoryStatus}` : undefined,
    product.fit ? `Best fit: ${product.fit}` : undefined,
    ...(product.offers ?? []).map((offer) => `Offer: ${offer.headline}`),
  ].filter(Boolean) as string[];
  const image = product.image?.src && safeUrl(product.image.src)
    ? [{ type: 'image', rawUrl: safeUrl(product.image.src), accessibilityText: product.image.alt ?? product.name }]
    : [];
  return [
    ...image,
    descriptionItem(product.name, lines),
    ...actionsAsChips([product.action, ...(product.actions ?? []), ...offerCtas].filter((action): action is CxAction => Boolean(action))),
  ];
}

function productOfferFallback(offer: CxProductOffer): RichItem[] {
  const lines = [
    offer.description,
    offer.label ? `Type: ${offer.label}` : undefined,
    offer.price === undefined ? undefined : `Price: ${typeof offer.price === 'number' ? formatCurrency(offer.price) : offer.price}`,
    offer.badge ? `Badge: ${offer.badge}` : undefined,
    offer.expiresAt ? `Ends: ${offer.expiresAt}` : undefined,
    offer.eligibilityNotes ? `Eligibility: ${offer.eligibilityNotes}` : undefined,
  ].filter(Boolean) as string[];
  return [
    descriptionItem(offer.headline, lines),
    ...actionsAsChips([offer.action, ...(offer.actions ?? [])].filter((action): action is CxAction => Boolean(action))),
  ];
}

function loyaltyTiersFallback(payload: CxLoyaltyTiersPayload): RichItem[][] {
  const cards = payload.tiers.map((tier) => [
    descriptionItem(tier.name, [
      tier.annualSpend ? `Annual spend: ${tier.annualSpend}` : undefined,
      tier.earningRate ? `Earn: ${tier.earningRate}` : undefined,
      tier.redemptionRate ? `Redeem: ${tier.redemptionRate}` : undefined,
      ...tier.benefits,
      ...(tier.caveats ?? []),
    ].filter(Boolean) as string[]),
  ]);
  if (payload.disclosure) cards.push([descriptionItem('Disclosure', [payload.disclosure])]);
  return cards.length ? cards : [[descriptionItem(payload.title ?? 'Loyalty tiers', ['No loyalty tiers are currently available.'])]];
}

function actionsAsChips(actions: CxAction[] | undefined): RichItem[] {
  const options = (actions ?? [])
    .filter((action) => action.label)
    .map((action) => ({ text: escapeHtml(action.label), anchor: anchorFromAction(action) }));
  return options.length ? [{ type: 'chips', options }] : [];
}

function descriptionItem(title: string, text: string[]): RichItem {
  return { type: 'description', title: escapeHtml(title), text: text.length ? text.map(escapeHtml) : [''] };
}

function htmlItem(html: string): RichItem {
  return { type: 'html', html };
}

function anchorFromAction(action: CxAction | undefined): { href: string; target?: string } | undefined {
  const href = safeUrl(action?.href);
  if (!href) return undefined;
  return { href, target: action?.target ?? '_blank' };
}

function termsAction(offer: CxCardOffer): CxAction | undefined {
  const href = safeUrl(offer.termsUrl);
  return href ? { id: `${offer.id}-terms`, label: 'View terms', kind: 'link', href } : undefined;
}

function tableHtml(payload: CxDataTablePayload): string {
  const head = payload.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
  const rows = payload.rows
    .map((row) => `<tr>${payload.columns.map((column) => `<td>${escapeHtml(row[column.key] ?? '')}</td>`).join('')}</tr>`)
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

function cardCompareHtml(payload: CxCardComparePayload): string {
  const cards = payload.cards;
  const rows =
    payload.rows ??
    [
      { label: 'Issuer', values: cards.map((card) => card.issuer) },
      { label: 'Headline offer', values: cards.map((card) => card.headlineOffer ?? 'Not provided') },
      { label: 'Intro APR', values: cards.map((card) => card.introApr ?? 'Not provided') },
      { label: 'Ongoing APR', values: cards.map((card) => card.ongoingApr ?? 'Not provided') },
      { label: 'Annual fee', values: cards.map((card) => card.annualFee ?? 'Not provided') },
      { label: 'Rewards', values: cards.map((card) => card.rewards ?? 'Not provided') },
      { label: 'Repayment terms', values: cards.map((card) => card.repaymentTerms ?? 'Not provided') },
    ];
  const table: CxDataTablePayload = {
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
  return tableHtml(table);
}

function productComparisonHtml(payload: CxProductComparisonPayload): string {
  const products = payload.products;
  const rows =
    payload.rows ??
    [
      { label: 'Brand', values: products.map((product) => product.brand ?? 'Not provided') },
      { label: 'Category', values: products.map((product) => product.category ?? 'Not provided') },
      {
        label: 'Price',
        values: products.map((product) =>
          product.price === undefined ? 'Not provided' : typeof product.price === 'number' ? formatCurrency(product.price) : product.price
        ),
      },
      { label: 'Rating', values: products.map((product) => (product.rating === undefined ? 'Not provided' : `${product.rating} / 5`)) },
      { label: 'Inventory', values: products.map((product) => product.inventoryStatus ?? 'Not provided') },
      { label: 'Best fit', values: products.map((product) => product.fit ?? 'Not provided') },
    ];
  const table: CxDataTablePayload = {
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
  return tableHtml(table);
}

function paymentPlanHtml(payload: CxPaymentPlanPayload): string {
  const columns = [
    { key: 'label', label: 'Plan' },
    { key: 'term', label: 'Term' },
    { key: 'monthly', label: 'Estimated monthly' },
    { key: 'apr', label: 'APR' },
  ];
  const rows = payload.plans.map((plan) => ({
    label: plan.label,
    term: `${plan.months} months`,
    monthly: formatCurrency(
      plan.monthlyPayment ?? estimateMonthlyPayment(payload.purchaseAmount, plan.months, plan.apr, plan.fees),
      payload.currency ?? 'USD'
    ),
    apr: plan.apr === undefined ? 'Not provided' : `${plan.apr}%`,
  }));
  return tableHtml({ kind: 'data-table', columns, rows });
}

export const dialogflowElementNames = ELEMENT_NAMES;
