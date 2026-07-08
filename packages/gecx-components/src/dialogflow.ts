import { ELEMENT_NAMES, elementNameForKind } from './element-names';
import type {
  CxAction,
  CxCardComparePayload,
  CxCardInfoPayload,
  CxCardOffer,
  CxCardOffersPayload,
  CxChoiceListPayload,
  CxDataTablePayload,
  CxFinancingDisclosurePayload,
  CxFinancingOptionsPayload,
  CxFormPanelPayload,
  CxMonthlyPaymentEstimatePayload,
  CxPaymentPlanPayload,
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
