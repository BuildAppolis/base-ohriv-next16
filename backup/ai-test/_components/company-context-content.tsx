/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Check, Save } from 'lucide-react';
import {
  BUSINESS_MODELS,
  COMPANY_STAGES,
  INDUSTRIES,
  COMPANY_SIZES,
} from '@/app/(demos)/ai-test/_types/company-enums';
import type {
  BusinessModelId,
  CompanyStageId,
  CompanySizeId,
  IndustryId,
} from '@/app/(demos)/ai-test/_types/company-enums';
import type { CompanyContextData } from './company-context-sidebar';
import type { CompanyValue } from '@/app/(demos)/ai-test/_types/generation-types';
import { EnhancedValueInput } from './enhanced-value-input';
import { SavedContextsManager } from './saved-contexts-manager';
import type { CellResult } from '@/lib/atoms/company-contexts';
import type { LevelAssignment } from './level-assignments-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PositionWorkData {
  roleTitle: string;
  roleDetails: string;
  baseOperations: string;
  services: string[];
  levelAssignments: LevelAssignment[];
  hiringCurve: number;
}

interface CompanyContextContentProps {
  context: CompanyContextData | null;
  onChange: (context: CompanyContextData) => void;
  // Props for SavedContextsManager
  cells?: CellResult[];
  positionWork?: PositionWorkData;
  onLoadContext?: (context: CompanyContextData, cells?: CellResult[], positionWork?: PositionWorkData) => void;
}

// Deep comparison function defined outside component to avoid recursion issues
const isDeepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!isDeepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
  }

  return obj1 === obj2;
};

export function CompanyContextContent({ context, onChange, cells, positionWork, onLoadContext }: CompanyContextContentProps) {
  const [localContext, setLocalContext] = useState<CompanyContextData | null>(context);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use refs to track previous values and prevent unnecessary updates
  const prevContextRef = useRef<CompanyContextData | null>(context);

  // Track if we should skip the next context update to prevent loops
  const skipNextUpdateRef = useRef(false);

  // Sync external context changes - fixed to prevent cascading renders
  useEffect(() => {
    // Skip if we just updated local context to prevent loops
    if (skipNextUpdateRef.current) {
      skipNextUpdateRef.current = false;
      return;
    }

    // Only update if the external context has actually changed and differs from local context
    if (context && !isDeepEqual(context, prevContextRef.current) && !isDeepEqual(context, localContext)) {
      // Mark that we're updating local context so the next update can be skipped
      skipNextUpdateRef.current = true;

      // Batch state updates using setTimeout to avoid synchronous state updates
      setTimeout(() => {
        setLocalContext(context);
        setHasChanges(false);
        prevContextRef.current = context;
      }, 0);
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
    return (
      <Tabs defaultValue="current" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 px-2 shrink-0 max-w-full mb-2">
          <TabsTrigger value="current" className="text-xs truncate min-w-0 flex-1">
            <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Current</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="text-xs truncate min-w-0 flex-1">
            <Save className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Saved</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="flex-1 mt-0">
          <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
            <div>
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No company context yet</p>
              <p className="text-xs mt-1">Analyze a description to get started</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="flex-1 mt-0">
          {onLoadContext ? (
            <SavedContextsManager
              currentContext={context}
              cells={cells}
              positionWork={positionWork}
              onLoadContext={onLoadContext}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
              <div>
                <Save className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Context loading not available</p>
                <p className="text-xs mt-1">Saved contexts require load handler</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <Tabs defaultValue="current" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2 px-2 shrink-0 max-w-full">
        <TabsTrigger value="current" className="text-xs truncate min-w-0 flex-1">
          <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">Current</span>
        </TabsTrigger>
        <TabsTrigger value="saved" className="text-xs truncate min-w-0 flex-1">
          <Save className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">Saved</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="current" className="flex-1 mt-0">
        <div className="space-y-6 p-4">
          {/* Save Status */}
          <div className="flex items-center justify-end gap-2 text-xs">
            {isSaving && (
              <span className="text-muted-foreground flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Saving...
              </span>
            )}
            {!isSaving && !hasChanges && (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
          </div>

          {/* Company Identity */}
          {localContext.name && (
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
                  value={localContext.size}
                  onValueChange={(value: CompanySizeId) => updateContext({ size: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.id} value={size.id} className="text-xs">
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Industry</label>
                <Select
                  value={localContext.industry}
                  onValueChange={(value: IndustryId) => updateContext({ industry: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id as IndustryId} className="text-xs">
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Business Model */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Business Model</label>
                <Select
                  value={localContext.businessModel}
                  onValueChange={(value: BusinessModelId) => updateContext({ businessModel: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id as BusinessModelId} className="text-xs">
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Stage */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Stage</label>
                <Select
                  value={localContext.stage}
                  onValueChange={(value: CompanyStageId) => updateContext({ stage: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id} className="text-xs">
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Culture & Values */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Culture & Values
            </div>

            <div className="space-y-3">
              {/* Company Values */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Core Values</label>
                <EnhancedValueInput
                  values={
                    Array.isArray(localContext.culture.values) && localContext.culture.values.length > 0 && typeof localContext.culture.values[0] === 'object'
                      ? (localContext.culture.values as CompanyValue[])
                      : (localContext.culture.values as string[]).map(v => ({
                        name: v,
                        description: '',
                        color: '#10B981',
                        icon: '⭐',
                        weight: 10
                      }))
                  }
                  onChange={(values) => updateCulture({ values })}
                />
              </div>

            </div>
          </div>

          {/* Additional Context */}
          {localContext.originalDescription || localContext.customContext ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Additional Context
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Original Description</label>
                  <div className="p-2 bg-muted/30 rounded text-xs border max-h-32 overflow-y-auto">
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
            </div>
          ) : null}
        </div>
      </TabsContent>

      <TabsContent value="saved" className="flex-1 mb-2">
        {onLoadContext ? (
          <SavedContextsManager
            currentContext={context}
            cells={cells}
            positionWork={positionWork}
            onLoadContext={onLoadContext}
          />
        ) : (
          <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground">
            <div>
              <Save className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Context loading not available</p>
              <p className="text-xs mt-1">Saved contexts require load handler</p>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}