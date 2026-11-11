import type { Metadata } from "next";
import GraphicCard from "../components/GraphicCard";

export const metadata: Metadata = {
  title: "Grafikk",
  description: "Bilder fra prosjektet til å laste ned og dele, laget for å leses på mobil.",
};

export default function GraphicsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-shell">
        <header className="flex flex-col gap-2">
          <h1 className="page-title">Grafikk</h1>
          <p className="max-w-2xl text-sm text-muted md:text-base">
            Bilder til å laste ned og dele. De er 16:9, 1920 × 1080, og har så lite tekst at de kan leses på en
            mobilskjerm.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-12">
          <GraphicCard
            id="argus-idea"
            title="Hovedideen"
            description="Kraftig regn er sjeldent og vanskelig å varsle. Jeg trente Bris videre med en ekstra straff for å bomme på det, og målte resultatet."
          />
        </div>
      </div>
    </main>
  );
}
