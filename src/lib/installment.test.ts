import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { productInstallmentUrl } from "./installment";
import { productSchema } from "./validators";

describe("productInstallmentUrl", () => {
  it("returns null when installment is off", () => {
    assert.equal(
      productInstallmentUrl({
        installmentAvailable: false,
        installmentUrl: "https://qi.iq/pay",
      }),
      null,
    );
  });

  it("returns the URL when installment is enabled", () => {
    assert.equal(
      productInstallmentUrl({
        installmentAvailable: true,
        installmentUrl: "https://qi.iq/pay",
      }),
      "https://qi.iq/pay",
    );
  });
});

describe("productSchema installment", () => {
  const base = {
    nameAr: "هاتف",
    slug: "phone",
    price: 100000,
    stock: 2,
    categoryIds: ["cat-1"],
  };

  it("requires a URL when installment is enabled", () => {
    const parsed = productSchema.safeParse({
      ...base,
      installmentAvailable: true,
      installmentUrl: "",
    });
    assert.equal(parsed.success, false);
  });

  it("accepts installment with a valid URL", () => {
    const parsed = productSchema.safeParse({
      ...base,
      installmentAvailable: true,
      installmentUrl: "https://qi.iq/installment",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.installmentAvailable, true);
      assert.equal(parsed.data.installmentUrl, "https://qi.iq/installment");
    }
  });
});
