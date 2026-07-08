import { ELEMENT_NAMES } from '../src';
import type { CxElementName, CxWidgetPayload } from '../src';

export interface CxGallerySample {
  id: string;
  label: string;
  description: string;
  kind: CxWidgetPayload['kind'] | 'widget-host';
  elementName: CxElementName;
  payload: CxWidgetPayload;
}

export const richCardPayload: CxWidgetPayload = {
  kind: 'rich-card',
  eyebrow: 'Assistant result',
  title: 'Driver fitting shortcut',
  subtitle: 'A compact recommendation card for chat responses and host-page injection.',
  body: [
    'Prioritize launch help, forgiveness, and adjustable loft before chasing raw distance.',
    'Pair the recommendation with a fitting session if the shopper knows their swing speed.',
  ],
  image: {
    src: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=900&q=80',
    alt: 'Golfer addressing a ball on a fairway.',
  },
  metadata: [
    { label: 'Skill fit', value: 'Beginner to intermediate' },
    { label: 'Primary goal', value: 'Higher launch' },
  ],
  actions: [
    {
      id: 'open-fitting-guide',
      label: 'Open guide',
      kind: 'event',
      eventName: 'open_fitting_guide',
      variant: 'primary',
    },
  ],
};

export const choiceListPayload: CxWidgetPayload = {
  kind: 'choice-list',
  title: 'Choose a shopping goal',
  body: 'The assistant can branch from a structured choice without leaving the chat.',
  selectionMode: 'single',
  options: [
    {
      id: 'beginner-set',
      label: 'Build a beginner set',
      description: 'Clubs, bag, balls, and tees',
      value: 'beginner-set',
      selected: true,
    },
    {
      id: 'upgrade-driver',
      label: 'Upgrade a driver',
      description: 'Distance and forgiveness',
      value: 'upgrade-driver',
    },
    {
      id: 'compare-balls',
      label: 'Compare golf balls',
      description: 'Feel, spin, and price',
      value: 'compare-balls',
    },
  ],
};

export const dataTablePayload: CxWidgetPayload = {
  kind: 'data-table',
  title: 'Shipping options',
  body: 'Tables make policy and checkout details scannable inside rich responses.',
  caption: 'Example delivery estimates',
  columns: [
    { key: 'method', label: 'Method' },
    { key: 'speed', label: 'Speed' },
    { key: 'cost', label: 'Cost', align: 'right' },
  ],
  rows: [
    { method: 'Standard', speed: '3-5 business days', cost: '$6.95' },
    { method: 'Express', speed: '2 business days', cost: '$14.95' },
    { method: 'Store pickup', speed: 'Ready today where available', cost: '$0.00' },
  ],
};

export const statusBannerPayload: CxWidgetPayload = {
  kind: 'status-banner',
  title: 'Cart updated',
  body: 'The selected item is reserved while the shopper reviews checkout options.',
  status: 'success',
  actions: [
    {
      id: 'view-cart',
      label: 'View cart',
      kind: 'event',
      eventName: 'view_cart',
    },
  ],
};

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

export const cardInfoPayload: CxWidgetPayload = {
  kind: 'card-info',
  title: 'Card offer details',
  card: cardOffersPayload.offers[0],
  details: [
    { label: 'Best for', value: 'Frequent Fairway Supply shoppers' },
    { label: 'Decision support', value: 'Compare APR, rewards, caveats, and promo terms before applying.' },
  ],
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

export const productCarouselPayload: CxWidgetPayload = {
  kind: 'product-carousel',
  title: 'Irons for experienced players',
  body: 'Detailed iron cards for players who want compact control, forged feel, and predictable gapping.',
  selectedProductId: 'P027',
  products: [
    {
      id: 'P027',
      name: 'NorthLake Forge SoftStrike Forged Iron Set',
      brand: 'NorthLake Forge',
      category: 'Iron Sets',
      description: 'Compact forged iron set with controlled launch and responsive feel.',
      price: 1299,
      rating: 4.46,
      reviewCount: 432,
      inventoryStatus: 'In stock',
      fit: 'Skilled ball strikers and low-handicap players who want workability.',
      image: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg',
        alt: 'Golf irons in a bag on a golf course.',
      },
      tags: ['Iron set', 'Forged feel', 'Distance control'],
      actions: [
        {
          id: 'view-p027',
          label: 'View details',
          kind: 'event',
          eventName: 'view_product_details',
          payload: { productId: 'P027' },
        },
      ],
    },
    {
      id: 'P024',
      name: 'NorthLake Forge TourPocket Pro Iron Set',
      brand: 'NorthLake Forge',
      category: 'Iron Sets',
      description: 'Player-focused irons with forged construction and practical forgiveness.',
      price: 1199,
      rating: 4.02,
      reviewCount: 415,
      inventoryStatus: 'Limited stock',
      fit: 'Experienced players who want forged feel with a little launch help.',
      image: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg',
        alt: 'Golf irons in a bag on a golf course.',
      },
      tags: ['Iron set', 'Tour flight', 'Custom fit'],
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

export const productComparisonPayload: CxWidgetPayload = {
  kind: 'product-comparison',
  title: 'Compare recommended products',
  body: 'Product comparison can be rendered from catalog API results or assistant-generated payloads.',
  products: productListPayload.products,
};

export const loyaltyTiersPayload: CxWidgetPayload = {
  kind: 'loyalty-tiers',
  title: 'Golf Pro Rewards',
  body: 'Rewards information can appear in chat, checkout support, or account guidance.',
  tiers: [
    {
      id: 'member',
      name: 'Member',
      annualSpend: '$0+ annual spend',
      earningRate: '1 point per $1',
      redemptionRate: '100 points = $1 off',
      benefits: ['Member pricing', 'Seasonal bonus-point events', 'Order history for returns and warranties'],
    },
    {
      id: 'tour',
      name: 'Tour',
      annualSpend: '$1,000+ annual spend',
      earningRate: '2 points per $1',
      redemptionRate: '100 points = $1 off',
      benefits: ['Early access to select releases', 'Free standard shipping offers', 'Exclusive fitting events'],
      caveats: ['Benefits vary by promotion and region.'],
    },
  ],
  disclosure: 'Rewards should support better decisions, not encourage unnecessary purchases.',
};

export const widgetHostPayload: CxWidgetPayload = {
  kind: 'status-banner',
  title: 'Rendered through cx-widget-host',
  body: 'The host element accepts any widget payload and delegates to the matching custom element.',
  status: 'info',
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
  productCarouselPayload,
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

function gallerySample(payload: CxWidgetPayload, label: string, description: string): CxGallerySample {
  return {
    id: payload.kind,
    label,
    description,
    kind: payload.kind,
    elementName: ELEMENT_NAMES[payload.kind],
    payload,
  };
}

export const componentGallerySamples: CxGallerySample[] = [
  gallerySample(richCardPayload, 'Rich card', 'General-purpose card for recommendations, summaries, and rich assistant output.'),
  gallerySample(choiceListPayload, 'Choice list', 'Structured option picker for guided chat branches.'),
  gallerySample(dataTablePayload, 'Data table', 'Scrollable table for comparison, policy, and checkout details.'),
  gallerySample(formPayload, 'Form panel', 'Simple structured input collection with submit events.'),
  gallerySample(statusBannerPayload, 'Status banner', 'Compact status, success, warning, or error message.'),
  gallerySample(cardOffersPayload, 'Card offers', 'Multiple payment card offers with terms, caveats, and actions.'),
  gallerySample(cardInfoPayload, 'Card info', 'Single-card offer detail view.'),
  gallerySample(cardComparePayload, 'Card compare', 'Side-by-side financing comparison rendered through an inner table widget.'),
  gallerySample(financingOptionsPayload, 'Financing options', 'Installment, card, and pay-later option cards.'),
  gallerySample(paymentPlanPayload, 'Payment plan', 'Estimated monthly plan cards for a purchase amount.'),
  gallerySample(monthlyEstimatePayload, 'Monthly payment estimate', 'Single monthly payment estimate with financing disclosure.'),
  gallerySample(ctaGroupPayload, 'CTA group', 'Action-only response with row or stacked button layout.'),
  gallerySample(productListPayload, 'Product list', 'Catalog cards with images, metadata, offers, and CTAs.'),
  gallerySample(productCarouselPayload, 'Product carousel', 'Carousel-style product recommendations with selected product state.'),
  gallerySample(productOffersPayload, 'Product offers', 'Offers scoped to one product.'),
  gallerySample(productComparisonPayload, 'Product comparison', 'Side-by-side product comparison rendered through an inner table widget.'),
  gallerySample(loyaltyTiersPayload, 'Loyalty tiers', 'Rewards tiers with benefits and caveats.'),
  gallerySample(
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
    'Financing disclosure',
    'Required financing caveats and compliance-oriented disclosure copy.'
  ),
  {
    id: 'widget-host',
    label: 'Widget host',
    description: 'Generic host that accepts a widget payload and renders the matching component internally.',
    kind: 'widget-host',
    elementName: ELEMENT_NAMES['widget-host'],
    payload: widgetHostPayload,
  },
];
