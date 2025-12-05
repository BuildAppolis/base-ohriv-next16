'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProcessingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isProcessing?: boolean;
  processingType?: 'default' | 'analysis' | 'generation' | 'enhancement';
}

export function ProcessingInput({
  className,
  isProcessing = false,
  processingType = 'default',
  disabled,
  ...props
}: ProcessingInputProps) {
  const getProcessingColors = () => {
    switch (processingType) {
      case 'analysis':
        return 'from-primary/5 via-primary/10 to-ring/10 dark:from-primary/10 dark:via-primary/15 dark:to-ring/15';
      case 'generation':
        return 'from-ring/5 via-primary/10 to-primary/5 dark:from-ring/10 dark:via-primary/15 dark:to-primary/10';
      case 'enhancement':
        return 'from-primary/5 via-ring/10 to-primary/10 dark:from-primary/10 dark:via-ring/15 dark:to-primary/15';
      default:
        return 'from-primary/5 via-primary/10 to-ring/10 dark:from-primary/10 dark:via-primary/15 dark:to-ring/15';
    }
  };

  const getProcessingLabel = () => {
    switch (processingType) {
      case 'analysis':
        return 'Analyzing...';
      case 'generation':
        return 'Generating...';
      case 'enhancement':
        return 'Enhancing...';
      default:
        return 'Processing...';
    }
  };

  // Generate random positions for particles once
  const [particlePositions] = React.useState(() =>
    Array.from({ length: 6 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`
    }))
  );

  return (
    <div className="relative">
      {/* Main Input */}
      <Input
        className={cn(
          'transition-all duration-300',
          isProcessing && [
            'bg-gradient-to-r ' + getProcessingColors(),
            'border-ring/50 dark:border-primary/50',
            'animate-pulse',
            'text-transparent select-none',
            'cursor-not-allowed'
          ],
          className
        )}
        disabled={disabled || isProcessing}
        {...props}
      />

      {/* Processing Overlay */}
      {isProcessing && (
        <>
          {/* Animated gradient background */}
          <div
            className={cn(
              'absolute inset-0 rounded-md',
              'bg-gradient-to-r ' + getProcessingColors(),
              'animate-pulse',
              'backdrop-blur-sm',
              'border border-ring/30 dark:border-primary/30'
            )}
          />

          {/* Backdrop blur overlay */}
          <div
            className="absolute inset-0 rounded-md backdrop-blur-[2px]"
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, oklch(45% 0.12 233.69 / 0.1) 100%)'
            }}
          />

          {/* Animated particles */}
          <div className="absolute inset-0 rounded-md overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full">
              {particlePositions.map((pos, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                >
                  <div
                    className="h-2 w-2 bg-ring/60 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Processing label */}
          <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
            <div className="text-xs font-medium text-primary dark:text-ring text-center animate-pulse">
              {getProcessingLabel()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}