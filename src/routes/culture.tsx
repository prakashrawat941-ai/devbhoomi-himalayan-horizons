import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { cultureListQuery } from "@/lib/data";
import { Container } from "@/components/AppShell";
import { CultureArticle } from "@/components/CultureArticle";

export const Route = createFileRoute("/culture")({
  head: () => ({
    meta: [
      { title: "Uttarakhand Culture — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Folk art, festivals, deities and traditions of Garhwal and Kumaon." },
      { property: "og:title", content: "Uttarakhand Culture" },
      { property: "og:description", content: "Aipan, Raj Jat, Golju Devta, Kumaoni Holi and more." },
    ],
  }),
  component: Culture,
});

const ROUTE_FOR: Record<string, string> = {
  aipan: "/aipan-art",
  "nanda-devi-raj-jat": "/nanda-devi-raj-jat",
  "golju-devta": "/golju-devta",
  "dana-holi": "/dana-holi",
  "kumaoni-holi": "/holi-traditions",
};

function Culture() {
  const { data } = useQuery(cultureListQuery);
  return (
    <>
      <CultureArticle slug="uttarakhand-culture" eyebrow="Devbhoomi" />
      <Container className="pb-10">
        <h2 className="text-2xl font-semibold">Go deeper</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data?.filter((c) => ROUTE_FOR[c.slug]).map((c) => (
            <Link key={c.id} to={ROUTE_FOR[c.slug] as "/aipan-art"} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-ochre">{c.category}</p>
              <h3 className="mt-1 text-xl">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.summary}</p>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}
