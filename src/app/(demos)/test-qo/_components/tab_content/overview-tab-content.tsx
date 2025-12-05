"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Heart, BookOpen, Globe, MapPin, Users, TrendingUp } from "lucide-react";
import type { Company } from "../../_types/company";
import { getSizeLabel, getStageLabel, getStageDescription } from "../../_hooks";

interface OverviewTabContentProps {
  selectedCompany: Company;
}

export function OverviewTabContent({ selectedCompany }: OverviewTabContentProps) {
  return (
    <div className="space-y-4">
      {/* MVO Section */}
      <div className="space-y-4">
        {/* Mission */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-sm text-blue-800 mb-2 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Mission
          </h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            {selectedCompany.context?.missionStatement}
          </p>
        </div>

        {/* Values */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <h4 className="font-semibold text-sm text-green-800 mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Values
          </h4>
          <p className="text-xs text-green-700 leading-relaxed">
            {selectedCompany.context?.values}
          </p>
        </div>

        {/* Overview */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-sm text-purple-800 mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Company Overview
          </h4>
          <p className="text-xs text-purple-700 leading-relaxed">
            {selectedCompany.context?.overview}
          </p>
        </div>
      </div>

      {/* Company Values */}
      {selectedCompany.values && selectedCompany.values.length > 0 && (
        <div className="space-y-3 pt-2 border-t">
          <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Company Values
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedCompany.values.map((value, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="text-2xl" style={{ color: value.color }}>
                  {value.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-sm" style={{ color: value.color }}>
                    {value.name}
                  </h5>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Details */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Industry:</span>
          <Badge variant="secondary">{selectedCompany.context?.subIndustry || selectedCompany.context?.industry}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Location:</span>
          <span className="text-sm">{selectedCompany.context?.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Size:</span>
          <Badge variant="outline">{getSizeLabel(selectedCompany.context?.size)}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Stage:</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-help">
                {getStageLabel(selectedCompany.context?.stage)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm max-w-xs">{getStageDescription(selectedCompany.context?.stage)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}