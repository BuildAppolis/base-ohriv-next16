/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
  RotateCcw,
  Save,
  Copy,
  Check,
  AlertTriangle,
  Code,
} from "lucide-react";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
  title?: string;
  height?: string;
  readOnly?: boolean;
  showValidation?: boolean;
  description?: string;
}

export function JsonEditor({
  value,
  onChange,
  onReset,
  onSave,
  title = "JSON Editor",
  height = "400px",
  readOnly = false,
  showValidation = true,
  description = "",
}: JsonEditorProps) {
  const { theme: systemTheme } = useTheme();
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Validate JSON
  const validateJson = useCallback((jsonString: string) => {
    if (!showValidation || !jsonString.trim()) {
      setIsValid(true);
      setValidationError('');
      return true;
    }

    try {
      JSON.parse(jsonString);
      setIsValid(true);
      setValidationError('');
      return true;
    } catch (error) {
      setIsValid(false);
      setValidationError(error instanceof Error ? error.message : 'Invalid JSON');
      return false;
    }
  }, [showValidation]);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;

    // Configure JSON language
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      enableSchemaRequest: false,
      hover: true,
      completion: true,
      documentSymbols: true,
      folding: true,
      colorDecorators: true,
    });

    // Determine theme based on system theme and read-only state
    const baseTheme = readOnly ? 'vs' : (systemTheme === 'dark' ? 'vs-dark' : 'vs');

    // Set theme for better JSON visibility
    monaco.editor.defineTheme('json-theme', {
      base: baseTheme,
      inherit: true,
      rules: [
        { token: 'string.key.json', foreground: systemTheme === 'dark' ? '9CDCFE' : '0451A5' },
        { token: 'string.value.json', foreground: systemTheme === 'dark' ? 'CE9178' : 'A31515' },
        { token: 'number.json', foreground: systemTheme === 'dark' ? 'B5CEA8' : '098658' },
        { token: 'keyword.json', foreground: systemTheme === 'dark' ? 'C586C0' : '0000FF' },
        { token: 'delimiter.bracket.json', foreground: systemTheme === 'dark' ? 'FFD700' : '000000' },
      ],
      colors: {
        'editor.background': readOnly ? '#FFFFFF' : (systemTheme === 'dark' ? '#1E1E1E' : '#FFFFFF'),
        'editor.foreground': readOnly ? '#000000' : (systemTheme === 'dark' ? '#D4D4D4' : '#000000'),
        'editor.lineHighlightBackground': readOnly ? '#F0F0F0' : (systemTheme === 'dark' ? '#2D2D30' : '#F0F0F0'),
        'editorCursor.foreground': readOnly ? '#000000' : (systemTheme === 'dark' ? '#AEAFAD' : '#000000'),
        'editorWhitespace.foreground': readOnly ? '#D3D3D3' : (systemTheme === 'dark' ? '#404040' : '#D3D3D3'),
        'editor.selectionBackground': systemTheme === 'dark' ? '#264F78' : '#ADD6FF',
        'editor.inactiveSelectionBackground': systemTheme === 'dark' ? '#3A3D41' : '#E5EBF1',
      }
    });

    monaco.editor.setTheme('json-theme');

    // Validate current content
    validateJson(editor.getValue());
  }, [readOnly, validateJson, systemTheme]);

  // Handle editor change
  const handleEditorChange = useCallback((value: string | undefined) => {
    const newValue = value || '';
    onChange(newValue);
    validateJson(newValue);
  }, [onChange, validateJson]);

  // Format JSON using Monaco's format command
  const formatJson = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [value]);

  // Update theme when system theme changes
  useEffect(() => {
    if (editorRef.current) {
      const monaco = (window as any).monaco;
      if (monaco) {
        const baseTheme = readOnly ? 'vs' : (systemTheme === 'dark' ? 'vs-dark' : 'vs');

        // Redefine theme with updated colors
        monaco.editor.defineTheme('json-theme', {
          base: baseTheme,
          inherit: true,
          rules: [
            { token: 'string.key.json', foreground: systemTheme === 'dark' ? '9CDCFE' : '0451A5' },
            { token: 'string.value.json', foreground: systemTheme === 'dark' ? 'CE9178' : 'A31515' },
            { token: 'number.json', foreground: systemTheme === 'dark' ? 'B5CEA8' : '098658' },
            { token: 'keyword.json', foreground: systemTheme === 'dark' ? 'C586C0' : '0000FF' },
            { token: 'delimiter.bracket.json', foreground: systemTheme === 'dark' ? 'FFD700' : '000000' },
          ],
          colors: {
            'editor.background': readOnly ? '#FFFFFF' : (systemTheme === 'dark' ? '#1E1E1E' : '#FFFFFF'),
            'editor.foreground': readOnly ? '#000000' : (systemTheme === 'dark' ? '#D4D4D4' : '#000000'),
            'editor.lineHighlightBackground': readOnly ? '#F0F0F0' : (systemTheme === 'dark' ? '#2D2D30' : '#F0F0F0'),
            'editorCursor.foreground': readOnly ? '#000000' : (systemTheme === 'dark' ? '#AEAFAD' : '#000000'),
            'editorWhitespace.foreground': readOnly ? '#D3D3D3' : (systemTheme === 'dark' ? '#404040' : '#D3D3D3'),
            'editor.selectionBackground': systemTheme === 'dark' ? '#264F78' : '#ADD6FF',
            'editor.inactiveSelectionBackground': systemTheme === 'dark' ? '#3A3D41' : '#E5EBF1',
          }
        });

        monaco.editor.setTheme('json-theme');
      }
    }
  }, [systemTheme, readOnly]);

  // Initial validation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    validateJson(value);
  }, [value, validateJson]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4" />
            {title}
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
              {showValidation && (
                <div className="flex items-center gap-1">
                  {isValid ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  ) : (
                    <div className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Invalid JSON</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {description && (
          <div className="text-sm text-gray-600">
            {description}
          </div>
        )}
        {/* Monaco Editor */}
        <div className="border rounded-lg overflow-hidden" style={{ height }}>
          <Editor
            height="100%"
            defaultLanguage="json"
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="json-theme"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              formatOnPaste: true,
              formatOnType: true,
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true
              },
              suggest: {
                showKeywords: true,
                showSnippets: true
              },
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              folding: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              contextmenu: true,
              mouseWheelZoom: true,
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              renderLineHighlight: 'line',
              renderWhitespace: 'selection',
              rulers: [80, 120],
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
              trimAutoWhitespace: true,
            }}
          />
        </div>

        {/* Validation Error */}
        {!isValid && validationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <div className="font-medium">JSON Validation Error</div>
                <div className="text-xs text-red-600 mt-1">{validationError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {!readOnly && (
            <>
              <Button
                size="sm"
                onClick={onSave}
                disabled={!isValid}
                className="h-8 px-3"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onReset}
                className="h-8 px-3"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset to Original
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={formatJson}
                disabled={!isValid}
                className="h-8 px-3"
              >
                <Code className="h-3 w-3 mr-1" />
                Format
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="h-8 px-3"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>

        </div>
      </CardContent>
    </Card>
  );
}