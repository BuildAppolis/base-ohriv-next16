'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createDemoSession, removeDemoSession, getDemoSession } from '@/lib/session'
import { logger } from '@/lib/logger'

export async function loginDemo(password: string, redirectTo?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the demo password from environment variables
    const demoPassword = process.env.DEMO_PASSWORD

    // Check if demo password is configured
    if (!demoPassword) {
      logger.setup.error('DEMO_PASSWORD environment variable is not configured')
      return { success: false, error: 'Demo access is not properly configured' }
    }

    // Validate the password
    if (password !== demoPassword) {
      logger.auth.warn('Invalid demo password attempt')
      return { success: false, error: 'Invalid password' }
    }

    // Create demo session
    await createDemoSession()
    logger.auth.info('Demo session created successfully')

    // Revalidate the path to ensure fresh data
    if (redirectTo) {
      revalidatePath(redirectTo)
    }

    return { success: true }
  } catch (error) {
    logger.auth.error('Error during demo login', { error: error instanceof Error ? error.message : 'Unknown error' })
    return { success: false, error: 'An error occurred during login' }
  }
}

export async function logoutDemo(): Promise<{ success: boolean; error?: string }> {
  try {
    await removeDemoSession()
    logger.auth.info('Demo session removed successfully')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    logger.auth.error('Error during demo logout', { error: error instanceof Error ? error.message : 'Unknown error' })
    return { success: false, error: 'An error occurred during logout' }
  }
}

export async function verifyDemoAccess(): Promise<boolean> {
  try {
    const session = await getDemoSession()
    return session?.demoAccess === true
  } catch (error) {
    logger.auth.error('Error verifying demo access', { error: error instanceof Error ? error.message : 'Unknown error' })
    return false
  }
}

export async function checkDemoPassword(): Promise<boolean> {
  // Check if demo password is configured
  const demoPassword = process.env.DEMO_PASSWORD
  return !!demoPassword
}