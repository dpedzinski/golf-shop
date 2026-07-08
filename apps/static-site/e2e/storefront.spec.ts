import { expect, test } from "@playwright/test";

test("renders storefront widgets and two-turn irons product carousel", async ({ page }) => {
  const prompts: string[] = [];

  await page.route("https://ces.googleapis.com/v1/**:generateChatToken", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ chatToken: "test-chat-token" }),
    });
  });

  await page.route("https://ces.googleapis.com/v1/**:runSession", async (route) => {
    const body = route.request().postDataJSON() as { inputs?: Array<{ text?: string }> };
    const prompt = body.inputs?.[0]?.text ?? "";
    prompts.push(prompt);

    if (/experienced players/i.test(prompt)) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        outputs: [
          {
            text: "I can help you shop for irons. Are these for a newer player, an improving player, or an experienced player?",
          },
        ],
      }),
    });
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Reusable components backed by the product API" })).toBeVisible();
  await expect(page.locator("cx-product-list")).toHaveCount(1);
  await expect(page.locator("cx-product-comparison")).toHaveCount(1);

  const input = page.getByLabel("Message Golf Store Assistant");
  await input.fill("I want to shop for irons");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.locator(".ces-chat-message.assistant").filter({ hasText: "I can help you shop for irons" })).toBeVisible();

  await input.fill("I want to see irons for experienced players");
  await page.getByRole("button", { name: "Send" }).click();

  const carousel = page.locator(".ces-chat-message.assistant cx-product-carousel");
  await expect(carousel).toHaveCount(1);
  await expect(page.getByText("NorthLake Forge SoftStrike Forged Iron Set")).toBeVisible();
  await expect(page.getByText("NorthLake Forge TourPocket Pro Iron Set")).toBeVisible();
  await expect(page.getByText("Experienced players and low-handicap ball strikers.")).toBeVisible();
  await expect(carousel.locator(".cx-carousel-track")).toBeVisible();
  expect(prompts).toEqual(["I want to shop for irons", "I want to see irons for experienced players"]);
});

test("falls back to demo irons flow when CES quota is exhausted", async ({ page }) => {
  await page.route("https://ces.googleapis.com/v1/**:generateChatToken", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ chatToken: "test-chat-token" }),
    });
  });

  await page.route("https://ces.googleapis.com/v1/**:runSession", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: 429,
          message: "Resource has been exhausted (e.g. check quota).",
          status: "RESOURCE_EXHAUSTED",
        },
      }),
    });
  });

  await page.goto("/");

  const input = page.getByLabel("Message Golf Store Assistant");
  await input.fill("I want to shop for irons");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("The live assistant quota is temporarily exhausted")).toBeVisible();
  await expect(page.getByText("I can help you shop for irons")).toBeVisible();

  await input.fill("I want to see irons for experienced players");
  await page.getByRole("button", { name: "Send" }).click();

  const carousel = page.locator(".ces-chat-message.assistant cx-product-carousel");
  await expect(carousel).toHaveCount(1);
  await expect(page.getByText("NorthLake Forge SoftStrike Forged Iron Set")).toBeVisible();
  await expect(page.getByText("NorthLake Forge TourPocket Pro Iron Set")).toBeVisible();
});

test("adds an irons carousel when CES returns text without product widgets", async ({ page }) => {
  await page.route("https://ces.googleapis.com/v1/**:generateChatToken", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ chatToken: "test-chat-token" }),
    });
  });

  await page.route("https://ces.googleapis.com/v1/**:runSession", async (route) => {
    const body = route.request().postDataJSON() as { inputs?: Array<{ text?: string }> };
    const prompt = body.inputs?.[0]?.text ?? "";
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        outputs: [
          {
            text: /experienced players/i.test(prompt)
              ? "Hmm, I'm having trouble with that. Do you want me to try again?"
              : "I'd be happy to help you find the right set of irons. What skill level are you shopping for?",
          },
        ],
      }),
    });
  });

  await page.goto("/");

  const input = page.getByLabel("Message Golf Store Assistant");
  await input.fill("I want to shop for irons");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("What skill level are you shopping for?")).toBeVisible();

  await input.fill("I want to see irons for experienced players");
  await page.getByRole("button", { name: "Send" }).click();

  const carousel = page.locator(".ces-chat-message.assistant cx-product-carousel");
  await expect(carousel).toHaveCount(1);
  await expect(page.getByText("Here are iron sets that fit experienced players")).toBeVisible();
  await expect(page.getByText("NorthLake Forge SoftStrike Forged Iron Set")).toBeVisible();
  await expect(page.getByText("NorthLake Forge TourPocket Pro Iron Set")).toBeVisible();
});

test("renders product listing and category routes", async ({ page }) => {
  await page.goto("/shop?q=driver");

  await expect(page.getByRole("heading", { name: "Shop golf gear" })).toBeVisible();
  await expect(page.getByRole("link", { name: /LaunchMax Carbon Driver/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();

  await page.goto("/category/drivers");

  await expect(page.getByRole("heading", { name: "Drivers" })).toBeVisible();
  await expect(page.getByRole("link", { name: /LaunchMax Carbon Driver/ })).toBeVisible();
});

test("adds a product variant to cart and shows checkout", async ({ page }) => {
  await page.goto("/products/P001");

  await expect(page.getByRole("heading", { name: "LaunchMax Carbon Driver" })).toBeVisible();
  await expect(page.getByLabel("Variant")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ask if this fits my game" })).toBeVisible();

  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("button", { name: "Added to cart" })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Review your gear" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "LaunchMax Carbon Driver" })).toBeVisible();
  await expect(page.locator(".order-summary").getByRole("link", { name: "Checkout" })).toBeVisible();

  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Confirm purchase support before payment" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue demo checkout" })).toBeVisible();
});

test("renders compare route from product ids", async ({ page }) => {
  await page.goto("/compare?ids=P001,P007");

  await expect(page.getByRole("heading", { name: "Compare the short list" })).toBeVisible();
  await expect(page.getByRole("link", { name: /LaunchMax Carbon Driver/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /VX Forged Cavity Iron Set/ })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});
