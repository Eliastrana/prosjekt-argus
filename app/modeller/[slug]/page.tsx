import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GLOSSARY,
  SPOTLIGHT,
  spotlightById,
  type Spotlight,
} from "@/lib/spotlight";

/* One page per front-page model: what was done to Bris, step by step, then
   the full comparison and the results. The data lives in lib/spotlight.ts so
   the front-page cards and these pages can never disagree. */

export function generateStaticParams() {
  return SPOTLIGHT.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = spotlightById(slug);
  return model
    ? { title: `${model.name}: ${model.subtitle}`, description: model.oneLiner }
    : { title: "Modellen finnes ikke" };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Steps({ model }: { model: Spotlight }) {
  const steps = [
    {
      n: "1",
      title: "Vanlig Bris",
      text: "Meteorologisk institutt har trent Bris på værdata fra flere år. Under treningen får den én poengsum for hvor mye den bommer på alt været samtidig: temperatur, vind, trykk, nedbør og resten. Den justerer seg for å få lavere poengsum.",
      tag: "utgangspunktet",
    },
    {
      n: "2",
      title: "Vanlig finjustering",
      text: "Vanlig Bris trent videre på 18 måneder med nyere værdata, i 2 000 runder, med den samme poengsummen som før. Ingenting er lagt til. Den kalles kontrollarmen, og viser hvor mye som kommer av mer trening alene.",
      tag: "sammenligningen",
    },
    {
      n: "3",
      title: model.name,
      text: `Nøyaktig som trinn 2: samme data, samme 2 000 runder, samme innstillinger. Den eneste forskjellen er én ekstra straff for feil i nedbøren over Norden. Straffen ser ${model.sees.short}.`,
      tag: "én endring",
    },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((s, i) => (
        <div
          key={s.n}
          className={[
            "relative flex flex-col gap-2 rounded-[10px] p-5",
            i === 2
              ? "bg-accent/[0.12]"
              : "bg-foreground/[0.04]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-tint text-xs font-semibold">
              {s.n}
            </span>
            <span className="text-xs text-muted">{s.tag}</span>
          </div>
          <h3 className="text-base font-semibold">{s.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

function ThreeWay({ model }: { model: Spotlight }) {
  const rows = [
    {
      name: "Kontrollarm",
      id: "control",
      sees: "ingen, det finnes ingen ekstra straff",
      strength: "–",
      weight: "–",
    },
    ...SPOTLIGHT.map((m) => ({
      name: m.name,
      id: m.id,
      sees: m.sees.short,
      strength: "en tidel av vanlig poengsum på dager med mye regn",
      weight: m.code.weight,
    })),
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-foreground/10 text-xs text-muted">
            <th className="px-4 py-2.5 font-medium" />
            <th className="px-4 py-2.5 font-medium">
              Hvilken nedbør teller i den ekstra straffen?
            </th>
            <th className="px-4 py-2.5 font-medium">Hvor sterk er den?</th>
            <th className="px-4 py-2.5 text-right font-medium">Vekt i koden</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className={`border-b border-foreground/5 align-top last:border-0 ${r.id === model.id ? "bg-accent/5" : ""}`}
            >
              <td className="px-4 py-2.5 font-medium">{r.name}</td>
              <td className="px-4 py-2.5 text-muted">{r.sees}</td>
              <td className="px-4 py-2.5 text-muted">{r.strength}</td>
              <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                {r.weight}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Two readings of the same page: everyone, or the Bris developers at MET.
   The choice is in the address (?for=met), so a link can go straight to it. */
function AudienceToggle({ id, met }: { id: string; met: boolean }) {
  const options = [
    { href: `/modeller/${id}`, label: "For alle", active: !met },
    { href: `/modeller/${id}?for=met`, label: "For meteorologer", active: met },
  ];
  return (
    <nav
      aria-label="Velg forklaring"
      className="inline-flex self-start rounded-full border border-foreground/10 bg-card p-1"
    >
      {options.map((o) => (
        <Link
          key={o.label}
          href={o.href}
          scroll={false}
          aria-current={o.active ? "page" : undefined}
          className={[
            "rounded-full px-4 py-1.5 text-sm font-semibold transition",
            o.active
              ? "bg-tint text-foreground"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-foreground/[0.035] px-5 py-4 font-mono text-[12.5px] leading-relaxed">
      {children}
    </pre>
  );
}

function ExpertView({ model }: { model: Spotlight }) {
  const e = model.expert;
  const setup: {
    label: string;
    bris: string;
    control: string;
    model: string;
  }[] = [
    {
      label: "Startpunkt",
      bris: "–",
      control: "bris-crpsfft, load_weights_only + transfer_learning",
      model: "samme",
    },
    {
      label: "Rammeverk",
      bris: "METs anemoi-core",
      control: "anemoi-training 0.5.1, xbris-patcher (medlemmer sekvensielt)",
      model: "samme",
    },
    {
      label: "Data",
      bris: "trening 2020-02-05 → 2025-03-31 (fra sjekkpunktet)",
      control:
        "MEPS 2,5 km (trim_edge 50) + IFS od-an N320, cutout; trening 2023-10-01 → 2025-03-31",
      model: "samme",
    },
    {
      label: "Tap",
      bris: "afCRPS + CRPSFFT",
      control: "afCRPS, α = 0,95 (CRPSFFT finnes ikke i 0.5.1)",
      model: "afCRPS + γ · afCRPS(v_t(tp)) på LAM-noder",
    },
    {
      label: "Normalisering",
      bris: "sjekkpunktets",
      control: "arvet, bit-lik",
      model: "arvet, bit-lik",
    },
    {
      label: "Plan",
      bris: "rollout 6 i siste fase",
      control:
        "2 000 av 3 000 steg, cosinus 3,75e-6 → 3,75e-7, warmup 100, rollout 1, batch 1",
      model: "samme",
    },
    {
      label: "Maskinvare",
      bris: "flere GPU-er per medlem",
      control: "1 × H200, 3 medlemmer, chunking 16/32, ~18,5 t",
      model: "samme",
    },
    { label: "Seed", bris: "–", control: "20260909", model: "20260909" },
  ];
  return (
    <>
      <Section title="Kort sagt">
        <p className="text-sm leading-relaxed text-muted md:text-base">
          {e.tldr}
        </p>
      </Section>

      <Section title="Oppsett, side om side">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-foreground/10 text-xs text-muted">
                <th className="w-[16%] px-4 py-2.5 font-medium" />
                <th className="w-[22%] px-4 py-2.5 font-medium">
                  bris-crpsfft (MET)
                </th>
                <th className="w-[34%] px-4 py-2.5 font-medium">Kontrollarm</th>
                <th className="px-4 py-2.5 font-medium">{model.name}</th>
              </tr>
            </thead>
            <tbody>
              {setup.map((r) => (
                <tr
                  key={r.label}
                  className="border-b border-foreground/5 align-top last:border-0"
                >
                  <td className="px-4 py-2.5 text-muted">{r.label}</td>
                  <td className="px-4 py-2.5 text-muted">{r.bris}</td>
                  <td className="px-4 py-2.5 text-muted">{r.control}</td>
                  <td
                    className={`px-4 py-2.5 ${r.model === "samme" ? "text-muted" : "font-medium text-foreground"}`}
                  >
                    {r.model}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          Kontrollarmen og {model.name} er sjekket mot hverandre med en diff av
          de komponerte Hydra-konfigurasjonene. Den eneste forskjellen er det
          andre leddet i tapet.
        </p>
      </Section>

      <Section title="Tapet">
        <Mono>
          {`L = afCRPS_α(X, y) + γ · afCRPS_α( v_t(X_tp), v_t(y_tp) )

v_t(z) = max(z, t)          bare tp; alle andre kanaler satt til 0
skalering                    pressure_level, general_variable, nan_mask_weights,
                             lam_node_weights (bare LAM-nodene, altså Norden)
tp i normaliserte enheter    tp[m] · 422,037  (delt på 2,36946 mm, ingen middelverdi)

t = ${e.threshold}
γ = ${e.gamma}`}
        </Mono>
        <p className="text-sm leading-relaxed text-muted">{e.measured}</p>
      </Section>

      <Section title="Konfigurasjon">
        <Mono>{e.yaml}</Mono>
        <p className="text-xs text-muted">
          Leddet er implementert i xbris/losses.py som en underklasse av
          AlmostFairKernelCRPS. Det leser tp-kanalen fra anemois data_indices og
          nekter å bygge hvis den ikke stemmer med tail_index.
        </p>
      </Section>

      <Section title="Evaluering">
        <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-muted">
          {[
            "Testår 2025-08-01 → 2026-09-06, aldri sett av noen modell. Normaliseringen er sjekket for lekkasje: den statistikken i datasettet som dekker teståret, er ikke brukt.",
            "Varsler med bris-inference 0.2.0, 4 medlemmer, init 00 UTC, inferens-seed 1234 for alle modeller. Global inngang fra IFS od-an.",
            "Fasit: 715 Frost-stasjoner, kvalitetskode ≤ 4, døgnsum 06–06 UTC ved +30 t. Modellverdi fra nærmeste rute innenfor 5 km, sjekket mot bilineær.",
            "Strenge felles tilfeller med MEPS, 259 178 stasjonsdøgn. Sannsynlighet = andel medlemmer over terskelen.",
            "Isotonisk regresjon (PAV), tilpasset utenfor kalendermåneden som scores. Brier-skår, parret blokk-bootstrap med 7-dagers blokker og 5 000 trekk, ROC-areal (Mann–Whitney).",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Resultater, teståret">
        <div className="grid gap-2 sm:grid-cols-2">
          {e.results.map((r) => (
            <div
              key={r.label}
              className="flex flex-col gap-0.5 rounded-[10px] bg-foreground/[0.04] px-4 py-3"
            >
              <span className="text-xs text-muted">{r.label}</span>
              <span
                className={`font-mono text-sm font-semibold ${r.good ? "text-accent" : "text-foreground"}`}
              >
                {r.value}
              </span>
              {r.ci ? (
                <span className="font-mono text-xs text-muted">
                  95 %: {r.ci}
                </span>
              ) : null}
              {r.note ? (
                <span className="text-xs text-muted">{r.note}</span>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Merknader">
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-muted">
          {e.notes.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Kjente avvik fra METs oppsett">
        <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-muted">
          {[
            "CRPSFFT mangler i begge armer, fordi klassen ikke finnes i anemoi-training 0.5.1. Begge armer driver derfor likt mot glattere felt, men mot bris-crpsfft er det to endringer, ikke én.",
            "3 medlemmer på ett kort med medlemmene kjørt etter hverandre, rollout 1 og batch 1. MET trente med flere GPU-er per medlem og lengre rollout.",
            "18 måneders finjusteringsdata og én trekning per variant. Bare Pavo er gjentatt med nytt seed.",
            "msl er ikke evaluert, fordi det ikke finnes trykkmålinger i datasettet. 2t er scoret mot Frost uten høydekorreksjon, så nivået kan være skjevt, men forskjellen mellom modellene er det ikke.",
            "Fast inferens-seed (bris-inference setter 1234): alle modeller og dager får samme støy. Det er rettferdig parvis, men ikke uavhengig over dager.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted" />
              {t}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

export default async function SpotlightPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ for?: string }>;
}) {
  const { slug } = await params;
  const model = spotlightById(slug);
  if (!model) notFound();
  const met = (await searchParams).for === "met";
  const other = SPOTLIGHT.find((m) => m.id !== model.id);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="page-shell flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="page-title">
              {model.name}
            </h1>
            <p className="mt-2 text-base text-muted md:text-lg">
              {model.subtitle}
            </p>
          </div>
          <AudienceToggle id={model.id} met={met} />
          {met ? null : (
            <>
              <p className="text-sm leading-relaxed text-muted md:text-base">
                {model.oneLiner}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[model.headline, model.secondary].map((h) => (
                  <div key={h.label} className="rounded-[10px] bg-foreground/[0.04] p-4">
                    <div className="text-3xl font-semibold tracking-tight text-accent">
                      {h.value}
                    </div>
                    <div className="mt-1 text-xs text-muted">{h.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </header>

        {met ? (
          <ExpertView model={model} />
        ) : (
          <>
            <Section title="Først: hva er Bris?">
              <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
                <p>
                  Bris er en værmodell laget av Meteorologisk institutt med
                  kunstig intelligens. I stedet for å regne ut været fra
                  fysikkens ligninger, har den lært av mange år med værdata
                  hvordan været pleier å utvikle seg. Den varsler blant annet
                  temperatur, vind og nedbør for Norden.
                </p>
                <p>
                  En slik modell lærer ved å få en straff hver gang den bommer,
                  og justere seg for å bomme mindre. Dette prosjektet tester om
                  Bris blir flinkere til å varsle kraftig regn hvis den trenes
                  videre med en ekstra straff for feil i nedbøren.
                </p>
              </div>
            </Section>

            <Section title={`Fra vanlig Bris til ${model.name}, i tre trinn`}>
              <p className="text-sm leading-relaxed text-muted">
                Hvert trinn endrer én ting. Det er det som gjør det mulig å si
                hva forbedringen kommer av.
              </p>
              <Steps model={model} />
            </Section>

            <Section title="Den ene endringen: en ekstra straff">
              <div className="border-y border-foreground/12 py-5 text-center text-sm md:text-base">
                <span className="text-muted">poengsum</span> ={" "}
                <span className="font-medium">feil på alt været</span> +{" "}
                <span className="font-semibold text-accent">
                  ekstra straff for feil i nedbøren over Norden
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Kontrollarmen har bare den første delen. {model.name} og{" "}
                {other?.name} har begge den ekstra straffen, men de er laget
                forskjellig:
              </p>
              <ThreeWay model={model} />
              <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
                <p>
                  <span className="font-medium text-foreground">
                    Hvordan {model.name} ser nedbøren.{" "}
                  </span>
                  {model.sees.how}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    Hvorfor vekten er så forskjellig.{" "}
                  </span>
                  As straff er null på de fleste dager, fordi alt under 20 mm
                  viskes ut. For at den skal bli like sterk som Pavos på de våte
                  dagene, trengs et mye større tall. Begge er stilt inn slik at
                  den ekstra straffen utgjør en tidel av den vanlige poengsummen
                  på dager med ekstremnedbør.
                </p>
              </div>
            </Section>

            <Section title="En sammenligning">
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { who: "Vanlig Bris", what: "har lest pensum én gang." },
                  {
                    who: "Kontrollarmen",
                    what: "har øvd mer, med de samme oppgavene og den samme vurderingen.",
                  },
                  {
                    who: "Pavo",
                    what: "har øvd like mye, men får ekstra trekk for hver feil på alle nedbørsoppgavene.",
                  },
                  {
                    who: "A",
                    what: "har øvd like mye, men får ekstra trekk bare for feil på de vanskeligste nedbørsoppgavene.",
                  },
                ].map((a) => (
                  <div
                    key={a.who}
                    className={`rounded-[10px] px-4 py-3 text-sm ${a.who === model.name ? "bg-accent/[0.12]" : "bg-foreground/[0.04]"}`}
                  >
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted">{a.what}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted">
                Tenk på modellene som elever som øver til den samme eksamenen.
              </p>
            </Section>

            <Section title="Helt konkret, i koden">
              <p className="text-sm leading-relaxed text-muted">
                Forskjellen mellom kontrollarmen og {model.name} er tre linjer i
                treningsoppsettet. Alt annet er identisk, og det er sjekket med
                et skript som sammenligner hele oppsettene.
              </p>
              <pre className="overflow-x-auto rounded-md bg-foreground/[0.035] px-5 py-4 font-mono text-[13px] leading-relaxed">
                {`ekstra ledd:  samme ensemble-CRPS én gang til, bare nedbør, bare Norden
terskel:      ${model.code.threshold}
vekt:         ${model.code.weight}`}
              </pre>
            </Section>

            <Section title={`Hva det gjør med ${model.name}`}>
              <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
                {model.story.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </Section>

            <Section title="Alt som er forskjellig fra vanlig Bris, punkt for punkt">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-foreground/10 text-xs text-muted">
                      <th className="w-[28%] px-4 py-2.5 font-medium" />
                      <th className="w-[32%] px-4 py-2.5 font-medium">
                        Vanlig Bris
                      </th>
                      <th className="px-4 py-2.5 font-medium">{model.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.rows.map((r) => (
                      <tr
                        key={r.label}
                        className="border-b border-foreground/5 align-top last:border-0"
                      >
                        <td className="px-4 py-2.5 text-muted">{r.label}</td>
                        <td className="px-4 py-2.5 text-muted">{r.bris}</td>
                        <td
                          className={`px-4 py-2.5 ${r.changed ? "font-medium text-foreground" : "text-muted"}`}
                        >
                          {r.changed ? (
                            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-accent align-middle" />
                          ) : null}
                          {r.model}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted">
                Grønn prikk betyr at det er endret fra vanlig Bris.
              </p>
            </Section>

            <Section title="Hvordan vet vi at den er bedre?">
              <p className="text-sm leading-relaxed text-muted">
                Alle modellene laget varsler for et helt år, fra august 2025 til
                september 2026, som ingen av dem hadde sett under treningen.
                Varslene ble sammenlignet med hva 715 målestasjoner i Norden
                faktisk målte, til sammen 259 178 målinger. Spørsmålet var hvor
                godt modellen ga sannsynlighet for mer enn 20 mm regn i løpet av
                et døgn, fra et varsel laget seks timer før døgnet startet. 20
                mm i døgnet er kraftig regn, mer enn de fleste steder får på en
                vanlig regnværsdag.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {model.results.map((r) => (
                  <div
                    key={r.label}
                    className="flex flex-col gap-0.5 rounded-[10px] bg-foreground/[0.04] px-4 py-3"
                  >
                    <span className="text-xs text-muted">{r.label}</span>
                    <span
                      className={`text-base font-semibold ${r.good ? "text-accent" : "text-foreground"}`}
                    >
                      {r.value}
                    </span>
                    {r.note ? (
                      <span className="text-xs text-muted">{r.note}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid gap-6 sm:grid-cols-2">
              <Section title="Styrker">
                <ul className="flex flex-col gap-1.5 text-sm text-muted">
                  {model.strengths.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Section>
              <Section title="Begrensninger">
                <ul className="flex flex-col gap-1.5 text-sm text-muted">
                  {model.limits.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted" />
                      {s}
                    </li>
                  ))}
                </ul>
              </Section>
            </div>

            <Section title="Ordliste">
              <dl className="flex flex-col gap-3">
                {GLOSSARY.map((g) => (
                  <div key={g.term} className="text-sm">
                    <dt className="font-medium text-foreground">{g.term}</dt>
                    <dd className="mt-0.5 leading-relaxed text-muted">
                      {g.text}
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          </>
        )}

        <footer className="flex flex-col gap-3 border-t border-foreground/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          {other ? (
            <Link
              href={`/modeller/${other.id}${met ? "?for=met" : ""}`}
              className="text-sm text-muted transition hover:text-foreground"
            >
              Les om {other.name} →
            </Link>
          ) : null}
          <Link
            href="/blog/bris-artikkelens-figurer"
            className="text-sm text-muted transition hover:text-foreground"
          >
            Målt slik MET målte Bris →
          </Link>
          <Link
            href="/modeller"
            className="text-sm text-muted transition hover:text-foreground"
          >
            Se alle modellene i prosjektet →
          </Link>
          <Link
            href="/ordliste"
            className="text-sm text-muted transition hover:text-foreground"
          >
            Ordliste →
          </Link>
        </footer>
      </article>
    </main>
  );
}
