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

type Frame = {
  step: number;
  lead_hours: number;
  valid: string;
  image: string;
};

type Layer = {
  name: string;
  // [lon, lat] corners in Mapbox order: TL, TR, BR, BL. Typed as a 4-tuple
  // because an image source takes exactly four - a plain array is not assignable.
  coordinates: [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ];
  width: number;
  height: number;
  frames: Frame[];
};

type Manifest = {
  variable: string;
  unit: string;
  projection: string;
  vmin: number;
  vmax: number;
  legend: { value: number; color: string }[];
  initialised: string;
  caveat: string;
  // Draw order, bottom first. The LAM comes last so it covers the hole the
  // cutout leaves in the global field.
  layers: Layer[];
};

// Four exports across two axes: which field, and what the global half was
// initialised from. Every one shares the date, the MEPS LAM, the model, the
// geometry, the timeline and - deliberately - the colour scale, so anything
// that differs on screen is a difference in the forecast rather than in how
// it was drawn.
type VariableKey = "air_temperature_2m" | "precipitation_amount";
type SourceKey = "era5" | "od";
type VariantKey = `${SourceKey}|${VariableKey}`;

const variantKey = (s: SourceKey, v: VariableKey): VariantKey => `${s}|${v}`;

type Variant = {
  key: VariantKey;
  source: SourceKey;
  variable: VariableKey;
  // Each run gets its own directory, because the exporter names images by
  // layer and variable alone - `nordic_air_temperature_2m_00.png` collides
  // with itself across runs.
  base: string;
  path: string;
};

const VARIANTS: Variant[] = [
  { key: "era5|air_temperature_2m", source: "era5", variable: "air_temperature_2m", base: "/bris", path: "manifest.json" },
  { key: "era5|precipitation_amount", source: "era5", variable: "precipitation_amount", base: "/bris", path: "manifest-precip.json" },
  { key: "od|air_temperature_2m", source: "od", variable: "air_temperature_2m", base: "/bris/od", path: "manifest.json" },
  { key: "od|precipitation_amount", source: "od", variable: "precipitation_amount", base: "/bris/od", path: "manifest-precip.json" },
];

const baseOf = (key: VariantKey) =>
  VARIANTS.find((v) => v.key === key)?.base ?? BASE;

const srcId = (key: VariantKey, name: string) =>
  `bris-${key.replace("|", "-")}-${name}`;

// Every layer within a manifest shares one timeline, checked at export, so
// the first one speaks for all of them - and the two manifests share it too.
const timeline = (m: Manifest) => m.layers[0].frames;

function fitAll(m: Manifest): [[number, number], [number, number]] {
  const lons = m.layers.flatMap((l) => l.coordinates.map((c) => c[0]));
  const lats = m.layers.flatMap((l) => l.coordinates.map((c) => c[1]));
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ];
}

const LABELS: Record<string, string> = {
  air_temperature_2m: "2 m temperatur",
  air_pressure_at_sea_level: "Havnivåtrykk",
  wind_speed_10m: "10 m vindstyrke",
  precipitation_amount: "Nedbør",
};

const VARIABLE_TABS: { key: VariableKey; short: string }[] = [
  { key: "air_temperature_2m", short: "Temperatur" },
  { key: "precipitation_amount", short: "Nedbør" },
];

const SOURCE_TABS: { key: SourceKey; short: string; title: string }[] = [
  { key: "era5", short: "ERA5", title: "Global halvdel initialisert fra ERA5-reanalysen" },
  {
    key: "od",
    short: "Analyse",
    title: "Global halvdel initialisert fra ECMWFs operasjonelle analyse (MARS class od) - kilden Bris faktisk er trent på",
  },
];

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
  const addVariantRef = useRef<((key: VariantKey, m: Manifest) => void) | null>(null);
  const applyVisibilityRef = useRef<(() => void) | null>(null);
  const appliedStyleRef = useRef<string | null>(null);
  const [manifests, setManifests] = useState<Partial<Record<VariantKey, Manifest>>>({});
  const [variable, setVariable] = useState<VariableKey>("air_temperature_2m");
  const [source, setSource] = useState<SourceKey>("era5");
  const [index, setIndex] = useState(0);
  // Lowering this used to bring back a brighter trapezoid over the LAM: the
  // two rasters overlapped there, and two layers at 0.82 compose to 0.97.
  // The exporter now punches the LAM footprint out of the global field - the
  // model's cutout had already removed that data, so what was drawn there was
  // interpolation artefact, not weather - and with nothing underneath to
  // compose against, the slider is safe at any value.
  const [opacity, setOpacity] = useState(1);
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

  // --- manifests --------------------------------------------------------------
  // The temperature manifest is required - its absence is the error state
  // below. Precipitation is an optional second layer: if that export has not
  // been run yet, the map still works with just the toggle unavailable.
  useEffect(() => {
    let cancelled = false;
    VARIANTS.forEach(({ key, base, path }) => {
      fetch(`${base}/${path}`)
        .then((r) => {
          if (!r.ok) throw new Error(`${path} ga ${r.status}`);
          return r.json();
        })
        .then((m: Manifest) => {
          if (cancelled) return;
          setManifests((prev) => ({ ...prev, [key]: m }));
          // Warm the cache so dragging the slider does not blink through white.
          m.layers.forEach((layer) =>
            layer.frames.forEach((f) => {
              const img = new Image();
              img.src = `${base}/${f.image}`;
            }),
          );
        })
        .catch((e: Error) => {
          if (cancelled) return;
          // Only the ERA5 temperature export is required; the rest simply
          // hide their toggle if they have not been produced yet.
          if (key === "era5|air_temperature_2m") setError(e.message);
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeKey = variantKey(source, variable);
  const manifest =
    manifests[activeKey] ?? manifests["era5|air_temperature_2m"] ?? null;
  const tempManifest = manifests["era5|air_temperature_2m"];

  // Read inside effects that must not themselves depend on `variable` or
  // `manifests` (the map-creation and style-switch effects only want to run
  // on their own triggers). A closure captured at effect-creation time goes
  // stale the moment either of these changes after the fact - which is
  // exactly what silently hid the precipitation layer after a theme switch:
  // the re-add on `style.load` kept using the `variable` from when the map
  // was first built.
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;
  const manifestsRef = useRef(manifests);
  manifestsRef.current = manifests;

  // --- map ------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || !tempManifest || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: isDark ? MAP_STYLE.dark : MAP_STYLE.light,
      // Globe, the v3 default, which flattens to Mercator as you zoom in.
      // Image sources keep their alpha here - the LAM's transparent corners
      // are honoured and the Lambert domain renders with its own shape.
      projection: { name: "globe" },
      bounds: fitAll(tempManifest),
      fitBoundsOptions: { padding: 24 },
    });
    mapRef.current = map;
    // Zoom buttons on desktop only. A phone pinches to zoom, so the control
    // is two more things covering a small map. Watched rather than set once,
    // so rotating the device gets it right.
    const nav = new mapboxgl.NavigationControl({ showCompass: false });
    const wide = window.matchMedia("(min-width: 640px)");
    const syncNav = () => {
      if (wide.matches && !map.hasControl(nav)) map.addControl(nav, "top-right");
      else if (!wide.matches && map.hasControl(nav)) map.removeControl(nav);
    };
    syncNav();
    wide.addEventListener("change", syncNav);

    // Added on `style.load`, not `load`. `load` waits for every source, sprite
    // and glyph the basemap pulls, and if any of those hangs it never fires -
    // the tiles draw, the raster never appears, and nothing reports an error.
    // The style being parsed is all that is needed to add a source. Guarded so
    // it is harmless if both events arrive.
    //
    // Both variants' sources/layers are added, not just the active one: they
    // share geometry and timeline, so keeping both loaded and toggling
    // `visibility` is a paint-property flip rather than a source reload -
    // switching reads instantly instead of blinking through a fetch.
    const addVariant = (key: VariantKey, m: Manifest) => {
      m.layers.forEach((layer) => {
        const id = srcId(key, layer.name);
        if (map.getSource(id)) return;
        map.addSource(id, {
          type: "image",
          url: `${baseOf(key)}/${layer.frames[0].image}`,
          // Each raster is uniform in Mercator y, which is exactly how an image
          // source is interpolated between its corners. A raster uniform in
          // latitude would land here looking plausible and be wrong.
          coordinates: layer.coordinates,
        });
        // Visibility is corrected right after by applyVisibility, reading the
        // live ref rather than being decided here - see the comment above
        // variableRef.
        map.addLayer({
          id: `${id}-layer`,
          type: "raster",
          source: id,
          layout: { visibility: "none" },
          paint: { "raster-opacity": opacity, "raster-fade-duration": 0 },
        });
      });
    };

    const applyVisibility = () => {
      Object.entries(manifestsRef.current).forEach(([k, m]) => {
        if (!m) return;
        const visible = (k as VariantKey) === activeKeyRef.current;
        m.layers.forEach((layer) => {
          const layerId = `${srcId(k as VariantKey, layer.name)}-layer`;
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
          }
        });
      });
    };

    addVariantRef.current = addVariant;
    applyVisibilityRef.current = applyVisibility;
    appliedStyleRef.current = isDark ? MAP_STYLE.dark : MAP_STYLE.light;
    const addLoaded = () => {
      Object.entries(manifestsRef.current).forEach(([k, m]) => {
        if (m) addVariant(k as VariantKey, m);
      });
      applyVisibility();
      setReady(true);
    };
    if (map.isStyleLoaded()) addLoaded();
    else {
      map.once("style.load", addLoaded);
      map.once("load", addLoaded);
    }

    return () => {
      wide.removeEventListener("change", syncNav);
      map.remove();
      mapRef.current = null;
    };
    // manifests/opacity/variable are read at call time via refs and their own
    // effects below; re-running this on every fetch would rebuild the map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempManifest]);

  // A manifest that arrives AFTER the map already exists (precipitation
  // usually does, since both fetches start together but this effect only
  // becomes able to act once `ready`) still needs its sources/layers added.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    Object.entries(manifests).forEach(([k, m]) => {
      if (m) addVariantRef.current?.(k as VariantKey, m);
    });
    applyVisibilityRef.current?.();
  }, [manifests, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    Object.entries(manifests).forEach(([k, m]) => {
      if (!m) return;
      m.layers.forEach((layer) => {
        const source = map.getSource(srcId(k as VariantKey, layer.name)) as
          | mapboxgl.ImageSource
          | undefined;
        const frame = layer.frames[index] ?? layer.frames[layer.frames.length - 1];
        source?.updateImage({ url: `${baseOf(k as VariantKey)}/${frame.image}` });
      });
    });
  }, [index, ready, manifests]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    Object.entries(manifests).forEach(([k, m]) => {
      if (!m) return;
      m.layers.forEach((layer) =>
        map.setPaintProperty(`${srcId(k as VariantKey, layer.name)}-layer`, "raster-opacity", opacity),
      );
    });
  }, [opacity, ready, manifests]);

  // Which variant is on top is a layout property, not a source swap - both
  // stay loaded and this just flips which one paints.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    applyVisibilityRef.current?.();
  }, [variable, ready, manifests]);

  // Switching basemap wipes every source and layer the style did not declare,
  // so every loaded variant has to be put back once the new style is parsed -
  // and its visibility re-derived, not reset to whatever it defaulted to on
  // first add: a stale default here is exactly what silently hid the
  // precipitation layer after a theme switch.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const wanted = isDark ? MAP_STYLE.dark : MAP_STYLE.light;
    if (appliedStyleRef.current === wanted) return;
    appliedStyleRef.current = wanted;
    map.setStyle(wanted);
    map.once("style.load", () => {
      Object.entries(manifestsRef.current).forEach(([k, m]) => {
        if (m) addVariantRef.current?.(k as VariantKey, m);
      });
      applyVisibilityRef.current?.();
    });
  }, [isDark, ready]);

  // --- autoplay -------------------------------------------------------------
  // Frames were preloaded when the manifest arrived, so stepping is a texture
  // swap rather than a fetch. 650 ms reads as weather moving; much faster and
  // the eye cannot follow a front, much slower and it stops being motion.
  useEffect(() => {
    if (!playing || !ready || !manifest || timeline(manifest).length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % timeline(manifest).length),
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

  const frame = timeline(manifest)[index];
  const label = LABELS[manifest.variable] ?? manifest.variable;
  // A toggle only appears once the export behind it exists, so a half-finished
  // set of runs degrades to whatever is actually there rather than offering a
  // button that blanks the map.
  const hasVariable = (v: VariableKey) => !!manifests[variantKey(source, v)];
  const hasSource = (s2: SourceKey) => !!manifests[variantKey(s2, variable)];
  const precipReady = hasVariable("precipitation_amount");
  const odReady = VARIANTS.some((v) => v.source === "od" && manifests[v.key]);

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
  const chipActive = "border-accent/60 bg-accent text-accent-foreground";

  return (
    <div className="fixed inset-0 ">
      <div className="relative h-full w-full">
        {/* h-full, not `absolute inset-0`: mapbox-gl.css sets `position:
            relative` on .mapboxgl-map, which overrides the absolute
            positioning and collapses the container to zero height. */}
        <div ref={containerRef} className="h-full w-full" />

        {/* One compact glass panel rather than three floating boxes: the field,
            the time, the scale and the controls all describe the same frame, so
            splitting them across corners made the eye travel for no reason. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 pb-14 sm:p-5 sm:pb-5">
          <div className={`pointer-events-auto mx-auto w-full max-w-2xl rounded-2xl border px-4 py-3 shadow-2xl ring-1 ring-inset backdrop-blur-xl ${glass}`}>
            {(precipReady || odReady) && (
              <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                {precipReady && (
                  <div className="flex items-center gap-1.5">
                    {VARIABLE_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setVariable(tab.key)}
                        disabled={!hasVariable(tab.key)}
                        aria-pressed={variable === tab.key}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          variable === tab.key ? chipActive : chip
                        }`}
                      >
                        {tab.short}
                      </button>
                    ))}
                  </div>
                )}

                {odReady && (
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] uppercase tracking-wide ${soft}`}>
                      Init
                    </span>
                    {SOURCE_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setSource(tab.key)}
                        disabled={!hasSource(tab.key)}
                        title={tab.title}
                        aria-pressed={source === tab.key}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          source === tab.key ? chipActive : chip
                        }`}
                      >
                        {tab.short}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                max={timeline(manifest).length - 1}
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

            {/* Stacked on a phone, one row from sm up. The four pieces do not
                fit across a narrow screen without the date wrapping mid-word. */}
            <div
              className={`mt-2.5 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-3 ${soft}`}
            >
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                <span className={`shrink-0 font-semibold ${strong}`}>{label}</span>
                <span className="shrink-0">{formatValid(frame.valid)}</span>
              </div>

              {/* ml-auto has to sit on a flex CHILD of the row to push right;
                  on a block wrapper it does nothing. */}
              <div className="flex items-center gap-3 sm:ml-auto">
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="tabular-nums">
                  {manifest.vmin.toFixed(manifest.vmax < 10 ? 1 : 0)}
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
                  {manifest.vmax.toFixed(manifest.vmax < 10 ? 1 : 0)} {manifest.unit}
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
    </div>
  );
}
