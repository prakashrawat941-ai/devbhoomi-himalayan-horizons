import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Container } from "@/components/AppShell";
import { Field } from "@/components/EnquiryForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Sign in to manage trips, cab requests and your partner dashboard." },
      { property: "og:title", content: "Login — Devbhoomi Himalayan Horizons" },
      { property: "og:description", content: "Sign in to your account." },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({ email: z.string().trim().email("Invalid email"), password: z.string().min(1, "Enter your password") });

function AuthPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading, nav]);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) return toast.error(error.message.includes("confirm") ? "Please confirm your email first." : "Wrong email or password.");
    nav({ to: "/dashboard" });
  }

  async function onForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!z.string().email().safeParse(email).success) return setErrors({ email: "Invalid email" });
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) return toast.error("Couldn't send reset email.");
    toast.success("If that email has an account, a reset link is on its way.");
    setMode("login");
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed.");
  }

  return (
    <Container className="max-w-md py-10">
      <h1 className="text-3xl font-semibold">{mode === "login" ? "Welcome back" : "Reset password"}</h1>
      <p className="mt-1 text-muted-foreground">Live a little deeper.</p>
      {mode === "login" ? (
        <form onSubmit={onLogin} noValidate className="mt-6 grid gap-3">
          <Field label="Email" name="email" error={errors.email}><Input id="email" name="email" type="email" autoComplete="email" /></Field>
          <Field label="Password" name="password" error={errors.password}><Input id="password" name="password" type="password" autoComplete="current-password" /></Field>
          <Button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
          <button type="button" onClick={() => setMode("forgot")} className="text-sm font-semibold text-primary">Forgot password?</button>
          <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          <Button type="button" variant="outline" onClick={google}>Continue with Google</Button>
          <p className="mt-2 text-center text-sm">New here? <Link to="/register" className="font-semibold text-primary">Create an account</Link></p>
        </form>
      ) : (
        <form onSubmit={onForgot} noValidate className="mt-6 grid gap-3">
          <Field label="Email" name="email" error={errors.email}><Input id="email" name="email" type="email" /></Field>
          <Button type="submit" disabled={busy}>Send reset link</Button>
          <button type="button" onClick={() => setMode("login")} className="text-sm font-semibold text-primary">Back to sign in</button>
        </form>
      )}
    </Container>
  );
}
