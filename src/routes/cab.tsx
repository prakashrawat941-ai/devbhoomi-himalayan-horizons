import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CalendarDays, CarFront, CheckCircle2, Clock3, MapPin, Mountain, Phone, ShieldCheck, Users } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CAB_ROUTES, cabSchema, todayISO, type CabRoute } from "@/lib/schemas";
import { Container, SignInPrompt } from "@/components/AppShell";
import { Field } from "@/components/EnquiryForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cab")({
  head: () => ({
    meta: [
      { title: "Book a Cab to Almora | The Himalayan Roots" },
      { name: "description", content: "Request a comfortable, verified cab from Delhi or Chandigarh to Almora with The Himalayan Roots." },
      { property: "og:title", content: "Your Himalayan ride starts here" },
      { property: "og:description", content: "Plan your ride to Almora with a local travel team." },
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
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("cab_requests").insert({ ...parsed.data, user_id: user!.id });
    setBusy(false);
    if (error) {
      toast.error("Your request couldn't be sent. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-[#f7f5ee] pb-10">
      <section className="relative isolate min-h-[390px] overflow-hidden sm:min-h-[470px]">
        <img src={hero} alt="A winding road through the Uttarakhand Himalayas" className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#082b23]/90 via-[#0b342a]/60 to-[#0b342a]/10" />
        <div className="mx-auto flex min-h-[390px] max-w-6xl items-end px-5 pb-12 pt-24 sm:min-h-[470px] sm:pb-16">
          <div className="max-w-2xl text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] backdrop-blur">
              <Mountain className="size-3.5 text-[#e6c77a]" /> The Himalayan Roots
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">The road to the<br /><span className="text-[#f0d99b]">mountains starts here.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base">A smoother, more thoughtful ride from the city to the hills. Tell us your travel details and our team will confirm availability and fare.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium text-white/90">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-[#e6c77a]" /> Verified partner drivers</span>
              <span className="inline-flex items-center gap-1.5"><CarFront className="size-4 text-[#e6c77a]" /> Comfortable hill rides</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4 text-[#e6c77a]" /> Human support</span>
            </div>
          </div>
        </div>
      </section>

      <Container className="relative -mt-7 max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-3xl bg-[#103d31] p-6 text-white shadow-[0_22px_60px_-28px_rgba(7,39,30,.65)] sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e5c77d]">Your journey, considered</p>
            <h2 className="mt-3 font-display text-3xl leading-tight">From busy streets<br />to mountain air.</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">Choose your starting city, share your travel details and let our team help arrange the ride.</p>
            <div className="mt-8 space-y-4">
              <div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#e5c77d]"><MapPin className="size-4" /></span><div><p className="text-sm font-semibold">City pickup</p><p className="text-xs text-white/60">Delhi or Chandigarh</p></div></div>
              <div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#e5c77d]"><Mountain className="size-4" /></span><div><p className="text-sm font-semibold">Mountain destination</p><p className="text-xs text-white/60">Almora, Uttarakhand</p></div></div>
              <div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#e5c77d]"><ShieldCheck className="size-4" /></span><div><p className="text-sm font-semibold">Clear confirmation</p><p className="text-xs text-white/60">Fare and availability confirmed by our team</p></div></div>
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="text-xs font-semibold text-[#f0d99b]">A note before you book</p>
              <p className="mt-1 text-xs leading-5 text-white/65">Submitting this form sends a cab request. It does not instantly assign a driver or confirm a fixed fare.</p>
            </div>
          </aside>

          <section className="rounded-3xl border border-[#e7e1d3] bg-white p-5 shadow-[0_18px_50px_-35px_rgba(30,55,42,.45)] sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9b7a36]">Plan your ride</p><h2 className="mt-1 font-display text-3xl text-[#173d32]">Request a cab</h2><p className="mt-2 text-sm text-slate-500">A few details are all we need to get started.</p></div>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f4f0e5] text-[#174537]"><CarFront className="size-5" /></span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {(Object.keys(CAB_ROUTES) as CabRoute[]).map((r) => (
                <button key={r} type="button" onClick={() => setRoute(r)} aria-pressed={route === r} className={`rounded-2xl border p-3 text-left transition-all ${route === r ? "border-[#174537] bg-[#174537] text-white shadow-md" : "border-[#e8e5dc] bg-[#fbfaf6] text-[#23463b] hover:border-[#9aab9e]"}`}>
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-65">Pickup route</span>
                  <span className="mt-1 block text-sm font-semibold">{CAB_ROUTES[r]}</span>
                  {route === r && <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#f0d99b]"><CheckCircle2 className="size-3" /> Selected</span>}
                </button>
              ))}
            </div>

            <div className="mt-5">
              {!user ? <SignInPrompt action="request a cab" /> : done ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-6" /></span>
                  <h3 className="mt-3 font-display text-2xl text-[#174537]">Request received</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Your cab request has been submitted. No driver is assigned and no fare is fixed yet. Our team will confirm the details.</p>
                  <Button asChild className="mt-4 rounded-full bg-[#174537]"><Link to="/dashboard">View my requests <ArrowRight className="ml-1 size-4" /></Link></Button>
                  <button type="button" onClick={() => setDone(false)} className="mt-4 block w-full text-xs font-semibold text-[#174537]">Send another request</button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Travel date" name="travel_date" error={errors.travel_date}><Input id="travel_date" name="travel_date" type="date" min={todayISO()} required className="h-12 rounded-xl bg-[#fbfaf6]" /></Field>
                    <Field label="Passengers" name="passengers" error={errors.passengers}><div className="relative"><Users className="absolute left-3 top-3.5 size-4 text-slate-400" /><Input id="passengers" name="passengers" type="number" min={1} max={12} defaultValue={2} required className="h-12 rounded-xl bg-[#fbfaf6] pl-10" /></div></Field>
                  </div>
                  <Field label={`Pickup point in ${route === "delhi_almora" ? "Delhi" : "Chandigarh"}`} name="pickup_point" error={errors.pickup_point}><div className="relative"><MapPin className="absolute left-3 top-3.5 size-4 text-slate-400" /><Input id="pickup_point" name="pickup_point" maxLength={200} required placeholder="Enter area, landmark or address" className="h-12 rounded-xl bg-[#fbfaf6] pl-10" /></div></Field>
                  <Field label="Contact phone" name="phone" error={errors.phone}><div className="relative"><Phone className="absolute left-3 top-3.5 size-4 text-slate-400" /><Input id="phone" name="phone" type="tel" inputMode="tel" required placeholder="10-digit mobile number" className="h-12 rounded-xl bg-[#fbfaf6] pl-10" /></div></Field>
                  <Field label="Additional notes (optional)" name="notes" error={errors.notes}><Textarea id="notes" name="notes" rows={3} maxLength={500} placeholder="Luggage, child seat or pickup instructions…" className="resize-none rounded-xl bg-[#fbfaf6]" /></Field>
                  <Button type="submit" disabled={busy} className="mt-1 h-12 rounded-full bg-[#174537] text-sm font-semibold shadow-lg shadow-[#174537]/15 hover:bg-[#10382d]">{busy ? "Sending request…" : "Send cab request"} <ArrowRight className="ml-2 size-4" /></Button>
                  <p className="text-center text-[11px] leading-5 text-slate-400">By submitting, you agree that our team may contact you about this ride request.</p>
                </form>
              )}
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
