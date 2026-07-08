"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  CesClient,
  McpClient,
  ProductApiClient,
  mountGecxMessenger,
  type ProductSummary,
} from "@bread-prototype/gecx-sdk";
import type {
  CxFinancingOptionsPayload,
  CxLoyaltyTiersPayload,
  CxProductSummary,
  CxWidgetPayload,
} from "@bread-prototype/gecx-components";

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
  const [renderCxWidget, setRenderCxWidget] =
    useState<typeof import("@bread-prototype/gecx-components")["renderCxWidget"] | null>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const financeRef = useRef<HTMLDivElement>(null);
  const loyaltyRef = useRef<HTMLDivElement>(null);
  const messengerRef = useRef<HTMLDivElement>(null);

  const widgetReady =
    config.gecx.enabled && config.gecx.projectId && config.gecx.location && config.gecx.agentId;
  const cesChatReady = Boolean(widgetReady && config.gecx.appId && config.gecx.deploymentId);

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
        <div>
          <p className="eyebrow">Connected customer experience</p>
          <h2>Golf Store Assistant</h2>
          <p>
            Use the chat surface for product guidance, comparisons, shipping questions,
            returns, warranties, financing, rewards, and checkout support.
          </p>
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
          <CesChat config={config.gecx} />
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
};

function CesChat({ config }: { config: StorefrontConfig["gecx"] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Ready");
  const [sessionId] = useState(() => `web-${crypto.randomUUID()}`);

  const client = useMemo(
    () =>
      new CesClient({
        projectId: config.projectId,
        location: config.location,
        appId: config.appId,
        deploymentId: config.deploymentId,
      }),
    [config.appId, config.deploymentId, config.location, config.projectId]
  );

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setDraft("");
    setStatus("Thinking");
    setMessages((current) => [...current, { role: "user", text }]);

    try {
      const response = await client.sendMessage({
        sessionId,
        text,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      const answer =
        response.outputs
          ?.map((output) => output.text)
          .filter((value): value is string => Boolean(value))
          .join("\n\n") || "I did not receive a text response.";
      setMessages((current) => [...current, { role: "assistant", text: answer }]);
      setStatus("Ready");
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: `The assistant request failed: ${String(error)}` },
      ]);
      setStatus("Error");
    }
  }

  return (
    <div className="ces-chat" data-testid="ces-chat">
      <div className="ces-chat-header">
        <strong>{config.chatTitle}</strong>
        <span>{status}</span>
      </div>
      <div className="ces-chat-log" aria-live="polite">
        {messages.length ? (
          messages.map((message, index) => (
            <div className={`ces-chat-message ${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === "user" ? "You" : "Assistant"}</span>
              <p>{message.text}</p>
            </div>
          ))
        ) : (
          <div className="ces-chat-message assistant">
            <span>Assistant</span>
            <p>What are you shopping for today?</p>
          </div>
        )}
      </div>
      <form className="ces-chat-form" onSubmit={submitMessage}>
        <textarea
          aria-label="Message Golf Store Assistant"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about irons, shipping, financing, or rewards"
          rows={3}
          value={draft}
        />
        <button disabled={!draft.trim() || status === "Thinking"} type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

function renderWidget(
  renderCxWidget: typeof import("@bread-prototype/gecx-components")["renderCxWidget"],
  target: HTMLElement | null,
  payload: CxWidgetPayload
): void {
  if (!target) return;
  target.replaceChildren();
  renderCxWidget(target, payload);
}

function mapApiProduct(product: ProductSummary): CxProductSummary | null {
  const id = String(product.product_id ?? product.id ?? "");
  const name = String(product.product_name ?? product.name ?? "");
  if (!id || !name) return null;
  return {
    id,
    name,
    brand: stringValue(product.brand_name),
    category: stringValue(product.category_name ?? product.parent_category),
    description: stringValue(product.short_description ?? product.description),
    price: numberValue(product.min_current_sale_price ?? product.current_sale_price),
    rating: numberValue(product.average_rating),
    reviewCount: numberValue(product.review_count),
    inventoryStatus: stringValue(product.inventory_status) ?? stockLabel(product.total_stock_quantity),
    fit: stringValue(product.target_player_profile ?? product.handicap_range),
    tags: [stringValue(product.parent_category), stringValue(product.handicap_range)].filter(
      (value): value is string => Boolean(value)
    ),
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
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
