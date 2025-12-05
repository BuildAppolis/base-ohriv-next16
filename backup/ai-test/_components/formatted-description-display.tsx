'use client';

import { Card } from '@/components/ui/card';
import { Target, Gem, Building2 } from 'lucide-react';

interface FormattedDescriptionDisplayProps {
  description: string;
  variant?: 'default' | 'enhanced';
  title?: string;
}

interface ParsedDescription {
  mission?: string;
  values?: string;
  overview?: string;
  raw?: string;
}

function parseDescription(description: string): ParsedDescription {
  const sections: ParsedDescription = {};

  // Try to parse structured format
  const missionMatch = description.match(/🎯\s*Company Mission[:\n\s]+([\s\S]*?)(?=💎|🏢|$)/);
  const valuesMatch = description.match(/💎\s*Company Values[:\n\s]+([\s\S]*?)(?=🎯|🏢|$)/);
  const overviewMatch = description.match(/🏢\s*Company Overview[:\n\s]+([\s\S]*?)(?=🎯|💎|$)/);

  if (missionMatch || valuesMatch || overviewMatch) {
    sections.mission = missionMatch?.[1]?.trim();
    sections.values = valuesMatch?.[1]?.trim();
    sections.overview = overviewMatch?.[1]?.trim();
  } else {
    // If not structured, show as raw
    sections.raw = description;
  }

  return sections;
}

export function FormattedDescriptionDisplay({
  description,
  variant = 'default',
  title,
}: FormattedDescriptionDisplayProps) {
  const parsed = parseDescription(description);

  const containerClass =
    variant === 'enhanced'
      ? 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-500'
      : 'bg-muted/50 border';

  const sectionHeaderClass =
    variant === 'enhanced'
      ? 'text-blue-900 dark:text-blue-100'
      : 'text-foreground';

  const sectionTextClass =
    variant === 'enhanced'
      ? 'text-blue-800 dark:text-blue-200'
      : 'text-muted-foreground';

  // If raw (unstructured), show simple text
  if (parsed.raw) {
    return (
      <Card className={containerClass}>
        {title && (
          <div className="p-3 border-b">
            <div className="text-xs font-medium">{title}</div>
          </div>
        )}
        <div className="p-4">
          <p className="text-sm whitespace-pre-wrap">{parsed.raw}</p>
        </div>
      </Card>
    );
  }

  // Structured format
  return (
    <Card className={containerClass}>
      {title && (
        <div className="p-3 border-b">
          <div className="text-xs font-medium">{title}</div>
        </div>
      )}
      <div className="p-4 space-y-4">
        {/* Mission Section */}
        {parsed.mission && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" />
              <h4 className={`text-sm font-semibold ${sectionHeaderClass}`}>
                Company Mission
              </h4>
            </div>
            <p className={`text-sm leading-relaxed pl-6 ${sectionTextClass}`}>
              {parsed.mission}
            </p>
          </div>
        )}

        {/* Values Section */}
        {parsed.values && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-purple-500" />
              <h4 className={`text-sm font-semibold ${sectionHeaderClass}`}>
                Company Values
              </h4>
            </div>
            <p className={`text-sm leading-relaxed pl-6 ${sectionTextClass}`}>
              {parsed.values}
            </p>
          </div>
        )}

        {/* Overview Section */}
        {parsed.overview && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <h4 className={`text-sm font-semibold ${sectionHeaderClass}`}>
                Company Overview
              </h4>
            </div>
            <p className={`text-sm leading-relaxed pl-6 ${sectionTextClass}`}>
              {parsed.overview}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
