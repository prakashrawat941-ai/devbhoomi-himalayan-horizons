import { createFileRoute } from "@tanstack/react-router";
import { CultureArticle } from "@/components/CultureArticle";


export const Route = createFileRoute("/dana-holi")({
  head: () => ({
    meta: [
      { title: "Dana Holi — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "A musical, community-led Holi of Kumaon's villages." },
      { property: "og:title", content: "Dana Holi" },
      { property: "og:description", content: "A musical, community-led Holi of Kumaon's villages." },
    ],
  }),
  component: () => <CultureArticle slug="dana-holi" eyebrow="Festival" />,
});
