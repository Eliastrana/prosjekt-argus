import { getRelevantPapers } from "@/lib/papers";
import PaperCard from "../components/PaperCard";

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
            Referanser for prosjektet hentet fra en BibTeX-fil, i den rekkefølgen de ble lagt til.
          </p>
        </header>

        <section className="mt-10 grid gap-4">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </section>
      </div>
    </main>
  );
}
