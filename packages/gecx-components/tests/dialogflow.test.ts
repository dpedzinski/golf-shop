import {
  registerDialogflowBridge,
  toCustomTemplate,
  toCustomTemplateForPayload,
  toRichContentFallback,
} from '../src';
import { cardOffersPayload, ctaGroupPayload, formPayload, productListPayload, productOffersPayload } from '../demo/sample-payloads';
import type { CxFormPanelPayload, DialogflowMessengerLike } from '../src';

describe('Dialogflow helpers', () => {
  it('creates custom_template rich content for explicit names', () => {
    const result = toCustomTemplate('cx-card-offers', cardOffersPayload);

    expect(result.richContent[0][0]).toMatchObject({
      type: 'custom_template',
      name: 'cx-card-offers',
      payload: cardOffersPayload,
    });
  });

  it('creates custom_template rich content from widget payload kind', () => {
    const result = toCustomTemplateForPayload(cardOffersPayload);

    expect(result.richContent[0][0]).toMatchObject({
      type: 'custom_template',
      name: 'cx-card-offers',
    });
  });

  it('generates safe fallback rich content', () => {
    const unsafeForm: CxFormPanelPayload = {
      ...(formPayload as CxFormPanelPayload),
      fields: [{ id: 'name', label: '<script>alert(1)</script>', type: 'text' }],
    };
    const result = toRichContentFallback(unsafeForm);

    expect(result.richContent[0][0]).toMatchObject({ type: 'description' });
    expect(JSON.stringify(result)).not.toContain('<script>');
  });

  it('registers a client-side Dialogflow rich content bridge', async () => {
    const renderCustomCard = vi.fn();
    const registerClientSideFunction = vi.fn();
    const dfMessenger = document.createElement('df-messenger') as DialogflowMessengerLike;
    dfMessenger.renderCustomCard = renderCustomCard;
    dfMessenger.registerClientSideFunction = registerClientSideFunction;

    const bridge = registerDialogflowBridge(dfMessenger, {
      toolId: 'projects/p/locations/l/agents/a/tools/t',
      functionName: 'addRichContent',
    });
    const richContent = toRichContentFallback(cardOffersPayload);
    const result = await bridge(richContent);

    expect(registerClientSideFunction).toHaveBeenCalledWith(
      'projects/p/locations/l/agents/a/tools/t',
      'addRichContent',
      bridge
    );
    expect(renderCustomCard).toHaveBeenCalledWith(richContent.richContent);
    expect(result).toEqual({ status: 'OK', reason: null });
  });

  it('generates fallback rich content for product catalog CTAs and offers', () => {
    const productList = toRichContentFallback(productListPayload);
    const productOffers = toRichContentFallback(productOffersPayload);
    const ctaGroup = toRichContentFallback(ctaGroupPayload);

    expect(JSON.stringify(productList)).toContain('Strata Ultimate Complete Golf Set');
    expect(JSON.stringify(productList)).toContain('Check financing');
    expect(JSON.stringify(productOffers)).toContain('Review card offer');
    expect(JSON.stringify(ctaGroup)).toContain('Compare selected');
  });
});
