import { getRelevantPapers } from "@/lib/papers";
import PaperList from "../components/PaperList";

export const metadata = {
  title: "Relevante Artikler",
};

export default function PapersPage() {
  const papers = getRelevantPapers();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Relevant Papers</h1>
          <p className="max-w-2xl text-sm text-muted md:text-base">
            Referanser for prosjektet hentet fra en BibTeX-fil.
          </p>
        </header>

        <PaperList papers={papers} />
      </div>
    </main>
  );
}
