"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const BASE = "/bris";

// Roughly mainland Norway plus its coastal waters. The crop is computed from
// the manifest rather than hardcoded as pixels, so a re-export at a different
// resolution or domain still frames the same place.
const NORWAY = { west: 3.0, east: 32.0, south: 57.0, north: 71.5 };

type Frame = { lead_hours: number; valid: string; image: string };
type Layer = {
  name: string;
  coordinates: [number, number][];
  width: number;
  height: number;
  frames: Frame[];
};
type Manifest = {
  variable: string;
  unit: string;
  vmin: number;
  vmax: number;
  legend: { value: number; color: string }[];
  initialised: string;
  layers: Layer[];
};

const mercY = (deg: number) =>
  Math.log(Math.tan(Math.PI / 4 + (Math.min(Math.max(deg, -85), 85) * Math.PI) / 360));

/** Where to put the image so the Norway box fills a square, without distorting it. */
function frameCrop(layer: Layer) {
  const [tl, tr, br] = layer.coordinates;
  const west = tl[0];
  const east = tr[0];
  const y0 = mercY(br[1]);
  const y1 = mercY(tl[1]);

  const fx0 = (NORWAY.west - west) / (east - west);
  const fx1 = (NORWAY.east - west) / (east - west);
  const fy0 = 1 - (mercY(NORWAY.north) - y0) / (y1 - y0);
  const fy1 = 1 - (mercY(NORWAY.south) - y0) / (y1 - y0);

  // Crop size in image pixels, then the scale that makes it cover a square.
  const cw = (fx1 - fx0) * layer.width;
  const ch = (fy1 - fy0) * layer.height;
  const k = Math.max(cw, ch);

  return {
    width: (layer.width / k) * 100,
    height: (layer.height / k) * 100,
    left: 50 - (((fx0 + fx1) / 2) * layer.width * 100) / k,
    top: 50 - (((fy0 + fy1) / 2) * layer.height * 100) / k,
  };
}

export default function BrisShowcase() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [index, setIndex] = useState(0);
  // Starts true so the animation runs even if IntersectionObserver never
  // reports - a hidden tab, a background render, anything that suppresses it.
  // Failing closed here means a still image and no way to tell why.
  const [visible, setVisible] = useState(true);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}/manifest.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((m: Manifest) => {
        if (cancelled) return;
        setManifest(m);
        const lam = m.layers[m.layers.length - 1];
        lam.frames.forEach((f) => {
          const img = new Image();
          img.src = `${BASE}/${f.image}`;
        });
      })
      // No forecast exported yet is not an error worth shouting about on the
      // front page; the section simply does not render.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Only animate while it is on screen. A loop running behind three screens of
  // scroll costs battery and shows nobody anything.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [manifest]);

  const lam = manifest?.layers[manifest.layers.length - 1];

  useEffect(() => {
    if (!visible || !lam || lam.frames.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % lam.frames.length),
      650,
    );
    return () => window.clearInterval(id);
  }, [visible, lam]);

  const crop = useMemo(() => (lam ? frameCrop(lam) : null), [lam]);

  if (!manifest || !lam || !crop) return null;

  const frame = lam.frames[index];

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Prognosekart</h2>
          <p className="mt-1 text-sm text-muted">
            Bris over Norge, fem døgn fram.
          </p>
        </div>
        <Link
          href="/bris"
          className="text-sm text-muted transition hover:text-foreground"
        >
          Åpne kartet →
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[auto_1fr] md:items-stretch">
        <div
          ref={boxRef}
          className="relative aspect-square w-full overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-card md:w-72"
        >
          {/* Every frame is stacked and cross-faded rather than swapping one
              src: changing src makes the element blank for a beat between
              decodes, which reads as a flicker at this cadence. */}
          {lam.frames.map((f, i) => (
            <img
              key={f.image}
              src={`${BASE}/${f.image}`}
              alt=""
              aria-hidden="true"
              className="absolute max-w-none transition-opacity duration-300"
              style={{
                width: `${crop.width}%`,
                height: `${crop.height}%`,
                // left/top are the image's TOP-LEFT corner, already solved so
                // the crop centre lands in the middle. A translate(-50%,-50%)
                // on top of that shifts it by half the image again.
                left: `${crop.left}%`,
                top: `${crop.top}%`,
                opacity: i === index ? 1 : 0,
              }}
            />
          ))}

          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl border border-white/15 bg-black/55 px-3 py-2 text-white backdrop-blur-xl">
            <span className="text-[11px] font-semibold">2 m temperatur</span>
            <span className="text-[11px] tabular-nums">+{frame.lead_hours} t</span>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-[1.75rem] border border-foreground/10 bg-card p-6">
          <p className="text-sm leading-6 text-muted">
            Modellen fikk to tilstander og regnet 120 timer framover på egen
            hånd. Feltet over Norge er 2,5 km, det er den delen Bris løser
            fint, og den som ligger øverst på kartet.
          </p>
          <p className="mt-3 text-xs leading-5 text-muted">
            Initialisert fra ERA5, ikke fra operasjonell analyse. Ikke et mål på
            treffsikkerhet.
          </p>
          <Link
            href="/bris"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Se hele kartet
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
