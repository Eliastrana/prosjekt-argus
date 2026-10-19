/* Which model is derived from which, drawn as a tree from left to right.
   Edges are config inheritance (bris/train/*.yaml: each arm names the config
   it changes), plus the shorter versions, which are not separate runs at all
   but a checkpoint of the same run stopped at step 2000. Those are dashed.

   Layout is a plain tidy tree: leaves get one row each in the order given,
   a parent sits halfway between its first and last child. With fourteen nodes
   nothing cleverer is needed, and a fixed layout keeps the picture the same
   for everyone. */

export type LineageInfo = {
  name: string;
  result?: string;
  better?: boolean;
  status: string;
};

type Kind = "reference" | "hard" | "low";

type TreeNode = {
  tag: string;
  /* Short enough for a node; the tables below carry the full names. */
  label: string;
  change?: string;
  kind: Kind;
  checkpoint?: boolean;
  children?: TreeNode[];
};

const TREE: TreeNode = {
  tag: "bris-crpsfft", label: "Bris",
  kind: "reference",
  children: [
    {
      tag: "control", label: "Kontrollarm",
      change: "finjustert, 3 000 steg",
      kind: "reference",
      children: [
        { tag: "control2000", label: "Kontrollarm, 2 000", change: "stoppet ved steg 2 000", kind: "reference", checkpoint: true },
        { tag: "control2000s2", label: "F", change: "nytt seed, 2 000 steg", kind: "reference" },
        {
          tag: "tail", label: "Halearm",
          change: "+ haleledd, hard 20 mm",
          kind: "hard",
          children: [
            { tag: "tail2000", label: "Halearm, 2 000", change: "stoppet ved steg 2 000", kind: "hard", checkpoint: true },
            {
              tag: "tailA2000", label: "A",
              change: "vekt 1/10",
              kind: "hard",
              children: [
                { tag: "tail30th2000", label: "Dose 1/30", change: "vekt 1/30", kind: "hard" },
                { tag: "tail3rd2000", label: "Dose 1/3", change: "vekt 1/3", kind: "hard" },
              ],
            },
            { tag: "tailB2000", label: "B", change: "terskel 5 mm", kind: "low" },
            { tag: "tailD2000", label: "D", change: "myk terskel 5 mm", kind: "low" },
            {
              tag: "tailC2000", label: "Pavo",
              change: "ingen terskel",
              kind: "low",
              children: [
                { tag: "tailE2000", label: "E", change: "1/3 av Pavos vekt", kind: "low" },
                { tag: "tailC2000s2", label: "Pavo, ny trekning", change: "nytt seed", kind: "low" },
                { tag: "tailC3000", label: "Pavo, 3 000 steg", change: "3 000 steg", kind: "low" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const NODE_W = 168;
const NODE_H = 64;
const COL = 204;
const ROW = 78;
const PAD = 8;

type Placed = { node: TreeNode; x: number; y: number; parent?: Placed };

function layout(root: TreeNode): Placed[] {
  const out: Placed[] = [];
  let row = 0;
  const visit = (node: TreeNode, depth: number, parent?: Placed): Placed => {
    const placed: Placed = { node, x: PAD + depth * COL, y: 0, parent };
    out.push(placed);
    const kids = (node.children ?? []).map((c) => visit(c, depth + 1, placed));
    placed.y = kids.length
      ? (kids[0].y + kids[kids.length - 1].y) / 2
      : PAD + row++ * ROW;
    return placed;
  };
  visit(root, 0);
  return out;
}

const KIND_DOT: Record<Kind, string> = {
  reference: "bg-muted",
  hard: "bg-[#f59e0b]",
  low: "bg-accent",
};

export default function ModelLineage({ info }: { info: Record<string, LineageInfo> }) {
  const placed = layout(TREE);
  const width = Math.max(...placed.map((p) => p.x)) + NODE_W + PAD;
  const height = Math.max(...placed.map((p) => p.y)) + NODE_H + PAD;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border border-foreground/8 bg-card">
        <div className="relative mx-auto" style={{ width, height }}>
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
            aria-hidden="true"
          >
            {placed
              .filter((p) => p.parent)
              .map((p) => {
                const parent = p.parent as Placed;
                const x1 = parent.x + NODE_W;
                const y1 = parent.y + NODE_H / 2;
                const x2 = p.x;
                const y2 = p.y + NODE_H / 2;
                const mid = x1 + (x2 - x1) / 2;
                return (
                  <path
                    key={p.node.tag}
                    d={`M${x1},${y1} H${mid} V${y2} H${x2}`}
                    fill="none"
                    stroke="rgb(var(--muted))"
                    strokeOpacity={0.5}
                    strokeWidth={1.3}
                    strokeDasharray={p.node.checkpoint ? "4 4" : undefined}
                  />
                );
              })}
          </svg>
          {placed.map((p) => {
            const m = info[p.node.tag];
            const pending = m?.status === "trener" || m?.status === "i kø";
            const highlight = p.node.tag === "tailC2000";
            return (
              <div
                key={p.node.tag}
                className={[
                  "absolute flex flex-col justify-center gap-0.5 rounded-xl px-3 text-xs",
                  "bg-background",
                  pending ? "border border-dashed border-foreground/25" : "border border-foreground/12",
                  highlight ? "ring-1 ring-accent" : "",
                ].join(" ")}
                style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`size-2 shrink-0 rounded-full ${KIND_DOT[p.node.kind]}`} />
                  <span className="truncate text-[13px] font-medium text-foreground">
                    {p.node.label}
                  </span>
                </div>
                {p.node.change ? (
                  <div className="truncate text-muted">{p.node.change}</div>
                ) : (
                  <div className="truncate text-muted">publisert av MET</div>
                )}
                <div className="truncate">
                  {pending ? (
                    <span className="text-muted">{m?.status}</span>
                  ) : m?.result && m.result !== "referanse" ? (
                    <span className={m.better ? "font-semibold text-accent" : "text-muted"}>
                      {m.result}
                    </span>
                  ) : (
                    <span className="text-muted">{m?.result ?? ""}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted" /> referanse
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#f59e0b]" /> hard terskel på 20 mm
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent" /> lav eller ingen terskel
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-5 border-t border-solid border-muted" /> ny trening
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-5 border-t border-dashed border-muted" /> samme kjøring,
          stoppet tidligere
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-4 rounded border border-dashed border-foreground/40" />
          ikke ferdig
        </span>
      </div>
    </div>
  );
}
