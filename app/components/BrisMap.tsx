"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
// Without this the canvas is created at the right size and renders nothing:
// the container has no positioning, and Mapbox warns rather than failing.
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
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
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(0.82);
  const [playing, setPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

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
      style: MAP_STYLE_DARK,
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
          <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 shadow-lg backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause" : "Spill av"}
                aria-pressed={playing}
                className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-[10px] transition hover:border-accent/50 hover:text-accent"
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

              <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums">
                +{frame.lead_hours} t
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted">
              <span className="shrink-0 font-medium text-foreground">{label}</span>
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
