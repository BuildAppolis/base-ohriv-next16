import { StackProvider } from "@stackframe/stack"
import { stackServerApp } from "@/lib/stack/server"
import { ClientProviders } from "./client"

/**
 * Server Providers - Optimized Server Component
 *
 * Following Stack Auth official pattern: StackProvider does NOT need Suspense by default.
 * The loading boundary is only needed for specific async operations, not the entire app.
 *
 * This approach provides:
 * ✅ Immediate rendering of non-auth content
 * ✅ Progressive loading of auth-dependent features
 * ✅ No global blocking states
 * ✅ Optimized performance for production
 */
export function ServerProviders({ children }: { children: React.ReactNode }) {
    return (
        // No Suspense boundary here - StackProvider handles its own state internally
        <StackProvider app={stackServerApp} lang="en-US">
            <ClientProviders>
                {children}
            </ClientProviders>
        </StackProvider>
    )
}