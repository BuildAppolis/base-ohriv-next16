/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * SSE Stream Hook
 * Custom hook for handling Server-Sent Events with streaming responses
 */

import { useState, useCallback, useRef, useEffect } from "react";

export interface StreamEvent {
  type: string;
  [key: string]: any;
}

export interface StreamState {
  isStreaming: boolean;
  content: string | null;
  progress?: number;
  error?: string;
  complete: boolean;
}

export function useSSEStream() {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    content: null,
    error: undefined,
    complete: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // Ignore abort errors during cleanup
        console.log("Stream cleanup aborted");
      } finally {
        abortControllerRef.current = null;
      }
    }

    setState({
      isStreaming: false,
      content: null,
      error: undefined,
      complete: false,
    });
  }, []);

  const startStream = useCallback(
    async (
      url: string,
      options?: {
        method?: "POST";
        headers?: Record<string, string>;
        body?: any;
      }
    ) => {
      // Cancel any existing stream
      stopStream();

      // Reset state
      setState({
        isStreaming: true,
        content: null,
        error: undefined,
        complete: false,
      });

      console.log("🚀 Starting stream to:", url);
      console.log("📋 Request options:", {
        method: options?.method || "POST",
        hasBody: !!options?.body,
        bodyType: typeof options?.body,
        bodyKeys: options?.body ? Object.keys(options.body) : [],
      });

      try {
        // Create abort controller for this stream
        abortControllerRef.current = new AbortController();

        // Prepare fetch options
        const fetchOptions: RequestInit = {
          method: options?.method || "POST",
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: abortControllerRef.current.signal,
        };

        console.log("📡 Making fetch request...");

        // Start streaming
        const response = await fetch(url, fetchOptions);

        console.log("📥 Response received:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          hasBody: !!response.body,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ HTTP Error Response:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(
            `HTTP error! status: ${response.status} - ${errorText}`
          );
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            // Process SSE events
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6); // Remove 'data: ' prefix

                if (data === "[DONE]") {
                  console.log("✅ Stream completed");
                  setState((prev) => ({
                    ...prev,
                    isStreaming: false,
                    complete: true,
                  }));
                  break;
                }

                try {
                  console.log(
                    "📨 Processing SSE data:",
                    data.substring(0, 100) + (data.length > 100 ? "..." : "")
                  );
                  const event: StreamEvent = JSON.parse(data);

                  setState((prev) => {
                    const newState = { ...prev };

                    switch (event.type) {
                      case "progress":
                        console.log("🔄 Progress event:", {
                          hasContent: !!event.content,
                          contentType: typeof event.content,
                          progress: event.progress,
                        });
                        // Ensure content is always a string
                        newState.content =
                          typeof event.content === "string"
                            ? event.content
                            : JSON.stringify(event.content, null, 2);
                        newState.progress = event.progress;
                        break;
                      case "complete":
                        console.log("✅ Complete event:", {
                          hasResult: !!event.result,
                          resultType: typeof event.result,
                          resultKeys: event.result
                            ? Object.keys(event.result)
                            : [],
                        });
                        // Ensure content is always a string
                        newState.content =
                          typeof event.result === "string"
                            ? event.result
                            : event.result?.content ||
                              JSON.stringify(event.result, null, 2);
                        newState.isStreaming = false;
                        newState.complete = true;
                        break;
                      case "error":
                        console.error("❌ Error event:", event);
                        newState.error = event.message;
                        newState.isStreaming = false;
                        break;
                      default:
                        console.log(
                          "❓ Unknown event type:",
                          event.type,
                          event
                        );
                        // Ensure content is always a string
                        newState.content =
                          typeof event === "string"
                            ? event
                            : JSON.stringify(event, null, 2);
                    }

                    return newState;
                  });
                } catch (parseError) {
                  console.error(
                    "Failed to parse SSE event:",
                    parseError,
                    "Raw data:",
                    data
                  );
                  setState((prev) => ({
                    ...prev,
                    error: `Failed to parse server response: ${data}`,
                    isStreaming: false,
                  }));
                }
              }
            }
          }
        } catch (error) {
          // Check if this is an abort from our stopStream
          if (error instanceof Error && error.name === "AbortError") {
            console.log("🛑 Stream aborted by user");
            return; // Exit cleanly, no error state set
          }

          console.error("Stream error:", error);
          setState({
            isStreaming: false,
            content: null,
            error: error instanceof Error ? error.message : undefined,
            complete: false,
          });
        }
      } catch (error) {
        console.error("Stream fetch error:", error);
        setState({
          isStreaming: false,
          content: null,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
          complete: false,
        });
      }
    },
    [stopStream]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    ...state,
    startStream,
    stopStream,
  };
}
