import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface CopyToClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export function useCopyToClipboard(options: CopyToClipboardOptions = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const {
    successMessage = 'Copied to clipboard!',
    errorMessage = 'Failed to copy to clipboard',
    showToast = true,
  } = options;

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (!text) {
        return false;
      }

      try {
        // Modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (!successful) {
            throw new Error('Copy command failed');
          }
        }

        setIsCopied(true);
        setCopiedText(text);

        if (showToast) {
          toast.success(successMessage);
        }

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);

        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        setIsCopied(false);
        setCopiedText(null);

        if (showToast) {
          toast.error(errorMessage);
        }

        return false;
      }
    },
    [successMessage, errorMessage, showToast]
  );

  const reset = useCallback(() => {
    setIsCopied(false);
    setCopiedText(null);
  }, []);

  return {
    copyToClipboard,
    isCopied,
    copiedText,
    reset,
  };
}

// Alternative hook with simpler API for basic use cases
export function useSimpleCopy() {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  return [copyToClipboard, isCopied] as const;
}