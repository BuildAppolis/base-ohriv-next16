/**
 * Provider Architecture
 *
 * This directory contains a server/client provider architecture that allows
 * for proper separation of server-only and client-side dependencies.
 *
 * ServerProviders: Handles server-only providers (like auth)
 * ClientProviders: Handles client-side providers (like themes, state)
 */

export { ServerProviders } from './server'
export { ClientProviders } from './client'