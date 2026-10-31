import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { contactSchema } from "@/lib/schemas";
import { PageHero, Container } from "@/components/AppShell";
import { Field } from "@/components/EnquiryForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Questions about villages, homestays or cabs in Uttarakhand? Send us a message." },
      { property: "og:title", content: "Contact Devbhoomi Himalayan Horizons" },
      { property: "og:description", content: "Send us a message about your Uttarakhand trip." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setBusy(false);
    if (error) return toast.error("Couldn't send message.");
    setDone(true);
  }

  return (
    <>
      <PageHero eyebrow="Contact" title="Say namaste" intro="Write to us and our team will reply by email." />
      <Container className="max-w-xl pb-10">
        {done ? (
          <div className="rounded-2xl bg-secondary p-6 text-center font-semibold">Thank you — your message has reached us.</div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="grid gap-3 rounded-2xl border border-border bg-card p-5">
            <Field label="Name" name="name" error={errors.name}><Input id="name" name="name" maxLength={100} /></Field>
            <Field label="Email" name="email" error={errors.email}><Input id="email" name="email" type="email" maxLength={255} /></Field>
            <Field label="Message" name="message" error={errors.message}><Textarea id="message" name="message" rows={5} maxLength={2000} /></Field>
            <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button>
          </form>
        )}
      </Container>
    </>
  );
}
