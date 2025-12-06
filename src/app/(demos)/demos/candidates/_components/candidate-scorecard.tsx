'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAtomValue } from 'jotai'
import { currentCandidateAtom, currentCandidateEvaluationsAtom, currentCandidateJobEvaluationsAtom } from '@/lib/atoms/candidate-atoms'
import { SimpleCandidate } from '@/lib/candidate-generator'
import { CandidateEvaluation } from '@/types/candidate'
import {
  User,
  Briefcase,
  TrendingUp,
  Star,
  Target,
  CheckCircle2,
  AlertTriangle,
  Calendar
} from 'lucide-react'

interface CandidateScorecardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Evaluation Score Component
 */
function EvaluationScore({ evaluation }: { evaluation: CandidateEvaluation }) {
  const score = evaluation.overallCompatibility.score
  const recommendation = evaluation.overallCompatibility.recommendation

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-blue-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationColor = (rec: string) => {
    if (rec.includes('Strong') || rec === 'strong-recommend') return 'bg-green-100 text-green-800'
    if (rec === 'recommend' || rec === 'Recommend') return 'bg-blue-100 text-blue-800'
    if (rec === 'consider' || rec === 'Consider') return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {evaluation.evaluationContext.jobTitle}
          </CardTitle>
          <Badge className={getRecommendationColor(recommendation)}>
            {recommendation}
          </Badge>
        </div>
        <CardDescription>
          {new Date(evaluation.evaluationContext.evaluationDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="font-medium">Overall Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}/10
            </span>
            <Progress value={score * 10} className="w-24" />
          </div>
        </div>

        {/* Category Scores */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-blue-600">
              {evaluation.scores.knowledge.overall.toFixed(1)}
            </div>
            <div className="text-muted-foreground">Knowledge</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">
              {evaluation.scores.skills.overall.toFixed(1)}
            </div>
            <div className="text-muted-foreground">Skills</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600">
              {evaluation.scores.abilities.overall.toFixed(1)}
            </div>
            <div className="text-muted-foreground">Abilities</div>
          </div>
        </div>

        {/* Predicted Performance */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Predicted Interview Performance</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Behavioral:</span>
              <span className="font-medium">{evaluation.predictedPerformance.behavioral.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between">
              <span>Technical:</span>
              <span className="font-medium">{evaluation.predictedPerformance.technical.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between">
              <span>Cultural:</span>
              <span className="font-medium">{evaluation.predictedPerformance.cultural.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between">
              <span>Overall:</span>
              <span className="font-medium">{evaluation.predictedPerformance.overall.toFixed(1)}/10</span>
            </div>
          </div>
        </div>

        {/* Strengths */}
        {evaluation.overallCompatibility.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Strengths
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {evaluation.overallCompatibility.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {evaluation.overallCompatibility.concerns.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Areas for Development
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {evaluation.overallCompatibility.concerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Candidate Scorecard Dialog
 */
export function CandidateScorecard({ open, onOpenChange }: CandidateScorecardProps) {
  const candidate = useAtomValue(currentCandidateAtom)
  const evaluations = useAtomValue(currentCandidateEvaluationsAtom)
  const jobEvaluations = useAtomValue(currentCandidateJobEvaluationsAtom)

  if (!candidate) return null

  // Group evaluations by job title
  const evaluationsByJob = evaluations.reduce((acc, evaluation) => {
    const jobTitle = evaluation.evaluationContext.jobTitle
    if (!acc[jobTitle]) {
      acc[jobTitle] = []
    }
    acc[jobTitle].push(evaluation)
    return acc
  }, {} as Record<string, CandidateEvaluation[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl">
                {candidate.firstName} {candidate.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                Age {candidate.age} • ID: {candidate.id.split('-')[1]}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Candidate evaluation scorecard and performance metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Briefcase className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{jobEvaluations.length}</div>
                <div className="text-sm text-muted-foreground">Jobs Evaluated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold">{evaluations.length}</div>
                <div className="text-sm text-muted-foreground">Total Evaluations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <div className="text-2xl font-bold">
                  {evaluations.length > 0
                    ? (evaluations.reduce((sum, evaluation) => sum + evaluation.overallCompatibility.score, 0) / evaluations.length).toFixed(1)
                    : '0'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </CardContent>
            </Card>
          </div>

          {/* Job Evaluations List */}
          {jobEvaluations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Evaluations
              </h3>
              <div className="flex flex-wrap gap-2">
                {jobEvaluations.map((job) => (
                  <Badge key={job} variant="outline" className="text-sm">
                    {job}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Evaluations by Job */}
          {Object.keys(evaluationsByJob).length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Evaluation Results
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(evaluationsByJob).map(([jobTitle, jobEvals]) => (
                  <div key={jobTitle} className="space-y-3">
                    <h4 className="text-md font-medium text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {jobTitle}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {jobEvals.map((evaluation, index) => (
                        <EvaluationScore key={`${jobTitle}-${index}`} evaluation={evaluation} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Evaluations Yet</h3>
                <p className="text-muted-foreground">
                  This candidate hasn't been evaluated for any positions yet.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {evaluations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {evaluations
                  .sort((a, b) => new Date(b.evaluationContext.evaluationDate).getTime() - new Date(a.evaluationContext.evaluationDate).getTime())
                  .slice(0, 3)
                  .map((evaluation, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 rounded border">
                      <div>
                        <span className="font-medium">{evaluation.evaluationContext.jobTitle}</span>
                        <span className="text-muted-foreground ml-2">
                          Score: {evaluation.overallCompatibility.score}/10
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(evaluation.evaluationContext.evaluationDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}