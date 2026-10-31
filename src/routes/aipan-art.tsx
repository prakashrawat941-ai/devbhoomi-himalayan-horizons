import { createFileRoute } from "@tanstack/react-router";
import { CultureArticle } from "@/components/CultureArticle";
import aipan from "@/assets/aipan.jpg";

export const Route = createFileRoute("/aipan-art")({
  head: () => ({
    meta: [
      { title: "Aipan Art — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "The sacred rice-paste folk art of Kumaon, drawn freehand on red ochre." },
      { property: "og:title", content: "Aipan Art" },
      { property: "og:description", content: "The sacred rice-paste folk art of Kumaon, drawn freehand on red ochre." },
    ],
  }),
  component: () => <CultureArticle slug="aipan" eyebrow="Folk art" image={aipan} />,
});
