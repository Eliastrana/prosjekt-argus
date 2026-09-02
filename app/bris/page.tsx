import type { Metadata } from "next";
import BrisMap from "@/app/components/BrisMap";

export const metadata: Metadata = {
  title: "Bris-prognose",
  description:
    "Et Bris-felt over det nordiske domenet, eksportert fra modellens NetCDF-utdata.",
};

// Full bleed: the component fills the viewport and floats its own panels, so
// the page adds no chrome of its own.
export default function BrisPage() {
  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <BrisMap />
    </main>
  );
}
