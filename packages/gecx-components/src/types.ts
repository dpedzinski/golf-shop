export type CxTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export type CxActionKind = 'link' | 'event' | 'submit' | 'select' | 'custom';

export interface CxAction {
  id: string;
  label: string;
  kind?: CxActionKind;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  eventName?: string;
  payload?: Record<string, unknown>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export interface CxImage {
  src: string;
  alt?: string;
}

export interface CxWidgetPayloadBase {
  kind: string;
  title?: string;
  subtitle?: string;
  body?: string | string[];
  image?: CxImage;
  actions?: CxAction[];
  tone?: CxTone;
}

export interface CxRichCardPayload extends CxWidgetPayloadBase {
  kind: 'rich-card';
  eyebrow?: string;
  metadata?: Array<{ label: string; value: string }>;
}

export interface CxChoiceOption {
  id: string;
  label: string;
  description?: string;
  value?: unknown;
  selected?: boolean;
  disabled?: boolean;
  action?: CxAction;
}

export interface CxChoiceListPayload extends CxWidgetPayloadBase {
  kind: 'choice-list';
  options: CxChoiceOption[];
  selectionMode?: 'single' | 'multiple';
}

export interface CxDataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface CxDataTablePayload extends CxWidgetPayloadBase {
  kind: 'data-table';
  columns: CxDataTableColumn[];
  rows: Array<Record<string, string | number | boolean | null | undefined>>;
  caption?: string;
}

export interface CxFormFieldOption {
  label: string;
  value: string;
}

export interface CxFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  value?: string | number | boolean;
  options?: CxFormFieldOption[];
}

export interface CxFormPanelPayload extends CxWidgetPayloadBase {
  kind: 'form-panel';
  fields: CxFormField[];
  submitLabel?: string;
}

export interface CxStatusBannerPayload extends CxWidgetPayloadBase {
  kind: 'status-banner';
  status?: CxTone;
}

export interface CxFinancingDisclosurePayload extends CxWidgetPayloadBase {
  kind: 'financing-disclosure';
  disclosures: string[];
  required?: boolean;
}

export interface CxCardOffer {
  id: string;
  issuer: string;
  name: string;
  headlineOffer?: string;
  introApr?: string;
  ongoingApr?: string;
  annualFee?: string;
  rewards?: string;
  eligibilityNotes?: string;
  promoWindow?: string;
  repaymentTerms?: string;
  caveats?: string[];
  termsUrl?: string;
  primaryAction?: CxAction;
  actions?: CxAction[];
}

export interface CxCardOffersPayload extends CxWidgetPayloadBase {
  kind: 'card-offers';
  offers: CxCardOffer[];
  disclosure?: string;
}

export interface CxCardInfoPayload extends CxWidgetPayloadBase {
  kind: 'card-info';
  card: CxCardOffer;
  details?: Array<{ label: string; value: string }>;
}

export interface CxCardComparePayload extends CxWidgetPayloadBase {
  kind: 'card-compare';
  cards: CxCardOffer[];
  rows?: Array<{ label: string; values: string[] }>;
}

export interface CxFinancingOption {
  id: string;
  type: 'installment' | 'store-card' | 'lease' | 'pay-later' | 'promo' | 'other';
  name: string;
  summary: string;
  apr?: string;
  term?: string;
  fees?: string;
  eligibilityNotes?: string;
  action?: CxAction;
}

export interface CxFinancingOptionsPayload extends CxWidgetPayloadBase {
  kind: 'financing-options';
  options: CxFinancingOption[];
  disclosure?: string;
}

export interface CxPaymentPlanPayload extends CxWidgetPayloadBase {
  kind: 'payment-plan';
  purchaseAmount: number;
  currency?: string;
  plans: Array<{
    id: string;
    label: string;
    months: number;
    apr?: number;
    monthlyPayment?: number;
    fees?: number;
    notes?: string;
    action?: CxAction;
  }>;
  disclosure?: string;
}

export interface CxMonthlyPaymentEstimatePayload extends CxWidgetPayloadBase {
  kind: 'monthly-payment-estimate';
  principal: number;
  months: number;
  apr?: number;
  fees?: number;
  currency?: string;
  disclosure?: string;
}

export interface CxCtaGroupPayload extends CxWidgetPayloadBase {
  kind: 'cta-group';
  actions: CxAction[];
  layout?: 'row' | 'stack';
  disclosure?: string;
}

export interface CxProductOffer {
  id: string;
  label?: string;
  headline: string;
  description?: string;
  price?: string | number;
  badge?: string;
  eligibilityNotes?: string;
  expiresAt?: string;
  action?: CxAction;
  actions?: CxAction[];
}

export interface CxProductSummary {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  image?: CxImage;
  price?: string | number;
  rating?: number;
  reviewCount?: number;
  inventoryStatus?: string;
  fit?: string;
  tags?: string[];
  action?: CxAction;
  actions?: CxAction[];
  offers?: CxProductOffer[];
}

export interface CxProductListPayload extends CxWidgetPayloadBase {
  kind: 'product-list';
  products: CxProductSummary[];
  emptyMessage?: string;
}

export interface CxProductOffersPayload extends CxWidgetPayloadBase {
  kind: 'product-offers';
  product?: CxProductSummary;
  productId?: string;
  offers: CxProductOffer[];
  emptyMessage?: string;
  disclosure?: string;
}

export interface CxProductComparisonPayload extends CxWidgetPayloadBase {
  kind: 'product-comparison';
  products: CxProductSummary[];
  rows?: Array<{ label: string; values: string[] }>;
}

export interface CxLoyaltyTier {
  id: string;
  name: string;
  annualSpend?: string;
  earningRate?: string;
  redemptionRate?: string;
  benefits: string[];
  caveats?: string[];
}

export interface CxLoyaltyTiersPayload extends CxWidgetPayloadBase {
  kind: 'loyalty-tiers';
  tiers: CxLoyaltyTier[];
  disclosure?: string;
}

export type CxWidgetPayload =
  | CxRichCardPayload
  | CxChoiceListPayload
  | CxDataTablePayload
  | CxFormPanelPayload
  | CxStatusBannerPayload
  | CxCardOffersPayload
  | CxCardInfoPayload
  | CxCardComparePayload
  | CxFinancingOptionsPayload
  | CxPaymentPlanPayload
  | CxMonthlyPaymentEstimatePayload
  | CxFinancingDisclosurePayload
  | CxCtaGroupPayload
  | CxProductListPayload
  | CxProductOffersPayload
  | CxProductComparisonPayload
  | CxLoyaltyTiersPayload;

export type CxWidgetKind = CxWidgetPayload['kind'];

export interface CxActionEventDetail {
  action: CxAction;
  source?: unknown;
  payload?: unknown;
  responseId?: string | null;
}

export interface CxSubmitEventDetail {
  values: Record<string, string | boolean>;
  payload?: unknown;
  responseId?: string | null;
}

export interface DialogflowCustomTemplateItem {
  [key: string]: unknown;
  type: 'custom_template';
  name: string;
  payload: unknown;
}

export interface DialogflowRichContent {
  richContent: Array<Array<Record<string, unknown>>>;
}

export interface DialogflowMessengerLike extends Element {
  renderCustomCard?: (richContent: DialogflowRichContent['richContent']) => void;
  registerClientSideFunction?: (
    toolId: string,
    functionName: string,
    fn: (customPayload: DialogflowRichContent) => Promise<{ status: string; reason: string | null }>
  ) => void;
}

export interface DialogflowBridgeOptions {
  toolId?: string;
  functionName?: string;
  onAction?: (detail: CxActionEventDetail) => void;
  onError?: (error: unknown) => void;
}

declare global {
  interface HTMLElement {
    dfPayload?: unknown;
    dfResponseId?: string | null;
    payload?: unknown;
  }

  interface HTMLElementEventMap {
    'cx-action': CustomEvent<CxActionEventDetail>;
    'cx-submit': CustomEvent<CxSubmitEventDetail>;
    'cx-error': CustomEvent<{ error: unknown; payload?: unknown; responseId?: string | null }>;
  }
}
