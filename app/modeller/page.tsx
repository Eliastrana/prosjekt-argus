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

function CalibrationExplainer() {
  return (
    <section className="mt-14 flex flex-col gap-6">
      <div className="flex max-w-3xl flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Kalibreringen, kort forklart</h2>
        <p className="text-sm text-muted">
          Alle prosentene over er målt etter kalibrering. Her er hva det betyr.
        </p>
      </div>

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
    </section>
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

export default function ModelsPage() {
  const byTag: Record<string, Model> = Object.fromEntries(
    SECTIONS.flatMap((section) => section.models).map((m) => [m.tag, m]),
  );
  const info: Record<string, LineageInfo> = byTag;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <header className="flex max-w-3xl flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Modellene</h1>
          <p className="text-sm text-muted md:text-base">
            Alle variantene av Bris som er trent i prosjektet. De er like på alt unntatt det ekstra
            leddet i tapet, antall steg og seed. Resultatet er hvor mye bedre eller dårligere
            modellen varsler over 20 mm regn i døgnet enn kontrollarmen, etter kalibrering, over hele
            teståret.
          </p>
        </header>

        <section className="mt-12 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">Hvordan modellene henger sammen</h2>
            <p className="text-sm text-muted">
              Hver modell er en endring av den den kommer fra. Teksten under navnet sier hva som ble
              endret. Tallet nederst er hvor mye bedre eller dårligere modellen varsler mer enn 20 mm
              regn i døgnet enn kontrollarmen med samme antall steg, etter kalibrering, over hele
              teståret. Grønt betyr at forskjellen er sikker, grått at den kan være tilfeldig.
            </p>
          </div>
          <ModelLineage info={info} />
        </section>

        <CalibrationExplainer />

        <section className="mt-14 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">Treningene i rekkefølge</h2>
            <p className="text-sm text-muted">
              Alle treningskjøringene etter dato, på H200-kortene på eX3.
            </p>
          </div>
          <ol className="relative ml-2 flex flex-col border-l border-foreground/10">
            {RUNS.map((run) => {
              const pending = run.status !== "ferdig";
              return (
                <li key={run.tags.join("+")} className="relative grid gap-1 py-3 pl-6 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                  <span
                    className={[
                      "absolute -left-[5px] top-[18px] size-2.5 rounded-full",
                      pending ? "border border-dashed border-foreground/40 bg-background" : "bg-accent",
                    ].join(" ")}
                  />
                  <span className="text-sm tabular-nums text-muted">{run.when}</span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium">
                        {run.tags.map((t) => byTag[t]?.name ?? t).join(" og ")}
                      </span>
                      {run.hours ? <span className="text-xs text-muted">{run.hours}</span> : null}
                      {pending ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[run.status]}`}>
                          {run.status}
                        </span>
                      ) : null}
                    </div>
                    {run.note ? <span className="text-xs text-muted">{run.note}</span> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mt-14 flex flex-col gap-12">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
                <p className="text-sm text-muted">{section.blurb}</p>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-foreground/8 bg-card">
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-sm">
                  {/* The same widths in every section, so the columns line up
                      down the page and the tables read as one. */}
                  <colgroup>
                    <col className="w-[25%]" />
                    <col className="w-[13%]" />
                    <col className="w-[9%]" />
                    <col className="w-[6%]" />
                    <col className="w-[7%]" />
                    <col className="w-[10%]" />
                    <col className="w-[13%]" />
                    <col className="w-[6%]" />
                    <col className="w-[11%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-foreground/10 text-xs text-muted">
                      <th className="px-4 py-3 font-medium">Modell</th>
                      <th className="px-4 py-3 font-medium">Terskel</th>
                      <th className="px-4 py-3 text-right font-medium">Vekt</th>
                      <th className="px-4 py-3 text-right font-medium">Dose</th>
                      <th className="px-4 py-3 text-right font-medium">Steg</th>
                      <th className="px-4 py-3 font-medium">Seed</th>
                      <th className="px-4 py-3 text-right font-medium">Over 20 mm</th>
                      <th className="px-4 py-3 text-right font-medium">ROC</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.models.map((m) => (
                      <tr key={m.tag} className="border-b border-foreground/5 last:border-0 align-top">
                        <td className="px-4 py-3">
                          {PAGES[m.tag] ? (
                            <Link href={PAGES[m.tag]} className="font-medium underline decoration-foreground/30 underline-offset-2 hover:decoration-accent">
                              {m.name}
                            </Link>
                          ) : (
                            <div className="font-medium">{m.name}</div>
                          )}
                          <div className="font-mono text-xs text-muted">{m.tag}</div>
                          {m.note ? <div className="mt-1 text-xs text-muted">{m.note}</div> : null}
                        </td>
                        <td className="px-4 py-3">{m.threshold}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{m.weight}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{m.dose}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{m.steps}</td>
                        <td className="px-4 py-3 font-mono text-xs">{m.seed}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                          <ResultCell m={m} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{m.roc ?? "–"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs ${STATUS_STYLE[m.status]}`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-14 grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Slik leses tabellen</h2>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li>
                <span className="text-foreground">Vekt</span> er vekten på det ekstra leddet, målt slik at
                leddet er like stort som grunntapet på ekstreme tilstander ved vekten til den
                opprinnelige halearmen.
              </li>
              <li>
                <span className="text-foreground">Dose</span> er hvor stor andel av tapet det ekstra
                leddet utgjør på ekstreme tilstander. 1/2 betyr like stort som grunntapet.
              </li>
              <li>
                <span className="text-foreground">Over 20 mm</span> er endringen i Brier-skår for
                sannsynligheten for over 20 mm i døgnet, etter kalibrering måned for måned, mot
                kontrollarmen med samme steg og seed. Negativt er bedre. Uthevet betyr at hele
                95-prosentintervallet ligger under null.
              </li>
              <li>
                <span className="text-foreground">ROC</span> er ROC-arealet for det samme spørsmålet:
                hvor godt modellen skiller døgn med kraftig regn fra andre. 0,5 er gjetting, 1 er
                perfekt.
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Felles for alle finjusterte modeller</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {COMMON.map((c) => (
                <div key={c.term} className="contents">
                  <dt className="text-muted">{c.term}</dt>
                  <dd>{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
