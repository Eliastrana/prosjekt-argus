import { getAllPosts } from "@/lib/blog";
import BlogCard from "../components/BlogCard";

export const metadata = {
  title: "Blogg",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featuredPost, ...remainingPosts] = posts;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-14 sm:pt-20">
        <header className="border-b border-foreground/10 pb-10 sm:pb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Prosjektjournal
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Innsikt underveis.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted lg:justify-self-end">
              Notater fra arbeidet med data, værmodeller og sammensatte
              naturhendelser — fra de første spørsmålene til valgene som former
              prosjektet.
            </p>
          </div>
        </header>

        {featuredPost ? (
          <section className="mt-10" aria-labelledby="latest-post">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="latest-post" className="text-sm font-semibold text-foreground">
                Siste innlegg
              </h2>
              <span className="text-sm text-muted">{posts.length} innlegg</span>
            </div>
            <BlogCard post={featuredPost} featured />
          </section>
        ) : null}

        {remainingPosts.length > 0 ? (
          <section className="mt-16" aria-labelledby="all-posts">
            <h2 id="all-posts" className="text-2xl font-semibold tracking-tight">
              Fra arkivet
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {remainingPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
