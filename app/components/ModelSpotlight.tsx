import Link from "next/link";
import { SPOTLIGHT } from "@/lib/spotlight";
import { Arrow } from "@/app/components/Arrow";

/* The two models that work, as cards under the front-page video. Each links
   to its own page (/modeller/pavo, /modeller/a); the content for both lives
   in lib/spotlight.ts. Both cards show the same two numbers, Brier score
   over 20 mm a day after calibration, against the same two references, so
   they can be read side by side. */

export default function ModelSpotlight() {
  return (
    <section className="mt-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">To modeller som virker</h2>
          <p className="mt-1 text-sm text-muted">
            Versjoner av Meteorologisk institutts KI-værmodell Bris som varsler kraftig regn bedre
            enn originalen.
          </p>
        </div>
        <Link href="/modeller" className="shrink-0 text-sm text-muted transition hover:text-foreground">
          Alle modellene <Arrow />
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {SPOTLIGHT.map((m) => (
          <Link
            key={m.id}
            href={`/modeller/${m.id}`}
            className="group flex flex-col gap-4 rounded-[10px] bg-foreground/[0.04] p-6 text-left transition hover:bg-foreground/[0.07] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-semibold tracking-tight">{m.name}</div>
                <div className="text-xs text-muted">{m.subtitle}</div>
              </div>
              <span className="shrink-0 rounded-full bg-tint px-3 py-1 text-xs font-semibold text-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
                Les mer <Arrow />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[m.headline, m.secondary].map((h) => (
                <div key={h.label}>
                  <div className="text-2xl font-semibold text-accent">{h.value}</div>
                  <div className="text-xs text-muted">{h.label}</div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
