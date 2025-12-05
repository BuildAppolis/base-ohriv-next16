/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { X, Plus, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { CompanyValue } from '@/app/(demos)/ai-test/_types/generation-types';
import dynamic from 'next/dynamic';

// Import emoji picker dynamically to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 animate-pulse bg-muted rounded" />
});

interface EnhancedValueInputProps {
  values: CompanyValue[];
  onChange: (values: CompanyValue[]) => void;
  className?: string;
}

const DEFAULT_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#14B8A6', '#6366F1', '#F97316', '#EF4444', '#84CC16'
];

// Convert to Title Case (capitalize each word)
function toTitleCase(str: string): string {
  return str.toLowerCase().split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export function EnhancedValueInput({ values, onChange, className }: EnhancedValueInputProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<{ type: 'edit' | 'new'; index?: number } | null>(null);
  const [isEmojiPickerDialogOpen, setIsEmojiPickerDialogOpen] = useState(false);
  const [newValue, setNewValue] = useState<CompanyValue>({
    name: '',
    description: '',
    color: DEFAULT_COLORS[0],
    icon: '⭐',
    weight: 10
  });

  const handleAdd = () => {
    // Enforce maximum 8 company values
    if (values.length >= 8) {
      return;
    }

    if (newValue.name.trim() && newValue.description.trim()) {
      onChange([...values, newValue]);
      setNewValue({
        name: '',
        description: '',
        color: DEFAULT_COLORS[0],
        icon: '⭐',
        weight: 10
      });
      setIsAddingNew(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updated: CompanyValue) => {
    const newValues = [...values];
    newValues[index] = updated;
    onChange(newValues);
    setEditingIndex(null);
  };

  const handleEmojiSelect = (emoji: any) => {
    if (emojiPickerOpen?.type === 'edit' && emojiPickerOpen.index !== undefined) {
      handleUpdate(emojiPickerOpen.index, { ...values[emojiPickerOpen.index], icon: emoji.emoji });
    } else if (emojiPickerOpen?.type === 'new') {
      setNewValue({ ...newValue, icon: emoji.emoji });
    }
    setEmojiPickerOpen(null);
    setIsEmojiPickerDialogOpen(false);
  };

  const openEmojiPicker = (type: 'edit' | 'new', index?: number) => {
    setEmojiPickerOpen({ type, index });
    setIsEmojiPickerDialogOpen(true);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Existing Values */}
      {values.map((value, index) => (
        <Card key={index} className="border-2">
          <CardContent className="p-3">
            {editingIndex === index ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Value name"
                    value={value.name}
                    onChange={(e) => handleUpdate(index, { ...value, name: toTitleCase(e.target.value) })}
                    className="text-sm capitalize"
                  />
                  <div className="flex items-center gap-2">
                    {/* Current Emoji Display */}
                    <div
                      className="w-8 h-8 rounded border-2 border-muted flex items-center justify-center text-lg cursor-pointer hover:border-primary transition-colors"
                      onClick={() => openEmojiPicker('edit', index)}
                    >
                      {value.icon}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEmojiPicker('edit', index)}
                      className="h-8 px-2"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="Description"
                  value={value.description}
                  onChange={(e) => handleUpdate(index, { ...value, description: e.target.value })}
                  className="text-sm min-h-[60px]"
                />
                {/* Color Picker */}
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground">Color:</span>
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleUpdate(index, { ...value, color })}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        value.color === color ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingIndex(null)}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: value.color + '20' }}
                >
                  {value.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 capitalize">{value.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{value.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingIndex(index)}
                    className="h-8 px-2"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(index)}
                    className="h-8 px-2 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add New Value */}
      {isAddingNew ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Value name"
                value={newValue.name}
                onChange={(e) => setNewValue({ ...newValue, name: toTitleCase(e.target.value) })}
                className="text-sm capitalize"
              />
              <div className="flex items-center gap-2">
                {/* Current Emoji Display */}
                <div
                  className="w-8 h-8 rounded border-2 border-muted flex items-center justify-center text-lg cursor-pointer hover:border-primary transition-colors"
                  onClick={() => openEmojiPicker('new')}
                >
                  {newValue.icon}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEmojiPicker('new')}
                  className="h-8 px-2"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Description of this value"
              value={newValue.description}
              onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
              className="text-sm min-h-[60px]"
            />
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Color:</span>
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewValue({ ...newValue, color })}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 transition-all',
                    newValue.color === color ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!newValue.name.trim() || !newValue.description.trim()}>
                Add Value
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="w-full border-dashed"
            disabled={values.length >= 8}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company Value
          </Button>
          {values.length >= 8 && (
            <p className="text-xs text-muted-foreground text-center">
              Maximum of 8 company values reached. Remove a value to add another.
            </p>
          )}
        </>
      )}

      {values.length === 0 && !isAddingNew && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No company values defined yet. Click &quot;Add Company Value&quot; to get started.
        </p>
      )}

      {/* Emoji Picker Dialog */}
      <Dialog open={isEmojiPickerDialogOpen} onOpenChange={setIsEmojiPickerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an Emoji</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              lazyLoadEmojis={true}
              searchPlaceholder="Search emoji..."
              width={320}
              height={400}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
