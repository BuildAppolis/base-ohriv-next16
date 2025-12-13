/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { demoCompanies } from "../data/demo-companies";
import type { Company, TechStackItemWithUsage } from "../_types/company";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OverviewTabContent } from "./tab_content/overview-tab-content";
import { TechTabContent } from "./tab_content/tech-tab-content";
import { PositionsTabContent } from "./tab_content/positions-tab-content";
import { StepsTabContent } from "./tab_content/steps-tab-content";
import { CompleteDataTabContent } from "./tab_content/complete-data-tab-content";
import { getIndustryIcon } from "../_hooks";

interface CompanyContextPanelProps {
  selectedCompany: Company;
  optimizedCompany: any; // Using any to avoid import issues with OptimizedCompany
  expandedPositions: Record<string, boolean>;
  expandedResponsibilities: Record<string, boolean>;
  onTechItemClick: (tech: TechStackItemWithUsage) => void;
  onTogglePosition: (positionId: string) => void;
  onToggleResponsibilities: (jobId: string) => void;
  onCompanyChange: (company: Company) => void;
}

export function CompanyContextPanel({
  selectedCompany,
  optimizedCompany,
  expandedPositions,
  expandedResponsibilities,
  onTechItemClick,
  onTogglePosition,
  onToggleResponsibilities,
  onCompanyChange,
}: CompanyContextPanelProps) {
  return (
    <Card className="flex-1 border-0 shadow-lg rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Context
        </CardTitle>
        <CardDescription>
          <Select value={selectedCompany.id} onValueChange={(value) => onCompanyChange(demoCompanies.find(c => c.id === value) || demoCompanies[0])}>
            <SelectTrigger className="w-[300px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {getIndustryIcon(selectedCompany.context?.industry)}
                  {selectedCompany.name}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {demoCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center gap-2">
                    {getIndustryIcon(company.context?.industry)}
                    {company.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <Tabs defaultValue="overview" className="w-full h-[calc(100vh-80px)] overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="complete-data">Complete Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <OverviewTabContent selectedCompany={selectedCompany} />
          </TabsContent>

          <TabsContent value="tech" className="space-y-4">
            <TechTabContent
              selectedCompany={selectedCompany}
              onTechItemClick={onTechItemClick}
            />
          </TabsContent>

          <TabsContent value="positions">
            <PositionsTabContent
              selectedCompany={selectedCompany}
              expandedPositions={expandedPositions}
              expandedResponsibilities={expandedResponsibilities}
              onTogglePosition={onTogglePosition}
              onToggleResponsibilities={onToggleResponsibilities}
            />
          </TabsContent>

          <TabsContent value="steps">
            <StepsTabContent selectedCompany={selectedCompany} />
          </TabsContent>

          <TabsContent value="complete-data" className="overflow-hidden rounded-lg">
            <CompleteDataTabContent
              selectedCompany={selectedCompany}
              optimizedCompany={optimizedCompany}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}