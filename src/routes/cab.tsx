import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CAB_ROUTES, cabSchema, todayISO, type CabRoute } from "@/lib/schemas";
import { PageHero, Container, SignInPrompt } from "@/components/AppShell";
import { Field } from "@/components/EnquiryForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cab")({
  head: () => ({
    meta: [
      { title: "Cab Requests: Delhi & Chandigarh to Almora — Devbhoomi" },
      { name: "description", content: "Request a cab from Delhi or Chandigarh to Almora. Our team confirms availability and fare by phone." },
      { property: "og:title", content: "Cab to Almora from Delhi or Chandigarh" },
      { property: "og:description", content: "Send a cab request; fare and availability confirmed by our team." },
    ],
  }),
  component: Cab,
});

function Cab() {
  const { user } = useAuth();
  const [route, setRoute] = useState<CabRoute>("delhi_almora");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = cabSchema.safeParse({ ...Object.fromEntries(new FormData(e.currentTarget)), route });
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("cab_requests").insert({ ...parsed.data, user_id: user!.id });
    setBusy(false);
    if (error) return toast.error("Couldn't send request. Please try again.");
    setDone(true);
  }

  return (
    <>
      <PageHero eyebrow="Cab requests" title="Ride to Almora" intro="Two routes only. This is a request — not a booking. Our team will call you with availability and fare." />
      <Container className="max-w-xl pb-10">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CAB_ROUTES) as CabRoute[]).map((r) => (
            <button key={r} type="button" onClick={() => setRoute(r)} className={`rounded-2xl border p-4 text-left ${route === r ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
              <p className="text-xs uppercase tracking-wider opacity-75">Route</p>
              <p className="font-display text-lg font-semibold">{CAB_ROUTES[r]}</p>
            </button>
          ))}
        </div>
        <div className="mt-5">
          {!user ? <SignInPrompt action="request a cab" /> : done ? (
            <div className="rounded-2xl bg-secondary p-6 text-center">
              <p className="font-semibold">Request received — status: Requested</p>
              <p className="mt-1 text-sm text-muted-foreground">No driver is assigned yet and no fare is fixed. Track it on your <Link to="/dashboard" className="font-semibold text-primary">dashboard</Link>.</p>
              <Button variant="outline" className="mt-4" onClick={() => setDone(false)}>New request</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-3 rounded-2xl border border-border bg-card p-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Travel date" name="travel_date" error={errors.travel_date}><Input id="travel_date" name="travel_date" type="date" min={todayISO()} required /></Field>
                <Field label="Passengers" name="passengers" error={errors.passengers}><Input id="passengers" name="passengers" type="number" min={1} max={12} defaultValue={2} /></Field>
              </div>
              <Field label={`Pickup point in ${route === "delhi_almora" ? "Delhi" : "Chandigarh"}`} name="pickup_point" error={errors.pickup_point}><Input id="pickup_point" name="pickup_point" maxLength={200} required /></Field>
              <Field label="Phone" name="phone" error={errors.phone}><Input id="phone" name="phone" type="tel" inputMode="tel" required /></Field>
              <Field label="Notes (optional)" name="notes" error={errors.notes}><Textarea id="notes" name="notes" rows={2} maxLength={500} /></Field>
              {errors.route && <p className="text-xs text-destructive">{errors.route}</p>}
              <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send cab request"}</Button>
            </form>
          )}
        </div>
      </Container>
    </>
  );
}
