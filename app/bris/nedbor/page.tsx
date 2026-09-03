import type { Metadata } from "next";
import PrecipEvents from "@/app/components/PrecipEvents";

export const metadata: Metadata = {
  title: "Ekstremnedbør",
  description:
    "Kandidathendelser for ekstremnedbør funnet fra stasjonsobservasjoner alene, uten modell eller arkivtilgang.",
};

export default function PrecipEventsPage() {
  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <PrecipEvents />
    </main>
  );
}
