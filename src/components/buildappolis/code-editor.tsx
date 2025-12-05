/* eslint-disable react-hooks/static-components */
"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Download,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  height?: string;
  readOnly?: boolean;
  language?: string;
  path?: string;
  keepCurrentModel?: boolean;
  title?: string;
  showValidation?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
  downloadFileName?: string;
  className?: string;
  showToolbar?: boolean;
  renderToolbar?: (controls: {
    copy: () => void;
    download: () => void;
    toggleFullscreen: () => void;
    closeFullscreen: () => void;
    copied: boolean;
    isFullscreen: boolean;
    validationError?: string;
    isValid: boolean;
  }) => React.ReactNode;
}

export function CodeEditor({
  value,
  onChange,
  height = "400px",
  readOnly = false,
  language = "json",
  path = "code-editor",
  keepCurrentModel = true,
  title = "Code Editor",
  showValidation = true,
  onCopy,
  onDownload,
  downloadFileName = "code.txt",
  className = "",
  showToolbar = true,
  renderToolbar,
}: CodeEditorProps) {
  const { theme: systemTheme } = useTheme();
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Validate JSON if language is JSON
  const validateJson = useCallback((codeString: string) => {
    if (!showValidation || language !== "json" || !codeString.trim()) {
      setIsValid(true);
      setValidationError('');
      return;
    }

    try {
      JSON.parse(codeString);
      setIsValid(true);
      setValidationError('');
    } catch (error) {
      setIsValid(false);
      setValidationError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  }, [language, showValidation]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleValueChange = (newValue: string | undefined) => {
    const finalValue = newValue || '';
    onChange?.(finalValue);

    // Validate JSON if enabled
    if (showValidation && language === "json") {
      validateJson(finalValue);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const editorTheme = systemTheme === "dark" ? "vs-dark" : "vs-light";
  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: "on" as const,
      wordWrap: "on" as const,
      automaticLayout: true,
      readOnly,
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: "selection" as const,
      folding: true,
      contextmenu: true,
    }),
    [readOnly]
  );

  const controls = {
    copy: handleCopy,
    download: handleDownload,
    toggleFullscreen,
    closeFullscreen,
    copied,
    isFullscreen,
    validationError,
    isValid,
  };

  const Toolbar = ({ compact = false, showClose = false }: { compact?: boolean; showClose?: boolean }) => (
    <div className={`flex items-center gap-1 ${compact ? 'bg-background' : 'bg-muted'} p-1 rounded-md border`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="min-w-[32px] px-2"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
      {onDownload && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="min-w-[32px] px-2"
        >
          <Download className="h-3 w-3" />
        </Button>
      )}
      {showClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={closeFullscreen}
          className="min-w-[32px] px-2"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      {!showClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="min-w-[32px] px-2"
        >
          {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
        </Button>
      )}
    </div>
  );

  const EditorContent = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div className={`relative ${fullscreen ? 'h-[calc(100vh-8rem)]' : ''}`}>
      <Editor
        height={fullscreen ? "100%" : height}
        language={language}
        theme={editorTheme}
        value={value}
        onChange={handleValueChange}
        onMount={handleEditorDidMount}
        loading="Loading editor..."
        path={path || "code-editor"}
        keepCurrentModel={keepCurrentModel}
        options={editorOptions}
      />
      {!isValid && validationError && (
        <div className="absolute bottom-2 left-2 right-2 bg-destructive/10 border border-destructive/20 rounded-md p-2 text-xs text-destructive">
          <strong>Validation Error:</strong> {validationError}
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      {/* Optional top toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="text-sm font-medium">{title}</h3>
          {renderToolbar ? renderToolbar(controls) : <Toolbar compact />}
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        <EditorContent />
      </div>

      {/* Fullscreen Dialog (portal) */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          variant="fullscreen"
          className="p-0"
          showCloseButton={false}
        >
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                  {language === "json"
                    ? "JSON editor with syntax highlighting and validation"
                    : "Code editor with syntax highlighting"}
                </DialogDescription>
              </div>
              {renderToolbar ? renderToolbar(controls) : <Toolbar showClose />}
            </div>
          </DialogHeader>
          <div className="px-4 pb-4 h-[calc(100vh-6rem)]">
            <EditorContent fullscreen />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
