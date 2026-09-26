import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractMapsEmbedSrc,
  isOptionalHttpUrl,
  toMapsEmbedSrc,
  toOptionalHttpUrl,
} from "./http-url";

describe("toOptionalHttpUrl", () => {
  it("treats empty values as null", () => {
    assert.equal(toOptionalHttpUrl(""), null);
    assert.equal(toOptionalHttpUrl("   "), null);
    assert.equal(toOptionalHttpUrl(null), null);
  });

  it("adds https when the protocol is missing", () => {
    assert.equal(
      toOptionalHttpUrl("www.instagram.com/pro_40st"),
      "https://www.instagram.com/pro_40st",
    );
  });

  it("keeps a valid absolute URL", () => {
    assert.equal(
      toOptionalHttpUrl("https://www.facebook.com/professionaltecnostore"),
      "https://www.facebook.com/professionaltecnostore",
    );
  });
});

describe("extractMapsEmbedSrc", () => {
  it("extracts src from an iframe snippet", () => {
    const html =
      '<iframe src="https://www.google.com/maps?q=hilla&output=embed"></iframe>';
    assert.equal(
      extractMapsEmbedSrc(html),
      "https://www.google.com/maps?q=hilla&output=embed",
    );
  });

  it("returns a plain embed URL as-is", () => {
    const url = "https://www.google.com/maps?q=hilla&output=embed";
    assert.equal(extractMapsEmbedSrc(url), url);
  });

  it("rejects iframe HTML without a src", () => {
    assert.equal(extractMapsEmbedSrc("<iframe></iframe>"), null);
  });
});

describe("toMapsEmbedSrc", () => {
  it("converts a Google Maps place URL with coordinates", () => {
    const place =
      "https://www.google.com/maps/place/Al-Muhtarif+for+tech/@32.4890853,44.4314874,17z";
    assert.equal(
      toMapsEmbedSrc(place),
      "https://www.google.com/maps?q=32.4890853,44.4314874&z=17&hl=ar&output=embed",
    );
  });

  it("converts the store short Maps link to the embed URL", () => {
    assert.equal(
      toMapsEmbedSrc("https://maps.app.goo.gl/cgcFdUcUBdXa6EKWA"),
      "https://www.google.com/maps?q=32.4890853,44.4314874&z=17&hl=ar&output=embed",
    );
  });
});

describe("isOptionalHttpUrl", () => {
  it("accepts null and parseable URLs", () => {
    assert.equal(isOptionalHttpUrl(null), true);
    assert.equal(isOptionalHttpUrl("https://al-muhtarif.com"), true);
    assert.equal(isOptionalHttpUrl("not a url"), false);
  });
});
