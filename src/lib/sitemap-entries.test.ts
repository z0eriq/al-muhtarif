import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  absoluteSitemapAsset,
  buildSitemap,
  sitemapLoc,
} from "./sitemap-entries";

describe("sitemapLoc", () => {
  it("keeps a trailing slash only on the homepage", () => {
    assert.equal(sitemapLoc("https://www.al-muhtarif.com/", "/"), "https://www.al-muhtarif.com/");
    assert.equal(
      sitemapLoc("https://www.al-muhtarif.com", "/shop"),
      "https://www.al-muhtarif.com/shop",
    );
  });
});

describe("absoluteSitemapAsset", () => {
  it("leaves remote image URLs unchanged", () => {
    assert.equal(
      absoluteSitemapAsset(
        "https://www.al-muhtarif.com",
        "https://pub.example/laptop.jpg",
      ),
      "https://pub.example/laptop.jpg",
    );
  });

  it("resolves relative assets against the store origin", () => {
    assert.equal(
      absoluteSitemapAsset("https://www.al-muhtarif.com", "/logo.png"),
      "https://www.al-muhtarif.com/logo.png",
    );
  });
});

describe("buildSitemap", () => {
  it("includes indexable pages, categories, and product images — not cart or checkout", () => {
    const now = new Date("2026-09-26T12:00:00.000Z");
    const entries = buildSitemap({
      base: "https://www.al-muhtarif.com",
      now,
      categories: [
        {
          slug: "laptops",
          updatedAt: now,
          image: "/categories/laptops.png",
        },
      ],
      products: [
        {
          slug: "labtwb-dl-202",
          updatedAt: now,
          image: "https://cdn.example/dell.jpg",
        },
      ],
    });

    const urls = entries.map((entry) => entry.url);
    assert.ok(urls.includes("https://www.al-muhtarif.com/"));
    assert.ok(urls.includes("https://www.al-muhtarif.com/shop"));
    assert.ok(urls.includes("https://www.al-muhtarif.com/categories/laptops"));
    assert.ok(urls.includes("https://www.al-muhtarif.com/product/labtwb-dl-202"));
    assert.equal(
      urls.some((url) => url.includes("/cart") || url.includes("/checkout")),
      false,
    );

    const product = entries.find((entry) =>
      entry.url.endsWith("/product/labtwb-dl-202"),
    );
    assert.deepEqual(product?.images, ["https://cdn.example/dell.jpg"]);
  });
});
