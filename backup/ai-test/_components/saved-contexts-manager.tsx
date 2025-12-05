/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { useCompanyContexts } from '@/hooks/use-company-contexts';
import type { CompanyContextData } from './company-context-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  Download,
  Search,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

import type { CellResult, PositionWorkData } from '@/lib/atoms/company-contexts';

// Hook to prevent hydration mismatch
function useHydrationGuard() {
  // Use a lazy initializer to check if running on client
  const [isHydrated] = useState(() => typeof window !== 'undefined');
  return isHydrated;
}

interface SavedContextsManagerProps {
  currentContext: CompanyContextData | null;
  cells?: CellResult[];
  positionWork?: PositionWorkData;
  onLoadContext: (context: CompanyContextData, cells?: CellResult[], positionWork?: PositionWorkData) => void;
  className?: string;
}

export function SavedContextsManager({
  currentContext,
  cells,
  positionWork,
  onLoadContext,
  className,
}: SavedContextsManagerProps) {
  const {
    savedContexts,
    currentContextId,
    saveContext,
    updateContext,
    deleteContext,
    selectContext,
    duplicateContext,
  } = useCompanyContexts();

  const isHydrated = useHydrationGuard();

  const [searchQuery, setSearchQuery] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contextToDelete, setContextToDelete] = useState<string | null>(null);

  // Save form state
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  // Filter contexts by search query
  const filteredContexts = savedContexts.filter(
    (ctx: { name: string; description: string; context: { name: string; }; }) =>
      ctx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ctx.context.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!currentContext || !saveName.trim()) return;

    console.log('[SAVED-CONTEXT-MANAGER] Saving context:', {
      name: saveName,
      isUpdate: !!editingId,
      hasCells: !!cells,
      cellCount: cells?.length || 0,
      cellsData: cells,
    });

    if (editingId) {
      // Update existing
      updateContext(editingId, {
        name: saveName,
        description: saveDescription,
        context: currentContext,
        cells,
        positionWork,
      });
    } else {
      // Save new
      const saved = saveContext(saveName, currentContext, saveDescription, cells, positionWork);
      selectContext(saved.id);
    }

    // Reset form
    setSaveName('');
    setSaveDescription('');
    setSaveDialogOpen(false);
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    const context = savedContexts.find((c: { id: string; }) => c.id === id);
    if (!context) return;

    setSaveName(context.name);
    setSaveDescription(context.description || '');
    setEditingId(id);
    setSaveDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setContextToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contextToDelete) {
      deleteContext(contextToDelete);
      setContextToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleLoad = (id: string) => {
    const context = savedContexts.find((c: { id: string; }) => c.id === id);
    if (context) {
      console.log('[SAVED-CONTEXT-MANAGER] Loading context:', {
        id,
        name: context.name,
        hasCells: !!context.cells,
        cellCount: context.cells?.length || 0,
        cellsData: context.cells,
      });
      selectContext(id);
      onLoadContext(context.context, context.cells, context.positionWork);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateContext(id);
  };

  const handleExport = () => {
    const data = JSON.stringify(savedContexts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-contexts-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prevent hydration mismatch by not rendering until fully hydrated
  if (!isHydrated) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Saved Company Contexts</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Save and manage company contexts for later use
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Saved Company Contexts</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Save and manage company contexts for later use
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={savedContexts.length === 0 ? true : false}
            className="flex-1 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>

          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                disabled={!currentContext ? true : false}
                onClick={() => {
                  setEditingId(null);
                  setSaveName(currentContext?.name || '');
                  setSaveDescription('');
                }}
                className="flex-1 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Update Context' : 'Save Company Context'}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? 'Update the name and description for this context'
                    : 'Give this context a name and optional description'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    placeholder="HealthTech Startup"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Textarea
                    placeholder="Context for our Series B healthcare company..."
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSaveDialogOpen(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!saveName.trim() ? true : false}>
                  {editingId ? 'Update' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      {savedContexts.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved contexts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      )}

      {/* Empty State */}
      {savedContexts.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            No saved contexts yet
          </p>
          <p className="text-xs text-muted-foreground">
            Analyze a company description to create your first context
          </p>
        </div>
      )}

      {/* Contexts List */}
      {filteredContexts.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredContexts.map((ctx: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; context: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; industry: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; stage: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; stages: string | any[]; }; cells: string | any[]; positionWork: { roleTitle: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; updatedAt: string | number | Date; }) => (
            <div
              key={ctx.id}
              className={cn(
                'p-3 border rounded-lg hover:bg-muted/50 transition-colors',
                currentContextId === ctx.id && 'border-primary bg-primary/5'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {ctx.name}
                    </h4>
                    {currentContextId === ctx.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>

                  {ctx.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {ctx.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                    {ctx.context.name && (
                      <span className="bg-muted px-2 py-0.5 rounded">
                        {ctx.context.name}
                      </span>
                    )}
                    <span className="bg-muted px-2 py-0.5 rounded">
                      {ctx.context.industry}
                    </span>
                    <span className="bg-muted px-2 py-0.5 rounded">
                      {ctx.context.stage}
                    </span>
                    {ctx.context.stages && ctx.context.stages.length > 0 && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {ctx.context.stages.length} stage{ctx.context.stages.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {ctx.cells && ctx.cells.length > 0 && (
                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                        {ctx.cells.length} generation{ctx.cells.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {ctx.positionWork && ctx.positionWork.roleTitle && (
                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                        Position: {ctx.positionWork.roleTitle}
                      </span>
                    )}
                    <span className="text-xs">
                      • {formatDistanceToNow(new Date(ctx.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Action buttons - compact sidebar layout */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {typeof ctx.id === 'string' && (
                      <>
                        <DropdownMenuItem onClick={() => handleLoad(ctx.id as string)}>
                          Load
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(ctx.id as string)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(ctx.id as string)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(ctx.id as string)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No search results */}
      {savedContexts.length > 0 && filteredContexts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No contexts found</p>
        </div>
      )}

      {/* Context Count */}
      {savedContexts.length > 0 && (
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {savedContexts.length} saved context{savedContexts.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Context?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this saved context. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
