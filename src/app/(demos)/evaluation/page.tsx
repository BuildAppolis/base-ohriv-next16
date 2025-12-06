'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAtom, useAtomValue } from 'jotai'
import {
  candidatesAtom,
  selectedCandidateIdsAtom,
  addCandidateEvaluationAtom,
  currentCandidateEvaluationsAtom
} from '@/lib/atoms/candidate-atoms'
import { evaluateCandidateKSA } from '@/lib/candidate-ksa-evaluator'
import { CandidateEvaluation } from '@/types/candidate'
import { KSAInterviewOutput } from '@/types/company_old/ksa'
import {
  Upload,
  FileText,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Download,
  Play,
  Settings,
  Info,
  FileJson,
  FileCode,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * KSA Upload Component
 */
function KSAUpload({ onKSAUpload, ksaData }: {
  onKSAUpload: (ksa: KSAInterviewOutput) => void
  ksaData: KSAInterviewOutput | null
}) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content)
        setJsonInput(JSON.stringify(parsed, null, 2))
        setError('')
      } catch (err) {
        setError('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  const handleJsonSubmit = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      onKSAUpload(parsed)
      setError('')
    } catch (err) {
      setError('Invalid JSON format')
    }
  }

  const loadExampleKSA = () => {
    fetch('/src/app/(demos)/test-response/expected_outputs/ksa_output.json')
      .then(res => res.text())
      .then(content => {
        setJsonInput(content)
      })
      .catch(() => {
        setError('Failed to load example KSA')
      })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          KSA Framework Upload
        </CardTitle>
        <CardDescription>
          Upload or paste your KSA interview framework JSON to evaluate candidates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ksaData && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              KSA Framework loaded successfully: {Object.keys(ksaData.KSA_JobFit || {}).length} job categories,
              {Object.keys(ksaData.CoreValues_CompanyFit || {}).length} company values
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadExampleKSA} size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Load Example
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="opacity-0 absolute inset-0 cursor-pointer"
            />
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Paste KSA JSON (optional)</label>
          <Textarea
            placeholder="Paste your KSA framework JSON here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={8}
            className="font-mono text-xs"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleJsonSubmit}
          disabled={!jsonInput.trim()}
          className="w-full"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Load KSA Framework
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Candidate Selection Component
 */
function CandidateSelection({ candidates, selectedIds, onSelectionChange }: {
  candidates: any[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}) {
  const handleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(candidates.map(c => c.id))
    }
  }

  const handleCandidateToggle = (candidateId: string) => {
    if (selectedIds.includes(candidateId)) {
      onSelectionChange(selectedIds.filter(id => id !== candidateId))
    } else {
      onSelectionChange([...selectedIds, candidateId])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Candidates
            <Badge variant="secondary">
              {selectedIds.length} / {candidates.length}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedIds.length === candidates.length ? 'Deselect All' : 'Select All'}
          </Button>
        </CardTitle>
        <CardDescription>
          Choose which candidates to evaluate against the KSA framework
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedIds.includes(candidate.id) && "bg-blue-50 border-blue-200"
                )}
                onClick={() => handleCandidateToggle(candidate.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded border-2 flex items-center justify-center">
                    {selectedIds.includes(candidate.id) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-sm" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {candidate.experience.currentPosition.title} • {candidate.experience.currentPosition.company}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      {candidate.interviewPerformance.simulatedInterviewScores.behavioral.overall}/10
                    </div>
                    <div className="text-muted-foreground">Score</div>
                  </div>
                  {candidate.metadata.tags.includes('has-red-flags') && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

/**
 * Evaluation Results Component
 */
function EvaluationResults({ evaluations }: {
  evaluations: CandidateEvaluation[]
}) {
  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Evaluations Yet</h3>
          <p className="text-muted-foreground">
            Select candidates and run evaluation to see results
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {evaluations.map((evaluation, index) => (
        <Card key={evaluation.candidateId || index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  Evaluation for {evaluation.evaluationContext.jobTitle}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(evaluation.evaluationContext.evaluationDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRecommendationBadgeVariant(evaluation.overallCompatibility.recommendation)}>
                  {evaluation.overallCompatibility.recommendation.replace('-', ' ')}
                </Badge>
                <Badge variant="outline">
                  Score: {evaluation.overallCompatibility.score}/10
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-3">KSA Score Breakdown</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Knowledge</span>
                    <span className="font-semibold">{evaluation.scores.knowledge.overall}/10</span>
                  </div>
                  <Progress value={evaluation.scores.knowledge.overall * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Skills</span>
                    <span className="font-semibold">{evaluation.scores.skills.overall}/10</span>
                  </div>
                  <Progress value={evaluation.scores.skills.overall * 10} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Abilities</span>
                    <span className="font-semibold">{evaluation.scores.abilities.overall}/10</span>
                  </div>
                  <Progress value={evaluation.scores.abilities.overall * 10} className="h-2" />
                </div>
              </div>
            </div>

            {/* Predicted Performance */}
            <div>
              <h4 className="text-sm font-medium mb-3">Predicted Interview Performance</h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {evaluation.predictedPerformance.behavioral}
                  </div>
                  <div className="text-xs text-muted-foreground">Behavioral</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {evaluation.predictedPerformance.technical}
                  </div>
                  <div className="text-xs text-muted-foreground">Technical</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {evaluation.predictedPerformance.cultural}
                  </div>
                  <div className="text-xs text-muted-foreground">Cultural</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    {evaluation.predictedPerformance.overall}
                  </div>
                  <div className="text-xs text-muted-foreground">Overall</div>
                </div>
              </div>
            </div>

            {/* Strengths and Concerns */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600">Key Strengths</h4>
                <ul className="text-sm space-y-1">
                  {evaluation.overallCompatibility.strengths.slice(0, 3).map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-red-600">Potential Concerns</h4>
                <ul className="text-sm space-y-1">
                  {evaluation.overallCompatibility.concerns.slice(0, 3).map((concern, idx) => (
                    <li key={idx} className="flex items-start">
                      <AlertTriangle className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Focus */}
            {evaluation.overallCompatibility.interviewFocus.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recommended Interview Focus</h4>
                <div className="flex flex-wrap gap-1">
                  {evaluation.overallCompatibility.interviewFocus.map((focus, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Main Evaluation Center Page
 */
export default function EvaluationCenterPage() {
  const candidates = useAtomValue(candidatesAtom)
  const [selectedCandidateIds, setSelectedCandidateIds] = useAtom(selectedCandidateIdsAtom)
  const [ksaData, setKSAData] = useState<KSAInterviewOutput | null>(null)
  const [evaluations, setEvaluations] = useState<CandidateEvaluation[]>([])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationProgress, setEvaluationProgress] = useState(0)
  const [addEvaluation] = useAtom(addCandidateEvaluationAtom)

  const handleKSAUpload = (ksa: KSAInterviewOutput) => {
    setKSAData(ksa)
    setEvaluations([]) // Clear previous evaluations
  }

  const handleRunEvaluation = async () => {
    if (!ksaData || selectedCandidateIds.length === 0) return

    setIsEvaluating(true)
    setEvaluationProgress(0)

    const newEvaluations: CandidateEvaluation[] = []

    for (let i = 0; i < selectedCandidateIds.length; i++) {
      const candidateId = selectedCandidateIds[i]
      const candidate = candidates.find(c => c.id === candidateId)

      if (!candidate) continue

      try {
        const evaluation = await evaluateCandidateKSA(
          candidate,
          ksaData,
          undefined,
          ksaData.KSA_JobFit ? Object.keys(ksaData.KSA_JobFit)[0] : 'Unknown Position'
        )

        newEvaluations.push(evaluation)

        // Store evaluation in atom
        addEvaluation({ candidateId, evaluation })

        setEvaluationProgress(((i + 1) / selectedCandidateIds.length) * 100)
      } catch (error) {
        console.error(`Failed to evaluate candidate ${candidateId}:`, error)
      }
    }

    setEvaluations(newEvaluations)
    setIsEvaluating(false)
    setEvaluationProgress(0)
  }

  const handleExportEvaluations = () => {
    const exportData = {
      evaluations,
      ksaFramework: ksaData,
      evaluationDate: new Date().toISOString(),
      totalCandidates: selectedCandidateIds.length
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `candidate-evaluations-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getRecommendationBadgeVariant = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-recommend': return 'default'
      case 'recommend': return 'secondary'
      case 'consider': return 'outline'
      case 'reject': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">KSA Evaluation Center</h1>
          <p className="text-muted-foreground">
            Evaluate candidates against your KSA interview framework
          </p>
        </div>
        <div className="flex gap-2">
          {evaluations.length > 0 && (
            <Button variant="outline" onClick={handleExportEvaluations}>
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="ksa-upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ksa-upload" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            KSA Framework
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Candidates
            <Badge variant="secondary">{selectedCandidateIds.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Results
            {evaluations.length > 0 && <Badge variant="secondary">{evaluations.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* KSA Upload Tab */}
        <TabsContent value="ksa-upload">
          <KSAUpload onKSAUpload={handleKSAUpload} ksaData={ksaData} />
        </TabsContent>

        {/* Candidate Selection Tab */}
        <TabsContent value="candidates">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Select Candidates for Evaluation</h2>
              <Button
                onClick={handleRunEvaluation}
                disabled={!ksaData || selectedCandidateIds.length === 0 || isEvaluating}
              >
                <Play className="h-4 w-4 mr-2" />
                {isEvaluating ? 'Evaluating...' : 'Run Evaluation'}
              </Button>
            </div>

            {isEvaluating && (
              <Card>
                <CardContent className="py-6">
                  <div className="text-center space-y-3">
                    <div className="text-sm font-medium">
                      Evaluating candidates... {Math.round(evaluationProgress)}%
                    </div>
                    <Progress value={evaluationProgress} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            <CandidateSelection
              candidates={candidates}
              selectedIds={selectedCandidateIds}
              onSelectionChange={setSelectedCandidateIds}
            />
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Evaluation Results</h2>
              {evaluations.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {evaluations.filter(e => e.overallCompatibility.score >= 7).length} strong recommendations,
                  {evaluations.filter(e => e.overallCompatibility.score >= 5 && e.overallCompatibility.score < 7).length} consider,
                  {evaluations.filter(e => e.overallCompatibility.score < 5).length} concerns
                </div>
              )}
            </div>

            <EvaluationResults evaluations={evaluations} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}