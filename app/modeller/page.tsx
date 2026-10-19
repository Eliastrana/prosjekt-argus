import type { Metadata } from "next";

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

type Status = "ferdig" | "trener" | "i kø" | "publisert";

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
        status: "i kø",
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
        status: "trener",
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
        status: "i kø",
        note: "scores mot kontrollarmen ved steg 3 000",
      },
    ],
  },
];

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
  "i kø": "bg-foreground/5 text-muted",
};

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

        <section className="mt-12 flex flex-col gap-12">
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
                          <div className="font-medium">{m.name}</div>
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
