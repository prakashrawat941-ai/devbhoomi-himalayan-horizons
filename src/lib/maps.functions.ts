import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";
// Bias to Uttarakhand + NCR region
const BIAS = { circle: { center: { latitude: 29.6, longitude: 79.0 }, radius: 50000 } };

async function gw(path: string, init: RequestInit & { fieldMask?: string } = {}) {
  const lk = process.env["LOVABLE_API_KEY"], mk = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lk || !mk) throw new Error("Maps service is not configured");
  const headers: Record<string, string> = { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": mk, "Content-Type": "application/json" };
  if (init.fieldMask) headers["X-Goog-FieldMask"] = init.fieldMask;
  const res = await fetch(`${GATEWAY}${path}`, { ...init, headers });
  if (!res.ok) {
    const t = await res.text();
    console.error(`Maps ${path} [${res.status}]: ${t}`);
    throw new Error(`Maps request failed (${res.status})`);
  }
  return res.json();
}

export const placeSuggest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ q: z.string().trim().min(2).max(100), token: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const j = await gw("/places/v1/places:autocomplete", {
      method: "POST",
      fieldMask: "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
      body: JSON.stringify({ input: data.q, sessionToken: data.token, includedRegionCodes: ["in"], locationBias: BIAS }),
    });
    return ((j.suggestions ?? []) as { placePrediction?: { placeId: string; text: { text: string } } }[])
      .filter((s) => s.placePrediction)
      .slice(0, 6)
      .map((s) => ({ id: s.placePrediction!.placeId, label: s.placePrediction!.text.text }));
  });

const Point = z.object({ label: z.string().max(200), placeId: z.string().max(300).optional(), lat: z.number().min(-90).max(90).optional(), lng: z.number().min(-180).max(180).optional() });
const wp = (p: z.infer<typeof Point>) => (p.placeId ? { placeId: p.placeId } : p.lat != null && p.lng != null ? { location: { latLng: { latitude: p.lat, longitude: p.lng } } } : { address: p.label });

export interface RouteOption { label: string; via: string; km: number; minutes: number; tollINR: number | null; hasTolls: boolean; warnings: string[] }
export interface WeatherDay { date: string; maxC: number | null; minC: number | null; rainPct: number | null; precipMm: number | null; windKmh: number | null; summary: string }
export interface NearbyPlace { id: string; name: string; address: string; types: string[]; rating: number | null }
export interface TripReportData {
  origin: string; destination: string; generatedAt: string;
  routes: RouteOption[];
  destLat: number | null; destLng: number | null;
  weather: { days: WeatherDay[]; error?: string; source: string };
  nearby: { places: NearbyPlace[]; error?: string };
}

export const tripReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ origin: Point, destination: Point, token: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data }): Promise<TripReportData> => {
    const r = await gw("/routes/directions/v2:computeRoutes", {
      method: "POST",
      fieldMask: "routes.distanceMeters,routes.duration,routes.description,routes.travelAdvisory.tollInfo,routes.routeLabels,routes.warnings,routes.legs.endLocation",
      body: JSON.stringify({ origin: wp(data.origin), destination: wp(data.destination), travelMode: "DRIVE", computeAlternativeRoutes: true, extraComputations: ["TOLLS"], languageCode: "en", regionCode: "IN" }),
    });
    type R = { distanceMeters?: number; duration?: string; description?: string; warnings?: string[]; routeLabels?: string[]; travelAdvisory?: { tollInfo?: { estimatedPrice?: { currencyCode: string; units?: string; nanos?: number }[] } }; legs?: { endLocation?: { latLng?: { latitude: number; longitude: number } } }[] };
    const raw = (r.routes ?? []) as R[];
    if (!raw.length) throw new Error("No driving route found between these places.");
    const routes: RouteOption[] = raw.map((x, i) => {
      const toll = x.travelAdvisory?.tollInfo;
      const inr = toll?.estimatedPrice?.find((p) => p.currencyCode === "INR");
      return {
        label: i === 0 ? "Recommended" : `Alternative ${i}`,
        via: x.description ?? "",
        km: Math.round((x.distanceMeters ?? 0) / 100) / 10,
        minutes: Math.round(parseFloat(x.duration ?? "0") / 60),
        tollINR: inr ? Number(inr.units ?? 0) + (inr.nanos ?? 0) / 1e9 : null,
        hasTolls: toll !== undefined,
        warnings: x.warnings ?? [],
      };
    });
    const end = raw[0].legs?.at(-1)?.endLocation?.latLng;
    const destLat = end?.latitude ?? null, destLng = end?.longitude ?? null;

    const weather: TripReportData["weather"] = { days: [], source: "Google Weather" };
    const nearby: TripReportData["nearby"] = { places: [] };
    if (destLat != null && destLng != null) {
      await Promise.all([
        gw(`/weather/v1/forecast/days:lookup?location.latitude=${destLat}&location.longitude=${destLng}&days=10`)
          .then((w) => {
            type D = { displayDate?: { year: number; month: number; day: number }; maxTemperature?: { degrees?: number }; minTemperature?: { degrees?: number }; daytimeForecast?: { precipitation?: { probability?: { percent?: number }; qpf?: { quantity?: number } }; wind?: { speed?: { value?: number } }; weatherCondition?: { description?: { text?: string } } } };
            weather.days = ((w.forecastDays ?? []) as D[]).map((d) => ({
              date: d.displayDate ? `${d.displayDate.year}-${String(d.displayDate.month).padStart(2, "0")}-${String(d.displayDate.day).padStart(2, "0")}` : "",
              maxC: d.maxTemperature?.degrees ?? null,
              minC: d.minTemperature?.degrees ?? null,
              rainPct: d.daytimeForecast?.precipitation?.probability?.percent ?? null,
              precipMm: d.daytimeForecast?.precipitation?.qpf?.quantity ?? null,
              windKmh: d.daytimeForecast?.wind?.speed?.value ?? null,
              summary: d.daytimeForecast?.weatherCondition?.description?.text ?? "",
            }));
          })
          .catch(() => { weather.error = "Weather forecast is unavailable right now."; }),
        gw("/places/v1/places:searchNearby", {
          method: "POST",
          fieldMask: "places.id,places.displayName,places.formattedAddress,places.types,places.rating",
          body: JSON.stringify({ includedTypes: ["tourist_attraction", "hiking_area", "national_park", "hindu_temple", "park"], maxResultCount: 12, rankPreference: "POPULARITY", locationRestriction: { circle: { center: { latitude: destLat, longitude: destLng }, radius: 30000 } } }),
        })
          .then((p) => {
            type P = { id: string; displayName?: { text?: string }; formattedAddress?: string; types?: string[]; rating?: number };
            nearby.places = ((p.places ?? []) as P[]).map((x) => ({ id: x.id, name: x.displayName?.text ?? "", address: x.formattedAddress ?? "", types: x.types ?? [], rating: x.rating ?? null }));
          })
          .catch(() => { nearby.error = "Nearby places are unavailable right now."; }),
      ]);
    } else {
      weather.error = "Destination coordinates unavailable, so no forecast.";
    }

    return { origin: data.origin.label, destination: data.destination.label, generatedAt: new Date().toISOString(), routes, destLat, destLng, weather, nearby };
  });
