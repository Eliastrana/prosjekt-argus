import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { AuthorByline } from "./AuthorByline";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogCard({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  const { slug, frontmatter } = post;

  return (
    <Link
      href={`/blog/${slug}`}
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-card",
        "p-6 transition duration-300",
        "hover:border-accent/40",
        featured ? "min-h-[22rem] justify-end sm:p-9" : "min-h-[17rem]",
      ].join(" ")}
    >
      <div className="mb-auto flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <time
            dateTime={frontmatter.date}
            className="text-sm font-medium text-muted"
          >
            {formatDate(frontmatter.date)}
          </time>
          {frontmatter.author ? (
            <>
              <span
                aria-hidden="true"
                className="size-1 shrink-0 rounded-full bg-foreground/25"
              />
              <AuthorByline author={frontmatter.author} size="sm" />
            </>
          ) : null}
        </div>
        <span className="grid size-9 place-items-center rounded-full border border-foreground/10 text-lg transition group-hover:border-accent/40 group-hover:bg-tint group-hover:text-accent">
          <span aria-hidden="true">↗</span>
        </span>
      </div>

      <div className={featured ? "mt-20 max-w-2xl" : "mt-12"}>
        <h2
          className={[
            "font-semibold leading-tight tracking-[-0.025em] text-foreground",
            featured ? "text-3xl sm:text-4xl" : "text-xl",
          ].join(" ")}
        >
          {frontmatter.title}
        </h2>

        {frontmatter.excerpt ? (
          <p className={featured ? "mt-4 text-base leading-7 text-muted" : "mt-3 text-sm leading-6 text-muted"}>
            {frontmatter.excerpt}
          </p>
        ) : null}

        {!!frontmatter.tags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-card-2 px-3 py-1 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
