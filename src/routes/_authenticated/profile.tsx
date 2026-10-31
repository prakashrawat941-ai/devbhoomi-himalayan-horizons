import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { phoneSchema } from "@/lib/schemas";
import { Container } from "@/components/AppShell";
import { Field } from "@/components/EnquiryForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Devbhoomi Himalayan Horizons" }, { name: "robots", content: "noindex" }] }),
  component: Profile,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  phone: phoneSchema.or(z.literal("")),
  city: z.string().trim().max(80),
  bio: z.string().trim().max(500),
});

function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data, isLoading } = useQuery({ queryKey: ["profile", user?.id], enabled: !!user, queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    const { error } = await supabase.from("profiles").update({ ...parsed.data, phone: parsed.data.phone || null, updated_at: new Date().toISOString() }).eq("id", user!.id);
    if (error) return toast.error("Couldn't save profile.");
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  if (isLoading) return <Container className="py-10">Loading…</Container>;
  return (
    <Container className="max-w-md py-8">
      <h1 className="text-3xl font-semibold">Your profile</h1>
      <p className="text-sm text-muted-foreground">{user?.email}</p>
      <form key={data?.updated_at} onSubmit={onSubmit} noValidate className="mt-6 grid gap-3">
        <Field label="Full name" name="full_name" error={errors.full_name}><Input id="full_name" name="full_name" defaultValue={data?.full_name ?? ""} /></Field>
        <Field label="Phone" name="phone" error={errors.phone}><Input id="phone" name="phone" type="tel" defaultValue={data?.phone ?? ""} /></Field>
        <Field label="City" name="city" error={errors.city}><Input id="city" name="city" defaultValue={data?.city ?? ""} /></Field>
        <Field label="About you" name="bio" error={errors.bio}><Textarea id="bio" name="bio" rows={3} defaultValue={data?.bio ?? ""} /></Field>
        <Button type="submit">Save</Button>
      </form>
    </Container>
  );
}
