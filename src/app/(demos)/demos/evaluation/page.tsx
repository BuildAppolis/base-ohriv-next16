/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Slider, SliderThumb } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetTrigger } from '@/components/ui/sheet'
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
  if (recommendation === 'recommend' || recommendation === 'Recommend' || recommendation === 'consider') return "secondary"
  return "destructive"
}

type KSACategoryKey = 'Knowledge' | 'Skills' | 'Ability'

type WeightRangeState = Record<KSACategoryKey, [number, number]>
type ValueWeightRangeState = Record<string, [number, number]>
type WeightMode = 'range' | 'fixed'

type AttributeEvaluationState = {
  score: number
  notes: string
  askedQuestions: number[]
}
import {
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  BarChart3,
  Download,
  SlidersHorizontal,
  FileJson,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

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
              "type": "technical",
              "difficulty": "advanced",
              "question_text": "How would you design a migration from a monolith to services with minimal downtime?",
              "evaluation_criteria": "Understands domain boundaries, data strategy, rollout/rollback.",
              "expected_answers": "Strangler pattern, data migration, canary/blue-green, observability.",
              "follow_up_probes": [
                "How would you handle shared data models?",
                "What rollback signals would you watch?"
              ],
              "red_flag_indicators": [
                "Ignores rollback",
                "No plan for data migration"
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
              "type": "practical",
              "difficulty": "advanced",
              "question_text": "Live refactor: improve this function for readability and performance.",
              "evaluation_criteria": "Clean code, testing, clear rationale, avoids premature optimization.",
              "expected_answers": "Adds tests, simplifies logic, explains choices.",
              "follow_up_probes": [
                "Why that data structure?",
                "How would you benchmark this?"
              ],
              "red_flag_indicators": [
                "No tests",
                "Focuses only on micro-optimizations"
              ]
            },
            {
              "id": 4,
              "category": "Skills",
              "type": "situational",
              "difficulty": "intermediate",
              "question_text": "You join a sprint mid-cycle and discover major scope risk. What do you do first?",
              "evaluation_criteria": "Stakeholder comms, risk reduction, reprioritization.",
              "expected_answers": "Surface risk, propose options, replan with team/stakeholders.",
              "follow_up_probes": [
                "How do you keep the team aligned?",
                "When do you push back on scope?"
              ],
              "red_flag_indicators": [
                "Silent escalation",
                "Ignores stakeholders"
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
              "type": "screening",
              "question_text": "Can you provide an example when you took a calculated risk that led to a successful outcome? What did you learn if it failed?",
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
              "type": "process",
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
              "type": "situational",
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
      <CardHeader className='py-4'>
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
      <CardHeader className='py-4'>
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
  const [weightMode, setWeightMode] = useState<WeightMode>('range')
  const [weightRanges, setWeightRanges] = useState<WeightRangeState>({
    Knowledge: [35, 45],
    Skills: [30, 40],
    Ability: [20, 35]
  })
  const [fixedKSAWeights, setFixedKSAWeights] = useState<Record<KSACategoryKey, number>>({
    Knowledge: 34,
    Skills: 33,
    Ability: 33
  })
  const [valueWeightRanges, setValueWeightRanges] = useState<ValueWeightRangeState>({})
  const [fixedValueWeights, setFixedValueWeights] = useState<Record<string, number>>({})
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null)
  const [isGradeSheetOpen, setIsGradeSheetOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<KSACategoryKey | null>(null)
  const [candidateStates, setCandidateStates] = useState<Record<string, Record<KSACategoryKey, AttributeEvaluationState>>>({})
  const [completedAttributes, setCompletedAttributes] = useState<Record<string, KSACategoryKey[]>>({})
  const [addEvaluation] = useAtom(addCandidateEvaluationAtom) as unknown as [(args: { candidateId: string; evaluation: CandidateEvaluation }) => void, any]
  const [trackJobEvaluation] = useAtom(trackCandidateJobEvaluationAtom) as unknown as [(args: { candidateId: string; jobTitle: string }) => void, any]

  const activePosition = useMemo(() => (ksaData?.positions || ksaData?.Positions)?.[0], [ksaData])

  const jobFitData = useMemo(() => {
    return ksaData?.KSA_JobFit || activePosition?.KSA_JobFit || null
  }, [ksaData, activePosition])

  const coreValuesData = useMemo(() => {
    return ksaData?.CoreValues_CompanyFit || activePosition?.CoreValues_CompanyFit || null
  }, [ksaData, activePosition])

  const weightingDistribution = useMemo(() => {
    const fromFramework = ksaData?.KSA_Framework?.weightingDistribution || activePosition?.KSA_Framework?.weightingDistribution
    if (fromFramework) return fromFramework

    const fromKSAs = ksaData?.KSAs || activePosition?.KSAs
    if (fromKSAs) {
      return {
        Knowledge: fromKSAs.Knowledge?.weighting ?? 40,
        Skills: fromKSAs.Skills?.weighting ?? 35,
        Ability: fromKSAs.Ability?.weighting ?? 25
      }
    }

    return null
  }, [ksaData, activePosition])

  const ksaCategories = useMemo(() => {
    const available: KSACategoryKey[] = []
      ; (['Knowledge', 'Skills', 'Ability'] as KSACategoryKey[]).forEach((key) => {
        if ((jobFitData as any)?.[key]) {
          available.push(key)
        }
      })
    return available
  }, [jobFitData])

  const coreValueKeys = useMemo(() => coreValuesData ? Object.keys(coreValuesData) : [], [coreValuesData])

  const createEmptyCandidateState = (): Record<KSACategoryKey, AttributeEvaluationState> => ({
    Knowledge: { score: 5, notes: '', askedQuestions: [] },
    Skills: { score: 5, notes: '', askedQuestions: [] },
    Ability: { score: 5, notes: '', askedQuestions: [] }
  })

  useEffect(() => {
    if (!selectedCandidateIds.length) {
      setActiveCandidateId(null)
      return
    }

    if (!activeCandidateId || !selectedCandidateIds.includes(activeCandidateId)) {
      setActiveCandidateId(selectedCandidateIds[0])
    }
  }, [selectedCandidateIds, activeCandidateId])

  useEffect(() => {
    setCandidateStates((prev) => {
      const next = { ...prev }
      selectedCandidateIds.forEach((id) => {
        if (!next[id]) {
          next[id] = createEmptyCandidateState()
        }
      })
      return next
    })
  }, [selectedCandidateIds])

  useEffect(() => {
    if (ksaCategories.length) {
      setSelectedCategory((prev) => (prev && ksaCategories.includes(prev) ? prev : ksaCategories[0]))
    } else {
      setSelectedCategory(null)
    }
  }, [ksaCategories])

  useEffect(() => {
    if (!weightingDistribution) return

    const clampRange = (value: number): [number, number] => [
      Math.max(0, Math.round(value - 5)),
      Math.min(100, Math.round(value + 5))
    ]

    setWeightRanges({
      Knowledge: clampRange(weightingDistribution.Knowledge ?? 40),
      Skills: clampRange(weightingDistribution.Skills ?? 35),
      Ability: clampRange(weightingDistribution.Ability ?? 25)
    })
  }, [weightingDistribution])

  useEffect(() => {
    if (!coreValueKeys.length) {
      setValueWeightRanges({})
      setFixedValueWeights({})
      return
    }
    const equalShare = Math.round(100 / coreValueKeys.length)
    const makeRange = (base: number): [number, number] => [
      Math.max(0, base - 5),
      Math.min(100, base + 5)
    ]
    setValueWeightRanges((prev) => {
      const next: ValueWeightRangeState = {}
      coreValueKeys.forEach((key) => {
        next[key] = prev[key] || makeRange(equalShare)
      })
      return next
    })
    setFixedValueWeights((prev) => {
      const next: Record<string, number> = {}
      const existingTotal = coreValueKeys.reduce((acc, key) => acc + (prev[key] ?? 0), 0)
      coreValueKeys.forEach((key) => {
        next[key] = prev[key] ?? (existingTotal ? Math.round(100 / coreValueKeys.length) : equalShare)
      })
      return next
    })
  }, [coreValueKeys])

  const normalizedWeights = useMemo(() => {
    if (weightMode === 'fixed') return fixedKSAWeights

    const midpoints = {
      Knowledge: (weightRanges.Knowledge[0] + weightRanges.Knowledge[1]) / 2,
      Skills: (weightRanges.Skills[0] + weightRanges.Skills[1]) / 2,
      Ability: (weightRanges.Ability[0] + weightRanges.Ability[1]) / 2
    }
    const total = midpoints.Knowledge + midpoints.Skills + midpoints.Ability
    if (!total) {
      return { Knowledge: 34, Skills: 33, Ability: 33 }
    }

    const knowledgeWeight = Math.round((midpoints.Knowledge / total) * 100)
    const skillsWeight = Math.round((midpoints.Skills / total) * 100)
    const abilityWeight = Math.max(100 - knowledgeWeight - skillsWeight, 0)

    return {
      Knowledge: knowledgeWeight,
      Skills: skillsWeight,
      Ability: abilityWeight
    }
  }, [weightRanges, weightMode, fixedKSAWeights])

  const normalizedValueWeights = useMemo(() => {
    if (!coreValueKeys.length) return {}

    if (weightMode === 'fixed') return fixedValueWeights

    const midpointEntries = coreValueKeys.map((key) => {
      const range = valueWeightRanges[key] || [30, 40]
      return [key, (range[0] + range[1]) / 2] as const
    })
    const total = midpointEntries.reduce((acc, [, mid]) => acc + mid, 0)
    if (!total) {
      const even = Math.round(100 / coreValueKeys.length)
      return Object.fromEntries(coreValueKeys.map((k) => [k, even]))
    }
    const weights = midpointEntries.map(([key, mid]) => [key, Math.round((mid / total) * 100)] as const)
    return Object.fromEntries(weights)
  }, [coreValueKeys, valueWeightRanges, fixedValueWeights, weightMode])

  const handleKSAUpload = (ksa: KSAInterviewOutput | null) => {
    setKSAData(ksa)
    setEvaluations([])
    setSelectedCandidateIds([])
    setActiveCandidateId(null)
    setCandidateStates({})
    setCompletedAttributes({})
    setValueWeightRanges({})
  }

  const activeCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === activeCandidateId),
    [activeCandidateId, candidates]
  )

  const activeCandidateState = activeCandidateId ? candidateStates[activeCandidateId] : undefined

  const selectedCategoryData = selectedCategory ? (jobFitData as any)?.[selectedCategory] : null

  const questionsForCategory = selectedCategoryData?.questions || []

  const toggleQuestionAsked = (category: KSACategoryKey, questionId: number) => {
    if (!activeCandidateId) return

    setCandidateStates((prev) => {
      const next = { ...prev }
      const candidateState = next[activeCandidateId] || createEmptyCandidateState()
      const asked = new Set(candidateState[category].askedQuestions)
      if (asked.has(questionId)) {
        asked.delete(questionId)
      } else {
        asked.add(questionId)
      }
      candidateState[category] = { ...candidateState[category], askedQuestions: Array.from(asked) }
      next[activeCandidateId] = candidateState
      return next
    })
  }

  const handleScoreChange = (category: KSACategoryKey, value: number[]) => {
    if (!activeCandidateId) return

    setCandidateStates((prev) => {
      const next = { ...prev }
      const candidateState = next[activeCandidateId] || createEmptyCandidateState()
      candidateState[category] = { ...candidateState[category], score: value[0] }
      next[activeCandidateId] = candidateState
      return next
    })
  }

  const handleNotesChange = (category: KSACategoryKey, value: string) => {
    if (!activeCandidateId) return

    setCandidateStates((prev) => {
      const next = { ...prev }
      const candidateState = next[activeCandidateId] || createEmptyCandidateState()
      candidateState[category] = { ...candidateState[category], notes: value }
      next[activeCandidateId] = candidateState
      return next
    })
  }

  const handleSaveAttribute = (category: KSACategoryKey) => {
    if (!activeCandidateId) return

    setCompletedAttributes((prev) => {
      const existing = new Set(prev[activeCandidateId] || [])
      existing.add(category)
      return { ...prev, [activeCandidateId]: Array.from(existing) }
    })
  }

  const computeConfidence = (category: KSACategoryKey) => {
    const totalQuestions = ((jobFitData as any)?.[category]?.questions || []).length
    const asked = activeCandidateState?.[category]?.askedQuestions.length || 0
    if (!totalQuestions) return 6
    return Math.min(10, Math.max(4, Math.round((asked / totalQuestions) * 10)))
  }

  const buildEvaluation = (candidateId: string): CandidateEvaluation | null => {
    const candidateState = candidateStates[candidateId]
    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidateState || !candidate) return null

    const knowledgeScore = candidateState.Knowledge.score
    const skillsScore = candidateState.Skills.score
    const abilityScore = candidateState.Ability.score

    const weightedScore = Number(
      (
        (knowledgeScore * normalizedWeights.Knowledge +
          skillsScore * normalizedWeights.Skills +
          abilityScore * normalizedWeights.Ability) / 100
      ).toFixed(1)
    )

    const recommendation: CandidateEvaluation['overallCompatibility']['recommendation'] =
      weightedScore >= 8
        ? 'strong-recommend'
        : weightedScore >= 6
          ? 'recommend'
          : weightedScore >= 4
            ? 'consider'
            : 'reject'

    const strengths: string[] = []
    const concerns: string[] = []
    const interviewFocus: string[] = []

      ; (['Knowledge', 'Skills', 'Ability'] as KSACategoryKey[]).forEach((key) => {
        const score = candidateState[key].score
        const weight = normalizedWeights[key]
        if (score >= 8) strengths.push(`${key} is a standout (${score}/10, weight ${weight}%)`)
        if (score <= 5) concerns.push(`${key} needs attention (${score}/10)`)
        if (score < 7 && weight >= 30) interviewFocus.push(`${key} deep dive`)
      })

    const jobTitle = activePosition?.title || activePosition?.position || 'KSA Job Fit'

    return {
      candidateId,
      evaluationContext: {
        jobTitle,
        ksaFramework: ksaData || undefined,
        evaluationDate: new Date().toISOString(),
        evaluator: 'KSA Evaluation Center'
      },
      scores: {
        knowledge: {
          overall: knowledgeScore,
          breakdown: { weighting: normalizedWeights.Knowledge },
          confidence: computeConfidence('Knowledge'),
          notes: candidateState.Knowledge.notes
        },
        skills: {
          overall: skillsScore,
          breakdown: { weighting: normalizedWeights.Skills },
          confidence: computeConfidence('Skills'),
          notes: candidateState.Skills.notes
        },
        abilities: {
          overall: abilityScore,
          breakdown: { weighting: normalizedWeights.Ability },
          confidence: computeConfidence('Ability'),
          notes: candidateState.Ability.notes
        }
      },
      overallCompatibility: {
        score: weightedScore,
        recommendation,
        strengths,
        concerns,
        interviewFocus
      },
      predictedPerformance: {
        behavioral: Math.max(3, Math.round((abilityScore + skillsScore) / 2)),
        technical: Math.max(3, Math.round((skillsScore + knowledgeScore) / 2)),
        cultural: Math.max(3, Math.round((abilityScore + knowledgeScore) / 2)),
        overall: Math.max(3, Math.round(weightedScore))
      }
    }
  }

  const handleSaveCandidateEvaluation = () => {
    if (!activeCandidateId) return
    const evaluation = buildEvaluation(activeCandidateId)
    if (!evaluation) return

    setEvaluations((prev) => {
      const filtered = prev.filter((ev) => ev.candidateId !== activeCandidateId)
      return [...filtered, evaluation]
    })

    addEvaluation({ candidateId: activeCandidateId, evaluation })
    const jobTitle = evaluation.evaluationContext.jobTitle || 'KSA Job Fit'
    trackJobEvaluation({ candidateId: activeCandidateId, jobTitle })
  }

  const handleExportEvaluations = () => {
    const exportData = {
      evaluations,
      ksaFramework: ksaData,
      weightMode,
      weightRanges,
      valueWeightRanges,
      normalizedValueWeights,
      normalizedWeights,
      fixedKSAWeights,
      fixedValueWeights,
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">KSA Evaluation Center</h1>
          <p className="text-muted-foreground">
            Load a KSA, pick your acceptable weighting ranges, choose candidates, and grade them like the Candidate Evaluation System.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {ksaData && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              KSA Loaded
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">Step 1 · Load KSA JSON</Badge>
          <KSAInput onKSAUpload={handleKSAUpload} ksaData={ksaData} />
        </div>

        {ksaData && (
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Step 2 · Choose weight acceptance ranges
              </CardTitle>
              <CardDescription>
                Set the acceptable range for each KSA weighting and company value weighting. We normalize midpoints to 100% when scoring.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Weighting Mode</Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={weightMode === 'range' ? "primary" : "outline"}
                    onClick={() => setWeightMode('range')}
                  >
                    Ranges
                  </Button>
                  <Button
                    size="sm"
                    variant={weightMode === 'fixed' ? "primary" : "outline"}
                    onClick={() => setWeightMode('fixed')}
                  >
                    Fixed (100% total)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Knowledge', 'Skills', 'Ability'] as KSACategoryKey[]).map((category) => {
                  const distributionValue = weightingDistribution?.[category] ?? normalizedWeights[category]
                  const [minWeight, maxWeight] = weightRanges[category]
                  const inRange = distributionValue >= minWeight && distributionValue <= maxWeight
                  const fixedValue = fixedKSAWeights[category]
                  return (
                    <Card
                      key={category}
                      className={cn(
                        "border-dashed",
                        !inRange && "border-amber-300 bg-amber-50/50"
                      )}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{category}</CardTitle>
                        <CardDescription>
                          Framework weight: {distributionValue || 0}% • Scoring weight: {normalizedWeights[category]}%
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {weightMode === 'range' ? (
                          <>
                            <Slider
                              value={weightRanges[category]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(value) => setWeightRanges((prev) => ({ ...prev, [category]: value as [number, number] }))}
                              className="pt-2"
                            >
                              <SliderThumb />
                              <SliderThumb />
                            </Slider>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{minWeight}%</span>
                              <span>{maxWeight}%</span>
                            </div>
                            <Badge variant={inRange ? "outline" : "destructive"} className="w-full justify-center">
                              {inRange ? 'Within preferred range' : 'Outside preferred range'}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Slider
                              value={[fixedValue]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(value) => setFixedKSAWeights((prev) => rebalanceWeights(prev, category, value[0]))}
                              className="pt-2"
                            >
                              <SliderThumb />
                            </Slider>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>0%</span>
                              <span>{fixedValue}%</span>
                              <span>100%</span>
                            </div>

                          </>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-4 w-4" />
                Normalized KSA weights: {normalizedWeights.Knowledge}% / {normalizedWeights.Skills}% / {normalizedWeights.Ability}% (K/S/A).
              </div>

              {coreValueKeys.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Company Values Weighting</h4>
                    <Badge variant="secondary">{coreValueKeys.length} values</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coreValueKeys.map((valueKey) => {
                      const [minWeight, maxWeight] = valueWeightRanges[valueKey] || [25, 35]
                      const scoringWeight = normalizedValueWeights[valueKey] || Math.round(100 / coreValueKeys.length)
                      const fixedValue = fixedValueWeights[valueKey] ?? Math.round(100 / coreValueKeys.length)
                      return (
                        <Card key={valueKey} className="border-dashed">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{valueKey}</CardTitle>
                            <CardDescription>Scoring weight: {scoringWeight}%</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {weightMode === 'range' ? (
                              <>
                                <Slider
                                  value={valueWeightRanges[valueKey] || [25, 35]}
                                  min={0}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => setValueWeightRanges((prev) => ({ ...prev, [valueKey]: value as [number, number] }))}
                                  className="pt-2"
                                >
                                  <SliderThumb />
                                  <SliderThumb />
                                </Slider>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>{minWeight}%</span>
                                  <span>{maxWeight}%</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <Slider
                                  value={[fixedValue]}
                                  min={0}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => setFixedValueWeights((prev) => rebalanceWeights(prev, valueKey, value[0]))}
                                  className="pt-2"
                                >
                                  <SliderThumb />
                                </Slider>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>0%</span>
                                  <span>{fixedValue}%</span>
                                  <span>100%</span>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="h-4 w-4" />
                    Normalized company values weights: {coreValueKeys.map((key, idx) => `${key} ${normalizedValueWeights[key] || Math.round(100 / coreValueKeys.length)}%`).join(' • ')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {ksaData && (
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit">Step 3 · Choose candidates</Badge>
            <CandidateSelection candidates={candidates} selectedIds={selectedCandidateIds} onSelectionChange={setSelectedCandidateIds} />
            {selectedCandidateIds.length > 0 && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-muted-foreground">Active candidate:</span>
                {selectedCandidateIds.map((id) => {
                  const candidate = candidates.find((c) => c.id === id)
                  return (
                    <Button
                      key={id}
                      size="sm"
                      variant={activeCandidateId === id ? "primary" : "outline"}
                      onClick={() => setActiveCandidateId(id)}
                    >
                      {candidate?.firstName} {candidate?.lastName}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {ksaData && activeCandidateId && selectedCategory && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader className='py-4'>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle className="text-xl">Step 4 · Grade against the KSA</CardTitle>
                    <CardDescription>
                      Pick an attribute, ask the KSA questions, then score it 1-10.
                    </CardDescription>
                    {activeCandidate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Evaluating {activeCandidate.firstName} {activeCandidate.lastName}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {completedAttributes[activeCandidateId]?.length || 0} / {ksaCategories.length} attributes saved
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ksaCategories.map((category) => {
                    const categoryData = (jobFitData as any)?.[category]
                    const questionCount = (categoryData?.questions || []).length
                    const distributionValue = weightingDistribution?.[category] ?? normalizedWeights[category]
                    const isCompleted = completedAttributes[activeCandidateId]?.includes(category)
                    return (
                      <Card
                        key={category}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-sm",
                          selectedCategory === category && "ring-2 ring-primary",
                          isCompleted && "bg-muted/60"
                        )}
                        onClick={() => setSelectedCategory(category)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            {category}
                            {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </CardTitle>
                          <CardDescription className="space-y-1">
                            <span>{questionCount} {questionCount === 1 ? 'question' : 'questions'}</span>
                            <div className="text-xs text-muted-foreground">Weight {distributionValue || 0}%</div>
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Questions for {selectedCategory}</CardTitle>
                      <CardDescription>Mark what you asked so we can track confidence.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {questionsForCategory.length === 0 && (
                        <div className="text-muted-foreground text-sm">No questions in this KSA bucket.</div>
                      )}
                      <div className="space-y-3">
                        {questionsForCategory.map((question: any, idx: number) => {
                          const qId = question.id || idx
                          const label = question.questionText || question.question_text
                          const description = question.evaluationCriteria || question.evaluation_criteria
                          const expected = question.expectedAnswers || question.expected_answers
                          const followUps = question.followUpProbes || question.follow_up_probes
                          const isAsked = activeCandidateState?.[selectedCategory]?.askedQuestions.includes(qId)
                          return (
                            <div
                              key={qId}
                              className={cn(
                                "p-3 rounded-md border",
                                isAsked && "border-primary/40 bg-primary/5"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  className="mt-1 h-4 w-4"
                                  checked={!!isAsked}
                                  onChange={() => toggleQuestionAsked(selectedCategory, qId)}
                                />
                                <div className="space-y-1">
                                  <div className="font-medium">Question {idx + 1}: {label}</div>
                                  {description && (
                                    <div className="text-sm text-muted-foreground">Criteria: {description}</div>
                                  )}
                                  {expected && (
                                    <div className="text-xs text-muted-foreground">Expected: {expected}</div>
                                  )}
                                  {followUps && (
                                    <div className="text-xs text-muted-foreground">Follow-ups: {followUps.join('; ')}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Score {selectedCategory}</CardTitle>
                      <CardDescription>Set the 1-10 score and add notes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg">{activeCandidateState?.[selectedCategory]?.score || 5}/10</span>
                          <span className="text-muted-foreground">Weight {normalizedWeights[selectedCategory]}%</span>
                        </div>
                        <Badge variant="outline">Confidence {computeConfidence(selectedCategory)}/10</Badge>
                      </div>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[activeCandidateState?.[selectedCategory]?.score || 5]}
                        onValueChange={(value) => handleScoreChange(selectedCategory, value)}
                      >
                        <SliderThumb />
                      </Slider>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1-3 Needs improvement</span>
                        <span>4-6 Acceptable</span>
                        <span>7-10 Excellent</span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          value={activeCandidateState?.[selectedCategory]?.notes || ''}
                          onChange={(e) => handleNotesChange(selectedCategory, e.target.value)}
                          placeholder="Observations, examples, or red flags..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 justify-between">
                        <Button variant="outline" onClick={() => handleSaveAttribute(selectedCategory)}>
                          Save attribute progress
                        </Button>
                        <Button onClick={handleSaveCandidateEvaluation}>
                          Save candidate evaluation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {evaluations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Results</Badge>
                <span className="text-sm text-muted-foreground">Saved evaluations for graded candidates</span>
              </div>
              <Button variant="outline" onClick={handleExportEvaluations}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
            <EvaluationResults evaluations={evaluations} />
          </div>
        )}
      </div>
    </div>
  )
}
const rebalanceWeights = <T extends string>(weights: Record<T, number>, targetKey: T, newValue: number) => {
  const keys = Object.keys(weights) as T[]
  const next: Record<T, number> = { ...weights }
  const clampedValue = Math.max(0, Math.min(100, Math.round(newValue)))
  const others = keys.filter((k) => k !== targetKey)
  if (!others.length) {
    next[targetKey] = 100
    return next
  }

  const remaining = Math.max(0, 100 - clampedValue)
  const otherTotal = others.reduce((acc, key) => acc + (weights[key] ?? 0), 0)

  if (otherTotal === 0) {
    const share = Math.round(remaining / others.length)
    others.forEach((key) => { next[key] = share })
  } else {
    others.forEach((key) => {
      next[key] = Math.max(0, Math.round(((weights[key] ?? 0) / otherTotal) * remaining))
    })
  }

  next[targetKey] = clampedValue

  const totalAfter = Object.values(next).reduce((acc, v) => acc + v, 0)
  const delta = 100 - totalAfter
  if (delta !== 0) {
    const adjustKey = others[0] ?? targetKey
    next[adjustKey] = Math.max(0, next[adjustKey] + delta)
  }
  return next
}
