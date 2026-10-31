import { describe, expect, it } from "vitest";
import { buildItinerary, estimateBudget } from "./planner";
import { cabSchema } from "./schemas";

describe("trip budget", () => {
  it("comfort 3 days x 2 people = 15,000–27,000", () => {
    expect(estimateBudget(3, 2, "comfort")).toEqual([15000, 27000]);
  });
  it("rejects more than 30 days", () => {
    expect(() => estimateBudget(31, 1, "budget")).toThrow();
  });
  it("itinerary has one entry per day, starting in Almora", () => {
    const p = buildItinerary({ days: 5, travellers: 2, style: "budget", villages: ["Kausani", "Jageshwar"] });
    expect(p).toHaveLength(5);
    expect(p[0].title).toContain("Almora");
  });
});

describe("cab routes", () => {
  const base = { travel_date: "2999-01-01", passengers: 2, pickup_point: "Connaught Place", phone: "9876543210" };
  it("accepts Delhi–Almora", () => {
    expect(cabSchema.safeParse({ ...base, route: "delhi_almora" }).success).toBe(true);
  });
  it("rejects any other route", () => {
    expect(cabSchema.safeParse({ ...base, route: "dehradun_almora" }).success).toBe(false);
  });
});
