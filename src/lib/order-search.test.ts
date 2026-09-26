import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adminOrdersHref, orderSearchWhere, parseOrderStatus } from "./order-search";

describe("orderSearchWhere", () => {
  it("returns an empty filter when the query is blank", () => {
    assert.deepEqual(orderSearchWhere("   "), {});
  });

  it("searches order number, customer, phone, and product name", () => {
    const where = orderSearchWhere("لابتوب");
    assert.ok(where.OR);
    const serialized = JSON.stringify(where);
    assert.match(serialized, /orderNumber/);
    assert.match(serialized, /customerName/);
    assert.match(serialized, /customerPhone/);
    assert.match(serialized, /nameAr/);
  });

  it("also matches a short order code with the AM prefix", () => {
    const where = orderSearchWhere("ab12cd34");
    assert.ok(
      JSON.stringify(where).includes("AM-AB12CD34"),
      "expected normalized order number in the filter",
    );
  });
});

describe("adminOrdersHref", () => {
  it("keeps search and status in the URL", () => {
    assert.equal(
      adminOrdersHref({ q: "علي", status: "NEW", page: 2 }),
      "/admin/orders?q=%D8%B9%D9%84%D9%8A&status=NEW&page=2",
    );
  });
});

describe("parseOrderStatus", () => {
  it("accepts known statuses only", () => {
    assert.equal(parseOrderStatus("CONFIRMED"), "CONFIRMED");
    assert.equal(parseOrderStatus("unknown"), null);
  });
});
