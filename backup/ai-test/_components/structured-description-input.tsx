'use client';

import { useState, useEffect } from 'react';
import { ProcessingTextarea } from '@/components/ui/magic-textarea';
import { ProcessingInput } from '@/components/ui/magic-input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Building2 } from 'lucide-react';
import { CompanyDescriptionGuide } from './company-description-guide';
import { cn } from '@/lib/utils';

interface StructuredDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  companyName?: string;
  onCompanyNameChange?: (name: string) => void;
  // Magical loading states
  isGeneratingDescription?: boolean;
  isCheckingDescription?: boolean;
  isEnhancingDescription?: boolean;
  isAnalyzingContext?: boolean;
  disabled?: boolean;
}

export function StructuredDescriptionInput({
  value,
  onChange,
  companyName = '',
  onCompanyNameChange,
  isGeneratingDescription = false,
  isCheckingDescription = false,
  isEnhancingDescription = false,
  isAnalyzingContext = false,
  disabled = false
}: StructuredDescriptionInputProps) {
  const [mission, setMission] = useState('');
  const [values, setValues] = useState('');
  const [overview, setOverview] = useState('');
  const [lastSyncedValue, setLastSyncedValue] = useState('');

  // Check if any magical generation is happening
  const isMagicHappening = isGeneratingDescription || isCheckingDescription || isEnhancingDescription || isAnalyzingContext;

  // Get current processing operation type
  const getProcessingType = () => {
    if (isGeneratingDescription) return 'generation';
    if (isCheckingDescription) return 'analysis';
    if (isEnhancingDescription) return 'enhancement';
    if (isAnalyzingContext) return 'analysis';
    return 'default';
  };

  // Parse existing description into sections when value changes externally
  useEffect(() => {
    // Only sync if the external value is different from what we last synced
    // This prevents overwriting user input while they're typing
    if (value && value !== lastSyncedValue) {
      const currentCombined = combineDescription(mission, values, overview);

      // Only update if external value is significantly different from current internal state
      // This allows external updates (like AI enhancements) while preserving user edits
      if (value !== currentCombined) {
        const sections = parseDescription(value);
        setMission(sections.mission);
        setValues(sections.values);
        setOverview(sections.overview);
        setLastSyncedValue(value);
      }
    }
  }, [value, lastSyncedValue, mission, values, overview]);

  // Combine sections and notify parent whenever any section changes
  useEffect(() => {
    const combined = combineDescription(mission, values, overview);
    if (combined !== value) {
      onChange(combined);
      setLastSyncedValue(combined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission, values, overview]);

  const handleMissionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMission(e.target.value);
  };

  const handleValuesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValues(e.target.value);
  };

  const handleOverviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOverview(e.target.value);
  };

  const isNameComplete = companyName.trim().length > 2;
  const isMissionComplete = mission.trim().length > 20;
  const isValuesComplete = values.trim().length > 15;
  const isOverviewComplete = overview.trim().length > 20;

  return (
    <div className="space-y-4">


      {/* Company Name Section */}
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Company Name
          <span className="text-xs text-muted-foreground font-normal">
            (Your organization&apos;s name)
          </span>
          {isNameComplete && (
            <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
          )}
        </Label>
        <ProcessingInput
          id="companyName"
          placeholder="Acme Corporation"
          value={companyName}
          onChange={(e) => onCompanyNameChange?.(e.target.value)}
          isProcessing={isMagicHappening}
          processingType={getProcessingType()}
          disabled={disabled}
          className={cn(
            'font-mono text-sm',
            isNameComplete && 'border-green-500/50'
          )}
        />
      </div>

      {/* Mission Section */}
      <div className="space-y-2">
        <Label htmlFor="mission" className="text-sm font-medium flex items-center gap-2">
          <span className="text-lg">🎯</span>
          Company Mission
          <span className="text-xs text-muted-foreground font-normal">
            (What problem do you solve? For whom?)
          </span>
          {isMissionComplete && (
            <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
          )}
        </Label>
        <ProcessingTextarea
          id="mission"
          placeholder="We're on a mission to [problem you solve] by [how you solve it] to help [target audience] achieve [specific impact]."
          value={mission}
          onChange={handleMissionChange}
          rows={3}
          isProcessing={isMagicHappening}
          processingType={getProcessingType()}
          disabled={disabled}
          className={cn(
            'font-mono text-sm',
            isMissionComplete && 'border-green-500/50'
          )}
        />
      </div>

      {/* Values Section */}
      <div className="space-y-2">
        <Label htmlFor="values" className="text-sm font-medium flex items-center gap-2">
          <span className="text-lg">💎</span>
          Company Values
          <span className="text-xs text-muted-foreground font-normal">
            (2-4 specific values, not generic)
          </span>
          {isValuesComplete && (
            <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
          )}
        </Label>
        <ProcessingTextarea
          id="values"
          placeholder="We value [value 1], [value 2], and [value 3]. Our team believes in [specific principle]."
          value={values}
          onChange={handleValuesChange}
          rows={3}
          isProcessing={isMagicHappening}
          processingType={getProcessingType()}
          disabled={disabled}
          className={cn(
            'font-mono text-sm',
            isValuesComplete && 'border-green-500/50'
          )}
        />
      </div>

      {/* Overview Section */}
      <div className="space-y-2">
        <Label htmlFor="overview" className="text-sm font-medium flex items-center gap-2">
          <span className="text-lg">🏢</span>
          Company Overview
          <span className="text-xs text-muted-foreground font-normal">
            (Team size, stage, business model, tech stack)
          </span>
          {isOverviewComplete && (
            <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
          )}
        </Label>
        <ProcessingTextarea
          id="overview"
          placeholder="We're a [size]-person team in the [stage] stage, building [business model] for [industry]. We use [specific technologies/tools]."
          value={overview}
          onChange={handleOverviewChange}
          rows={3}
          isProcessing={isMagicHappening}
          processingType={getProcessingType()}
          disabled={disabled}
          className={cn(
            'font-mono text-sm',
            isOverviewComplete && 'border-green-500/50'
          )}
        />
      </div>

      {/* Progress and character count helper */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Progress:</span>
            <div className="flex items-center gap-1">
              {[isNameComplete, isMissionComplete, isValuesComplete, isOverviewComplete].map((complete, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'h-2 w-6 rounded-full transition-all duration-300',
                    complete ? 'bg-green-600' : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {[isNameComplete, isMissionComplete, isValuesComplete, isOverviewComplete].filter(Boolean).length}/4
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-muted-foreground">
            {(mission + values + overview).length} characters
          </span>
          {(mission + values + overview).length > 0 &&
            (mission + values + overview).length < 200 && (
              <span className="text-amber-600">Min. 200 recommended</span>
            )}
        </div>
        <CompanyDescriptionGuide />
      </div>
    </div>
  );
}

// Helper function to parse a description back into sections
function parseDescription(description: string): {
  mission: string;
  values: string;
  overview: string;
} {
  const result = { mission: '', values: '', overview: '' };

  // Try to find section markers
  const missionMatch = description.match(/🎯[^💎🏢]*/);
  const valuesMatch = description.match(/💎[^🎯🏢]*/);
  const overviewMatch = description.match(/🏢[^🎯💎]*/);

  if (missionMatch) {
    result.mission = missionMatch[0]
      .replace('🎯', '')
      .replace(/Company Mission:?/i, '')
      .trim();
  }

  if (valuesMatch) {
    result.values = valuesMatch[0]
      .replace('💎', '')
      .replace(/Company Values:?/i, '')
      .trim();
  }

  if (overviewMatch) {
    result.overview = overviewMatch[0]
      .replace('🏢', '')
      .replace(/Company Overview:?/i, '')
      .trim();
  }

  // If no markers found, treat as single mission statement
  if (!missionMatch && !valuesMatch && !overviewMatch && description.trim()) {
    result.mission = description.trim();
  }

  return result;
}

// Helper function to combine sections into formatted description
function combineDescription(mission: string, values: string, overview: string): string {
  const parts: string[] = [];

  if (mission.trim()) {
    parts.push(`🎯 Company Mission\n${mission.trim()}`);
  }

  if (values.trim()) {
    parts.push(`💎 Company Values\n${values.trim()}`);
  }

  if (overview.trim()) {
    parts.push(`🏢 Company Overview\n${overview.trim()}`);
  }

  return parts.join('\n\n');
}
