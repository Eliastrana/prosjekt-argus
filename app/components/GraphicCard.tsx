"use client";

import { useEffect, useRef, useState } from "react";
import ArgusIdea, {
  ArgusIdeaPhone,
  GRAPHIC_H,
  GRAPHIC_W,
  PHONE_DEFAULT_PADDING,
  PHONE_H,
  PHONE_W,
  type GraphicTheme,
} from "./graphics/ArgusIdea";
import { SlideApproach, SlideProblem, SlideResults, SlideSituation } from "./graphics/slides";

/* One downloadable picture: the SVG shown at full width, a switch between the
   dark and the light version, and buttons that save it as PNG or SVG, or hand
   it to the phone's share sheet.

   Saving renders the SVG with the font embedded. A standalone SVG has no
   access to the page's fonts, so without that the text would fall back to
   whatever the viewer has installed. */

/* Every picture comes in two formats: wide for the web and stories, and an
   iPhone 12 screen (1170 by 2532) for the lock screen and a phone gallery. */
const FORMATS = {
  wide: { label: "16:9", w: GRAPHIC_W, h: GRAPHIC_H },
  phone: { label: "iPhone 12", w: PHONE_W, h: PHONE_H },
} as const;
type Format = keyof typeof FORMATS;

type Picture = (props: { theme?: GraphicTheme; padding?: number }) => React.ReactElement;
type Entry = { wide?: Picture; phone: Picture };

/* The overview comes in both formats. The four steps are phone only. */
const GRAPHICS: Record<string, Entry> = {
  "argus-idea": { wide: ArgusIdea, phone: ArgusIdeaPhone },
  "steg-1-problemet": { phone: SlideProblem },
  "steg-2-situasjonen": { phone: SlideSituation },
  "steg-3-det-jeg-prover": { phone: SlideApproach },
  "steg-4-resultater": { phone: SlideResults },
};

export type GraphicId = string;

const EXPORT_FONT = "Space Grotesk Export";
let fontCache: Promise<string> | null = null;

function fontDataUri(): Promise<string> {
  fontCache ??= fetch("/fonts/space-grotesk-latin.woff2")
    .then((r) => {
      if (!r.ok) throw new Error("fonten finnes ikke");
      return r.arrayBuffer();
    })
    .then((buf) => {
      let binary = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      return `data:font/woff2;base64,${btoa(binary)}`;
    });
  return fontCache;
}

async function standaloneSvg(svg: SVGSVGElement, w: number, h: number): Promise<string> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));
  clone.removeAttribute("role");
  clone.style.fontFamily = `'${EXPORT_FONT}', system-ui, sans-serif`;
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `@font-face{font-family:'${EXPORT_FONT}';font-weight:300 700;src:url(${await fontDataUri()}) format('woff2');}`;
  clone.insertBefore(style, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}

async function renderPng(svg: SVGSVGElement, w: number, h: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([await standaloneSvg(svg, w, h)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("fikk ikke tegne");
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("fikk ikke lage bildet"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const pill =
  "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60";

const segment = (on: boolean) =>
  `rounded-full px-3 py-1 transition ${
    on ? "bg-foreground font-semibold text-background" : "text-muted hover:text-foreground"
  }`;

function ThemeSwitch({ theme, onChange }: { theme: GraphicTheme; onChange: (t: GraphicTheme) => void }) {
  return (
    <div role="group" aria-label="Fargeversjon" className="flex rounded-full bg-foreground/[0.06] p-1 text-sm">
      {(["dark", "light"] as const).map((t) => (
        <button key={t} type="button" aria-pressed={theme === t} onClick={() => onChange(t)} className={segment(theme === t)}>
          {t === "dark" ? "Mørk" : "Lys"}
        </button>
      ))}
    </div>
  );
}

function PaddingSlider({ padPt, onChange }: { padPt: number; onChange: (pt: number) => void }) {
  return (
    <label className="flex max-w-md items-center gap-3 text-sm">
      <span className="shrink-0 text-muted">Luft rundt</span>
      <input
        type="range"
        min={52}
        max={140}
        step={4}
        value={padPt}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${padPt} punkter`}
        className="h-1 w-full cursor-pointer accent-accent"
      />
      <span className="w-16 shrink-0 text-right tabular-nums">{padPt} pt</span>
    </label>
  );
}

/* A picture on its own, with its own switches, or, when `shared` is given,
   following the theme and padding chosen once for a whole series. */
export default function GraphicCard({
  id,
  title,
  description,
  shared,
}: {
  id: GraphicId;
  title: string;
  description: string;
  shared?: { theme: GraphicTheme; padPt: number };
}) {
  const entry = GRAPHICS[id];
  const formats = (Object.keys(FORMATS) as Format[]).filter((f) => entry[f]);
  const [format, setFormat] = useState<Format>(entry.wide ? "wide" : "phone");
  const Graphic = (entry[format] ?? entry.phone) as Picture;
  const { w, h } = FORMATS[format];
  const [ownTheme, setOwnTheme] = useState<GraphicTheme>("dark");
  // Air on each side of the phone picture, in points (3 pixels each).
  const [ownPadPt, setOwnPadPt] = useState(PHONE_DEFAULT_PADDING / 3);
  const theme = shared?.theme ?? ownTheme;
  const padPt = shared?.padPt ?? ownPadPt;
  const [busy, setBusy] = useState<"png" | "svg" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const probe = new File([""], "x.png", { type: "image/png" });
      setCanShare(typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] }));
    } catch {
      setCanShare(false);
    }
  }, []);

  const filename = (ext: string) =>
    `${id}${id === "argus-idea" && format === "phone" ? "-iphone" : ""}-${theme === "dark" ? "mork" : "lys"}.${ext}`;

  async function run(kind: "png" | "svg" | "share") {
    const svg = wrap.current?.querySelector("svg");
    if (!svg) return;
    setBusy(kind);
    setError(null);
    try {
      if (kind === "svg") {
        save(new Blob([await standaloneSvg(svg, w, h)], { type: "image/svg+xml" }), filename("svg"));
      } else {
        const png = await renderPng(svg, w, h);
        if (kind === "png") {
          save(png, filename("png"));
        } else {
          await navigator.share({ files: [new File([png], filename("png"), { type: "image/png" })], title });
        }
      }
    } catch (e) {
      // Closing the share sheet is not an error.
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError("Det gikk ikke å lage bildet i denne nettleseren. Prøv SVG, eller en annen nettleser.");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="flex flex-col gap-4">
      <div className={shared ? "order-2" : undefined}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>

      <div className={`${format === "phone" ? "mx-auto w-full max-w-[19rem] sm:max-w-xs" : "w-full"} ${shared ? "order-1" : ""}`}>
        <div ref={wrap} className="overflow-hidden rounded-[10px] border border-foreground/10">
          <Graphic theme={theme} padding={padPt * 3} />
        </div>
      </div>

      <div className={`flex flex-wrap items-center gap-2 ${shared ? "order-3" : ""}`}>
        <button
          type="button"
          onClick={() => run("png")}
          disabled={busy !== null}
          className={`${pill} bg-accent text-accent-foreground hover:opacity-90`}
        >
          {busy === "png" ? "Lager bildet" : `Last ned PNG, ${w} × ${h}`}
        </button>
        <button
          type="button"
          onClick={() => run("svg")}
          disabled={busy !== null}
          className={`${pill} bg-tint text-foreground hover:bg-foreground/[0.08]`}
        >
          Last ned SVG
        </button>
        {canShare ? (
          <button
            type="button"
            onClick={() => run("share")}
            disabled={busy !== null}
            className={`${pill} bg-tint text-foreground hover:bg-foreground/[0.08]`}
          >
            Del
          </button>
        ) : null}

        {!shared || formats.length > 1 ? (
          <div className="ml-auto flex flex-wrap gap-2">
            {formats.length > 1 ? (
              <div role="group" aria-label="Format" className="flex rounded-full bg-foreground/[0.06] p-1 text-sm">
                {formats.map((f) => (
                  <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)} className={segment(format === f)}>
                    {FORMATS[f].label}
                  </button>
                ))}
              </div>
            ) : null}
            {!shared ? <ThemeSwitch theme={ownTheme} onChange={setOwnTheme} /> : null}
          </div>
        ) : null}
      </div>

      {!shared && format === "phone" ? <PaddingSlider padPt={ownPadPt} onChange={setOwnPadPt} /> : null}

      {error ? <p className="order-4 text-sm text-[#f59e0b]">{error}</p> : null}
    </article>
  );
}

/* Several pictures that belong together, with one theme and one padding for
   all of them, so they look the same when posted one after another. */
export function GraphicSeries({ items }: { items: { id: GraphicId; title: string; description: string }[] }) {
  const [theme, setTheme] = useState<GraphicTheme>("dark");
  const [padPt, setPadPt] = useState(PHONE_DEFAULT_PADDING / 3);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PaddingSlider padPt={padPt} onChange={setPadPt} />
        <ThemeSwitch theme={theme} onChange={setTheme} />
      </div>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <GraphicCard key={item.id} {...item} shared={{ theme, padPt }} />
        ))}
      </div>
    </div>
  );
}
