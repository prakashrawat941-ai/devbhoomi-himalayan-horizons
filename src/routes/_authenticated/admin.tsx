import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Container } from "@/components/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "./dashboard";
import { CAB_ROUTES } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Devbhoomi Himalayan Horizons" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

function useProfiles() {
  return useQuery({ queryKey: ["admin-profiles"], queryFn: async () => (await supabase.from("profiles").select("id,full_name,phone,city,created_at").order("created_at", { ascending: false })).data ?? [] });
}
function useRoles() {
  return useQuery({ queryKey: ["admin-roles"], queryFn: async () => (await supabase.from("user_roles").select("user_id,role")).data ?? [] });
}
const Row = ({ children }: { children: React.ReactNode }) => <div className="rounded-2xl border border-border bg-card p-4">{children}</div>;

function Admin() {
  const { roles, loading } = useAuth();
  if (loading) return <Container className="py-10">Loading…</Container>;
  if (!roles.includes("admin")) return (
    <Container className="py-14 text-center">
      <h1 className="text-2xl font-semibold">Admins only</h1>
      <p className="mt-2 text-muted-foreground">Your account doesn't have admin access.</p>
      <Button asChild className="mt-4"><Link to="/dashboard">Back to dashboard</Link></Button>
    </Container>
  );
  return (
    <Container className="py-6">
      <h1 className="text-3xl font-semibold">Admin panel</h1>
      <Tabs defaultValue="approvals" className="mt-4">
        <TabsList className="no-scrollbar flex h-auto w-full justify-start overflow-x-auto rounded-full">
          {["approvals", "homestays", "enquiries", "cabs", "users", "villages", "culture", "messages", "reports"].map((t) => <TabsTrigger key={t} value={t} className="capitalize rounded-full">{t}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="approvals"><Approvals /></TabsContent>
        <TabsContent value="homestays"><HomestaysAdmin /></TabsContent>
        <TabsContent value="enquiries"><Enquiries /></TabsContent>
        <TabsContent value="cabs"><Cabs /></TabsContent>
        <TabsContent value="users"><Users /></TabsContent>
        <TabsContent value="villages"><VillagesAdmin /></TabsContent>
        <TabsContent value="culture"><CultureAdmin /></TabsContent>
        <TabsContent value="messages"><Messages /></TabsContent>
        <TabsContent value="reports"><Reports /></TabsContent>
      </Tabs>
    </Container>
  );
}

function Approvals() {
  const qc = useQueryClient();
  const profiles = useProfiles();
  const { data } = useQuery({ queryKey: ["admin-apps"], queryFn: async () => (await supabase.from("role_applications").select("*").order("created_at", { ascending: false })).data ?? [] });
  async function review(id: string, status: "approved" | "rejected") {
    const note = status === "rejected" ? (prompt("Reason (optional)") ?? "").slice(0, 300) : "";
    const { error } = await supabase.rpc("review_application", { _app_id: id, _status: status, _note: note });
    if (error) return toast.error(error.message);
    toast.success(`Application ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-apps"] });
    qc.invalidateQueries({ queryKey: ["admin-roles"] });
  }
  return (
    <div className="mt-4 grid gap-3">
      {!data?.length && <p className="text-muted-foreground">No applications yet.</p>}
      {data?.map((a) => {
        const p = profiles.data?.find((x) => x.id === a.user_id);
        return (
          <Row key={a.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-semibold">{p?.full_name || "Unnamed"} <span className="capitalize text-muted-foreground">· {a.role}</span></p><p className="text-xs text-muted-foreground">{p?.phone}</p></div>
              <StatusBadge s={a.status} />
            </div>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              {Object.entries((a.details ?? {}) as Record<string, string>).map(([k, v]) => <div key={k}><dt className="inline text-muted-foreground">{k.replace("_", " ")}: </dt><dd className="inline">{v}</dd></div>)}
              {!Object.keys(a.details as object).length && <p className="text-muted-foreground">Applicant hasn't submitted details yet.</p>}
            </dl>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => review(a.id, "approved")} disabled={a.status === "approved"}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => review(a.id, "rejected")} disabled={a.status === "rejected"}>Reject</Button>
            </div>
          </Row>
        );
      })}
    </div>
  );
}

function HomestaysAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-homestays"], queryFn: async () => (await supabase.from("homestays").select("*, villages(name)").order("created_at", { ascending: false })).data ?? [] });
  async function set(id: string, status: "approved" | "rejected" | "pending") {
    const { error } = await supabase.from("homestays").update({ status }).eq("id", id);
    if (error) return toast.error("Update failed");
    qc.invalidateQueries({ queryKey: ["admin-homestays"] });
    qc.invalidateQueries({ queryKey: ["homestays"] });
  }
  return (
    <div className="mt-4 grid gap-3">
      {!data?.length && <p className="text-muted-foreground">No homestays submitted yet.</p>}
      {data?.map((h) => (
        <Row key={h.id}>
          <div className="flex items-center justify-between gap-2"><p className="font-semibold">{h.name} <span className="text-muted-foreground">· {h.villages?.name}</span></p><StatusBadge s={h.status} /></div>
          <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => set(h.id, "approved")}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => set(h.id, "rejected")}>Reject</Button>
          </div>
        </Row>
      ))}
    </div>
  );
}

function Enquiries() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-enq"], queryFn: async () => (await supabase.from("trip_enquiries").select("*").order("created_at", { ascending: false })).data ?? [] });
  async function set(id: string, status: string) {
    const { error } = await supabase.from("trip_enquiries").update({ status }).eq("id", id);
    if (error) return toast.error("Update failed");
    qc.invalidateQueries({ queryKey: ["admin-enq"] });
  }
  return (
    <div className="mt-4 grid gap-3">
      {!data?.length && <p className="text-muted-foreground">No enquiries yet.</p>}
      {data?.map((e) => (
        <Row key={e.id}>
          <div className="flex items-center justify-between"><p className="font-semibold">{e.name} · <span className="capitalize">{e.kind}</span></p><StatusBadge s={e.status} /></div>
          <p className="text-sm">{e.phone} · {e.travellers} travellers{e.travel_date ? ` · ${e.travel_date}` : ""}</p>
          {e.message && <p className="mt-1 text-sm text-muted-foreground">{e.message}</p>}
          <div className="mt-3 flex gap-2">{["new", "contacted", "closed"].map((s) => <Button key={s} size="sm" variant={e.status === s ? "default" : "outline"} onClick={() => set(e.id, s)} className="capitalize">{s}</Button>)}</div>
        </Row>
      ))}
    </div>
  );
}

function Cabs() {
  const qc = useQueryClient();
  const profiles = useProfiles();
  const roles = useRoles();
  const drivers = (roles.data ?? []).filter((r) => r.role === "driver").map((r) => profiles.data?.find((p) => p.id === r.user_id)).filter(Boolean);
  const { data } = useQuery({ queryKey: ["admin-cabs"], queryFn: async () => (await supabase.from("cab_requests").select("*").order("travel_date")).data ?? [] });
  async function update(id: string, patch: { status?: string; driver_id?: string | null }) {
    const { error } = await supabase.from("cab_requests").update(patch).eq("id", id);
    if (error) return toast.error("Update failed");
    qc.invalidateQueries({ queryKey: ["admin-cabs"] });
  }
  return (
    <div className="mt-4 grid gap-3">
      {!data?.length && <p className="text-muted-foreground">No cab requests yet.</p>}
      {data?.map((c) => (
        <Row key={c.id}>
          <div className="flex items-center justify-between"><p className="font-semibold">{CAB_ROUTES[c.route]} · {c.travel_date}</p><StatusBadge s={c.status} /></div>
          <p className="text-sm">{c.pickup_point} · {c.passengers} pax · {c.phone}</p>
          {c.notes && <p className="text-sm text-muted-foreground">{c.notes}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <select value={c.driver_id ?? ""} onChange={(e) => update(c.id, { driver_id: e.target.value || null, status: e.target.value ? "driver_assigned" : "requested" })} className="h-9 rounded-full border border-input bg-card px-3 text-sm">
              <option value="">{drivers.length ? "Assign approved driver…" : "No approved drivers yet"}</option>
              {drivers.map((d) => <option key={d!.id} value={d!.id}>{d!.full_name || d!.phone}</option>)}
            </select>
            <Button size="sm" variant="outline" onClick={() => update(c.id, { status: "completed" })}>Completed</Button>
            <Button size="sm" variant="outline" onClick={() => update(c.id, { status: "cancelled" })}>Cancel</Button>
          </div>
        </Row>
      ))}
    </div>
  );
}

function Users() {
  const profiles = useProfiles();
  const roles = useRoles();
  const [q, setQ] = useState("");
  const list = (profiles.data ?? []).filter((p) => `${p.full_name} ${p.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mt-4 space-y-3">
      <Input placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.map((p) => (
        <Row key={p.id}>
          <p className="font-semibold">{p.full_name || "Unnamed"}</p>
          <p className="text-xs text-muted-foreground">{p.phone ?? "—"} · {p.city ?? "—"} · joined {new Date(p.created_at).toLocaleDateString()}</p>
          <div className="mt-2 flex gap-1.5">{roles.data?.filter((r) => r.user_id === p.id).map((r) => <span key={r.role} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize">{r.role}</span>)}</div>
        </Row>
      ))}
    </div>
  );
}

function VillagesAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-villages"], queryFn: async () => (await supabase.from("villages").select("*").order("name")).data ?? [] });
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const name = fd.name.trim().slice(0, 80), district = fd.district.trim().slice(0, 80), summary = fd.summary.trim().slice(0, 500);
    if (name.length < 2 || district.length < 2 || summary.length < 10) return toast.error("Fill name, district and a summary (10+ chars).");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("villages").insert({ name, district, summary, slug, altitude_m: fd.altitude_m ? Math.min(9000, Math.max(0, parseInt(fd.altitude_m))) : null, highlights: fd.highlights.split(",").map((h) => h.trim()).filter(Boolean).slice(0, 8) });
    if (error) return toast.error(error.message.includes("duplicate") ? "A village with that name exists." : "Couldn't add.");
    form.reset();
    qc.invalidateQueries({ queryKey: ["admin-villages"] });
    qc.invalidateQueries({ queryKey: ["villages"] });
  }
  async function toggle(id: string, published: boolean) {
    await supabase.from("villages").update({ published }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-villages"] });
    qc.invalidateQueries({ queryKey: ["villages"] });
  }
  return (
    <div className="mt-4 space-y-3">
      <form onSubmit={add} className="grid gap-2 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
        <Input name="name" placeholder="Village name" /><Input name="district" placeholder="District" />
        <Input name="altitude_m" type="number" placeholder="Altitude (m)" /><Input name="highlights" placeholder="Highlights, comma separated" />
        <Textarea name="summary" placeholder="Summary" className="sm:col-span-2" />
        <Button type="submit" className="sm:col-span-2">Add village</Button>
      </form>
      {data?.map((v) => (
        <Row key={v.id}><div className="flex items-center justify-between"><p className="font-semibold">{v.name} <span className="text-muted-foreground">· {v.district}</span></p><label className="flex items-center gap-2 text-sm">Published <Switch checked={v.published} onCheckedChange={(c) => toggle(v.id, c)} /></label></div></Row>
      ))}
    </div>
  );
}

function CultureAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-culture"], queryFn: async () => (await supabase.from("cultural_content").select("*").order("title")).data ?? [] });
  async function save(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (fd.title.trim().length < 2 || fd.body.trim().length < 20) return toast.error("Title and body are required.");
    const { error } = await supabase.from("cultural_content").update({ title: fd.title.trim().slice(0, 120), summary: fd.summary.trim().slice(0, 400), body: fd.body.trim().slice(0, 10000), updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error("Save failed");
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["culture"] });
    qc.invalidateQueries({ queryKey: ["admin-culture"] });
  }
  return (
    <div className="mt-4 space-y-3">
      {data?.map((c) => (
        <form key={c.id + c.updated_at} onSubmit={(e) => save(e, c.id)} className="grid gap-2 rounded-2xl border border-border bg-card p-4">
          <Input name="title" defaultValue={c.title} />
          <Input name="summary" defaultValue={c.summary} />
          <Textarea name="body" defaultValue={c.body} rows={5} />
          <Button type="submit" size="sm" className="justify-self-start">Save</Button>
        </form>
      ))}
    </div>
  );
}

function Messages() {
  const { data } = useQuery({ queryKey: ["admin-msgs"], queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [] });
  return (
    <div className="mt-4 grid gap-3">
      {!data?.length && <p className="text-muted-foreground">No messages yet.</p>}
      {data?.map((m) => <Row key={m.id}><p className="font-semibold">{m.name} · <a className="text-primary" href={`mailto:${m.email}`}>{m.email}</a></p><p className="mt-1 whitespace-pre-wrap text-sm">{m.message}</p></Row>)}
    </div>
  );
}

function Reports() {
  const { data } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const count = async (t: "profiles" | "trip_enquiries" | "cab_requests" | "homestays" | "trip_plans" | "role_applications", f?: [string, string]) => {
        let q = supabase.from(t).select("*", { count: "exact", head: true });
        if (f) q = q.eq(f[0], f[1]);
        return (await q).count ?? 0;
      };
      return {
        "Users": await count("profiles"),
        "Pending applications": await count("role_applications", ["status", "pending"]),
        "Homestays pending": await count("homestays", ["status", "pending"]),
        "Homestays live": await count("homestays", ["status", "approved"]),
        "New enquiries": await count("trip_enquiries", ["status", "new"]),
        "Open cab requests": await count("cab_requests", ["status", "requested"]),
      };
    },
  });
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {data && Object.entries(data).map(([k, v]) => <div key={k} className="rounded-3xl bg-primary p-5 text-primary-foreground"><p className="font-display text-4xl">{v}</p><p className="text-sm opacity-80">{k}</p></div>)}
    </div>
  );
}
