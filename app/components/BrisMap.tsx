"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
// Without this the canvas is created at the right size and renders nothing:
// the container has no positioning, and Mapbox warns rather than failing.
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MAP_STYLE = {
  dark: "mapbox://styles/mapbox/dark-v11",
  light: "mapbox://styles/mapbox/light-v11",
};

// globals.css resolves dark as `:root[data-theme="dark"]`, or no attribute at
// all plus a dark system preference. The basemap has to follow the same rule,
// or a light-mode reader gets a dark map with a panel styled for the other one.
function resolveDark() {
  if (typeof document === "undefined") return true;
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr) return attr === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
const BASE = "/bris";
const SOURCE_ID = "bris-field";

type Frame = {
  step: number;
  lead_hours: number;
  valid: string;
  image: string;
};

type Manifest = {
  variable: string;
  unit: string;
  projection: string;
  // [lon, lat] corners in Mapbox order: TL, TR, BR, BL. Typed as a 4-tuple
  // because an image source takes exactly four - a plain array is not assignable.
  coordinates: [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ];
  bounds: { west: number; east: number; south: number; north: number };
  vmin: number;
  vmax: number;
  legend: { value: number; color: string }[];
  initialised: string;
  caveat: string;
  frames: Frame[];
};

const LABELS: Record<string, string> = {
  air_temperature_2m: "2 m temperatur",
  air_pressure_at_sea_level: "Havnivåtrykk",
  wind_speed_10m: "10 m vindstyrke",
  precipitation_amount: "Nedbør",
};

function formatValid(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("no-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default function BrisMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const addFieldRef = useRef<(() => void) | null>(null);
  const appliedStyleRef = useRef<string | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(0.82);
  const [playing, setPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const sync = () => setIsDark(resolveDark());
    sync();
    // The toggle writes an attribute; the system preference fires its own
    // event. Both have to be watched or the map lags a theme behind.
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    return () => {
      obs.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  // --- manifest -------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`manifest.json ga ${r.status}`);
        return r.json();
      })
      .then((m: Manifest) => {
        if (cancelled) return;
        setManifest(m);
        // Warm the cache so dragging the slider does not blink through white.
        m.frames.forEach((f) => {
          const img = new Image();
          img.src = `${BASE}/${f.image}`;
        });
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  // --- map ------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || !manifest || mapRef.current) return;

    const { west, east, south, north } = manifest.bounds;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: isDark ? MAP_STYLE.dark : MAP_STYLE.light,
      bounds: [
        [west, south],
        [east, north],
      ],
      fitBoundsOptions: { padding: 24 },
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // Added on `style.load`, not `load`. `load` waits for every source, sprite
    // and glyph the basemap pulls, and if any of those hangs it never fires -
    // the tiles draw, the raster never appears, and nothing reports an error.
    // The style being parsed is all that is needed to add a source. Guarded so
    // it is harmless if both events arrive.
    const addField = () => {
      if (map.getSource(SOURCE_ID)) return;
      map.addSource(SOURCE_ID, {
        type: "image",
        url: `${BASE}/${manifest.frames[0].image}`,
        // The raster is uniform in Mercator y, which is exactly how an image
        // source is interpolated between its corners. A raster uniform in
        // latitude would land here looking plausible and be wrong.
        coordinates: manifest.coordinates,
      });
      map.addLayer({
        id: `${SOURCE_ID}-layer`,
        type: "raster",
        source: SOURCE_ID,
        paint: { "raster-opacity": opacity, "raster-fade-duration": 0 },
      });
      setReady(true);
    };

    addFieldRef.current = addField;
    appliedStyleRef.current = isDark ? MAP_STYLE.dark : MAP_STYLE.light;
    if (map.isStyleLoaded()) addField();
    else {
      map.once("style.load", addField);
      map.once("load", addField);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // opacity is applied in its own effect; re-running this would rebuild the map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !manifest) return;
    const source = map.getSource(SOURCE_ID) as mapboxgl.ImageSource | undefined;
    source?.updateImage({ url: `${BASE}/${manifest.frames[index].image}` });
  }, [index, ready, manifest]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setPaintProperty(`${SOURCE_ID}-layer`, "raster-opacity", opacity);
  }, [opacity, ready]);

  // Switching basemap wipes every source and layer the style did not declare,
  // so the field has to be put back once the new style is parsed.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const wanted = isDark ? MAP_STYLE.dark : MAP_STYLE.light;
    if (appliedStyleRef.current === wanted) return;
    appliedStyleRef.current = wanted;
    map.setStyle(wanted);
    map.once("style.load", () => addFieldRef.current?.());
  }, [isDark, ready]);

  // --- autoplay -------------------------------------------------------------
  // Frames were preloaded when the manifest arrived, so stepping is a texture
  // swap rather than a fetch. 650 ms reads as weather moving; much faster and
  // the eye cannot follow a front, much slower and it stops being motion.
  useEffect(() => {
    if (!playing || !ready || !manifest || manifest.frames.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % manifest.frames.length),
      650,
    );
    return () => window.clearInterval(id);
  }, [playing, ready, manifest]);

  // --- states ---------------------------------------------------------------
  if (error) {
    return (
      <div className="rounded-[1.75rem] border border-foreground/10 bg-card p-8">
        <h2 className="text-lg font-semibold">Ingen prognose eksportert ennå</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Kartet leser <code>public/bris/manifest.json</code>, som lages av{" "}
          <code>scripts/export_web.py</code> på klyngen og kopieres hit. {error}.
        </p>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="fixed inset-0 animate-pulse bg-card" />
    );
  }

  const frame = manifest.frames[index];
  const label = LABELS[manifest.variable] ?? manifest.variable;

  // The panel sits on the basemap, so it takes its contrast from the basemap
  // rather than from the site theme tokens. Glass needs a tint: a near-clear
  // wash leaves legibility to whatever the raster happens to be doing behind
  // it, which changes with every frame.
  const glass = isDark
    ? "border-white/15 bg-black/55 ring-white/[0.06]"
    : "border-black/10 bg-white/70 ring-black/[0.04]";
  const strong = isDark ? "text-white" : "text-neutral-900";
  const soft = isDark ? "text-white/70" : "text-neutral-700";
  const chip = isDark
    ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
    : "border-black/15 bg-black/5 text-neutral-900 hover:bg-black/10";

  return (
    <div className="fixed inset-0">
      <div className="relative h-full w-full">
        {/* h-full, not `absolute inset-0`: mapbox-gl.css sets `position:
            relative` on .mapboxgl-map, which overrides the absolute
            positioning and collapses the container to zero height. */}
        <div ref={containerRef} className="h-full w-full" />

        {/* One compact glass panel rather than three floating boxes: the field,
            the time, the scale and the controls all describe the same frame, so
            splitting them across corners made the eye travel for no reason. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-5">
          <div className={`pointer-events-auto mx-auto w-full max-w-2xl rounded-2xl border px-4 py-3 shadow-2xl ring-1 ring-inset backdrop-blur-xl ${glass}`}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause" : "Spill av"}
                aria-pressed={playing}
                className={`grid size-8 shrink-0 place-items-center rounded-full border text-[10px] transition hover:border-accent/60 hover:text-accent ${chip}`}
              >
                <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
              </button>

              <input
                type="range"
                min={0}
                max={manifest.frames.length - 1}
                value={index}
                // Dragging is a deliberate act; keep playing and the slider
                // fights the hand holding it.
                onChange={(e) => {
                  setPlaying(false);
                  setIndex(Number(e.target.value));
                }}
                className="h-1 flex-1 cursor-pointer accent-accent"
                aria-label="Ledetid"
              />

              <span className={`w-12 shrink-0 text-right text-xs font-semibold tabular-nums ${strong}`}>
                +{frame.lead_hours} t
              </span>
            </div>

            <div className={`mt-2.5 flex items-center gap-3 text-xs ${soft}`}>
              <span className={`shrink-0 font-semibold ${strong}`}>{label}</span>
              <span className="shrink-0">{formatValid(frame.valid)}</span>

              <span className="ml-auto flex shrink-0 items-center gap-1.5">
                <span className="tabular-nums">
                  {manifest.vmin.toFixed(0)}
                </span>
                <span className="flex h-1.5 w-20 overflow-hidden rounded-full">
                  {manifest.legend.slice(0, -1).map((swatch, i) => (
                    <span
                      key={swatch.value}
                      className="flex-1"
                      style={{
                        background: `linear-gradient(to right, ${swatch.color}, ${
                          manifest.legend[i + 1].color
                        })`,
                      }}
                    />
                  ))}
                </span>
                <span className="tabular-nums">
                  {manifest.vmax.toFixed(0)} {manifest.unit}
                </span>
              </span>

              <input
                type="range"
                min={0.2}
                max={1}
                step={0.02}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="h-1 w-16 shrink-0 cursor-pointer accent-accent"
                aria-label="Dekkevne"
                title="Dekkevne"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
