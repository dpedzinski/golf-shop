import type { CxWidgetKind } from './types';

export const ELEMENT_NAMES = {
  'rich-card': 'cx-rich-card',
  'choice-list': 'cx-choice-list',
  'data-table': 'cx-data-table',
  'form-panel': 'cx-form-panel',
  'status-banner': 'cx-status-banner',
  'widget-host': 'cx-widget-host',
  'card-offers': 'cx-card-offers',
  'card-info': 'cx-card-info',
  'card-compare': 'cx-card-compare',
  'financing-options': 'cx-financing-options',
  'payment-plan': 'cx-payment-plan',
  'monthly-payment-estimate': 'cx-monthly-payment-estimate',
  'financing-disclosure': 'cx-financing-disclosure',
  'cta-group': 'cx-cta-group',
  'product-list': 'cx-product-list',
  'product-carousel': 'cx-product-carousel',
  'product-offers': 'cx-product-offers',
  'product-comparison': 'cx-product-comparison',
  'loyalty-tiers': 'cx-loyalty-tiers',
} as const satisfies Record<CxWidgetKind | 'widget-host', string>;

export type CxElementName = (typeof ELEMENT_NAMES)[keyof typeof ELEMENT_NAMES];

export function elementNameForKind(kind: CxWidgetKind): CxElementName {
  return ELEMENT_NAMES[kind];
}
