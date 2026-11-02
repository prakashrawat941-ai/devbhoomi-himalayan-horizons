import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Car, Map, Mountain, Home as HomeIcon, Wifi, Leaf, Users, Laptop, Trees, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";
import homestay from "@/assets/homestay.jpg";
import jageshwar from "@/assets/jageshwar.jpg";
import binsar from "@/assets/binsar.jpg";
import munsiyari from "@/assets/munsiyari.jpg";
import workation from "@/assets/workation.jpg";
import food from "@/assets/food.jpg";
import walk from "@/assets/walk.jpg";
import crafts from "@/assets/crafts.jpg";
import spring from "@/assets/spring.jpg";
import monsoon from "@/assets/monsoon.jpg";
import autumn from "@/assets/autumn.jpg";
import winter from "@/assets/winter.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Devbhoomi Himalayan Horizons — Live a little deeper." },
      { name: "description", content: "Village homestays, mountain workations, trip planning and rides across Uttarakhand." },
      { property: "og:title", content: "Devbhoomi Himalayan Horizons" },
      { property: "og:description", content: "Stay in village homestays, work with a Himalayan view and plan slower journeys through Uttarakhand." },
    ],
  }),
  component: Index,
});

const wrap = "mx-auto w-full max-w-6xl px-4 sm:px-6";
const eyebrow = "text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground";

const ACTIONS = [
  { to: "/cab", img: hero, icon: Car, title: "Instant Cab Booking", sub: "Delhi & Chandigarh to Almora and more routes" },
  { to: "/trip-planner", img: binsar, icon: Map, title: "Trip Planner", sub: "Plan your perfect Uttarakhand trip" },
  { to: "/villages", img: munsiyari, icon: Mountain, title: "Explore Villages", sub: "Discover hidden villages and homestays" },
] as const;

const PLACES = [
  { img: hero, tag: "Sacred nature", name: "Almora", sub: "Quiet villages, forests and open skies" },
  { img: jageshwar, tag: "Heritage & temples", name: "Jageshwar", sub: "Ancient temples in deodar forests" },
  { img: binsar, tag: "Lakes & meadows", name: "Binsar", sub: "Panoramic Himalayan views" },
  { img: munsiyari, tag: "Offbeat villages", name: "Munsiyari", sub: "Untouched beauty and local life" },
];

const STAY = [
  { icon: HomeIcon, t: "Village Homestays", s: "Stay with local families and experience real life" },
  { icon: Wifi, t: "Stay Connected", s: "Hosts share internet details for each stay" },
  { icon: Leaf, t: "Local Food & Culture", s: "Home-cooked meals, traditions and stories" },
  { icon: Users, t: "Meaningful Travel", s: "Support local communities and sustainable tourism" },
];

const CULTURE = [
  { img: food, t: "Local Food & Homestays", s: "Home-cooked meals, warm people", to: "/homestays" },
  { img: walk, t: "Village Walks & Experiences", s: "Forests, rivers and local life", to: "/villages" },
  { img: crafts, t: "Crafts & Traditions", s: "Learn, participate, support artisans", to: "/culture" },
] as const;

const WHY = [
  { icon: Mountain, t: "Local Homestays", s: "Partner stays reviewed by our team" },
  { icon: Leaf, t: "Responsible Tourism", s: "Support local communities and nature" },
  { icon: HeartHandshake, t: "Curated Experiences", s: "Authentic, offbeat and peaceful" },
  { icon: ShieldCheck, t: "Reviewed Partners", s: "Drivers and hosts approved before going live" },
];

const SEASONS = [
  { img: spring, t: "Spring", s: "Blooming rhododendrons" },
  { img: binsar, t: "Summer", s: "Green meadows" },
  { img: monsoon, t: "Monsoon", s: "Misty mountains" },
  { img: autumn, t: "Autumn", s: "Clear views" },
  { img: winter, t: "Winter", s: "Snow and silence" },
];

function Index() {
  return (
    <div className="space-y-10 pb-6 sm:space-y-14">
      {/* Hero */}
      <section className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className={`${wrap} order-2 pt-6 lg:order-1 lg:max-w-none lg:py-14 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]`}>
          <p className={eyebrow}>Slower travel, deeper connections</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.05] sm:text-6xl">A little closer<br />to <span className="text-primary">wonder.</span></h1>
          <p className="mt-4 max-w-md text-muted-foreground">Stay in authentic village homestays, experience real Pahadi life, and explore a slower, more meaningful Uttarakhand.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full"><Link to="/villages">Explore Villages <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full"><Link to="/trip-planner">Plan your trip</Link></Button>
          </div>
        </div>
        <div className="relative order-1 h-64 overflow-hidden sm:h-80 lg:order-2 lg:h-auto lg:min-h-[440px]">
          <img src={hero} alt="Himalayan village beneath snowy peaks" width={1088} height={1600} className="absolute inset-0 size-full object-cover" />
          <p className="absolute bottom-5 right-5 rotate-[-6deg] text-right font-display text-xl italic leading-tight text-snow drop-shadow-lg sm:text-3xl">Real People<br />Real Villages<br />Bigger Stories</p>
        </div>
      </section>

      {/* Action cards */}
      <section className={`${wrap} grid gap-3 md:grid-cols-3`}>
        {ACTIONS.map(({ to, img, icon: Icon, title, sub }) => (
          <Link key={to} to={to} className="group grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-soft">
            <img src={img} alt="" loading="lazy" className="h-20 w-[88px] rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold"><Icon className="size-4 shrink-0 text-primary" /><span className="truncate">{title}</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            </div>
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border transition-transform group-hover:translate-x-0.5"><ArrowRight className="size-4" /></span>
          </Link>
        ))}
      </section>

      {/* Places */}
      <section className={wrap}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className={eyebrow}>Explore Uttarakhand</p><h2 className="mt-1 text-3xl font-semibold sm:text-4xl">Places to Discover</h2></div>
          <Link to="/villages" className="text-sm font-semibold text-primary">View all destinations →</Link>
        </div>
        <div className="no-scrollbar -mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {PLACES.map((p) => (
            <Link key={p.name} to="/villages" className="w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:w-auto">
              <div className="relative h-40">
                <img src={p.img} alt={p.name} loading="lazy" className="size-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{p.tag}</span>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0"><h3 className="text-lg">{p.name}</h3><p className="truncate text-xs text-muted-foreground">{p.sub}</p></div>
                <ArrowRight className="size-4 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stay longer */}
      <section className="bg-secondary py-10">
        <div className={`${wrap} grid gap-6 lg:grid-cols-2 lg:items-center`}>
          <div>
            <p className={eyebrow}>Slower travel, deeper connections</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-5xl">Stay a little longer,<br /><em className="font-normal text-primary">live a little deeper.</em></h2>
            <p className="mt-3 max-w-lg text-muted-foreground">More than a trip — a chance to be part of Pahadi life. Support local families, explore nature, enjoy local food and travel slower.</p>
            <Button asChild className="mt-5 rounded-full"><Link to="/homestays">Explore longer stays <ArrowRight /></Link></Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {STAY.map(({ icon: Icon, t, s }) => (
              <div key={t} className="rounded-2xl bg-card p-4 shadow-soft">
                <Icon className="size-6 text-primary" />
                <p className="mt-2 text-sm font-semibold">{t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workation */}
      <section className={`${wrap} grid gap-6 lg:grid-cols-2 lg:items-center`}>
        <div>
          <p className={eyebrow}>Workation in Uttarakhand</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-5xl">Your workday,<br />with a Himalayan view.</h2>
          <p className="mt-3 max-w-lg text-muted-foreground">Leave city pollution behind. Work from peaceful village homestays, with clean air, mountain walks and fresh local food.</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[[Wifi, "Internet details", "Shared by hosts per stay"], [Laptop, "Workspace", "Quiet places to work"], [Trees, "Clean air", "Focus and feel alive"]].map(([Icon, t, s]) => {
              const I = Icon as typeof Wifi;
              return (
                <div key={t as string}><I className="size-6 text-primary" /><p className="mt-1 text-sm font-semibold">{t as string}</p><p className="text-xs text-muted-foreground">{s as string}</p></div>
              );
            })}
          </div>
          <Button asChild variant="outline" className="mt-5 rounded-full"><Link to="/workation">Explore workations <ArrowRight /></Link></Button>
        </div>
        <img src={workation} alt="Working on a laptop with a Himalayan view" loading="lazy" width={1024} height={768} className="h-64 w-full rounded-3xl object-cover sm:h-96" />
      </section>

      {/* Culture */}
      <section className={`${wrap} grid gap-6 lg:grid-cols-[0.8fr_2fr]`}>
        <div>
          <p className={eyebrow}>More than a destination</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">Meet the culture.<br />Taste the place.</h2>
          <p className="mt-3 text-sm text-muted-foreground">Village homestays, regional cuisine, craft traditions and local guides — experiences that bring you closer to Himalayan life.</p>
          <Button asChild variant="outline" className="mt-5 rounded-full"><Link to="/culture">Discover local experiences <ArrowRight /></Link></Button>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
          {CULTURE.map((c) => (
            <Link key={c.t} to={c.to} className="w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:w-auto">
              <img src={c.img} alt={c.t} loading="lazy" className="h-40 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0"><p className="text-sm font-semibold">{c.t}</p><p className="text-xs text-muted-foreground">{c.s}</p></div>
                <ArrowRight className="size-4 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className={`${wrap} grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-center`}>
        <div>
          <p className={eyebrow}>Why travel with us</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">A more meaningful<br /><span className="text-primary">way to explore Uttarakhand.</span></h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {WHY.map(({ icon: Icon, t, s }) => (
            <div key={t} className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full border border-border bg-card"><Icon className="size-5 text-primary" /></span>
              <p className="mt-2 text-sm font-semibold">{t}</p>
              <p className="text-xs text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seasons */}
      <section className={wrap}>
        <p className={eyebrow}>Experience Uttarakhand through the seasons</p>
        <div className="no-scrollbar -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
          {SEASONS.map((s) => (
            <div key={s.t} className="relative h-32 w-40 shrink-0 snap-start overflow-hidden rounded-2xl sm:w-auto">
              <img src={s.img} alt={s.t} loading="lazy" className="size-full object-cover" />
              <div className="bg-dusk absolute inset-0" />
              <div className="absolute bottom-2 left-3 text-snow"><p className="font-semibold">{s.t}</p><p className="text-[11px] opacity-85">{s.s}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={wrap}>
        <div className="flex flex-col gap-4 rounded-3xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Your next chapter</p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">Your Uttarakhand journey starts here.</h2>
            <p className="mt-1 text-sm text-primary-foreground/80">Create an account to plan trips, explore villages and connect with local families.</p>
          </div>
          <Button asChild variant="secondary" className="shrink-0 rounded-full"><Link to="/trip-planner">Plan your trip <ArrowRight /></Link></Button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Sparkles className="size-3" /> Hosts and drivers can <Link to="/register" className="font-semibold text-primary">apply as partners</Link></div>
      </section>
      <img src={homestay} alt="" hidden />
    </div>
  );
}
