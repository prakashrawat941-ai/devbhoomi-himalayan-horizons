import { createFileRoute } from "@tanstack/react-router";
import { Wifi, Coffee, Mountain, Clock } from "lucide-react";
import homestay from "@/assets/homestay.jpg";
import { PageHero, Container } from "@/components/AppShell";
import { EnquiryForm } from "@/components/EnquiryForm";

export const Route = createFileRoute("/workation")({
  head: () => ({
    meta: [
      { title: "Himalayan Workation — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Work remotely from quiet Kumaon village homestays. Tell us your needs and we'll match a stay." },
      { property: "og:title", content: "Workation in the Himalaya" },
      { property: "og:description", content: "Remote work from Kumaon village homestays." },
    ],
  }),
  component: Workation,
});

const POINTS = [
  { icon: Wifi, t: "Connectivity checked", d: "We ask hosts about network and power backup — tell us your minimum needs." },
  { icon: Clock, t: "Stays of 1–4 weeks", d: "Slower stays let you settle into village rhythm." },
  { icon: Coffee, t: "Home-cooked meals", d: "Mandua roti, bhatt ki churkani, and endless chai." },
  { icon: Mountain, t: "Weekend walks", d: "Forest trails and temples a short walk away." },
];

function Workation() {
  return (
    <>
      <PageHero eyebrow="Workation" title="Your desk, above the clouds" intro="We don't list fake availability. Send your dates and needs; we'll check with hosts and get back to you." image={homestay} />
      <Container className="grid gap-8 py-8 lg:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {POINTS.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-5">
              <Icon className="size-6 text-ochre" />
              <h3 className="mt-3 text-lg">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div>
          <h2 className="mb-3 text-2xl font-semibold">Request a workation stay</h2>
          <EnquiryForm kind="workation" defaultTravellers={1} defaultMessage="Remote work stay. Minimum internet speed needed: " />
        </div>
      </Container>
    </>
  );
}
