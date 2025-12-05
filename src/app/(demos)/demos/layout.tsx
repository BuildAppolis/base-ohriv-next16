import type { ReactNode } from "react";
import { DemoNav } from "./_components/demo-nav";

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[500px] flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6">
        <header className="shrink-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Demo Hub</h1>
            <p className="text-muted-foreground text-sm">
              Quickly switch between the available demo pages.
            </p>
          </div>
        </header>

        <section className="grid flex-1 gap-4 md:grid-cols-[240px_1fr]">
          <aside className="min-h-0 overflow-hidden rounded-lg border bg-card/60 p-4 shadow-sm">
            <div className="h-full overflow-auto">
              <DemoNav />
            </div>
          </aside>
          <main className="min-h-0 overflow-hidden rounded-lg border bg-card/60 p-4 shadow-sm">
            <div className="h-full overflow-auto">{children}</div>
          </main>
        </section>
      </div>
    </div>
  );
}
