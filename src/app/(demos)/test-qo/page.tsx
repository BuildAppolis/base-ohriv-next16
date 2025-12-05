"use client";

import { useState, useEffect } from "react";
import { demoCompanies } from "./data/demo-companies";
import type { Company, TechStackItemWithUsage } from "./_types/company";
import type { OptimizationResult } from "./_types/optimized";
import { optimizeCompanyForAI } from "./_utils/company-optimizer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { getTechCategoryIcon } from "./_hooks";
import { CompanyContextPanel } from "./_components/company-context-panel";
import { OptimizedDataPanel } from "./_components/optimized-data-panel";
import Link from "next/link";

export default function TestQOPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company>(demoCompanies[0]);
  const [expandedPositions, setExpandedPositions] = useState<Record<string, boolean>>({});
  const [expandedResponsibilities, setExpandedResponsibilities] = useState<Record<string, boolean>>({});
  const [selectedTechItem, setSelectedTechItem] = useState<TechStackItemWithUsage | null>(null);
  const [optimizedCompany, setOptimizedCompany] = useState<OptimizationResult>(() =>
    optimizeCompanyForAI(demoCompanies[0])
  );
  const [isScoringPanelOpen, setScoringPanelOpen] = useState<boolean>(false);


  // Update optimized company when selected company changes
  useEffect(() => {
    setOptimizedCompany(optimizeCompanyForAI(selectedCompany));
  }, [selectedCompany]);

  const togglePosition = (positionId: string) => {
    setExpandedPositions(prev => ({
      ...prev,
      [positionId]: !prev[positionId]
    }));
  };

  const toggleResponsibilities = (jobId: string) => {
    setExpandedResponsibilities(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const handleTechItemClick = (tech: TechStackItemWithUsage) => {
    if (tech.companySpecific) {
      setSelectedTechItem(tech);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50/30">
        {/* Main Content */}
        <div className="h-[32px] bg-secondary flex items-center gap-4 justify-between px-4">
          <h1 className="text-xl font-bold">Response testing center</h1>
          <div className="flex items-center gap-4">
            <Button size='sm' onClick={() => setScoringPanelOpen(!isScoringPanelOpen)}  >
              Scoring Panel
            </Button>
            <Link href={'https://github.com/BuildAppolis/ohriv-better-auth/tree/v2-ai/src/app/(demos)/test-qo/_types'} target="_blank">
              <Button size='sm' variant='outline'>
                View Types
              </Button>
            </Link>
            <Link href={'https://github.com/BuildAppolis/ohriv-better-auth/blob/v2-ai/src/app/(demos)/test-qo/data/demo-companies.ts'} target="_blank">
              <Button size='sm' variant='outline'>
                View Demo Data
              </Button>
            </Link>
          </div>
        </div>
        {!isScoringPanelOpen ? (
          <div className="flex h-[calc(100vh-32px))] p-4 space-x-4">
            {/* Company Overview Card - Left Panel */}
            <CompanyContextPanel
              selectedCompany={selectedCompany}
              optimizedCompany={optimizedCompany}
              expandedPositions={expandedPositions}
              expandedResponsibilities={expandedResponsibilities}
              onTechItemClick={handleTechItemClick}
              onTogglePosition={togglePosition}
              onToggleResponsibilities={toggleResponsibilities}
              onCompanyChange={setSelectedCompany}
            />

            {/* AI-Optimized Data Card - Right Panel */}
            <OptimizedDataPanel
              optimizedCompany={optimizedCompany}
              selectedCompany={selectedCompany}
            />
          </div>
        ) : (
          <ScrollArea className="flex h-[calc(100vh-32px))] p-4 space-x-4">
            {/* Company Overview Card - Left Panel */}
            <Card className="flex-1  border-0 shadow-lg rounded-lg overflow-hidden">

            </Card>
          </ScrollArea>
        )}
      </div>

      {/* Tech Detail Modal */}
      <Dialog open={!!selectedTechItem} onOpenChange={() => setSelectedTechItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTechItem && getTechCategoryIcon(selectedTechItem.category)}
              {selectedTechItem?.name}
              {selectedTechItem?.companySpecific && (
                <Badge variant="outline" className="text-xs">
                  Company Specific
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTechItem && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedTechItem.description}</p>
              </div>

              {selectedTechItem.companySpecific && selectedTechItem.usageDescription && (
                <div>
                  <h4 className="font-semibold text-sm text-blue-700 mb-2">
                    How {selectedCompany.name} Uses This Tool
                  </h4>
                  <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    💡 {selectedTechItem.usageDescription}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Category</h4>
                <div className="flex items-center gap-2">
                  {getTechCategoryIcon(selectedTechItem.category)}
                  <span className="text-sm capitalize">{selectedTechItem.category.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Industry Context</h4>
                <p className="text-xs text-gray-500">
                  This usage pattern is specific to {selectedCompany.context?.subIndustry || selectedCompany.context?.industry} companies.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  );
}