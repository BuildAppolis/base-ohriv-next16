"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Fullscreen, Minimize2, Copy, Save, RotateCcw } from "lucide-react";

interface FullscreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  title: string;
  placeholder?: string;
  onSave?: () => void;
  onCopy?: () => void;
  onReset?: () => void;
  showSaveButton?: boolean;
  showCopyButton?: boolean;
  showResetButton?: boolean;
  className?: string;
}

export function FullscreenEditor({
  isOpen,
  onClose,
  value,
  onChange,
  title,
  placeholder,
  onSave,
  onCopy,
  onReset,
  showSaveButton = true,
  showCopyButton = true,
  showResetButton = true,
  className = ""
}: FullscreenEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(localValue);
    if (onSave) onSave();
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localValue);
      console.log('📋 Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
    if (onCopy) onCopy();
  };

  const handleReset = () => {
    setLocalValue(value);
    if (onReset) onReset();
  };

  const toggleNativeFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsNativeFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsNativeFullscreen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !e.shiftKey) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsNativeFullscreen(false);
      } else {
        onClose();
      }
    } else if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              {/* Native fullscreen toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleNativeFullscreen}
                title={isNativeFullscreen ? "Exit fullscreen" : "Enter fullscreen (F11)"}
              >
                {isNativeFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Fullscreen className="h-4 w-4" />
                )}
              </Button>

              {/* Action buttons */}
              {showCopyButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!localValue.trim()}
                  title="Copy to clipboard (Ctrl+C)"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              )}

              {showResetButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  title="Reset to original (Ctrl+R)"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}

              {showSaveButton && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={localValue === value}
                  title="Save changes (Ctrl+S)"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-hidden">
          <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full h-full resize-none font-mono text-sm ${className}`}
            autoFocus
          />
        </div>

        <div className="flex-shrink-0 px-6 py-3 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              {localValue.length} characters • {localValue.split('\n').length} lines
            </div>
            <div className="flex items-center gap-4">
              <span>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+S</kbd> to save</span>
              <span>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to close</span>
              <span>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">F11</kbd> for fullscreen</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}