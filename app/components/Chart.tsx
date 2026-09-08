"use client";

/**
 * Dynamic charts for blog posts, drawn with d3.
 *
 * Used from MDX as <Chart kind="line" ... />. The component owns the axes,
 * scales, hover readout and resize behaviour; a post supplies only data.
 *
 * WHY D3 AND NOT A CHART LIBRARY. Most of what this project needs to show is
 * a distribution with a long right tail, and the interesting part is the last
 * one percent. Chart libraries make the common case easy and the tail hard:
 * they pick round axis bounds, drop outliers into the top gridline, and give
 * no control over where a threshold line goes. Here the threshold IS the
 * subject.
 *
 * THEME. Colours come from the site's CSS custom properties rather than
 * literals, so the chart follows the light/dark toggle without knowing about
 * it. d3 cannot read a CSS variable into a scale, so they are resolved from
 * the computed style once and re-resolved when the theme attribute changes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

export type Point = { x: number | string; y: number; label?: string };

type Kind = "line" | "area" | "bar" | "histogram";

export type ChartProps = {
  kind?: Kind;
  /** Inline data. From MDX use `points` (a JSON string) or `src` instead. */
  data?: Point[];
  /** JSON array as a string attribute. */
  points?: string;
  /** URL of a JSON file holding either an array of points or {data, compare}. */
  src?: string;
  compare?: Point[];
  comparePoints?: string;
  compareName?: string;
  seriesName?: string;
  title?: string;
  caption?: string;
  xLabel?: string;
  yLabel?: string;
  /** Horizontal reference lines, e.g. an extreme-precipitation threshold. */
  thresholds?: { value: number; label: string }[] | string;
  /** Treat x as ISO dates rather than numbers or categories. */
  time?: boolean | string;
  height?: number | string;
  /** Clamp the y axis; by default it fits the data including the tail. */
  yMax?: number | string;
  /** Unit shown on the axis and in the readout. */
  unit?: string;
};

/**
 * MDX HERE PASSES STRINGS, NOT EXPRESSIONS.
 *
 * The blog renders posts through next-mdx-remote, and in this setup a JSX
 * attribute written as an expression is dropped before it reaches the
 * component: `<Chart title="x" height={300} />` arrives as `{title: "x"}` and
 * nothing else. Nobody had noticed, because the only components used in posts
 * so far take string attributes.
 *
 * So every prop is accepted as a string and coerced here, and data arrives
 * either as `points` (a JSON string) or, better, as `src` pointing at a JSON
 * file under /public. The file is the better route anyway: a post stays
 * readable, and the same series can be reused by another post or checked
 * against the script that produced it.
 */
function num(v: number | string | undefined, fallback: number): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function bool(v: boolean | string | undefined): boolean {
  return v === true || v === "" || v === "true" || v === "1";
}

function parseJson<T>(v: T | string | undefined, fallback: T): T {
  if (v === undefined) return fallback;
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

/** Read the site's palette out of CSS so the chart matches the active theme. */
function usePalette() {
  const [palette, setPalette] = useState({
    fg: "#0f172a",
    muted: "#475569",
    accent: "#10b981",
    card: "#ffffff",
    grid: "rgba(120,120,130,0.22)",
  });

  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      const rgb = (name: string, fallback: string) => {
        const v = s.getPropertyValue(name).trim();
        return v ? `rgb(${v})` : fallback;
      };
      setPalette({
        fg: rgb("--foreground", "#0f172a"),
        muted: rgb("--muted", "#475569"),
        accent: rgb("--accent", "#10b981"),
        card: rgb("--card", "#ffffff"),
        grid: "rgba(120,120,130,0.22)",
      });
    };
    read();
    // The toggle swaps a data attribute on <html>; the system setting fires a
    // media query instead. Watch both, or the chart keeps the old palette.
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, []);

  return palette;
}

/** Width of the drawing area, tracked so the chart reflows with the column. */
function useWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Measure synchronously first. ResizeObserver callbacks are delivered on
    // an animation frame, and a hidden or backgrounded tab does not schedule
    // one: the observer simply never fires and the chart stays empty forever.
    // That is not a hypothetical - it is how this was first seen, in a
    // preview pane that was not on screen.
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(w);
    };
    measure();

    // The observer then handles later changes: column resize, sidebar toggle,
    // rotation. A first paint inside a collapsed container measures zero, so
    // keep watching rather than trusting the one reading.
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref]);
  return width;
}

export function Chart(props: ChartProps) {
  const [fetched, setFetched] = useState<{
    data: Point[];
    compare?: Point[];
  } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!props.src) return;
    let live = true;
    fetch(props.src)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (!live) return;
        setFetched(Array.isArray(j) ? { data: j } : j);
      })
      // A chart that silently renders empty is worse than one that says why:
      // an empty axis looks like a quiet day rather than a missing file.
      .catch((e) => live && setFailed(String(e.message ?? e)));
    return () => {
      live = false;
    };
  }, [props.src]);

  const data =
    fetched?.data ?? props.data ?? parseJson<Point[]>(props.points, []);
  const compare =
    fetched?.compare ??
    props.compare ??
    parseJson<Point[]>(props.comparePoints, []);

  if (failed) {
    return (
      <figure className="chart-figure">
        <div className="chart-title">{props.title ?? "Diagram"}</div>
        <p className="chart-caption">Fant ikke dataene: {failed}</p>
      </figure>
    );
  }

  return (
    <ChartInner
      {...props}
      data={data}
      compare={compare}
      thresholds={parseJson<{ value: number; label: string }[]>(
        props.thresholds,
        [],
      )}
      time={bool(props.time)}
      height={num(props.height, 320)}
      yMax={props.yMax === undefined ? undefined : num(props.yMax, 0)}
    />
  );
}

type InnerProps = Omit<ChartProps, "thresholds" | "time" | "height" | "yMax"> & {
  data: Point[];
  compare: Point[];
  thresholds: { value: number; label: string }[];
  time: boolean;
  height: number;
  yMax?: number;
};

function ChartInner({
  kind = "line",
  data = [],
  compare,
  compareName = "Sammenligning",
  seriesName = "Serie",
  title,
  caption,
  xLabel,
  yLabel,
  thresholds = [],
  time = false,
  height = 320,
  yMax,
  unit = "",
}: InnerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const width = useWidth(wrapRef);
  const palette = usePalette();
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    point: Point;
    compare?: Point;
  } | null>(null);

  const parsed = useMemo(() => {
    const toX = (p: Point) =>
      time ? new Date(p.x as string).getTime() : Number(p.x);
    return {
      main: data.map((p) => ({ ...p, _x: toX(p) })),
      cmp: (compare ?? []).map((p) => ({ ...p, _x: toX(p) })),
    };
  }, [data, compare, time]);

  const margin = { top: 16, right: 16, bottom: 40, left: 56 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = Math.max(0, height - margin.top - margin.bottom);

  const scales = useMemo(() => {
    const all = [...parsed.main, ...parsed.cmp];
    if (!all.length || innerW <= 0) return null;
    const xExtent = d3.extent(all, (d) => d._x) as [number, number];
    const yTop =
      yMax ??
      Math.max(
        d3.max(all, (d) => d.y) ?? 1,
        ...thresholds.map((t) => t.value),
      );
    const x =
      kind === "bar" || kind === "histogram"
        ? d3
            .scaleBand<number>()
            .domain(parsed.main.map((d) => d._x))
            .range([0, innerW])
            .padding(kind === "histogram" ? 0.06 : 0.25)
        : time
          ? d3
              .scaleTime()
              .domain([new Date(xExtent[0]), new Date(xExtent[1])])
              .range([0, innerW])
          : d3.scaleLinear().domain(xExtent).range([0, innerW]).nice();
    const y = d3
      .scaleLinear()
      .domain([0, yTop * 1.06])
      .range([innerH, 0])
      .nice();
    return { x, y };
  }, [parsed, innerW, innerH, kind, yMax, thresholds, time]);

  const xPos = useCallback(
    (d: { _x: number }) => {
      if (!scales) return 0;
      if ("bandwidth" in scales.x) {
        const b = scales.x as d3.ScaleBand<number>;
        return (b(d._x) ?? 0) + b.bandwidth() / 2;
      }
      return (scales.x as d3.ScaleLinear<number, number>)(d._x as never);
    },
    [scales],
  );

  useEffect(() => {
    if (!scales || !svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ---- gridlines, behind everything -----------------------------------
    g.append("g")
      .attr("class", "chart-grid")
      .selectAll("line")
      .data(scales.y.ticks(5))
      .join("line")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", (d) => scales.y(d))
      .attr("y2", (d) => scales.y(d))
      .attr("stroke", palette.grid)
      .attr("stroke-width", 1);

    // ---- axes -------------------------------------------------------------
    const xAxis =
      "bandwidth" in scales.x
        ? d3
            .axisBottom(scales.x as d3.ScaleBand<number>)
            .tickFormat((d) => {
              const p = parsed.main.find((m) => m._x === d);
              return p?.label ?? String(d);
            })
            .tickValues(
              (scales.x as d3.ScaleBand<number>)
                .domain()
                .filter((_, i, arr) =>
                  arr.length <= 12 ? true : i % Math.ceil(arr.length / 12) === 0,
                ),
            )
        : d3
            // Let d3 pick the tick interval and its own format. Forcing
            // "%b %Y" on a linear scale printed "Sep 2025" five times in a
            // row, because the ticks were evenly spaced numbers rather than
            // calendar boundaries.
            .axisBottom(scales.x as d3.ScaleTime<number, number>)
            .ticks(Math.max(3, Math.floor(innerW / 130)));

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis as never)
      .call((sel) => sel.select(".domain").attr("stroke", palette.muted))
      .selectAll("text")
      .attr("fill", palette.muted)
      .style("font-size", "11px");

    g.append("g")
      .call(
        d3
          .axisLeft(scales.y)
          .ticks(5)
          .tickFormat((d) => `${d}${unit ? " " + unit : ""}`) as never,
      )
      .call((sel) => sel.select(".domain").attr("stroke", palette.muted))
      .selectAll("text")
      .attr("fill", palette.muted)
      .style("font-size", "11px");

    g.selectAll(".tick line").attr("stroke", palette.muted);

    // ---- the series -------------------------------------------------------
    if (kind === "bar" || kind === "histogram") {
      const b = scales.x as d3.ScaleBand<number>;
      g.selectAll("rect.bar")
        .data(parsed.main)
        .join("rect")
        .attr("class", "bar")
        .attr("x", (d) => b(d._x) ?? 0)
        .attr("width", b.bandwidth())
        .attr("y", (d) => scales.y(d.y))
        .attr("height", (d) => innerH - scales.y(d.y))
        .attr("fill", palette.accent)
        .attr("opacity", 0.85)
        .attr("rx", kind === "histogram" ? 1 : 3);
    } else {
      const lx = scales.x as d3.ScaleLinear<number, number>;
      if (kind === "area") {
        const area = d3
          .area<(typeof parsed.main)[number]>()
          .x((d) => lx(d._x))
          .y0(innerH)
          .y1((d) => scales.y(d.y))
          .curve(d3.curveMonotoneX);
        g.append("path")
          .datum(parsed.main)
          .attr("d", area)
          .attr("fill", palette.accent)
          .attr("opacity", 0.18);
      }
      const line = d3
        .line<(typeof parsed.main)[number]>()
        .x((d) => lx(d._x))
        .y((d) => scales.y(d.y))
        .curve(d3.curveMonotoneX);
      g.append("path")
        .datum(parsed.main)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", palette.accent)
        .attr("stroke-width", 1.9);

      if (parsed.cmp.length) {
        g.append("path")
          .datum(parsed.cmp)
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", palette.muted)
          .attr("stroke-width", 1.6)
          .attr("stroke-dasharray", "5 4");
      }
    }

    // ---- thresholds, drawn last so they are never hidden ------------------
    thresholds.forEach((t) => {
      const yy = scales.y(t.value);
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", yy)
        .attr("y2", yy)
        .attr("stroke", palette.fg)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2 3")
        .attr("opacity", 0.55);
      g.append("text")
        .attr("x", innerW - 4)
        .attr("y", yy - 5)
        .attr("text-anchor", "end")
        .attr("fill", palette.fg)
        .attr("opacity", 0.7)
        .style("font-size", "10.5px")
        .text(t.label);
    });
  }, [
    scales,
    parsed,
    palette,
    innerW,
    innerH,
    kind,
    thresholds,
    time,
    unit,
    margin.left,
    margin.top,
  ]);

  // Hover is handled in React rather than d3 so the readout is real DOM and
  // stays readable to a screen reader and to text selection.
  const onMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!scales || !parsed.main.length) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left - margin.left;
      if (mx < 0 || mx > innerW) return setHover(null);
      let best = parsed.main[0];
      let bestD = Infinity;
      for (const p of parsed.main) {
        const d = Math.abs(xPos(p) - mx);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      const cmp = parsed.cmp.find((c) => c._x === best._x);
      setHover({
        x: xPos(best) + margin.left,
        y: scales.y(best.y) + margin.top,
        point: best,
        compare: cmp,
      });
    },
    [scales, parsed, innerW, xPos, margin.left, margin.top],
  );

  const fmtX = (p: Point) =>
    p.label ??
    (time
      ? new Date(p.x as string).toLocaleDateString("no-NO", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : String(p.x));

  return (
    <figure className="chart-figure" ref={wrapRef}>
      {title ? <div className="chart-title">{title}</div> : null}
      <div className="chart-canvas" style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          width={width || 640}
          height={height}
          role="img"
          aria-label={title ?? "Diagram"}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          style={{ display: "block", overflow: "visible" }}
        />
        {hover ? (
          <>
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: hover.x,
                top: margin.top,
                height: innerH,
                width: 1,
                background: palette.muted,
                opacity: 0.45,
                pointerEvents: "none",
              }}
            />
            <div
              className="chart-tooltip"
              style={{
                position: "absolute",
                left: Math.min(Math.max(hover.x + 10, 0), Math.max(0, width - 190)),
                top: Math.max(0, hover.y - 12),
                pointerEvents: "none",
                background: palette.card,
                color: palette.fg,
                border: `1px solid ${palette.grid}`,
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: 12,
                lineHeight: 1.45,
                boxShadow: "0 6px 20px rgba(0,0,0,0.16)",
                maxWidth: 190,
              }}
            >
              <div style={{ color: palette.muted, marginBottom: 2 }}>
                {fmtX(hover.point)}
              </div>
              <div>
                <strong>{seriesName}:</strong>{" "}
                {hover.point.y.toLocaleString("no-NO", {
                  maximumFractionDigits: 2,
                })}
                {unit ? ` ${unit}` : ""}
              </div>
              {hover.compare ? (
                <div>
                  <strong>{compareName}:</strong>{" "}
                  {hover.compare.y.toLocaleString("no-NO", {
                    maximumFractionDigits: 2,
                  })}
                  {unit ? ` ${unit}` : ""}
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {(xLabel || yLabel) && (
        <div className="chart-axis-labels">
          {yLabel ? <span>{yLabel}</span> : <span />}
          {xLabel ? <span>{xLabel}</span> : <span />}
        </div>
      )}
      {caption ? <figcaption className="chart-caption">{caption}</figcaption> : null}
    </figure>
  );
}

export default Chart;
