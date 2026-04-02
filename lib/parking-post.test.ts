import { describe, expect, it } from "vitest";
import { substitutePlaceholders } from "./parking-post";

describe("substitutePlaceholders", () => {
  it("replaces known keys", () => {
    expect(
      substitutePlaceholders('{"v":"{{VEHICLE}}","p":"{{PASSCODE}}"}', {
        VEHICLE: "ABC123",
        PASSCODE: "secret",
      }),
    ).toBe('{"v":"ABC123","p":"secret"}');
  });
});
