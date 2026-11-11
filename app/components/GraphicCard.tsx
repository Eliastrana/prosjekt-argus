"use client";

import { useEffect, useRef, useState } from "react";
import ArgusIdea, {
  ArgusIdeaPhone,
  GRAPHIC_H,
  GRAPHIC_W,
  PHONE_H,
  PHONE_W,
  type GraphicTheme,
} from "./graphics/ArgusIdea";

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

const GRAPHICS = {
  "argus-idea": { wide: ArgusIdea, phone: ArgusIdeaPhone },
} as const;

export type GraphicId = keyof typeof GRAPHICS;

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

export default function GraphicCard({
  id,
  title,
  description,
}: {
  id: GraphicId;
  title: string;
  description: string;
}) {
  const [format, setFormat] = useState<Format>("wide");
  const Graphic = GRAPHICS[id][format];
  const { w, h } = FORMATS[format];
  const [theme, setTheme] = useState<GraphicTheme>("dark");
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
    `${id}-${format === "phone" ? "iphone-" : ""}${theme === "dark" ? "mork" : "lys"}.${ext}`;

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

  const pill =
    "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60";

  return (
    <article className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>

      <div
        className={
          format === "phone"
            ? "mx-auto w-full max-w-[19rem] sm:max-w-xs"
            : "w-full"
        }
      >
        <div ref={wrap} className="overflow-hidden rounded-[10px] border border-foreground/10">
          <Graphic theme={theme} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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

        <div className="ml-auto flex flex-wrap gap-2">
        <div role="group" aria-label="Format" className="flex rounded-full bg-foreground/[0.06] p-1 text-sm">
          {(Object.keys(FORMATS) as Format[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={format === f}
              onClick={() => setFormat(f)}
              className={`rounded-full px-3 py-1 transition ${
                format === f ? "bg-background font-semibold text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {FORMATS[f].label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Fargeversjon" className="flex rounded-full bg-foreground/[0.06] p-1 text-sm">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
              className={`rounded-full px-3 py-1 transition ${
                theme === t ? "bg-background font-semibold text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {t === "dark" ? "Mørk" : "Lys"}
            </button>
          ))}
        </div>
        </div>
      </div>

      {error ? <p className="text-sm text-[#f59e0b]">{error}</p> : null}
    </article>
  );
}
