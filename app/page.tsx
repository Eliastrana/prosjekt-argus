// app/page.tsx
import FrontpageHero from "./components/FrontpageHero";
import NewestPost from "./components/NewestPost";
import RelevantPapers from "./components/RelevantPapers";
import BrisShowcase from "./components/BrisShowcase";
import Presentation from "@/app/components/Presentation";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground">
      <FrontpageHero />

      <section className="mx-auto max-w-5xl px-6 py-16">
          <BrisShowcase />

        <NewestPost />

          <main className="h-[calc(100dvh-20rem)] w-full overflow-hidden bg-background text-foreground">
              <Presentation />
          </main>

        <RelevantPapers />

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/*<Link*/}
          {/*  href="/steps"*/}
          {/*  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-95 hover:shadow-lift"*/}
          {/*>*/}
          {/*  Se prosjektstegene*/}
          {/*</Link>*/}
        </div>
      </section>
    </main>
  );
}
