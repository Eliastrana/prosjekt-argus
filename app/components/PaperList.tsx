"use client";

import { useMemo, useState } from "react";
import type { RelevantPaper } from "@/lib/papers";
import PaperCard from "./PaperCard";

const SORT_OPTIONS = [
  { value: "added", label: "Rekkefølgen de ble lagt til" },
  { value: "newest", label: "Nyeste først" },
  { value: "oldest", label: "Eldste først" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

function sortPapers(papers: RelevantPaper[], sort: SortOption): RelevantPaper[] {
  if (sort === "added") {
    return papers;
  }

  const direction = sort === "newest" ? -1 : 1;

  return [...papers].sort((left, right) => {
    // Entries without a usable year always sink to the bottom.
    if (left.sortYear === 0 || right.sortYear === 0) {
      return right.sortYear - left.sortYear;
    }

    return (left.sortYear - right.sortYear) * direction;
  });
}

export default function PaperList({ papers }: { papers: RelevantPaper[] }) {
  const [sort, setSort] = useState<SortOption>("added");
  const sorted = useMemo(() => sortPapers(papers, sort), [papers, sort]);

  return (
    <>
      <div className="mt-8 flex items-center justify-end gap-3">
        <label htmlFor="paper-sort" className="text-sm text-muted">
          Sorter etter
        </label>
        <div className="relative">
          <select
            id="paper-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="cursor-pointer appearance-none rounded-xl bg-card py-2 pl-3 pr-9 text-sm shadow-soft outline-none transition hover:bg-card-2"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <section className="mt-4 grid gap-4">
        {sorted.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </section>
    </>
  );
}
