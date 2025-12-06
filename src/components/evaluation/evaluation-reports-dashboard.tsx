'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Briefcase,
  Target,
  Download,
  Eye,
  Calendar,
  BarChart3,
  Star,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue } from 'jotai'
import { candidatesAtom } from '@/lib/atoms/candidate-atoms'
import {
  stageKSAScoresAtom,
  evaluationReportsAtom,
  candidateEvaluationReportAtom,
  getCandidateCompletionStatusAtom,
  EVALUATION_STAGES,
  EVALUATION_ATTRIBUTES,
  MultiStageEvaluationReport
} from '@/lib/atoms/multistage-ksa-atoms'

interface EvaluationReportsDashboardProps {
  className?: string
}

/**
 * Comprehensive dashboard for viewing multi-stage KSA evaluation reports
 */
export function EvaluationReportsDashboard({ className }: EvaluationReportsDashboardProps) {
  const candidates = useAtomValue(candidatesAtom)
  const stageScores = useAtomValue(stageKSAScoresAtom)
  const evaluationReports = useAtomValue(evaluationReportsAtom)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')

  // Get all candidates with evaluation data
  const candidatesWithEvaluations = useMemo(() => {
    const candidatesWithData = new Set<string>()

    // Add candidates from stage scores
    Object.values(stageScores).forEach(score => {
      candidatesWithData.add(score.candidateId)
    })

    // Add candidates from reports
    Object.values(evaluationReports).forEach(report => {
      candidatesWithData.add(report.candidateId)
    })

    return Array.from(candidatesWithData).map(candidateId => ({
      id: candidateId,
      candidate: candidates[candidateId],
      report: Object.values(evaluationReports).find(r => r.candidateId === candidateId),
      stageScores: Object.values(stageScores).filter(s => s.candidateId === candidateId),
      completionStatus: getCandidateCompletionStatus(candidateId, stageScores)
    })).filter(item => item.candidate) // Only include candidates that exist
  }, [candidates, stageScores, evaluationReports])

  // Get completion status for a candidate
  function getCandidateCompletionStatus(candidateId: string, scores: any[]) {
    const candidateScores = scores.filter(score => score.candidateId === candidateId)

    const completion = {
      'stage-1': false,
      'stage-2': false,
      'stage-3': false,
      overall: false,
      totalCompleted: 0,
      totalStages: 3
    }

    candidateScores.forEach(score => {
      if (score.status === 'completed') {
        completion[score.stageId as keyof typeof completion] = true
        completion.totalCompleted++
      }
    })

    completion.overall = completion.totalCompleted === 3
    return completion
  }

  // Get selected report
  const selectedReport = useMemo(() =>
    selectedReportId ? evaluationReports[selectedReportId] : null,
    [selectedReportId, evaluationReports]
  )

  // Get recommendation styling
  const getRecommendationStyling = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-recommend':
        return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2, label: 'Strongly Recommend' }
      case 'recommend':
        return { color: 'text-blue-600', bg: 'bg-blue-50', icon: Star, label: 'Recommend' }
      case 'consider':
        return { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle, label: 'Consider' }
      case 'reject':
        return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, label: 'Not Recommended' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', icon: Minus, label: 'Unknown' }
    }
  }

  // Get trend icon
  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
    }
  }

  // Export report as JSON
  const exportReport = (report: MultiStageEvaluationReport) => {
    const dataStr = JSON.stringify(report, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `evaluation-report-${report.candidateName}-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (candidatesWithEvaluations.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="mx-auto max-w-md">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Evaluation Reports Available
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete candidate evaluations to see comprehensive reports here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesWithEvaluations.length}</div>
            <p className="text-xs text-muted-foreground">
              with evaluation data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Reports</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(evaluationReports).length}</div>
            <p className="text-xs text-muted-foreground">
              comprehensive evaluations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stage Evaluations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stageScores).length}</div>
            <p className="text-xs text-muted-foreground">
              individual stage assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((candidatesWithEvaluations.filter(c => c.completionStatus.overall).length / candidatesWithEvaluations.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              full 3-stage evaluations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'overview' | 'detailed')}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Candidate Evaluation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidatesWithEvaluations.map(({ id, candidate, report, completionStatus }) => {
              const recommendation = report?.finalRecommendation || 'consider'
              const styling = getRecommendationStyling(recommendation)
              const RecommendationIcon = styling.icon

              return (
                <Card key={id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => report && setSelectedReportId(report.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {candidate?.personalInfo.firstName[0]}{candidate?.personalInfo.lastName[0]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {candidate?.personalInfo.firstName} {candidate?.personalInfo.lastName}
                          </CardTitle>
                          <CardDescription>
                            {candidate?.experience.currentPosition.title}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={styling.color}>
                        <RecommendationIcon className="h-3 w-3 mr-1" />
                        {styling.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Final Score */}
                    {report && (
                      <div className="text-center">
                        <div className="text-2xl font-bold">{report.finalScore.toFixed(1)}/10</div>
                        <div className="text-xs text-muted-foreground">Final Score</div>
                      </div>
                    )}

                    {/* Stage Completion */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stage Completion</span>
                        <span>{completionStatus.totalCompleted}/{completionStatus.totalStages}</span>
                      </div>
                      <Progress value={(completionStatus.totalCompleted / completionStatus.totalStages) * 100} className="h-2" />
                    </div>

                    {/* Stage Breakdown */}
                    <div className="space-y-2">
                      {EVALUATION_STAGES.map(stage => {
                        const isCompleted = completionStatus[stage.id as keyof typeof completionStatus]
                        return (
                          <div key={stage.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{stage.name}</span>
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Actions */}
                    {report && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedReportId(report.id)
                                  setViewMode('detailed')
                                }}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  exportReport(report)
                                }}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {selectedReport ? (
            <DetailedReportView
              report={selectedReport}
              candidate={candidates[selectedReport.candidateId]}
              onExport={() => exportReport(selectedReport)}
              onBack={() => setSelectedReportId(null)}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Select a report from the overview to view details</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Detailed Report View Component
function DetailedReportView({
  report,
  candidate,
  onExport,
  onBack
}: {
  report: MultiStageEvaluationReport
  candidate: any
  onExport: () => void
  onBack: () => void
}) {
  const getRecommendationStyling = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-recommend':
        return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2, label: 'Strongly Recommend' }
      case 'recommend':
        return { color: 'text-blue-600', bg: 'bg-blue-50', icon: Star, label: 'Recommend' }
      case 'consider':
        return { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle, label: 'Consider' }
      case 'reject':
        return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, label: 'Not Recommended' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', icon: Minus, label: 'Unknown' }
    }
  }

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
    }
  }

  const styling = getRecommendationStyling(report.finalRecommendation)
  const RecommendationIcon = styling.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Button variant="outline" size="sm" onClick={onBack}>
                  ← Back
                </Button>
                <CardTitle className="text-2xl">
                  {candidate?.personalInfo.firstName} {candidate?.personalInfo.lastName}
                </CardTitle>
                <Badge className={cn(styling.bg, styling.color)}>
                  <RecommendationIcon className="h-3 w-3 mr-1" />
                  {styling.label}
                </Badge>
              </div>
              <CardDescription>
                {candidate?.experience.currentPosition.title} • {report.jobCategory}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{report.finalScore.toFixed(1)}/10</div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{report.jobCategory}</div>
              <div className="text-sm text-muted-foreground">Job Category</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {new Date(report.generatedOn).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Evaluation Date</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {EVALUATION_STAGES.map(stage => {
          const stageScore = report.stageScores[stage.id as keyof typeof report.stageScores]
          const isCompleted = !!stageScore

          return (
            <Card key={stage.id} className={cn(!isCompleted && "opacity-50")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{stage.name}</CardTitle>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                </div>
                <CardDescription>{stage.description}</CardDescription>
              </CardHeader>

              {stageScore && (
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stageScore.overallScore.toFixed(1)}/10</div>
                      <Badge className={cn("text-xs", getRecommendationStyling(stageScore.overallRecommendation).bg)}>
                        {getRecommendationStyling(stageScore.overallRecommendation).label}
                      </Badge>
                    </div>

                    {/* KSA Scores */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Knowledge</span>
                        <span>{stageScore.ksaScores.knowledge.overall}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Skills</span>
                        <span>{stageScore.ksaScores.skills.overall}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Abilities</span>
                        <span>{stageScore.ksaScores.abilities.overall}/10</span>
                      </div>
                    </div>

                    {stageScore.notes && (
                      <div className="text-xs text-muted-foreground italic">
                        {stageScore.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Progression Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Progression Analysis</CardTitle>
          <CardDescription>How candidate performance evolved across stages</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KSA Progression */}
            <div>
              <h4 className="font-medium mb-4">KSA Progression</h4>
              <div className="space-y-3">
                {Object.entries(report.ksaProgression).map(([ksaType, data]) => (
                  <div key={ksaType} className="flex items-center justify-between">
                    <span className="capitalize text-sm">{ksaType}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          S1: {data['stage-1'] || 'N/A'}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          S2: {data['stage-2'] || 'N/A'}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          S3: {data['stage-3'] || 'N/A'}
                        </span>
                      </div>
                      {getTrendIcon(data.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attribute Progression */}
            <div>
              <h4 className="font-medium mb-4">Attribute Progression</h4>
              <div className="space-y-3">
                {Object.entries(report.attributeProgression).map(([attr, data]) => {
                  const attrInfo = EVALUATION_ATTRIBUTES.find(a => a.id === attr)
                  return (
                    <div key={attr} className="flex items-center justify-between">
                      <span className="text-sm">{attrInfo?.name || attr}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            S1: {data['stage-1'] || 'N/A'}
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            S2: {data['stage-2'] || 'N/A'}
                          </span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            S3: {data['stage-3'] || 'N/A'}
                          </span>
                        </div>
                        {getTrendIcon(data.trend)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Star className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.keyStrengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Key Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.keyConcerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Discrepancies */}
      {report.discrepancies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Evaluation Discrepancies
            </CardTitle>
            <CardDescription>Notable differences between evaluator assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.discrepancies.map((discrepancy, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-2 w-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{discrepancy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}