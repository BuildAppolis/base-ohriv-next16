'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { EmojiRenderer } from '@/components/emoji-icon/emoji-picker';
import EmojiPicker from 'emoji-picker-react';
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Lock,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanyStage } from '@/app/(demos)/ai-test/_types/generation-types';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Color options for stage customization
const COLOR_OPTIONS = [
  { value: '#f59e0b', label: 'Amber' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#10b981', label: 'Green' },
  { value: '#f97316', label: 'Orange' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#6b7280', label: 'Gray' },
  { value: '#ef4444', label: 'Red' },
];

// Default stages (matching server-side DEFAULT_STAGES)
const DEFAULT_STAGES: CompanyStage[] = [
  {
    id: 'default-1',
    name: 'Recruiter Screening',
    description: 'Initial review of resume, cover letter, and application materials to assess basic qualifications',
    order: 1,
    color: '#f59e0b',
    icon: '🔍',
    isDefault: true,
    isSystemDefault: true,
    canDelete: false,
    canReorder: false,
    questionsEnabled: true,
  },
  {
    id: 'default-2',
    name: 'Manager Interview',
    description: 'Evaluation with the hiring manager to assess role fit, technical skills, and team compatibility',
    order: 2,
    color: '#3b82f6',
    icon: '👔',
    isDefault: true,
    isSystemDefault: true,
    canDelete: false,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: 'default-3',
    name: 'Panel Interview',
    description: 'Comprehensive evaluation with multiple team members to assess technical skills, cultural fit, and collaboration abilities',
    order: 3,
    color: '#8b5cf6',
    icon: '👥',
    isDefault: true,
    isSystemDefault: true,
    canDelete: false,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: 'default-4',
    name: 'Phone Interview',
    description: 'Initial phone or video screening to verify basic qualifications and interest level',
    order: 4,
    color: '#10b981',
    icon: '📱',
    isDefault: true,
    isSystemDefault: false,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: 'default-5',
    name: 'Technical Assessment',
    description: 'Skills evaluation through coding challenges, technical tests, or portfolio review',
    order: 5,
    color: '#f97316',
    icon: '💻',
    isDefault: true,
    isSystemDefault: false,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: 'default-6',
    name: 'Executive Review',
    description: 'Final interview with senior leadership for strategic roles or high-level positions',
    order: 6,
    color: '#ec4899',
    icon: '⭐',
    isDefault: true,
    isSystemDefault: false,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: 'default-7',
    name: 'Reference Check',
    description: 'Verification of candidate background, experience, and performance with previous employers',
    order: 7,
    color: '#14b8a6',
    icon: '✓',
    isDefault: true,
    isSystemDefault: false,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
  {
    id: 'default-8',
    name: 'Offer Extended',
    description: 'Formal job offer has been extended to the candidate',
    order: 8,
    color: '#84cc16',
    icon: '🎉',
    isDefault: true,
    isSystemDefault: false,
    canDelete: true,
    canReorder: true,
    questionsEnabled: true,
  },
];

interface StageConfigurationProps {
  stages?: CompanyStage[];
  onStagesChange: (stages: CompanyStage[]) => void;
  onContinue: () => void;
  className?: string;
}

interface SortableStageItemProps {
  stage: CompanyStage;
  onEdit: (stage: CompanyStage) => void;
  onDelete: (id: string) => void;
}

function SortableStageItem({ stage, onEdit, onDelete }: SortableStageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id || stage.name, disabled: !stage.canReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border rounded-lg',
        isDragging && 'opacity-50',
        !stage.canReorder && 'bg-gray-50 dark:bg-gray-800'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'cursor-grab active:cursor-grabbing',
          !stage.canReorder && 'cursor-not-allowed opacity-40'
        )}
      >
        {stage.canReorder ? (
          <GripVertical className="h-5 w-5 text-gray-400" />
        ) : (
          <Lock className="h-5 w-5 text-gray-400" />
        )}
      </div>

      <div
        className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
        style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
      >
        {stage.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{stage.name}</h4>
          {stage.isSystemDefault && (
            <Badge variant="secondary" className="text-xs">
              System
            </Badge>
          )}
        </div>
        {stage.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {stage.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(stage)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {stage.canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(stage.id || stage.name)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function StageConfiguration({
  stages: initialStages,
  onStagesChange,
  onContinue,
}: StageConfigurationProps) {
  const [stages, setStages] = useState<CompanyStage[]>(
    initialStages && initialStages.length > 0 ? initialStages : DEFAULT_STAGES
  );
  const [editingStage, setEditingStage] = useState<CompanyStage | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const hasAutoSavedDefaults = useRef(false);

  // Auto-save stages to context on first load (always save whatever stages we have)
  useEffect(() => {
    if (!hasAutoSavedDefaults.current && stages.length > 0) {
      hasAutoSavedDefaults.current = true;
      console.log('💾 AUTO-SAVING STAGES TO CONTEXT:', {
        stagesLength: stages.length,
        hasInitialStages: !!(initialStages && initialStages.length > 0),
        isUsingDefaults: !initialStages || initialStages.length === 0,
        stages: stages.map(s => s.name)
      });
      onStagesChange(stages);
    }
  }, [initialStages, stages, onStagesChange]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stages.findIndex((s) => (s.id || s.name) === active.id);
      const newIndex = stages.findIndex((s) => (s.id || s.name) === over.id);

      // Don't allow moving the locked stage (Recruiter Screening)
      const movingStage = stages[oldIndex];
      if (movingStage && !movingStage.canReorder) {
        return;
      }

      // Don't allow moving anything to position 0 (reserved for locked stage)
      if (newIndex === 0) {
        return;
      }

      const newStages = arrayMove(stages, oldIndex, newIndex).map((stage, index) => ({
        ...stage,
        order: index + 1,
      }));

      setStages(newStages);
      onStagesChange(newStages);
    }
  };

  const handleEdit = (stage: CompanyStage) => {
    setEditingStage(stage);
  };

  const handleDelete = (id: string) => {
    const newStages = stages
      .filter((s) => (s.id || s.name) !== id)
      .map((stage, index) => ({ ...stage, order: index + 1 }));
    setStages(newStages);
    onStagesChange(newStages);
  };

  const handleSaveEdit = (updatedStage: CompanyStage) => {
    const newStages = stages.map((s) =>
      (s.id || s.name) === (updatedStage.id || updatedStage.name) ? updatedStage : s
    );
    setStages(newStages);
    onStagesChange(newStages);
    setEditingStage(null);
  };

  const handleAddStage = () => {
    const newStage: CompanyStage = {
      id: `custom-${Date.now()}`,
      name: 'New Stage',
      description: '',
      color: '#6b7280',
      icon: '📋',
      order: stages.length + 1,
      isDefault: false,
      isSystemDefault: false,
      canDelete: true,
      canReorder: true,
      questionsEnabled: true,
    };
    setEditingStage(newStage);
    setIsAddingNew(true);
  };

  return (
    <Card className='rounded-none border-none shadow-none'>      {/* <CardHeader>
        <div className="flex items-start justify-between w-full items-center">

          <CardTitle className="flex items-center gap-2">
            Configure Interview Stages

          </CardTitle>

          <Button onClick={handleAddStage} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Stage
          </Button>
        </div>
      </CardHeader> */}
      <CardHeader className='py-4'>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Step 2: Define Company Stages
        </CardTitle>
        <CardDescription>
          Customize the interview stages for your hiring pipeline. You can
          add, edit, delete, and reorder stages to fit your process.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stages.map((s) => s.id || s.name)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {stages.map((stage) => (
                <SortableStageItem
                  key={stage.id || stage.name}
                  stage={stage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {stages.length} stage{stages.length !== 1 ? 's' : ''} configured
          </div>
          <div className='flex items-center gap-4'>
            <Button onClick={handleAddStage} variant={"dim"}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
            <Button onClick={onContinue} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Continue to Position Setup
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <EditStageDialog
        stage={editingStage || DEFAULT_STAGES[0]!}
        isNew={isAddingNew}
        open={!!editingStage}
        onSave={handleSaveEdit}
        onCancel={() => {
          setEditingStage(null);
          setIsAddingNew(false);
        }}
      />
    </Card>
  );
}

interface EditStageDialogProps {
  stage: CompanyStage;
  isNew: boolean;
  open: boolean;
  onSave: (stage: CompanyStage) => void;
  onCancel: () => void;
}

function EditStageDialog({ stage, isNew, open, onSave, onCancel }: EditStageDialogProps) {
  const [name, setName] = useState(stage.name);
  const [description, setDescription] = useState(stage.description || '');
  const [color, setColor] = useState(stage.color);
  const [icon, setIcon] = useState(stage.icon);
  const [questionsEnabled, setQuestionsEnabled] = useState(stage.questionsEnabled ?? true);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // Reset form when stage changes
  useEffect(() => {
    setName(stage.name);
    setDescription(stage.description || '');
    setColor(stage.color);
    setIcon(stage.icon);
    setQuestionsEnabled(stage.questionsEnabled ?? true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.id]);

  const handleSave = () => {
    onSave({
      ...stage,
      name,
      description,
      color,
      icon,
      questionsEnabled,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add New Stage' : 'Edit Stage'}</DialogTitle>
            <DialogDescription>
              {isNew
                ? 'Create a custom stage for your hiring pipeline'
                : 'Update the stage details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stage-name">Stage Name *</Label>
              <Input
                id="stage-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Skills Assessment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage-description">Description</Label>
              <Textarea
                id="stage-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happens in this stage..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  type="button"
                  onClick={() => setEmojiPickerOpen(true)}
                >
                  <EmojiRenderer emoji={icon} />
                  <span className="ml-2">Choose Icon</span>
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      type="button"
                    >
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: color }}
                      />
                      Choose Color
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="grid grid-cols-5 gap-2">
                      {COLOR_OPTIONS.map((colorOption) => (
                        <Button
                          key={colorOption.value}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 border"
                          style={{ backgroundColor: colorOption.value }}
                          onClick={() => setColor(colorOption.value)}
                          type="button"
                        >
                          {color === colorOption.value && (
                            <span className="text-white text-sm">✓</span>
                          )}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Label className="text-xs">Or enter hex color:</Label>
                      <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="#6b7280"
                        className="mt-1 h-8"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Questions Enabled Toggle */}
            <div className="flex items-center justify-between space-x-2 pt-4 border-t">
              <div className="flex-1 space-y-1">
                <Label htmlFor="questions-enabled" className="text-sm font-medium">
                  Generate Questions
                </Label>
                <p className="text-xs text-muted-foreground">
                  {stage.isSystemDefault
                    ? 'System stages always generate questions'
                    : 'Enable AI question generation for this stage'}
                </p>
              </div>
              <Switch
                id="questions-enabled"
                checked={questionsEnabled}
                onCheckedChange={setQuestionsEnabled}
                disabled={stage.isSystemDefault}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {isNew ? 'Add Stage' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an Icon</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setIcon(emojiData.emoji);
                setEmojiPickerOpen(false);
              }}
              width={320}
              height={400}
              lazyLoadEmojis={true}
              searchPlaceholder="Search emoji..."
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
