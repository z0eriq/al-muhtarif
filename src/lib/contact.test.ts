import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contactSchema } from "./validators";
import { buildWhatsAppUrl } from "./whatsapp";

describe("contactSchema", () => {
  it("accepts a complete contact message", () => {
    const parsed = contactSchema.safeParse({
      name: "علي",
      phone: "07743571934",
      email: "ali@example.com",
      message: "أريد الاستفسار عن لابتوب",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects a short message", () => {
    const parsed = contactSchema.safeParse({
      name: "علي",
      phone: "07743571934",
      message: "Hi",
    });
    assert.equal(parsed.success, false);
  });
});

describe("buildWhatsAppUrl", () => {
  it("adds the Iraq country code to local mobile numbers", () => {
    assert.equal(
      buildWhatsAppUrl("07743571934"),
      "https://wa.me/9647743571934",
    );
  });
});
