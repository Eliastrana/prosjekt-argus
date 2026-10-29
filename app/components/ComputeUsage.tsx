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

  const stats = [
    { value: nb(USAGE.cpuHours), label: "CPU-timer" },
    { value: nb(Math.round(gpuHours)), label: "GPU-timer" },
    { value: nok(total), label: "til markedspris" },
  ];

  const link = "underline decoration-foreground/20 underline-offset-2 hover:text-foreground";

  return (
    <section>
      <h2 className="text-lg font-semibold">Regnekraft brukt</h2>
      <p className="mt-1 text-sm text-muted">eX3 ved Simula, per {USAGE.asOf}.</p>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[10px] bg-foreground/[0.04] px-3 py-5 sm:px-5 sm:py-8">
            <p className="whitespace-nowrap text-lg font-semibold tracking-tight tabular-nums sm:text-3xl">{s.value}</p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <details className="group mt-3 text-xs leading-relaxed text-muted">
        <summary className="cursor-pointer list-none transition hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-foreground/20 underline-offset-2">Slik er det regnet</span>
        </summary>
        <div className="mt-2 flex max-w-3xl flex-col gap-2">
          <p>
            Tildelt tid i {USAGE.jobs} jobber, også de som feilet eller ble avbrutt, og CPU-timene
            inkluderer kjernene som fulgte GPU-jobbene. {nb(USAGE.h200Hours)} GPU-timer var på NVIDIA
            H200 og {nb(USAGE.a100Hours)} på A100.
          </p>
          <p>
            Markedsprisen er on-demand-priser for tilsvarende ressurser, ikke hva prosjektet betaler:{" "}
            {nb(PRICES.cpuPerHour * USD_NOK.rate, 2)} kr per vCPU-time ({nok(cpuCost)}),{" "}
            {nb(PRICES.h200PerHour * USD_NOK.rate, 2)} kr per H200-time og{" "}
            {nb(PRICES.a100PerHour * USD_NOK.rate, 2)} kr per A100-time ({nok(gpuCost)}). Hos AWS,
            Azure eller Oracle ville det kostet rundt {nok(hyperscalerTotal)}. Prisene er i dollar,
            omregnet med {nb(USD_NOK.rate, 2)} kr per dollar ({USD_NOK.asOf}).
          </p>
          <p>
            Kilder:{" "}
            <a href="https://getdeploying.com/gpus/nvidia-h200" className={link}>H200-priser</a>,{" "}
            <a href="https://getdeploying.com/gpus/nvidia-a100" className={link}>A100-priser</a>,{" "}
            <a href="https://instances.vantage.sh/aws/ec2/c7a.2xlarge" className={link}>AWS c7a</a>,{" "}
            <a href="https://wise.com/us/currency-converter/usd-to-nok-rate/history" className={link}>valutakurs</a>.
          </p>
        </div>
      </details>
    </section>
  );
}
