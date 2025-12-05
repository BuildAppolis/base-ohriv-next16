'use client';

import { useState, useMemo } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { QuestionEditorCard, GeneratedQuestion } from './question-editor-card';
import type { GeneratedAttribute } from './attribute-editor';
import type { CompanyStage } from '@/types/company/generation-types';

interface QuestionEditorProps {
  questions: GeneratedQuestion[];
  attributes: GeneratedAttribute[];
  stages: CompanyStage[];
  onQuestionsChange: (updated: GeneratedQuestion[]) => void;
  onAddQuestion?: () => void;
  onFullEdit?: (question: GeneratedQuestion) => void;
}

export function QuestionEditor({
  questions,
  attributes,
  stages,
  onQuestionsChange,
  onAddQuestion,
  onFullEdit,
}: QuestionEditorProps) {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterAttribute, setFilterAttribute] = useState<string>('all');
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filterStage !== 'all' && q.stage !== filterStage) return false;
      if (filterDifficulty !== 'all' && q.difficultyLevel !== filterDifficulty) return false;
      if (filterAttribute !== 'all' && !q.attributes.includes(filterAttribute)) return false;
      return true;
    });
  }, [questions, filterStage, filterDifficulty, filterAttribute]);

  // Group by stage
  const questionsByStage = useMemo(() => {
    const groups: Record<string, GeneratedQuestion[]> = {};

    filteredQuestions.forEach((q) => {
      if (!groups[q.stage]) {
        groups[q.stage] = [];
      }
      groups[q.stage].push(q);
    });

    return groups;
  }, [filteredQuestions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const reordered = arrayMove(questions, oldIndex, newIndex);
      onQuestionsChange(reordered);
    }
  };

  const handleUpdate = (updated: GeneratedQuestion) => {
    const newQuestions = questions.map((q) => (q.id === updated.id ? updated : q));
    onQuestionsChange(newQuestions);
  };

  const handleDelete = (questionId: string) => {
    const newQuestions = questions.filter((q) => q.id !== questionId);
    onQuestionsChange(newQuestions);
  };

  const toggleStageCollapse = (stageName: string) => {
    setCollapsedStages((prev) => {
      const updated = new Set(prev);
      if (updated.has(stageName)) {
        updated.delete(stageName);
      } else {
        updated.add(stageName);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Customize Questions</CardTitle>
            {onAddQuestion && (
              <Button variant="outline" size="sm" onClick={onAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Stage</label>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.name}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Attribute</label>
              <Select value={filterAttribute} onValueChange={setFilterAttribute}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Attributes</SelectItem>
                  {attributes.map((attr) => (
                    <SelectItem key={attr.id} value={attr.name}>
                      {attr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredQuestions.length} of {questions.length} questions
            {filterStage !== 'all' || filterDifficulty !== 'all' || filterAttribute !== 'all'
              ? ' (filtered)'
              : ''}
          </div>
        </CardContent>
      </Card>

      {/* Questions grouped by stage */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {Object.entries(questionsByStage).map(([stageName, stageQuestions]) => {
            const isCollapsed = collapsedStages.has(stageName);

            return (
              <div key={stageName} className="space-y-2">
                {/* Stage Header */}
                <button
                  type="button"
                  onClick={() => toggleStageCollapse(stageName)}
                  className="flex items-center gap-2 w-full p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="font-semibold">{stageName}</span>
                  <span className="text-sm text-muted-foreground">
                    ({stageQuestions.length} question{stageQuestions.length !== 1 ? 's' : ''})
                  </span>
                </button>

                {/* Stage Questions */}
                {!isCollapsed && (
                  <SortableContext
                    items={stageQuestions.map((q, index) => q.id || `question-${stageName}-${index}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 pl-6">
                      {stageQuestions.map((question, index) => (
                        <QuestionEditorCard
                          key={question.id || `question-${stageName}-${index}`}
                          question={question}
                          attributes={attributes}
                          stages={stages}
                          onUpdate={handleUpdate}
                          onDelete={() => handleDelete(question.id || `question-${stageName}-${index}`)}
                          onFullEdit={() => onFullEdit?.(question)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            );
          })}
        </div>
      </DndContext>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {questions.length === 0
              ? 'No questions generated yet.'
              : 'No questions match the current filters.'}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
