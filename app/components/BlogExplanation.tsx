"use client";

import { useEffect, useId, useState } from "react";
import ChildCareOutlined from "@mui/icons-material/ChildCareOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import { explanationLevels } from "@/lib/explanation-levels";

const icons = [ChildCareOutlined, PersonOutline, CodeOutlined, SchoolOutlined];

function TypedSummary({ text }: { text: string }) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const characters = Array.from(text);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const length = Array.from(text).length;
    const duration = Math.min(length * 12, 5_000);
    let started: number | undefined;
    let frame: number;

    function reveal(now: number) {
      started ??= now;
      const count = motionPreference.matches
        ? length
        : Math.min(length, Math.floor(((now - started) / duration) * length) + 1);
      setVisibleCharacters(count);
      if (count < length) frame = requestAnimationFrame(reveal);
    }

    frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [text]);

  return (
    <p className="whitespace-pre-line text-sm leading-6 text-muted">
      {/* Announce the complete summary once, without reading every typed letter. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="grid">
        {/* Reserve the final height so the controls stay still while typing. */}
        <span className="invisible col-start-1 row-start-1">{text}</span>
        <span className="col-start-1 row-start-1">
          {characters.slice(0, visibleCharacters).join("")}
          {visibleCharacters < characters.length ? <span className="explanation-caret" /> : null}
        </span>
      </span>
    </p>
  );
}

export function BlogExplanation({ slug, excerpt }: { slug: string; excerpt?: string }) {
  const id = useId();
  const [level, setLevel] = useState(1);
  const [summary, setSummary] = useState<{ text: string; level: number; revision: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectLevel(next: number) {
    setLevel(next);
    setError("");
  }

  async function explain() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/blog/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, level: explanationLevels[level].id }),
        signal: AbortSignal.timeout(35_000),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Kunne ikke lage forklaringen. Prøv igjen.");
      }
      if (typeof data.summary !== "string" || !data.summary.trim()) {
        throw new Error("Forklaringen var tom. Prøv igjen.");
      }
      setSummary((previous) => ({ text: data.summary, level, revision: (previous?.revision ?? 0) + 1 }));
    } catch (cause) {
      setError(cause instanceof Error && cause.name === "Error"
        ? cause.message
        : "Kunne ikke hente forklaringen akkurat nå. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="blog-explanation mt-8" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${id}-heading`} className="text-base font-semibold tracking-tight">Kort forklart</h2>
        <span className="text-xs text-muted">På ditt nivå</span>
      </div>
      <div className="mt-3" aria-live="polite" aria-busy={loading}>
        {summary ? (
          <TypedSummary key={summary.revision} text={summary.text} />
        ) : (
          <p className="whitespace-pre-line text-sm leading-6 text-muted">
            {"Få en kort oppsummering av innlegget, tilpasset deg."}
          </p>
        )}
        {summary ? (
          <p className="mt-2 text-xs text-muted">
            KI-generert oppsummering · {explanationLevels[summary.level].label}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <fieldset disabled={loading} aria-describedby={`${id}-level`} className="w-52 max-w-full min-w-0 disabled:opacity-60">
          <legend className="sr-only">Velg forklaringsnivå</legend>
          <div className="flex justify-between">
            {explanationLevels.map((item, index) => {
              const Icon = icons[index];
              return (
                <button
                  key={item.id}
                  type="button"
                  className="explanation-level"
                  aria-label={item.label}
                  aria-pressed={level === index}
                  title={item.label}
                  onClick={() => selectLevel(index)}
                >
                  <Icon aria-hidden="true" fontSize="small" />
                </button>
              );
            })}
          </div>
        </fieldset>
        <button
          type="button"
          onClick={explain}
          disabled={loading}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60 hover:cursor-pointer"
        >
          {loading ? "Forklarer …" : "Forklar"}
        </button>
      </div>
      <p id={`${id}-level`} className="mt-1 text-xs text-muted">{explanationLevels[level].label}</p>
      <p className="sr-only" role="status">{loading ? "Lager en kort forklaring …" : ""}</p>
      {error ? <p role="alert" className="mt-4 text-sm text-foreground">{error}</p> : null}
    </section>
  );
}
