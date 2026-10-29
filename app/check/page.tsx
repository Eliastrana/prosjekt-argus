// app/check/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Arrow } from "@/app/components/Arrow";

type HeatPoint = { lat: number; lon: number; risk: number };

const TH_GREEN = 0.10;  // under dette: minimal
const TH_YELLOW = 0.15; // >= dette: medium
const TH_RED = 0.20;    // >= dette: high

function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
}

// Fast nok for MVP: kvadrert avstand i grader
function nearestPoint(points: HeatPoint[], lat: number, lon: number) {
    let best: HeatPoint | null = null;
    let bestD = Infinity;

    for (const p of points) {
        const dLat = p.lat - lat;
        const dLon = p.lon - lon;
        const d = dLat * dLat + dLon * dLon;
        if (d < bestD) {
            bestD = d;
            best = p;
        }
    }

    return { point: best, dist2: bestD };
}

function levelFromRisk(risk: number) {
    // HIGH (red)
    if (risk >= TH_RED)
        return {
            label: "Høy",
            desc: "Sterkt signal om forhøyet risiko",
            dot: "bg-red-600 dark:bg-red-500",
            wrap:
                "bg-red-50 ring-1 ring-red-200 " +
                "dark:bg-red-500/12 dark:ring-red-500/25",
            title: "text-red-900 dark:text-red-200",
            sub: "text-red-700 dark:text-red-200/80",
            chip:
                "bg-red-100 text-red-900 ring-1 ring-red-200 " +
                "dark:bg-red-500/15 dark:text-red-200 dark:ring-red-500/25",
            panel:
                "bg-white/60 ring-1 ring-red-100 " +
                "dark:bg-red-500/8 dark:ring-transparent",
        };

    // MEDIUM (yellow)
    if (risk >= TH_YELLOW)
        return {
            label: "Middels",
            desc: "Tydelig signal om risiko i området",
            dot: "bg-yellow-500 dark:bg-yellow-400",
            wrap:
                "bg-yellow-50 ring-1 ring-yellow-200 " +
                "dark:bg-yellow-400/12 dark:ring-yellow-400/25",
            title: "text-yellow-950 dark:text-yellow-200",
            sub: "text-yellow-800 dark:text-yellow-200/80",
            chip:
                "bg-yellow-100 text-yellow-950 ring-1 ring-yellow-200 " +
                "dark:bg-yellow-400/15 dark:text-yellow-200 dark:ring-yellow-400/25",
            panel:
                "bg-white/60 ring-1 ring-yellow-100 " +
                "dark:bg-yellow-400/8 dark:ring-transparent",
        };

    // LOW (green)
    if (risk >= TH_GREEN)
        return {
            label: "Lav",
            desc: "Noe signal, men under høyere varselnivå",
            dot: "bg-emerald-600 dark:bg-emerald-500",
            wrap:
                "bg-emerald-50 ring-1 ring-emerald-200 " +
                "dark:bg-emerald-500/10 dark:ring-emerald-500/20",
            title: "text-emerald-950 dark:text-emerald-200",
            sub: "text-emerald-800 dark:text-emerald-200/80",
            chip:
                "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200 " +
                "dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/25",
            panel:
                "bg-white/60 ring-1 ring-emerald-100 " +
                "dark:bg-emerald-500/8 dark:ring-transparent",
        };

    // MINIMAL (neutral/gray)
    return {
        label: "Minimal",
        desc: "Under varselgrense",
        dot: "bg-zinc-500 dark:bg-zinc-400",
        wrap:
            "bg-zinc-50 ring-1 ring-zinc-200 " +
            "dark:bg-zinc-400/10 dark:ring-zinc-400/15",
        title: "text-zinc-900 dark:text-zinc-200",
        sub: "text-zinc-700 dark:text-zinc-200/70",
        chip:
            "bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200 " +
            "dark:bg-zinc-400/15 dark:text-zinc-200 dark:ring-zinc-400/20",
        panel:
            "bg-white/60 ring-1 ring-zinc-100 " +
            "dark:bg-zinc-400/8 dark:ring-transparent",
    };
}

export default function CheckRiskPage() {
    const [mode, setMode] = useState<"normal" | "advanced">("normal");

    const [lat, setLat] = useState<string>("59.91");
    const [lon, setLon] = useState<string>("10.75");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [result, setResult] = useState<{
        input: { lat: number; lon: number };
        nearest: HeatPoint;
        level: ReturnType<typeof levelFromRisk>;
    } | null>(null);

    async function fetchAndCompute(userLat: number, userLon: number) {
        setLoading(true);
        setErr(null);
        setResult(null);

        try {
            const res = await fetch("/heatmap.json", { cache: "no-store" });
            if (!res.ok) throw new Error(`Kunne ikke laste /heatmap.json (${res.status})`);
            const json = await res.json();

            const points = (json.data as HeatPoint[]) ?? [];
            if (!points.length) throw new Error("Ingen punkter i heatmap.json");

            const { point } = nearestPoint(points, userLat, userLon);
            if (!point) throw new Error("Fant ikke nærmeste punkt");

            setResult({
                input: { lat: userLat, lon: userLon },
                nearest: point,
                level: levelFromRisk(point.risk),
            });
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Ukjent feil");
        } finally {
            setLoading(false);
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        const la = Number(lat);
        const lo = Number(lon);

        if (!Number.isFinite(la) || !Number.isFinite(lo)) {
            setErr("Skriv inn gyldige tall for breddegrad og lengdegrad.");
            return;
        }

        const safeLat = clamp(la, -90, 90);
        const safeLon = clamp(lo, -180, 180);

        await fetchAndCompute(safeLat, safeLon);
    }

    function useMyLocation() {
        setErr(null);

        if (!navigator.geolocation) {
            setErr("Posisjon (geolocation) støttes ikke i denne nettleseren.");
            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const la = pos.coords.latitude;
                const lo = pos.coords.longitude;
                setLat(String(la));
                setLon(String(lo));
                await fetchAndCompute(la, lo);
            },
            (geoErr) => {
                setLoading(false);
                setErr(geoErr.message || "Kunne ikke hente posisjon.");
            },
            { enableHighAccuracy: false, timeout: 12000, maximumAge: 60_000 }
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="page-shell">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="page-title">Sjekk risiko med posisjon</h1>
                    <Link href="/map" className="text-sm text-muted hover:text-foreground transition">
                        Se kart <Arrow />
                    </Link>
                </div>

                {/* Modus-velger */}
                <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-card p-3 shadow-soft">
                    <div className="text-sm font-semibold">Modus</div>

                    <div className="flex rounded-full bg-card-2 p-1">
                        <button
                            type="button"
                            onClick={() => setMode("normal")}
                            className={[
                                "rounded-full px-4 py-2 text-xs font-semibold transition",
                                mode === "normal"
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted hover:text-foreground",
                            ].join(" ")}
                        >
                            Normal
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("advanced")}
                            className={[
                                "rounded-full px-4 py-2 text-xs font-semibold transition",
                                mode === "advanced"
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted hover:text-foreground",
                            ].join(" ")}
                        >
                            Avansert
                        </button>
                    </div>
                </div>

                {/* Normal / Avansert */}
                <div className="mt-4 rounded-2xl bg-card p-6 shadow-soft">
                    {mode === "normal" ? (
                        <>

                            <div className=" flex flex-col gap-3 sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    onClick={useMyLocation}
                                    disabled={loading}
                                    className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
                                >
                                    {loading ? "Henter posisjon…" : "Bruk min posisjon"}
                                </button>
                            </div>

                            {err && (
                                <div className="mt-4 rounded-xl bg-card-2 p-3 text-sm text-red-400">
                                    {err}
                                </div>
                            )}
                        </>
                    ) : (
                        <form onSubmit={onSubmit}>
                            <div className="text-sm font-semibold">Manuell koordinat</div>
                            <p className="mt-1 text-sm text-muted">
                                Skriv inn koordinater, så finner vi nærmeste gridpunkt.
                            </p>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-1">
                                    <span className="text-xs font-semibold text-muted">Breddegrad (lat)</span>
                                    <input
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        inputMode="decimal"
                                        className="h-11 rounded-xl bg-card-2 px-4 text-sm outline-none ring-1 ring-transparent focus:ring-accent"
                                        placeholder="f.eks. 59.91"
                                    />
                                </label>

                                <label className="grid gap-1">
                                    <span className="text-xs font-semibold text-muted">Lengdegrad (lon)</span>
                                    <input
                                        value={lon}
                                        onChange={(e) => setLon(e.target.value)}
                                        inputMode="decimal"
                                        className="h-11 rounded-xl bg-card-2 px-4 text-sm outline-none ring-1 ring-transparent focus:ring-accent"
                                        placeholder="f.eks. 10.75"
                                    />
                                </label>
                            </div>

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
                                >
                                    {loading ? "Sjekker…" : "Sjekk trusselnivå"}
                                </button>

                                <button
                                    type="button"
                                    onClick={useMyLocation}
                                    disabled={loading}
                                    className="inline-flex h-11 items-center justify-center rounded-xl bg-card-2 px-5 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                                >
                                    Bruk min posisjon
                                </button>
                            </div>

                            {err && (
                                <div className="mt-4 rounded-xl bg-card-2 p-3 text-sm text-red-400">
                                    {err}
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Resultat */}
                {result && (
                    <section className={`mt-6 rounded-2xl p-6 shadow-soft ${result.level.wrap}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className={`text-xs font-semibold ${result.level.sub}`}>Resultat</div>

                                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                                    <div className="text-sm font-semibold text-muted">Trusselnivå</div>
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${result.level.chip}`}
                                    >
                    <span className={`h-2.5 w-2.5 rounded-full ${result.level.dot}`} />
                                        {result.level.label}
                  </span>
                                </div>

                                <p className={`mt-2 text-sm ${result.level.sub}`}>{result.level.desc}</p>
                            </div>

                            <span className={`h-3 w-3 rounded-full ${result.level.dot}`} />
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <div className={`rounded-xl p-4 ${result.level.panel}`}>
                                <div className={`text-xs ${result.level.sub}`}>Din posisjon</div>
                                <div className={`mt-1 text-sm font-semibold ${result.level.title}`}>
                                    {result.input.lat.toFixed(4)}, {result.input.lon.toFixed(4)}
                                </div>
                            </div>

                            <div className={`rounded-xl p-4 ${result.level.panel}`}>
                                <div className={`text-xs ${result.level.sub}`}>Nærmeste gridpunkt</div>
                                <div className={`mt-1 text-sm font-semibold ${result.level.title}`}>
                                    {result.nearest.lat.toFixed(4)}, {result.nearest.lon.toFixed(4)}
                                </div>
                            </div>

                            <div className={`rounded-xl p-4 ${result.level.panel}`}>
                                <div className={`text-xs ${result.level.sub}`}>Risikoscore</div>
                                <div className={`mt-1 text-sm font-semibold ${result.level.title}`}>
                                    {(result.nearest.risk * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <p className={`mt-4 text-xs ${result.level.sub}`}>
                            Merk: Dette er en prototype basert på en nedbørs-proxy og er ikke et offisielt varsel.
                        </p>
                    </section>
                )}
            </div>
        </main>
    );
}