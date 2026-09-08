import type { Metadata } from "next";
import Presentation from "@/app/components/Presentation";

export const metadata: Metadata = {
  title: "Presentasjon | Prosjekt Argus",
  description:
    "Prosjektet i tolv lysbilder: hva Bris er, hvor den svikter på ekstremvær, og hva finjustering mot halen krever.",
};

export default function PresentationPage() {
  // The shared layout puts a 5rem navbar above this, so a full 100dvh here
  // pushes the dots below the fold. Subtract it rather than reaching into the
  // layout, which every other page depends on.
  return (
    <main className="h-[calc(100dvh-5rem)] w-full overflow-hidden bg-background text-foreground">
      <Presentation />
    </main>
  );
}
