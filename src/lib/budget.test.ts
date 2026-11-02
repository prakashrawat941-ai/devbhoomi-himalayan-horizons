import { describe, it, expect } from "vitest";
import { computeBudget, type BudgetInput } from "./budget";

const base: BudgetInput = { distanceKm: 400, tollINR: 1580, roundTrip: true, mode: "own", mileageKmpl: 16, fuelPricePerL: 100, days: 5, travellers: 2, style: "comfort" };

describe("computeBudget", () => {
  it("fuel = km / mileage × price, doubled for round trip", () => {
    const b = computeBudget(base);
    expect(b.lines.find((l) => l.key === "fuel")?.min).toBe(5000);
    expect(b.lines.find((l) => l.key === "tolls")?.min).toBe(3160);
  });
  it("shared ride never adds fuel or tolls", () => {
    const b = computeBudget({ ...base, mode: "shared", rideFareTotal: 3000 });
    expect(b.lines.some((l) => l.key === "fuel" || l.key === "tolls")).toBe(false);
    expect(b.lines.find((l) => l.key === "ride")?.min).toBe(3000);
  });
  it("unknown toll is a warning, not zero", () => {
    const b = computeBudget({ ...base, tollINR: null });
    expect(b.lines.some((l) => l.key === "tolls")).toBe(false);
    expect(b.warnings.some((w) => w.includes("Toll"))).toBe(true);
  });
  it("missing fuel price warns instead of guessing", () => {
    const b = computeBudget({ ...base, fuelPricePerL: undefined });
    expect(b.lines.some((l) => l.key === "fuel")).toBe(false);
    expect(b.warnings.length).toBeGreaterThan(0);
  });
  it("per-person = total / travellers", () => {
    const b = computeBudget(base);
    expect(b.perPersonMin).toBe(Math.round(b.totalMin / 2));
  });
});
