// lib/blog.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogFrontmatter = {
  title: string;
  date: string; // ISO string
  excerpt?: string;
  tags?: string[];
  /** Who wrote the post: "Elias" or "Claude". Shown next to the date. */
  author?: string;
};

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    throw new Error(`Missing blog directory at: ${BLOG_DIR}`);
  }
}

export function getAllPosts(): BlogPost[] {
  ensureBlogDir();

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx?$/, "");
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    const frontmatter: BlogFrontmatter = {
      title: data.title ?? slug,
      date: data.date ?? "1970-01-01",
      excerpt: data.excerpt ?? "",
      tags: data.tags ?? [],
      author: data.author ?? "",
    };

    return { slug, frontmatter, content };
  });

  // Sort newest first by date
  return posts.sort((a, b) => {
    const da = new Date(a.frontmatter.date).getTime();
    const db = new Date(b.frontmatter.date).getTime();
    return db - da;
  });
}

export function getPostBySlug(slug: string): BlogPost | null {
  ensureBlogDir();

  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const frontmatter: BlogFrontmatter = {
    title: data.title ?? slug,
    date: data.date ?? "1970-01-01",
    excerpt: data.excerpt ?? "",
    tags: data.tags ?? [],
    author: data.author ?? "",
  };

  return { slug, frontmatter, content };
}

export function getNewestPost(): BlogPost | null {
  const posts = getAllPosts();
  return posts.length > 0 ? posts[0] : null;
}
