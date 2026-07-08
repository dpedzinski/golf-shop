"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  CesClient,
  McpClient,
  ProductApiClient,
  mountGecxMessenger,
  type CesRunSessionResponse,
  type CesSessionOutput,
  type ProductSummary,
} from "@bread-prototype/gecx-sdk";
import type {
  CxFinancingOptionsPayload,
  CxLoyaltyTiersPayload,
  CxProductSummary,
  CxWidgetPayload,
} from "@bread-prototype/gecx-components";

type RenderCxWidget = typeof import("@bread-prototype/gecx-components")["renderCxWidget"];

type StorefrontConfig = {
  productApiUrl: string;
  mcpServerUrl: string;
  gecx: {
    enabled: boolean;
    projectId: string;
    location: string;
    appId: string;
    deploymentId: string;
    agentId: string;
    languageCode: string;
    chatTitle: string;
    oauthClientId: string;
    mockAssistant: boolean;
  };
};

const fallbackProducts: CxProductSummary[] = [
  {
    id: "P001",
    name: "LaunchMax Carbon Driver",
    brand: "Fairway Supply",
    category: "Drivers",
    description: "Forgiving distance with a higher launch window for newer players.",
    image: {
      src: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=900&q=80",
      alt: "",
    },
    price: 449.99,
    rating: 4.7,
    reviewCount: 128,
    inventoryStatus: "In stock",
    fit: "Beginner to intermediate golfers who want help launching the ball.",
    tags: ["High launch", "Forgiving"],
  },
  {
    id: "P002",
    name: "FlightDeck 3-Wood",
    brand: "Fairway Supply",
    category: "Fairway woods",
    description: "Easy-launch fairway wood for tee shots and longer approach gaps.",
    image: {
      src: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=900&q=80",
      alt: "",
    },
    price: 299.99,
    rating: 4.5,
    reviewCount: 84,
    inventoryStatus: "Limited stock",
    fit: "Players who want a reliable second option off the tee.",
    tags: ["Easy launch", "Versatile"],
  },
  {
    id: "P003",
    name: "Dryline Waterproof Shoes",
    brand: "Fairway Supply",
    category: "Footwear",
    description: "Spikeless traction and waterproof comfort for walking rounds.",
    image: {
      src: "https://images.unsplash.com/photo-1622396481324-4f7b663cd3a5?auto=format&fit=crop&w=900&q=80",
      alt: "",
    },
    price: 129.99,
    rating: 4.6,
    reviewCount: 210,
    inventoryStatus: "In stock",
    fit: "Golfers who walk often and need all-weather grip.",
    tags: ["Waterproof", "Walk-ready"],
  },
];

const financingPayload: CxFinancingOptionsPayload = {
  kind: "financing-options",
  title: "Financing and payment options",
  body: "Compare payment paths before checkout. Terms are examples only and final offers depend on eligibility.",
  options: [
    {
      id: "store-card",
      type: "store-card",
      name: "Store Rewards Card",
      summary: "Promotional APR may be available on qualifying purchases.",
      apr: "0% promo APR on eligible purchases, then variable APR",
      term: "Commonly 6 to 12 months",
      fees: "Late or returned payment fees may apply",
      eligibilityNotes: "Subject to credit approval and offer terms.",
    },
    {
      id: "installment",
      type: "installment",
      name: "Installment plan",
      summary: "Split eligible orders into fixed payments shown at checkout.",
      apr: "Provider and eligibility dependent",
      term: "3, 6, or 12 months",
      fees: "APR and fees vary by provider.",
      eligibilityNotes: "Subject to provider eligibility checks.",
    },
  ],
  disclosure:
    "Do not treat payment examples as approval, final pricing, financial advice, or a guarantee of savings.",
};

const loyaltyPayload: CxLoyaltyTiersPayload = {
  kind: "loyalty-tiers",
  title: "Golf Pro Rewards",
  body: "Rewards data can be surfaced in cards, chat responses, or checkout guidance.",
  tiers: [
    {
      id: "member",
      name: "Member",
      annualSpend: "$0+ annual spend",
      earningRate: "1 point per $1",
      redemptionRate: "100 points = $1 off",
      benefits: ["Member pricing", "Seasonal bonus-point events", "Order history for returns and warranties"],
    },
    {
      id: "tour",
      name: "Tour",
      annualSpend: "$1,000+ annual spend",
      earningRate: "2 points per $1",
      redemptionRate: "100 points = $1 off",
      benefits: ["Early access to select releases", "Free standard shipping offers", "Exclusive fitting events"],
      caveats: ["Benefits vary by promotion and region."],
    },
  ],
  disclosure: "Rewards should support better decisions, not encourage unnecessary purchases.",
};

export function StorefrontExperience({ config }: { config: StorefrontConfig }) {
  const [products, setProducts] = useState<CxProductSummary[]>(fallbackProducts);
  const [apiStatus, setApiStatus] = useState(config.productApiUrl ? "Connecting to product API" : "Using local demo data");
  const [mcpTools, setMcpTools] = useState<string[]>([]);
  const [renderCxWidget, setRenderCxWidget] = useState<RenderCxWidget | null>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const financeRef = useRef<HTMLDivElement>(null);
  const loyaltyRef = useRef<HTMLDivElement>(null);
  const messengerRef = useRef<HTMLDivElement>(null);
  const focusChatRef = useRef<(() => void) | null>(null);

  const widgetReady =
    config.gecx.enabled && config.gecx.projectId && config.gecx.location && config.gecx.agentId;
  const cesChatReady = Boolean(widgetReady && config.gecx.appId && (config.gecx.deploymentId || config.gecx.mockAssistant));

  const registerChatFocus = useCallback((focusChat: (() => void) | null) => {
    focusChatRef.current = focusChat;
  }, []);

  const startChat = useCallback(() => {
    focusChatRef.current?.();
  }, []);

  const comparisonPayload = useMemo<CxWidgetPayload>(
    () => ({
      kind: "product-comparison",
      title: "Compare the short list",
      body: "The same component model can render direct API results or rich custom payloads from the assistant.",
      products: products.slice(0, 3),
    }),
    [products]
  );

  useEffect(() => {
    let active = true;

    import("@bread-prototype/gecx-components").then((module) => {
      if (!active) return;
      module.defineCxComponents();
      setRenderCxWidget(() => module.renderCxWidget);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!config.productApiUrl) return;
    const client = new ProductApiClient({ baseUrl: config.productApiUrl });
    let active = true;

    client
      .searchProducts({ limit: 3 })
      .then((response) => {
        if (!active) return;
        const mapped = response.products
          .map(mapApiProduct)
          .filter((product): product is CxProductSummary => product !== null);
        if (mapped.length) {
          setProducts(mapped);
          setApiStatus(`Loaded ${mapped.length} products from the product API`);
        } else {
          setApiStatus("Product API returned no products; showing demo data");
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setApiStatus(`Product API unavailable; showing demo data (${String(error)})`);
      });

    return () => {
      active = false;
    };
  }, [config.productApiUrl]);

  useEffect(() => {
    if (!config.mcpServerUrl) return;
    const client = new McpClient({ endpoint: config.mcpServerUrl });
    let active = true;

    client
      .listTools()
      .then((tools) => {
        if (active) setMcpTools(tools.map((tool) => tool.name));
      })
      .catch(() => {
        if (active) setMcpTools([]);
      });

    return () => {
      active = false;
    };
  }, [config.mcpServerUrl]);

  useEffect(() => {
    if (!renderCxWidget) return;
    renderWidget(renderCxWidget, productRef.current, {
      kind: "product-list",
      title: "Featured gear",
      body: apiStatus,
      products,
    });
    renderWidget(renderCxWidget, compareRef.current, comparisonPayload);
    renderWidget(renderCxWidget, financeRef.current, financingPayload);
    renderWidget(renderCxWidget, loyaltyRef.current, loyaltyPayload);
  }, [apiStatus, comparisonPayload, products, renderCxWidget]);

  useEffect(() => {
    if (!widgetReady || cesChatReady || !messengerRef.current) return;
    const mounted = mountGecxMessenger({
      projectId: config.gecx.projectId,
      location: config.gecx.location,
      agentId: config.gecx.agentId,
      languageCode: config.gecx.languageCode,
      chatTitle: config.gecx.chatTitle,
      oauthClientId: config.gecx.oauthClientId || undefined,
      container: messengerRef.current,
    });

    return () => {
      mounted.element.remove();
    };
  }, [cesChatReady, config.gecx, widgetReady]);

  return (
    <>
      <section className="section" id="shop">
        <div className="section-heading">
          <p className="eyebrow">Featured gear</p>
          <h2>Reusable components backed by the product API</h2>
        </div>
        <div ref={productRef} />
      </section>

      <section className="band" id="compare">
        <div className="section-heading">
          <p className="eyebrow">Comparison flow</p>
          <h2>Products, recommendations, and policies use the same component contract.</h2>
        </div>
        <div ref={compareRef} />
      </section>

      <section className="section split" id="offers">
        <div className="offer-panel">
          <p className="eyebrow">Purchase support</p>
          <h2>Financing and loyalty stay visible before checkout.</h2>
          <p>
            The SDK can read serverless endpoints directly, while the GECX assistant can call
            the MCP toolset for richer guided shopping conversations.
          </p>
          <div className="mcp-status">
            <span>MCP tools</span>
            <strong>{mcpTools.length ? mcpTools.join(", ") : config.mcpServerUrl ? "Not available yet" : "Configure VITE_MCP_SERVER_URL"}</strong>
          </div>
        </div>
        <div className="stacked-widgets">
          <div ref={financeRef} />
          <div ref={loyaltyRef} />
        </div>
      </section>

      <section className="assistant-section" id="assistant">
        <div className="assistant-intro-card">
          <span className="assistant-beta-pill">Beta</span>
          <p className="eyebrow">Connected customer experience</p>
          <h2>Ask Fairway AI</h2>
          <p>
            Get gear recommendations, compare products, and find purchase support in seconds.
          </p>
          <ul className="assistant-proof-list" aria-label="Fairway AI can help with">
            <li>Club guidance matched to budget, miss, and skill level</li>
            <li>Side-by-side product comparisons from the live catalog</li>
            <li>Shipping, returns, rewards, and checkout answers</li>
          </ul>
          <button className="assistant-start-button" disabled={!cesChatReady} onClick={startChat} type="button">
            Start chat
          </button>
        </div>
        {!widgetReady ? (
          <div className="config-panel">
            <h3>GECX widget configuration needed</h3>
            <p>
              Set <code>VITE_GECX_PROJECT_ID</code>, <code>VITE_GECX_LOCATION</code>, and{" "}
              <code>VITE_GECX_AGENT_ID</code> after Terraform finishes.
            </p>
          </div>
        ) : cesChatReady ? (
          <CesChat config={config.gecx} registerFocus={registerChatFocus} renderCxWidget={renderCxWidget} />
        ) : (
          <div ref={messengerRef} data-testid="gecx-messenger-container" />
        )}
      </section>
    </>
  );
}

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  widgets?: CxWidgetPayload[];
};

const promptChips = ["Find forgiving irons", "Compare iron sets", "Shipping options", "Financing plans"];

function CesChat({
  config,
  registerFocus,
  renderCxWidget,
}: {
  config: StorefrontConfig["gecx"];
  registerFocus: (focusChat: (() => void) | null) => void;
  renderCxWidget: RenderCxWidget | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [failedPrompt, setFailedPrompt] = useState("");
  const [status, setStatus] = useState("Ready");
  const [sessionId] = useState(() => `web-${crypto.randomUUID()}`);
  const logRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const client = useMemo(() => {
    if (config.mockAssistant) return null;
    return new CesClient({
      projectId: config.projectId,
      location: config.location,
      appId: config.appId,
      deploymentId: config.deploymentId,
    });
  }, [config.appId, config.deploymentId, config.location, config.mockAssistant, config.projectId]);

  const focusInput = useCallback(() => {
    textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    textareaRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    registerFocus(focusInput);
    return () => registerFocus(null);
  }, [focusInput, registerFocus]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [error, messages, status]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    await sendMessage(text, true);
  }

  async function sendMessage(text: string, includeUserMessage: boolean) {
    setDraft("");
    setError("");
    setFailedPrompt("");
    setStatus("Thinking");
    if (includeUserMessage) {
      setMessages((current) => [...current, { role: "user", text }]);
    }

    try {
      const response = config.mockAssistant
        ? mockAssistantResponse(text)
        : await client!.sendMessage({
            sessionId,
            text,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
      appendAssistantResponse(response, undefined, text);
    } catch (error) {
      const message = String(error);
      if (!config.mockAssistant && isCesQuotaError(message)) {
        appendAssistantResponse(mockAssistantResponse(text), undefined, text);
        return;
      }
      setError(`The assistant request failed: ${String(error)}`);
      setFailedPrompt(text);
      setStatus("Error");
    }
  }

  function appendAssistantResponse(response: CesRunSessionResponse, prefix?: string, prompt?: string) {
    let widgets = extractWidgetPayloads(response.outputs);
    let responseText =
      response.outputs
        ?.map((output) => output.text)
        .filter((value): value is string => Boolean(value))
        .join("\n\n") || (widgets.length ? "" : "I did not receive a text response.");
    if (!widgets.length && prompt && isExperiencedIronPrompt(prompt)) {
      const fallbackResponse = mockAssistantResponse(prompt);
      const fallbackWidgets = extractWidgetPayloads(fallbackResponse.outputs);
      if (fallbackWidgets.length) {
        const fallbackText = fallbackResponse.outputs
          ?.map((output) => output.text)
          .filter((value): value is string => Boolean(value))
          .join("\n\n");
        widgets = fallbackWidgets;
        responseText =
          !responseText || /having trouble|try again|did not receive/i.test(responseText)
            ? fallbackText || responseText
            : `${responseText}\n\nHere are product detail cards from the current catalog.`;
      }
    }
    const answer = [prefix, responseText].filter(Boolean).join("\n\n");
    setMessages((current) => [...current, { role: "assistant", text: answer, widgets }]);
    setStatus("Ready");
  }

  function selectPrompt(prompt: string) {
    setDraft(prompt);
    requestAnimationFrame(focusInput);
  }

  function retryMessage() {
    if (failedPrompt) {
      void sendMessage(failedPrompt, false);
    }
  }

  const isThinking = status === "Thinking";
  const statusLabel = status === "Thinking" ? "Thinking" : status === "Error" ? "Needs attention" : "Ready";

  return (
    <div className="ces-chat" data-testid="ces-chat" id="assistant-chat">
      <div className="ces-chat-header">
        <div>
          <span className="assistant-beta-pill">Beta</span>
          <strong>Fairway AI</strong>
          <p>{config.chatTitle}</p>
        </div>
        <span className={`ces-chat-status ${status.toLowerCase()}`}>
          <span aria-hidden="true" />
          {statusLabel}
        </span>
      </div>
      <div className="ces-chat-log" aria-live="polite" ref={logRef}>
        {messages.length ? (
          messages.map((message, index) => (
            <div
              className={`ces-chat-message ${message.role}${message.widgets?.length ? " has-widgets" : ""}`}
              key={`${message.role}-${index}`}
            >
              <span>{message.role === "user" ? "You" : "AI"}</span>
              {message.text ? <div className="ces-chat-message-text">{renderChatText(message.text)}</div> : null}
              {message.widgets?.length ? (
                <div className="ces-chat-widgets" data-testid="ces-chat-widgets">
                  {message.widgets.map((payload, widgetIndex) => (
                    <ChatWidgetRenderer
                      key={`${message.role}-${index}-${payload.kind}-${widgetIndex}`}
                      payload={payload}
                      renderCxWidget={renderCxWidget}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="ces-chat-welcome">
            <span className="assistant-beta-pill">Beta</span>
            <h3>What are you shopping for today?</h3>
            <p>Start with a goal and Fairway AI can narrow products, policies, and purchase options.</p>
            <div className="ces-chat-prompts" aria-label="Suggested prompts">
              {promptChips.map((prompt) => (
                <button key={prompt} onClick={() => selectPrompt(prompt)} type="button">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {isThinking ? (
          <div className="ces-chat-typing" role="status">
            <span>AI is working</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </div>
        ) : null}
        {error ? (
          <div className="ces-chat-error">
            <span>Needs attention</span>
            <p>{error}</p>
            <button disabled={!failedPrompt || isThinking} onClick={retryMessage} type="button">
              Try again
            </button>
          </div>
        ) : null}
      </div>
      <form className="ces-chat-form" onSubmit={submitMessage}>
        <div className="ces-chat-prompts compact" aria-label="Suggested prompts">
          {promptChips.map((prompt) => (
            <button key={prompt} disabled={isThinking} onClick={() => selectPrompt(prompt)} type="button">
              {prompt}
            </button>
          ))}
        </div>
        <textarea
          aria-label="Message Golf Store Assistant"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about irons, shipping, financing, or rewards"
          ref={textareaRef}
          rows={3}
          value={draft}
        />
        <button disabled={!draft.trim() || isThinking} type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

function ChatWidgetRenderer({
  payload,
  renderCxWidget,
}: {
  payload: CxWidgetPayload;
  renderCxWidget: RenderCxWidget | null;
}) {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!renderCxWidget || !targetRef.current) return;
    renderWidget(renderCxWidget, targetRef.current, payload);
  }, [payload, renderCxWidget]);

  return <div className="ces-chat-widget" data-widget-kind={payload.kind} ref={targetRef} />;
}

function renderChatText(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, lineIndex) => (
      <p key={`${line}-${lineIndex}`}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={`${part}-${partIndex}`}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    ));
}

function renderWidget(
  renderCxWidget: RenderCxWidget,
  target: HTMLElement | null,
  payload: CxWidgetPayload
): void {
  if (!target) return;
  target.replaceChildren();
  renderCxWidget(target, payload);
}

const widgetKinds = new Set([
  "rich-card",
  "choice-list",
  "data-table",
  "form-panel",
  "status-banner",
  "card-offers",
  "card-info",
  "card-compare",
  "financing-options",
  "payment-plan",
  "monthly-payment-estimate",
  "financing-disclosure",
  "cta-group",
  "product-list",
  "product-carousel",
  "product-offers",
  "product-comparison",
  "loyalty-tiers",
]);

function extractWidgetPayloads(outputs: CesSessionOutput[] | undefined): CxWidgetPayload[] {
  return outputs?.flatMap((output) => normalizeWidgetPayloads(output.payload)) ?? [];
}

function normalizeWidgetPayloads(value: unknown, depth = 0): CxWidgetPayload[] {
  if (depth > 4 || value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap((item) => normalizeWidgetPayloads(item, depth + 1));
  if (!isRecord(value)) return [];
  if (isWidgetPayload(value)) return [value as unknown as CxWidgetPayload];

  const customTemplatePayload = value.type === "custom_template" ? value.payload : undefined;
  const nested = [
    customTemplatePayload,
    value.payload,
    value.widget,
    value.widgets,
    value.richContent,
    value.rich_content,
    value.data,
    value.content,
  ];
  const nestedWidgets = nested.flatMap((item) => normalizeWidgetPayloads(item, depth + 1));
  if (nestedWidgets.length) return nestedWidgets;

  const products = normalizeProducts(value.products);
  if (products.length) {
    return [
      {
        kind: "product-carousel",
        title: stringValue(value.title) ?? "Product details",
        body: stringValue(value.body ?? value.message),
        products,
        emptyMessage: "No product details are currently available.",
      },
    ];
  }

  const product = isRecord(value.product) ? mapApiProduct(value.product as ProductSummary) : null;
  if (product) {
    return [
      {
        kind: "product-carousel",
        title: stringValue(value.title) ?? product.name,
        body: stringValue(value.body ?? value.message),
        products: [product],
        selectedProductId: product.id,
      },
    ];
  }

  return [];
}

function isWidgetPayload(value: unknown): value is CxWidgetPayload {
  return isRecord(value) && typeof value.kind === "string" && widgetKinds.has(value.kind);
}

function isCesQuotaError(message: string): boolean {
  return /\b429\b/.test(message) || /RESOURCE_EXHAUSTED/i.test(message) || /quota/i.test(message);
}

function isExperiencedIronPrompt(text: string): boolean {
  return /iron/i.test(text) && /experienced|advanced|low.?handicap|skilled/i.test(text);
}

function normalizeProducts(value: unknown): CxProductSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (isRecord(item) ? mapApiProduct(item as ProductSummary) : null))
    .filter((product): product is CxProductSummary => product !== null);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mockAssistantResponse(text: string): CesRunSessionResponse {
  if (/experienced|advanced|low.?handicap|skilled/i.test(text) && /iron/i.test(text)) {
    return {
      outputs: [
        {
          text: "Here are iron sets that fit experienced players who want compact control and forged feel.",
          payload: {
            kind: "product-carousel",
            title: "Irons for experienced players",
            body: "Product detail cards from the catalog.",
            selectedProductId: "P027",
            products: [
              {
                id: "P027",
                name: "NorthLake Forge SoftStrike Forged Iron Set",
                brand: "NorthLake Forge",
                category: "Iron Sets",
                description: "Compact forged iron set for skilled ball strikers who want controlled launch.",
                image: {
                  src: "https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg",
                  alt: "Golf irons in a bag on a golf course.",
                },
                price: 1299,
                rating: 4.46,
                reviewCount: 432,
                inventoryStatus: "In stock",
                fit: "Experienced players and low-handicap ball strikers.",
                tags: ["Iron set", "Forged feel", "Distance control"],
              },
              {
                id: "P024",
                name: "NorthLake Forge TourPocket Pro Iron Set",
                brand: "NorthLake Forge",
                category: "Iron Sets",
                description: "Player-focused irons with forged construction and practical forgiveness.",
                image: {
                  src: "https://upload.wikimedia.org/wikipedia/commons/0/03/Golf_clubs.jpg",
                  alt: "Golf irons in a bag on a golf course.",
                },
                price: 1199,
                rating: 4.02,
                reviewCount: 415,
                inventoryStatus: "Limited stock",
                fit: "Confident iron players who want tour flight with a little launch help.",
                tags: ["Iron set", "Tour flight", "Custom fit"],
              },
            ],
          },
        },
      ],
    };
  }

  if (/iron/i.test(text)) {
    return {
      outputs: [
        {
          text: "I can help you shop for irons. Are these for a newer player, an improving player, or an experienced player?",
        },
      ],
    };
  }

  return {
    outputs: [
      {
        text: "Tell me what golf gear you are shopping for, plus skill level and any budget or fit preferences.",
      },
    ],
  };
}

function mapApiProduct(product: ProductSummary): CxProductSummary | null {
  if (!isRecord(product)) return null;
  const id = String(product.product_id ?? product.id ?? "");
  const name = String(product.product_name ?? product.name ?? "");
  if (!id || !name) return null;
  const imageSrc =
    stringValue(product.image_url ?? product.imageUrl) ??
    firstString(product.image_uris) ??
    firstString(product.imageUris);
  const tags = [
    ...stringArray(product.tags),
    stringValue(product.parent_category),
    stringValue(product.handicap_range),
  ].filter((value): value is string => Boolean(value));

  return {
    id,
    name,
    brand: stringValue(product.brand_name ?? product.brand),
    category: stringValue(product.category_name ?? product.parent_category ?? product.category ?? product.product_category),
    description: stringValue(product.short_description ?? product.description ?? product.long_description),
    image: imageSrc
      ? {
          src: imageSrc,
          alt: stringValue(product.image_alt ?? product.imageAlt) ?? `${name} product image`,
        }
      : undefined,
    price: priceValue(product.min_current_sale_price ?? product.current_sale_price ?? product.price),
    rating: numberValue(product.average_rating),
    reviewCount: numberValue(product.review_count),
    inventoryStatus: stringValue(product.inventory_status ?? product.availability) ?? stockLabel(product.total_stock_quantity),
    fit: stringValue(product.target_player_profile ?? product.handicap_range ?? product.best_for ?? product.fit),
    tags: tags.length ? tags : undefined,
    actions: [
      {
        id: `view-${id}`,
        label: "View details",
        kind: "event",
        eventName: "view_product_details",
        payload: { productId: id },
      },
    ],
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

function firstString(value: unknown): string | undefined {
  return stringArray(value)[0];
}

function priceValue(value: unknown): string | number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return stringValue(value);
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stockLabel(value: unknown): string | undefined {
  const quantity = numberValue(value);
  if (quantity === undefined) return undefined;
  if (quantity <= 0) return "Out of stock";
  if (quantity < 10) return "Limited stock";
  return "In stock";
}
