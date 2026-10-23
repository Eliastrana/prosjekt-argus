"use client";

import Link from "next/link";
import { useState } from "react";
import { termSlug, type GlossaryGroup } from "@/lib/glossary";

/* The glossary with a search box. Matches on the term, its other names and
   the explanation, so "afCRPS" and "almost-fair" find the same entry. */

export default function GlossaryList({ groups }: { groups: GlossaryGroup[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const shown = groups
    .map((g) => ({
      ...g,
      terms: q
        ? g.terms.filter((t) =>
            [t.term, t.text, ...(t.aka ?? [])].some((s) => s.toLowerCase().includes(q)),
          )
        : g.terms,
    }))
    .filter((g) => g.terms.length > 0);
  const hits = shown.reduce((n, g) => n + g.terms.length, 0);

  return (
    <div className="mt-8 flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk etter et ord, for eksempel kalibrering eller afCRPS"
          aria-label="Søk i ordlisten"
          className="w-full rounded-full bg-foreground/[0.05] px-5 py-3 text-sm outline-none transition placeholder:text-muted focus:bg-foreground/[0.07] focus:ring-2 focus:ring-accent/40"
        />
        {q ? (
          <p className="text-sm text-muted">{hits === 0 ? "Ingen ord passer." : `${hits} treff`}</p>
        ) : (
          <nav aria-label="Temaer" className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="rounded-full bg-foreground/[0.05] px-3 py-1.5 text-sm text-muted transition hover:bg-foreground/[0.08] hover:text-foreground"
              >
                {g.title}
              </a>
            ))}
          </nav>
        )}
      </div>

      {shown.map((g) => (
        <section key={g.id} id={g.id} className="scroll-mt-28">
          <h2 className="text-xl font-semibold tracking-tight">{g.title}</h2>
          <dl className="mt-4">
            {g.terms.map((t) => (
              <div
                key={t.term}
                id={termSlug(t.term)}
                className="grid scroll-mt-28 gap-1 rounded-[10px] border-t border-foreground/10 px-2 py-4 transition target:bg-accent/[0.08] md:grid-cols-[15rem_1fr] md:gap-6"
              >
                <dt>
                  <div className="font-semibold">{t.term}</div>
                  {t.aka?.length ? (
                    <div className="mt-0.5 text-xs leading-relaxed text-muted">{t.aka.join(" · ")}</div>
                  ) : null}
                </dt>
                <dd className="text-sm leading-relaxed text-foreground/80">
                  {t.text}
                  {t.href ? (
                    <>
                      {" "}
                      <Link href={t.href} className="whitespace-nowrap text-accent hover:underline">
                        Les mer →
                      </Link>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
