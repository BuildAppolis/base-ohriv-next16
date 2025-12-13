/**
 * AI Instructions Loader
 * Client-side utility for loading AI generation instructions
 */

// Cache for loaded instructions
let instructionCache: Record<string, string> = {};

/**
 * Load instructions from a text file via HTTP request (client-side)
 */
export async function loadInstructions(
  instructionType: 'ksa-framework' | string = 'ksa-framework'
): Promise<string> {
  // Check cache first
  if (instructionCache[instructionType]) {
    return instructionCache[instructionType];
  }

  try {
    // Fetch the instruction file from the public directory or API
    const response = await fetch('/api/instructions/ksa-framework');

    if (!response.ok) {
      throw new Error(`Failed to fetch instructions: ${response.status}`);
    }

    const instructions = await response.text();

    // Cache the result
    instructionCache[instructionType] = instructions;

    return instructions;
  } catch (error) {
    console.error('Failed to load AI instructions:', error);

    // Return fallback instructions
    return generateFallbackInstructions();
  }
}

/**
 * Generate fallback instructions if file loading fails
 */
function generateFallbackInstructions(): string {
  return `You are an expert interview question generator using the Knowledge, Skills, and Abilities (KSA) framework.

Generate interview questions based on company data following this structure:

1. KSA Framework Definition
2. Job Fit Questions (Knowledge, Skills, Abilities)
3. Core Values Company Fit Questions

All questions must be behavioral and open-ended with 3 follow-up probes and red flag indicators.`;
}

/**
 * Get KSA framework instructions specifically
 */
export async function getKSAFrameworkInstructions(): Promise<string> {
  const instructions = await loadInstructions('ksa-framework');
  return instructions;
}

/**
 * Clear instruction cache (useful for development/testing)
 */
export function clearInstructionCache(): void {
  instructionCache = {};
}

/**
 * Load instructions from text content directly (useful for server-side)
 */
export function loadInstructionsFromContent(content: string): string {
  return content;
}