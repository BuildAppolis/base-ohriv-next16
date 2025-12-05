'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Briefcase, ChevronRight, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PositionSuggestion } from '@/app/(demos)/ai-test/_types/generation-types';

interface PositionSuggestionsProps {
  suggestions: PositionSuggestion[];
  isLoading?: boolean;
  error?: string | null;
  onSelectPosition: (suggestion: PositionSuggestion) => void;
  onManualEntry: () => void;
  onRetry?: () => void;
  onGenerateSuggestions?: () => void;
  className?: string;
}

export function PositionSuggestions({
  suggestions,
  isLoading,
  error,
  onSelectPosition,
  onRetry,
  onGenerateSuggestions,
  className,
}: PositionSuggestionsProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('border-2 border-dashed', className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="text-sm text-muted-foreground">
              AI is analyzing your company to suggest relevant positions...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('border-2 border-red-200 dark:border-red-800', className)}>
        <CardContent className="py-8">
          <div className="text-center space-y-3">
            <div className="text-red-600 dark:text-red-400 font-medium">
              Failed to generate position suggestions
            </div>
            <div className="text-sm text-muted-foreground">
              {error}
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no suggestions but no error)
  if (suggestions.length === 0) {
    return (
      <Card className={cn('border-2 border-dashed border-muted-foreground/20', className)}>
        <CardContent className="py-8">
          <div className="text-center space-y-3">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <div className="text-sm text-muted-foreground">
              No position suggestions available yet
            </div>
            <div className="flex gap-2 justify-center">
              {onGenerateSuggestions && (
                <Button variant="primary" size="sm" onClick={onGenerateSuggestions}>
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Generate Suggestions
                </Button>
              )}
              {/* <Button variant="outline" size="sm" onClick={onManualEntry}>
                <Briefcase className="h-3.5 w-3.5 mr-2" />
                Manual Entry
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state with suggestions
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI-Suggested Positions</span>
          <Badge variant="secondary" className="text-xs">
            Based on your company
          </Badge>
        </div>
        {/* <Button variant="outline" size="sm" onClick={onManualEntry}>
          <Briefcase className="h-3.5 w-3.5 mr-2" />
          Manual Entry
        </Button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <Card
            key={index}
            className="border-2 hover:border-primary/50 transition-all cursor-pointer group"
            onClick={() => onSelectPosition(suggestion)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </div>

              {expandedId === index && (
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="text-xs text-muted-foreground italic">
                        <span className="font-medium text-foreground">Why this role: </span>
                        {suggestion.rationale}
                      </p>
                      {suggestion.baseImpactScope && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Impact & Scope: </span>
                          {suggestion.baseImpactScope}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-medium">{suggestion.suggestedStageIds.length} stages suggested</span>
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs -mb-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(expandedId === index ? null : index);
                }}
              >
                {expandedId === index ? 'Show Less' : 'Why This Role?'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Click any position to auto-fill details, or use manual entry for a custom role
      </p>
    </div>
  );
}
