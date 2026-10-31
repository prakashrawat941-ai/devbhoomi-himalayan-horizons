import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Mountain, Home as HomeIcon, Laptop, Car } from "lucide-react";
import hero from "@/assets/hero.jpg";
import aipan from "@/assets/aipan.jpg";
import homestay from "@/assets/homestay.jpg";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/AppShell";
import { villagesQuery } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Devbhoomi Himalayan Horizons — Live a little deeper." },
      { name: "description", content: "Discover hidden Kumaon villages, stay with local families, and plan slow journeys through Uttarakhand." },
      { property: "og:title", content: "Devbhoomi Himalayan Horizons" },
      { property: "og:description", content: "Hidden villages, homestays and living culture of Uttarakhand. Live a little deeper." },
    ],
  }),
  component: Index,
});

const QUICK = [
  { to: "/villages", label: "Villages", icon: Mountain },
  { to: "/homestays", label: "Homestays", icon: HomeIcon },
  { to: "/workation", label: "Workation", icon: Laptop },
  { to: "/cab", label: "Cab", icon: Car },
] as const;

function Index() {
  const { data: villages } = useQuery(villagesQuery);
  return (
    <>
      <section className="relative -mt-14 h-[92svh] min-h-[560px] overflow-hidden">
        <img src={hero} alt="Stone village beneath Himalayan peaks at dawn" width={1088} height={1600} className="absolute inset-0 size-full object-cover" />
        <div className="bg-dusk absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-12 text-snow">
          <p className="fade-up text-xs font-bold uppercase tracking-[0.3em] text-accent">Devbhoomi · Uttarakhand</p>
          <h1 className="fade-up mt-3 text-5xl font-semibold leading-[1.02] sm:text-7xl">Live a little<br /><em className="font-normal">deeper.</em></h1>
          <p className="fade-up mt-4 max-w-md text-snow/85">Hidden Kumaon villages, family homestays and festivals that still belong to the people who keep them.</p>
          <div className="fade-up mt-6 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/trip-planner">Plan my trip <ArrowRight /></Link></Button>
            <Button asChild variant="glass" size="lg"><Link to="/villages">Explore villages</Link></Button>
          </div>
        </div>
      </section>

      <Container className="-mt-6 relative z-10">
        <div className="grid grid-cols-4 gap-2 rounded-3xl bg-card p-3 shadow-lift">
          {QUICK.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-2 rounded-2xl py-3 text-xs font-semibold hover:bg-secondary">
              <span className="grid size-11 place-items-center rounded-full bg-secondary text-primary"><Icon className="size-5" /></span>
              {label}
            </Link>
          ))}
        </div>
      </Container>

      <Container className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold sm:text-3xl">Hidden villages</h2>
          <Link to="/villages" className="text-sm font-semibold text-ochre">See all</Link>
        </div>
      </Container>
      <div className="no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-2 lg:mx-auto lg:max-w-6xl">
        {(villages ?? Array.from({ length: 4 })).map((v, i) => (
          <Link key={v?.id ?? i} to="/villages" className="w-64 shrink-0 snap-start rounded-3xl bg-primary p-5 text-primary-foreground shadow-soft">
            <p className="text-xs uppercase tracking-widest text-accent">{v?.district ?? "…"}</p>
            <h3 className="mt-1 text-2xl">{v?.name ?? "Loading"}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-primary-foreground/80">{v?.summary}</p>
            {v?.altitude_m && <p className="mt-4 text-xs font-semibold">{v.altitude_m.toLocaleString()} m</p>}
          </Link>
        ))}
      </div>

      <Container className="mt-14 grid gap-4 sm:grid-cols-2">
        <Link to="/aipan-art" className="group relative h-72 overflow-hidden rounded-3xl">
          <img src={aipan} alt="Aipan folk art" loading="lazy" width={1024} height={1024} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="bg-dusk absolute inset-0" />
          <div className="absolute bottom-0 p-5 text-snow">
            <p className="text-xs uppercase tracking-widest text-accent">Culture</p>
            <h3 className="text-2xl">Aipan — art drawn with fingertips</h3>
          </div>
        </Link>
        <Link to="/workation" className="group relative h-72 overflow-hidden rounded-3xl">
          <img src={homestay} alt="Homestay workspace with mountain view" loading="lazy" width={1024} height={1024} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="bg-dusk absolute inset-0" />
          <div className="absolute bottom-0 p-5 text-snow">
            <p className="text-xs uppercase tracking-widest text-accent">Workation</p>
            <h3 className="text-2xl">Your desk, above the clouds</h3>
          </div>
        </Link>
      </Container>

      <Container className="mt-14">
        <h2 className="text-2xl font-semibold sm:text-3xl">Festivals & faith</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([
            ["/nanda-devi-raj-jat", "Nanda Devi Raj Jat", "The 12-year pilgrimage"],
            ["/golju-devta", "Golju Devta", "God of justice"],
            ["/dana-holi", "Dana Holi", "Holi in song"],
            ["/holi-traditions", "Local Holi", "Baithki · Khadi · Mahila"],
          ] as const).map(([to, t, s]) => (
            <Link key={to} to={to} className="rounded-3xl border border-border bg-card p-4 shadow-soft hover:-translate-y-0.5 transition-transform">
              <div className="aipan-border mb-3 w-10 rounded" />
              <h3 className="text-lg leading-tight">{t}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s}</p>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="mt-14">
        <div className="rounded-3xl bg-ochre-gradient p-6 text-ochre-foreground sm:p-10">
          <h2 className="text-3xl font-semibold">Host travellers in your village?</h2>
          <p className="mt-2 max-w-lg opacity-90">Homestay hosts and drivers can apply to join. Every partner is reviewed by our team before going live.</p>
          <Button asChild variant="glass" className="mt-5"><Link to="/register">Apply as a partner</Link></Button>
        </div>
      </Container>
    </>
  );
}
