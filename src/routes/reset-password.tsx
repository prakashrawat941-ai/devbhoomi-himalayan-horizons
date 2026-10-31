import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Container } from "@/components/AppShell";
import { Field } from "@/components/EnquiryForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Choose a new password for your account." },
      { property: "og:title", content: "Reset password" },
      { property: "og:description", content: "Choose a new password." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("password") ?? "");
    if (pw.length < 8) return setErr("At least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error("Link expired or invalid. Request a new one.");
    toast.success("Password updated");
    nav({ to: "/dashboard" });
  }
  return (
    <Container className="max-w-md py-10">
      <h1 className="text-3xl font-semibold">Set a new password</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <Field label="New password" name="password" error={err}><Input id="password" name="password" type="password" autoComplete="new-password" /></Field>
        <Button type="submit" disabled={busy}>Update password</Button>
      </form>
    </Container>
  );
}
