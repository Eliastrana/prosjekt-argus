import { getRelevantPapers } from "@/lib/papers";
import PaperList from "../components/PaperList";

export const metadata = {
  title: "Relevante Artikler",
};

export default function PapersPage() {
  const papers = getRelevantPapers();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-shell">
        <header className="flex flex-col gap-2">
          <h1 className="page-title">Relevant Papers</h1>
          <p className="max-w-2xl text-sm text-muted md:text-base">
            Referanser for prosjektet hentet fra en BibTeX-fil.
          </p>
        </header>

        <PaperList papers={papers} />
      </div>
    </main>
  );
}
