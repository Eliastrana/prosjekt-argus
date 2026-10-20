"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* The two fine-tuned models worth showing on the front page, each against
   Bris as MET published it. Written for someone who has read nothing else on
   the site: every term is explained where it first appears, and the numbers
   are the test year (1 August 2025 to 6 September 2026, 259 178 station-days,
   +30 h), calibrated month-out unless said otherwise. /modeller has the rest. */

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
  {
    label: "Hvem som laget den",
    bris: "Meteorologisk institutt (MET)",
    model: "vanlig Bris, trent videre i dette prosjektet",
    changed: true,
  },
  {
    label: "Ekstra trening",
    bris: "nei",
    model: "ja, på 18 måneder med værdata over Norden, oktober 2023 til mars 2025",
    changed: true,
  },
  {
    label: "Hvordan feil straffes",
    bris: "én poengsum for alle værtyper, pluss en for hvor detaljerte værkartene er",
    model: "den samme poengsummen for alle værtyper, uten den for detaljer",
    changed: true,
  },
];

const SHARED_TAIL: Row[] = [
  {
    label: "Hvor lenge den er trent videre",
    bris: "–",
    model: "2 000 runder, omtrent 18 timer på én kraftig grafikkprosessor",
    changed: true,
  },
  {
    label: "Selve modellen",
    bris: "et nevralt nettverk som ser værkart over Norden i detalj og resten av kloden grovere",
    model: "det samme nettverket, bare med justerte tall inni",
  },
  {
    label: "Hvordan varslene i testen ble laget",
    bris: "fire varsler samtidig, seks timer om gangen",
    model: "helt likt",
  },
];

const MODELS: Spotlight[] = [
  {
    id: "pavo",
    name: "Pavo",
    subtitle: "Bris trent til å ta all nedbør mer på alvor",
    oneLiner:
      "Vanlig Bris trent videre med en ekstra straff for feil i nedbøren. Den varsler kraftig regn for ofte, men er best til å skjelne dagene som faktisk blir våte.",
    headline: { value: "7 %", label: "mer treffsikre varsler om kraftig regn" },
    secondary: { value: "44 %", label: "færre kraftige regndøgn den bommer helt på" },
    story: [
      "Pavo er en versjon av Bris som er trent videre med én endring: hver gang den bommer på nedbøren under treningen, får den en ekstra straff. Straffen gjelder all nedbør, fra lett yr til styrtregn, og bare over Norden. Alt annet er som før.",
      "Med den ekstra straffen lærer modellen å ta nedbøren mer på alvor. Den sier oftere at det kan komme kraftig regn, også på dager der det ikke kommer. Men den overser langt færre av dagene der det faktisk kommer mye regn.",
      "Navnet er latin for påfugl. I gresk mytologi hadde kjempen Argus hundre øyne, og da han døde, satte gudinnen Hera øynene hans i påfuglens hale. Prosjektet heter Argus, og «halen» er det meteorologer kaller de sjeldne, ekstreme verdiene.",
    ],
    rows: [
      ...SHARED_ROWS,
      {
        label: "Ekstra straff for nedbør",
        bris: "nei",
        model: "ja, bare for nedbør og bare over Norden",
        changed: true,
      },
      {
        label: "Hvilken nedbør straffen gjelder",
        bris: "–",
        model: "all nedbør, uansett mengde",
        changed: true,
      },
      {
        label: "Hvor sterk straffen er",
        bris: "–",
        model: "omtrent en tidel av den vanlige straffen på dager med mye regn",
        changed: true,
      },
      ...SHARED_TAIL,
    ],
    results: [
      { label: "Mot sammenligningsmodellen", value: "7,1 % bedre", good: true, note: "sikkert, ikke tilfeldig" },
      { label: "Mot vanlig Bris", value: "8 % bedre", good: true },
      { label: "Trent på nytt fra start", value: "6,6 % bedre", good: true, note: "resultatet gjentok seg" },
      { label: "Målt slik MET selv måler", value: "6,8 % bedre", good: true },
      { label: "Uten kalibrering", value: "6,5 % dårligere", note: "fordi den overdriver" },
      { label: "Hvert steds våteste dager", value: "4,6 % bedre", good: true, note: "de 1 % våteste dagene på hvert sted, rundt fire i året" },
    ],
    strengths: [
      "Best av alle modellene i prosjektet til å skille dager med kraftig regn fra vanlige dager.",
      "Av alle dagene med over 20 mm regn, overså den 44 % færre enn sammenligningsmodellen.",
      "Testet etter en plan som ble skrevet før resultatene fantes, og bekreftet en gang til fra start.",
    ],
    limits: [
      "Sannsynlighetene må justeres med kalibrering før de brukes, fordi den overdriver.",
      "For de mest ekstreme dagene, over 50 mm, er det for få tilfeller til å si noe sikkert.",
      "Bare nedbør er sjekket. Om temperatur og vind ble påvirket, er ikke testet ennå.",
    ],
  },
  {
    id: "a",
    name: "A",
    subtitle: "Bris trent til å passe ekstra på de våteste dagene",
    oneLiner:
      "Vanlig Bris trent videre med en mild ekstra straff, men bare for de kraftigste regnbygene. Den eneste som er bedre uten noen justering i etterkant.",
    headline: { value: "6 %", label: "mer treffsikre varsler om kraftig regn" },
    secondary: { value: "4 %", label: "bedre også uten noen justering" },
    story: [
      "A er en versjon av Bris som er trent videre med en ekstra straff når den bommer på nedbøren. I motsetning til Pavo gjelder straffen bare de kraftigste regnbygene, over 20 millimeter på seks timer. Vanlig regn påvirker den ikke.",
      "Det var den opprinnelige ideen i prosjektet. Det første forsøket brukte en ti ganger så sterk straff, og da ble modellen ikke bedre. A er det samme forsøket med en mye mildere straff, og da virket det.",
      "Fordi straffen bare gjelder de kraftigste bygene, blir modellen ikke generelt våtere. Den roper nesten ikke ulv oftere enn før. Derfor er A den eneste av variantene som er bedre enn utgangspunktet også uten at tallene justeres i etterkant.",
    ],
    rows: [
      ...SHARED_ROWS,
      {
        label: "Ekstra straff for nedbør",
        bris: "nei",
        model: "ja, bare for nedbør og bare over Norden",
        changed: true,
      },
      {
        label: "Hvilken nedbør straffen gjelder",
        bris: "–",
        model: "bare de kraftigste bygene, over 20 mm på seks timer",
        changed: true,
      },
      {
        label: "Hvor sterk straffen er",
        bris: "–",
        model: "omtrent en tidel av den vanlige straffen på dager med mye regn, ti ganger svakere enn det første forsøket",
        changed: true,
      },
      ...SHARED_TAIL,
    ],
    results: [
      { label: "Mot sammenligningsmodellen", value: "6,1 % bedre", good: true, note: "sikkert, ikke tilfeldig" },
      { label: "Mot vanlig Bris", value: "7 % bedre", good: true },
      { label: "Uten kalibrering", value: "3,9 % bedre", good: true, note: "den eneste varianten som er det" },
      { label: "Målt slik MET selv måler", value: "6,2 % bedre", good: true },
      { label: "Over 10 mm i døgnet", value: "2,4 % bedre", good: true, note: "mindre gevinst enn Pavo" },
      { label: "Det første forsøket, ti ganger sterkere straff", value: "0,7 % bedre", note: "ikke sikkert, kan være tilfeldig" },
    ],
    strengths: [
      "Bedre enn sammenligningsmodellen både med og uten justering i etterkant.",
      "Overdriver nesten ikke, så tallene den gir kan nesten brukes som de er.",
      "Viser at den opprinnelige ideen i prosjektet virker, bare med en mildere straff.",
    ],
    limits: [
      "Skiller dager med kraftig regn fra vanlige dager litt dårligere enn Pavo.",
      "Hjelper mindre for moderat regn, fordi straffen bare gjelder de kraftigste bygene.",
      "Trent bare én gang. Forsøk med andre styrker på straffen kjører nå.",
    ],
  },
];

const GLOSSARY: { term: string; text: string }[] = [
  {
    term: "Sammenligningsmodellen",
    text: "Vanlig Bris trent videre på nøyaktig samme måte, men uten den ekstra straffen. Den finnes for å vise at forbedringen kommer av straffen, og ikke bare av mer trening. I prosjektet heter den kontrollarmen.",
  },
  {
    term: "Fire varsler samtidig",
    text: "Bris lager fire litt forskjellige varsler for samme dag, et såkalt ensemble. Sannsynligheten for kraftig regn er hvor mange av de fire som sier det: to av fire betyr 50 %.",
  },
  {
    term: "Kalibrering",
    text: "Modellene er ofte for sikre. Når de sier 75 %, skjer det kanskje bare i halvparten av tilfellene. Kalibrering oversetter tallene til hvor ofte det faktisk har skjedd før. Værtjenester etterbehandler varslene sine på denne måten før de vises.",
  },
  {
    term: "Mer treffsikre",
    text: "Målt med Brier-skåren: avstanden mellom sannsynligheten modellen ga og det som skjedde, snittet over alle dagene. 7 % bedre betyr at den avstanden er 7 % mindre.",
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
            <h3 id={`spotlight-${model.id}`} className="text-2xl font-semibold tracking-tight">
              {model.name}
            </h3>
            <div className="mt-0.5 text-sm text-muted">{model.subtitle}</div>
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

          <div className="flex flex-col gap-2 rounded-2xl border border-foreground/8 p-5">
            <h4 className="text-sm font-semibold">Først: hva er Bris?</h4>
            <p className="text-sm leading-relaxed text-muted">
              Bris er en værmodell laget av Meteorologisk institutt med kunstig intelligens. I stedet
              for å regne ut været fra fysikkens ligninger, har den lært av mange år med værdata
              hvordan været pleier å utvikle seg. Den varsler blant annet temperatur, vind og
              nedbør for Norden.
            </p>
            <p className="text-sm leading-relaxed text-muted">
              En slik modell lærer ved å få en straff hver gang den bommer, og justere seg for å
              bomme mindre. Dette prosjektet tester om Bris blir flinkere til å varsle kraftig regn
              hvis den trenes videre med en ekstra straff for feil i nedbøren.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Hva er gjort med {model.name}?</h4>
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
              {model.story.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Forskjellen fra vanlig Bris, punkt for punkt</h4>
            <div className="overflow-x-auto rounded-2xl border border-foreground/8">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 text-xs text-muted">
                    <th className="w-[28%] px-4 py-2.5 font-medium" />
                    <th className="w-[32%] px-4 py-2.5 font-medium">Vanlig Bris</th>
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
            <p className="text-xs text-muted">Grønn prikk betyr at det er endret fra vanlig Bris.</p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Hvordan vet vi at den er bedre?</h4>
            <p className="text-sm leading-relaxed text-muted">
              Alle modellene laget varsler for et helt år, fra august 2025 til september 2026, som
              ingen av dem hadde sett under treningen. Varslene ble sammenlignet med hva 715
              målestasjoner i Norden faktisk målte, til sammen 259 178 målinger. Spørsmålet var hvor
              godt modellen ga sannsynlighet for mer enn 20 mm regn i løpet av et døgn, fra et
              varsel laget seks timer før døgnet startet. 20 mm i døgnet er kraftig regn, mer enn de fleste steder får på en vanlig
              regnværsdag.
            </p>
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

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">Ordliste</h4>
            <dl className="flex flex-col gap-3">
              {GLOSSARY.map((g) => (
                <div key={g.term} className="text-sm">
                  <dt className="font-medium text-foreground">{g.term}</dt>
                  <dd className="mt-0.5 leading-relaxed text-muted">{g.text}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Link
            href="/modeller"
            className="self-start text-sm text-muted underline underline-offset-2 transition hover:text-foreground"
          >
            Se alle modellene i prosjektet →
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
            Versjoner av Meteorologisk institutts KI-værmodell Bris som varsler kraftig regn bedre
            enn originalen.
          </p>
        </div>
        <Link href="/modeller" className="shrink-0 text-sm text-muted transition hover:text-foreground">
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
                <div className="text-2xl font-semibold tracking-tight">{m.name}</div>
                <div className="text-xs text-muted">{m.subtitle}</div>
              </div>
              <span className="shrink-0 rounded-full bg-tint px-3 py-1 text-xs font-semibold text-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
                Les mer
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
