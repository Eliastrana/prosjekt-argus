"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* The two fine-tuned models worth showing on the front page, each against
   Bris as MET published it. Numbers are the test year (1 August 2025 to
   6 September 2026, 259 178 station-days, +30 h), calibrated month-out unless
   said otherwise; see /modeller for every model and the blog for the method. */

type Row = { label: string; bris: string; model: string; changed?: boolean };
type Result = { label: string; value: string; good?: boolean; note?: string };

type Spotlight = {
  id: string;
  name: string;
  subtitle: string;
  oneLiner: string;
  headline: { value: string; label: string };
  secondary: { value: string; label: string };
  story: string[];
  rows: Row[];
  results: Result[];
  strengths: string[];
  limits: string[];
};

const SHARED_ROWS: Row[] = [
  { label: "Utgangspunkt", bris: "trent av MET", model: "vektene til Bris" },
  {
    label: "Finjustert",
    bris: "nei",
    model: "ja, på MEPS og IFS fra oktober 2023 til mars 2025",
    changed: true,
  },
  {
    label: "Grunntap",
    bris: "ensemble-CRPS pluss et spektralledd",
    model: "ensemble-CRPS (almost-fair, α = 0,95), uten spektralleddet, som ikke finnes i anemoi 0.5.1",
    changed: true,
  },
];

const TAIL_ROWS: Row[] = [
  { label: "Steg i finjusteringen", bris: "–", model: "2 000 av en plan på 3 000", changed: true },
  { label: "Læringsrate i finjusteringen", bris: "–", model: "cosinus fra 3,75·10⁻⁶ ned mot 3,75·10⁻⁷", changed: true },
  { label: "Ensemble i finjusteringen", bris: "–", model: "3 medlemmer", changed: true },
  { label: "Maskinvare for finjusteringen", bris: "–", model: "ett H200-kort, 18,5 timer", changed: true },
  { label: "Arkitektur og data inn", bris: "graftransformer, strukket gitter", model: "uendret" },
  { label: "Varsling", bris: "4 medlemmer, 6 timers steg", model: "uendret" },
];

const MODELS: Spotlight[] = [
  {
    id: "pavo",
    name: "Pavo",
    subtitle: "variant C",
    oneLiner: "Ekstra vekt på all nedbør. Overdriver kraftig regn, men skiller kraftige regndøgn best av alle.",
    headline: { value: "7 %", label: "bedre enn kontrollarmen, kalibrert" },
    secondary: { value: "0,91", label: "ROC-areal, mot 0,81 for Bris" },
    story: [
      "Pavo er latin for påfugl. Da kjempen Argus døde, satte Hera de hundre øynene hans i påfuglens hale, og det er akkurat det denne finjusteringen gjør med Bris.",
      "Modellen er Bris finjustert videre med et ekstra ledd i tapet. Leddet regner ensembletapet én gang til, men bare på nedbør og bare over Norden. Det ser all nedbør, ingen terskel, så modellen får mer å lære av hver eneste regnbyge.",
      "Resultatet er en modell som tar nedbøren mer på alvor. Den sier kraftig regn oftere enn den burde, men den gjemmer langt færre kraftige regndøgn blant dem den kaller trygge.",
    ],
    rows: [
      ...SHARED_ROWS,
      { label: "Ekstra ledd", bris: "nei", model: "ensemble-CRPS én gang til, bare nedbør, bare Norden", changed: true },
      { label: "Hva leddet ser", bris: "–", model: "all nedbør, ingen terskel", changed: true },
      { label: "Vekt på leddet", bris: "–", model: "39,09", changed: true },
      { label: "Andel av tapet på ekstremdøgn", bris: "–", model: "1/11", changed: true },
      ...TAIL_ROWS,
    ],
    results: [
      { label: "Kalibrert, mot kontrollarmen", value: "7,1 % bedre", good: true, note: "hele intervallet under null" },
      { label: "Kalibrert, mot vanlig Bris", value: "8 % bedre", good: true },
      { label: "Ny treningstrekning", value: "6,6 % bedre", good: true, note: "et nytt seed for begge armene" },
      { label: "Med METs punktmetode", value: "6,8 % bedre", good: true, note: "bilineær interpolasjon" },
      { label: "Rå, uten kalibrering", value: "6,5 % dårligere", note: "overdriver kraftig regn" },
      { label: "Stasjonens våteste 1 % av døgnene", value: "4,6 % bedre", good: true },
    ],
    strengths: [
      "Skiller kraftige regndøgn fra andre best av alle modellene (ROC 0,91).",
      "Bommer helt på 44 % færre døgn med over 20 mm enn kontrollarmen.",
      "Testet etter en plan låst på forhånd, og bekreftet på en ny trekning.",
    ],
    limits: [
      "Trenger kalibrering. Rå varsler den kraftig regn for ofte.",
      "Over 50 mm i døgnet er det for få tilfeller til å si noe sikkert.",
      "Bare nedbør er testet. Temperatur, trykk og vind er ikke sjekket ennå.",
    ],
  },
  {
    id: "a",
    name: "A",
    subtitle: "hard terskel, lav dose",
    oneLiner: "Det opprinnelige halearm-leddet med en tidel av vekten. Den eneste som er bedre også uten kalibrering.",
    headline: { value: "6 %", label: "bedre enn kontrollarmen, kalibrert" },
    secondary: { value: "4 %", label: "bedre også rå, uten kalibrering" },
    story: [
      "A er den opprinnelige ideen i oppgaven, bare dosert mye svakere. Den første halearmen la et ekstra ledd på nedbør over 20 millimeter med full vekt, og ble ikke bedre. A har nøyaktig det samme leddet, med en tidel av vekten.",
      "Fordi leddet bare ser nedbør over terskelen, dytter det bare på døgn med mye regn. Modellen blir ikke generelt våtere, og den roper nesten ikke ulv oftere enn før.",
      "Det gjør A til den eneste varianten som er bedre enn kontrollarmen også rå. Den er også grunnen til at jeg nå tror dosen, ikke terskelen, avgjorde om halearmen virket.",
    ],
    rows: [
      ...SHARED_ROWS,
      { label: "Ekstra ledd", bris: "nei", model: "ensemble-CRPS én gang til, bare nedbør, bare Norden", changed: true },
      { label: "Hva leddet ser", bris: "–", model: "bare nedbør over 20 mm per 6 timer, hard terskel", changed: true },
      { label: "Vekt på leddet", bris: "–", model: "1 371,6, en tidel av den opprinnelige halearmen", changed: true },
      { label: "Andel av tapet på ekstremdøgn", bris: "–", model: "1/11", changed: true },
      ...TAIL_ROWS,
    ],
    results: [
      { label: "Kalibrert, mot kontrollarmen", value: "6,1 % bedre", good: true, note: "hele intervallet under null" },
      { label: "Kalibrert, mot vanlig Bris", value: "7 % bedre", good: true },
      { label: "Rå, uten kalibrering", value: "3,9 % bedre", good: true, note: "den eneste varianten som er det" },
      { label: "Med METs punktmetode", value: "6,2 % bedre", good: true, note: "bilineær interpolasjon" },
      { label: "Over 10 mm, kalibrert", value: "2,4 % bedre", good: true, note: "mindre enn Pavo" },
      { label: "Den opprinnelige halearmen (full vekt)", value: "0,7 % bedre", note: "ikke sikker" },
    ],
    strengths: [
      "Bedre enn kontrollarmen både med og uten kalibrering.",
      "Overdriver nesten ikke, og trenger derfor minst etterbehandling.",
      "Viser at den opprinnelige ideen virker, bare med lavere dose.",
    ],
    limits: [
      "Skiller kraftige regndøgn dårligere enn Pavo (ROC 0,87 mot 0,91).",
      "Svakere over 10 mm, fordi leddet bare ser nedbør over 20 mm.",
      "Én treningstrekning. Dose-serien som tester vekten, kjører nå.",
    ],
  },
];

function SpotlightModal({ model, onClose }: { model: Spotlight; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes, the page behind stays put, and focus starts on the close
  // button so a keyboard user is inside the dialog, not behind it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`spotlight-${model.id}`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[1.75rem] border border-foreground/10 bg-card shadow-lift sm:rounded-[1.75rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-foreground/8 px-6 py-5">
          <div>
            <div className="text-xs text-muted">{model.subtitle}</div>
            <h3 id={`spotlight-${model.id}`} className="text-2xl font-semibold tracking-tight">
              {model.name}
            </h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-xl bg-tint px-3 py-2 text-xs font-semibold text-foreground transition hover:opacity-90"
          >
            Lukk
          </button>
        </div>

        <div className="flex flex-col gap-8 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            {[model.headline, model.secondary].map((h) => (
              <div key={h.label} className="rounded-2xl bg-card-2 p-4">
                <div className="text-3xl font-semibold tracking-tight text-accent">{h.value}</div>
                <div className="mt-1 text-xs text-muted">{h.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
            {model.story.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Hva som er annerledes enn vanlig Bris</h4>
            <div className="overflow-x-auto rounded-2xl border border-foreground/8">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-xs text-muted">
                    <th className="w-[30%] px-4 py-2.5 font-medium" />
                    <th className="w-[30%] px-4 py-2.5 font-medium">Vanlig Bris</th>
                    <th className="px-4 py-2.5 font-medium">{model.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {model.rows.map((r) => (
                    <tr key={r.label} className="border-b border-foreground/5 align-top last:border-0">
                      <td className="px-4 py-2.5 text-muted">{r.label}</td>
                      <td className="px-4 py-2.5 text-muted">{r.bris}</td>
                      <td className={`px-4 py-2.5 ${r.changed ? "font-medium text-foreground" : "text-muted"}`}>
                        {r.changed ? <span className="mr-1.5 inline-block size-1.5 rounded-full bg-accent align-middle" /> : null}
                        {r.model}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted">
              Grønn prikk betyr at det er endret fra vanlig Bris. Kontrollarmen er Bris finjustert
              helt likt, men uten det ekstra leddet. Den finnes for å skille effekten av leddet fra
              effekten av mer trening.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Resultater på teståret, over 20 mm regn i døgnet</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {model.results.map((r) => (
                <div key={r.label} className="flex flex-col gap-0.5 rounded-xl border border-foreground/8 px-4 py-3">
                  <span className="text-xs text-muted">{r.label}</span>
                  <span className={`text-base font-semibold ${r.good ? "text-accent" : "text-foreground"}`}>
                    {r.value}
                  </span>
                  {r.note ? <span className="text-xs text-muted">{r.note}</span> : null}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted">
              Brier-skår for sannsynligheten for over 20 mm, 30 timer fram, 259 178 stasjonsdøgn fra
              august 2025 til september 2026. Kalibrert betyr at sannsynlighetene er oversatt til hvor
              ofte det faktisk regnet så mye, med en tabell laget av de andre månedene.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Styrker</h4>
              <ul className="flex flex-col gap-1.5 text-sm text-muted">
                {model.strengths.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Begrensninger</h4>
              <ul className="flex flex-col gap-1.5 text-sm text-muted">
                {model.limits.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link
            href="/modeller"
            className="self-start text-sm text-muted underline underline-offset-2 transition hover:text-foreground"
          >
            Se alle modellene →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ModelSpotlight() {
  const [open, setOpen] = useState<Spotlight | null>(null);

  return (
    <section className="mt-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">To modeller som virker</h2>
          <p className="mt-1 text-sm text-muted">
            Finjusterte versjoner av Bris som varsler kraftig regn bedre enn originalen.
          </p>
        </div>
        <Link href="/modeller" className="text-sm text-muted transition hover:text-foreground">
          Alle modellene →
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {MODELS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setOpen(m)}
            className="group flex flex-col gap-4 rounded-[1.75rem] border border-foreground/10 bg-card p-6 text-left transition hover:border-accent/40 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted">{m.subtitle}</div>
                <div className="text-2xl font-semibold tracking-tight">{m.name}</div>
              </div>
              <span className="rounded-full bg-tint px-3 py-1 text-xs font-semibold text-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
                Se detaljer
              </span>
            </div>
            <p className="text-sm text-muted">{m.oneLiner}</p>
            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-semibold text-accent">{m.headline.value}</div>
                <div className="text-xs text-muted">{m.headline.label}</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-foreground">{m.secondary.value}</div>
                <div className="text-xs text-muted">{m.secondary.label}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {open ? <SpotlightModal model={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
