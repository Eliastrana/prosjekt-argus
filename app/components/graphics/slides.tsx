/* The explanation in five steps, one picture each, for an iPhone 12 screen
   (1170 by 2532): the problem, the situation, what I am trying, the
   results so far, and what I am waiting for. Meant to be posted one after another, so they share a frame:
   the same header, the same type sizes and the same top edge.

   Each slide is drawn on a design box 834 wide and as tall as it needs, then
   scaled so the box leaves `padding` px of air on each side, and placed with
   the same air above plus TOP_EXTRA. Everything is written in the box's own units, at the
   default padding (204 px, 68 pt) the scale is 0,91, so the 56 px sentences
   come out at 51 px, 17 pt.

   Every number is from the test year (1 August 2025 to 6 September 2026,
   259 178 station-days, 715 daily gauges, over 20 mm in a day, calibrated
   Brier score, +30 h) and is the same as in the posts and on /modeller:
     3,5 %  9 124 of 259 178 station-days exceed 20 mm
     8, 7, 5, 1 %  Pavo, A, control with the spectral term and control, each
            against plain Bris: 0,02007, 0,02028, 0,02068 and 0,02161 against
            0,02184.
     246 million  parameters (246 636 931); one 140 GB card holds the training.
   The bars in the third slide are a sketch of the idea, not data. */

import type { ReactNode } from "react";
import {
  PALETTE,
  PAGE_FONT,
  PHONE_DEFAULT_PADDING,
  PHONE_H,
  PHONE_W,
  type GraphicProps,
  type GraphicTheme,
} from "./ArgusIdea";

const BOX_W = 834;
/* Extra air above the header, on top of the padding, in pixels. 96 px is 32 pt:
   the header then sits about 100 pt from the top edge at the default padding. */
const TOP_EXTRA = 96;
/* The slides used to start with a header line. It is gone, so the drawing is
   moved up by the space it took and the first line sits where the header did. */
const HEADER_H = 160;

type Colours = (typeof PALETTE)[GraphicTheme];

function Frame({
  theme = "dark",
  padding = PHONE_DEFAULT_PADDING,
  height,
  alt,
  children,
}: GraphicProps & { height: number; alt: string; children: (c: Colours) => ReactNode }) {
  const c = PALETTE[theme];
  const top = Math.max(padding, 200) + TOP_EXTRA;
  const bottom = Math.max(padding, 170);
  const scale = Math.min((PHONE_W - 2 * padding) / BOX_W, (PHONE_H - top - bottom) / (height - HEADER_H));
  const left = (PHONE_W - BOX_W * scale) / 2;

  return (
    <svg
      viewBox={`0 0 ${PHONE_W} ${PHONE_H}`}
      role="img"
      aria-label={alt}
      style={{ fontFamily: PAGE_FONT }}
    >
      <rect width={PHONE_W} height={PHONE_H} fill={c.bg} />
      <g transform={`translate(${left} ${top - HEADER_H * scale}) scale(${scale})`}>
        {children(c)}
      </g>
    </svg>
  );
}

/* The title: an eyebrow in the accent colour and up to three big lines. */
function Heading({ c, eyebrow, lines }: { c: Colours; eyebrow: string; lines: string[] }) {
  return (
    <>
      <text y={200} fontSize={52} fontWeight={600} fill={c.accentText}>
        {eyebrow}
      </text>
      {lines.map((line, i) => (
        <text key={line} y={330 + i * 130} fontSize={120} fontWeight={700} letterSpacing={-3} fill={c.fg}>
          {line}
        </text>
      ))}
    </>
  );
}

/* 1. the problem ------------------------------------------------------- */

export function SlideProblem(props: GraphicProps) {
  const PITCH = BOX_W / 10;
  const R = 31;
  const dot = (n: number) => ({ cx: PITCH / 2 + (n % 10) * PITCH, cy: 600 + Math.floor(n / 10) * PITCH });
  const half = dot(3);
  return (
    <Frame
      {...props}
      height={2080}
      alt="Steg 1 av 5, problemet. Kraftig regn er sjeldent. 3,5 prosent av dagene har over 20 millimeter regn. Modellene trenes til å bomme minst mulig i snitt. METs egen artikkel sier at Bris undervarsler ekstreme verdier."
    >
      {(c) => (
        <>
          <Heading c={c} eyebrow="Problemet" lines={["Kraftig regn", "er sjeldent"]} />

          {/* 100 days: three and a half of them with more than 20 mm */}
          {Array.from({ length: 100 }, (_, n) => (
            <circle key={n} {...dot(n)} r={R} fill={n < 3 ? c.accent : c.track} />
          ))}
          <path d={`M ${half.cx} ${half.cy - R} A ${R} ${R} 0 0 0 ${half.cx} ${half.cy + R} Z`} fill={c.accent} />

          <text y={1610} fontSize={190} fontWeight={700} letterSpacing={-5} fill={c.accentText}>
            3,5 %
          </text>
          <text y={1690} fontSize={52} fontWeight={600} fill={c.fg}>
            av dagene har over 20 mm regn
          </text>

          <text y={1850} fontSize={56} fontWeight={600} fill={c.fg}>
            Modellene trenes til å
          </text>
          <text y={1914} fontSize={56} fontWeight={600} fill={c.fg}>
            bomme minst mulig i snitt.
          </text>
          <text y={2012} fontSize={48} fontWeight={400} fill={c.muted}>
            METs egen artikkel sier at Bris
          </text>
          <text y={2070} fontSize={48} fontWeight={400} fill={c.muted}>
            undervarsler ekstreme verdier.
          </text>
        </>
      )}
    </Frame>
  );
}

/* 2. the situation ----------------------------------------------------- */

const FACTS = [
  { key: "2,5 km", lines: ["Bris varsler været over Norden", "i et rutenett på 2,5 km, i steg", "på seks timer."] },
  { key: "246 mill.", lines: ["parametre i nettverket.", "Treningen fyller ett grafikkort", "på 140 GB."] },
  { key: "KI-modell", lines: ["Bris lærer av tidligere vær, i", "stedet for å regne ut været med", "fysikkligninger, som MEPS."] },
];

export function SlideSituation(props: GraphicProps) {
  const CARD_H = 390;
  const GAP = 30;
  const Y0 = 600;
  return (
    <Frame
      {...props}
      height={2000}
      alt="Steg 2 av 5, situasjonen. Jeg starter med Bris, METs KI-værmodell for Norden. Den varsler i et rutenett på 2,5 kilometer, i steg på seks timer. Nettverket har 246 millioner parametre, og treningen fyller ett grafikkort på 140 gigabyte. Bris er en KI-modell som lærer av tidligere vær, i stedet for å regne ut været med fysikkligninger, som METs MEPS. Testet mot 715 målestasjoner i ett år."
    >
      {(c) => (
        <>
          <Heading c={c} eyebrow="Situasjonen" lines={["Jeg starter", "med Bris"]} />
          {FACTS.map((f, i) => {
            const y = Y0 + i * (CARD_H + GAP);
            return (
              <g key={f.key}>
                <rect y={y} width={BOX_W} height={CARD_H} rx={32} fill={c.card} />
                <text x={40} y={y + 140} fontSize={120} fontWeight={700} letterSpacing={-3} fill={c.fg}>
                  {f.key}
                </text>
                {f.lines.map((line, j) => (
                  <text key={line} x={40} y={y + 228 + j * 58} fontSize={48} fontWeight={500} fill={c.muted}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
          <text y={1950} fontSize={44} fontWeight={400} fill={c.muted}>
            Testet mot 715 målestasjoner i ett år.
          </text>
        </>
      )}
    </Frame>
  );
}

/* 3. what I am trying -------------------------------------------------- */

const STEPS = [
  { n: 1, lines: ["Ta Bris som den er"] },
  { n: 2, lines: ["Tren videre, 2 000 runder"] },
  { n: 3, lines: ["Straff ekstra når den", "bommer på kraftig regn"] },
];

const MODELS = [
  { name: "Pavo", what: "straff på all nedbør" },
  { name: "A", what: "straff bare over 20 mm på seks timer" },
  { name: "Kontroll", what: "samme trening, uten straff" },
];

export function SlideApproach(props: GraphicProps) {
  return (
    <Frame
      {...props}
      height={2140}
      alt="Steg 3 av 5, det jeg prøver. Jeg trener Bris videre med en ekstra straff for å bomme på kraftig regn. Tre steg. Ta Bris som den er. Tren videre i 2 000 runder. Straff ekstra når den bommer på kraftig regn. Tre modeller. Pavo straffer all nedbør. A straffer bare over 20 millimeter på seks timer. Kontroll har samme trening uten straff."
    >
      {(c) => (
        <>
          <Heading c={c} eyebrow="Det jeg prøver" lines={["Trene Bris", "videre med", "ekstra straff"]} />

          {/* a sketch: the rain that came, and the rain the model said */}
          <rect x={0} y={750} width={150} height={200} rx={10} fill={c.bar} />
          <rect x={210} y={880} width={150} height={70} rx={10} fill={c.bar} />
          <line x1={0} y1={750} x2={360} y2={750} stroke={c.accent} strokeWidth={5} strokeDasharray="14 11" />
          <line x1={285} y1={762} x2={285} y2={866} stroke={c.accent} strokeWidth={6} strokeLinecap="round" />
          <path d="M270 780 L285 760 L300 780 M270 848 L285 868 L300 848" fill="none" stroke={c.accent} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <text x={400} y={830} fontSize={56} fontWeight={600} fill={c.accentText}>straff</text>
          <text x={75} y={1000} textAnchor="middle" fontSize={44} fontWeight={500} fill={c.muted}>kom</text>
          <text x={285} y={1000} textAnchor="middle" fontSize={44} fontWeight={500} fill={c.muted}>varslet</text>

          {/* three steps */}
          {STEPS.map((s, i) => {
            const y = 1190 + [0, 120, 240][i];
            return (
              <g key={s.n}>
                <circle cx={28} cy={y - 18} r={28} fill={c.accent} />
                <text x={28} y={y - 2} textAnchor="middle" fontSize={40} fontWeight={700} fill={c.bg}>
                  {s.n}
                </text>
                {s.lines.map((line, j) => (
                  <text key={line} x={84} y={y + j * 60} fontSize={56} fontWeight={600} fill={c.fg}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {/* the three models */}
          <text y={1650} fontSize={46} fontWeight={500} fill={c.muted}>
            Tre modeller
          </text>
          {MODELS.map((m, i) => {
            const y = 1750 + i * 160;
            return (
              <g key={m.name}>
                <text y={y} fontSize={56} fontWeight={700} fill={c.accentText}>
                  {m.name}
                </text>
                <text y={y + 54} fontSize={46} fontWeight={400} fill={c.muted}>
                  {m.what}
                </text>
              </g>
            );
          })}
        </>
      )}
    </Frame>
  );
}

/* 4. results so far ---------------------------------------------------- */

const RESULTS = [
  { name: "Vanlig Bris", value: 0, kind: "ref" },
  { name: "Pavo", value: 8.1, kind: "strong" },
  { name: "A", value: 7.1, kind: "strong" },
  { name: "Kontrollarm + spektral", value: 5.3, kind: "control" },
  { name: "Kontrollarm", value: 1.1, kind: "control" },
] as const;

const WHY_CONTROL = [
  "Mer trening gir gevinst alene,",
  "uten straffen. Kontrollarmen får",
  "samme trening og viser dermed",
  "hva straffen gir i tillegg.",
];

export function SlideResults(props: GraphicProps) {
  return (
    <Frame
      {...props}
      height={2250}
      alt="Steg 4 av 5, foreløpige resultater. Bedre på kraftig regn. Hvor mye bedre enn vanlig Bris, over 20 millimeter i døgnet, etter kalibrering. Vanlig Bris er utgangspunktet, 0 prosent. Pavo 8 prosent, A 7 prosent, kontrollarm med spektralledd 5 prosent, kontrollarm 1 prosent. Hvorfor en kontrollarm. Mer trening gir gevinst alene, uten straffen. Kontrollarmen får samme trening og viser dermed hva straffen gir i tillegg. Mest i første døgn, borte ved 36 timer. Må kalibreres, Pavo varsler for mye regn. Foreløpig, ett år og 715 stasjoner, én trekning av hver modell."
    >
      {(c) => (
        <>
          <Heading c={c} eyebrow="Foreløpige resultater" lines={["Bedre på", "kraftig regn"]} />

          <text y={590} fontSize={46} fontWeight={400} fill={c.muted}>
            Hvor mye bedre enn vanlig Bris,
          </text>
          <text y={644} fontSize={46} fontWeight={400} fill={c.muted}>
            over 20 mm i døgnet
          </text>

          {RESULTS.map((r, i) => {
            const y = 770 + i * 140;
            const ref = r.kind === "ref";
            return (
              <g key={r.name}>
                <text y={y} fontSize={52} fontWeight={600} fill={ref ? c.muted : c.fg}>
                  {r.name}
                </text>
                <text x={BOX_W} y={y} textAnchor="end" fontSize={60} fontWeight={700} fill={r.kind === "strong" ? c.accentText : c.muted}>
                  {Math.round(r.value)} %
                </text>
                <rect y={y + 22} width={BOX_W} height={32} rx={16} fill={c.track} />
                {ref ? null : (
                  <rect
                    y={y + 22}
                    width={Math.max((BOX_W * r.value) / 10, 32)}
                    height={32}
                    rx={16}
                    fill={r.kind === "strong" ? c.accent : c.bar}
                  />
                )}
              </g>
            );
          })}

          {/* why there is a control arm */}
          <rect y={1460} width={BOX_W} height={350} rx={32} fill={c.card} />
          <text x={40} y={1536} fontSize={52} fontWeight={700} fill={c.fg}>
            Hvorfor en kontrollarm?
          </text>
          {WHY_CONTROL.map((line, i) => (
            <text key={line} x={40} y={1604 + i * 54} fontSize={46} fontWeight={400} fill={c.muted}>
              {line}
            </text>
          ))}

          <text y={1920} fontSize={52} fontWeight={600} fill={c.fg}>
            Mest i første døgn
          </text>
          <text y={1978} fontSize={46} fontWeight={400} fill={c.muted}>
            borte ved 36 timer
          </text>
          <text y={2056} fontSize={52} fontWeight={600} fill={c.fg}>
            Må kalibreres
          </text>
          <text y={2114} fontSize={46} fontWeight={400} fill={c.muted}>
            Pavo varsler for mye regn
          </text>

          <text y={2200} fontSize={38} fontWeight={400} fill={c.muted}>
            Foreløpig, ett år og 715 stasjoner,
          </text>
          <text y={2244} fontSize={38} fontWeight={400} fill={c.muted}>
            én trekning av hver modell.
          </text>
        </>
      )}
    </Frame>
  );
}

/* 5. what I am waiting for --------------------------------------------- */

export function SlideWaiting(props: GraphicProps) {
  return (
    <Frame
      {...props}
      height={1880}
      alt="Steg 5 av 5, neste steg. Nå venter jeg på Pavo med spektralledd. Den tester om spektralleddet også stopper at Pavo glir utover i varselet. Men H200-kortene på Simulas supercomputer er ikke ledige akkurat nå. Pavo med spektralledd står i kø. Jeg står i kø, med en utmattet smilefjes-emoji."
    >
      {(c) => (
        <>
          <Heading c={c} eyebrow="Neste steg" lines={["Nå venter jeg", "på Pavo +", "spektralledd"]} />

          {/* the only two H200 cards on the cluster, not free right now */}
          {[0, 1].map((i) => {
            const x = i * (400 + 34);
            return (
              <g key={i}>
                <rect x={x} y={720} width={400} height={280} rx={32} fill={c.card} />
                <text x={x + 200} y={850} textAnchor="middle" fontSize={84} fontWeight={700} letterSpacing={-2} fill={c.fg}>
                  H200
                </text>
                <text x={x + 200} y={930} textAnchor="middle" fontSize={46} fontWeight={500} fill={c.muted}>
                  ikke ledig
                </text>
              </g>
            );
          })}

          {/* the job in the queue */}
          <rect x={2} y={1042} width={BOX_W - 4} height={108} rx={54} fill="none" stroke={c.accent} strokeWidth={4} strokeDasharray="16 12" />
          <text x={BOX_W / 2} y={1112} textAnchor="middle" fontSize={52} fontWeight={600} fill={c.accentText}>
            Pavo + spektral, i kø
          </text>

          <text y={1290} fontSize={56} fontWeight={600} fill={c.fg}>
            Den tester om spektralleddet
          </text>
          <text y={1354} fontSize={56} fontWeight={600} fill={c.fg}>
            også stopper at Pavo glir
          </text>
          <text y={1418} fontSize={56} fontWeight={600} fill={c.fg}>
            utover i varselet.
          </text>

          <text y={1520} fontSize={48} fontWeight={400} fill={c.muted}>
            Men H200-kortene på Simulas
          </text>
          <text y={1578} fontSize={48} fontWeight={400} fill={c.muted}>
            supercomputer er ikke ledige
          </text>
          <text y={1636} fontSize={48} fontWeight={400} fill={c.muted}>
            akkurat nå.
          </text>

          <text y={1810} fontSize={84} fontWeight={700} letterSpacing={-2} fill={c.fg}>
            Jeg står i kø 😩
          </text>
        </>
      )}
    </Frame>
  );
}
