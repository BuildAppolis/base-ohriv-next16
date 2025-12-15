"use client"

import React, { Suspense } from "react"
import { UserButton } from "@stackframe/stack"

/**
 * Auth Boundary - Selective Loading Component
 *
 * This demonstrates the optimized approach where only auth-dependent features
 * have Suspense boundaries, not the entire application.
 *
 * This follows Stack Auth's pattern:
 * ✅ No global loading boundary
 * ✅ Selective Suspense around auth features only
 * ✅ Progressive loading for better UX
 * ✅ Optimized performance for production
 */

/**
 * Minimal loading skeleton for auth features
 */
export function AuthSkeleton() {
    return (
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            <div className="w-20 h-4 bg-muted rounded animate-pulse" />
        </div>
    )
}

/**
 * User Profile with selective loading boundary
 * Only this component blocks, not the entire app
 */
export function UserProfile() {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            <UserButton />
        </Suspense>
    )
}

/**
 * Auth-dependent feature with loading boundary
 * Use this for any component that requires authentication state
 */
export function AuthFeature({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<AuthSkeleton />}>
            {children}
        </Suspense>
    )
}

/**
 * Non-blocking auth check - returns null during loading
 * Good for conditional rendering that shouldn't block UI
 */
export function NonBlockingAuth({
    children,
    fallback = null
}: {
    children: React.ReactNode
    fallback?: React.ReactNode
}) {
    return (
        <Suspense fallback={fallback}>
            {children}
        </Suspense>
    )
}