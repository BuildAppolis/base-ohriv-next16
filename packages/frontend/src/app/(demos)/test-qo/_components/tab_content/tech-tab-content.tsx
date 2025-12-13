"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, HelpCircle } from "lucide-react";
import type { Company, TechStackItemWithUsage } from "../../_types/company";
import { getTechCategoryColor, getTechCategoryIcon, getTechCategoryLabel, groupTechByCategory } from "../../_hooks";

interface TechTabContentProps {
  selectedCompany: Company;
  onTechItemClick: (tech: TechStackItemWithUsage) => void;
}

export function TechTabContent({ selectedCompany, onTechItemClick }: TechTabContentProps) {
  return (
    <div className="space-y-4">
      {/* Tech System Help Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-blue-700">
            <HelpCircle className="h-4 w-4" />
            Tech System Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-3">🛠️ Understanding the Tool System</p>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-blue-700">What are Tools?</span>
                <p className="mt-1">Tools are the building blocks the AI uses to optimize interviews. Each tool represents specific capabilities like context expansion, data extraction, or analysis operations.</p>
              </div>

              <div>
                <span className="font-semibold text-blue-700">Key Tool Categories:</span>
                <ul className="mt-1 ml-4 space-y-1 list-disc">
                  <li><strong>Context Tools:</strong> Analyze and expand company information</li>
                  <li><strong>Extraction Tools:</strong> Pull specific data from descriptions</li>
                  <li><strong>Optimization Tools:</strong> Enhance interview generation process</li>
                  <li><strong>Validation Tools:</strong> Ensure data quality and completeness</li>
                </ul>
              </div>

              <div>
                <span className="font-semibold text-blue-700">Tech Stack Processing:</span>
                <p className="mt-1">When you provide company context, the AI automatically identifies technologies, frameworks, and tools. This becomes the foundation for generating relevant interview questions.</p>
              </div>

              <div>
                <span className="font-semibold text-blue-700">Pro Tips:</span>
                <ul className="mt-1 ml-4 space-y-1 list-disc">
                  <li>Be specific about technologies in your company descriptions</li>
                  <li>Include frameworks, libraries, and cloud platforms</li>
                  <li>More detailed context = better targeted interview questions</li>
                  <li>The system automatically maps tech stack to interview requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {Object.entries(groupTechByCategory(selectedCompany.techStack)).map(([category, techs]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            {getTechCategoryIcon(category)}
            <h4 className="font-semibold text-sm">{getTechCategoryLabel(category)}</h4>
            <Badge variant="secondary" className="text-xs">
              {techs.length} {techs.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {techs.map((tech) => (
              <div
                key={tech.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${getTechCategoryColor(
                  category
                )} hover:shadow-sm transition-shadow ${tech.companySpecific ? 'cursor-pointer hover:border-primary/50' : ''}`}
                onClick={() => tech.companySpecific && onTechItemClick(tech)}
              >
                <div className="flex-shrink-0">
                  {getTechCategoryIcon(category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm">{tech.name}</div>
                    {(tech as TechStackItemWithUsage)?.companySpecific && (
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        Company Specific
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs opacity-75 mt-1 line-clamp-2">
                    {(tech as TechStackItemWithUsage)?.usageDescription || tech.description}
                  </div>
                  {(tech as TechStackItemWithUsage)?.companySpecific && (tech as TechStackItemWithUsage)?.usageDescription && (
                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      💡 Company-specific usage
                      <span className="text-xs text-blue-500 italic">(click to learn more)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {(!selectedCompany.techStack || selectedCompany.techStack.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No tech stack items available</p>
        </div>
      )}
    </div>
  );
}