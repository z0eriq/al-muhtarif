import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeOrderNumber,
  shouldCommitStock,
  shouldDeleteOrder,
  shouldRestoreStock,
} from "./order-stock";

describe("shouldCommitStock", () => {
  it("deducts only when leaving NEW for a live status", () => {
    assert.equal(
      shouldCommitStock({ from: "NEW", to: "CONFIRMED", stockCommitted: false }),
      true,
    );
    assert.equal(
      shouldCommitStock({ from: "NEW", to: "CANCELLED", stockCommitted: false }),
      false,
    );
    assert.equal(
      shouldCommitStock({ from: "NEW", to: "CONFIRMED", stockCommitted: true }),
      false,
    );
    assert.equal(
      shouldCommitStock({ from: "CONFIRMED", to: "SHIPPED", stockCommitted: true }),
      false,
    );
  });
});

describe("shouldRestoreStock", () => {
  it("restores only if stock was already taken and the order is cancelled", () => {
    assert.equal(shouldRestoreStock({ to: "CANCELLED", stockCommitted: true }), true);
    assert.equal(shouldRestoreStock({ to: "CANCELLED", stockCommitted: false }), false);
    assert.equal(shouldRestoreStock({ to: "CONFIRMED", stockCommitted: true }), false);
  });
});

describe("shouldDeleteOrder", () => {
  it("deletes cancelled orders", () => {
    assert.equal(shouldDeleteOrder("CANCELLED"), true);
    assert.equal(shouldDeleteOrder("NEW"), false);
  });
});

describe("normalizeOrderNumber", () => {
  it("accepts the full code or the short suffix", () => {
    assert.equal(normalizeOrderNumber(" am-ab12cd34 "), "AM-AB12CD34");
    assert.equal(normalizeOrderNumber("ab12cd34"), "AM-AB12CD34");
    assert.equal(normalizeOrderNumber(""), null);
  });
});
