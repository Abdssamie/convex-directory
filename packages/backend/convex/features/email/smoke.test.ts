import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
// @ts-ignore
import schema from "../../schema";

describe("smoke test", () => {
  it("can initialize convex-test", async () => {
    // @ts-ignore
    const t = convexTest(schema, import.meta.glob("../../**/*.ts"));
    expect(t).toBeDefined();
  });
});
