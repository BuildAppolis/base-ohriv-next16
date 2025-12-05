'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SplitterProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Splitter({
  orientation = 'vertical',
  className,
  ...props
}: SplitterProps) {
  return (
    <div
      data-slot="splitter"
      className={cn(
        // Base styles
        'shrink-0 relative',

        // Orientation-specific styles
        orientation === 'vertical'
          ? 'h-8 w-[1px]'
          : 'h-[1px] w-full',

        // Gradient background - middle is primary, edges are transparent
        orientation === 'vertical'
          ? 'bg-gradient-to-b from-transparent via-primary/25 to-transparent'
          : 'bg-gradient-to-r from-transparent via-primary/25 to-transparent',
        className
      )}
      {...props}
    />
  );
}

// Export a default for convenience
export default Splitter;