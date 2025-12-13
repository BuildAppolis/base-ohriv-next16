"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JsonViewer } from "@/components/buildappolis/json-tree-viewer";
import {
  Building2,
  Brain,
  Heart,
  Code,
  Star,
  Briefcase
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { OptimizationResult } from "../_types/optimized";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CoordinationPanel } from "./coordination-panel";

interface OptimizedDataPanelProps {
  optimizedCompany: OptimizationResult;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedCompany: any; // Using any to avoid import issues with Company
}

export function OptimizedDataPanel({ optimizedCompany, selectedCompany }: OptimizedDataPanelProps) {
  const [coodinationMode, setCoordinationMode] = useState<boolean>(false);
  return (
    <Card className="flex-1 border-0 shadow-lg rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Optimized Data
        </CardTitle>
        <CardDescription>
          <Button size="sm" variant={coodinationMode ? "secondary" : "outline"} onClick={() => setCoordinationMode(!coodinationMode)}>
            {coodinationMode ? "Overview" : "🪄 Coordination Mode"}
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-2">
        <ScrollArea className=" overflow-y-auto h-[calc(100vh-120px)] pr-2">
          {!coodinationMode ? (
            <div className="space-y-4">
              {/* Company Profile Section */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-800 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Optimized Company Profile
                </h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>Name:</strong> {optimizedCompany.optimized_company.company_profile.name}</div>
                  <div><strong>Industry:</strong> {optimizedCompany.optimized_company.company_profile.sub_industry || optimizedCompany.optimized_company.company_profile.industry}</div>
                  <div><strong>Size:</strong> {optimizedCompany.optimized_company.company_profile.size}</div>
                  <div><strong>Location:</strong> {optimizedCompany.optimized_company.company_profile.location}</div>
                  <div><strong>Stage:</strong> {optimizedCompany.optimized_company.company_profile.stage.name} ({optimizedCompany.optimized_company.company_profile.stage.phase})</div>
                </div>
              </div>

              {/* Mission & Culture Section */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-semibold text-sm text-green-800 mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Optimized Mission & Culture
                </h4>
                <div className="space-y-2">
                  <div>
                    <h5 className="font-medium text-xs text-green-700 mb-1">Mission Statement</h5>
                    <p className="text-xs text-green-600 leading-relaxed line-clamp-3">
                      {optimizedCompany.optimized_company.mission_and_culture.mission_statement}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-xs text-green-700 mb-1">Core Values</h5>
                    <div className="space-y-1">
                      {optimizedCompany.optimized_company.mission_and_culture.core_values.map((value, index) => (
                        <div key={index} className="text-xs bg-white px-2 py-1 rounded border border-green-300">
                          <strong>{value.name}</strong> - {value.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Process Section */}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-sm text-purple-800 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Optimized Interview Process
                </h4>
                <div className="space-y-1">
                  <div className="text-xs text-purple-700">
                    <strong>Total Steps:</strong> {optimizedCompany.optimized_company.interview_steps.total_steps}
                  </div>
                  {optimizedCompany.optimized_company.interview_steps.steps.map((stage, index) => (
                    <div key={index} className="text-xs text-purple-600 pl-2 border-l-2 border-purple-300 ml-2">
                      <strong>{stage.order}.</strong> {stage.name} ({stage.type})
                      <div className="text-xs text-purple-500 mt-1">{stage.description}</div>
                      {stage.generates_questions === false && <span className="text-orange-600 ml-1">(No Questions)</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology Stack Section */}
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-sm text-orange-800 mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Optimized Technology Stack
                </h4>
                <div className="space-y-2">
                  {/* Languages */}
                  <div>
                    <h5 className="font-medium text-xs text-orange-700 mb-1">Languages ({optimizedCompany.optimized_company.technologies.languages.length})</h5>
                    <div className="space-y-1">
                      {optimizedCompany.optimized_company.technologies.languages.map((lang, index) => (
                        <div key={index} className="text-xs text-orange-600 pl-2 border-l-2 border-orange-300 ml-2">
                          <strong>{lang.name}</strong>
                          {lang.company_specific && <span className="text-red-600 ml-1">★ Company-Specific</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frameworks */}
                  <div>
                    <h5 className="font-medium text-xs text-orange-700 mb-1">Frameworks ({optimizedCompany.optimized_company.technologies.frameworks.length})</h5>
                    <div className="space-y-1">
                      {optimizedCompany.optimized_company.technologies.frameworks.map((fw, index) => (
                        <div key={index} className="text-xs text-orange-600 pl-2 border-l-2 border-orange-300 ml-2">
                          <strong>{fw.name}</strong>
                          {fw.company_specific && <span className="text-red-600 ml-1">★ Company-Specific</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Positions Summary Section */}
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-sm text-indigo-800 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Optimized Positions & Stats
                </h4>

                {/* Optimized positions preview */}
                <div className="mt-3">
                  <h5 className="font-medium text-xs text-indigo-700 mb-1">Positions & Work Environment</h5>
                  <div className="space-y-2">
                    {optimizedCompany.optimized_company.positions.map((position, index) => (
                      <div key={index} className="text-xs bg-white px-2 py-2 rounded border border-indigo-300">
                        <div className="font-medium text-indigo-700">
                          <strong>{position.title}</strong> (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{position.category}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm max-w-xs">
                                Auto-categorized based on job title keywords:
                                • Engineering: contains &quot;engineer&quot;, &quot;developer&quot;, &quot;technical&quot;
                                • Leadership: contains &quot;manager&quot;, &quot;director&quot;, &quot;vp&quot;, &quot;lead&quot;
                                • Product: contains &quot;product&quot;, &quot;pm&quot;
                                • Design: contains &quot;designer&quot;, &quot;design&quot;
                                • Other: fallback category
                              </p>
                            </TooltipContent>
                          </Tooltip>,
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">Seniority: {position.seniority_level}/10</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm max-w-xs">
                                Average seniority score across all position levels:
                                • Entry Level: 2/10 • Junior: 3/10 • Mid Level: 5/10
                                • Senior: 7/10 • Lead/Manager: 8/10 • Senior Manager/Director: 9/10
                                • VP/Executive: 10/10
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          )
                        </div>
                        <div className="text-xs text-indigo-600 mt-1 space-y-1">
                          <div><strong>Impact:</strong> {position.role_requirements.impact_areas.join(", ")}</div>
                          <div><strong>Scope:</strong> {position.role_requirements.scope}</div>
                          {position.position_tools.length > 0 && (
                            <div>
                              <strong>Tools:</strong>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {position.position_tools.map((tool, idx) => (
                                  <span key={idx} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">
                                    {tool.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {position.extended_descriptions.length > 0 && (
                            <div>
                              <strong>Extended Details:</strong>
                              <div className="mt-1 text-xs text-indigo-500 italic">
                                {position.extended_descriptions.map((desc, idx) => (
                                  <div key={idx} className="line-clamp-2">{desc}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Complete AI Data Section */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <JsonViewer
                  data={optimizedCompany.optimized_company}
                  rootName="ai_optimized_company"
                  defaultExpanded={false}
                  className="text-xs"
                />
              </div>
            </div>
          ) : (
            <CoordinationPanel
              optimizedCompany={optimizedCompany}
              selectedCompany={selectedCompany}
            />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}