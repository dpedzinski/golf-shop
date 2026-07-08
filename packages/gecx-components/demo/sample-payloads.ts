import type { CxWidgetPayload } from '../src';

export const cardOffersPayload: CxWidgetPayload = {
  kind: 'card-offers',
  title: 'Available card offers',
  subtitle: 'Compare current financing offers before choosing an option.',
  offers: [
    {
      id: 'store-rewards',
      issuer: 'Example Bank',
      name: 'Store Rewards Card',
      headlineOffer: '0% intro APR for 12 months on qualifying purchases',
      introApr: '0% for 12 months',
      ongoingApr: '19.99% to 29.99% variable',
      annualFee: '$0',
      rewards: '5% back in store rewards',
      eligibilityNotes: 'Subject to credit approval.',
      repaymentTerms: 'Minimum monthly payments required.',
      caveats: ['Interest may be charged from purchase date if promo balance is not paid in full.'],
      termsUrl: 'https://example.com/store-card-terms',
      primaryAction: {
        id: 'apply-store-card',
        label: 'Review offer',
        kind: 'event',
        eventName: 'review_store_card_offer',
      },
    },
    {
      id: 'installment-plus',
      issuer: 'Example Pay',
      name: 'Installment Plus',
      headlineOffer: 'Split purchases into fixed monthly payments',
      introApr: 'As low as 0%',
      ongoingApr: '0% to 30% APR based on eligibility',
      annualFee: '$0',
      rewards: 'No rewards',
      eligibilityNotes: 'Eligibility check required.',
      repaymentTerms: '3, 6, or 12 month plans may be available.',
      termsUrl: 'https://example.com/installment-terms',
      primaryAction: {
        id: 'check-installments',
        label: 'Check plans',
        kind: 'event',
        eventName: 'check_installment_plans',
      },
    },
  ],
  disclosure: 'Terms apply. Approval and rates are not guaranteed.',
};

export const cardComparePayload: CxWidgetPayload = {
  kind: 'card-compare',
  title: 'Compare financing choices',
  cards: cardOffersPayload.offers,
};

export const financingOptionsPayload: CxWidgetPayload = {
  kind: 'financing-options',
  title: 'Payment options',
  options: [
    {
      id: 'store-card',
      type: 'store-card',
      name: 'Store credit card',
      summary: 'Useful for larger purchases if you expect to pay within the promo period.',
      apr: '0% intro, then 19.99% to 29.99% variable',
      term: '12 month promotional period',
      fees: '$0 annual fee',
      eligibilityNotes: 'Subject to credit approval.',
      action: {
        id: 'learn-store-card',
        label: 'Learn more',
        kind: 'event',
        eventName: 'learn_store_card',
      },
    },
    {
      id: 'pay-later',
      type: 'pay-later',
      name: 'Pay-later installments',
      summary: 'Fixed payments with plan options shown before checkout.',
      apr: '0% to 30%',
      term: '3 to 12 months',
      fees: 'No late fees in this demo payload',
      eligibilityNotes: 'Eligibility check required.',
      action: {
        id: 'learn-installments',
        label: 'View plans',
        kind: 'event',
        eventName: 'view_installment_plans',
      },
    },
  ],
  disclosure: 'Financing information is provided for comparison only and is not financial advice.',
};

export const paymentPlanPayload: CxWidgetPayload = {
  kind: 'payment-plan',
  title: 'Estimated payment plans',
  purchaseAmount: 899,
  plans: [
    { id: 'three', label: '3 month plan', months: 3, apr: 0 },
    { id: 'six', label: '6 month plan', months: 6, apr: 9.99, fees: 0 },
    { id: 'twelve', label: '12 month plan', months: 12, apr: 19.99 },
  ],
  disclosure: 'Estimated payments only. Final terms may differ.',
};

export const monthlyEstimatePayload: CxWidgetPayload = {
  kind: 'monthly-payment-estimate',
  title: 'Monthly payment estimate',
  principal: 899,
  months: 12,
  apr: 9.99,
  disclosure: 'Estimate only. This does not represent approval, final pricing, or financial advice.',
};

export const formPayload: CxWidgetPayload = {
  kind: 'form-panel',
  title: 'Contact preferences',
  body: 'Use direct injection to collect simple structured input in the host page.',
  fields: [
    { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com' },
    {
      id: 'topic',
      label: 'Topic',
      type: 'select',
      options: [
        { label: 'Card offers', value: 'card-offers' },
        { label: 'Installments', value: 'installments' },
      ],
    },
    { id: 'updates', label: 'Send follow-up updates', type: 'checkbox', value: true },
  ],
  submitLabel: 'Send',
};

export const demoPayloads: CxWidgetPayload[] = [
  cardOffersPayload,
  cardComparePayload,
  financingOptionsPayload,
  paymentPlanPayload,
  monthlyEstimatePayload,
  formPayload,
  {
    kind: 'financing-disclosure',
    title: 'Financing disclosure',
    required: true,
    disclosures: [
      'Subject to credit approval.',
      'Promotional financing may require minimum monthly payments.',
      'This widget does not make approval decisions or financial recommendations.',
    ],
  },
];
