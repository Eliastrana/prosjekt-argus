/* The idea of the project in one 16:9 picture, drawn as plain SVG so it can be
   saved as SVG or rendered to PNG without a screenshot library.

   Made to be read on a phone. The canvas is 1920 by 1080 and the picture
   fills about 375 px of a phone screen, so everything is scaled by a fifth:
   the body text is 60 px, which comes out near 12 px, and only the source
   line is smaller. Hence three rows, one idea each, and few words. Colours
   are written out, not read from the site's CSS variables, because the
   exported file has no stylesheet.

   Every number is from the test year (1 August 2025 to 6 September 2026,
   259 178 station-days, 715 daily gauges, over 20 mm in a day):
     3,5 %  the share of station-days with more than 20 mm: 9 124 of 259 178
     8 %    Pavo against plain Bris, calibrated Brier: 0,02007 against 0,02184
   The bars in the middle row are a sketch of the idea, not data. */

export const GRAPHIC_W = 1920;
export const GRAPHIC_H = 1080;

/* iPhone 12, 13 and 14: 390 by 844 points at three pixels a point. */
export const PHONE_W = 1170;
export const PHONE_H = 2532;

export type GraphicTheme = "dark" | "light";

export const PALETTE = {
  dark: {
    bg: "#09090b",
    fg: "#f4f4f5",
    muted: "#a1a1aa",
    card: "#131316",
    track: "#2e2e33",
    bar: "#52525b",
    accent: "#10b981",
    accentText: "#10b981",
  },
  light: {
    bg: "#f8fafc",
    fg: "#0f172a",
    muted: "#475569",
    card: "#eef2f6",
    track: "#d5dde6",
    bar: "#94a3b8",
    accent: "#10b981",
    accentText: "#059669",
  },
} as const;

const MARGIN = 96;
const ROW_X = MARGIN;
const ROW_W = GRAPHIC_W - 2 * MARGIN; // 1728
const ROW_H = 170;
const ROW_GAP = 20;
const ROWS_Y = 456;
const PAD = 48;
const TEXT_X = 560; // where the sentence starts inside a row

/* Used on the page, where next/font defines the family under a variable.
   The export replaces it with the embedded copy of the same font. */
export const PAGE_FONT = "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif";

export default function ArgusIdea({ theme = "dark" }: { theme?: GraphicTheme }) {
  const c = PALETTE[theme];
  const rowY = (i: number) => ROWS_Y + i * (ROW_H + ROW_GAP);
  const number = { fontSize: 128, fontWeight: 700, letterSpacing: -3 } as const;
  const line = { fontSize: 60, fontWeight: 600, fill: c.fg } as const;
  const sub = { fontSize: 48, fontWeight: 400, fill: c.muted } as const;

  const rare = 9124 / 259178; // 0,0352
  const barW = 400;

  return (
    <svg
      viewBox={`0 0 ${GRAPHIC_W} ${GRAPHIC_H}`}
      role="img"
      aria-label="Kan KI varsle kraftig regn bedre? 3,5 prosent av dagene har over 20 millimeter regn. Bris trent videre med ekstra straff for å bomme på kraftig regn. Resultatet er 8 prosent bedre enn vanlig Bris på kraftig regn, mest i første døgn."
      style={{ fontFamily: PAGE_FONT }}
    >
      <rect width={GRAPHIC_W} height={GRAPHIC_H} fill={c.bg} />

      {/* header */}
      <circle cx={MARGIN + 12} cy={86} r={12} fill={c.accent} />
      <text x={MARGIN + 40} y={100} fontSize={44} fontWeight={600} fill={c.fg}>
        Prosjekt Argus
      </text>

      {/* title */}
      <text x={MARGIN} y={262} fontSize={124} fontWeight={700} letterSpacing={-3} fill={c.fg}>
        Kan KI varsle
      </text>
      <text x={MARGIN} y={392} fontSize={124} fontWeight={700} letterSpacing={-3} fill={c.fg}>
        <tspan fill={c.accentText}>kraftig regn</tspan> bedre?
      </text>

      {[0, 1, 2].map((i) => (
        <rect key={i} x={ROW_X} y={rowY(i)} width={ROW_W} height={ROW_H} rx={24} fill={c.card} />
      ))}

      {/* 1. the problem: heavy rain is rare */}
      <g transform={`translate(${ROW_X + PAD} ${rowY(0)})`}>
        <text y={116} fill={c.fg} {...number}>3,5 %</text>
        <rect y={138} width={barW} height={14} rx={7} fill={c.track} />
        <rect y={138} width={barW * rare} height={14} rx={6} fill={c.accent} />
        <text x={TEXT_X - PAD} y={80} {...line}>av dagene har over 20 mm regn</text>
        <text x={TEXT_X - PAD} y={138} {...sub}>målt på 715 stasjoner i Norge, ett år</text>
      </g>

      {/* 2. the move: an extra penalty for missing it */}
      <g transform={`translate(${ROW_X + PAD} ${rowY(1)})`}>
        {/* a sketch: the rain that came, and the rain the model said */}
        <rect x={0} y={26} width={100} height={120} rx={6} fill={c.bar} />
        <rect x={140} y={106} width={100} height={40} rx={6} fill={c.bar} />
        <line x1={0} y1={26} x2={240} y2={26} stroke={c.accent} strokeWidth={4} strokeDasharray="12 9" />
        <line x1={190} y1={36} x2={190} y2={96} stroke={c.accent} strokeWidth={5} strokeLinecap="round" />
        <path d="M178 50 L190 35 L202 50 M178 82 L190 97 L202 82" fill="none" stroke={c.accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <text x={268} y={80} fontSize={44} fontWeight={600} fill={c.accentText}>straff</text>
        <text x={TEXT_X - PAD} y={72} {...line}>Bris trent videre med ekstra straff</text>
        <text x={TEXT_X - PAD} y={134} {...line}>for å bomme på kraftig regn</text>
      </g>

      {/* 3. the result */}
      <g transform={`translate(${ROW_X + PAD} ${rowY(2)})`}>
        <text y={116} fill={c.accentText} {...number}>8 %</text>
        <text x={TEXT_X - PAD} y={80} {...line}>bedre enn vanlig Bris på kraftig regn</text>
        <text x={TEXT_X - PAD} y={138} {...sub}>mest i første døgn</text>
      </g>

      {/* source line */}
      <text x={MARGIN} y={1046} fontSize={36} fontWeight={400} fill={c.muted}>
        Over 20 mm i døgnet, etter kalibrering. Testår 1. august 2025 til 6. september 2026.
      </text>
    </svg>
  );
}

/* The same idea standing up, for an iPhone 12 screen: 1170 by 2532 pixels.
   Content keeps clear of the notch (47 pt, 141 px, at the top) and the home
   indicator (34 pt, 102 px, at the bottom), and sits 84 px, 28 pt, from each
   side. Text is 64 px, 21 pt at full width, so it reads without zooming. */
export function ArgusIdeaPhone({ theme = "dark" }: { theme?: GraphicTheme }) {
  const c = PALETTE[theme];
  const X = 84;
  const W = PHONE_W - 2 * X; // 1002
  const CARD_H = 490;
  const CARD_GAP = 30;
  const CARDS_Y = 780;
  const cardY = (i: number) => CARDS_Y + i * (CARD_H + CARD_GAP);
  const IN = 60; // padding inside a card
  const number = { fontSize: 220, fontWeight: 700, letterSpacing: -5 } as const;
  const line = { fontSize: 64, fontWeight: 600, fill: c.fg } as const;
  const sub = { fontSize: 52, fontWeight: 400, fill: c.muted } as const;
  const rare = 9124 / 259178;
  const barW = 560;

  return (
    <svg
      viewBox={`0 0 ${PHONE_W} ${PHONE_H}`}
      role="img"
      aria-label="Kan KI varsle kraftig regn bedre? 3,5 prosent av dagene har over 20 millimeter regn. Bris trent videre med ekstra straff for å bomme på kraftig regn. Resultatet er 8 prosent bedre enn vanlig Bris på kraftig regn, mest i første døgn."
      style={{ fontFamily: PAGE_FONT }}
    >
      <rect width={PHONE_W} height={PHONE_H} fill={c.bg} />

      <circle cx={X + 14} cy={196} r={14} fill={c.accent} />
      <text x={X + 46} y={212} fontSize={52} fontWeight={600} fill={c.fg}>
        Prosjekt Argus
      </text>

      <text x={X} y={390} fontSize={150} fontWeight={700} letterSpacing={-4} fill={c.fg}>Kan KI varsle</text>
      <text x={X} y={540} fontSize={150} fontWeight={700} letterSpacing={-4} fill={c.accentText}>kraftig regn</text>
      <text x={X} y={690} fontSize={150} fontWeight={700} letterSpacing={-4} fill={c.fg}>bedre?</text>

      {[0, 1, 2].map((i) => (
        <rect key={i} x={X} y={cardY(i)} width={W} height={CARD_H} rx={36} fill={c.card} />
      ))}

      <g transform={`translate(${X + IN} ${cardY(0)})`}>
        <text y={220} fill={c.fg} {...number}>3,5 %</text>
        <rect y={246} width={barW} height={18} rx={9} fill={c.track} />
        <rect y={246} width={barW * rare} height={18} rx={8} fill={c.accent} />
        <text y={330} {...line}>av dagene har over</text>
        <text y={394} {...line}>20 mm regn</text>
        <text y={452} {...sub}>målt på 715 stasjoner, ett år</text>
      </g>

      <g transform={`translate(${X + IN} ${cardY(1)})`}>
        <rect x={0} y={44} width={130} height={170} rx={8} fill={c.bar} />
        <rect x={180} y={154} width={130} height={60} rx={8} fill={c.bar} />
        <line x1={0} y1={44} x2={310} y2={44} stroke={c.accent} strokeWidth={5} strokeDasharray="14 11" />
        <line x1={245} y1={56} x2={245} y2={142} stroke={c.accent} strokeWidth={6} strokeLinecap="round" />
        <path d="M230 72 L245 54 L260 72 M230 126 L245 144 L260 126" fill="none" stroke={c.accent} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <text x={344} y={118} fontSize={56} fontWeight={600} fill={c.accentText}>straff</text>
        <text y={306} {...line}>Bris trent videre med</text>
        <text y={370} {...line}>ekstra straff for å</text>
        <text y={434} {...line}>bomme på kraftig regn</text>
      </g>

      <g transform={`translate(${X + IN} ${cardY(2)})`}>
        <text y={220} fill={c.accentText} {...number}>8 %</text>
        <text y={330} {...line}>bedre enn vanlig Bris</text>
        <text y={394} {...line}>på kraftig regn</text>
        <text y={452} {...sub}>mest i første døgn</text>
      </g>

      <text x={X} y={2358} fontSize={38} fontWeight={400} fill={c.muted}>Over 20 mm i døgnet, etter kalibrering.</text>
      <text x={X} y={2404} fontSize={38} fontWeight={400} fill={c.muted}>Testår 1. august 2025 til 6. september 2026.</text>
    </svg>
  );
}
