"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";
import type { Company } from "../../_types/company";
import { DEFAULT_COMPANY_STEPS } from "../../_types/company";

interface StepsTabContentProps {
  selectedCompany: Company;
}

export function StepsTabContent({ selectedCompany }: StepsTabContentProps) {
  return (
    <ScrollArea className="h-[calc(100vh-152px)] overflow-auto pr-2">
      <div className="space-y-6">
        {/* Interview Process Stages */}

        {selectedCompany.steps && selectedCompany.steps.length > 0 ? (
          <div className="space-y-3">
            {selectedCompany.steps
              .sort((a, b) => a.order - b.order)
              .map((step, index) => (
                <div
                  key={step.id}
                  className="border rounded-lg p-4 bg-gradient-to-r from-muted/20 to-background"
                >
                  <div className="flex items-start gap-3">
                    {/* Step Icon */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.icon}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-base">{step.name}</h5>
                        <div className="flex items-center gap-1">
                          {index < DEFAULT_COMPANY_STEPS.length && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                          {step.questionsEnabled === false && (
                            <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                              No Questions
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Step Properties */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Order:</span> {step.order}
                        </span>
                        {step.canDelete !== undefined && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Can Delete:</span>
                            <span className={step.canDelete ? "text-green-600" : "text-red-600"}>
                              {step.canDelete ? "Yes" : "No"}
                            </span>
                          </span>
                        )}
                        {step.canReorder !== undefined && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Can Reorder:</span>
                            <span className={step.canReorder ? "text-green-600" : "text-red-600"}>
                              {step.canReorder ? "Yes" : "No"}
                            </span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Questions:</span>
                          <span className={step.questionsEnabled !== false ? "text-green-600" : "text-orange-600"}>
                            {step.questionsEnabled !== false ? "Generated" : "Disabled"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">No Interview Steps Defined</p>
            <p className="text-sm">This company doesn't have any interview stages configured.</p>
          </div>
        )}

        {/* Steps Summary */}
        {selectedCompany.steps && selectedCompany.steps.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-semibold text-sm text-blue-800 mb-2">Process Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {selectedCompany.steps.length}
                </div>
                <div className="text-blue-700">Total Steps</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {selectedCompany.steps.filter(s => s.questionsEnabled !== false).length}
                </div>
                <div className="text-green-700">Generate Questions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {selectedCompany.steps.filter(s => s.questionsEnabled === false).length}
                </div>
                <div className="text-orange-700">No Questions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {selectedCompany.steps.length - DEFAULT_COMPANY_STEPS.length}
                </div>
                <div className="text-purple-700">Custom Steps</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}