import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import homestayImg from "@/assets/homestay.jpg";
import { homestaysQuery, signedImage } from "@/lib/data";
import { PageHero, Container } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/homestays")({
  head: () => ({
    meta: [
      { title: "Village Homestays — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Stay with Kumaoni families in verified village homestays across Uttarakhand." },
      { property: "og:title", content: "Village Homestays in Uttarakhand" },
      { property: "og:description", content: "Verified family homestays in hidden Kumaon villages." },
    ],
  }),
  component: Homestays,
});

function Thumb({ path }: { path: string | null }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => { signedImage(path).then(setSrc); }, [path]);
  return <img src={src ?? homestayImg} alt="" loading="lazy" className="h-48 w-full object-cover" />;
}

function Homestays() {
  const { data, isLoading, error } = useQuery(homestaysQuery);
  return (
    <>
      <PageHero eyebrow="Stay" title="Village homestays" intro="Every listing is submitted by a local host and approved by our team. Tariffs shown are the host's own notes — confirm by enquiry." image={homestayImg} />
      <Container className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-3xl" />)}
        {error && <p className="text-destructive">Couldn't load homestays.</p>}
        {data && data.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">No approved homestays yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Our first hosts are being onboarded. Send an enquiry and we'll suggest options.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button asChild><Link to="/trip-planner">Send an enquiry</Link></Button>
              <Button asChild variant="outline"><Link to="/register">List your homestay</Link></Button>
            </div>
          </div>
        )}
        {data?.map((h) => (
          <div key={h.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <Thumb path={h.image_path} />
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ochre">{h.villages?.name ?? "Uttarakhand"}</p>
              <h2 className="mt-1 text-xl font-semibold">{h.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{h.description}</p>
              <p className="mt-3 text-sm">{h.rooms} room{h.rooms > 1 ? "s" : ""}{h.tariff_note ? ` · ${h.tariff_note}` : ""}</p>
              <Button asChild size="sm" className="mt-4"><Link to="/trip-planner">Enquire</Link></Button>
            </div>
          </div>
        ))}
      </Container>
    </>
  );
}
