"use client";

/**
 * A slide deck driven by JSON: an array of { title, content }, both strings.
 *
 * Navigation is deliberately redundant, because the three ways people reach
 * for a deck are all different: arrow keys and space from a keyboard, a swipe
 * on a phone, and a click anywhere on the slide when presenting from a laptop
 * with no keyboard in reach. All three drive the same index.
 *
 * The dots at the foot carry three jobs at once - how many slides there are,
 * which one is showing, and a target to jump to - which is why they are the
 * only chrome the page has.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = { title: string; content: string };

/** One stroked path. Drawn here rather than pulled from an icon set: it is
 *  eight characters of geometry, and it inherits currentColor for free. */
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

export function Presentation({
  src = "/data/presentasjon.json",
  slides: given,
}: {
  src?: string;
  slides?: Slide[];
}) {
  const [slides, setSlides] = useState<Slide[]>(given ?? []);
  const [error, setError] = useState<string | null>(null);
  const [i, setI] = useState(0);
  // Which way the last move went, so the incoming slide enters from that side.
  const [dir, setDir] = useState<1 | -1>(1);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (given) return;
    let live = true;
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: Slide[]) => live && setSlides(j))
      // An empty deck and a missing file look identical on screen otherwise.
      .catch((e) => live && setError(String(e.message ?? e)));
    return () => {
      live = false;
    };
  }, [src, given]);

  const n = slides.length;

  const go = useCallback(
    (to: number) => {
      if (!n) return;
      const next = Math.min(Math.max(to, 0), n - 1);
      setDir(next >= i ? 1 : -1);
      setI(next);
    },
    [i, n],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(i + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(i - 1);
      } else if (e.key === "Home") {
        go(0);
      } else if (e.key === "End") {
        go(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i, n]);

  if (error) {
    return (
      <div className="deck">
        <p className="deck-content">Fant ikke presentasjonen: {error}</p>
      </div>
    );
  }
  if (!n) return <div className="deck" aria-busy="true" />;

  const slide = slides[i];

  return (
    <div
      className="deck"
      onTouchStart={(e) => {
        const t = e.changedTouches[0];
        touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touch.current;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Ignore anything that is more vertical than horizontal, so scrolling
        // a long slide does not change slide underneath the finger.
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
          go(i + (dx < 0 ? 1 : -1));
        }
        touch.current = null;
      }}
    >
      {/* Click targets sit behind the text: the left third goes back, the rest
          forward. Buttons rather than a div so a keyboard and a screen reader
          reach them too. */}
      <button
        type="button"
        className="deck-hit deck-hit--prev"
        onClick={() => go(i - 1)}
        aria-label="Forrige"
        disabled={i === 0}
      />
      <button
        type="button"
        className="deck-hit deck-hit--next"
        onClick={() => go(i + 1)}
        aria-label="Neste"
        disabled={i === n - 1}
      />

      <article
        className="deck-slide"
        key={i}
        style={{ ["--enter" as string]: dir === 1 ? "16px" : "-16px" }}
        aria-live="polite"
      >
        <h1 className="deck-title">{slide.title}</h1>
        <p className="deck-content">{slide.content}</p>
      </article>

      <footer className="deck-foot">
        <div className="deck-dots" role="tablist" aria-label="Lysbilder">
          {slides.map((s, k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={`${k + 1}. ${s.title}`}
              className={`deck-dot${k === i ? " is-current" : ""}`}
              onClick={() => go(k)}
            />
          ))}
        </div>
        <div className="deck-nav">
          <button
            type="button"
            className="deck-arrow"
            onClick={() => go(i - 1)}
            disabled={i === 0}
            aria-label="Forrige lysbilde"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className="deck-arrow"
            onClick={() => go(i + 1)}
            disabled={i === n - 1}
            aria-label="Neste lysbilde"
          >
            <Chevron dir="right" />
          </button>
          <div className="deck-count" aria-hidden="true">
            {i + 1} / {n}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Presentation;
