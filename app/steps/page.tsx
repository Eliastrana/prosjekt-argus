// app/steps/page.tsx
import stepsData from "../../data/steps.json";
import Link from "next/link";

type StepStatus = "todo" | "in_progress" | "done";

type Step = {
  id: string;
  title: string;
  goal: string;
  deliverables: string[];
  status: StepStatus;
  progress: number;
};

export default function StepsPage() {
  const project = stepsData.project;
  const steps = stepsData.steps as Step[];

  const totalProgress =
    steps.reduce((sum, s) => sum + (typeof s.progress === "number" ? s.progress : 0), 0) /
    Math.max(steps.length, 1);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const inProgressCount = steps.filter((s) => s.status === "in_progress").length;

  const getStatusLabel = (status: StepStatus) =>
    status === "done" ? "Fullført" : status === "in_progress" ? "Pågår" : "Ikke startet";

  const getStatusClass = (status: StepStatus) =>
    status === "done"
      ? "bg-accent text-accent-foreground"
      : status === "in_progress"
      ? "bg-tint text-foreground"
      : "bg-card-2 text-muted";

  return (
    <main className="min-h-screen bg-background text-foreground">
      

      <div className="page-shell">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="page-title">
              Prosjektsteg
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-card px-3 py-1 text-xs text-muted shadow-soft">
              Tidsramme: {project.timeframe}
            </span>
            <span className="rounded-full bg-card px-3 py-1 text-xs text-muted shadow-soft">
              Trusler: {project.hazards.join(" • ")}
            </span>
          </div>

          {/* Overall progress */}
          <div className="mt-2 rounded-2xl bg-card p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">Fremdrift</div>
                <div className="mt-1 text-xs text-muted">
                  Fullført: {doneCount} • Pågår: {inProgressCount} • Totalt: {steps.length}
                </div>
              </div>

              <span className="w-fit rounded-full bg-tint px-3 py-1 text-xs font-semibold text-foreground">
                {Math.round(totalProgress)}%
              </span>
            </div>

            <div className="mt-4 h-2 w-full rounded-full bg-card-2">
              <div
                className="h-2 rounded-full bg-accent transition-all"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-4">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className="rounded-2xl bg-card p-6 shadow-soft transition hover:shadow-lift"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                   <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-sm font-semibold text-foreground">
                    {idx + 1}
                  </span>
                <div className="flex items-start gap-3">
            

                  <div>
                    <h2 className="text-lg font-semibold">{s.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      <span className="font-medium text-foreground">Mål:</span>{" "}
                      {s.goal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      s.status
                    )}`}
                  >
                    {getStatusLabel(s.status)}
                  </span>
                </div>
              </div>

            {s.progress > 0 && (
            <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted">
            <span>Fremdrift</span>
            <span className="font-semibold text-foreground">{s.progress}%</span>
            </div>

            <div className="mt-2 h-2 w-full rounded-full bg-card-2">
            <div
                className="h-2 rounded-full bg-accent transition-all"
            style={{ width: `${s.progress}%` }}
                />
                </div>
            </div>
            )}


              <div className="mt-5">
                <div className="text-xs font-semibold text-foreground">Leveranser</div>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {s.deliverables.map((d, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
