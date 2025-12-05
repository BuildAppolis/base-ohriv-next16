'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Lightbulb, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import type { DescriptionAnalysis } from '@/app/(demos)/ai-test/_instructions/description-analyzer';
import { cn } from '@/lib/utils';

interface DescriptionAnalysisCardProps {
  analysis: DescriptionAnalysis;
  onIncorporate?: (additions: { techStack?: string[]; additionalInfo?: Record<string, string> }) => void;
}

export function DescriptionAnalysisCard({ analysis, onIncorporate }: DescriptionAnalysisCardProps) {
  const blockingIssues = analysis.issues.filter((i) => i.severity === 'blocking');
  const warnings = analysis.issues.filter((i) => i.severity === 'warning');
  const suggestions = analysis.issues.filter((i) => i.severity === 'suggestion');

  // State for addition inputs
  const [techStackInput, setTechStackInput] = useState<string[]>([]);
  const [additionalInfoInputs, setAdditionalInfoInputs] = useState<Record<string, string>>({});
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());

  const hasAdditions = techStackInput.length > 0 || Object.values(additionalInfoInputs).some(v => v.trim());

  const handleIncorporate = () => {
    if (!onIncorporate || !hasAdditions) return;

    const additions: { techStack?: string[]; additionalInfo?: Record<string, string> } = {};

    if (techStackInput.length > 0) {
      additions.techStack = techStackInput;
    }

    const filteredInfo = Object.entries(additionalInfoInputs)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value.trim())
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (Object.keys(filteredInfo).length > 0) {
      additions.additionalInfo = filteredInfo;
    }

    onIncorporate(additions);

    // Track which sections have been filled
    const newHiddenSections = new Set(hiddenSections);
    if (techStackInput.length > 0) {
      newHiddenSections.add('techStack');
    }
    Object.keys(filteredInfo).forEach(key => {
      newHiddenSections.add(key);
    });
    setHiddenSections(newHiddenSections);

    // Clear inputs after incorporating
    setTechStackInput([]);
    setAdditionalInfoInputs({});
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          {analysis.canProceed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
          <CardTitle className="text-base">
            {analysis.canProceed
              ? 'Description Looks Good!'
              : 'Description Needs Attention'}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Clarity Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <div className="text-sm font-medium">Clarity Assessment</div>
            <div className="text-xs text-muted-foreground">
              {analysis.clarity === 'clear' && 'Description is clear and detailed'}
              {analysis.clarity === 'vague' && 'Some details are unclear or vague'}
              {analysis.clarity === 'insufficient' && 'Needs more detail and specificity'}
            </div>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded ${analysis.clarity === 'clear'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : analysis.clarity === 'vague'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
          >
            {analysis.clarity}
          </span>
        </div>

        {/* Extracted Info */}
        <div className="space-y-2">
          <div className="text-sm font-medium">What We Found:</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 text-xs p-2 bg-muted rounded">
              {analysis.extractedInfo.hasTechStack ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <AlertCircle className="h-3 w-3 text-red-600" />
              )}
              <span>Tech Stack</span>
            </div>
            <div className="flex items-center gap-2 text-xs p-2 bg-muted rounded">
              {analysis.extractedInfo.hasValues ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-amber-600" />
              )}
              <span>Company Values</span>
            </div>
            <div className="flex items-center gap-2 text-xs p-2 bg-muted rounded">
              {analysis.extractedInfo.industry ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-amber-600" />
              )}
              <span>Industry</span>
            </div>
          </div>
        </div>

        {/* Blocking Issues */}
        {blockingIssues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              Required Actions ({blockingIssues.length})
            </div>
            <div className="space-y-2">
              {blockingIssues.map((issue, idx) => (
                <div key={idx} className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg space-y-2">
                  <div className="text-sm font-medium text-red-900 dark:text-red-100">
                    {issue.message}
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300">
                    <strong>Action:</strong> {issue.recommendation}
                  </div>
                  {issue.examples && issue.examples.length > 0 && (
                    <div className="text-xs text-red-700 dark:text-red-300">
                      <strong>Examples:</strong> {issue.examples.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Recommendations ({warnings.length})
            </div>
            <div className="space-y-2">
              {warnings.map((issue, idx) => (
                <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2">
                  <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {issue.message}
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Suggestion:</strong> {issue.recommendation}
                  </div>
                  {issue.examples && issue.examples.length > 0 && (
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Examples:</strong> {issue.examples.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (() => {
          const visibleSuggestions = suggestions.filter(issue => !hiddenSections.has(issue.message));

          if (visibleSuggestions.length === 0) return null;

          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                <Lightbulb className="h-4 w-4" />
                Helpful Tips ({visibleSuggestions.length})
              </div>
              <div className="space-y-2">
                {visibleSuggestions.map((issue, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {issue.message}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      {issue.recommendation}
                    </div>
                    {issue.examples && issue.examples.length > 0 && (
                      <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                        <strong>Examples:</strong> {issue.examples.join(', ')}
                      </div>
                    )}
                    {/* Add input for this suggestion */}
                    <div className="space-y-1 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <label className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                        Add this information:
                      </label>
                      <Input
                        placeholder="Type your answer here..."
                        value={additionalInfoInputs[issue.message] || ''}
                        onChange={(e) => setAdditionalInfoInputs(prev => ({ ...prev, [issue.message]: e.target.value }))}
                        className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* AI Suggestions */}
        {!analysis.extractedInfo.hasTechStack && !hiddenSections.has('techStack') && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Add Tech Stack:
            </div>
            {analysis.suggestions.techStack && analysis.suggestions.techStack.length > 0 && (
              <div>
                <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  Suggested for {analysis.extractedInfo.industry || 'your industry'}:
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {analysis.suggestions.techStack.map((tech, idx) => {
                    const isAlreadyAdded = techStackInput.includes(tech);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!isAlreadyAdded) {
                            setTechStackInput(prev => [...prev, tech]);
                            // Scroll to the TagInput to show the addition
                            setTimeout(() => {
                              const tagInput = document.querySelector('input[placeholder*="React, Node.js, PostgreSQL"]');
                              tagInput?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }, 100);
                          }
                        }}
                        disabled={isAlreadyAdded}
                        className={cn(
                          "text-xs px-2 py-1 rounded transition-all cursor-pointer",
                          "hover:bg-blue-500/20 hover:border-blue-300 hover:text-blue-700",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                          isAlreadyAdded
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 cursor-not-allowed opacity-60"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-transparent hover:border-blue-300"
                        )}
                        title={isAlreadyAdded ? `${tech} is already in your tech stack` : `Click to add ${tech} to your tech stack`}
                      >
                        {isAlreadyAdded ? '✓ ' : ''}{tech}
                      </button>
                    );
                  })}
                </div>
                {techStackInput.some(tech => analysis.suggestions.techStack?.includes(tech)) && (
                  <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Technologies added from suggestions
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <div className="text-xs text-blue-700 dark:text-blue-300">
                Enter your tech stack (press Enter after each):
              </div>
              <TagInput
                tags={techStackInput}
                onChange={setTechStackInput}
                placeholder="React, Node.js, PostgreSQL..."
                className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Missing Details Questions */}
        {analysis.suggestions.missingDetails && analysis.suggestions.missingDetails.length > 0 && (() => {
          const visibleDetails = analysis.suggestions.missingDetails.filter(detail => {
            const key = typeof detail === 'string' ? detail : detail.question;
            return !hiddenSections.has(key);
          });

          if (visibleDetails.length === 0) return null;

          return (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
              <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Add Missing Details:
              </div>
              <div className="space-y-4">
                {visibleDetails.map((detail, idx) => (
                  <div key={idx} className="space-y-2 p-3 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                    <label className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                      {typeof detail === 'string' ? detail : detail.question}
                    </label>

                    {typeof detail !== 'string' && detail.rationale && (
                      <div className="text-xs text-amber-700 dark:text-amber-300 italic">
                        <Info className="h-3 w-3 inline mr-1" />
                        {detail.rationale}
                      </div>
                    )}

                    {typeof detail !== 'string' && detail.examples && detail.examples.length > 0 && (
                      <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        <div className="font-medium">Example answers:</div>
                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                          {detail.examples.map((example, exIdx) => (
                            <li key={exIdx}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Input
                      placeholder="Type your answer here..."
                      value={additionalInfoInputs[typeof detail === 'string' ? detail : detail.question] || ''}
                      onChange={(e) => setAdditionalInfoInputs(prev => ({
                        ...prev,
                        [typeof detail === 'string' ? detail : detail.question]: e.target.value
                      }))}
                      className="bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-sm focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Incorporate Button */}
        {hasAdditions && onIncorporate && (
          <Button
            onClick={handleIncorporate}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add This Information to Description
          </Button>
        )}

        {/* Summary */}
        <div className={`p-3 rounded-lg border-2 ${analysis.canProceed
          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          }`}>
          <div className={`text-sm font-medium ${analysis.canProceed
            ? 'text-green-900 dark:text-green-100'
            : 'text-red-900 dark:text-red-100'
            }`}>
            {analysis.canProceed
              ? '✓ Ready to proceed with context generation'
              : `✗ Please address ${blockingIssues.length} required action${blockingIssues.length !== 1 ? 's' : ''} before continuing`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
