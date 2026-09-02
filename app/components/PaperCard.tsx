import type { RelevantPaper } from "@/lib/papers";

function getPrimaryLink(paper: RelevantPaper) {
  if (paper.url) {
    return { href: paper.url, label: "Open source" };
  }

  if (paper.doi) {
    return { href: `https://doi.org/${paper.doi}`, label: "DOI" };
  }

  return null;
}

// Same shell as BlogCard, so the two kinds of card read as one system: metadata
// pinned to the top, the title and its detail sitting at the bottom, and the
// arrow that lights up on hover.
const SHELL = [
  "group relative flex h-full min-h-[17rem] flex-col overflow-hidden",
  "rounded-[1.75rem] border border-foreground/10 bg-card p-6",
  "transition duration-300",
].join(" ");

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-card-2 px-3 py-1 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

function Body({ paper }: { paper: RelevantPaper }) {
  const detail = [paper.venue, paper.note].filter(Boolean);

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold leading-tight tracking-[-0.025em] text-foreground">
        {paper.title}
      </h3>

      {detail.length > 0 ? (
        <div className="mt-3 space-y-1 text-sm leading-6 text-muted">
          {detail.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Pill>{paper.type}</Pill>
        {paper.doi ? <Pill>{paper.doi}</Pill> : null}
      </div>
    </div>
  );
}

function Meta({ paper, linked }: { paper: RelevantPaper; linked: boolean }) {
  return (
    <div className="mb-auto flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {paper.year ? (
          <span className="shrink-0 text-sm font-medium text-muted">{paper.year}</span>
        ) : null}
        {paper.year && paper.authors ? (
          <span
            aria-hidden="true"
            className="size-1 shrink-0 rounded-full bg-foreground/25"
          />
        ) : null}
        {paper.authors ? (
          <span className="truncate text-sm text-muted">{paper.authors}</span>
        ) : null}
      </div>

      {linked ? (
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-foreground/10 text-lg transition group-hover:border-accent/40 group-hover:bg-tint group-hover:text-accent">
          <span aria-hidden="true">↗</span>
        </span>
      ) : null}
    </div>
  );
}

export default function PaperCard({ paper }: { paper: RelevantPaper }) {
  const primaryLink = getPrimaryLink(paper);

  // The whole card is the link, as on the blog. That rules out anchors inside
  // it — nesting them is invalid — so the DOI is shown as a pill rather than a
  // second link, and the card itself resolves to the URL, or the DOI when
  // there is no URL.
  if (!primaryLink) {
    return (
      <article className={SHELL}>
        <Meta paper={paper} linked={false} />
        <Body paper={paper} />
      </article>
    );
  }

  return (
    <a
      href={primaryLink.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${paper.title} — ${primaryLink.label}`}
      className={`${SHELL} hover:border-accent/40`}
    >
      <Meta paper={paper} linked />
      <Body paper={paper} />
    </a>
  );
}
