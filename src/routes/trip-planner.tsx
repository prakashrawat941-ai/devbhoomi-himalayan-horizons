import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { villagesQuery } from "@/lib/data";
import { buildItinerary, estimateBudget, formatINR, type TravelStyle } from "@/lib/planner";
import { PageHero, Container } from "@/components/AppShell";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/trip-planner")({
  validateSearch: z.object({ village: z.string().max(60).optional() }),
  head: () => ({
    meta: [
      { title: "Trip Planner — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Build a day-by-day Uttarakhand village itinerary with an estimated budget, save it and send an enquiry." },
      { property: "og:title", content: "Plan your Uttarakhand village trip" },
      { property: "og:description", content: "Itineraries and estimated budgets for slow Himalayan travel." },
    ],
  }),
  component: Planner,
});

function Planner() {
  const { village } = Route.useSearch();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: villages } = useQuery(villagesQuery);
  const [days, setDays] = useState(5);
  const [travellers, setTravellers] = useState(2);
  const [style, setStyle] = useState<TravelStyle>("comfort");
  const [picked, setPicked] = useState<string[]>(village ? [village] : []);
  const [savedId, setSavedId] = useState<string>();
  const [saving, setSaving] = useState(false);

  const itinerary = useMemo(() => buildItinerary({ days, travellers, style, villages: picked }), [days, travellers, style, picked]);
  const [lo, hi] = estimateBudget(days, travellers, style);

  function toggle(n: string) {
    setSavedId(undefined);
    setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < 5 ? [...p, n] : p));
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase.from("trip_plans").insert({
      user_id: user.id,
      title: `${days}-day ${picked.length ? picked.join(", ") : "Almora"} trip`,
      days, travellers, style, itinerary: itinerary as never, budget_min: lo, budget_max: hi,
    }).select("id").single();
    setSaving(false);
    if (error) return toast.error("Couldn't save plan.");
    setSavedId(data.id);
    qc.invalidateQueries({ queryKey: ["my-plans"] });
    toast.success("Plan saved to your dashboard");
  }

  return (
    <>
      <PageHero eyebrow="Trip planner" title="Shape your journey" intro="Pick villages, days and comfort. We'll sketch the days and an indicative budget." />
      <Container className="grid gap-6 pb-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div>
            <div className="flex justify-between text-sm font-semibold"><span>Days</span><span>{days}</span></div>
            <Slider className="mt-3" min={2} max={14} step={1} value={[days]} onValueChange={([v]) => { setDays(v); setSavedId(undefined); }} />
          </div>
          <div>
            <div className="flex justify-between text-sm font-semibold"><span>Travellers</span><span>{travellers}</span></div>
            <Slider className="mt-3" min={1} max={12} step={1} value={[travellers]} onValueChange={([v]) => { setTravellers(v); setSavedId(undefined); }} />
          </div>
          <div>
            <p className="text-sm font-semibold">Style</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["budget", "comfort", "premium"] as const).map((s) => (
                <button key={s} onClick={() => { setStyle(s); setSavedId(undefined); }} className={`h-11 rounded-full border text-sm font-semibold capitalize ${style === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Villages <span className="font-normal text-muted-foreground">(up to 5)</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              {villages?.map((v) => (
                <button key={v.id} onClick={() => toggle(v.name)} className={`rounded-full border px-4 py-2 text-sm font-medium ${picked.includes(v.name) ? "border-ochre bg-ochre text-ochre-foreground" : "border-border"}`}>{v.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-lift">
            <p className="text-xs uppercase tracking-widest text-accent">Estimated budget</p>
            <p className="mt-1 font-display text-3xl">{formatINR(lo)} – {formatINR(hi)}</p>
            <p className="mt-2 text-xs text-primary-foreground/75">Indicative only: stays, food and local travel for {travellers} × {days} days. Excludes cab to/from Almora. Not a quote.</p>
          </div>
          <ol className="space-y-2">
            {itinerary.map((d) => (
              <li key={d.day} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-display font-semibold text-primary">{d.day}</span>
                <div><p className="font-semibold">{d.title}</p><p className="text-sm text-muted-foreground">{d.detail}</p></div>
              </li>
            ))}
          </ol>
          {user ? (
            <Button onClick={save} disabled={saving || !!savedId} className="w-full">{savedId ? "Saved ✓" : saving ? "Saving…" : "Save this plan"}</Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground"><Link to="/auth" className="font-semibold text-primary">Sign in</Link> to save plans and send enquiries.</p>
          )}
          <div>
            <h2 className="mb-3 text-xl font-semibold">Send an enquiry</h2>
            <EnquiryForm key={savedId ?? "none"} planId={savedId} defaultTravellers={travellers} defaultMessage={`Interested in a ${days}-day ${style} trip${picked.length ? ` to ${picked.join(", ")}` : ""}.`} />
          </div>
        </div>
      </Container>
    </>
  );
}
