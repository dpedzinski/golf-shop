import { ELEMENT_NAMES, renderCxWidget } from '../src';
import type { CxWidgetPayload } from '../src';
import {
  cardComparePayload,
  cardOffersPayload,
  financingOptionsPayload,
  formPayload,
  monthlyEstimatePayload,
  paymentPlanPayload,
  productCarouselPayload,
  productListPayload,
  productOffersPayload,
  ctaGroupPayload,
} from './fixtures/sample-payloads';

describe('CX web components', () => {
  it('renders direct injection payloads', () => {
    const host = document.createElement('div');
    document.body.append(host);

    const element = renderCxWidget(host, cardOffersPayload);

    expect(element.tagName.toLowerCase()).toBe(ELEMENT_NAMES['card-offers']);
    expect(element.shadowRoot?.textContent).toContain('Available card offers');
    expect(element.shadowRoot?.textContent).toContain('Store Rewards Card');
  });

  it('renders Dialogflow dfPayload before connectedCallback', () => {
    const element = document.createElement(ELEMENT_NAMES['monthly-payment-estimate']);
    element.dfPayload = monthlyEstimatePayload;
    element.dfResponseId = 'response-123';

    document.body.append(element);

    expect(element.shadowRoot?.textContent).toContain('Estimated monthly payment');
    expect(element.shadowRoot?.textContent).toContain('Estimate only');
  });

  it('renders serialized data-payload attributes', () => {
    const element = document.createElement(ELEMENT_NAMES['payment-plan']);
    element.setAttribute('data-payload', JSON.stringify(paymentPlanPayload));

    document.body.append(element);

    expect(element.shadowRoot?.textContent).toContain('3 month plan');
    expect(element.shadowRoot?.textContent).toContain('Estimated monthly');
  });

  it('dispatches cx-action events from financing widgets', () => {
    const element = document.createElement(ELEMENT_NAMES['financing-options']);
    element.payload = financingOptionsPayload;
    document.body.append(element);

    const listener = vi.fn();
    document.addEventListener('cx-action', listener);

    const button = element.shadowRoot?.querySelector('button');
    button?.click();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.action.id).toBe('learn-store-card');
  });

  it('dispatches cx-submit events from form widgets', () => {
    const element = document.createElement(ELEMENT_NAMES['form-panel']);
    element.payload = formPayload;
    document.body.append(element);

    const listener = vi.fn();
    document.addEventListener('cx-submit', listener);
    const email = element.shadowRoot?.querySelector<HTMLInputElement>('input[name="email"]');
    if (email) email.value = 'buyer@example.com';

    element.shadowRoot?.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.values.email).toBe('buyer@example.com');
  });

  it('renders card comparison and all base component kinds', () => {
    const payloads: CxWidgetPayload[] = [
      { kind: 'rich-card', title: 'Rich card', body: 'Body copy' },
      {
        kind: 'choice-list',
        title: 'Choices',
        options: [{ id: 'one', label: 'One' }],
      },
      {
        kind: 'data-table',
        title: 'Table',
        columns: [{ key: 'name', label: 'Name' }],
        rows: [{ name: 'Example' }],
      },
      { kind: 'status-banner', title: 'Status', body: 'Ready', status: 'success' },
      {
        kind: 'financing-disclosure',
        title: 'Disclosure',
        required: true,
        disclosures: ['Subject to credit approval.'],
      },
      cardComparePayload,
    ];

    const host = document.createElement('div');
    document.body.append(host);
    for (const payload of payloads) {
      renderCxWidget(host, payload);
    }

    expect(host.querySelectorAll(':scope > *')).toHaveLength(payloads.length);
    expect(host.textContent ?? '').toBe('');
    const compare = host.querySelector(ELEMENT_NAMES['card-compare']);
    const table = compare?.shadowRoot?.querySelector(ELEMENT_NAMES['data-table']);
    expect(table?.shadowRoot?.textContent).toContain('Annual fee');
  });

  it('renders storefront product and loyalty widgets', () => {
    const host = document.createElement('div');
    document.body.append(host);

    renderCxWidget(host, productListPayload);
    renderCxWidget(host, productCarouselPayload);
    renderCxWidget(host, {
      kind: 'loyalty-tiers',
      title: 'Rewards',
      tiers: [
        {
          id: 'member',
          name: 'Member',
          earningRate: '1 point per $1',
          benefits: ['Member pricing'],
        },
      ],
    });

    const productList = host.querySelector(ELEMENT_NAMES['product-list']);
    const productCarousel = host.querySelector(ELEMENT_NAMES['product-carousel']);
    const loyalty = host.querySelector(ELEMENT_NAMES['loyalty-tiers']);
    expect(productList?.shadowRoot?.textContent).toContain('Strata Ultimate Complete Golf Set');
    expect(productList?.shadowRoot?.textContent).toContain('Check financing');
    expect(productCarousel?.shadowRoot?.textContent).toContain('NorthLake Forge SoftStrike Forged Iron Set');
    expect(productCarousel?.shadowRoot?.querySelector('.cx-carousel-track')).not.toBeNull();
    expect(loyalty?.shadowRoot?.textContent).toContain('Member pricing');
  });

  it('renders product offers and dispatches offer CTAs', () => {
    const element = document.createElement(ELEMENT_NAMES['product-offers']);
    element.payload = productOffersPayload;
    document.body.append(element);

    const listener = vi.fn();
    document.addEventListener('cx-action', listener);

    expect(element.shadowRoot?.textContent).toContain('$25 reward certificate');
    expect(element.shadowRoot?.textContent).toContain('Build bundle');
    element.shadowRoot?.querySelector('button')?.click();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.action.id).toBe('review-card-offer');
  });

  it('renders reusable CTA groups', () => {
    const element = document.createElement(ELEMENT_NAMES['cta-group']);
    element.payload = ctaGroupPayload;
    document.body.append(element);

    const listener = vi.fn();
    document.addEventListener('cx-action', listener);

    expect(element.shadowRoot?.textContent).toContain('Next steps');
    element.shadowRoot?.querySelector('button')?.click();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.action.id).toBe('continue-shopping');
  });
});
