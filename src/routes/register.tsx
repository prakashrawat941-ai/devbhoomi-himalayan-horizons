import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Backpack, Home, Car } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema } from "@/lib/schemas";
import { Container } from "@/components/AppShell";
import { Field } from "@/components/EnquiryForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({
  validateSearch: z.object({ role: z.enum(["customer", "partner", "driver"]).optional() }),
  head: () => ({
    meta: [
      { title: "Register — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Join as a traveller, homestay partner or driver." },
      { property: "og:title", content: "Join Devbhoomi Himalayan Horizons" },
      { property: "og:description", content: "Register as a traveller, homestay partner or driver." },
    ],
  }),
  component: Register,
});

const ROLES = [
  { id: "customer", label: "Traveller", icon: Backpack, d: "Plan trips, request cabs, send enquiries." },
  { id: "partner", label: "Homestay Partner", icon: Home, d: "List your homestay. Requires admin approval." },
  { id: "driver", label: "Driver", icon: Car, d: "Drive Delhi/Chandigarh–Almora. Requires admin approval." },
] as const;

function Register() {
  const search = Route.useSearch();
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>(search.role ?? "customer");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ ...Object.fromEntries(new FormData(e.currentTarget)), role });
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setBusy(true);
    const { full_name, email, phone, password } = parsed.data;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name, phone, requested_role: role } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSentTo(email);
  }

  if (sentTo) return (
    <Container className="max-w-md py-14 text-center">
      <h1 className="text-3xl font-semibold">Check your email</h1>
      <p className="mt-3 text-muted-foreground">We sent a confirmation link to <b>{sentTo}</b>. Confirm it, then sign in.{role !== "customer" && " After signing in, complete your onboarding details so our team can review your application."}</p>
      <Button asChild className="mt-6"><Link to="/auth">Go to sign in</Link></Button>
    </Container>
  );

  return (
    <Container className="max-w-md py-8">
      <h1 className="text-3xl font-semibold">Create your account</h1>
      <div className="mt-5 grid gap-2">
        {ROLES.map(({ id, label, icon: Icon, d }) => (
          <button key={id} type="button" onClick={() => setRole(id)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${role === id ? "border-primary bg-secondary" : "border-border bg-card"}`}>
            <span className={`grid size-10 place-items-center rounded-full ${role === id ? "bg-primary text-primary-foreground" : "bg-muted"}`}><Icon className="size-5" /></span>
            <span><span className="block font-semibold">{label}</span><span className="text-xs text-muted-foreground">{d}</span></span>
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-3">
        <Field label="Full name" name="full_name" error={errors.full_name}><Input id="full_name" name="full_name" autoComplete="name" /></Field>
        <Field label="Email" name="email" error={errors.email}><Input id="email" name="email" type="email" autoComplete="email" /></Field>
        <Field label="Phone" name="phone" error={errors.phone}><Input id="phone" name="phone" type="tel" inputMode="tel" /></Field>
        <Field label="Password" name="password" error={errors.password}><Input id="password" name="password" type="password" autoComplete="new-password" /></Field>
        <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
        <p className="text-center text-sm">Already registered? <Link to="/auth" className="font-semibold text-primary">Sign in</Link></p>
      </form>
    </Container>
  );
}
