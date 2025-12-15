"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"

/**
 * Client Providers - Client Component
 *
 * This component handles all client-side providers like themes, state management,
 * and other browser-dependent functionality. This component is wrapped by the
 * ServerProviders component.
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
            <Toaster richColors closeButton />
        </ThemeProvider>
    )
}