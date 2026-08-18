import type {
  ComponentPropsWithoutRef,
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import Image from "next/image";

type ContentBlockProps = {
  children: ReactNode;
};

type InfoCardProps = ContentBlockProps & {
  title: string;
  eyebrow?: string;
};

type CalloutProps = ContentBlockProps & {
  title?: string;
};

export function CardGrid({ children }: ContentBlockProps) {
  return <div className="article-grid">{children}</div>;
}

export function InfoCard({ children, eyebrow, title }: InfoCardProps) {
  return (
    <section className="article-info-card">
      {eyebrow ? <p className="article-info-card__eyebrow">{eyebrow}</p> : null}
      <h3 className="article-info-card__title">{title}</h3>
      <div className="article-info-card__body">{children}</div>
    </section>
  );
}

export function Callout({ children, title = "Merk" }: CalloutProps) {
  return (
    <aside className="article-callout">
      <p className="article-callout__title">{title}</p>
      <div>{children}</div>
    </aside>
  );
}

function BlogImage({
  alt = "",
  src = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== "string" || !src) return null;

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      width={1440}
      height={900}
      sizes="(max-width: 768px) 100vw, 896px"
      className="article-image"
    />
  );
}

export const blogMdxComponents = {
  CardGrid,
  InfoCard,
  Callout,
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="article-h1" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="article-h2" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="article-h3" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="article-paragraph" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="article-link" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="article-list article-list--unordered" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="article-list article-list--ordered" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="article-list-item" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="article-quote" {...props} />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="article-divider" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre className="article-code-block" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="article-code" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="article-table-wrap">
      <table className="article-table" {...props} />
    </div>
  ),
  img: BlogImage,
};
