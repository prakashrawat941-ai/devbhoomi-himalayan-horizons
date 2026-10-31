import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type Role } from "@/lib/auth";
import { Container } from "@/components/AppShell";
import { Field } from "@/components/EnquiryForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CAB_ROUTES } from "@/lib/schemas";
import { formatINR } from "@/lib/planner";
import { homestaySchema } from "@/lib/schemas";
import { villagesQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My dashboard — Devbhoomi Himalayan Horizons" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

export function StatusBadge({ s }: { s: string }) {
  const tone = s === "approved" || s === "completed" || s === "driver_assigned" ? "default" : s === "rejected" || s === "cancelled" ? "destructive" : "secondary";
  return <Badge variant={tone} className="capitalize">{s.replace("_", " ")}</Badge>;
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-xl font-semibold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

function Dashboard() {
  const { user, roles, loading } = useAuth();
  const { data: apps } = useQuery({
    queryKey: ["my-apps", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("role_applications").select("*").eq("user_id", user!.id)).data ?? [],
  });
  if (loading || !user) return <Container className="py-10">Loading…</Container>;
  const name = (user.user_metadata?.full_name as string) || user.email;

  return (
    <Container className="space-y-5 py-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-ochre">Namaste</p>
        <h1 className="text-3xl font-semibold">{name}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">{roles.map((r) => <Badge key={r} variant="outline" className="capitalize">{r}</Badge>)}</div>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm" variant="outline"><Link to="/profile">Edit profile</Link></Button>
          {roles.includes("admin") && <Button asChild size="sm" variant="hero"><Link to="/admin">Admin panel</Link></Button>}
        </div>
      </div>

      {(["partner", "driver"] as const).map((r) => {
        const app = apps?.find((a) => a.role === r);
        if (!app) return null;
        return <Onboarding key={r} role={r} app={app} />;
      })}

      {roles.includes("partner") && <PartnerHomestays />}
      {roles.includes("driver") && <DriverTrips />}
      <CustomerArea />

      {apps && !apps.some((a) => a.role === "partner") && !apps.some((a) => a.role === "driver") && <ApplyMore roles={roles} />}
    </Container>
  );
}

type App = { id: string; role: Role; status: string; details: unknown; admin_note: string | null };

function Onboarding({ role, app }: { role: "partner" | "driver"; app: App }) {
  const qc = useQueryClient();
  const d = (app.details ?? {}) as Record<string, string>;
  const [busy, setBusy] = useState(false);
  const fields = role === "partner"
    ? [["village", "Village / location"], ["property", "Homestay name"], ["experience", "Hosting experience"], ["id_type", "Govt. ID type (e.g. Aadhaar)"]]
    : [["licence_no", "Driving licence number"], ["vehicle", "Vehicle model"], ["vehicle_no", "Vehicle registration number"], ["years", "Years of hill driving"]];

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const details = Object.fromEntries(Object.entries(fd).map(([k, v]) => [k, String(v).trim().slice(0, 200)]));
    if (Object.values(details).some((v) => v.length < 2)) return toast.error("Please fill every field.");
    setBusy(true);
    const { error } = await supabase.from("role_applications").update({ details }).eq("id", app.id);
    setBusy(false);
    if (error) return toast.error("Couldn't save.");
    toast.success("Details submitted for review");
    qc.invalidateQueries({ queryKey: ["my-apps"] });
  }

  return (
    <Section title={role === "partner" ? "Homestay partner onboarding" : "Driver onboarding"} action={<StatusBadge s={app.status} />}>
      {app.status === "pending" ? (
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <p className="text-sm text-muted-foreground sm:col-span-2">Complete your details. An admin reviews every application before access is granted.</p>
          {fields.map(([k, l]) => <Field key={k} label={l} name={k}><Input id={k} name={k} defaultValue={d[k] ?? ""} maxLength={200} /></Field>)}
          <Button type="submit" disabled={busy} className="sm:col-span-2">{Object.keys(d).length ? "Update details" : "Submit for review"}</Button>
        </form>
      ) : app.status === "approved" ? (
        <p className="text-sm">You're approved. {role === "partner" ? "Add your homestays below." : "Assigned trips appear below."}</p>
      ) : (
        <p className="text-sm text-destructive">Application not approved.{app.admin_note ? ` Note: ${app.admin_note}` : ""} Contact us if you think this is a mistake.</p>
      )}
    </Section>
  );
}

function ApplyMore({ roles }: { roles: Role[] }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  async function apply(role: "partner" | "driver") {
    const { error } = await supabase.from("role_applications").insert({ user_id: user!.id, role });
    if (error) return toast.error("Couldn't start application.");
    qc.invalidateQueries({ queryKey: ["my-apps"] });
  }
  if (roles.includes("admin")) return null;
  return (
    <Section title="Work with us">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => apply("partner")}>Apply as homestay partner</Button>
        <Button variant="outline" onClick={() => apply("driver")}>Apply as driver</Button>
      </div>
    </Section>
  );
}

function CustomerArea() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const plans = useQuery({ queryKey: ["my-plans", user?.id], queryFn: async () => (await supabase.from("trip_plans").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [] });
  const enq = useQuery({ queryKey: ["my-enq", user?.id], queryFn: async () => (await supabase.from("trip_enquiries").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [] });
  const cabs = useQuery({ queryKey: ["my-cabs", user?.id], queryFn: async () => (await supabase.from("cab_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [] });

  async function del(id: string) {
    const { error } = await supabase.from("trip_plans").delete().eq("id", id);
    if (error) return toast.error("Couldn't delete.");
    qc.invalidateQueries({ queryKey: ["my-plans"] });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Section title="Saved plans" action={<Button asChild size="sm" variant="ghost"><Link to="/trip-planner">New</Link></Button>}>
        {plans.data?.length ? plans.data.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-2 border-t border-border py-3 first:border-0">
            <div><p className="font-semibold">{p.title}</p><p className="text-xs text-muted-foreground">{p.travellers} travellers · {formatINR(p.budget_min)}–{formatINR(p.budget_max)} est.</p></div>
            <Button size="sm" variant="ghost" onClick={() => del(p.id)}>Delete</Button>
          </div>
        )) : <p className="text-sm text-muted-foreground">No saved plans yet.</p>}
      </Section>
      <Section title="Enquiries">
        {enq.data?.length ? enq.data.map((e) => (
          <div key={e.id} className="flex items-center justify-between border-t border-border py-3 first:border-0">
            <div><p className="font-semibold capitalize">{e.kind} enquiry</p><p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</p></div>
            <StatusBadge s={e.status} />
          </div>
        )) : <p className="text-sm text-muted-foreground">No enquiries yet.</p>}
      </Section>
      <Section title="Cab requests" action={<Button asChild size="sm" variant="ghost"><Link to="/cab">New</Link></Button>}>
        {cabs.data?.length ? cabs.data.map((c) => (
          <div key={c.id} className="flex items-center justify-between border-t border-border py-3 first:border-0">
            <div><p className="font-semibold">{CAB_ROUTES[c.route]}</p><p className="text-xs text-muted-foreground">{c.travel_date} · {c.passengers} pax</p></div>
            <StatusBadge s={c.status} />
          </div>
        )) : <p className="text-sm text-muted-foreground">No cab requests yet.</p>}
      </Section>
    </div>
  );
}

function PartnerHomestays() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: villages } = useQuery(villagesQuery);
  const list = useQuery({ queryKey: ["my-homestays", user?.id], queryFn: async () => (await supabase.from("homestays").select("*, villages(name)").eq("partner_id", user!.id).order("created_at", { ascending: false })).data ?? [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = homestaySchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    const file = fd.get("image") as File | null;
    if (file && file.size > 0 && (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) return setErrors({ image: "Image must be a picture under 5 MB" });
    setBusy(true);
    let image_path: string | null = null;
    if (file && file.size > 0) {
      const path = `${user!.id}/${crypto.randomUUID()}.${file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"}`;
      const up = await supabase.storage.from("homestay-images").upload(path, file, { contentType: file.type });
      if (up.error) { setBusy(false); return toast.error("Image upload failed."); }
      image_path = path;
    }
    const { amenities, ...rest } = parsed.data;
    const { error } = await supabase.from("homestays").insert({ ...rest, amenities: amenities.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 15), image_path, partner_id: user!.id });
    setBusy(false);
    if (error) return toast.error("Couldn't submit homestay.");
    form.reset();
    toast.success("Submitted — pending admin approval");
    qc.invalidateQueries({ queryKey: ["my-homestays"] });
  }

  return (
    <Section title="My homestays">
      <div className="space-y-2">
        {list.data?.map((h) => (
          <div key={h.id} className="flex items-center justify-between rounded-2xl bg-muted p-3">
            <div><p className="font-semibold">{h.name}</p><p className="text-xs text-muted-foreground">{h.villages?.name} · {h.rooms} rooms</p></div>
            <StatusBadge s={h.status} />
          </div>
        ))}
      </div>
      <form onSubmit={add} noValidate className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Homestay name" name="name" error={errors.name}><Input id="name" name="name" maxLength={120} /></Field>
        <Field label="Village" name="village_id" error={errors.village_id}>
          <select id="village_id" name="village_id" className="h-10 rounded-md border border-input bg-card px-3 text-sm">
            <option value="">Choose…</option>
            {villages?.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2"><Field label="Description" name="description" error={errors.description}><Textarea id="description" name="description" rows={3} maxLength={2000} /></Field></div>
        <Field label="Rooms" name="rooms" error={errors.rooms}><Input id="rooms" name="rooms" type="number" min={1} max={50} defaultValue={2} /></Field>
        <Field label="Tariff note (your own words)" name="tariff_note" error={errors.tariff_note}><Input id="tariff_note" name="tariff_note" placeholder="e.g. Ask for seasonal rates" maxLength={200} /></Field>
        <Field label="Amenities (comma separated)" name="amenities" error={errors.amenities}><Input id="amenities" name="amenities" placeholder="Wi-Fi, hot water, meals" maxLength={300} /></Field>
        <Field label="Photo (max 5 MB)" name="image" error={errors.image}><Input id="image" name="image" type="file" accept="image/*" /></Field>
        <Button type="submit" disabled={busy} className="sm:col-span-2">{busy ? "Submitting…" : "Submit for approval"}</Button>
      </form>
    </Section>
  );
}

function DriverTrips() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["driver-trips", user?.id], queryFn: async () => (await supabase.from("cab_requests").select("*").eq("driver_id", user!.id).order("travel_date")).data ?? [] });
  return (
    <Section title="Assigned trips">
      {data?.length ? data.map((c) => (
        <div key={c.id} className="flex items-center justify-between border-t border-border py-3 first:border-0">
          <div><p className="font-semibold">{CAB_ROUTES[c.route]} · {c.travel_date}</p><p className="text-xs text-muted-foreground">Pickup: {c.pickup_point} · {c.passengers} pax · {c.phone}</p></div>
          <StatusBadge s={c.status} />
        </div>
      )) : <p className="text-sm text-muted-foreground">No trips assigned yet.</p>}
    </Section>
  );
}
