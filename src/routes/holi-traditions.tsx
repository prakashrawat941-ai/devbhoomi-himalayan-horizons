import { createFileRoute } from "@tanstack/react-router";
import { CultureArticle } from "@/components/CultureArticle";


export const Route = createFileRoute("/holi-traditions")({
  head: () => ({
    meta: [
      { title: "Local Holi Traditions — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "Baithki, Khadi and Mahila Holi — the singing Holi of Kumaon." },
      { property: "og:title", content: "Local Holi Traditions" },
      { property: "og:description", content: "Baithki, Khadi and Mahila Holi — the singing Holi of Kumaon." },
    ],
  }),
  component: () => <CultureArticle slug="kumaoni-holi" eyebrow="Festival" />,
});
