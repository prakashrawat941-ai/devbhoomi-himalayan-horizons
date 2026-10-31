// Trip planner estimates. These are indicative ranges only, not quotes.
export type TravelStyle = "budget" | "comfort" | "premium";

// Per person per day (INR): stay + food + local transport, indicative.
export const DAILY_RATE: Record<TravelStyle, [number, number]> = {
  budget: [1500, 2500],
  comfort: [2500, 4500],
  premium: [4500, 8000],
};

export interface PlanInput {
  days: number;
  travellers: number;
  style: TravelStyle;
  villages: string[]; // village names in order
}

export interface DayPlan {
  day: number;
  title: string;
  detail: string;
}

export function estimateBudget(days: number, travellers: number, style: TravelStyle): [number, number] {
  if (!Number.isInteger(days) || days < 1 || days > 30) throw new Error("Days must be 1–30");
  if (!Number.isInteger(travellers) || travellers < 1 || travellers > 20) throw new Error("Travellers must be 1–20");
  const [lo, hi] = DAILY_RATE[style];
  return [lo * days * travellers, hi * days * travellers];
}

export function buildItinerary({ days, villages }: PlanInput): DayPlan[] {
  const stops = villages.length ? villages : ["Almora"];
  const plan: DayPlan[] = [];
  for (let d = 1; d <= days; d++) {
    if (d === 1) {
      plan.push({ day: d, title: "Arrive in Almora", detail: "Reach Almora by road, settle in, evening walk on Mall Road and Bright End Corner." });
      continue;
    }
    if (d === days && days > 1) {
      plan.push({ day: d, title: "Return journey", detail: "Breakfast with a view, then depart towards Kathgodam / Delhi / Chandigarh." });
      continue;
    }
    const idx = Math.floor(((d - 2) * stops.length) / Math.max(days - 2, 1));
    const v = stops[Math.min(idx, stops.length - 1)];
    plan.push({ day: d, title: `Village day — ${v}`, detail: `Slow day in ${v}: a homestay meal, a local walk, and time with the hosts.` });
  }
  return plan;
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
