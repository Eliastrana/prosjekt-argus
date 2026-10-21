import type { Metadata } from "next";
import Link from "next/link";
import ModelLineage, { type LineageInfo } from "@/app/components/ModelLineage";

export const metadata: Metadata = {
  title: "Modellene",
  description:
    "Alle variantene av Bris som er trent i prosjektet, med oppsett og resultat på teståret.",
};

/* One row per trained model. Results are calibrated Brier score for the
   probability of more than 20 mm in a day, on the test year, against the
   control arm with the same number of steps and the same seed; negative is
   better. `better` is true only when the whole 95 percent interval is below
   zero. Update the rows here when a run is scored; nothing else reads them. */

// "varsles": trained, its test-year forecasts are being made, no result yet.
type Status = "ferdig" | "trener" | "varsles" | "i kø" | "publisert";

type Model = {
  name: string;
  tag: string;
  threshold: string;
  weight: string;
  dose: string;
  steps: string;
  seed: string;
  result?: string;
  better?: boolean;
  roc?: string;
  status: Status;
  note?: string;
};

type Section = { title: string; blurb: string; models: Model[] };

const SECTIONS: Section[] = [
  {
    title: "Utgangspunkt og referanser",
    blurb: "Bris slik MET publiserte den, og kontrollarmene: finjustert på de samme dataene uten noe ekstra ledd.",
    models: [
      {
        name: "Bris",
        tag: "bris-crpsfft",
        threshold: "–",
        weight: "–",
        dose: "–",
        steps: "–",
        seed: "–",
        result: "+1,1 %",
        better: false,
        roc: "0,81",
        status: "publisert",
        note: "ikke finjustert; sammenlignet med kontrollarmen ved steg 2 000",
      },
      {
        name: "Kontrollarm",
        tag: "control2000",
        threshold: "ingen ekstra ledd",
        weight: "–",
        dose: "–",
        steps: "2 000",
        seed: "20260909",
        result: "referanse",
        roc: "0,85",
        status: "ferdig",
      },
      {
        name: "Kontrollarm, hele planen",
        tag: "control",
        threshold: "ingen ekstra ledd",
        weight: "–",
        dose: "–",
        steps: "3 000",
        seed: "20260909",
        result: "referanse",
        roc: "0,86",
        status: "ferdig",
        note: "referanse for armene med 3 000 steg",
      },
      {
        name: "F, kontrollarm med nytt seed",
        tag: "control2000s2",
        threshold: "ingen ekstra ledd",
        weight: "–",
        dose: "–",
        steps: "2 000",
        seed: "20261003",
        result: "−0,3 %",
        better: false,
        roc: "0,86",
        status: "ferdig",
        note: "målestokk: hvor mye seedet alene flytter resultatet",
      },
    ],
  },
  {
    title: "Hard terskel på 20 mm",
    blurb: "Det ekstra leddet ser bare nedbør over 20 mm per 6 timer. Ordnet etter dose, fra svakest til sterkest.",
    models: [
      {
        name: "Dose 1/30",
        tag: "tail30th2000",
        threshold: "hard, 20 mm",
        weight: "457,2",
        dose: "1/31",
        steps: "2 000",
        seed: "20260909",
        result: "−3,8 %",
        better: true,
        roc: "0,86",
        status: "ferdig",
      },
      {
        name: "A",
        tag: "tailA2000",
        threshold: "hard, 20 mm",
        weight: "1 371,6",
        dose: "1/11",
        steps: "2 000",
        seed: "20260909",
        result: "−6,1 %",
        better: true,
        roc: "0,87",
        status: "ferdig",
      },
      {
        name: "Dose 1/3",
        tag: "tail3rd2000",
        threshold: "hard, 20 mm",
        weight: "4 572",
        dose: "1/4",
        steps: "2 000",
        seed: "20260909",
        result: "−4,4 %",
        better: true,
        roc: "0,85",
        status: "ferdig",
      },
      {
        name: "Opprinnelig halearm, steg 2 000",
        tag: "tail2000",
        threshold: "hard, 20 mm",
        weight: "13 716",
        dose: "1/2",
        steps: "2 000",
        seed: "20260909",
        result: "−0,7 %",
        better: false,
        roc: "0,84",
        status: "ferdig",
      },
      {
        name: "Opprinnelig halearm",
        tag: "tail",
        threshold: "hard, 20 mm",
        weight: "13 716",
        dose: "1/2",
        steps: "3 000",
        seed: "20260909",
        result: "+1,3 %",
        better: false,
        roc: "0,84",
        status: "ferdig",
        note: "oppgavens første store forsøk",
      },
    ],
  },
  {
    title: "Lav eller ingen terskel",
    blurb: "Det ekstra leddet ser også vanlig nedbør. Pavo er variant C.",
    models: [
      {
        name: "B",
        tag: "tailB2000",
        threshold: "hard, 5 mm",
        weight: "83,98",
        dose: "1/11",
        steps: "2 000",
        seed: "20260909",
        result: "−6,7 %",
        better: true,
        roc: "0,91",
        status: "ferdig",
      },
      {
        name: "D",
        tag: "tailD2000",
        threshold: "myk, 5 mm",
        weight: "76,55",
        dose: "1/11",
        steps: "2 000",
        seed: "20260909",
        result: "−7,0 %",
        better: true,
        roc: "0,91",
        status: "ferdig",
        note: "glatt overgang over 2 mm",
      },
      {
        name: "E",
        tag: "tailE2000",
        threshold: "ingen",
        weight: "13,03",
        dose: "1/31",
        steps: "2 000",
        seed: "20260909",
        result: "−6,4 %",
        better: true,
        roc: "0,90",
        status: "ferdig",
      },
      {
        name: "Pavo",
        tag: "tailC2000",
        threshold: "ingen",
        weight: "39,09",
        dose: "1/11",
        steps: "2 000",
        seed: "20260909",
        result: "−7,1 %",
        better: true,
        roc: "0,91",
        status: "ferdig",
        note: "bekreftet etter låst plan",
      },
      {
        name: "Pavo, ny trekning",
        tag: "tailC2000s2",
        threshold: "ingen",
        weight: "39,09",
        dose: "1/11",
        steps: "2 000",
        seed: "20261003",
        result: "−6,6 %",
        better: true,
        roc: "0,90",
        status: "ferdig",
        note: "mot F, som har samme seed",
      },
      {
        name: "Pavo, hele planen",
        tag: "tailC3000",
        threshold: "ingen",
        weight: "39,09",
        dose: "1/11",
        steps: "3 000",
        seed: "20260909",
        status: "trener",
        note: "scores mot kontrollarmen ved steg 3 000",
      },
    ],
  },
];

/* Every training run in the order it ran, from sacct on ex3. The step-2000
   versions of the control and tail arms are not here: they are checkpoints
   of those runs, not runs of their own. */
type Run = { when: string; tags: string[]; hours?: string; note?: string; status: Status };

const RUNS: Run[] = [
  { when: "14.–15. sep", tags: ["control"], hours: "29 t", note: "gir også kontrollarmen ved steg 2 000", status: "ferdig" },
  { when: "16.–18. sep", tags: ["tail"], hours: "29 t", note: "gir også halearmen ved steg 2 000", status: "ferdig" },
  { when: "1.–2. okt", tags: ["tailA2000", "tailB2000"], hours: "18,5 t", note: "side om side på hvert sitt H200-kort", status: "ferdig" },
  { when: "2.–3. okt", tags: ["tailC2000"], hours: "18,5 t", status: "ferdig" },
  { when: "4.–5. okt", tags: ["tailE2000"], hours: "18,5 t", note: "startet på nytt etter at g003 krasjet", status: "ferdig" },
  { when: "5.–6. okt", tags: ["control2000s2"], hours: "18,5 t", status: "ferdig" },
  { when: "6.–7. okt", tags: ["tailD2000"], hours: "18,5 t", status: "ferdig" },
  { when: "14.–15. okt", tags: ["tailC2000s2"], hours: "18,5 t", status: "ferdig" },
  { when: "19.–20. okt", tags: ["tail3rd2000"], hours: "19,3 t", status: "ferdig" },
  { when: "20. okt", tags: ["tail30th2000"], hours: "18,8 t", status: "ferdig" },
  { when: "21.–22. okt", tags: ["tailC3000"], hours: "~28 t", note: "startet 02:45, ferdig rundt 07:00 torsdag", status: "trener" },
];

/* Models with a page of their own (app/modeller/[slug]). */
const PAGES: Record<string, string> = { tailC2000: "/modeller/pavo", tailA2000: "/modeller/a" };

const COMMON: { term: string; value: string }[] = [
  { term: "Utgangspunkt", value: "Bris fra MET, varm start med bare vektene" },
  { term: "Rammeverk", value: "anemoi-training 0.5.1" },
  { term: "Data", value: "MEPS 2,5 km over Norden og IFS N320 globalt, strukket gitter, 6 timers steg" },
  { term: "Trening", value: "1. oktober 2023 – 31. mars 2025" },
  { term: "Validering", value: "1. april – 31. juli 2025" },
  { term: "Testår", value: "1. august 2025 – 6. september 2026, aldri sett av noen modell" },
  { term: "Grunntap", value: "almost-fair kernel CRPS, α = 0,95, på alle variabler" },
  { term: "Ekstra ledd", value: "det samme tapet én gang til, bare på nedbør og bare over Norden" },
  { term: "Ensemble", value: "3 medlemmer i trening, 4 i varsling" },
  { term: "Læringsrate", value: "cosinus fra 3,75·10⁻⁶ til 3,75·10⁻⁷ over 3 000 steg, 100 steg oppvarming" },
  { term: "Steg", value: "ett 6-timers steg om gangen, én tilstand per steg" },
  { term: "Maskinvare", value: "ett H200-kort, omtrent 18,5 timer per 2 000 steg" },
  { term: "Mangler", value: "spektralleddet Bris opprinnelig ble trent med, som ikke finnes i anemoi 0.5.1" },
];

const STATUS_STYLE: Record<Status, string> = {
  ferdig: "bg-foreground/5 text-muted",
  publisert: "bg-foreground/5 text-muted",
  trener: "bg-accent/15 text-accent",
  varsles: "bg-accent/15 text-accent",
  "i kø": "bg-foreground/5 text-muted",
};

/* The calibration every result on this page goes through, explained once.
   Numbers are Pavo's and the control arm's at 20 mm on the test year
   (hits_and_calibration.py, month-out). */
const CALIBRATION_EXAMPLE = [
  { said: "0 %", members: "0 av 4", control: "1 %", pavo: "0,6 %" },
  { said: "25 %", members: "1 av 4", control: "22 %", pavo: "14 %" },
  { said: "50 %", members: "2 av 4", control: "44 %", pavo: "30 %" },
  { said: "75 %", members: "3 av 4", control: "58 %", pavo: "46 %" },
  { said: "100 %", members: "4 av 4", control: "78 %", pavo: "71 %" },
];

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-background px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground">
      {children}
    </div>
  );
}

function CalibrationBody() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Hva den gjør",
            text: "Bris sier en sannsynlighet: hvor mange av de fire ensemblemedlemmene som varsler over 20 mm. Kalibrering bytter ut den sannsynligheten med hvor ofte det faktisk regnet så mye de gangene modellen sa nettopp det.",
          },
          {
            title: "Hvorfor den trengs",
            text: "Modellene er overmodige. Når Pavo sier 75 prosent, kommer regnet bare i 46 prosent av tilfellene. Uten kalibrering straffes en modell for å overdrive, selv om den skiller kraftige regndøgn godt fra andre.",
          },
          {
            title: "Hva den ikke kan",
            text: "Den endrer bare tallene, ikke rekkefølgen. Døgnene modellen var mest sikker på, er fortsatt de den er mest sikker på. Kalibrering gjør en modell ærlig, ikke flinkere.",
          },
        ].map((c) => (
          <div key={c.title} className="flex flex-col gap-2 rounded-2xl border border-foreground/8 bg-card p-5">
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <p className="text-sm text-muted">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Oversettelsestabellen, med ekte tall</h3>
          <p className="text-sm text-muted">
            Over 20 mm i døgnet, hele teståret. Hver rad er det modellen sa, og hva det betydde i
            virkeligheten. De to siste kolonnene er kalibreringen for hver modell.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-foreground/8 bg-card">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-xs text-muted">
                  <th className="px-4 py-2.5 font-medium">Medlemmer</th>
                  <th className="px-4 py-2.5 text-right font-medium">Modellen sa</th>
                  <th className="px-4 py-2.5 text-right font-medium">Kontrollarm, faktisk</th>
                  <th className="px-4 py-2.5 text-right font-medium">Pavo, faktisk</th>
                </tr>
              </thead>
              <tbody>
                {CALIBRATION_EXAMPLE.map((r) => (
                  <tr key={r.said} className="border-b border-foreground/5 last:border-0">
                    <td className="px-4 py-2.5 text-muted">{r.members}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.said}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.control}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">{r.pavo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Matematikken</h3>
          <p className="text-sm text-muted">
            <span className="text-foreground">1. Tell opp.</span> For hvert svar <i>p</i> modellen kan
            gi, ta alle døgnene der den sa <i>p</i>, og se hvor stor andel av dem som fikk over 20 mm:
          </p>
          <Formula>
            kalibrert(p) = antall døgn over 20 mm da modellen sa p / antall døgn modellen sa p
            <br />
            <span className="text-muted">eksempel: Pavo sa 75 % på 3 429 døgn, 1 576 fikk over 20 mm → 46 %</span>
          </Formula>
          <p className="text-sm text-muted">
            <span className="text-foreground">2. Tabellen må gå oppover.</span> Flere medlemmer kan aldri
            bety lavere sannsynlighet. Går to nabotrinn feil vei, slås de sammen til ett felles tall.
            Det kalles isotonisk regresjon.
          </p>
          <p className="text-sm text-muted">
            <span className="text-foreground">3. Ingen jukser.</span> Tabellen for hver måned lages av
            alle de andre månedene, så ingen måned kalibreres med seg selv.
          </p>
          <p className="text-sm text-muted">
            <span className="text-foreground">4. Mål treffsikkerheten.</span> Brier-skåren er snittet av
            kvadrert avvik mellom sannsynligheten og fasiten (1 hvis det kom over 20 mm, 0 hvis ikke).
            Lavere er bedre. Den kan deles i tre:
          </p>
          <Formula>
            Brier = (1/N) · Σ (p − fasit)²
            <br />
            Brier = usikkerhet − oppløsning + pålitelighetsfeil
          </Formula>
          <p className="text-sm text-muted">
            Kalibrering fjerner pålitelighetsfeilen, altså overdrivelsen. Usikkerheten er den samme
            for alle modeller. Da står bare oppløsningen igjen: hvor godt modellen skiller kraftige
            regndøgn fra andre. Det er den prosentene på denne siden egentlig måler.{" "}
            <Link href="/blog/kalibrering" className="text-foreground underline underline-offset-2 hover:text-accent">
              Les hele forklaringen
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultCell({ m }: { m: Model }) {
  if (!m.result) return <span className="text-muted">–</span>;
  if (m.result === "referanse")
    return <span className="text-muted">{m.result}</span>;
  return (
    <span className={`whitespace-nowrap ${m.better ? "font-semibold text-accent" : "text-foreground"}`}>
      {m.result}
      {m.better === false ? <span className="ml-1.5 text-xs text-muted">ikke sign.</span> : null}
    </span>
  );
}

/* A collapsible block for the method sections, so the page leads with the
   models and keeps the explanations one click away. */
function Fold({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl border border-foreground/8 bg-card open:bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 transition hover:bg-foreground/[0.02] [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col">
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted">{hint}</span>
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
        >
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </summary>
      <div className="border-t border-foreground/8 px-5 py-5">{children}</div>
    </details>
  );
}

function SectionHead({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <div id={id} className="flex scroll-mt-24 flex-col gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-3xl text-sm text-muted">{text}</p>
    </div>
  );
}

const NAV = [
  { href: "#kart", label: "Kart" },
  { href: "#alle", label: "Alle modeller" },
  { href: "#tidslinje", label: "Tidslinje" },
  { href: "#metode", label: "Metode" },
];

export default function ModelsPage() {
  const all = SECTIONS.flatMap((section) => section.models);
  const byTag: Record<string, Model> = Object.fromEntries(all.map((m) => [m.tag, m]));
  const info: Record<string, LineageInfo> = byTag;
  const scored = all.filter((m) => m.better !== undefined || m.result === "referanse");
  const better = all.filter((m) => m.better);
  const running = all.filter((m) => m.status === "trener" || m.status === "varsles" || m.status === "i kø");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-24 sm:px-6">
        <header className="flex flex-col gap-6">
          <div className="flex max-w-3xl flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Modellene</h1>
            <p className="text-sm text-muted md:text-base">
              Alle versjonene av Bris som er trent i prosjektet. De er like på alt unntatt det ekstra
              leddet i tapet, antall steg og seed, så hver forskjell i resultatet kan føres tilbake til
              én endring.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { value: String(all.length), label: "modeller" },
              { value: String(scored.length), label: "scoret på teståret" },
              { value: String(better.length), label: "sikkert bedre enn kontrollarmen" },
              { value: String(running.length), label: "kjører nå" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-foreground/8 bg-card px-4 py-3">
                <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Innhold" className="flex flex-wrap gap-1.5">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded-full border border-foreground/10 px-3.5 py-1.5 text-sm text-muted transition hover:border-foreground/25 hover:text-foreground"
                >
                  {n.label}
                </a>
              ))}
            </nav>
            <div className="flex gap-2 text-sm">
              <span className="text-muted">Les om</span>
              <Link href="/modeller/pavo" className="font-medium underline decoration-foreground/30 underline-offset-2 hover:decoration-accent">
                Pavo
              </Link>
              <span className="text-muted">og</span>
              <Link href="/modeller/a" className="font-medium underline decoration-foreground/30 underline-offset-2 hover:decoration-accent">
                A
              </Link>
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <SectionHead
            id="kart"
            title="Hvordan modellene henger sammen"
            text="Hver modell er en endring av den den kommer fra. Tallet er hvor mye bedre eller dårligere den varsler mer enn 20 mm regn i døgnet enn kontrollarmen med samme antall steg. Grønt betyr at forskjellen er sikker."
          />
          <ModelLineage info={info} />
        </section>

        <section className="flex flex-col gap-4">
          <SectionHead
            id="alle"
            title="Alle modeller"
            text="Oppsett og resultat for hver modell. Over 20 mm er endringen i Brier-skår etter kalibrering, mot kontrollarmen, over hele teståret. Negativt er bedre."
          />
          <div className="overflow-x-auto rounded-2xl border border-foreground/8 bg-card">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Modell</th>
                  <th className="px-4 py-3 font-medium">Ekstra straff</th>
                  <th className="px-4 py-3 text-right font-medium">Steg</th>
                  <th className="px-4 py-3 font-medium">Seed</th>
                  <th className="px-4 py-3 text-right font-medium">Over 20 mm</th>
                  <th className="px-4 py-3 text-right font-medium">ROC</th>
                  <th className="px-4 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              {SECTIONS.map((section) => (
                <tbody key={section.title}>
                  <tr className="border-b border-foreground/8 bg-foreground/[0.025]">
                    <td colSpan={7} className="px-4 py-2">
                      <span className="text-xs font-semibold">{section.title}</span>
                      <span className="ml-2 text-xs text-muted">{section.blurb}</span>
                    </td>
                  </tr>
                  {section.models.map((m) => (
                    <tr key={m.tag} className="border-b border-foreground/5 align-top transition hover:bg-foreground/[0.02]">
                      <td className="px-4 py-3">
                        {PAGES[m.tag] ? (
                          <Link href={PAGES[m.tag]} className="font-medium underline decoration-foreground/30 underline-offset-2 hover:decoration-accent">
                            {m.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{m.name}</span>
                        )}
                        <div className="font-mono text-[11px] text-muted">{m.tag}</div>
                        {m.note ? <div className="mt-1 max-w-[18rem] text-xs text-muted">{m.note}</div> : null}
                      </td>
                      <td className="px-4 py-3">
                        <div>{m.threshold}</div>
                        {m.weight !== "–" ? (
                          <div className="text-xs text-muted">
                            vekt {m.weight} · dose {m.dose}
                          </div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{m.steps}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{m.seed}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                        <ResultCell m={m} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted">{m.roc ?? "–"}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs ${STATUS_STYLE[m.status]}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHead
            id="tidslinje"
            title="Treningene i rekkefølge"
            text="Alle treningskjøringene etter dato, på H200-kortene på eX3."
          />
          <ol className="gap-x-10 md:columns-2">
            {RUNS.map((run) => {
              const pending = run.status !== "ferdig";
              return (
                <li key={run.tags.join("+")} className="flex break-inside-avoid gap-4 border-b border-foreground/5 py-3">
                  <span
                    className={[
                      "mt-1.5 size-2.5 shrink-0 rounded-full",
                      pending ? "border border-dashed border-foreground/40" : "bg-accent",
                    ].join(" ")}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-medium">{run.tags.map((t) => byTag[t]?.name ?? t).join(" og ")}</span>
                      <span className="text-xs tabular-nums text-muted">
                        {run.when}
                        {run.hours ? ` · ${run.hours}` : ""}
                      </span>
                    </div>
                    {run.note || pending ? (
                      <span className="text-xs text-muted">
                        {pending ? <span className="mr-1.5 text-accent">{run.status}</span> : null}
                        {run.note}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHead
            id="metode"
            title="Metode"
            text="Hvordan tallene er målt, og hva alle de finjusterte modellene har felles."
          />
          <div className="flex flex-col gap-3">
            <Fold title="Slik leses tallene" hint="vekt, dose, resultat og ROC">
              <ul className="flex flex-col gap-2.5 text-sm text-muted">
                <li>
                  <span className="text-foreground">Ekstra straff</span> er leddet som legges til tapet under
                  treningen: hvilken nedbør det ser, og hvor tungt det veier.
                </li>
                <li>
                  <span className="text-foreground">Vekt</span> er tallet leddet ganges med. Den er målt slik at
                  leddet er like stort som grunntapet på ekstreme tilstander ved vekten til den opprinnelige
                  halearmen.
                </li>
                <li>
                  <span className="text-foreground">Dose</span> er hvor stor andel av tapet leddet utgjør på
                  ekstreme tilstander. 1/2 betyr like stort som grunntapet.
                </li>
                <li>
                  <span className="text-foreground">Over 20 mm</span> er endringen i Brier-skår for
                  sannsynligheten for over 20 mm i døgnet, etter kalibrering måned for måned, mot kontrollarmen
                  med samme steg og seed. Negativt er bedre. Grønt betyr at hele 95-prosentintervallet ligger
                  under null.
                </li>
                <li>
                  <span className="text-foreground">ROC</span> er hvor godt modellen skiller døgn med kraftig
                  regn fra andre døgn. 0,5 er gjetting og 1 er perfekt.
                </li>
              </ul>
            </Fold>

            <Fold title="Kalibreringen, kort forklart" hint="hva den gjør, med ekte tall og matematikken">
              <CalibrationBody />
            </Fold>

            <Fold title="Felles for alle finjusterte modeller" hint="data, perioder, tap og maskinvare">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                {COMMON.map((c) => (
                  <div key={c.term} className="contents">
                    <dt className="text-muted">{c.term}</dt>
                    <dd>{c.value}</dd>
                  </div>
                ))}
              </dl>
            </Fold>
          </div>
        </section>
      </div>
    </main>
  );
}
