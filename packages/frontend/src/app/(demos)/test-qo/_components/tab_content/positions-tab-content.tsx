"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Star, Globe, Briefcase, Users, Code } from "lucide-react";
import type { Company, TechStackItemWithUsage } from "../../_types/company";
import { getTechCategoryIcon, getTechCategoryLabel, mergePositionDetails, mergePositionTools } from "../../_hooks";
import Splitter from "@/components/ui/splitter";

interface PositionsTabContentProps {
  selectedCompany: Company;
  expandedPositions: Record<string, boolean>;
  expandedResponsibilities: Record<string, boolean>;
  onTogglePosition: (positionId: string) => void;
  onToggleResponsibilities: (jobId: string) => void;
}

export function PositionsTabContent({
  selectedCompany,
  expandedPositions,
  expandedResponsibilities,
  onTogglePosition,
  onToggleResponsibilities,
}: PositionsTabContentProps) {
  return (
    <ScrollArea className="space-y-4 h-[calc(100vh-140px)] hover:pr-2 an">
      <div className="space-y-4">
        {selectedCompany.positions?.map((position) => (
          <div key={position.id} className="mb-4">
            <Collapsible
              open={expandedPositions[position.id] ?? false}
              onOpenChange={() => onTogglePosition(position.id)}
            >
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer  overflow-hidden hover:border-primary/50 duration-200">
                  <CardHeader className="flex items-center justify-center flex-col gap-2 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {expandedPositions[position.id] ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <CardTitle className="text-sm font-semibold">
                          {position.title}
                        </CardTitle>
                      </div>
                      {position.pool.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {position.pool.length} levels
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mx-auto text-center">
                      {position.pool.length === 1
                        ? position.pool[0].description
                        : position.baseDetails?.impact || position.title
                      }
                    </p>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="pl-4 pb-4 space-y-3 mt-2">
                  {position.pool.length === 1 ? (
                    // Single-level position: Show consolidated ISR
                    (() => {
                      const singleJob = position.pool[0];
                      const consolidatedDetails = mergePositionDetails(position.baseDetails, singleJob.specificDetails);
                      const consolidatedTools = mergePositionTools(position.baseTools, singleJob.specificTools);

                      return (
                        <div className="space-y-3">
                          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-xs text-blue-800 mb-2 flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Position Details
                              <Badge variant="outline" className="text-xs ml-auto">
                                {singleJob.level.replace("_", " ")}
                              </Badge>
                            </h5>

                            <div className="space-y-3">
                              {singleJob.extended_description && (
                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-300">
                                  <h6 className="font-semibold text-xs text-orange-800 mb-1 flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    Extended Details
                                  </h6>
                                  <p className="text-xs text-orange-700 italic line-clamp-4">
                                    {singleJob.extended_description}
                                  </p>
                                </div>
                              )}

                              <div className="bg-white p-2 rounded border border-blue-200">
                                <h6 className="font-semibold text-xs text-blue-700 mb-1">Impact</h6>
                                <p className="text-xs text-blue-600">{consolidatedDetails.impact}</p>
                              </div>

                              <div className="bg-white p-2 rounded border border-green-200">
                                <h6 className="font-semibold text-xs text-green-700 mb-1">Scope</h6>
                                <p className="text-xs text-green-600">{consolidatedDetails.scope}</p>
                              </div>

                              <div className="bg-white p-2 rounded border border-purple-200">
                                <h6 className="font-semibold text-xs text-purple-700 mb-1">Responsibilities</h6>
                                <Collapsible
                                  open={expandedResponsibilities[singleJob.id] ?? false}
                                  onOpenChange={() => onToggleResponsibilities(singleJob.id)}
                                >
                                  <CollapsibleContent>
                                    <div className="h-20 w-full overflow-y-auto">
                                      <ul className="text-xs text-purple-600 space-y-1 pr-2">
                                        {consolidatedDetails.responsibilities.map((resp, index) => (
                                          <li key={index} className="flex items-start gap-1">
                                            <span className="text-purple-400 mt-0.5">•</span>
                                            <span>{resp}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </CollapsibleContent>

                                  {!expandedResponsibilities[singleJob.id] && (
                                    <CollapsibleTrigger asChild>
                                      <span
                                        className="text-xs text-purple-500 italic cursor-pointer hover:text-purple-700 mt-1 inline-block"
                                        title="Click to see all responsibilities"
                                      >
                                        {consolidatedDetails.responsibilities.slice(0, 2).map((resp, index) => (
                                          <div key={index} className="flex items-start gap-1">
                                            <span className="text-purple-400 mt-0.5">•</span>
                                            <span className="line-clamp-1">{resp}</span>
                                          </div>
                                        ))}
                                        {consolidatedDetails.responsibilities.length > 2 && (
                                          <span className="text-purple-500 hover:text-purple-700 cursor-pointer">
                                            +{consolidatedDetails.responsibilities.length - 2} more
                                          </span>
                                        )}
                                      </span>
                                    </CollapsibleTrigger>
                                  )}
                                </Collapsible>
                              </div>
                            </div>
                          </div>

                          {/* Tools Section for single position */}
                          {consolidatedTools.length > 0 && (
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                              <h6 className="font-semibold text-xs text-orange-700 mb-2">Tools & Technologies</h6>
                              <div className="grid grid-cols-1 gap-2">
                                {Object.entries(
                                  consolidatedTools.reduce((acc, tool) => {
                                    const category = tool.category;
                                    if (!acc[category]) acc[category] = [];
                                    acc[category].push(tool);
                                    return acc;
                                  }, {} as Record<string, TechStackItemWithUsage[]>)
                                ).map(([category, tools]) => (
                                  <div key={category} className="bg-white p-2 rounded border border-orange-300">
                                    <div className="font-medium text-xs text-orange-800 mb-1 flex items-center gap-1">
                                      {getTechCategoryIcon(category)}
                                      {getTechCategoryLabel(category)}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {tools.map((tool) => (
                                        <div key={tool.id} className="bg-orange-100 px-2 py-1 rounded border border-orange-200 flex">
                                          <div className="font-medium text-xs text-orange-900">{tool.name}</div>
                                          {(tool as TechStackItemWithUsage)?.companySpecific && (tool as TechStackItemWithUsage)?.usageDescription && (<Splitter className="mx-2 h-4 via-orange-300" />)}
                                          {(tool as TechStackItemWithUsage)?.companySpecific && (tool as TechStackItemWithUsage)?.usageDescription && (
                                            <div className="text-xs text-orange-600">
                                              {(tool as TechStackItemWithUsage).usageDescription}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    // Multi-level position: Show existing structure
                    <>
                      {/* Base Variables */}
                      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <h5 className="font-semibold text-xs text-blue-800 mb-1 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Base Impact
                          </h5>
                          <p className="text-xs text-blue-700">{position.baseDetails.impact}</p>
                        </div>

                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <h5 className="font-semibold text-xs text-green-800 mb-1 flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Base Scope
                          </h5>
                          <p className="text-xs text-green-700">{position.baseDetails.scope}</p>
                        </div>

                        <div className="bg-purple-50 p-2 rounded border border-purple-200">
                          <h5 className="font-semibold text-xs text-purple-800 mb-1 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            Base Responsibilities
                          </h5>
                          <div className="h-16 w-full overflow-y-auto">
                            <ul className="text-xs text-purple-700 space-y-1 pr-2">
                              {position.baseDetails.responsibilities.map((resp, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-purple-400 mt-0.5">•</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Base Tools */}
                        {position.baseTools && position.baseTools.length > 0 && (
                          <div className="bg-orange-50 p-2 rounded border border-orange-200">
                            <h5 className="font-semibold text-xs text-orange-800 mb-1 flex items-center gap-1">
                              <Code className="h-3 w-3" />
                              Base Tools (All Levels)
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {position.baseTools.map((tool) => (
                                <div key={tool.id} className="bg-white flex px-2 py-1 rounded border border-orange-300">
                                  <div className="font-medium text-xs text-orange-800">{tool.name}</div>
                                  {(tool as TechStackItemWithUsage)?.companySpecific && (tool as TechStackItemWithUsage)?.usageDescription && (<Splitter className="mx-2 h-4 via-gray-300" />)}
                                  {(tool as TechStackItemWithUsage)?.companySpecific && (tool as TechStackItemWithUsage)?.usageDescription && (
                                    <div className="text-xs text-orange-600 ">
                                      💡 {(tool as TechStackItemWithUsage).usageDescription}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pool Items */}
                      <div className="space-y-2">
                        <h5 className="font-semibold text-xs text-gray-700 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Position Levels
                        </h5>

                        {position.pool.map((job) => (
                          <div key={job.id} className="border rounded-lg p-2 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-semibold text-xs capitalize">
                                {job.level.replace("_", " ")}
                              </h6>
                              {(job.specificTools && job.specificTools.length > 0) && (
                                <Badge variant={`${job.status === 'generated' ? 'success' : job.status === 'draft' ? 'outline' : 'primary'}`} className="text-xs">
                                  {job.status}
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{job.description}</p>

                            {job.extended_description && (
                              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-300 mb-2">
                                <h6 className="font-semibold text-xs text-orange-800 mb-1 flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Extended Details
                                </h6>
                                <p className="text-xs text-orange-700 italic line-clamp-4">
                                  {job.extended_description}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-2">
                              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                <h6 className="font-semibold text-xs text-blue-700 mb-1">Impact</h6>
                                <p className="text-xs text-blue-600 line-clamp-2">{job.specificDetails.impact}</p>
                              </div>

                              <div className="bg-green-50 p-2 rounded border border-green-200">
                                <h6 className="font-semibold text-xs text-green-700 mb-1">Scope</h6>
                                <p className="text-xs text-green-600 line-clamp-2">{job.specificDetails.scope}</p>
                              </div>

                              <div className="bg-purple-50 p-2 rounded border border-purple-200">
                                <h6 className="font-semibold text-xs text-purple-700 mb-1">Responsibilities</h6>
                                <Collapsible
                                  open={expandedResponsibilities[job.id] ?? false}
                                  onOpenChange={() => onToggleResponsibilities(job.id)}
                                >
                                  <CollapsibleContent>
                                    <div className="h-20 w-full overflow-y-auto">
                                      <ul className="text-xs text-purple-600 space-y-1 pr-2">
                                        {job.specificDetails.responsibilities.map((resp, index) => (
                                          <li key={index} className="flex items-start gap-1">
                                            <span className="text-purple-400 mt-0.5">•</span>
                                            <span>{resp}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </CollapsibleContent>

                                  {!expandedResponsibilities[job.id] && (
                                    <CollapsibleTrigger asChild>
                                      <span
                                        className="text-xs text-purple-500 italic cursor-pointer hover:text-purple-700 mt-1 inline-block"
                                        title="Click to see all responsibilities"
                                      >
                                        {job.specificDetails.responsibilities.slice(0, 2).map((resp, index) => (
                                          <div key={index} className="flex items-start gap-1">
                                            <span className="text-purple-400 mt-0.5">•</span>
                                            <span className="line-clamp-1">{resp}</span>
                                          </div>
                                        ))}
                                        {job.specificDetails.responsibilities.length > 2 && (
                                          <span className="text-purple-500 hover:text-purple-700 cursor-pointer">
                                            +{job.specificDetails.responsibilities.length - 2} more
                                          </span>
                                        )}
                                      </span>
                                    </CollapsibleTrigger>
                                  )}
                                </Collapsible>
                              </div>

                              {/* Tools Section */}
                              {job.specificTools && job.specificTools.length > 0 && (
                                <div className="bg-orange-50 p-2 rounded border border-orange-200">
                                  <h6 className="font-semibold text-xs text-orange-700 mb-1">Specific Tools</h6>
                                  <div className="flex flex-wrap gap-1">
                                    {job.specificTools.map((tool) => (
                                      <div key={tool.id} className="bg-white flex px-2 py-1 rounded border border-orange-300">
                                        <div className="font-bold text-xs text-orange-800">{tool.name}</div>
                                        {(tool as TechStackItemWithUsage)?.companySpecific && (tool as TechStackItemWithUsage)?.usageDescription && (<Splitter className="mx-2 h-4 via-orange-300" />)}
                                        {(tool as TechStackItemWithUsage)?.companySpecific && (tool as TechStackItemWithUsage)?.usageDescription && (
                                          <div className="text-xs text-orange-600 ">
                                            💡 {(tool as TechStackItemWithUsage).usageDescription}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}