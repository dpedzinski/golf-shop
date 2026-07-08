import Image from "next/image";
import { StorefrontExperience } from "./storefront-experience";

function envValue(name: string, fallback = ""): string {
  const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return process.env[name] ?? viteEnv?.[name] ?? fallback;
}

export default function Home() {
  const config = {
    productApiUrl: envValue("VITE_PRODUCT_API_URL"),
    mcpServerUrl: envValue("VITE_MCP_SERVER_URL"),
    gecx: {
      enabled: envValue("VITE_GECX_ENABLE_WIDGET", "true") !== "false",
      projectId: envValue("VITE_GECX_PROJECT_ID"),
      location: envValue("VITE_GECX_LOCATION", "us"),
      appId: envValue("VITE_GECX_APP_ID", "golf-store-customer-service"),
      deploymentId: envValue("VITE_GECX_DEPLOYMENT_ID"),
      agentId: envValue("VITE_GECX_AGENT_ID", "golf-store-assistant"),
      languageCode: envValue("VITE_GECX_LANGUAGE_CODE", "en"),
      chatTitle: envValue("VITE_GECX_CHAT_TITLE", "Golf Store Assistant"),
      oauthClientId: envValue("VITE_GECX_OAUTH_CLIENT_ID"),
    },
  };

  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav" aria-label="Primary">
          <a className="brand" href="#top" aria-label="Fairway Supply home">
            <span className="brand-mark">FS</span>
            <span>Fairway Supply</span>
          </a>
          <div className="nav-links">
            <a href="#shop">Shop</a>
            <a href="#compare">Compare</a>
            <a href="#offers">Offers</a>
            <a href="#assistant">Assistant</a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Golf gear matched to your swing</p>
            <h1>Find clubs, balls, shoes, and offers with fit-first guidance.</h1>
            <p className="lede">
              Fairway Supply pairs a static storefront with a GECX assistant, BigQuery-backed
              product APIs, MCP tools, and reusable web components for richer shopping flows.
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
              sizes="(max-width: 860px) 100vw, 54vw"
              unoptimized
            />
            <div className="hero-note">
              <strong>Fit-first advice</strong>
              <span>Skill level, budget, goals, and playing style all matter.</span>
            </div>
          </div>
        </div>
      </section>

      <StorefrontExperience config={config} />
    </main>
  );
}
