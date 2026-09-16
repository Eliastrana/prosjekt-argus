// app/components/ComputeUsage.tsx

// Allocated usage on eX3, from the cluster's accounting. Allocated, not used:
// a job holding 128 cores for seven hours counts 896 core-hours whether it
// computed anything or not, and failed and cancelled jobs count too.
const USAGE = {
  asOf: "16. september 2026",
  jobs: 257,
  cpuHours: 11709.04,
  gpuHours: 43.76,
};

// List prices for the same resources bought on demand. Chosen to match the
// hardware: eX3's CPU nodes are AMD EPYC and most GPU hours ran on an H200.
const PRICES = {
  cpuPerHour: 0.0513, // USD per vCPU-hour, AWS c7a (AMD EPYC), on demand
  gpuPerHour: 4.29, // USD per GPU-hour, median on-demand NVIDIA H200
  gpuHyperscalerPerHour: 10.0, // USD per GPU-hour, AWS/Azure/Oracle H200
};

const nb = (value: number, digits = 0) =>
  value.toLocaleString("nb-NO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const usd = (value: number) => `$${nb(Math.round(value))}`;

export default function ComputeUsage() {
  const cpuCost = USAGE.cpuHours * PRICES.cpuPerHour;
  const gpuCost = USAGE.gpuHours * PRICES.gpuPerHour;
  const total = cpuCost + gpuCost;
  const hyperscalerTotal = cpuCost + USAGE.gpuHours * PRICES.gpuHyperscalerPerHour;

  const tiles = [
    {
      label: "CPU-timer",
      value: nb(USAGE.cpuHours),
      detail: `${USAGE.jobs} jobber på eX3`,
      cost: usd(cpuCost),
      costNote: `$${nb(PRICES.cpuPerHour, 4)} per vCPU-time`,
    },
    {
      label: "GPU-timer",
      value: nb(USAGE.gpuHours, 1),
      detail: "for det meste NVIDIA H200",
      cost: usd(gpuCost),
      costNote: `$${nb(PRICES.gpuPerHour, 2)} per GPU-time`,
    },
    {
      label: "Til markedspris",
      value: usd(total),
      detail: "CPU og GPU samlet",
      cost: `ca. ${usd(hyperscalerTotal)}`,
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
            className="rounded-[1.75rem] border border-foreground/10 bg-card p-6"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
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
        on-demand-priser i USD for tilsvarende ressurser, ikke hva prosjektet
        betaler. Kilder:{" "}
        <a
          href="https://getdeploying.com/gpus/nvidia-h200"
          className="underline decoration-foreground/20 underline-offset-2 hover:text-foreground"
        >
          H200-priser
        </a>
        ,{" "}
        <a
          href="https://instances.vantage.sh/aws/ec2/c7a.2xlarge"
          className="underline decoration-foreground/20 underline-offset-2 hover:text-foreground"
        >
          AWS c7a
        </a>
        .
      </p>
    </section>
  );
}
