/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle2, XCircle, Brain, Code, Briefcase, ChevronDown, ChevronRight, Sparkles, MessageSquare, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { QuestionEditor } from './question-editor';
import { AttributeEditor, GeneratedAttribute } from './attribute-editor';
import type { GeneratedQuestion } from './question-editor-card';
import type { CompanyStage } from '@/app/(demos)/ai-test/_types/generation-types';

export interface CellResult {
  id: string;
  type:
  | "context"
  | "attributes"
  | "questions"
  | "role-setup"
  | "job-template"
  | "additional-role";
  status: "loading" | "success" | "error";
  input: any;
  output?: any;
  metadata?: any;
  generationTime?: number;
  error?: string;
  createdAt: string;
}

interface ExecutionHistoryProps {
  cells: CellResult[];
  onCellUpdate: (cellId: string, updates: Partial<CellResult>) => void;
  streamingAttributes?: any[];
  streamingQuestions?: any[];
  streamingProgress?: {
    attributes?: { current: number; total: number };
    questions?: { current: number; total: number };
  };
  isGenerating?: boolean;
  availableLevels?: string[];
  companyStages?: CompanyStage[];
  onQuestionUpdate?: (questionId: string, updates: any) => void;
}

export function ExecutionHistory({
  cells,
  onCellUpdate,
  streamingAttributes = [],
  streamingQuestions = [],
  streamingProgress = {},
  isGenerating = false,
  availableLevels = [],
  companyStages = [],
  onQuestionUpdate
}: ExecutionHistoryProps) {
  const searchParams = useSearchParams();
  const isDebugMode = searchParams.get('debug') === 'true';
  const [expandedDebugCells, setExpandedDebugCells] = useState<Set<string>>(new Set());
  const [expandedAttributesCells, setExpandedAttributesCells] = useState<Set<string>>(new Set());
  const [expandedQuestionsCells, setExpandedQuestionsCells] = useState<Set<string>>(new Set());
  const [expandedJobTemplateCells, setExpandedJobTemplateCells] = useState<Set<string>>(new Set());

  // Create attribute name -> category map from streaming attributes
  const attributeCategoryMap = new Map<string, string>();
  streamingAttributes.forEach(attr => {
    attributeCategoryMap.set(attr.name, attr.category);
  });

  // Add shimmer animation keyframes
  const shimmerKeyframes = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
      }
      50% {
        box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.6);
      }
    }
  `;

  const toggleDebugSection = (cellId: string) => {
    setExpandedDebugCells((prev) => {
      const updated = new Set(prev);
      if (updated.has(cellId)) {
        updated.delete(cellId);
      } else {
        updated.add(cellId);
      }
      return updated;
    });
  };

  const toggleAttributesSection = (cellId: string) => {
    setExpandedAttributesCells((prev) => {
      const updated = new Set(prev);
      if (updated.has(cellId)) {
        updated.delete(cellId);
      } else {
        updated.add(cellId);
      }
      return updated;
    });
  };

  const toggleQuestionsSection = (cellId: string) => {
    setExpandedQuestionsCells((prev) => {
      const updated = new Set(prev);
      if (updated.has(cellId)) {
        updated.delete(cellId);
      } else {
        updated.add(cellId);
      }
      return updated;
    });
  };

  const toggleJobTemplateSection = (cellId: string) => {
    setExpandedJobTemplateCells((prev) => {
      const updated = new Set(prev);
      if (updated.has(cellId)) {
        updated.delete(cellId);
      } else {
        updated.add(cellId);
      }
      return updated;
    });
  };

  // Pass full company stages for question editor (no transformation needed)
  const stages = companyStages;

  if (cells.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Inject shimmer animation styles */}
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      {/* Streaming Display - Paint to Canvas Effect */}
      {isGenerating && (
        <div>
          <div className='flex items-center w-full justify-between'>
            <div className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
              <span>
                {!streamingProgress.attributes && !streamingProgress.questions
                  ? "Loading company details..."
                  : streamingProgress.questions && (streamingProgress.questions.current > 0 || streamingProgress.questions.total > 0)
                    ? `Generating questions... (${streamingProgress.questions.current}/${streamingProgress.questions.total})`
                    : streamingProgress.attributes && (streamingProgress.attributes.current > 0 || streamingProgress.attributes.total > 0)
                      ? `Generating attributes... (${streamingProgress.attributes.current}/${streamingProgress.attributes.total})`
                      : "Generating Position..."}
              </span>
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 ml-auto" />
            </div>
          </div>
          <div className="space-y-6">
            {/* Streaming Attributes */}
            {streamingProgress.attributes && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    {streamingProgress.attributes.current === streamingProgress.attributes.total ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-purple-500" />
                    )}
                    Attributes
                  </h3>
                  <Badge
                    variant={streamingProgress.attributes.current === streamingProgress.attributes.total ? "primary" : "secondary"}
                    className={cn(
                      "text-xs",
                      streamingProgress.attributes.current === streamingProgress.attributes.total && "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {streamingProgress.attributes.current === streamingProgress.attributes.total && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    {streamingProgress.attributes.current} / {streamingProgress.attributes.total}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div
                  className="w-full bg-muted rounded-full h-2 overflow-hidden relative"
                  style={streamingProgress.attributes.current === streamingProgress.attributes.total
                    ? {}
                    : { animation: 'pulse-glow 2s ease-in-out infinite' }
                  }
                >
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out relative overflow-hidden",
                      streamingProgress.attributes.current === streamingProgress.attributes.total
                        ? "bg-green-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    )}
                    style={{
                      width: `${(streamingProgress.attributes.current / streamingProgress.attributes.total) * 100}%`
                    }}
                  >
                    {/* Animated shimmer effect - only when not complete */}
                    {streamingProgress.attributes.current !== streamingProgress.attributes.total && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        style={{
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite'
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Streaming Attributes List */}
                <div className="space-y-2">
                  {streamingAttributes.map((attr, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/60 dark:bg-gray-900/40 rounded-lg border border-purple-200/50 dark:border-purple-800/30 animate-in fade-in slide-in-from-left-2 duration-500"
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5 text-xs bg-purple-500/10 border-purple-500/30">
                          {attr.category}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{attr.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{attr.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streaming Questions */}
            {streamingProgress.questions && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    {streamingProgress.questions.current === streamingProgress.questions.total ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                    )}
                    Interview Questions
                  </h3>
                  <Badge
                    variant={streamingProgress.questions.current === streamingProgress.questions.total ? "primary" : "secondary"}
                    className={cn(
                      "text-xs",
                      streamingProgress.questions.current === streamingProgress.questions.total && "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {streamingProgress.questions.current === streamingProgress.questions.total && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    {streamingProgress.questions.total > 0
                      ? `${streamingProgress.questions.current} / ${streamingProgress.questions.total}`
                      : streamingProgress.attributes && streamingProgress.attributes.current > 0
                        ? `Waiting for attributes to complete...`
                        : `Preparing to generate...`
                    }
                  </Badge>
                </div>

                {/* Progress Bar - Only show when actively generating questions */}
                {streamingProgress.questions.total > 0 && (
                  <div
                    className="w-full bg-muted rounded-full h-2 overflow-hidden relative"
                    style={streamingProgress.questions.current === streamingProgress.questions.total
                      ? {}
                      : { animation: 'pulse-glow 2s ease-in-out infinite' }
                    }
                  >
                    <div
                      className={cn(
                        "h-full transition-all duration-500 ease-out relative overflow-hidden",
                        streamingProgress.questions.current === streamingProgress.questions.total
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      )}
                      style={{
                        width: `${(streamingProgress.questions.current / streamingProgress.questions.total) * 100}%`
                      }}
                    >
                      {/* Animated shimmer effect - only when not complete */}
                      {streamingProgress.questions.current !== streamingProgress.questions.total && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s infinite'
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Streaming Questions List */}
                <div className="space-y-2">
                  {streamingQuestions.map((question, index) => {
                    // Get unique categories from question attributes
                    const categories = new Set<string>();
                    question.attributes?.forEach((attrName: string) => {
                      const category = attributeCategoryMap.get(attrName);
                      if (category) categories.add(category);
                    });

                    return (
                      <div
                        key={question.id || index}
                        className="p-3 bg-white/60 dark:bg-gray-900/40 rounded-lg border border-blue-200/50 dark:border-blue-800/30 animate-in fade-in slide-in-from-right-2 duration-500"
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5 text-xs bg-blue-500/10 border-blue-500/30 shrink-0">
                            {question.stageName || question.stage}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{question.text}</p>

                            {/* Primary Categories (VALUE, KNOWLEDGE, SKILL, ABILITY) */}
                            {categories.size > 0 && (
                              <div className="flex items-center gap-1 mt-2 flex-wrap">
                                <span className="text-xs text-muted-foreground shrink-0">Categories:</span>
                                {Array.from(categories).map((category, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className={cn(
                                      "text-xs font-semibold",
                                      category === 'VALUE' && "bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300",
                                      category === 'KNOWLEDGE' && "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
                                      category === 'SKILL' && "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
                                      category === 'ABILITY' && "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
                                    )}
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Specific Attributes (sub-values) */}
                            {question.attributes && question.attributes.length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                <span className="text-xs text-muted-foreground shrink-0">Attributes:</span>
                                <div className="flex gap-1 flex-wrap">
                                  {question.attributes.slice(0, 3).map((attrName: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {attrName}
                                    </Badge>
                                  ))}
                                  {question.attributes.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{question.attributes.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Level Selector - Interactive */}
                            {question.assignedLevels && question.assignedLevels.length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                <span className="text-xs text-muted-foreground shrink-0">Levels:</span>
                                {availableLevels.length > 0 ? (
                                  // Show all available levels with checkboxes
                                  <div className="flex gap-1 flex-wrap">
                                    {availableLevels.map((level) => {
                                      const isAssigned = question.assignedLevels.includes(level);
                                      return (
                                        <Badge
                                          key={level}
                                          variant={isAssigned ? "primary" : "outline"}
                                          className={cn(
                                            "text-xs cursor-pointer hover:opacity-80 transition-opacity",
                                            isAssigned
                                              ? "bg-green-500/90 border-green-600 text-white"
                                              : "bg-gray-100/50 border-gray-300 text-gray-600 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-400"
                                          )}
                                          onClick={() => {
                                            if (onQuestionUpdate) {
                                              const newLevels = isAssigned
                                                ? question.assignedLevels.filter((l: string) => l !== level)
                                                : [...question.assignedLevels, level];
                                              onQuestionUpdate(question.id, { assignedLevels: newLevels });
                                            }
                                          }}
                                        >
                                          {isAssigned && <Check className="w-3 h-3 mr-0.5" />}
                                          {level}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  // Fallback: just show assigned levels as badges
                                  question.assignedLevels.map((level: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                                      {level}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading State When No Progress Yet */}
            {!streamingProgress.attributes && !streamingProgress.questions && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm">Initializing generation...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show completed cells (always visible, even during new generation) */}
      {cells.map((cell) => {
        const isDebugExpanded = expandedDebugCells.has(cell.id);

        return (
          <div
            key={cell.id}
            className={cn(
              cell.status === 'success' && 'border-l-green-500',
              cell.status === 'error' && 'border-l-red-500',
              cell.status === 'loading' && 'border-l-blue-500'
            )}
          >
            <div className='flex items-center w-full justify-between'>
              <div className="flex items-center justify-between w-full text-base sm:text-lg mb-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {cell.type === 'context' && <Brain className="h-5 w-5 flex-shrink-0" />}
                  {cell.type === 'role-setup' && <Code className="h-5 w-5 flex-shrink-0" />}
                  {cell.type === 'additional-role' && <Briefcase className="h-5 w-5 flex-shrink-0" />}
                  <span className="truncate">
                    {cell.type === 'context' && 'Analyze Context'}
                    {cell.type === 'role-setup' && 'Generated Position'}
                    {cell.type === 'additional-role' && 'Generate Additional Position'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {cell.status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                  {cell.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {cell.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground">
              {new Date(cell.createdAt).toLocaleString()}
            </div>

            <div className="space-y-4">
              {/* Success: Show user-friendly output first */}
              {cell.status === 'success' && cell.output && (
                <>
                  {/* Role Setup / Additional Role: Inline display and editing */}
                  {(cell.type === 'role-setup' || cell.type === 'additional-role') && (
                    <div className="space-y-6">
                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{cell.output.attributes?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Attributes</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{cell.output.questions?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Questions</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{cell.output.jobTemplate?.services?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Tools</div>
                        </div>
                      </div>

                      {/* Attributes Section */}
                      {cell.output.attributes && cell.output.attributes.length > 0 && (
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => toggleAttributesSection(cell.id)}
                            className="flex items-center gap-2 w-full text-sm font-semibold hover:text-primary transition-colors mb-4"
                          >
                            {expandedAttributesCells.has(cell.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <Sparkles className="h-4 w-4" />
                            <span>Attributes ({cell.output.attributes.length})</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Click to {expandedAttributesCells.has(cell.id) ? 'collapse' : 'expand & edit'}
                            </Badge>
                          </button>

                          {expandedAttributesCells.has(cell.id) && (
                            <AttributeEditor
                              attributes={cell.output.attributes}
                              onAttributesChange={(updated: GeneratedAttribute[]) => {
                                onCellUpdate(cell.id, {
                                  output: {
                                    ...cell.output,
                                    attributes: updated,
                                  },
                                });
                              }}
                            />
                          )}
                        </div>
                      )}

                      {/* Questions Section */}
                      {cell.output.questions && cell.output.questions.length > 0 && (
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => toggleQuestionsSection(cell.id)}
                            className="flex items-center gap-2 w-full text-sm font-semibold hover:text-primary transition-colors mb-4"
                          >
                            {expandedQuestionsCells.has(cell.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <MessageSquare className="h-4 w-4" />
                            <span>Questions ({cell.output.questions.length})</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Click to {expandedQuestionsCells.has(cell.id) ? 'collapse' : 'expand & edit'}
                            </Badge>
                          </button>

                          {expandedQuestionsCells.has(cell.id) && (
                            <QuestionEditor
                              questions={cell.output.questions}
                              attributes={cell.output.attributes || []}
                              stages={stages}
                              onQuestionsChange={(updated: GeneratedQuestion[]) => {
                                onCellUpdate(cell.id, {
                                  output: {
                                    ...cell.output,
                                    questions: updated,
                                  },
                                });
                              }}
                            />
                          )}
                        </div>
                      )}

                      {/* Job Template Section */}
                      {cell.output.jobTemplate && (
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => toggleJobTemplateSection(cell.id)}
                            className="flex items-center gap-2 w-full text-sm font-semibold hover:text-primary transition-colors mb-4"
                          >
                            {expandedJobTemplateCells.has(cell.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <Briefcase className="h-4 w-4" />
                            <span>Job Template</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Click to {expandedJobTemplateCells.has(cell.id) ? 'collapse' : 'view'}
                            </Badge>
                          </button>

                          {expandedJobTemplateCells.has(cell.id) && (
                            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                              <div>
                                <h3 className="font-semibold text-lg mb-2">{cell.output.jobTemplate.title}</h3>
                                <p className="text-sm text-muted-foreground">{cell.output.jobTemplate.baseDescription}</p>
                              </div>

                              {cell.output.jobTemplate.baseRequirements && cell.output.jobTemplate.baseRequirements.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                                  <ul className="text-sm space-y-1 list-disc list-inside">
                                    {cell.output.jobTemplate.baseRequirements.map((req: string, idx: number) => (
                                      <li key={idx}>{req}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {cell.output.jobTemplate.tags && cell.output.jobTemplate.tags.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Tags:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {cell.output.jobTemplate.tags.map((tag: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {cell.output.jobTemplate.services && cell.output.jobTemplate.services.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Tools/Services:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {cell.output.jobTemplate.services.map((service: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="bg-green-500/10">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Context: Show summary info */}
                  {/* {cell.type === 'context' && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        ✓ Context analyzed successfully
                      </p>
                      {cell.output.industry && (
                        <div className="text-sm">
                          <span className="font-medium">Industry:</span> {cell.output.industry}
                          {cell.output.subIndustry && ` - ${cell.output.subIndustry}`}
                        </div>
                      )}
                      {cell.output.size && (
                        <div className="text-sm">
                          <span className="font-medium">Size:</span> {cell.output.size}
                        </div>
                      )}
                      {cell.output.stage && (
                        <div className="text-sm">
                          <span className="font-medium">Stage:</span> {cell.output.stage}
                        </div>
                      )}
                    </div>
                  )} */}

                  {/* Debug Mode: Show execution details in collapsible section */}
                  {isDebugMode && (
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => toggleDebugSection(cell.id)}
                        className="flex items-center gap-2 w-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isDebugExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span>Execution Details</span>
                      </button>

                      {isDebugExpanded && (
                        <div className="mt-4 space-y-4">
                          {/* Input */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Input:</h4>
                            <ScrollArea className="h-96 w-full">
                              <pre className="bg-muted p-4 rounded-lg text-xs w-full break-all whitespace-pre-wrap">
                                {JSON.stringify(cell.input, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>

                          {/* Output */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Output:</h4>
                            <ScrollArea className="h-96 w-full">
                              <pre className="bg-muted p-4 rounded-lg text-xs w-full break-all whitespace-pre-wrap">
                                {JSON.stringify(cell.output, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>

                          {/* Metadata */}
                          {cell.metadata && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Metadata:</h4>
                              <ScrollArea className="h-96 w-full">
                                <pre className="bg-muted p-4 rounded-lg text-xs w-full break-all whitespace-pre-wrap">
                                  {JSON.stringify(cell.metadata, null, 2)}
                                </pre>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Error: Always show errors */}
              {cell.status === 'error' && cell.error && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-red-500">Error:</h4>
                  <pre className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg overflow-auto text-xs text-red-600 dark:text-red-400">
                    {cell.error}
                  </pre>
                </div>
              )}

              {/* Loading: Show loading message */}
              {cell.status === 'loading' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
