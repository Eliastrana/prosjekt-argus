import Link from "next/link";
import { getRelevantPapers } from "@/lib/papers";
import PaperCard from "./PaperCard";

export default function RelevantPapers() {
  // Four, not five: the grid is two-up, so an odd count leaves a gap in the
  // last row.
  const papers = getRelevantPapers().slice(0, 4);
  if (papers.length === 0) {
    return null;
  }

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Relevant Papers</h2>
          <p className="mt-1 text-sm text-muted">Referanser fra prosjektets BibTeX-liste.</p>
        </div>

        <Link
          href="/papers"
          className="text-sm text-muted transition hover:text-foreground"
        >
          Se alle →
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </section>
  );
}
