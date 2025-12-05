'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Briefcase } from 'lucide-react';
import { PLATFORM_JOB_LEVELS } from '@/app/(demos)/ai-test/_utils/preset-job-levels';
import { cn } from '@/lib/utils';

interface InlineRoleLevelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function InlineRoleLevelSelector({ value, onChange, className }: InlineRoleLevelSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-9 gap-2', className)}
        >
          <Briefcase className="h-4 w-4" />
          <span className="text-sm">
            {value || 'Select Level'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
            Platform Job Levels
          </div>

          {/* Platform Job Levels */}
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {PLATFORM_JOB_LEVELS.map((level) => (
              <button
                key={level.name}
                onClick={() => handleSelect(level.name)}
                className={cn(
                  'w-full text-left p-2.5 rounded-md hover:bg-accent transition-colors border-2',
                  value === level.name
                    ? 'bg-accent border-primary'
                    : 'border-transparent hover:border-muted'
                )}
              >
                <div className="font-medium text-sm">{level.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {level.description}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-2 mt-3">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Platform Levels:</strong> These 12 standardized levels ensure consistent AI-generated questions and scoring across all positions.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
