// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/", label: "Hjem" },
  { href: "/papers", label: "Artikler" },
  // { href: "/steps", label: "Fremgang" },
  { href: "/bris", label: "Prognose" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [visibility, setVisibility] = useState(() => ({
    pathname,
    isVisible: pathname !== "/",
  }));

  if (visibility.pathname !== pathname) {
    setVisibility({ pathname, isVisible: pathname !== "/" });
  }

  const isVisible = visibility.pathname === pathname && visibility.isVisible;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

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

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0",
      ].join(" ")}
    >
      <nav className="relative mx-auto flex max-w-5xl items-center justify-center px-6 py-4">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-foreground/8 bg-card/95 px-2 py-2 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-md">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-tint text-foreground"
                    : "text-muted hover:bg-tint hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="mx-1 h-5 w-px bg-foreground/10" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
