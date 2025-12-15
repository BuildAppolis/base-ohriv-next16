/**
 * Auth Loading Fallback - Minimal UI for auth state loading
 *
 * This is a lightweight fallback that only shows when auth is loading.
 * It won't block the rest of your app from rendering.
 */
export function AuthLoadingFallback() {
    return (
        <div className="sr-only" aria-live="polite" aria-busy="true">
            Loading authentication...
        </div>
    )
}

/**
 * Auth Boundary - Suspense wrapper only for auth-related components
 *
 * This creates a minimal boundary that only affects auth-dependent features,
 * allowing the rest of your app to render immediately.
 */
export function AuthBoundary({ children }: { children: React.ReactNode }) {
    return (
        <div suppressHydrationWarning>
            {children}
        </div>
    )
}