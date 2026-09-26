import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contentTypeForImageExtension,
  imageExtensionForFile,
  r2PutHeaders,
  resolvedImageContentType,
} from "./upload-image";

describe("imageExtensionForFile", () => {
  it("maps standard image MIME types", () => {
    assert.equal(imageExtensionForFile({ type: "image/jpeg" }), "jpg");
    assert.equal(imageExtensionForFile({ type: "image/png" }), "png");
    assert.equal(imageExtensionForFile({ type: "image/webp" }), "webp");
  });

  it("falls back to the filename when MIME is missing", () => {
    assert.equal(imageExtensionForFile({ type: "", name: "hero.JPEG" }), "jpg");
    assert.equal(imageExtensionForFile({ name: "logo.svg" }), "svg");
  });

  it("rejects unsupported files", () => {
    assert.equal(imageExtensionForFile({ type: "application/pdf", name: "a.pdf" }), null);
  });
});

describe("resolvedImageContentType", () => {
  it("normalizes jpeg aliases", () => {
    assert.equal(resolvedImageContentType({ type: "image/jpg", name: "a.jpg" }), "image/jpg");
    assert.equal(contentTypeForImageExtension("jpg"), "image/jpeg");
  });

  it("fills Content-Type from the filename", () => {
    assert.equal(resolvedImageContentType({ type: "", name: "photo.png" }), "image/png");
  });
});

describe("r2PutHeaders", () => {
  it("sends Content-Length so R2 does not return 411", () => {
    const headers = r2PutHeaders("image/jpeg", 2048) as Record<string, string>;
    assert.equal(headers["Content-Length"], "2048");
    assert.equal(headers["Content-Type"], "image/jpeg");
  });
});
