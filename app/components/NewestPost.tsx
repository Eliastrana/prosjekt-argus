import { getAllPosts } from "@/lib/blog";
import BlogCard from "./BlogCard";
import Link from "next/link";

export default function NewestPost() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;

  const [primary, ...others] = posts;

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Nyeste blogginnlegg</h2>
          <p className="mt-1 text-sm text-muted">Siste oppdateringer om prosjektet.</p>
        </div>

        <Link
          href="/blog"
          className="text-sm text-muted hover:text-foreground transition"
        >
          Se alle →
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-3">
          <BlogCard post={primary} />
        </div>

        <div className="md:col-span-3 grid gap-4 md:grid-cols-2">
          {others.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
