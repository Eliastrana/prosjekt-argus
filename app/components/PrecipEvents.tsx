"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MAP_STYLE = {
  dark: "mapbox://styles/mapbox/dark-v11",
  light: "mapbox://styles/mapbox/light-v11",
};

function resolveDark() {
  if (typeof document === "undefined") return true;
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr) return attr === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const BASE = "/bris";

type Site = { id: string; name: string; lat: number; lon: number; mm: number; ratio: number };
type Event = { date: string; stations?: number; max_ratio: number; sites: Site[] };
type Payload = {
  window: [string, string];
  quantile: number;
  stations: number;
  widespread: Event[];
  local: Event[];
};

// Fixed domain so colour means the same thing across every event: a station
// that just cleared its own threshold is pale everywhere, one that tripled it
// is dark red everywhere. Relative-per-event colouring would make a weak
// local event look as severe as Hans.
const RATIO_STOPS: [number, string][] = [
  [1.0, "#fde68a"],
  [1.5, "#fb923c"],
  [2.0, "#ef4444"],
  [3.0, "#7f1d1d"],
];

function ratioColor(r: number) {
  const stops = RATIO_STOPS;
  if (r <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [v1, c1] = stops[i - 1];
    const [v2, c2] = stops[i];
    if (r <= v2) {
      const t = (r - v1) / (v2 - v1);
      return mixHex(c1, c2, t);
    }
  }
  return stops[stops.length - 1][1];
}

function mixHex(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${m.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function formatDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("no-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function boundsOf(sites: Site[]): mapboxgl.LngLatBoundsLike {
  const lons = sites.map((s) => s.lon);
  const lats = sites.map((s) => s.lat);
  return [
    [Math.min(...lons), Math.min(...lats)],
    [Math.max(...lons), Math.max(...lats)],
  ];
}

export default function PrecipEvents() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const appliedStyleRef = useRef<string | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [kind, setKind] = useState<"widespread" | "local">("widespread");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const sync = () => setIsDark(resolveDark());
    sync();
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

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}/precip-events.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`precip-events.json ga ${r.status}`);
        return r.json();
      })
      .then((p: Payload) => !cancelled && setPayload(p))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const allSites = useMemo(
    () => (payload ? [...payload.widespread, ...payload.local].flatMap((e) => e.sites) : []),
    [payload],
  );

  // --- map ------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || !payload || mapRef.current || allSites.length === 0) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: isDark ? MAP_STYLE.dark : MAP_STYLE.light,
      // A rough Norway-wide fallback view. The real framing is the selected
      // event's own bounds, applied once the style is ready - fitting to the
      // union of every event here first raced against that and always won,
      // because the constructor's own bounds are re-applied on resize.
      center: [10, 65],
      zoom: 3.4,
    });
    mapRef.current = map;
    appliedStyleRef.current = isDark ? MAP_STYLE.dark : MAP_STYLE.light;

    const nav = new mapboxgl.NavigationControl({ showCompass: false });
    const wide = window.matchMedia("(min-width: 640px)");
    const syncNav = () => {
      if (wide.matches && !map.hasControl(nav)) map.addControl(nav, "top-right");
      else if (!wide.matches && map.hasControl(nav)) map.removeControl(nav);
    };
    syncNav();
    wide.addEventListener("change", syncNav);

    map.once("style.load", () => setReady(true));
    map.once("load", () => setReady(true));

    return () => {
      wide.removeEventListener("change", syncNav);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const wanted = isDark ? MAP_STYLE.dark : MAP_STYLE.light;
    if (appliedStyleRef.current === wanted) return;
    appliedStyleRef.current = wanted;
    map.setStyle(wanted);
  }, [isDark, ready]);

  // --- markers for the selected event ---------------------------------------
  const event: Event | null = payload ? (payload[kind][selected] ?? null) : null;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !event) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    event.sites.forEach((s: Site) => {
      const size = 10 + Math.min(s.ratio - 1, 2) * 8;
      const el = document.createElement("div");
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = "50%";
      el.style.background = ratioColor(s.ratio);
      el.style.border = "1.5px solid rgba(255,255,255,0.85)";
      el.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.35)";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: size / 2 + 6, closeButton: false }).setHTML(
        `<div style="font:600 12px system-ui;color:#111">${s.name}</div>
         <div style="font:12px system-ui;color:#444;margin-top:2px">${s.mm} mm · ${s.ratio.toFixed(2)}× terskel</div>`,
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([s.lon, s.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });

    const frame = () => {
      map.resize();
      // fitBounds is a silent no-op on a zero-area box - exactly what a
      // single-station "local" event produces, since sw and ne coincide.
      // Most local events are one station, not an edge case.
      if (event.sites.length === 1) {
        map.flyTo({ center: [event.sites[0].lon, event.sites[0].lat], zoom: 9, duration: 600 });
      } else if (event.sites.length > 1) {
        map.fitBounds(boundsOf(event.sites), {
          padding: { top: 80, bottom: 220, left: 40, right: 40 },
          maxZoom: 8,
          duration: 600,
        });
      }
    };

    // Right after `style.load`/`load` fires (the very first paint only), the
    // container can still measure 0x0 - neither a rAF nor a setTimeout(0)
    // guaranteed the CSS had actually applied by then in every environment
    // tried, so Mapbox would compute a zoom for an empty viewport. A
    // ResizeObserver waits for the real event: the container's first
    // non-zero layout, whenever that lands. Later switches already have a
    // real size and apply immediately.
    const el = containerRef.current;
    if (el && el.clientWidth > 0) {
      frame();
      return;
    }
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) {
        ro.disconnect();
        frame();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [event, ready]);

  // --- states -----------------------------------------------------------------
  if (error) {
    return (
      <div className="rounded-[1.75rem] border border-foreground/10 bg-card p-8">
        <h2 className="text-lg font-semibold">Ingen kandidatliste eksportert ennå</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Kartet leser <code>public/bris/precip-events.json</code>, som lages av{" "}
          <code>scripts/find_extremes.py</code> på klyngen og kopieres hit. {error}.
        </p>
      </div>
    );
  }

  if (!payload) {
    return <div className="fixed inset-0 animate-pulse bg-card" />;
  }

  const list = payload[kind];

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
    <div className="fixed inset-0">
      <div className="relative h-full w-full">
        <div ref={containerRef} className="h-full w-full" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 pb-14 sm:p-5 sm:pb-5">
          <div
            className={`pointer-events-auto mx-auto w-full max-w-2xl rounded-2xl border px-4 py-3 shadow-2xl ring-1 ring-inset backdrop-blur-xl ${glass}`}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setKind("widespread");
                  setSelected(0);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  kind === "widespread" ? chipActive : chip
                }`}
              >
                Utbredt
              </button>
              <button
                type="button"
                onClick={() => {
                  setKind("local");
                  setSelected(0);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  kind === "local" ? chipActive : chip
                }`}
              >
                Lokalt
              </button>
              <span className={`ml-auto text-[11px] ${soft}`}>
                {payload.stations} stasjoner · {payload.window[0].slice(0, 4)}–
                {payload.window[1].slice(0, 4)}
              </span>
            </div>

            <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
              {list.map((e, i) => (
                <button
                  key={e.date}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums transition ${
                    i === selected ? chipActive : chip
                  }`}
                >
                  {formatDate(e.date)}
                </button>
              ))}
            </div>

            {event && (
              <div className={`mt-2.5 text-xs leading-5 ${soft}`}>
                <span className={`font-semibold ${strong}`}>
                  {event.stations ?? event.sites.length} stasjoner
                </span>{" "}
                over egen terskel · verst:{" "}
                <span className={strong}>
                  {event.sites[0]?.name.toLowerCase()}
                </span>{" "}
                med {event.sites[0]?.mm} mm ({event.max_ratio.toFixed(2)}× terskel)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
