import { StackProvider } from "@stackframe/stack"
import { stackServerApp } from "@/lib/stack/server"
import { ClientProviders } from "./client"

/**
 * Server Providers - Server Component
 *
 * This component handles server-only providers (like Stack Auth) and loads
 * the client providers. Server components can access server-side resources
 * and pass data down to client components.
 */
export function ServerProviders({ children }: { children: React.ReactNode }) {
    return (
        <StackProvider app={stackServerApp} lang="en-US">
            <ClientProviders>
                {children}
            </ClientProviders>
        </StackProvider>
    )
}