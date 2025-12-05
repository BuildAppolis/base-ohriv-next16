'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trash2,
  Clock,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X
} from 'lucide-react';
import type { GeneratedPosition } from '@/lib/atoms/company-contexts';

interface GeneratedPositionsManagerProps {
  positions: GeneratedPosition[];
  onLoadPosition: (position: GeneratedPosition) => void;
  onRemovePosition: (positionId: string) => void;
  onUpdatePosition?: (positionId: string, updates: Partial<GeneratedPosition>) => void;
}

export function GeneratedPositionsManager({
  positions,
  onLoadPosition,
  onRemovePosition,
  onUpdatePosition
}: GeneratedPositionsManagerProps) {
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  const [editingPosition, setEditingPosition] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<GeneratedPosition>>({});

  // Handler functions
  const toggleExpand = (positionId: string) => {
    setExpandedPositions(prev => {
      const updated = new Set(prev);
      if (updated.has(positionId)) {
        updated.delete(positionId);
      } else {
        updated.add(positionId);
      }
      return updated;
    });
  };

  const startEditing = (position: GeneratedPosition) => {
    setEditingPosition(position.id);
    setEditForm({
      roleTitle: position.roleTitle,
      roleDetails: position.roleDetails,
      baseOperations: position.baseOperations,
    });
  };

  const cancelEditing = () => {
    setEditingPosition(null);
    setEditForm({});
  };

  const savePosition = (positionId: string) => {
    if (onUpdatePosition && editForm.roleTitle && editForm.roleDetails) {
      onUpdatePosition(positionId, editForm);
      cancelEditing();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle empty state
  if (positions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No Positions Generated</h3>
            <p className="text-sm">
              Generate positions for this company to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Generated Positions
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {positions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {positions.map((position) => (
              <Card key={position.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingPosition === position.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.roleTitle || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, roleTitle: e.target.value }))}
                            className="w-full px-3 py-1 border rounded text-sm"
                            placeholder="Position title"
                          />
                          <textarea
                            value={editForm.roleDetails || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, roleDetails: e.target.value }))}
                            className="w-full px-3 py-1 border rounded text-sm resize-none"
                            rows={2}
                            placeholder="Position details"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => savePosition(position.id)}
                              className="h-7 px-3"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              className="h-7 px-3"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm truncate">
                              {position.roleTitle}
                            </h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(position)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {position.roleDetails}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(position.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {position.levelAssignments.length} levels
                            </div>
                            {position.services && position.services.length > 0 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {position.services.length} services
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLoadPosition(position)}
                        className="h-7 px-2 text-xs"
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(position.id)}
                        className="h-7 w-7 p-0"
                      >
                        {expandedPositions.has(position.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemovePosition(position.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedPositions.has(position.id) && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {position.baseOperations && (
                        <div>
                          <h5 className="text-xs font-medium mb-1">Base Operations</h5>
                          <p className="text-xs text-muted-foreground">
                            {position.baseOperations}
                          </p>
                        </div>
                      )}

                      {position.services && position.services.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium mb-1">Services</h5>
                          <div className="flex flex-wrap gap-1">
                            {position.services.map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {position.levelAssignments && position.levelAssignments.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium mb-1">Level Assignments</h5>
                          <div className="space-y-1">
                            {position.levelAssignments.map((assignment, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className="font-medium">{assignment.level}</span>
                                <span className="text-muted-foreground">
                                  {assignment.positionCount} positions
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {position.metadata && (
                        <div>
                          <h5 className="text-xs font-medium mb-1">Generation Metadata</h5>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {position.metadata.generationTime && (
                              <span>Generated in {position.metadata.generationTime}ms</span>
                            )}
                            {position.metadata.totalAttributes && (
                              <span>{position.metadata.totalAttributes} attributes</span>
                            )}
                            {position.metadata.totalQuestions && (
                              <span>{position.metadata.totalQuestions} questions</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}