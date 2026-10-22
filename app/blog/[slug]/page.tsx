// app/blog/[slug]/page.tsx
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
      <div className="blog-post-column page-shell">
        <header className="border-b border-foreground/10 pb-10 sm:pb-14">
          <h1 className="page-title">
            {frontmatter.title}
          </h1>

          <h2 className="mt-6 text-lg leading-7 text-muted sm:text-xl">
            {frontmatter.excerpt}
          </h2>

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
            options={{ mdxOptions: { format: "mdx", remarkPlugins: [remarkGfm] } }}
          />
        </article>

      </div>
    </main>
  );
}
