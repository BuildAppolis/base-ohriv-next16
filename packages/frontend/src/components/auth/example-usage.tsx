import { UserProfile, AuthFeature, NonBlockingAuth } from "./auth-boundary"

/**
 * Example: Optimized Auth Implementation
 *
 * This demonstrates the production-ready approach to authentication loading
 * that doesn't block the entire application.
 */
export function ExampleHeader() {
    return (
        <header className="flex justify-between items-center p-4 border-b">
            {/* Public content - loads instantly */}
            <h1 className="text-2xl font-bold">My App</h1>

            {/* Only the user profile has a loading boundary */}
            <UserProfile />
        </header>
    )
}

/**
 * Auth-only content with selective loading
 */
export function ExampleProtectedContent() {
    return (
        <AuthFeature>
            <div className="p-6 bg-muted rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Protected Content</h2>
                <p>This content only loads when auth state is ready.</p>
            </div>
        </AuthFeature>
    )
}

/**
 * Mixed content - public + auth features
 */
export function ExampleMixedContent() {
    return (
        <div className="space-y-6">
            {/* Public content - no loading boundary */}
            <section>
                <h2 className="text-xl font-semibold">Public Section</h2>
                <p>This content loads immediately, regardless of auth state.</p>
            </section>

            {/* Auth-dependent content with selective loading */}
            <ExampleProtectedContent />

            {/* Non-blocking auth that doesn't affect layout */}
            <NonBlockingAuth fallback={<div className="h-4 bg-muted rounded w-32" />}>
                <p className="text-sm text-muted-foreground">
                    You are authenticated and can see this message immediately.
                </p>
            </NonBlockingAuth>
        </div>
    )
}

/**
 * Complete example page showing optimized loading strategy
 */
export function ExampleOptimizedPage() {
    return (
        <div className="min-h-screen">
            <ExampleHeader />

            <main className="container mx-auto py-8">
                <ExampleMixedContent />
            </main>
        </div>
    )
}