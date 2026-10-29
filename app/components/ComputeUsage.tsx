// app/components/ComputeUsage.tsx

// Allocated usage on eX3, from the cluster's accounting. Allocated, not used:
// a job holding 128 cores for seven hours counts 896 core-hours whether it
// computed anything or not, and failed and cancelled jobs count too.
//
// From sacct -X -D: CPUTimeRAW summed for CPU-hours, elapsed time times the
// GPUs in AllocTRES for GPU-hours. -D keeps the runs Slurm requeued after g003
// crashed on 3 and 4 October, since those hours were allocated and spent.
// Running jobs count up to the moment of the snapshot. GPU-hours are split by
// node: g003 holds the H200s, g002 the A100s; the few hours on other GPU
// nodes are counted with the A100s.
const USAGE = {
  asOf: "29. oktober 2026",
  jobs: 560,
  cpuHours: 38761.0,
  h200Hours: 490.9,
  a100Hours: 378.4,
};

// List prices for the same resources bought on demand. Chosen to match the
// hardware: eX3's CPU nodes are AMD EPYC, the GPUs H200 and A100. Medians
// from getdeploying.com on 29 October 2026; the hyperscaler prices are
// Oracle's, which sit between AWS and Azure for both.
const PRICES = {
  cpuPerHour: 0.0513, // USD per vCPU-hour, AWS c7a (AMD EPYC), on demand
  h200PerHour: 4.54, // USD per GPU-hour, median on-demand NVIDIA H200
  a100PerHour: 1.99, // USD per GPU-hour, median on-demand NVIDIA A100
  h200HyperscalerPerHour: 10.0, // USD per GPU-hour, Oracle H200
  a100HyperscalerPerHour: 3.05, // USD per GPU-hour, Oracle A100
};

// The prices are quoted in dollars, so they are converted once, at a stated
// rate, rather than restated as kroner that would hide where they came from.
const USD_NOK = { rate: 9.274, asOf: "29. oktober 2026" };

const nb = (value: number, digits = 0) =>
  value.toLocaleString("nb-NO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const nok = (usdValue: number) => `${nb(Math.round(usdValue * USD_NOK.rate))} kr`;

export default function ComputeUsage() {
  const cpuCost = USAGE.cpuHours * PRICES.cpuPerHour;
  const gpuHours = USAGE.h200Hours + USAGE.a100Hours;
  const gpuCost = USAGE.h200Hours * PRICES.h200PerHour + USAGE.a100Hours * PRICES.a100PerHour;
  const total = cpuCost + gpuCost;
  const hyperscalerTotal =
    cpuCost +
    USAGE.h200Hours * PRICES.h200HyperscalerPerHour +
    USAGE.a100Hours * PRICES.a100HyperscalerPerHour;

  const tiles = [
    {
      label: "CPU-timer",
      value: nb(USAGE.cpuHours),
      detail: `${USAGE.jobs} jobber på eX3`,
      cost: nok(cpuCost),
      costNote: `${nb(PRICES.cpuPerHour * USD_NOK.rate, 2)} kr per vCPU-time`,
    },
    {
      label: "GPU-timer",
      value: nb(gpuHours, 1),
      detail: `${nb(USAGE.h200Hours)} på NVIDIA H200, ${nb(USAGE.a100Hours)} på A100`,
      cost: nok(gpuCost),
      costNote: `${nb(PRICES.h200PerHour * USD_NOK.rate, 2)} kr per H200-time, ${nb(PRICES.a100PerHour * USD_NOK.rate, 2)} kr per A100-time`,
    },
    {
      label: "Til markedspris",
      value: nok(total),
      detail: "CPU og GPU samlet",
      cost: `ca. ${nok(hyperscalerTotal)}`,
      costNote: "hos AWS, Azure eller Oracle",
    },
  ];

  return (
    <section>
      <div>
        <h2 className="text-lg font-semibold">Regnekraft brukt</h2>
        <p className="mt-1 text-sm text-muted">
          Tildelt tid på eX3 ved Simula, per {USAGE.asOf}, og hva det ville
          kostet å leie de samme ressursene.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-[10px] bg-foreground/[0.04] p-5"
          >
            <p className="text-sm font-medium text-muted">
              {tile.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {tile.value}
            </p>
            <p className="mt-1 text-sm text-muted">{tile.detail}</p>
            <div className="mt-5 border-t border-foreground/10 pt-4">
              <p className="text-base font-semibold tabular-nums">{tile.cost}</p>
              <p className="text-xs text-muted">{tile.costNote}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Tildelt tid teller også jobber som feilet eller ble avbrutt, og
        CPU-timene inkluderer kjernene som fulgte GPU-jobbene. Prisene er
        on-demand-priser for tilsvarende ressurser, ikke hva prosjektet
        betaler, oppgitt i dollar og omregnet med {nb(USD_NOK.rate, 2)} kr per
        dollar ({USD_NOK.asOf}). Kilder:{" "}
        <a
          href="https://getdeploying.com/gpus/nvidia-h200"
          className="underline decoration-foreground/20 underline-offset-2 hover:text-foreground"
        >
          H200-priser
        </a>
        ,{" "}
        <a
          href="https://getdeploying.com/gpus/nvidia-a100"
          className="underline decoration-foreground/20 underline-offset-2 hover:text-foreground"
        >
          A100-priser
        </a>
        ,{" "}
        <a
          href="https://instances.vantage.sh/aws/ec2/c7a.2xlarge"
          className="underline decoration-foreground/20 underline-offset-2 hover:text-foreground"
        >
          AWS c7a
        </a>
        ,{" "}
        <a
          href="https://wise.com/us/currency-converter/usd-to-nok-rate/history"
          className="underline decoration-foreground/20 underline-offset-2 hover:text-foreground"
        >
          valutakurs
        </a>
        .
      </p>
    </section>
  );
}
