// app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { blogMdxComponents } from "@/app/components/BlogContent";
import { AuthorByline } from "@/app/components/AuthorByline";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("no-NO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getReadingTime(content: string) {
  const words = content
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

  return {
    title: `${post.frontmatter.title} | Prosjekt Argus`,
    description: post.frontmatter.excerpt,
  };
}

// ✅ params is async in newer Next versions
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const { frontmatter, content } = post;
  const readingTime = getReadingTime(content);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="blog-post-column mx-auto max-w-5xl px-6 pb-24 pt-12 sm:pt-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <span aria-hidden="true">←</span>
          Alle innlegg
        </Link>

        <header className="mt-10 border-b border-foreground/10 pb-10 sm:pb-14">
          <p className="text-sm font-medium text-accent">
            Prosjektjournal
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl">
            {frontmatter.title}
          </h1>

          {frontmatter.excerpt ? (
            <p className="mt-6 text-lg leading-8 text-muted">
              {frontmatter.excerpt}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
            <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
            <span aria-hidden="true" className="size-1 rounded-full bg-foreground/25" />
            <span>{readingTime} min lesetid</span>
          </div>

          <AuthorByline author={frontmatter.author} />

          {!!frontmatter.tags?.length && (
            <div className="mt-6 flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-foreground/10 bg-card px-3 py-1 text-xs font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <article className="blog-prose mt-10 sm:mt-14">
          <MDXRemote
            source={content}
            components={blogMdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </article>

        <footer className="mt-16 border-t border-foreground/10 pt-8">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-3 font-semibold text-foreground"
          >
            <span className="grid size-10 place-items-center rounded-full border border-foreground/10 transition group-hover:border-accent/40 group-hover:bg-tint">
              <span aria-hidden="true">←</span>
            </span>
            Tilbake til prosjektjournalen
          </Link>
        </footer>
      </div>
    </main>
  );
}
