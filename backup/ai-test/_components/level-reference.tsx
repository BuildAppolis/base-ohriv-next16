'use client';

import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface LevelGuide {
  level: string;
  experienceRange: string;
  description: string;
  autonomy: string;
  scopeOfImpact: string;
  typicalResponsibilities: string[];
  decisionMaking: string;
}

const LEVEL_GUIDES: LevelGuide[] = [
  {
    level: 'Entry Level',
    experienceRange: '0-2 years',
    description: 'Learning and executing tasks under close mentorship',
    autonomy: 'Close mentorship and guidance',
    scopeOfImpact: 'Individual tasks',
    typicalResponsibilities: [
      'Execute assigned tasks with guidance',
      'Learn team processes and standards',
      'Participate in code/work reviews',
      'Focus on skill development',
    ],
    decisionMaking: 'Makes tactical decisions on task implementation with guidance',
  },
  {
    level: 'Junior',
    experienceRange: '1-3 years',
    description: 'Growing independence with occasional guidance',
    autonomy: 'Guided autonomy',
    scopeOfImpact: 'Features and small projects',
    typicalResponsibilities: [
      'Complete features with minimal guidance',
      'Contribute to team discussions',
      'Debug and resolve issues independently',
      'Begin mentoring entry-level team members',
    ],
    decisionMaking: 'Makes implementation decisions independently, seeks guidance on complex issues',
  },
  {
    level: 'Mid-Level',
    experienceRange: '3-5 years',
    description: 'Independent execution with feature ownership',
    autonomy: 'Independent',
    scopeOfImpact: 'Features and components',
    typicalResponsibilities: [
      'Own entire features from design to deployment',
      'Provide technical guidance to junior members',
      'Participate in architectural discussions',
      'Drive improvements in team processes',
    ],
    decisionMaking: 'Makes feature-level decisions, influences component architecture',
  },
  {
    level: 'Senior',
    experienceRange: '5-8 years',
    description: 'Technical leadership with project-level ownership',
    autonomy: 'Highly independent',
    scopeOfImpact: 'Projects and systems',
    typicalResponsibilities: [
      'Lead design and implementation of major systems',
      'Mentor multiple team members',
      'Drive technical excellence and best practices',
      'Influence team-wide technical decisions',
    ],
    decisionMaking: 'Makes architectural decisions, influences team technical direction',
  },
  {
    level: 'Lead',
    experienceRange: '8-12 years',
    description: 'Technical and team leadership across multiple projects',
    autonomy: 'Leadership',
    scopeOfImpact: 'Product and team',
    typicalResponsibilities: [
      'Lead multiple projects and engineers',
      'Define technical strategy and roadmap',
      'Drive cross-team initiatives',
      'Represent team in organizational decisions',
    ],
    decisionMaking: 'Makes strategic technical decisions, influences product direction',
  },
  {
    level: 'Principal',
    experienceRange: '12+ years',
    description: 'Organizational impact and strategic technical direction',
    autonomy: 'Strategic leadership',
    scopeOfImpact: 'Organization',
    typicalResponsibilities: [
      'Define technical vision and strategy',
      'Influence company-wide technical decisions',
      'Mentor senior engineers and leads',
      'Drive innovation and technical excellence',
    ],
    decisionMaking: 'Makes company-wide technical decisions, sets technical culture',
  },
  {
    level: 'Staff',
    experienceRange: '12+ years',
    description: 'Cross-organizational impact and expert technical guidance',
    autonomy: 'Strategic leadership',
    scopeOfImpact: 'Organization',
    typicalResponsibilities: [
      'Solve complex technical challenges across teams',
      'Provide expert guidance on critical decisions',
      'Drive adoption of best practices company-wide',
      'Act as technical thought leader',
    ],
    decisionMaking: 'Influences critical technical and architectural decisions across organization',
  },
];

interface LevelReferenceProps {
  level?: string;
  compact?: boolean;
}

export function LevelReference({ level, compact = false }: LevelReferenceProps) {
  const guides = level
    ? LEVEL_GUIDES.filter((g) => g.level === level)
    : LEVEL_GUIDES;

  if (compact && level) {
    const guide = LEVEL_GUIDES.find((g) => g.level === level);
    if (!guide) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <Info className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" side="right">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">
                {guide.level}
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  ({guide.experienceRange})
                </span>
              </h4>
              <p className="text-xs text-muted-foreground">{guide.description}</p>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium">Autonomy:</span>
                <span className="text-xs text-muted-foreground ml-2">{guide.autonomy}</span>
              </div>
              <div>
                <span className="text-xs font-medium">Scope of Impact:</span>
                <span className="text-xs text-muted-foreground ml-2">{guide.scopeOfImpact}</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-medium mb-1">Typical Responsibilities:</h5>
              <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                {guide.typicalResponsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-muted-foreground italic border-t pt-2">
              {guide.decisionMaking}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-4 w-4" />
        <h3 className="text-sm font-semibold">Level Reference Guide</h3>
      </div>

      {guides.map((guide) => (
        <div
          key={guide.level}
          className="border rounded-lg p-4 space-y-3 hover:bg-accent/5 transition-colors"
        >
          <div>
            <h4 className="font-semibold text-sm mb-1">
              {guide.level}
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({guide.experienceRange})
              </span>
            </h4>
            <p className="text-xs text-muted-foreground">{guide.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs font-medium">Autonomy:</span>
              <p className="text-xs text-muted-foreground">{guide.autonomy}</p>
            </div>
            <div>
              <span className="text-xs font-medium">Scope of Impact:</span>
              <p className="text-xs text-muted-foreground">{guide.scopeOfImpact}</p>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-medium mb-1">Typical Responsibilities:</h5>
            <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
              {guide.typicalResponsibilities.map((resp, idx) => (
                <li key={idx}>{resp}</li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-muted-foreground italic border-t pt-2">
            {guide.decisionMaking}
          </div>
        </div>
      ))}
    </div>
  );
}
