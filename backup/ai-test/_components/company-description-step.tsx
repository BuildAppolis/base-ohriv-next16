'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, CheckCircle2, XCircle, Info, ArrowRight } from 'lucide-react';
import { StructuredDescriptionInput } from './structured-description-input';
import { DescriptionAnalysisCard } from './description-analysis-card';
import { FormattedDescriptionDisplay } from './formatted-description-display';
import type { DescriptionAnalysis } from '@/app/(demos)/ai-test/_instructions/description-analyzer';
import { Badge } from '@/components/ui/badge';

interface CompanyDescriptionStepProps {
  companyName: string;
  companyDescription: string;
  descriptionAnalysis: DescriptionAnalysis | null;
  lastAnalyzedDescription: string;
  enhancedDescription: { enhanced: string; changes: string[] } | null;
  showingEnhanced: boolean;
  descriptionHasBeenEnhanced: boolean;
  isGeneratingDescription: boolean;
  isCheckingDescription: boolean;
  isEnhancingDescription: boolean;
  isIncorporatingAdditions: boolean;
  isAnalyzingContext: boolean;
  descriptionLocked: boolean;
  isUnlockingDescription: boolean;
  onCompanyNameChange: (name: string) => void;
  onCompanyDescriptionChange: (description: string) => void;
  onGenerateDescription: () => void;
  onCheckDescription: () => void;
  onEnhanceDescription: () => void;
  onAcceptEnhancement: () => void;
  onRejectEnhancement: () => void;
  onRegenerateEnhancement: () => void;
  onIncorporateAdditions: (additions: { techStack?: string[]; additionalInfo?: Record<string, string> }) => void;
  onAnalyzeContext: () => void;
  onUnlockDescription: () => void;
}

export function CompanyDescriptionStep({
  companyName,
  companyDescription,
  descriptionAnalysis,
  lastAnalyzedDescription,
  enhancedDescription,
  showingEnhanced,
  descriptionHasBeenEnhanced,
  isGeneratingDescription,
  isCheckingDescription,
  isEnhancingDescription,
  isIncorporatingAdditions,
  isAnalyzingContext,
  descriptionLocked,
  isUnlockingDescription,
  onCompanyNameChange,
  onCompanyDescriptionChange,
  onGenerateDescription,
  onCheckDescription,
  onEnhanceDescription,
  onAcceptEnhancement,
  onRejectEnhancement,
  onRegenerateEnhancement,
  onIncorporateAdditions,
  onAnalyzeContext,
  onUnlockDescription,
}: CompanyDescriptionStepProps) {
  // DEBUG: Log props to see what we're actually receiving
  const descriptionChanged = companyDescription.trim() !== lastAnalyzedDescription;
  const hasSuggestionsToEnhance =
    descriptionAnalysis &&
    (descriptionAnalysis.suggestions.techStack?.length ||
      descriptionAnalysis.suggestions.missingDetails?.length ||
      descriptionAnalysis.issues.some((i) => i.severity === 'warning' || i.severity === 'suggestion'));

  return (
    <Card className='rounded-none border-none shadow-none'>
      <CardHeader className='py-4'>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <span>Step 1: Company Description & Context</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm mt-1.5">
          Describe your company in the structured format below. Each section helps AI understand your context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <StructuredDescriptionInput
          value={companyDescription}
          onChange={(newValue) => {
            onCompanyDescriptionChange(newValue);
          }}
          companyName={companyName}
          onCompanyNameChange={onCompanyNameChange}
          isGeneratingDescription={isGeneratingDescription}
          isCheckingDescription={isCheckingDescription}
          isEnhancingDescription={isEnhancingDescription}
          isAnalyzingContext={isAnalyzingContext}
          disabled={descriptionLocked}
        />

        {/* Description Analysis Results */}
        {descriptionAnalysis && (
          <DescriptionAnalysisCard
            key={lastAnalyzedDescription} // Reset component state when analysis changes
            analysis={descriptionAnalysis}
            onIncorporate={onIncorporateAdditions}
          />
        )}

        {/* AI Enhancement Section */}
        {enhancedDescription && showingEnhanced && (
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                AI-Enhanced Version
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Original:</div>
                  <FormattedDescriptionDisplay
                    description={companyDescription}
                    variant="default"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Enhanced:</div>
                  <FormattedDescriptionDisplay
                    description={enhancedDescription.enhanced}
                    variant="enhanced"
                  />
                </div>
              </div>

              {enhancedDescription.changes.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Changes Made:</div>
                  <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                    {enhancedDescription.changes.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={onAcceptEnhancement}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept & Use This
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRejectEnhancement}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Keep Original
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onRegenerateEnhancement}
                  disabled={isEnhancingDescription || isIncorporatingAdditions}
                >
                  {(isEnhancingDescription || isIncorporatingAdditions) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Brain className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Indicator */}
        {companyDescription.trim() && !descriptionAnalysis && (
          <div className="p-3 sm:p-4 bg-primary/10 border-2 border-primary/80 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Badge className="font-medium text-sm sm:text-base" variant={'primary'}>Ready to validate</Badge>
              </div>
              <span className="text-xs sm:text-sm text-primary">
                Click &quot;Validate Description&quot; before proceeding
              </span>
            </div>
          </div>
        )}

        {descriptionAnalysis && (
          <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-500 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Ready to proceed!</span>
              </div>
              <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                Click &quot;Analyze Context&quot; below to continue
              </span>
            </div>
          </div>
        )}

        {descriptionChanged && descriptionAnalysis && (
          <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Info className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Description updated</span>
              </div>
              <span className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                Click &quot;Check Description&quot; again to validate changes, or &quot;Analyze Context&quot; to proceed
              </span>
            </div>
          </div>
        )}

        {/* Step 1: Get Company Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
            Set Company Description
          </div>

          <div className="flex flex-wrap gap-2 ml-8">
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateDescription}
              disabled={isGeneratingDescription || descriptionLocked}
            >
              {isGeneratingDescription && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {!isGeneratingDescription && "🎲"} Generate Random
            </Button>

            {descriptionLocked && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onUnlockDescription}
                disabled={isUnlockingDescription}
              >
                {isUnlockingDescription && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                🔓 Unlock Description
              </Button>
            )}
          </div>
        </div>

        {/* Step 2: Validate & Enhance Description */}
        {companyDescription.trim() && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
              Validate Description
            </div>

            <div className="flex flex-wrap gap-2 ml-8">
              {/* Enhancement button - prioritized when available */}
              {hasSuggestionsToEnhance && !showingEnhanced && !descriptionHasBeenEnhanced && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onEnhanceDescription}
                  disabled={isEnhancingDescription}
                >
                  {isEnhancingDescription && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {!isEnhancingDescription && <Brain className="h-4 w-4 mr-2" />}
                  AI Enhancement Available
                </Button>
              )}

              {/* Check Description - only show when needed */}
              {!descriptionAnalysis || descriptionChanged ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onCheckDescription}
                  disabled={isCheckingDescription}
                >
                  {isCheckingDescription && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {!isCheckingDescription && "🔍"} Validate Description
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">Validated</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Proceed to Analysis - ONLY AVAILABLE AFTER DESCRIPTION VALIDATION */}
        {companyDescription.trim() && descriptionAnalysis && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs font-bold">✓</span>
              Ready for Context Analysis
            </div>

            <div className="ml-8">
              <Button
                variant="primary"
                onClick={onAnalyzeContext}
                disabled={isAnalyzingContext}
                size="sm"
                className="w-full sm:w-auto"
              >
                {isAnalyzingContext && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!isAnalyzingContext && "🔍"} Analyze Company Context
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
