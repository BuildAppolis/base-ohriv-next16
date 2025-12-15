"use client"

import { ThemeProvider } from "next-themes"

/**
 * Client Providers - Optimized Client Component
 *
 * This component handles client-side providers without global loading boundaries.
 * Each feature can implement its own loading states as needed.
 *
 * Optimized approach:
 * ✅ ThemeProvider - No loading needed, instant
 * ✅ Selective Suspense boundaries around auth-dependent features only
 * ✅ No global blocking states
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    )
}