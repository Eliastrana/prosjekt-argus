// app/forecast/page.tsx
"use client";

import { useMemo, useState } from "react";

type ApiResponse = {
    source: string;
    query: { lat: number; lon: number; days: number; units: string };
    data: any;
    error?: string;
    details?: string;
};

function formatNum(n: any, decimals = 1) {
    const x = Number(n);
    if (!Number.isFinite(x)) return "-";
    return x.toFixed(decimals);
}

export default function ForecastDemoPage() {
    const [lat, setLat] = useState("59.91");
    const [lon, setLon] = useState("10.75");
    const [days, setDays] = useState("7");
    const [loading, setLoading] = useState(false);
    const [resp, setResp] = useState<ApiResponse | null>(null);

    const hourlyPreview = useMemo(() => {
        const h = resp?.data?.hourly;
        if (!h?.time) return [];
        // Show first 24 hours (or fewer)
        const n = Math.min(h.time.length, 24);
        const rows = [];
        for (let i = 0; i < n; i++) {
            rows.push({
                time: h.time[i],
                t: h.temperature_2m?.[i],
                p: h.precipitation?.[i],
                w: h.windspeed_10m?.[i],
                rh: h.relativehumidity_2m?.[i],
            });
        }
        return rows;
    }, [resp]);

    async function fetchForecast() {
        setLoading(true);
        setResp(null);
        try {
            const url = `/api/ecmwf?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(
                lon
            )}&days=${encodeURIComponent(days)}`;

            const r = await fetch(url, { cache: "no-store" });
            const j = (await r.json()) as ApiResponse;
            setResp(j);
        } catch (e: any) {
            setResp({ source: "", query: { lat: 0, lon: 0, days: 0, units: "metric" }, data: null, error: String(e?.message ?? e) });
        } finally {
            setLoading(false);
        }
    }

    const daily = resp?.data?.daily;
    const dailySummary =
        daily?.time?.length
            ? daily.time.map((t: string, i: number) => ({
                date: t,
                tmax: daily.temperature_2m_max?.[i],
                tmin: daily.temperature_2m_min?.[i],
                precip: daily.precipitation_sum?.[i],
                windmax: daily.windspeed_10m_max?.[i],
            }))
            : [];

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/12 blur-3xl" />
            </div>

            <div className="page-shell">
                <div className="rounded-2xl bg-card p-6 shadow-soft">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="page-title">
                                ECMWF forecast (live)
                            </h1>
                            <p className="mt-1 text-sm text-muted">
                                Demo som henter ECMWF-data via backend-endpointet ditt: <span className="font-semibold">/api/ecmwf</span>
                            </p>
                        </div>

                        <button
                            onClick={fetchForecast}
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-95 disabled:opacity-50"
                        >
                            {loading ? "Henter…" : "Hent forecast"}
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-card-2 p-4">
                            <div className="text-xs font-semibold text-muted">Latitude</div>
                            <input
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                className="mt-2 w-full rounded-xl bg-card px-3 py-2 text-sm outline-none"
                                placeholder="59.91"
                            />
                        </div>

                        <div className="rounded-2xl bg-card-2 p-4">
                            <div className="text-xs font-semibold text-muted">Longitude</div>
                            <input
                                value={lon}
                                onChange={(e) => setLon(e.target.value)}
                                className="mt-2 w-full rounded-xl bg-card px-3 py-2 text-sm outline-none"
                                placeholder="10.75"
                            />
                        </div>

                        <div className="rounded-2xl bg-card-2 p-4">
                            <div className="text-xs font-semibold text-muted">Days</div>
                            <input
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                className="mt-2 w-full rounded-xl bg-card px-3 py-2 text-sm outline-none"
                                placeholder="7"
                            />
                            <div className="mt-2 text-xs text-muted">1–16 (typisk begrensning)</div>
                        </div>
                    </div>

                    {resp?.error && (
                        <div className="mt-6 rounded-2xl bg-card-2 p-4">
                            <div className="text-sm font-semibold">Feil</div>
                            <p className="mt-2 text-sm text-muted">{resp.error}</p>
                            {resp.details && <pre className="mt-2 text-xs text-muted whitespace-pre-wrap">{resp.details}</pre>}
                        </div>
                    )}

                    {resp?.data && !resp.error && (
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {/* Daily summary */}
                            <div className="rounded-2xl bg-card-2 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold">Daglig oversikt</div>
                                    <span className="text-xs text-muted">{resp.source}</span>
                                </div>

                                <div className="mt-3 overflow-hidden rounded-xl bg-card">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-xs text-muted">
                                        <tr>
                                            <th className="px-3 py-2">Dato</th>
                                            <th className="px-3 py-2">T max</th>
                                            <th className="px-3 py-2">T min</th>
                                            <th className="px-3 py-2">Nedbør</th>
                                            <th className="px-3 py-2">Vind max</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {dailySummary.slice(0, 7).map((r: any) => (
                                            <tr key={r.date} className="border-t border-black/5 dark:border-white/5">
                                                <td className="px-3 py-2">{r.date}</td>
                                                <td className="px-3 py-2">{formatNum(r.tmax)}°</td>
                                                <td className="px-3 py-2">{formatNum(r.tmin)}°</td>
                                                <td className="px-3 py-2">{formatNum(r.precip)} mm</td>
                                                <td className="px-3 py-2">{formatNum(r.windmax)} km/h</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Hourly preview */}
                            <div className="rounded-2xl bg-card-2 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold">Neste 24 timer (preview)</div>
                                    <span className="text-xs text-muted">
                    lat {resp.query.lat}, lon {resp.query.lon}
                  </span>
                                </div>

                                <div className="mt-3 overflow-hidden rounded-xl bg-card">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-xs text-muted">
                                        <tr>
                                            <th className="px-3 py-2">Tid</th>
                                            <th className="px-3 py-2">Temp</th>
                                            <th className="px-3 py-2">Nedbør</th>
                                            <th className="px-3 py-2">Vind</th>
                                            <th className="px-3 py-2">RH</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {hourlyPreview.map((r: any) => (
                                            <tr key={r.time} className="border-t border-black/5 dark:border-white/5">
                                                <td className="px-3 py-2">{r.time}</td>
                                                <td className="px-3 py-2">{formatNum(r.t)}°</td>
                                                <td className="px-3 py-2">{formatNum(r.p)} mm</td>
                                                <td className="px-3 py-2">{formatNum(r.w)} km/h</td>
                                                <td className="px-3 py-2">{formatNum(r.rh, 0)}%</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <details className="mt-4">
                                    <summary className="cursor-pointer text-xs text-muted hover:text-foreground transition">
                                        Se rå JSON (debug)
                                    </summary>
                                    <pre className="mt-3 max-h-[320px] overflow-auto rounded-2xl bg-card p-4 text-xs text-muted">
                    {JSON.stringify(resp.data, null, 2)}
                  </pre>
                                </details>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
