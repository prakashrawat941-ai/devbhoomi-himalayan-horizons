import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { villagesQuery } from "@/lib/data";
import { PageHero, Container } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/villages")({
  head: () => ({
    meta: [
      { title: "Explore Hidden Villages — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Munsiyari, Jageshwar, Khati and more: quiet Uttarakhand villages off the tourist trail." },
      { property: "og:title", content: "Explore Hidden Villages of Uttarakhand" },
      { property: "og:description", content: "Quiet Kumaon villages off the tourist trail." },
    ],
  }),
  component: Villages,
});

function Villages() {
  const { data, isLoading, error } = useQuery(villagesQuery);
  return (
    <>
      <PageHero eyebrow="Explore" title="Hidden villages" intro="Places where the road ends and the hospitality begins." />
      <Container className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-3xl" />)}
        {error && <p className="text-destructive">Couldn't load villages. Please try again.</p>}
        {data?.map((v) => (
          <div key={v.id} className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ochre"><MapPin className="size-3" /> {v.district}{v.altitude_m ? ` · ${v.altitude_m} m` : ""}</div>
            <h2 className="mt-2 text-2xl font-semibold">{v.name}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{v.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {v.highlights.map((h) => <span key={h} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{h}</span>)}
            </div>
            <Link to="/trip-planner" search={{ village: v.name }} className="mt-4 text-sm font-semibold text-primary">Add to trip →</Link>
          </div>
        ))}
      </Container>
    </>
  );
}
