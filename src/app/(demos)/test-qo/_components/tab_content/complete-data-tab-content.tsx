"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { JsonViewer } from "@/components/buildappolis/json-tree-viewer";
import { Building2, Briefcase, Star, Code, Heart } from "lucide-react";
import type { Company } from "../../_types/company";
import type { OptimizationResult } from "../../_types/optimized";

interface CompleteDataTabContentProps {
  selectedCompany: Company;
  optimizedCompany: OptimizationResult;
}

export function CompleteDataTabContent({ selectedCompany, optimizedCompany }: CompleteDataTabContentProps) {
  return (
    <ScrollArea className="h-[calc(100vh-152px)]  ">
      <div className="flex flex-col gap-6 hover:pr-2">
        {/* Company Data */}
        <div className="group space-y-0 rounded-lg overflow-clip">
          <div className="sticky top-0 bg-background rounded-t-lg border z-10 py-4 -mt-6 mb-0 px-4 transition-all duration-200 ease-in-out">
            <div className="max-w-full">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Company Data
              </h4>
            </div>
          </div>
          <div className=" bg-background pt-6  border border-t-none rounded-b-lg">
            <JsonViewer
              data={optimizedCompany.optimized_company.company_profile}
              rootName="company_profile"
              defaultExpanded={true}
              className="text-xs"
            />
          </div>
        </div>

        {/* Positions Data */}
        <div className="group space-y-0 rounded-lg overflow-clip">
          <div className="sticky top-0 bg-background rounded-t-lg border z-10 py-4  px-4 transition-all duration-200 ease-in-out">
            <div className="max-w-full">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-green-600" />
                Positions Data
              </h4>
            </div>
          </div>
          <div className=" bg-background  pr-2 border border-t-none rounded-b-lg">
            <JsonViewer
              data={selectedCompany.positions}
              rootName="positions"
              defaultExpanded={false}
              className="text-xs"
            />
          </div>
        </div>

        {/* Interview Stages */}
        <div className="group space-y-0">
          <div className="sticky top-0 bg-background rounded-t-lg border z-10 py-4  px-4 transition-all duration-200 ease-in-out">
            <div className="max-w-full">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-600" />
                Interview Stages
              </h4>
            </div>
          </div>
          <div className=" bg-background  pr-2 border border-t-none rounded-b-lg">
            <JsonViewer
              data={optimizedCompany.optimized_company.interview_steps}
              rootName="interview_steps"
              defaultExpanded={true}
              className="text-xs"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="group space-y-0">
          <div className="sticky top-0 bg-background rounded-t-lg border z-10 py-4  px-4 transition-all duration-200 ease-in-out">
            <div className="max-w-full">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Code className="h-4 w-4 text-orange-600" />
                Technologies
              </h4>
            </div>
          </div>
          <div className=" bg-background  pr-2 border border-t-none rounded-b-lg">
            <JsonViewer
              data={optimizedCompany.optimized_company.technologies}
              rootName="technologies"
              defaultExpanded={false}
              className="text-xs"
            />
          </div>
        </div>

        {/* Company Values */}
        <div className="group space-y-0">
          <div className="sticky top-0 bg-background rounded-t-lg border z-10 py-4  px-4 transition-all duration-200 ease-in-out">
            <div className="max-w-full">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                Company Values
              </h4>
            </div>
          </div>
          <div className=" bg-background  pr-2 border border-t-none rounded-b-lg">
            <JsonViewer
              data={selectedCompany.values}
              rootName="company_values"
              defaultExpanded={false}
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}