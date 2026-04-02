import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { verifyCronRequest } from "./cron-auth";

describe("verifyCronRequest", () => {
  const prev = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env.CRON_SECRET = prev;
  });

  it("accepts matching Bearer token", () => {
    const req = new Request("http://localhost/api/cron/register", {
      headers: { Authorization: "Bearer test-secret" },
    });
    expect(verifyCronRequest(req)).toBe(true);
  });

  it("rejects wrong token", () => {
    const req = new Request("http://localhost/api/cron/register", {
      headers: { Authorization: "Bearer wrong" },
    });
    expect(verifyCronRequest(req)).toBe(false);
  });

  it("rejects missing header", () => {
    const req = new Request("http://localhost/api/cron/register");
    expect(verifyCronRequest(req)).toBe(false);
  });
});
