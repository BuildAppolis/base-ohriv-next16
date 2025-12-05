'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

// Forward ref for Card
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
);
Card.displayName = 'Card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider, SliderThumb } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, GripVertical, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GeneratedAttribute {
  id: string; // Unique identifier for sorting and keying
  name: string;
  description: string;
  category: "KNOWLEDGE" | "SKILL" | "ABILITY" | "VALUE"; // KSA Framework
  icon: string;
  color: string;
  weight: number;
  subAttributes?: Array<{
    name: string;
    description: string;
  }>;
}

interface AttributeEditorProps {
  attributes: GeneratedAttribute[];
  onAttributesChange: (updated: GeneratedAttribute[]) => void;
}

interface SortableAttributeCardProps {
  attribute: GeneratedAttribute;
  isLocked: boolean;
  onToggleLock: () => void;
  onWeightChange: (weight: number) => void;
}

function SortableAttributeCard({
  attribute,
  isLocked,
  onToggleLock,
  onWeightChange,
}: SortableAttributeCardProps) {
  const {
    attributes: dndAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attribute.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Category styling
  const categoryStyles = {
    KNOWLEDGE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    SKILL: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    ABILITY: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    VALUE: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  };

  const categoryStyle = categoryStyles[attribute.category];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'overflow-hidden transition-shadow',
        isDragging && 'shadow-lg ring-2 ring-primary'
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with drag handle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Drag Handle */}
            <button
              type="button"
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded mt-1"
              {...dndAttributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Attribute Info */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-base">{attribute.name}</span>
                <Badge variant="outline" className={cn('text-xs', categoryStyle)}>
                  {attribute.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{attribute.description}</p>

              {/* Sub-attributes */}
              {attribute.subAttributes && attribute.subAttributes.length > 0 && (
                <div className="mt-2 pt-2 border-t space-y-1">
                  {attribute.subAttributes.map((sub, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-medium text-muted-foreground">• {sub.name}:</span>{' '}
                      <span className="text-muted-foreground/80">{sub.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weight Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onToggleLock}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                isLocked
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'hover:bg-muted text-muted-foreground'
              )}
              title={isLocked ? 'Unlock weight' : 'Lock weight'}
            >
              {isLocked ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <Unlock className="w-3.5 h-3.5" />
              )}
            </button>

            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="0"
                max="100"
                value={attribute.weight}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  onWeightChange(Math.min(100, Math.max(0, value)));
                }}
                className="w-16 h-8 text-center"
                disabled={isLocked}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Weight Slider */}
        <Slider
          value={[attribute.weight]}
          onValueChange={([value]) => onWeightChange(value)}
          max={100}
          step={1}
          disabled={isLocked}
          className="flex-1"
        >
          <SliderThumb />
        </Slider>
      </CardContent>
    </Card>
  );
}

export function AttributeEditor({ attributes, onAttributesChange }: AttributeEditorProps) {
  const [lockedAttributes, setLockedAttributes] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = attributes.findIndex((attr) => attr.id === active.id);
      const newIndex = attributes.findIndex((attr) => attr.id === over.id);

      const reordered = arrayMove(attributes, oldIndex, newIndex);
      onAttributesChange(reordered);
    }
  };

  const toggleLock = (attributeId: string) => {
    setLockedAttributes((prev) => {
      const updated = new Set(prev);
      if (updated.has(attributeId)) {
        updated.delete(attributeId);
      } else {
        updated.add(attributeId);
      }
      return updated;
    });
  };

  const updateWeight = (attributeId: string, newWeight: number) => {
    const oldWeight = attributes.find((a) => a.id === attributeId)?.weight || 0;
    const diff = newWeight - oldWeight;

    // Calculate new weights with auto-balancing
    const updated = attributes.map((attr) => {
      if (attr.id === attributeId) {
        return { ...attr, weight: newWeight };
      }
      return attr;
    });

    // Auto-balance unlocked attributes
    const unlockedAttributes = updated.filter(
      (attr) => attr.id !== attributeId && !lockedAttributes.has(attr.id)
    );

    if (unlockedAttributes.length > 0 && Math.abs(diff) > 0) {
      const adjustmentPerAttr = -diff / unlockedAttributes.length;

      unlockedAttributes.forEach((attr) => {
        const adjustedWeight = Math.max(0, Math.min(100, attr.weight + adjustmentPerAttr));
        const index = updated.findIndex((a) => a.id === attr.id);
        updated[index] = { ...updated[index], weight: Math.round(adjustedWeight) };
      });
    }

    // Ensure total is exactly 100
    const total = updated.reduce((sum, a) => sum + a.weight, 0);
    if (total !== 100 && updated.length > 0) {
      // Find the largest unlocked weight to adjust
      const unlockedToAdjust = updated.filter((a) => !lockedAttributes.has(a.id));
      if (unlockedToAdjust.length > 0) {
        const maxUnlocked = unlockedToAdjust.reduce((max, a) =>
          a.weight > max.weight ? a : max
        );
        const index = updated.findIndex((a) => a.id === maxUnlocked.id);
        updated[index] = {
          ...updated[index],
          weight: maxUnlocked.weight + (100 - total),
        };
      }
    }

    onAttributesChange(updated);
  };

  const totalWeight = attributes.reduce((sum, a) => sum + a.weight, 0);
  const isValid = totalWeight === 100;

  // KSA Distribution Summary
  const ksaDistribution = {
    KNOWLEDGE: attributes.filter((a) => a.category === 'KNOWLEDGE').reduce((sum, a) => sum + a.weight, 0),
    SKILL: attributes.filter((a) => a.category === 'SKILL').reduce((sum, a) => sum + a.weight, 0),
    ABILITY: attributes.filter((a) => a.category === 'ABILITY').reduce((sum, a) => sum + a.weight, 0),
    VALUE: attributes.filter((a) => a.category === 'VALUE').reduce((sum, a) => sum + a.weight, 0),
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customize Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KSA Distribution Summary */}
          <div className="p-3 bg-muted/50 rounded-lg border">
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              KSA Framework Distribution:
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['KNOWLEDGE', 'SKILL', 'ABILITY', 'VALUE'] as const).map((category) => {
                const categoryStyles = {
                  KNOWLEDGE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  SKILL: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                  ABILITY: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                  VALUE: 'bg-green-500/10 text-green-600 dark:text-green-400',
                };

                return (
                  <div
                    key={category}
                    className={cn('p-2 rounded text-center text-xs', categoryStyles[category])}
                  >
                    <div className="font-medium">{category.charAt(0)}</div>
                    <div className="font-bold">{Math.round(ksaDistribution[category])}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Weight Status */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium">Total Weight:</span>
            <Badge variant={isValid ? 'primary' : 'destructive'}>{totalWeight}%</Badge>
          </div>

          {!isValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Weights must total exactly 100%. Currently: {totalWeight}%
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sortable Attributes List */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Drag to reorder • Adjust weights • Lock to prevent changes
        </p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={attributes.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            {attributes.map((attribute) => (
              <SortableAttributeCard
                key={attribute.id}
                attribute={attribute}
                isLocked={lockedAttributes.has(attribute.id)}
                onToggleLock={() => toggleLock(attribute.id)}
                onWeightChange={(weight) => updateWeight(attribute.id, weight)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
