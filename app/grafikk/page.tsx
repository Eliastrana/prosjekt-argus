import type { Metadata } from "next";
import GraphicCard, { GraphicSeries } from "../components/GraphicCard";

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
            Bilder til å laste ned og dele, i 16:9 (1920 × 1080) og i skjermformatet til iPhone 12 (1170 × 2532).
            De har så lite tekst at de kan leses på en mobilskjerm.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-16">
          <GraphicCard
            id="argus-idea"
            title="Hovedideen"
            description="Kraftig regn er sjeldent og vanskelig å varsle. Jeg trente Bris videre med en ekstra straff for å bomme på det, og målte resultatet."
          />

          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">Steg for steg</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Fem bilder i iPhone-formatet som forklarer prosjektet i rekkefølge, til å legge ut etter hverandre.
                Luft og farge gjelder alle fem.
              </p>
            </div>
            <GraphicSeries
              items={[
                {
                  id: "steg-1-problemet",
                  title: "1. Problemet",
                  description: "Kraftig regn er sjeldent, så modellene lærer mest av de vanlige dagene.",
                },
                {
                  id: "steg-2-situasjonen",
                  title: "2. Situasjonen",
                  description: "Utgangspunktet er METs KI-værmodell Bris.",
                },
                {
                  id: "steg-3-det-jeg-prover",
                  title: "3. Det jeg prøver",
                  description: "Trene Bris videre med en ekstra straff for å bomme på kraftig regn.",
                },
                {
                  id: "steg-4-resultater",
                  title: "4. Foreløpige resultater",
                  description: "Bedre på kraftig regn enn vanlig Bris, og hvorfor jeg trenger en kontrollarm.",
                },
                {
                  id: "steg-5-venter",
                  title: "5. Neste steg",
                  description: "Pavo med spektralledd står i kø, og H200-kortene er ikke ledige.",
                },
              ]}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
