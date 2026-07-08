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

export const productListPayload: CxWidgetPayload = {
  kind: 'product-list',
  title: 'Recommended gear',
  subtitle: 'Catalog-style cards with offers and shopper CTAs.',
  products: [
    {
      id: 'CLUB-STRATA-SET',
      name: 'Strata Ultimate Complete Golf Set',
      brand: 'Strata',
      category: 'Clubs',
      description: 'Forgiving full set with driver, fairway wood, hybrid, irons, putter, and stand bag.',
      price: 499.99,
      rating: 4.5,
      reviewCount: 120,
      inventoryStatus: 'In stock',
      fit: 'New golfers who want one affordable package.',
      image: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg',
        alt: 'Golf clubs in a bag on a golf course.',
      },
      tags: ['Beginner friendly', 'Complete set'],
      offers: [
        {
          id: 'strata-promo-finance',
          label: 'Financing',
          headline: '0% promo APR may be available for 12 months',
          description: 'Shown for qualifying purchases over $499.',
          badge: 'Limited time',
          eligibilityNotes: 'Subject to credit approval and final terms.',
          action: {
            id: 'check-strata-financing',
            label: 'Check financing',
            kind: 'event',
            eventName: 'check_product_financing',
            payload: { productId: 'CLUB-STRATA-SET' },
          },
        },
      ],
      actions: [
        {
          id: 'view-strata',
          label: 'View details',
          kind: 'event',
          eventName: 'view_product_details',
          payload: { productId: 'CLUB-STRATA-SET' },
        },
        {
          id: 'compare-strata',
          label: 'Compare',
          kind: 'event',
          eventName: 'add_to_compare',
          variant: 'secondary',
          payload: { productId: 'CLUB-STRATA-SET' },
        },
      ],
    },
    {
      id: 'BALL-TITLEIST-TRUFEEL',
      name: 'Titleist TruFeel Golf Balls',
      brand: 'Titleist',
      category: 'Balls',
      description: 'Soft-feel golf balls with good control at a moderate price.',
      price: 24.99,
      rating: 4.6,
      reviewCount: 210,
      inventoryStatus: 'In stock',
      fit: 'Players who value feel and short-game control.',
      image: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Golfball.jpg',
        alt: 'White golf ball beside a cup on a putting green.',
      },
      tags: ['Soft feel', 'Value'],
      actions: [
        {
          id: 'view-trufeel',
          label: 'View details',
          kind: 'event',
          eventName: 'view_product_details',
          payload: { productId: 'BALL-TITLEIST-TRUFEEL' },
        },
        {
          id: 'add-trufeel',
          label: 'Add to cart',
          kind: 'event',
          eventName: 'add_to_cart',
          variant: 'primary',
          payload: { productId: 'BALL-TITLEIST-TRUFEEL', quantity: 1 },
        },
      ],
    },
  ],
};

export const productOffersPayload: CxWidgetPayload = {
  kind: 'product-offers',
  title: 'Offers for Strata Ultimate Complete Golf Set',
  productId: 'CLUB-STRATA-SET',
  offers: [
    {
      id: 'strata-card-offer',
      label: 'Store card',
      headline: '$25 reward certificate after first qualifying purchase',
      description: 'For eligible store card members after account approval and purchase posting.',
      badge: 'Card offer',
      eligibilityNotes: 'Subject to credit approval. Terms apply.',
      actions: [
        {
          id: 'review-card-offer',
          label: 'Review card offer',
          kind: 'event',
          eventName: 'review_card_offer',
          payload: { productId: 'CLUB-STRATA-SET' },
        },
        {
          id: 'terms-card-offer',
          label: 'Terms',
          kind: 'link',
          href: 'https://example.com/store-card-terms',
          variant: 'ghost',
        },
      ],
    },
    {
      id: 'strata-bundle-offer',
      label: 'Bundle',
      headline: 'Save 10% on balls and tees with this club set',
      description: 'Applies when eligible accessories are added in the same cart.',
      badge: 'Bundle',
      expiresAt: '2026-08-31',
      action: {
        id: 'build-strata-bundle',
        label: 'Build bundle',
        kind: 'event',
        eventName: 'build_bundle',
        payload: { productId: 'CLUB-STRATA-SET' },
      },
    },
  ],
  disclosure: 'Offers are examples for widget rendering. Availability and final terms can change.',
};

export const ctaGroupPayload: CxWidgetPayload = {
  kind: 'cta-group',
  title: 'Next steps',
  body: 'Use CTA groups when the agent needs to present several clear shopper actions.',
  layout: 'row',
  actions: [
    {
      id: 'continue-shopping',
      label: 'Continue shopping',
      kind: 'event',
      eventName: 'continue_shopping',
    },
    {
      id: 'compare-selected',
      label: 'Compare selected',
      kind: 'event',
      eventName: 'compare_selected_products',
      variant: 'secondary',
    },
    {
      id: 'talk-to-associate',
      label: 'Talk to associate',
      kind: 'event',
      eventName: 'handoff_to_associate',
      variant: 'ghost',
    },
  ],
};

export const demoPayloads: CxWidgetPayload[] = [
  cardOffersPayload,
  cardComparePayload,
  financingOptionsPayload,
  paymentPlanPayload,
  monthlyEstimatePayload,
  productListPayload,
  productOffersPayload,
  ctaGroupPayload,
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
