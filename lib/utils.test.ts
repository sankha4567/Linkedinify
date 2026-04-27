import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getTimeAgo } from "./utils";

describe("getTimeAgo", () => {
  const NOW = new Date("2026-04-27T12:00:00Z").getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for timestamps under 60 seconds old', () => {
    expect(getTimeAgo(NOW)).toBe("just now");
    expect(getTimeAgo(NOW - 30 * 1000)).toBe("just now");
    expect(getTimeAgo(NOW - 59 * 1000)).toBe("just now");
  });

  it("returns minutes for under an hour", () => {
    expect(getTimeAgo(NOW - 60 * 1000)).toBe("1m");
    expect(getTimeAgo(NOW - 5 * 60 * 1000)).toBe("5m");
    expect(getTimeAgo(NOW - 59 * 60 * 1000)).toBe("59m");
  });

  it("returns hours for under a day", () => {
    expect(getTimeAgo(NOW - 60 * 60 * 1000)).toBe("1hr");
    expect(getTimeAgo(NOW - 23 * 60 * 60 * 1000)).toBe("23hr");
  });

  it("returns days for under a week", () => {
    expect(getTimeAgo(NOW - 24 * 60 * 60 * 1000)).toBe("1d");
    expect(getTimeAgo(NOW - 6 * 24 * 60 * 60 * 1000)).toBe("6d");
  });

  it("returns a formatted date for timestamps older than a week", () => {
    const tenDaysAgo = NOW - 10 * 24 * 60 * 60 * 1000;
    const result = getTimeAgo(tenDaysAgo);
    // Don't assert exact locale formatting — just ensure it produced a date string,
    // not the relative-time format.
    expect(result).not.toMatch(/^\d+(m|hr|d)$/);
    expect(result).not.toBe("just now");
    expect(result.length).toBeGreaterThan(0);
  });
});
