// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import ThemeToggle from "./ThemeToggle";
import { intro } from "@/lib/intro";

const navItems = [
  { href: "/", label: "Hjem" },
  { href: "/papers", label: "Artikler" },
  // { href: "/steps", label: "Fremgang" },
  { href: "/blog", label: "Blog" },
  { href: "/modeller", label: "Modeller" },
];

/* Moves one of the bar's markers (the active pill or the hover pill) onto an
   item. The markers are positioned by hand rather than through state, so they
   can slide between items without re-rendering the bar. */
function place(marker: HTMLElement | null, target: HTMLElement | null, snap = false) {
  if (!marker) return;
  if (!target) {
    marker.style.opacity = "0";
    return;
  }
  if (snap) marker.dataset.snap = "true";
  marker.style.opacity = "1";
  marker.style.width = `${target.offsetWidth}px`;
  marker.style.height = `${target.offsetHeight}px`;
  marker.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
  if (snap) {
    void marker.offsetWidth; // apply the snapped position before transitions return
    delete marker.dataset.snap;
  }
}

/* Stagger index for the entry animation. */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

export default function Navbar() {
  const pathname = usePathname();
  const [visibility, setVisibility] = useState(() => ({
    pathname,
    isVisible: pathname !== "/" || intro.played,
  }));
  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const hoverRef = useRef<HTMLSpanElement>(null);
  const hoverShown = useRef(false);
  const activePlaced = useRef(false);

  if (visibility.pathname !== pathname) {
    setVisibility({ pathname, isVisible: pathname !== "/" || intro.played });
  }

  const isVisible = visibility.pathname === pathname && visibility.isVisible;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  // A visit that started on another page never shows the front-page intro.
  useEffect(() => {
    if (pathname !== "/") intro.played = true;
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    const handleReveal = () => {
      setVisibility((current) =>
        current.pathname === pathname
          ? { ...current, isVisible: true }
          : current,
      );
    };

    window.addEventListener("frontpage:reveal", handleReveal);

    return () => {
      window.removeEventListener("frontpage:reveal", handleReveal);
    };
  }, [pathname]);

  // The active pill slides to the current page, and follows the bar when its
  // size changes (fonts loading, breakpoints).
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const placeActive = (snap: boolean) =>
      place(activeRef.current, bar.querySelector<HTMLElement>('[aria-current="page"]'), snap);

    placeActive(!activePlaced.current);
    activePlaced.current = true;

    const observer = new ResizeObserver(() => placeActive(false));
    observer.observe(bar);
    return () => observer.disconnect();
  }, [pathname]);

  // Compact once the page scrolls; tuck away while scrolling down, back on the
  // way up.
  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 8) {
        setTucked(y > last && y > 360);
        last = y;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bar = event.currentTarget;
    const rect = bar.getBoundingClientRect();
    bar.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    bar.style.setProperty("--my", `${event.clientY - rect.top}px`);

    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-nav-item]");
    if (item) {
      place(hoverRef.current, item, !hoverShown.current);
      hoverShown.current = true;
    }
  };

  const handlePointerLeave = () => {
    place(hoverRef.current, null);
    hoverShown.current = false;
  };

  return (
    <header
      data-visible={isVisible}
      className={[
        "nav-shell pointer-events-none fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0",
        tucked ? "nav-shell--tucked" : "",
      ].join(" ")}
    >
      <nav className="relative mx-auto flex max-w-5xl items-center justify-center px-6 py-4">
        <div
          ref={barRef}
          data-compact={scrolled}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="nav-glass pointer-events-auto flex items-center gap-0.5 px-1.5 py-1.5 sm:gap-1 sm:px-2 sm:py-2"
        >
          <span className="nav-sheen" aria-hidden="true" />
          <span className="nav-rim" aria-hidden="true" />
          <span ref={hoverRef} className="nav-marker nav-marker--hover" aria-hidden="true" />
          <span ref={activeRef} className="nav-marker nav-marker--active" aria-hidden="true" />

          {navItems.map((item, i) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                data-nav-item
                aria-current={active ? "page" : undefined}
                style={order(i)}
                className={[
                  "nav-item rounded-full px-2.5 py-2 text-[13px] font-semibold transition-colors duration-300 sm:px-4 sm:text-sm",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  active ? "text-foreground" : "text-muted hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/bris"
            data-nav-item
            aria-label="Prognosekart"
            title="Prognosekart"
            aria-current={isActive("/bris") ? "page" : undefined}
            style={order(navItems.length)}
            className={[
              // Matches ThemeToggle's shape so the two icon controls sit as a
              // pair after the divider.
              "nav-item nav-globe grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-300 sm:size-10",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95",
              isActive("/bris") ? "text-foreground" : "text-muted hover:text-foreground",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="size-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <ellipse cx="12" cy="12" rx="4" ry="9" />
              <path d="M3.5 9h17M3.5 15h17" />
            </svg>
          </Link>

          <span
            className="nav-item mx-1 h-5 w-px bg-foreground/10"
            style={order(navItems.length + 1)}
            aria-hidden="true"
          />

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
