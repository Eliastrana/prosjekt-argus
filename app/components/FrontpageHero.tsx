"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const INTRO_HOLD_MS = 900;
const INTRO_FALLBACK_MS = 2200;

export default function FrontpageHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      setIsVideoReady(true);
    }, INTRO_FALLBACK_MS);

    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      setIsVideoReady(true);
    }

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!isVideoReady) {
      return;
    }

    const introTimer = window.setTimeout(() => {
      setShowIntro(false);
    }, INTRO_HOLD_MS);

    return () => {
      window.clearTimeout(introTimer);
    };
  }, [isVideoReady]);

  useEffect(() => {
    if (showIntro) {
      return;
    }

    window.dispatchEvent(new Event("frontpage:reveal"));
  }, [showIntro]);

  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden md:items-end">
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        onCanPlay={handleVideoReady}
        onLoadedData={handleVideoReady}
        onError={handleVideoReady}
      >
        <source src="/frontpage_hd.mp4" type="video/mp4" />
      </video>

      {/*<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.42)_50%,rgba(2,6,23,0.84)_100%)] md:bg-[radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.1),rgba(15,23,42,0.45)_38%,rgba(2,6,23,0.9)_76%)]" />*/}

      <div
        className={[
          "pointer-events-none absolute inset-0 z-20 transition-all duration-700 ease-out",
          showIntro ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-neutral-950" />
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div
            className={[
              "max-w-xl text-center text-white transition-all duration-700 ease-out",
              showIntro ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
            ].join(" ")}
          >
            {/*<h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">*/}
            {/*  Prosjekt Argus*/}
            {/*</h1>*/}
            <div className="mx-auto mt-8 w-64 max-w-full rounded-full border border-white/10 bg-white/5 p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="loading-bar-track h-2 rounded-full bg-white/10">
                <div className="loading-bar-fill h-full rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,0.55),rgba(110,231,183,0.95),rgba(16,185,129,0.55))]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={[
          "relative z-10 w-full px-6 py-24 transition-all duration-700 ease-out md:px-10 md:pb-14 md:pt-28",
          showIntro ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100",
        ].join(" ")}
      >
        <div className="md:flex md:items-end md:justify-between md:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-medium text-white shadow-soft ring-1 ring-white/15 backdrop-blur-sm">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Masterprosjekt • 12. januar 2026 – 18. mai 2027
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Prosjekt Argus
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
              Forbedre beregning av ekstremvær og naturkatastrofer i Norge, ved bruk av dyp lærings-teknikker og spatio-temporal data.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-0 md:flex-shrink-0 md:self-end">
            {/*<Link*/}
            {/*  href="/map"*/}
            {/*  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-95 hover:shadow-lift"*/}
            {/*>*/}
            {/*  Se kart*/}
            {/*</Link>*/}

            {/*<Link*/}
            {/*    href="/check"*/}
            {/*    className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-95 hover:shadow-lift"*/}
            {/*>*/}
            {/*    Lokasjonssjekker*/}
            {/*</Link>*/}
          </div>
        </div>
      </div>
    </section>
  );
}
