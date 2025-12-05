'use client';

import * as React from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SIDEBAR_WIDTH = "20rem";
const SIDEBAR_WIDTH_COLLAPSED = "0rem";

type SidebarState = 'expanded' | 'collapsed';

interface DualSidebarContextProps {
  leftState: SidebarState;
  rightState: SidebarState;
  toggleLeft: () => void;
  toggleRight: () => void;
  setLeftState: (state: SidebarState) => void;
  setRightState: (state: SidebarState) => void;
}

const DualSidebarContext = React.createContext<DualSidebarContextProps | null>(null);

export function useDualSidebar() {
  const context = React.useContext(DualSidebarContext);
  if (!context) {
    throw new Error('useDualSidebar must be used within DualSidebarProvider');
  }
  return context;
}

interface DualSidebarProviderProps {
  children: React.ReactNode;
  defaultLeftOpen?: boolean;
  defaultRightOpen?: boolean;
}

export function DualSidebarProvider({
  children,
  defaultLeftOpen = true,
  defaultRightOpen = false,
}: DualSidebarProviderProps) {
  const [leftState, setLeftState] = React.useState<SidebarState>(
    defaultLeftOpen ? 'expanded' : 'collapsed'
  );
  const [rightState, setRightState] = React.useState<SidebarState>(
    defaultRightOpen ? 'expanded' : 'collapsed'
  );

  const toggleLeft = React.useCallback(() => {
    setLeftState(prev => prev === 'expanded' ? 'collapsed' : 'expanded');
  }, []);

  const toggleRight = React.useCallback(() => {
    setRightState(prev => prev === 'expanded' ? 'collapsed' : 'expanded');
  }, []);

  const contextValue = React.useMemo<DualSidebarContextProps>(
    () => ({
      leftState,
      rightState,
      toggleLeft,
      toggleRight,
      setLeftState,
      setRightState,
    }),
    [leftState, rightState, toggleLeft, toggleRight]
  );

  return (
    <DualSidebarContext.Provider value={contextValue}>
      <div className="flex h-screen w-full overflow-hidden">
        {children}
      </div>
    </DualSidebarContext.Provider>
  );
}

interface SidebarProps {
  side: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function DualSidebar({ side, children, className }: SidebarProps) {
  const { leftState, rightState } = useDualSidebar();
  const isExpanded = side === 'left' ? leftState === 'expanded' : rightState === 'expanded';

  return (
    <aside
      data-side={side}
      data-state={isExpanded ? 'expanded' : 'collapsed'}
      style={{
        width: isExpanded ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_COLLAPSED,
      }}
      className={cn(
        'relative flex flex-col bg-background transition-all duration-300 ease-in-out',
        side === 'left' && 'border-r',
        side === 'right' && 'border-l',
        !isExpanded && 'overflow-hidden',
        className
      )}
    >
      <div className={cn(
        'flex h-full flex-col',
        !isExpanded && 'invisible'
      )}>
        {children}
      </div>
    </aside>
  );
}

export function DualSidebarHeader({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex h-14 items-center border-b px-4', className)}>
      {children}
    </div>
  );
}

export function DualSidebarContent({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-4', className)}>
      {children}
    </div>
  );
}

export function DualSidebarFooter({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-t p-4', className)}>
      {children}
    </div>
  );
}

interface SidebarTriggerProps {
  side: 'left' | 'right';
  className?: string;
}

export function DualSidebarTrigger({ side, className }: SidebarTriggerProps) {
  const { leftState, rightState, toggleLeft, toggleRight } = useDualSidebar();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isExpanded = side === 'left' ? leftState === 'expanded' : rightState === 'expanded';
  const toggle = side === 'left' ? toggleLeft : toggleRight;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn('h-9 w-9', className)}
      aria-label={`Toggle ${side} sidebar`}
    >
      {side === 'left' ? (
        <PanelLeft className="h-4 w-4" />
      ) : (
        <PanelRight className="h-4 w-4" />
      )}
    </Button>
  );
}

export function DualSidebarInset({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={cn('flex-1 overflow-auto', className)}>
      {children}
    </main>
  );
}
