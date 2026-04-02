import { describe, expect, it } from "vitest";
import { remainingHoursThisMonth } from "./monthly";

describe("remainingHoursThisMonth", () => {
  it("caps at zero when over limit", () => {
    expect(remainingHoursThisMonth(200)).toBe(0);
  });

  it("returns cap minus used when under limit", () => {
    expect(remainingHoursThisMonth(10)).toBe(158);
  });
});
