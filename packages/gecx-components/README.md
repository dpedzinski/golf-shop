# GECX Components

TypeScript web components for GECX storefront widgets, Dialogflow CX Messenger custom templates, and host-page web injection.

## Install and Build

```bash
npm install
npm run build
```

The library build writes ESM and UMD bundles to `dist/`.

## Direct Web Injection

```html
<script type="module">
  import { defineCxComponents, renderCxWidget } from './dist/gecx-components.js';

  defineCxComponents();

  renderCxWidget('#target', {
    kind: 'card-offers',
    title: 'Available card offers',
    offers: [
      {
        id: 'store-card',
        issuer: 'Example Bank',
        name: 'Store Rewards Card',
        headlineOffer: '0% intro APR for 12 months on qualifying purchases',
        introApr: '0% for 12 months',
        ongoingApr: '19.99% to 29.99% variable',
        annualFee: '$0',
        rewards: '5% back in store rewards',
        eligibilityNotes: 'Subject to credit approval.',
        termsUrl: 'https://example.com/terms'
      }
    ],
    disclosure: 'Terms apply. Approval is not guaranteed.'
  });
</script>
```

## Dialogflow CX Messenger Custom Template

Register the custom element on the page that hosts `df-messenger`. The custom element name must match the `name` field in the rich response.

```ts
import { defineCxComponents, toCustomTemplateForPayload } from './dist/gecx-components.js';

defineCxComponents();

const payload = {
  kind: 'monthly-payment-estimate',
  title: 'Estimated monthly payment',
  principal: 899,
  months: 12,
  apr: 0,
  disclosure: 'Estimate only. This is not an approval decision.'
};

const richResponse = toCustomTemplateForPayload(payload);
// {
//   richContent: [[
//     { type: 'custom_template', name: 'cx-monthly-payment-estimate', payload }
//   ]]
// }
```

Dialogflow CX Messenger passes the response payload to the element as `dfPayload` and the response ID as `dfResponseId`. These components also accept direct JS assignment through `element.payload` and JSON through `data-payload`.

## Client-Side Tool Bridge

For playbook tools that call a client-side function to render rich content:

```ts
import { defineCxComponents, registerDialogflowBridge } from './dist/gecx-components.js';

defineCxComponents();

const dfMessenger = document.querySelector('df-messenger');

registerDialogflowBridge(dfMessenger, {
  toolId: 'projects/PROJECT_ID/locations/LOCATION/agents/AGENT_ID/tools/TOOL_ID',
  functionName: 'addRichContent',
  onAction: (detail) => {
    console.log('Widget action', detail.action.id);
  }
});
```

## Components

- `cx-rich-card`
- `cx-choice-list`
- `cx-data-table`
- `cx-form-panel`
- `cx-status-banner`
- `cx-widget-host`
- `cx-card-offers`
- `cx-card-info`
- `cx-card-compare`
- `cx-financing-options`
- `cx-payment-plan`
- `cx-monthly-payment-estimate`
- `cx-financing-disclosure`
- `cx-cta-group`
- `cx-product-list`
- `cx-product-offers`
- `cx-product-comparison`
- `cx-loyalty-tiers`

All components dispatch bubbling, composed events:

- `cx-action` for links, choices, and CTA buttons
- `cx-submit` for form submissions
- `cx-error` for render failures

Product catalog cards support multiple CTAs through `actions` and compact promo/financing blocks through `offers`. Use `cx-product-offers` when the agent needs to show offers for one product, and `cx-cta-group` when the response is primarily a set of next-step actions.

## Safety Notes

The components render untrusted values as text nodes, validate public URLs before use, and use shadow DOM for containment. The fallback helper `toRichContentFallback()` may emit Dialogflow's limited `html` response type for tables; it escapes all interpolated values before building the HTML string.
