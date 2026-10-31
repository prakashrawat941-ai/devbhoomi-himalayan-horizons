import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { enquirySchema, todayISO } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SignInPrompt } from "@/components/AppShell";

export function EnquiryForm({ kind = "trip", planId, defaultTravellers = 2, defaultMessage = "" }: { kind?: "trip" | "workation" | "homestay"; planId?: string; defaultTravellers?: number; defaultMessage?: string }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) return <SignInPrompt action="send an enquiry" />;
  if (done) return (
    <div className="rounded-2xl bg-secondary p-6 text-center">
      <p className="font-semibold">Enquiry received.</p>
      <p className="mt-1 text-sm text-muted-foreground">Our team will contact you by phone. This is not a confirmed booking.</p>
    </div>
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = enquirySchema.safeParse({ ...fd, kind, travel_date: fd.travel_date || undefined });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("trip_enquiries").insert({ ...parsed.data, travel_date: parsed.data.travel_date ?? null, user_id: user!.id, plan_id: planId ?? null });
    setBusy(false);
    if (error) return toast.error("Couldn't send enquiry. Please try again.");
    setDone(true);
    toast.success("Enquiry sent");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-border bg-card p-5" noValidate>
      <Field label="Your name" name="name" error={errors.name}><Input name="name" autoComplete="name" required /></Field>
      <Field label="Phone" name="phone" error={errors.phone}><Input name="phone" type="tel" inputMode="tel" autoComplete="tel" required /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Travel date" name="travel_date" error={errors.travel_date}><Input name="travel_date" type="date" min={todayISO()} /></Field>
        <Field label="Travellers" name="travellers" error={errors.travellers}><Input name="travellers" type="number" min={1} max={20} defaultValue={defaultTravellers} /></Field>
      </div>
      <Field label="Message" name="message" error={errors.message}><Textarea name="message" rows={3} maxLength={1000} defaultValue={defaultMessage} /></Field>
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</Button>
    </form>
  );
}

export function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
