'use client';

import * as React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  PanelLeft,
  PanelRight,
  Settings,
  Layout,
  Maximize2,
  Minimize2,
  Menu,
  X,
  Sparkles,
  Users,
  RotateCcw
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Splitter } from '@/components/ui/splitter';

type WorkflowMode = 'generation' | 'candidate-evaluation';

interface ResizableWorkflowLayoutProps {
  leftPanel: React.ReactNode;
  mainContent: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
  onModeChange?: (mode: WorkflowMode) => void;
  onResetContext?: () => void;
}

interface LayoutState {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  isMobile: boolean;
  showMobileLeft: boolean;
  showMobileRight: boolean;
  leftPanelSize: number;
  rightPanelSize: number;
  workflowMode: WorkflowMode;
}

const MOBILE_BREAKPOINT = 768;

export function ResizableWorkflowLayout({
  leftPanel,
  mainContent,
  rightPanel,
  className,
  onModeChange,
  onResetContext
}: ResizableWorkflowLayoutProps) {
  const [state, setState] = React.useState<LayoutState>({
    leftCollapsed: false,
    rightCollapsed: false,
    isMobile: false,
    showMobileLeft: false,
    showMobileRight: false,
    leftPanelSize: 25,
    rightPanelSize: 25,
    workflowMode: 'generation',
  });

  const [isHydrated, setIsHydrated] = React.useState(false);

  // Handle hydration
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle mobile responsiveness
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setState(prev => ({ ...prev, isMobile }));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle panel collapse/expand
  const toggleLeftPanel = React.useCallback(() => {
    if (state.isMobile) {
      setState(prev => ({ ...prev, showMobileLeft: !prev.showMobileLeft }));
    } else {
      setState(prev => {
        const newLeftCollapsed = !prev.leftCollapsed;
        let newLeftSize: number;

        if (newLeftCollapsed) {
          // Collapsing - set to 0 (truly collapsed)
          newLeftSize = 0;
        } else {
          // Expanding - restore to a reasonable size that doesn't exceed limits
          if (prev.rightCollapsed) {
            // Right panel is collapsed, so we can use more space
            newLeftSize = 35;
          } else {
            // Right panel is expanded, use standard size
            newLeftSize = prev.leftPanelSize === 0 ? 25 : prev.leftPanelSize;
          }
        }

        // Prevent both panels from being collapsed at the same time
        if (newLeftCollapsed && prev.rightCollapsed) {
          return prev;
        }

        return {
          ...prev,
          leftCollapsed: newLeftCollapsed,
          leftPanelSize: newLeftSize,
        };
      });
    }
  }, [state.isMobile]);

  const toggleRightPanel = React.useCallback(() => {
    if (state.isMobile) {
      setState(prev => ({ ...prev, showMobileRight: !prev.showMobileRight }));
    } else {
      setState(prev => {
        const newRightCollapsed = !prev.rightCollapsed;
        let newRightSize: number;

        if (newRightCollapsed) {
          // Collapsing - set to 0 (truly collapsed)
          newRightSize = 0;
        } else {
          // Expanding - restore to a reasonable size that doesn't exceed limits
          if (prev.leftCollapsed) {
            // Left panel is collapsed, so we can use more space
            newRightSize = 35;
          } else {
            // Left panel is expanded, use standard size
            newRightSize = prev.rightPanelSize === 0 ? 25 : prev.rightPanelSize;
          }
        }

        // Prevent both panels from being collapsed at the same time
        if (newRightCollapsed && prev.leftCollapsed) {
          return prev;
        }

        return {
          ...prev,
          rightCollapsed: newRightCollapsed,
          rightPanelSize: newRightSize,
        };
      });
    }
  }, [state.isMobile]);

  // Handle panel size changes from manual resizing
  const handlePanelSizeChange = React.useCallback((sizes: number[] | undefined) => {
    if (!sizes || sizes.length < 3) return;

    const leftSize = sizes[0];
    const rightSize = sizes[2];

    setState(prev => ({
      ...prev,
      leftPanelSize: leftSize,
      rightPanelSize: rightSize,
      leftCollapsed: leftSize === 0,
      rightCollapsed: rightSize === 0,
    }));
  }, []);

  // Handle workflow mode toggle
  const toggleWorkflowMode = React.useCallback(() => {
    setState(prev => {
      const newMode = prev.workflowMode === 'generation' ? 'candidate-evaluation' : 'generation';
      onModeChange?.(newMode);
      return {
        ...prev,
        workflowMode: newMode,
      };
    });
  }, [onModeChange]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            toggleLeftPanel();
            break;
          case 'j':
            e.preventDefault();
            toggleRightPanel();
            break;
          case 'm':
            e.preventDefault();
            toggleWorkflowMode();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftPanel, toggleRightPanel, toggleWorkflowMode]);



  // Prevent hydration mismatch by showing loading state
  if (!isHydrated) {
    return (
      <div className={cn('h-screen w-full flex flex-col', className)}>
        <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-muted-foreground" />
            <h1 className="font-semibold">Ohriv Demo Center</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading workflow...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.isMobile) {
    return (
      <div className={cn('h-screen w-full flex flex-col', className)}>
        {/* Mobile header */}
        <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLeftPanel}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Logo className="h-6 w-6 mr-2" />
            <div className='flex flex-col'>
              <h1 className="font-semibold">Ohriv Demo Center</h1>
              <span className="text-xs max-[360px]:hidden">AI powered company-to-interview demonstration</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleWorkflowMode}
              className="h-8 w-8"
            >
              {state.workflowMode === 'generation' ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
            </Button>
            <Splitter orientation="vertical" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRightPanel}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          {mainContent}
        </div>

        {/* Mobile overlays */}
        {state.showMobileLeft && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setState(prev => ({ ...prev, showMobileLeft: false }))}
            />

            {/* Slide-in panel */}
            <div className="absolute top-0 h-full w-80 bg-background shadow-xl left-0 transition-transform duration-300 ease-in-out">
              <div className="flex h-14 items-center justify-between border-b px-4">
                <span className="font-semibold text-sm">Company Context</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setState(prev => ({ ...prev, showMobileLeft: false }))}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                {leftPanel}
              </ScrollArea>
            </div>
          </div>
        )}

        {state.showMobileRight && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setState(prev => ({ ...prev, showMobileRight: false }))}
            />

            {/* Slide-in panel */}
            <div className="absolute top-0 h-full w-80 bg-background shadow-xl right-0 transition-transform duration-300 ease-in-out">
              <div className="flex h-14 items-center justify-between border-b px-4">
                <span className="font-semibold text-sm">Execution</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setState(prev => ({ ...prev, showMobileRight: false }))}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                {rightPanel}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('h-screen w-full flex flex-col', className)}>
      {/* Desktop header with controls */}
      <div className="flex h-14 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo className="h-6 w-6" />
            <div className='flex items-center gap-2'>
              <h1 className="font-semibold">Ohriv Demo Center</h1>
              <span className='text-xs'>AI powered company-to-interview demonstration</span>
            </div>
          </div>


        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Button
                variant={state.workflowMode === 'generation' ? 'primary' : 'outline'}
                size="sm"
                className="h-8 px-2"
                onClick={toggleWorkflowMode}
              >
                {state.workflowMode === 'generation' ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Generation Mode
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-1" />
                    Candidate Evaluation
                  </>
                )}
              </Button>
              <Splitter orientation="vertical" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLeftPanel}
                className={cn(
                  'h-8 px-2',
                  state.leftCollapsed && 'text-muted-foreground'
                )}
              >
                <PanelLeft className="h-4 w-4 mr-1" />
                Context
                {state.leftCollapsed ? <Maximize2 className="h-3 w-3 ml-1" /> : <Minimize2 className="h-3 w-3 ml-1" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRightPanel}
                className={cn(
                  'h-8 px-2',
                  state.rightCollapsed && 'text-muted-foreground'
                )}
              >
                <PanelRight className="h-4 w-4 mr-1" />
                Execution
                {state.rightCollapsed ? <Maximize2 className="h-3 w-3 ml-1" /> : <Minimize2 className="h-3 w-3 ml-1" />}
              </Button>

              <Splitter orientation="vertical" />

              {onResetContext && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetContext}
                  className="h-8 px-2 text-muted-foreground hover:text-destructive transition-colors"
                  title="Clear context and reset to blank slate"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}

              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Resizable panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          key={`${state.leftCollapsed}-${state.rightCollapsed}`}
          direction="horizontal"
          className="h-full"
          onLayout={handlePanelSizeChange}
        >
          {/* Left Panel */}
          <ResizablePanel
            defaultSize={state.leftPanelSize}
            minSize={0}
            maxSize={40}
          >
            <div className={cn(
              "h-full flex flex-col relative bg-background",
              state.leftCollapsed ? "min-w-0" : "min-w-[240px]"
            )}>
              {leftPanel}

              {/* Expand button for collapsed left panel */}
              {state.leftCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLeftPanel}
                    className="h-16 w-6 rounded-r-lg rounded-l-none border-l-0 shadow-lg"
                    style={{ marginLeft: '-1px' }}
                  >
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content */}
          <ResizablePanel
            defaultSize={100 - state.leftPanelSize - state.rightPanelSize}
            minSize={30}
          >
            <div className="h-full overflow-hidden">
              {mainContent}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel */}
          <ResizablePanel
            defaultSize={state.rightPanelSize}
            minSize={0}
            maxSize={40}
          >
            <div className={cn(
              "h-full flex flex-col relative bg-background",
              state.rightCollapsed ? "min-w-0" : "min-w-[240px]"
            )}>
              {rightPanel}

              {/* Expand button for collapsed right panel */}
              {state.rightCollapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleRightPanel}
                    className="h-16 w-6 rounded-l-lg rounded-r-none border-r-0 shadow-lg"
                    style={{ marginRight: '-1px' }}
                  >
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

// Export individual panel components for use in other layouts
export { ResizablePanel, ResizablePanelGroup, ResizableHandle };