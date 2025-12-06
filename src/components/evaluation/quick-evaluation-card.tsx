'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAtom, useAtomValue } from 'jotai'
import { candidatesAtom, selectedCandidateIdsAtom } from '@/lib/atoms/candidate-atoms'
import { evaluateCandidateKSA } from '@/lib/candidate-ksa-evaluator'
import { KSAInterviewOutput } from '@/types/company_old/ksa'
import {
  Target,
  Play,
  Upload,
  FileJson,
  Users,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickEvaluationCardProps {
  className?: string
}

/**
 * Quick evaluation card that can be embedded in other pages
 */
export function QuickEvaluationCard({ className }: QuickEvaluationCardProps) {
  const candidates = useAtomValue(candidatesAtom)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [ksaData, setKSAData] = useState<KSAInterviewOutput | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content)
        setKSAData(parsed)
      } catch (err) {
        console.error('Failed to parse KSA JSON:', err)
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  const handleEvaluation = async () => {
    if (!ksaData || selectedIds.length === 0) return

    setIsEvaluating(true)
    const evaluationResults = []

    for (const candidateId of selectedIds) {
      const candidate = candidates.find(c => c.id === candidateId)
      if (!candidate) continue

      try {
        const evaluation = await evaluateCandidateKSA(
          candidate,
          ksaData,
          undefined,
          ksaData.KSA_JobFit ? Object.keys(ksaData.KSA_JobFit)[0] : 'Unknown Position'
        )
        evaluationResults.push({
          candidate: candidate.personalInfo.firstName + ' ' + candidate.personalInfo.lastName,
          score: evaluation.overallCompatibility.score,
          recommendation: evaluation.overallCompatibility.recommendation,
          knowledge: evaluation.scores.knowledge.overall,
          skills: evaluation.scores.skills.overall,
          abilities: evaluation.scores.abilities.overall
        })
      } catch (error) {
        console.error(`Failed to evaluate candidate ${candidateId}:`, error)
      }
    }

    setResults(evaluationResults)
    setIsEvaluating(false)
  }

  const handleExport = () => {
    if (results.length === 0) return

    const exportData = {
      evaluations: results,
      ksaFramework: ksaData,
      evaluationDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quick-evaluation-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-recommend': return 'bg-green-100 text-green-800'
      case 'recommend': return 'bg-blue-100 text-blue-800'
      case 'consider': return 'bg-yellow-100 text-yellow-800'
      case 'reject': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-recommend':
      case 'recommend':
        return <CheckCircle2 className="h-4 w-4" />
      case 'reject':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  return (
    <>
      <Card className={cn('relative overflow-hidden', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick KSA Evaluation
          </CardTitle>
          <CardDescription>
            Evaluate candidates against KSA frameworks
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {ksaData && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                KSA Framework loaded
              </span>
            </div>
          )}

          <div className="text-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Launch Evaluation
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    KSA Evaluation Center
                  </DialogTitle>
                  <DialogDescription>
                    Upload your KSA framework and select candidates to evaluate
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* KSA Upload */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        KSA Framework
                      </h3>
                      {ksaData ? (
                        <div className="p-3 border rounded-md bg-green-50">
                          <p className="text-sm text-green-800 mb-1">
                            ✓ Framework loaded successfully
                          </p>
                          <p className="text-xs text-green-600">
                            {Object.keys(ksaData.KSA_JobFit || {}).length} job categories
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <Input
                              type="file"
                              accept=".json"
                              onChange={handleFileUpload}
                              className="opacity-0 absolute inset-0 cursor-pointer"
                            />
                            <Button variant="outline" className="w-full">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload KSA JSON
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Or paste KSA JSON here..."
                            rows={6}
                            className="font-mono text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Candidate Selection */}
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Select Candidates
                        <Badge variant="secondary">
                          {selectedIds.length}/{candidates.length}
                        </Badge>
                      </h3>
                      <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                        {candidates.map((candidate) => (
                          <label
                            key={candidate.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(candidate.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds([...selectedIds, candidate.id])
                                  } else {
                                    setSelectedIds(selectedIds.filter(id => id !== candidate.id))
                                  }
                                }}
                                className="rounded"
                              />
                              <div>
                                <div className="text-sm font-medium">
                                  {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {candidate.experience.currentPosition.title}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {candidate.interviewPerformance.simulatedInterviewScores.behavioral.overall}/10
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {selectedIds.length === 0 && 'Select candidates to enable evaluation'}
                      {!ksaData && 'Upload KSA framework to enable evaluation'}
                    </div>
                    <div className="flex gap-2">
                      {results.length > 0 && (
                        <Button variant="outline" onClick={handleExport}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      )}
                      <Button
                        onClick={handleEvaluation}
                        disabled={!ksaData || selectedIds.length === 0 || isEvaluating}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isEvaluating ? 'Evaluating...' : 'Run Evaluation'}
                      </Button>
                    </div>
                  </div>

                  {/* Results Summary */}
                  {results.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Evaluation Results
                      </h3>
                      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                        {results.map((result, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{result.candidate}</div>
                              <div className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                                getRecommendationColor(result.recommendation)
                              )}>
                                {getRecommendationIcon(result.recommendation)}
                                {result.recommendation.replace('-', ' ')}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div>
                                <div className="text-sm font-semibold">{result.score}/10</div>
                                <div className="text-xs text-muted-foreground">Overall</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{result.knowledge}/10</div>
                                <div className="text-xs text-muted-foreground">Knowledge</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{result.skills}/10</div>
                                <div className="text-xs text-muted-foreground">Skills</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold">{result.abilities}/10</div>
                                <div className="text-xs text-muted-foreground">Abilities</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-sm text-muted-foreground">
            {candidates.length} candidates available for evaluation
          </div>
        </CardContent>
      </Card>
    </>
  )
}