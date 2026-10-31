import { createFileRoute } from "@tanstack/react-router";
import { CultureArticle } from "@/components/CultureArticle";


export const Route = createFileRoute("/golju-devta")({
  head: () => ({
    meta: [
      { title: "Golju Devta — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Kumaon's god of justice and the temple of a thousand bells at Chitai." },
      { property: "og:title", content: "Golju Devta" },
      { property: "og:description", content: "Kumaon's god of justice and the temple of a thousand bells at Chitai." },
    ],
  }),
  component: () => <CultureArticle slug="golju-devta" eyebrow="Faith" />,
});
