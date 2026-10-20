import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GLOSSARY, SPOTLIGHT, spotlightById, type Spotlight } from "@/lib/spotlight";

/* One page per front-page model: what was done to Bris, step by step, then
   the full comparison and the results. The data lives in lib/spotlight.ts so
   the front-page cards and these pages can never disagree. */

export function generateStaticParams() {
  return SPOTLIGHT.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = spotlightById(slug);
  return model
    ? { title: `${model.name}: ${model.subtitle}`, description: model.oneLiner }
    : { title: "Modellen finnes ikke" };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
            "relative flex flex-col gap-2 rounded-2xl border p-5",
            i === 2 ? "border-accent/50 bg-accent/5" : "border-foreground/8 bg-card",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-tint text-xs font-semibold">{s.n}</span>
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
    { name: "Kontrollarm", id: "control", sees: "ingen, det finnes ingen ekstra straff", strength: "–", weight: "–" },
    ...SPOTLIGHT.map((m) => ({
      name: m.name,
      id: m.id,
      sees: m.sees.short,
      strength: "en tidel av vanlig poengsum på dager med mye regn",
      weight: m.code.weight,
    })),
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-foreground/8 bg-card">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-foreground/10 text-xs text-muted">
            <th className="px-4 py-2.5 font-medium" />
            <th className="px-4 py-2.5 font-medium">Hvilken nedbør teller i den ekstra straffen?</th>
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
              <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">{r.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function SpotlightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = spotlightById(slug);
  if (!model) notFound();
  const other = SPOTLIGHT.find((m) => m.id !== model.id);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-24 sm:px-6">
        <header className="flex flex-col gap-4">
          <Link href="/modeller" className="text-sm text-muted transition hover:text-foreground">
            ← Alle modellene
          </Link>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{model.name}</h1>
            <p className="mt-2 text-base text-muted md:text-lg">{model.subtitle}</p>
          </div>
          <p className="text-sm leading-relaxed text-muted md:text-base">{model.oneLiner}</p>
          <div className="grid grid-cols-2 gap-3">
            {[model.headline, model.secondary].map((h) => (
              <div key={h.label} className="rounded-2xl bg-card-2 p-4">
                <div className="text-3xl font-semibold tracking-tight text-accent">{h.value}</div>
                <div className="mt-1 text-xs text-muted">{h.label}</div>
              </div>
            ))}
          </div>
        </header>

        <Section title="Først: hva er Bris?">
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
            <p>
              Bris er en værmodell laget av Meteorologisk institutt med kunstig intelligens. I stedet
              for å regne ut været fra fysikkens ligninger, har den lært av mange år med værdata
              hvordan været pleier å utvikle seg. Den varsler blant annet temperatur, vind og nedbør
              for Norden.
            </p>
            <p>
              En slik modell lærer ved å få en straff hver gang den bommer, og justere seg for å
              bomme mindre. Dette prosjektet tester om Bris blir flinkere til å varsle kraftig regn
              hvis den trenes videre med en ekstra straff for feil i nedbøren.
            </p>
          </div>
        </Section>

        <Section title={`Fra vanlig Bris til ${model.name}, i tre trinn`}>
          <p className="text-sm leading-relaxed text-muted">
            Hvert trinn endrer én ting. Det er det som gjør det mulig å si hva forbedringen kommer av.
          </p>
          <Steps model={model} />
        </Section>

        <Section title="Den ene endringen: en ekstra straff">
          <div className="rounded-2xl border border-foreground/8 bg-card px-5 py-4 text-center text-sm md:text-base">
            <span className="text-muted">poengsum</span> ={" "}
            <span className="font-medium">feil på alt været</span> +{" "}
            <span className="font-semibold text-accent">ekstra straff for feil i nedbøren over Norden</span>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            Kontrollarmen har bare den første delen. {model.name} og {other?.name} har begge den ekstra
            straffen, men de er laget forskjellig:
          </p>
          <ThreeWay model={model} />
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
            <p>
              <span className="font-medium text-foreground">Hvordan {model.name} ser nedbøren. </span>
              {model.sees.how}
            </p>
            <p>
              <span className="font-medium text-foreground">Hvorfor vekten er så forskjellig. </span>
              As straff er null på de fleste dager, fordi alt under 20 mm viskes ut. For at den skal
              bli like sterk som Pavos på de våte dagene, trengs et mye større tall. Begge er stilt inn
              slik at den ekstra straffen utgjør en tidel av den vanlige poengsummen på dager med
              ekstremnedbør.
            </p>
          </div>
        </Section>

        <Section title="En sammenligning">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { who: "Vanlig Bris", what: "har lest pensum én gang." },
              { who: "Kontrollarmen", what: "har øvd mer, med de samme oppgavene og den samme vurderingen." },
              { who: "Pavo", what: "har øvd like mye, men får ekstra trekk for hver feil på alle nedbørsoppgavene." },
              { who: "A", what: "har øvd like mye, men får ekstra trekk bare for feil på de vanskeligste nedbørsoppgavene." },
            ].map((a) => (
              <div
                key={a.who}
                className={`rounded-xl border px-4 py-3 text-sm ${a.who === model.name ? "border-accent/50 bg-accent/5" : "border-foreground/8"}`}
              >
                <span className="font-medium">{a.who}</span> <span className="text-muted">{a.what}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted">Tenk på modellene som elever som øver til den samme eksamenen.</p>
        </Section>

        <Section title="Helt konkret, i koden">
          <p className="text-sm leading-relaxed text-muted">
            Forskjellen mellom kontrollarmen og {model.name} er tre linjer i treningsoppsettet. Alt annet
            er identisk, og det er sjekket med et skript som sammenligner hele oppsettene.
          </p>
          <pre className="overflow-x-auto rounded-2xl border border-foreground/8 bg-card px-5 py-4 font-mono text-[13px] leading-relaxed">
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
          <div className="overflow-x-auto rounded-2xl border border-foreground/8 bg-card">
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
        </Section>

        <Section title="Hvordan vet vi at den er bedre?">
          <p className="text-sm leading-relaxed text-muted">
            Alle modellene laget varsler for et helt år, fra august 2025 til september 2026, som ingen
            av dem hadde sett under treningen. Varslene ble sammenlignet med hva 715 målestasjoner i
            Norden faktisk målte, til sammen 259 178 målinger. Spørsmålet var hvor godt modellen ga
            sannsynlighet for mer enn 20 mm regn i løpet av et døgn, fra et varsel laget seks timer før
            døgnet startet. 20 mm i døgnet er kraftig regn, mer enn de fleste steder får på en vanlig
            regnværsdag.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {model.results.map((r) => (
              <div key={r.label} className="flex flex-col gap-0.5 rounded-xl border border-foreground/8 bg-card px-4 py-3">
                <span className="text-xs text-muted">{r.label}</span>
                <span className={`text-base font-semibold ${r.good ? "text-accent" : "text-foreground"}`}>{r.value}</span>
                {r.note ? <span className="text-xs text-muted">{r.note}</span> : null}
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
                <dd className="mt-0.5 leading-relaxed text-muted">{g.text}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <footer className="flex flex-col gap-3 border-t border-foreground/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          {other ? (
            <Link href={`/modeller/${other.id}`} className="text-sm text-muted transition hover:text-foreground">
              Les om {other.name} →
            </Link>
          ) : null}
          <Link href="/modeller" className="text-sm text-muted transition hover:text-foreground">
            Se alle modellene i prosjektet →
          </Link>
        </footer>
      </article>
    </main>
  );
}
