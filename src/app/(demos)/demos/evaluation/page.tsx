/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAtom, useAtomValue } from 'jotai'
import {
  candidatesAtom,
  selectedCandidateIdsAtom,
  addCandidateEvaluationAtom,
  trackCandidateJobEvaluationAtom
} from '@/lib/atoms/candidate-atoms'
import { CandidateEvaluation } from '@/types/candidate'
import { KSAInterviewOutput } from '@/types/company_old/ksa'
import { SimpleCandidate } from '@/lib/candidate-data'

/**
 * Helper function to get badge variant for recommendation
 */
function getRecommendationBadgeVariant(recommendation: string): "primary" | "secondary" | "destructive" {
  if (recommendation.includes('Strong') || recommendation === 'strong-recommend') return "primary"
  if (recommendation === 'recommend' || recommendation === 'Recommend') return "secondary"
  return "destructive"
}
import {
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Download,
  Play,
  FileJson,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * KSA Input Component
 */
function KSAInput({ onKSAUpload, ksaData }: {
  onKSAUpload: (ksa: KSAInterviewOutput | null) => void
  ksaData: KSAInterviewOutput | null
}) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [showInput, setShowInput] = useState(false)

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
    const ksaExample = {
      "KSA_JobFit": {
        "Knowledge": {
          "attribute": {
            "definition": "Understanding of enterprise software development principles and industry trends.",
            "evaluation_scale": {
              "1": "Cannot perform job duty",
              "2": "Cannot perform job duty",
              "3": "Requires significant training/guidance to perform job duty",
              "4": "Requires significant training/guidance to perform job duty",
              "5": "Able to perform job duties with minimal guidance",
              "6": "Able to perform job duties with minimal guidance",
              "7": "Able to perform job duties and positively impact performance of peers",
              "8": "Able to perform job duties and positively impact performance of peers",
              "9": "Transforms the way the team delivers",
              "10": "Transforms the way the team delivers"
            },
            "weighting": 40,
            "red_flags": [
              "Low understanding of software development lifecycle",
              "Not aware of industry trends",
              "Struggles to connect business needs with software solutions"
            ]
          },
          "questions": [
            {
              "id": 1,
              "category": "Knowledge",
              "type": "behavioral",
              "difficulty": "intermediate",
              "question_text": "Can you describe a recent major trend in enterprise software development and how it impacts business operations?",
              "evaluation_criteria": "Depth of understanding of current trends and their relevance to business.",
              "expected_answers": "Insight into the trend, its implications, and examples of applications.",
              "follow_up_probes": [
                "How have you implemented a similar trend in your previous work?",
                "Can you provide a specific example of how this trend improved software delivery?"
              ],
              "red_flag_indicators": [
                "Vague or unconvincing explanation of trends",
                "Lack of practical application in previous experiences"
              ]
            },
            {
              "id": 2,
              "category": "Knowledge",
              "type": "behavioral",
              "difficulty": "intermediate",
              "question_text": "Describe how you ensure that you stay updated with evolving technologies in software development.",
              "evaluation_criteria": "Engagement in continuous learning and knowledge application.",
              "expected_answers": "Mentorship, courses attended, resources used (e.g., industry blogs, webinars).",
              "follow_up_probes": [
                "How often do you engage with these resources?",
                "Give an example of how learning improved your work performance."
              ],
              "red_flag_indicators": [
                "No specific examples of learning or engagement",
                "Lack of motivation for professional development"
              ]
            }
          ]
        },
        "Skills": {
          "attribute": {
            "definition": "Proficient use of collaboration tools and coding languages relevant to the role.",
            "evaluation_scale": {
              "1": "Cannot perform job duty",
              "2": "Cannot perform job duty",
              "3": "Requires significant training/guidance to perform job duty",
              "4": "Requires significant training/guidance to perform job duty",
              "5": "Able to perform job duties with minimal guidance",
              "6": "Able to perform job duties with minimal guidance",
              "7": "Able to perform job duties and positively impact performance of peers",
              "8": "Able to perform job duties and positively impact performance of peers",
              "9": "Transforms the way the team delivers",
              "10": "Transforms the way the team delivers"
            },
            "weighting": 35,
            "red_flags": [
              "Struggles with basic programming tasks",
              "Has difficulty using essential collaboration tools",
              "Fails to demonstrate proficiency in relevant technologies"
            ]
          },
          "questions": [
            {
              "id": 3,
              "category": "Skills",
              "type": "behavioral",
              "difficulty": "advanced",
              "question_text": "Provide an example of a complex problem you solved using programming skills. What was your approach?",
              "evaluation_criteria": "Ability to articulate technical problem-solving processes.",
              "expected_answers": "Clear steps taken, technologies used, and the outcome achieved.",
              "follow_up_probes": [
                "What challenges did you face during implementation?",
                "How did you ensure the solution met user needs?"
              ],
              "red_flag_indicators": [
                "Inability to explain problem-solving processes clearly",
                "Lack of technical depth or specificity"
              ]
            },
            {
              "id": 4,
              "category": "Skills",
              "type": "behavioral",
              "difficulty": "intermediate",
              "question_text": "Discuss how you have utilized collaboration tools (like Jira or Slack) in managing a project.",
              "evaluation_criteria": "Experience and proficiency with tools for project management and team collaboration.",
              "expected_answers": "Examples of managing tasks or communication via tools.",
              "follow_up_probes": [
                "How did those tools improve project outcomes?",
                "What features did you find most beneficial, and why?"
              ],
              "red_flag_indicators": [
                "Negative or vague responses about tool effectiveness",
                "Limited exposure to collaboration tools"
              ]
            }
          ]
        },
        "Ability": {
          "attribute": {
            "definition": "Capacity to lead projects and produce results effectively.",
            "evaluation_scale": {
              "1": "Cannot perform job duty",
              "2": "Cannot perform job duty",
              "3": "Requires significant training/guidance to perform job duty",
              "4": "Requires significant training/guidance to perform job duty",
              "5": "Able to perform job duties with minimal guidance",
              "6": "Able to perform job duties with minimal guidance",
              "7": "Able to perform job duties and positively impact performance of peers",
              "8": "Able to perform job duties and positively impact performance of peers",
              "9": "Transforms the way the team delivers",
              "10": "Transforms the way the team delivers"
            },
            "weighting": 25,
            "red_flags": [
              "Inconsistent performance in team or leadership roles",
              "Failure to demonstrate initiative or accountability",
              "Limited results in previous projects or roles"
            ]
          },
          "questions": [
            {
              "id": 5,
              "category": "Ability",
              "type": "behavioral",
              "difficulty": "advanced",
              "question_text": "Can you describe a time when you were responsible for a project? What was the outcome, and what did you learn?",
              "evaluation_criteria": "Demonstration of leadership skills and accountability for project outcomes.",
              "expected_answers": "Clear descriptions of roles, challenges faced, and personal growth.",
              "follow_up_probes": [
                "How did you measure success for the project?",
                "What would you do differently if you could lead that project again?"
              ],
              "red_flag_indicators": [
                "Vague explanations of projects",
                "Inability to accept responsibility for project outcomes"
              ]
            },
            {
              "id": 6,
              "category": "Ability",
              "type": "behavioral",
              "difficulty": "intermediate",
              "question_text": "Describe a situation where you identified a significant opportunity to improve a process. How did you approach it?",
              "evaluation_criteria": "Ability to identify and implement process improvements.",
              "expected_answers": "Specific improvements made and the impact on efficiency or outcomes.",
              "follow_up_probes": [
                "What factors did you consider while proposing the change?",
                "How did you communicate this change to your team?"
              ],
              "red_flag_indicators": [
                "Inability to identify opportunities for improvement",
                "No clear examples of changes made or their results"
              ]
            }
          ]
        }
      },
      "CoreValues_CompanyFit": {
        "Innovation": {
          "questions": [
            {
              "id": 1,
              "category": "Innovation",
              "type": "behavioral",
              "question_text": "Describe an innovative idea you proposed in a previous role. What was the idea, and what impact did it have?",
              "sample_indicators": {
                "strong_response": "Clearly articulates a novel idea and quantifies its positive impact.",
                "weak_response": "Struggles to describe the idea or its outcomes."
              },
              "follow_up_probes": [
                "What challenges did you face when implementing this idea?",
                "How were you able to gain buy-in from your team?"
              ]
            },
            {
              "id": 2,
              "category": "Innovation",
              "type": "behavioral",
              "question_text": "Can you provide an example when you took a calculated risk that led to a successful outcome?",
              "sample_indicators": {
                "strong_response": "Clearly explains the rationale for risk-taking and the successful result.",
                "weak_response": "Fails to provide a concrete example or avoid responsibility."
              },
              "follow_up_probes": [
                "How did you evaluate the potential risks?",
                "If the idea did not succeed, what did you learn?"
              ]
            }
          ]
        },
        "Excellence": {
          "questions": [
            {
              "id": 3,
              "category": "Excellence",
              "type": "behavioral",
              "question_text": "How do you ensure that your work consistently meets or exceeds quality standards?",
              "sample_indicators": {
                "strong_response": "Describes specific quality assurance processes employed.",
                "weak_response": "General statements that lack detail."
              },
              "follow_up_probes": [
                "Can you describe a time when you had to improve the quality of your work?",
                "How do you handle feedback regarding your work's quality?"
              ]
            },
            {
              "id": 4,
              "category": "Excellence",
              "type": "behavioral",
              "question_text": "Can you share a situation where you went above and beyond what was expected of you?",
              "sample_indicators": {
                "strong_response": "Details clear and measurable contributions beyond normal duties.",
                "weak_response": "Lacks examples or dwells on responsibilities alone."
              },
              "follow_up_probes": [
                "What prompted you to go above and beyond?",
                "What was the outcome of your extra efforts?"
              ]
            }
          ]
        },
        "Collaboration": {
          "questions": [
            {
              "id": 5,
              "category": "Collaboration",
              "type": "behavioral",
              "question_text": "Describe a time when you had to work with a difficult team member. How did you handle that situation?",
              "sample_indicators": {
                "strong_response": "Illustrates effective conflict resolution strategies.",
                "weak_response": "Blames others without suggesting a resolution."
              },
              "follow_up_probes": [
                "What was the outcome of your interaction?",
                "What did you learn from that experience?"
              ]
            },
            {
              "id": 6,
              "category": "Collaboration",
              "type": "behavioral",
              "question_text": "Tell me about a successful team project you contributed to. What was your role?",
              "sample_indicators": {
                "strong_response": "Describes a specific team project highlighting collaboration.",
                "weak_response": "Vague descriptions of team contributions or lack of clarity."
              },
              "follow_up_probes": [
                "How did you promote teamwork and cohesion?",
                "What challenges did the team face, and how did you overcome them?"
              ]
            }
          ]
        },
        "Growth": {
          "questions": [
            {
              "id": 7,
              "category": "Growth",
              "type": "behavioral",
              "question_text": "What steps have you taken in the past year to enhance your professional skills?",
              "sample_indicators": {
                "strong_response": "Details specific actions taken for professional development.",
                "weak_response": "General statements about wanting to learn but without action steps."
              },
              "follow_up_probes": [
                "Can you provide examples of how these skills have been applied?",
                "How do you plan to continue your growth in the next year?"
              ]
            },
            {
              "id": 8,
              "category": "Growth",
              "type": "behavioral",
              "question_text": "Describe a failure or setback you've experienced. How did you respond and what did you learn?",
              "sample_indicators": {
                "strong_response": "Openly discusses failure and identifies learning outcomes.",
                "weak_response": "Blames others or avoids discussing failure."
              },
              "follow_up_probes": [
                "What changes did you implement to prevent future setbacks?",
                "How did this experience impact your approach to challenges?"
              ]
            }
          ]
        }
      }
    }

    setJsonInput(JSON.stringify(ksaExample, null, 2))
    setError('')
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
          {ksaData && (
            <Button variant="outline" onClick={() => onKSAUpload(null)} size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Paste KSA JSON</label>
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
  candidates: SimpleCandidate[]
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
                      {candidate.firstName} {candidate.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Age: {candidate.age}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      ID: {candidate.id.split('-')[1]}
                    </div>
                    <div className="text-muted-foreground">Candidate</div>
                  </div>
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
  const candidatesAtomValue = useAtomValue(candidatesAtom)
  const candidates = Object.values(candidatesAtomValue)
  const [selectedCandidateIds, setSelectedCandidateIds] = useAtom(selectedCandidateIdsAtom)
  const [ksaData, setKSAData] = useState<KSAInterviewOutput | null>(null)
  const [evaluations, setEvaluations] = useState<CandidateEvaluation[]>([])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationProgress, setEvaluationProgress] = useState(0)
  const [addEvaluation] = useAtom(addCandidateEvaluationAtom) as unknown as [(args: { candidateId: string; evaluation: CandidateEvaluation }) => void, any]
  const [trackJobEvaluation] = useAtom(trackCandidateJobEvaluationAtom) as unknown as [(args: { candidateId: string; jobTitle: string }) => void, any]

  const handleKSAUpload = (ksa: KSAInterviewOutput | null) => {
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

      // try {
      //   const evaluation = await evaluateCandidateKSA(
      //     candidate,
      //     ksaData,
      //     undefined,
      //     ksaData.KSA_JobFit ? Object.keys(ksaData.KSA_JobFit)[0] : 'Unknown Position'
      //   )

      //   newEvaluations.push(evaluation)

      //   // Store evaluation in atom
      //   addEvaluation({ candidateId, evaluation })

      //   // Track job evaluation for this candidate
      //   const jobTitle = evaluation.evaluationContext.jobTitle
      //   if (jobTitle) {
      //     trackJobEvaluation({ candidateId, jobTitle })
      //   }

      //   setEvaluationProgress(((i + 1) / selectedCandidateIds.length) * 100)
      // } catch (error) {
      //   console.error(`Failed to evaluate candidate ${candidateId}:`, error)
      // }
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

      <Tabs defaultValue="ksa-framework" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ksa-framework" className="flex items-center gap-2">
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

        {/* KSA Framework Tab */}
        <TabsContent value="ksa-framework">
          <KSAInput onKSAUpload={handleKSAUpload} ksaData={ksaData} />
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