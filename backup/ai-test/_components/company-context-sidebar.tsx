/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EnhancedValueInput } from './enhanced-value-input';
import type { CompanyValue, CompanyStage } from '@/app/(demos)/ai-test/_types/generation-types';
import {
  BUSINESS_MODELS,
  COMPANY_STAGES,
  INDUSTRIES,
  COMPANY_SIZES,
} from '@/app/(demos)/ai-test/_types/company-enums';
import type {
  BusinessModelId,
  CompanyStageId,
  IndustryId,
  CompanySizeId,
  AutonomyLevelId,
  WorkPaceId,
} from '@/app/(demos)/ai-test/_types/company-enums';

export interface CompanyContextData {
  name?: string;
  industry: IndustryId;
  subIndustry?: string;
  size: CompanySizeId;
  stage: CompanyStageId;
  businessModel: BusinessModelId;
  techStack: string[];
  culture: {
    values: string[] | CompanyValue[];
    pace?: WorkPaceId;
    structure?: AutonomyLevelId;
  };
  confidence?: number;
  stages?: CompanyStage[];
  jobLevelCategory?: string;
  originalDescription?: string;
  customContext?: string;
  // Analysis state persistence
  descriptionAnalysis?: import('@/app/(demos)/ai-test/_types').DescriptionAnalysis;
  lastAnalyzedDescription?: string;
  descriptionHasBeenEnhanced?: boolean;
  enhancedDescription?: any;
  lastEnhancementType?: any;
  lastAdditions?: any;
}

interface CompanyContextSidebarProps {
  context: CompanyContextData | null;
  onChange: (context: CompanyContextData) => void;
  className?: string;
}

export function CompanyContextSidebar({ context, onChange, className }: CompanyContextSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localContext, setLocalContext] = useState<CompanyContextData | null>(context);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync external context changes
  useEffect(() => {
    if (context && JSON.stringify(context) !== JSON.stringify(localContext)) {
      setLocalContext(context);
      setHasChanges(false);
    }
  }, [context, localContext]);

  // Auto-save with debounce
  useEffect(() => {
    if (!hasChanges || !localContext) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      onChange(localContext);
      setTimeout(() => {
        setIsSaving(false);
        setHasChanges(false);
      }, 300);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [localContext, hasChanges, onChange]);

  const updateContext = (updates: Partial<CompanyContextData>) => {
    if (!localContext) return;
    setLocalContext({ ...localContext, ...updates });
    setHasChanges(true);
  };

  const updateCulture = (updates: Partial<CompanyContextData['culture']>) => {
    if (!localContext) return;
    setLocalContext({
      ...localContext,
      culture: { ...localContext.culture, ...updates },
    });
    setHasChanges(true);
  };

  if (!localContext) {
    return null;
  }

  return (
    <>
      {/* Desktop: Fixed sidebar */}
      <div className={cn(
        'hidden lg:block fixed left-4 top-20 z-50 transition-all duration-300',
        className
      )}>
        <Card className={cn('shadow-lg border-2 transition-all duration-300', isCollapsed ? 'w-fit' : 'w-80 xl:w-96')}>
          {isCollapsed ? (
            <div className="p-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5" />
                    Company Context
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isSaving && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        Saving...
                      </span>
                    )}
                    {!isSaving && !hasChanges && localContext && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Saved
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCollapsed(true)}
                      className="h-6 w-6"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                  {renderContent()}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Mobile/Tablet: Bottom sheet drawer */}
      <div className={cn(
        'lg:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300',
        isCollapsed ? 'translate-y-[calc(100%-4rem)]' : 'translate-y-0',
        className
      )}>
        <Card className="rounded-t-2xl rounded-b-none shadow-2xl border-x-0 border-b-0 border-t-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Company Context
              </CardTitle>
              <div className="flex items-center gap-2">
                {isSaving && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  </span>
                )}
                {!isSaving && !hasChanges && localContext && (
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8"
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4 rotate-90" /> : <ChevronLeft className="h-4 w-4 -rotate-90" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          {!isCollapsed && (
            <CardContent className="px-4 pb-4">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {renderContent()}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );

  function renderContent() {
    return (
      <>
        {/* Company Identity */}
        {localContext && localContext.name && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Company Identity
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-primary">
                  {localContext.name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {INDUSTRIES.find(i => i.id === localContext.industry)?.label}
                {localContext.subIndustry && ` • ${localContext.subIndustry}`}
              </div>
            </div>
          </div>
        )}

        {/* Company Profile */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Company Profile
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Company Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Size</label>
              <Select
                value={localContext?.size}
                onValueChange={(size: CompanySizeId) => updateContext({ size })}
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Stage</label>
              <Select
                value={localContext?.stage}
                onValueChange={(stage: CompanyStageId) => updateContext({ stage })}
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Business Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Business Model</label>
              <Select
                value={localContext?.businessModel}
                onValueChange={(businessModel: BusinessModelId) => updateContext({ businessModel })}
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_MODELS.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Technology */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Technology
          </div>

          {localContext && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Tech Stack</label>
              <TagInput
                tags={localContext.techStack}
                onChange={(techStack) => updateContext({ techStack })}
                placeholder="Add technology..."
              />
              {localContext.techStack.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {localContext.techStack.length} {localContext.techStack.length === 1 ? 'technology' : 'technologies'}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Culture */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Company Culture
            <span className="ml-1 text-xs font-normal text-blue-600 dark:text-blue-400 lowercase">
              (Company-wide only)
            </span>
          </div>

          {/* Company Values */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Core Values</label>
            {localContext && (
              <EnhancedValueInput
                values={
                  Array.isArray(localContext.culture.values) && localContext.culture.values.length > 0 && typeof localContext.culture.values[0] === 'object'
                    ? (localContext.culture.values as CompanyValue[])
                    : (localContext.culture.values as string[]).map(v => ({
                      name: v,
                      description: '',
                      color: '#10B981',
                      icon: '⭐'
                    }))
                }
                onChange={(values) => updateCulture({ values })}
              />
            )}
          </div>

          <div className="text-xs text-blue-600 dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
            💡 Position-specific culture (work environment, pace, collaboration) is generated per role
          </div>
        </div>

        {/* Additional Context */}
        {localContext && localContext.originalDescription && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Additional Context
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Original Description</label>
              <div className="p-2 bg-muted/30 rounded text-xs border">
                {localContext.originalDescription}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Custom Notes</label>
              <Textarea
                value={localContext.customContext || ''}
                onChange={(e) => updateContext({ customContext: e.target.value })}
                placeholder="Add any additional context..."
                className="text-xs min-h-[80px] resize-none"
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
