'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedAttribute } from './attribute-editor';
import type { CompanyStage } from '@/types/old/company_old/generation-types';

export interface GeneratedQuestion {
  id: string;
  text: string;
  stage: string;
  stageName?: string; // Display name for stage (same as stage for backward compatibility)
  difficultyLevel: "Basic" | "Intermediate" | "Advanced" | "Expert";
  attributes: string[]; // Attribute names this question evaluates
  assessmentType: "company-fit" | "role-fit" | "both"; // Whether evaluating company values or job-specific skills
  assignedLevels?: string[]; // Job levels this question applies to (e.g., ["Senior", "Lead"])
  expectations: {
    scoringAnchors: import('@/types/old/company_old/generation-types').ScoringAnchors; // 5x2 bucket scoring system
    followUpQuestions: import('@/types/old/company_old/generation-types').FollowUpQuestion[];
  };
  internalNotes?: string;
}

interface QuestionEditorCardProps {
  question: GeneratedQuestion;
  attributes: GeneratedAttribute[];
  stages: CompanyStage[];
  onUpdate: (updated: GeneratedQuestion) => void;
  onDelete: () => void;
  onFullEdit: () => void;
}

const difficultyLevels: Array<GeneratedQuestion['difficultyLevel']> = [
  'Basic',
  'Intermediate',
  'Advanced',
  'Expert',
];

const difficultyColors = {
  Basic: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  Intermediate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  Advanced: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  Expert: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
};

export function QuestionEditorCard({
  question,
  attributes,
  stages,
  onUpdate,
  onDelete,
  onFullEdit,
}: QuestionEditorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);

  const {
    attributes: dndAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(editedQuestion);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuestion(question);
    setIsEditing(false);
  };

  const toggleAttribute = (attrName: string) => {
    const newAttributes = editedQuestion.attributes.includes(attrName)
      ? editedQuestion.attributes.filter((a) => a !== attrName)
      : [...editedQuestion.attributes, attrName];

    setEditedQuestion({ ...editedQuestion, attributes: newAttributes });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'overflow-hidden transition-shadow rounded-lg border',
        isDragging && 'shadow-lg ring-2 ring-primary'
      )}
    >
      <Card className={cn(
        'border-0',
        isDragging && 'shadow-none'
      )}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <button
              type="button"
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded mt-1 flex-shrink-0"
              {...dndAttributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Visual Stage Indicator */}
            {(() => {
              const stageData = stages.find(s => s.name === question.stage || s.id === question.stage);
              if (!stageData) return null;

              return (
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-xs"
                    style={{ backgroundColor: `${stageData.color}20`, color: stageData.color }}
                    title={stageData.name}
                  >
                    {stageData.icon}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                    {stageData.name}
                  </span>
                </div>
              );
            })()}

            {/* Question Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {isEditing ? (
                <Textarea
                  value={editedQuestion.text}
                  onChange={(e) =>
                    setEditedQuestion({ ...editedQuestion, text: e.target.value })
                  }
                  className="text-sm min-h-[60px]"
                />
              ) : (
                <p className="text-sm font-medium leading-relaxed">{question.text}</p>
              )}

              {/* Metadata Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Stage - Always editable via dropdown */}
                <Select
                  value={isEditing ? editedQuestion.stage : question.stage}
                  onValueChange={(stage) => {
                    if (isEditing) {
                      setEditedQuestion({ ...editedQuestion, stage });
                    } else {
                      // Update immediately when not in edit mode
                      onUpdate({ ...question, stage });
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.name}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Difficulty */}
                {isEditing ? (
                  <Select
                    value={editedQuestion.difficultyLevel}
                    onValueChange={(difficulty: GeneratedQuestion['difficultyLevel']) =>
                      setEditedQuestion({ ...editedQuestion, difficultyLevel: difficulty })
                    }
                  >
                    <SelectTrigger className="w-[120px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn('text-xs border', difficultyColors[question.difficultyLevel])}
                  >
                    {question.difficultyLevel}
                  </Badge>
                )}

                {/* Attributes */}
                <div className="flex items-center gap-1 flex-wrap">
                  {question.attributes && question.attributes.length > 0 ? (
                    question.attributes.map((attr, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {attr}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      No attributes
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleSave}
                    title="Save changes"
                  >
                    <Save className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCancel}
                    title="Cancel editing"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsEditing(true)}
                    title="Quick edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onDelete}
                    title="Delete question"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="pt-3 border-t space-y-4">
              {/* Attribute Selection (Editing Mode) */}
              {isEditing && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Evaluates Attributes:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {attributes.map((attr) => (
                      <div key={attr.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${attr.id}`}
                          checked={editedQuestion.attributes.includes(attr.name)}
                          onCheckedChange={() => toggleAttribute(attr.name)}
                        />
                        <label
                          htmlFor={`${question.id}-${attr.id}`}
                          className="text-xs cursor-pointer flex-1"
                        >
                          {attr.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scoring Anchors */}
              {question.expectations?.scoringAnchors && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Scoring Anchors:</div>
                  <div className="space-y-2 text-xs">
                    {question.expectations.scoringAnchors.bucket1_2?.examples && (
                      <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                        <div className="font-medium text-red-600 dark:text-red-400 mb-1">
                          {question.expectations.scoringAnchors.bucket1_2.label}:
                        </div>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                          {question.expectations.scoringAnchors.bucket1_2.examples.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {question.expectations.scoringAnchors.bucket3_4?.examples && (
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                        <div className="font-medium text-amber-600 dark:text-amber-400 mb-1">
                          {question.expectations.scoringAnchors.bucket3_4.label}:
                        </div>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                          {question.expectations.scoringAnchors.bucket3_4.examples.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {question.expectations.scoringAnchors.bucket5_6?.examples && (
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <div className="font-medium text-green-600 dark:text-green-400 mb-1">
                          {question.expectations.scoringAnchors.bucket5_6.label}:
                        </div>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                          {question.expectations.scoringAnchors.bucket5_6.examples.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {question.expectations.scoringAnchors.bucket7_8?.examples && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                        <div className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                          {question.expectations.scoringAnchors.bucket7_8.label}:
                        </div>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                          {question.expectations.scoringAnchors.bucket7_8.examples.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {question.expectations.scoringAnchors.bucket9_10?.examples && (
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                        <div className="font-medium text-purple-600 dark:text-purple-400 mb-1">
                          {question.expectations.scoringAnchors.bucket9_10.label}:
                        </div>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                          {question.expectations.scoringAnchors.bucket9_10.examples.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              {question.internalNotes && (
                <div className="p-2 bg-muted/50 rounded text-xs">
                  <div className="font-medium mb-1">Internal Notes:</div>
                  <p className="text-muted-foreground">{question.internalNotes}</p>
                </div>
              )}

              {/* Full Edit Button */}
              <Button variant="outline" size="sm" onClick={onFullEdit} className="w-full">
                <Edit className="h-3 w-3 mr-2" />
                Open Full Editor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
