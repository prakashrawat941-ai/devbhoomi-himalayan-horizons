// Trip budget. Every line says whether it comes from route data, the customer's own input,
// or an indicative estimate. Missing prices are reported, never guessed.
import { DAILY_RATE, type TravelStyle } from "./planner";

export type TravelMode = "own" | "cab" | "shared";

export interface BudgetInput {
  distanceKm: number; // one way, from route data
  tollINR: number | null; // one way, null = unknown
  roundTrip: boolean;
  mode: TravelMode;
  mileageKmpl?: number;
  fuelPricePerL?: number;
  rideFareTotal?: number; // cab/shared total entered or quoted
  days: number;
  travellers: number;
  style: TravelStyle;
  parking?: number;
  activities?: number;
  guide?: number;
  other?: number;
}

export type Source = "route" | "you" | "estimate";
export interface BudgetLine { key: string; label: string; min: number; max: number; source: Source; optional?: boolean }
export interface Budget { lines: BudgetLine[]; totalMin: number; totalMax: number; perPersonMin: number; perPersonMax: number; warnings: string[] }

const pos = (n?: number) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : undefined);

export function computeBudget(i: BudgetInput): Budget {
  const lines: BudgetLine[] = [];
  const warnings: string[] = [];
  const legs = i.roundTrip ? 2 : 1;
  const km = i.distanceKm * legs;

  if (i.mode === "own") {
    const m = pos(i.mileageKmpl), p = pos(i.fuelPricePerL);
    if (m && p) {
      const fuel = Math.round((km / m) * p);
      lines.push({ key: "fuel", label: `Fuel (${Math.round(km)} km ÷ ${m} km/l × ₹${p})`, min: fuel, max: fuel, source: "you" });
    } else warnings.push("Fuel cost not included — enter your vehicle mileage and today's fuel price.");
    if (i.tollINR === null) warnings.push("Toll price not available from route data for this route.");
    else if (i.tollINR > 0) lines.push({ key: "tolls", label: "Tolls (route data)", min: i.tollINR * legs, max: i.tollINR * legs, source: "route" });
  } else {
    const f = pos(i.rideFareTotal);
    if (f) lines.push({ key: "ride", label: i.mode === "cab" ? "Cab fare" : "Shared-ride fare", min: f, max: f, source: "you" });
    else warnings.push(`${i.mode === "cab" ? "Cab" : "Shared-ride"} fare not included — no confirmed fare yet.`);
  }

  const [lo, hi] = DAILY_RATE[i.style];
  const nights = Math.max(i.days - 1, 0);
  const stay = Math.round((lo * 0.55)), stayHi = Math.round(hi * 0.55);
  lines.push({ key: "homestay", label: `Homestay (${nights} nights)`, min: stay * nights * i.travellers, max: stayHi * nights * i.travellers, source: "estimate" });
  lines.push({ key: "food", label: `Food (${i.days} days)`, min: Math.round(lo * 0.3) * i.days * i.travellers, max: Math.round(hi * 0.3) * i.days * i.travellers, source: "estimate" });
  lines.push({ key: "local", label: "Local experiences & transport", min: Math.round(lo * 0.15) * i.days * i.travellers, max: Math.round(hi * 0.15) * i.days * i.travellers, source: "estimate" });

  const opt: [keyof BudgetInput, string][] = [["parking", "Parking"], ["activities", "Activities"], ["guide", "Guide"], ["other", "Other"]];
  for (const [k, label] of opt) {
    const v = pos(i[k] as number | undefined);
    if (v) lines.push({ key: k, label, min: v, max: v, source: "you", optional: true });
  }

  const totalMin = lines.reduce((s, l) => s + l.min, 0);
  const totalMax = lines.reduce((s, l) => s + l.max, 0);
  const t = Math.max(i.travellers, 1);
  return { lines, totalMin, totalMax, perPersonMin: Math.round(totalMin / t), perPersonMax: Math.round(totalMax / t), warnings };
}
