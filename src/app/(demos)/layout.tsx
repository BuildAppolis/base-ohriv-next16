import type { ReactNode } from "react";
import { Suspense } from "react";
import { LogoutButton } from "./_components/logout-button";
import { ThemeToggle } from "./_components/theme-toggle";

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with logout and theme toggle */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-semibold">Demo Center</span>
          </div>
          <div className="flex items-center gap-2">
            <Suspense fallback={<div className="w-9 h-9" />}>
              <ThemeToggle />
            </Suspense>
            <Suspense fallback={<div className="w-20 h-9" />}>
              <LogoutButton />
            </Suspense>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto max-w-screen-2xl py-6">
        {children}
      </main>
    </div>
  );
}

import { Logo } from "@/components/logo";