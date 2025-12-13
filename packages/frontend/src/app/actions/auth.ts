'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createDemoSession, removeDemoSession, getDemoSession } from '@/lib/session'
import { logger } from '@/lib/logger'

// Redis-based bot protection utilities
import { Redis } from '@upstash/redis'

let redis: Redis | null = null;

// Initialize Redis connection
const getRedis = () => {
  if (!redis) {
    // Check if Redis environment variables are properly configured
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken || redisUrl.trim() === '' || redisToken.trim() === '') {
      console.log('Redis environment variables not configured, proceeding without Redis');
      return null;
    }

    try {
      redis = new Redis({
        url: redisUrl,
        token: redisToken,
      })
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      return null;
    }
  }
  return redis;
};

const isBotPattern = (input: string): boolean => {
  // Check for common bot patterns
  const botPatterns = [
    /^(admin|password|test|demo|guest|user|root)/i,           // Common dictionary words
    /^(123|456|789|000|111|222|333|444|555|666|777|888|999)/, // Common number patterns
    /^(.)\1{2,}$/,                                         // Repeated characters (aaa, bbb, etc.)
    /^[a-z]{1,4}$/,                                      // Very short common words
    /^([a-zA-Z])\1{3,}$/,                                // Repeated letters
    /^(.)(.)\2\1/,                                        // Palindromes of 4 chars
    /(.)\1{3,}/,                                          // Any character repeated 4+ times
    /^[0-9]+$/,                                          // All numbers
    /^abc|123|password|qwerty|letmein|admin/i,            // Common password patterns
  ];

  return botPatterns.some(pattern => pattern.test(input));
};

const getClientIdentifier = (request: Request): string => {
  // Use multiple factors to identify client
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent') || '';

  // Create a hash-like identifier from IP and user agent
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
  const uaHash = userAgent.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `${ip}-${uaHash}`;
};

const getRedisKey = (type: string, identifier: string): string => {
  return `auth:${type}:${identifier}`;
};

const isRateLimited = async (identifier: string): Promise<{ isLimited: boolean; remainingTime?: number }> => {
  const redis = getRedis();
  if (!redis) {
    // Fallback to no rate limiting if Redis is not available
    return { isLimited: false };
  }

  const now = Date.now();
  const key = getRedisKey('rate-limit', identifier);

  try {
    const pipeline = redis.pipeline();
    pipeline.hgetall(key);
    pipeline.expire(key, 24 * 60 * 60); // Auto-expire after 24 hours

    const results = await pipeline.exec();
    const firstResult = results?.[0];
    const data = firstResult && Array.isArray(firstResult) ? firstResult[1] as Record<string, any> : null;

    if (!data || Object.keys(data).length === 0) {
      // First time seeing this client
      await redis.hset(key, {
        attempts: 1,
        lastAttempt: now,
        lockUntil: 0
      });
      return { isLimited: false };
    }

    const { attempts = 0, lastAttempt = 0, lockUntil = 0 } = data;
    const numericAttempts = parseInt(attempts);
    const numericLastAttempt = parseInt(lastAttempt);
    const numericLockUntil = parseInt(lockUntil);

    // If locked out, check if lock period has expired
    if (numericLockUntil > 0 && now < numericLockUntil) {
      return { isLimited: true, remainingTime: Math.ceil((numericLockUntil - now) / 1000) };
    }

    // Reset attempts if more than 5 minutes have passed
    if (now - numericLastAttempt > 5 * 60 * 1000) {
      await redis.hset(key, {
        attempts: 1,
        lastAttempt: now,
        lockUntil: 0
      });
      return { isLimited: false };
    }

    // Check if rate limit exceeded (5 attempts per 5 minutes)
    if (numericAttempts >= 5) {
      const newLockUntil = now + (5 * 60 * 1000); // Lock for 5 minutes
      await redis.hset(key, {
        attempts: numericAttempts + 1,
        lastAttempt: now,
        lockUntil: newLockUntil
      });
      return { isLimited: true, remainingTime: 300 };
    }

    // Increment attempts
    await redis.hset(key, {
      attempts: numericAttempts + 1,
      lastAttempt: now,
      lockUntil: numericLockUntil
    });

    return { isLimited: false };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { isLimited: false }; // Fail open
  }
};

const recordSuspiciousActivity = async (identifier: string, reason: string, metadata?: any): Promise<void> => {
  const redis = getRedis();
  if (!redis) return;

  try {
    const key = getRedisKey('suspicious', identifier);
    const now = Date.now();
    const activityData = JSON.stringify({
      timestamp: now,
      reason,
      metadata,
      ip: identifier.split('-')[0]
    });

    await redis.zadd(key, { score: now, member: activityData });

    // Keep only last 100 suspicious activities per client
    await redis.zremrangebyscore(key, 0, -100);
    await redis.expire(key, 24 * 60 * 60); // Expire after 24 hours
  } catch (error) {
    console.error('Failed to record suspicious activity:', error);
  }
};

const getGlobalRateLimit = async (action: string): Promise<boolean> => {
  const redis = getRedis();
  if (!redis) return true;

  const key = `auth:global:${action}`;
  const now = Date.now();
  const windowSize = 60 * 1000; // 1 minute window
  const maxRequests = 1000; // Max 1000 requests per minute globally

  try {
    // Clean old entries
    await redis.zremrangebyscore(key, 0, now - windowSize);

    // Count current requests in window
    const count = await redis.zcard(key);

    if (count >= maxRequests) {
      return false; // Rate limited
    }

    // Add current request (using member score)
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    await redis.expire(key, 60); // Auto-expire after 1 minute
    return true;
  } catch (error) {
    console.error('Global rate limiting error:', error);
    return true; // Fail open
  }
};

export async function loginDemo(password: string, redirectTo?: string, request?: Request): Promise<{ success: boolean; error?: string }> {
  try {
    // Global rate limiting check
    const globalAllowed = await getGlobalRateLimit('login-attempt');
    if (!globalAllowed) {
      return { success: false, error: 'Too many login attempts system-wide. Please try again later.' };
    }

    // Get the demo password from environment variables
    const demoPassword = process.env.DEMO_PASSWORD

    // Check if demo password is configured
    if (!demoPassword) {
      logger.setup.error('DEMO_PASSWORD environment variable is not configured')
      return { success: false, error: 'Demo access is not properly configured' }
    }

    // Basic input validation
    if (!password || password.trim().length < 1) {
      return { success: false, error: 'Password is required' }
    }

    // Enhanced bot pattern detection
    if (isBotPattern(password)) {
      logger.auth.warn('Bot-like password pattern detected', {
        passwordPreview: password.substring(0, 3) + '***'
      });
      return { success: false, error: 'Invalid password' }
    }

    // Length-based bot detection (too short or too long for real passwords)
    if (password.length < 3 || password.length > 50) {
      logger.auth.warn('Unusual password length detected', {
        passwordLength: password.length
      });
      return { success: false, error: 'Invalid password' }
    }

    // Check for common password lists (basic check)
    const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      logger.auth.warn('Common password attempted', {
        passwordPreview: password.substring(0, 3) + '***'
      });
      return { success: false, error: 'Invalid password' }
    }

    // Timing attack protection - slow down validation slightly
    const startTime = Date.now();

    // Validate the password
    const isValid = password === demoPassword;

    // Add artificial delay to prevent timing attacks
    const processingTime = Date.now() - startTime;
    if (processingTime < 100) {
      await new Promise(resolve => setTimeout(resolve, 100 - processingTime));
    }

    if (!isValid) {
      logger.auth.warn('Invalid demo password attempt', {
        passwordLength: password.length,
        hasCommonPattern: isBotPattern(password)
      });
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
    logger.auth.error('Error during demo login', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
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