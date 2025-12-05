'use server';

import { openai } from '@/lib/open_ai/client';

export async function generateStreamingResponse(prompt: string) {
  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      success: true,
      text: result.choices[0]?.message?.content || '',
      usage: result.usage,
    };
  } catch (error) {
    console.error('OpenAI generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}