import type { Metadata } from "next";
import GlossaryList from "@/app/components/GlossaryList";
import { GLOSSARY_GROUPS } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Ordliste",
  description: "Ordene som går igjen i prosjektet, forklart kort: modellene, tapet, eksperimentet og hvordan resultatene måles.",
};

export default function OrdlistePage() {
  const count = GLOSSARY_GROUPS.reduce((n, g) => n + g.terms.length, 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-shell">
        <header className="flex flex-col gap-3">
          <h1 className="page-title">Ordliste</h1>
          <p className="max-w-2xl text-sm text-muted md:text-base">
            De {count} ordene som går igjen i prosjektet, forklart kort. Under hvert ord står også
            navnene det har i koden og i artiklene, så du finner det uansett hvilket du kjenner.
          </p>
        </header>

        <GlossaryList groups={GLOSSARY_GROUPS} />
      </div>
    </main>
  );
}
