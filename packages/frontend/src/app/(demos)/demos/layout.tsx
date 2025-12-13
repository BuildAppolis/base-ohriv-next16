import type { ReactNode } from "react";
import { DemoNav } from "./_components/demo-nav";

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[500px] flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 pb-6">


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
