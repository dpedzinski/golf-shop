import Image from "next/image";
import Script from "next/script";

const products = [
  {
    name: "LaunchMax Carbon Driver",
    category: "Drivers",
    price: "$449.99",
    tag: "Forgiving distance",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "FlightDeck 3-Wood",
    category: "Fairway woods",
    price: "$299.99",
    tag: "Easy launch",
    image:
      "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Dryline Waterproof Shoes",
    category: "Footwear",
    price: "$129.99",
    tag: "Walk-ready comfort",
    image:
      "https://images.unsplash.com/photo-1622396481324-4f7b663cd3a5?auto=format&fit=crop&w=900&q=80",
  },
];

const supportTopics = [
  "Beginner club fitting",
  "Ball and wedge comparisons",
  "Shipping and returns",
  "Card offers and installment plans",
  "Rewards and member pricing",
];

function envValue(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export default function Home() {
  const assistant = {
    enabled: envValue("GECX_ENABLE_WIDGET", "true") !== "false",
    projectId: envValue("GECX_PROJECT_ID"),
    location: envValue("GECX_LOCATION", "global"),
    agentId: envValue("GECX_AGENT_ID", "golf-store-assistant"),
    languageCode: envValue("GECX_LANGUAGE_CODE", "en"),
    title: envValue("GECX_CHAT_TITLE", "Golf Store Assistant"),
    oauthClientId: envValue("GECX_OAUTH_CLIENT_ID"),
  };
  const widgetReady =
    assistant.enabled && assistant.projectId && assistant.location && assistant.agentId;

  return (
    <main>
      <section className="hero">
        <nav className="nav" aria-label="Primary">
          <a className="brand" href="#top" aria-label="Fairway Supply home">
            <span className="brand-mark">FS</span>
            <span>Fairway Supply</span>
          </a>
          <div className="nav-links">
            <a href="#shop">Shop</a>
            <a href="#fit">Fit guide</a>
            <a href="#offers">Offers</a>
            <a href="#assistant">Assistant</a>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Golf gear matched to your swing</p>
            <h1>Find the right clubs, balls, shoes, and offers without the pressure.</h1>
            <p className="lede">
              Browse a curated golf shop backed by a customer-service assistant that can
              compare products, explain specs, check purchase policies, and walk through
              financing or rewards tradeoffs.
            </p>
            <div className="actions">
              <a className="primary-action" href="#shop">
                Shop picks
              </a>
              <a className="secondary-action" href="#assistant">
                Ask the assistant
              </a>
            </div>
          </div>
          <div className="hero-media" aria-label="Golfer selecting a club at sunset">
            <Image
              src="https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1200&q=82"
              alt=""
              width={1200}
              height={1500}
              priority
              sizes="(max-width: 880px) 100vw, 52vw"
              unoptimized
            />
            <div className="hero-note">
              <strong>Fit-first advice</strong>
              <span>Skill level, budget, goals, and playing style all matter.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="shop">
        <div className="section-heading">
          <p className="eyebrow">Featured gear</p>
          <h2>Built for real shopping decisions</h2>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <Image
                src={product.image}
                alt=""
                width={900}
                height={675}
                sizes="(max-width: 880px) 100vw, 33vw"
                unoptimized
              />
              <div>
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <p>{product.tag}</p>
                <strong>{product.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="band" id="fit">
        <div>
          <p className="eyebrow">A better fit workflow</p>
          <h2>Start with the golfer, then the gear.</h2>
        </div>
        <div className="fit-grid">
          <div>
            <span>01</span>
            <h3>Skill and misses</h3>
            <p>Beginner forgiveness, lower-spin control, draw bias, and launch help are treated differently.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Budget and tradeoffs</h3>
            <p>The assistant can compare entry, midrange, and premium options without pushing the highest price.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Policies and payment</h3>
            <p>Shipping, returns, warranties, card offers, installments, and rewards are explained before checkout.</p>
          </div>
        </div>
      </section>

      <section className="section split" id="offers">
        <div className="offer-panel">
          <p className="eyebrow">Store support data</p>
          <h2>Offers are explained with context.</h2>
          <p>
            The connected experience can answer questions about promotional APRs, installment
            periods, rewards earning, fees, eligibility notes, and potential interest charges
            without promising approval or outcomes.
          </p>
        </div>
        <div className="topic-list">
          {supportTopics.map((topic) => (
            <div key={topic}>{topic}</div>
          ))}
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
              Set the hosted site environment values after your Terraform apply finishes:
              <code>GECX_PROJECT_ID</code>, <code>GECX_LOCATION</code>, and{" "}
              <code>GECX_AGENT_ID</code>.
            </p>
          </div>
        ) : null}
      </section>

      {widgetReady ? (
        <>
          <Script
            src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"
            strategy="afterInteractive"
          />
          <df-messenger
            project-id={assistant.projectId}
            location={assistant.location}
            agent-id={assistant.agentId}
            language-code={assistant.languageCode}
            {...(assistant.oauthClientId
              ? { "oauth-client-id": assistant.oauthClientId }
              : {})}
          >
            <df-messenger-chat-bubble chat-title={assistant.title} />
          </df-messenger>
        </>
      ) : null}
    </main>
  );
}
