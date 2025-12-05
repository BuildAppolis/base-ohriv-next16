'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { presetJobLevelCategories } from '@/app/(demos)/ai-test/_utils/preset-job-levels';

interface RoleLevelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RoleLevelSelector({ value, onChange, className }: RoleLevelSelectorProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedCategory, setSelectedCategory] = useState(presetJobLevelCategories[0].name);

  const selectedCategoryData = presetJobLevelCategories.find(c => c.name === selectedCategory);

  return (
    <div className={className}>
      <label className="text-sm font-medium mb-2 block">
        Role Level
        <span className="ml-1 text-xs text-muted-foreground">(Position seniority)</span>
      </label>

      <Tabs value={mode} onValueChange={(v) => setMode(v as 'preset' | 'custom')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preset">Preset</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="preset" className="space-y-2">
          {/* Category Selector */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {presetJobLevelCategories.map((category) => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Selector */}
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{selectedCategoryData?.name}</SelectLabel>
                {selectedCategoryData?.levels.map((level) => (
                  <SelectItem key={level.name} value={level.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{level.name}</span>
                      <span className="text-xs text-muted-foreground">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {value && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Selected: <span className="font-medium">{value}</span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom">
          <Input
            placeholder="e.g., Principal Engineer, Staff Designer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Enter a custom role level or leave blank for AI to infer from job title
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
