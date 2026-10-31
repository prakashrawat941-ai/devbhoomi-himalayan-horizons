import { createFileRoute } from "@tanstack/react-router";
import { CultureArticle } from "@/components/CultureArticle";


export const Route = createFileRoute("/nanda-devi-raj-jat")({
  head: () => ({
    meta: [
      { title: "Nanda Devi Raj Jat — Devbhoomi Himalayan Horizons" },
      { name: "description", content: "The Himalayan pilgrimage escorting Goddess Nanda, held roughly every twelve years." },
      { property: "og:title", content: "Nanda Devi Raj Jat" },
      { property: "og:description", content: "The Himalayan pilgrimage escorting Goddess Nanda, held roughly every twelve years." },
    ],
  }),
  component: () => <CultureArticle slug="nanda-devi-raj-jat" eyebrow="Pilgrimage" />,
});
