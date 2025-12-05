/**
 * Hook for consuming Server-Sent Events (SSE) streams
 * Provides real-time updates for AI generation
 */

import { useCallback, useRef, useState } from 'react';

export interface SSEStreamOptions<T> {
  url: string;
  body: any;
  onProgress?: (data: T) => void;
  onComplete?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useSSEStream<T>() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (options: SSEStreamOptions<T>) => {
    const { url, body, onProgress, onComplete, onError } = options;

    setIsStreaming(true);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'error') {
                const err = new Error(parsed.message || 'Stream error');
                setError(err);
                onError?.(err);
                break;
              }

              if (parsed.type === 'progress' && onProgress) {
                onProgress(parsed as T);
              } else if (parsed.type === 'complete' && onComplete) {
                onComplete(parsed);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

      setIsStreaming(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Stream failed');
      if (error.name !== 'AbortError') {
        setError(error);
        setIsStreaming(false);
        onError?.(error);
      }
    }
  }, []);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return {
    isStreaming,
    error,
    startStream,
    stopStream,
  };
}
