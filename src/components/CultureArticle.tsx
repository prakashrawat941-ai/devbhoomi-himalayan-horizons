import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { cultureQuery } from "@/lib/data";
import { PageHero, Container } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

export function CultureArticle({ slug, eyebrow, image }: { slug: string; eyebrow: string; image?: string }) {
  const { data, isLoading, error } = useQuery(cultureQuery(slug));
  if (isLoading) return <Container className="py-10 space-y-3"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-40" /></Container>;
  if (error || !data) return <Container className="py-10"><p className="text-muted-foreground">This story couldn't be loaded right now.</p></Container>;
  return (
    <article>
      <PageHero eyebrow={eyebrow} title={data.title} intro={data.summary} image={image} />
      <div className="aipan-border" />
      <Container className="py-8">
        <div className="max-w-2xl space-y-4 text-lg leading-relaxed">
          {data.body.split(/(?<=\.)\s+(?=[A-Z])/).reduce<string[][]>((acc, s, i) => { if (i % 3 === 0) acc.push([]); acc[acc.length - 1].push(s); return acc; }, []).map((p, i) => (
            <p key={i}>{p.join(" ")}</p>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          <Link to="/trip-planner" className="inline-flex h-11 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground">Plan a trip around it</Link>
          <Link to="/culture" className="inline-flex h-11 items-center rounded-full border border-input px-5 font-semibold">More culture</Link>
        </div>
      </Container>
    </article>
  );
}
