'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider, SliderThumb } from '@/components/ui/slider'
import { Info, CheckCircle2, AlertCircle, Zap, User, Briefcase, Target, FileJson, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue } from 'jotai'
import { candidatesAtom } from '@/lib/atoms/candidate-atoms'
import {
  stageKSAScoresAtom,
  evaluationSessionsAtom,
  currentSessionIdAtom,
  currentStageIdAtom,
  currentEvaluatorNameAtom,
  selectedKSAFrameworkAtom,
  selectedJobCategoryAtom,
  startEvaluationSessionAtom,
  saveAttributeScoreAtom,
  completeStageEvaluationAtom,
  currentSessionAtom,
  currentStageScoresAtom,
  isStageCompletedAtom,
  getCandidateCompletionStatusAtom,
  EVALUATION_STAGES,
  EVALUATION_ATTRIBUTES
} from '@/lib/atoms/multistage-ksa-atoms'
import { evaluateCandidateKSA } from '@/lib/candidate-ksa-evaluator'
import { KSAInterviewOutput } from '@/types/company_old/ksa'

// Import existing demo data from the original page
interface AnswerCharacteristics {
  poor: string[]
  average: string[]
  great: string[]
}

interface DemoAttribute {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

interface DemoQuestion {
  id: string
  text: string
  description: string
  difficultyLevel: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert'
  attributeIds: string[]
  stageId: string
  expectations: {
    answerCharacteristics: AnswerCharacteristics
    followUpQuestions?: string[]
  }
}

interface DemoStage {
  id: string
  name: string
  description: string
  order: number
  color: string
}

interface CandidateAnswer {
  questionId: string
  answer: string
}

// Demo data (simplified version of original)
const demoStages: DemoStage[] = EVALUATION_STAGES

const demoAttributes: DemoAttribute[] = EVALUATION_ATTRIBUTES

const demoQuestions: DemoQuestion[] = [
  {
    id: 'q-1',
    text: 'Describe your experience with React and Next.js',
    description: 'Evaluates technical depth in modern web frameworks',
    difficultyLevel: 'Intermediate',
    attributeIds: ['technicalSkills'],
    stageId: 'stage-2',
    expectations: {
      answerCharacteristics: {
        poor: ['Cannot explain basic React concepts', 'No hands-on Next.js experience'],
        average: ['Understands React fundamentals', 'Some Next.js experience but limited'],
        great: ['Deep understanding of React hooks and patterns', 'Extensive Next.js 13+ App Router experience']
      }
    }
  },
  {
    id: 'q-2',
    text: 'Tell me about a time you had to explain a complex technical concept to a non-technical stakeholder',
    description: 'Assesses communication and stakeholder management',
    difficultyLevel: 'Intermediate',
    attributeIds: ['communication'],
    stageId: 'stage-1',
    expectations: {
      answerCharacteristics: {
        poor: ['Cannot simplify technical jargon', 'Shows impatience with non-technical audience'],
        average: ['Provides an example but lacks detail', 'Some attempt to simplify concepts'],
        great: ['Uses analogies and visual aids effectively', 'Tailors explanation to audience level']
      }
    }
  },
  {
    id: 'q-3',
    text: 'Describe a situation where you had to learn a new technology quickly under pressure',
    description: 'Evaluates adaptability and learning agility',
    difficultyLevel: 'Intermediate',
    attributeIds: ['adaptability'],
    stageId: 'stage-1',
    expectations: {
      answerCharacteristics: {
        poor: ['Struggles with learning new things', 'No concrete example'],
        average: ['Can learn when given time', 'Basic example provided'],
        great: ['Systematic learning approach', 'Leverages documentation and community resources']
      }
    }
  },
  {
    id: 'q-4',
    text: 'How do you handle disagreements with team members about technical decisions?',
    description: 'Tests communication and collaboration skills',
    difficultyLevel: 'Intermediate',
    attributeIds: ['communication'],
    stageId: 'stage-3',
    expectations: {
      answerCharacteristics: {
        poor: ['Avoids conflict entirely', 'Becomes defensive or aggressive'],
        average: ['Attempts to discuss differences', 'Sometimes compromises'],
        great: ['Seeks to understand other viewpoints first', 'Finds win-win solutions']
      }
    }
  },
  {
    id: 'q-5',
    text: 'Tell me about a time you mentored or coached a junior developer',
    description: 'Assesses leadership and teaching ability',
    difficultyLevel: 'Advanced',
    attributeIds: ['leadership'],
    stageId: 'stage-3',
    expectations: {
      answerCharacteristics: {
        poor: ['No mentoring experience', 'Impatient with less experienced developers'],
        average: ['Some informal mentoring', 'Willing to help when asked'],
        great: ['Proactive in identifying mentoring opportunities', 'Tailors approach to individual learning styles']
      }
    }
  }
]

const candidateAnswers: CandidateAnswer[] = [
  {
    questionId: 'q-1',
    answer: 'I\'ve been working with React for 4 years and Next.js for 2 years. Recently migrated our app to Next.js 14 with App Router. I leverage server components for better performance, use streaming for faster initial loads, and implement route handlers for API endpoints. I\'m comfortable with RSC patterns, server actions, and optimizing bundle sizes through dynamic imports.'
  },
  {
    questionId: 'q-2',
    answer: 'Our PM wanted to understand why we needed to refactor our auth system. I used a house analogy - the foundation (current auth) had cracks that would cause problems later. I drew a simple diagram showing the security risks and explained it would be like fixing the foundation now vs waiting for the house to have major issues. They understood and we got approval for the refactor.'
  },
  {
    questionId: 'q-3',
    answer: 'We had a client demo in 3 days and needed to add real-time features using WebSockets, which I\'d never used in production. I spent the first day reading Socket.io docs and building a small proof-of-concept. Day 2, I implemented it in our app while pair programming with a colleague who had some experience. Day 3, we tested thoroughly. The demo went great and now I\'m the team\'s WebSocket expert.'
  },
  {
    questionId: 'q-4',
    answer: 'Recently disagreed with a senior dev about using GraphQL vs REST. Instead of arguing, I asked to understand their concerns first - they worried about the learning curve. I proposed a small pilot project where we could measure developer experience and performance. We ran it for 2 weeks, gathered data, and made a collaborative decision based on results, not opinions.'
  },
  {
    questionId: 'q-5',
    answer: 'I mentored a junior dev who joined our team last year. I started with pair programming to understand their learning style, then created a personalized growth plan with small achievable milestones. We had weekly 1:1s where I provided specific feedback on their code reviews and PRs. After 6 months, they were confidently handling medium-complexity features and started mentoring an intern themselves.'
  }
]

type ScoringLevel = 'poor' | 'average' | 'great'

export default function EnhancedScoringPage() {
  // State management
  const candidates = useAtomValue(candidatesAtom)
  const [currentStage, setCurrentStage] = useState<string>('stage-1')
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null)
  const [score, setScore] = useState([5])
  const [notes, setNotes] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set())
  const [completedAttributes, setCompletedAttributes] = useState<Set<string>>(new Set())
  const [showKSAUpload, setShowKSAUpload] = useState(false)
  const [ksaFile, setKSAFile] = useState<File | null>(null)
  const [isEvaluatingKSA, setIsEvaluatingKSA] = useState(false)
  const [ksaEvaluation, setKsaEvaluation] = useState<any>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Atoms
  const [, startSession] = useAtom(startEvaluationSessionAtom)
  const [, saveScore] = useAtom(saveAttributeScoreAtom)
  const [, completeStage] = useAtom(completeStageEvaluationAtom)
  const currentSession = useAtomValue(currentSessionAtom)
  const [ksaFramework, setKSAFramework] = useAtom(selectedKSAFrameworkAtom)
  const [jobCategory, setJobCategory] = useAtom(selectedJobCategoryAtom)
  const [evaluatorName, setEvaluatorName] = useAtom(currentEvaluatorNameAtom)

  // Get current stage info
  const currentStageInfo = useMemo(() =>
    demoStages.find(s => s.id === currentStage),
    [currentStage]
  )

  // Get selected candidate
  const selectedCandidate = useMemo(() =>
    selectedCandidateId ? candidates[selectedCandidateId] : null,
    [selectedCandidateId, candidates]
  )

  // Get questions for current stage and attribute
  const relevantQuestions = useMemo(() => {
    if (!selectedAttribute) return []

    return demoQuestions.filter(q =>
      q.stageId === currentStage && q.attributeIds.includes(selectedAttribute)
    )
  }, [currentStage, selectedAttribute])

  // Get attributes that have questions in the current stage
  const stageAttributes = useMemo(() => {
    const attributeIds = new Set<string>()
    demoQuestions
      .filter(q => q.stageId === currentStage)
      .forEach(q => q.attributeIds.forEach(id => attributeIds.add(id)))

    return demoAttributes.filter(attr => attributeIds.has(attr.id))
  }, [currentStage])

  // Determine scoring level based on slider value
  const scoringLevel = useMemo((): ScoringLevel => {
    const value = score[0]
    if (value <= 3) return 'poor'
    if (value <= 6) return 'average'
    return 'great'
  }, [score])

  // Update popover position when dragging
  useEffect(() => {
    const updatePopoverPosition = () => {
      if (sliderRef.current && isDragging) {
        const sliderRect = sliderRef.current.getBoundingClientRect()
        const sliderWidth = sliderRect.width
        const thumbPosition = ((score[0] - 1) / 9) * sliderWidth

        setPopoverPosition({
          x: sliderRect.left + thumbPosition,
          y: sliderRect.top - 20
        })
      }
    }

    updatePopoverPosition()
    window.addEventListener('resize', updatePopoverPosition)
    return () => window.removeEventListener('resize', updatePopoverPosition)
  }, [score, isDragging])

  // Handle KSA file upload
  const handleKSAFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setKSAFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content) as KSAInterviewOutput
        setKSAFramework(parsed)

        // Extract job category from KSA framework
        const jobCategories = Object.keys(parsed.KSA_JobFit || {})
        setJobCategory(jobCategories[0] || 'Unknown')

        setShowKSAUpload(false)
      } catch (err) {
        console.error('Failed to parse KSA JSON:', err)
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  // Run KSA evaluation
  const runKSAEvaluation = async () => {
    if (!selectedCandidate || !ksaFramework) return

    setIsEvaluatingKSA(true)
    try {
      const evaluation = await evaluateCandidateKSA(
        selectedCandidate,
        ksaFramework,
        undefined,
        jobCategory
      )
      setKsaEvaluation(evaluation)
    } catch (error) {
      console.error('KSA evaluation failed:', error)
      alert('KSA evaluation failed. Please try again.')
    } finally {
      setIsEvaluatingKSA(false)
    }
  }

  // Start evaluation session
  const startEvaluation = () => {
    if (!selectedCandidateId || !ksaFramework) return

    startSession({
      candidateId: selectedCandidateId,
      stageId: currentStage,
      evaluatorName: evaluatorName,
      ksaFramework,
      jobCategory
    })
  }

  // Save current attribute score
  const saveCurrentScore = () => {
    if (!selectedAttribute) return

    saveScore({
      attributeId: selectedAttribute,
      score: score[0],
      notes: notes
    })

    // Mark as completed
    setCompletedAttributes(prev => new Set([...prev, selectedAttribute]))

    // Reset for next attribute
    setSelectedAttribute(null)
    setScore([5])
    setNotes('')
    setAskedQuestions(new Set())
  }

  // Complete entire stage evaluation
  const completeEvaluation = async () => {
    if (!selectedCandidateId || !ksaFramework) return

    // Collect all scores from the session
    const attributeScores: Record<string, number> = {}
    const strengths: string[] = []
    const weaknesses: string[] = []

    // Extract scores from KSA evaluation if available
    if (ksaEvaluation) {
      attributeScores.knowledge = ksaEvaluation.scores.knowledge.overall
      attributeScores.skills = ksaEvaluation.scores.skills.overall
      attributeScores.abilities = ksaEvaluation.scores.abilities.overall

      strengths.push(...(ksaEvaluation.strengths || []))
      weaknesses.push(...(ksaEvaluation.areasForImprovement || []))
    }

    // Map to stage attributes
    const stageAttributeScores: Record<string, number> = {
      technicalSkills: attributeScores.knowledge || 5,
      communication: score[0], // Use current score as fallback
      problemSolving: attributeScores.skills || 5,
      leadership: 5, // Default score
      adaptability: attributeScores.abilities || 5
    }

    await completeStage({
      candidateId: selectedCandidateId,
      stageId: currentStage,
      evaluatorName,
      ksaFramework,
      jobCategory,
      attributeScores: stageAttributeScores,
      ksaScores: {
        knowledge: {
          overall: attributeScores.knowledge || 5,
          breakdown: ksaEvaluation?.scores?.knowledge?.breakdown || {}
        },
        skills: {
          overall: attributeScores.skills || 5,
          breakdown: ksaEvaluation?.scores?.skills?.breakdown || {}
        },
        abilities: {
          overall: attributeScores.abilities || 5,
          breakdown: ksaEvaluation?.scores?.abilities?.breakdown || {}
        }
      },
      notes: `Stage ${currentStageInfo?.name} evaluation completed`,
      strengths,
      weaknesses
    })

    alert(`✅ ${currentStageInfo?.name} evaluation completed successfully!`)
  }

  // Get color and icon based on level
  const getLevelStyles = (level: ScoringLevel) => {
    switch (level) {
      case 'poor':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50 dark:bg-red-950/20',
          border: 'border-red-600',
          icon: AlertCircle,
          label: 'Poor',
          emoji: '⚠️'
        }
      case 'average':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-600',
          icon: Zap,
          label: 'Average',
          emoji: '⚡'
        }
      case 'great':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50 dark:bg-green-950/20',
          border: 'border-green-600',
          icon: CheckCircle2,
          label: 'Great',
          emoji: '✓'
        }
    }
  }

  const levelStyles = getLevelStyles(scoringLevel)
  const LevelIcon = levelStyles.icon

  // Get all characteristics for all questions in this attribute
  const allCharacteristics = useMemo(() => {
    const chars: AnswerCharacteristics = {
      poor: [],
      average: [],
      great: []
    }

    relevantQuestions.forEach(q => {
      const ac = q.expectations.answerCharacteristics
      chars.poor.push(...ac.poor)
      chars.average.push(...ac.average)
      chars.great.push(...ac.great)
    })

    return chars
  }, [relevantQuestions])

  const currentCharacteristics = allCharacteristics[scoringLevel]

  // Toggle question as asked/not asked
  const toggleQuestionAsked = (questionId: string) => {
    setAskedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  // Reset when switching attributes
  useEffect(() => {
    setAskedQuestions(new Set())
    setScore([5])
    setNotes('')
  }, [selectedAttribute])

  const questionsAskedCount = relevantQuestions.filter(q => askedQuestions.has(q.id)).length

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Enhanced Multi-Stage KSA Evaluation</h1>
            <p className="text-muted-foreground mt-2">
              Integrated KSA framework evaluation with traditional scoring
            </p>
          </div>
        </div>

        {/* Setup Section */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Evaluation Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Candidate Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Select Candidate</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                >
                  <option value="">Choose a candidate...</option>
                  {Object.values(candidates).map(candidate => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.personalInfo.firstName} {candidate.personalInfo.lastName} - {candidate.experience.currentPosition.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Evaluator Name</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* KSA Framework Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">KSA Framework</label>
              {ksaFramework ? (
                <div className="p-3 border rounded-md bg-green-50">
                  <p className="text-sm text-green-800">
                    ✓ KSA Framework loaded: {jobCategory}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={runKSAEvaluation} disabled={isEvaluatingKSA}>
                      {isEvaluatingKSA ? 'Evaluating...' : 'Run KSA Evaluation'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowKSAUpload(true)}>
                      Change Framework
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <FileJson className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-2">
                      <label htmlFor="ksa-file-upload" className="cursor-pointer">
                        <span className="text-primary">Click to upload</span> or drag and drop
                        <span className="text-muted-foreground"> KSA JSON framework</span>
                      </label>
                      <input
                        id="ksa-file-upload"
                        type="file"
                        accept=".json"
                        onChange={handleKSAFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Start Evaluation Button */}
            {selectedCandidateId && ksaFramework && !currentSession && (
              <Button onClick={startEvaluation} className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Start {currentStageInfo?.name} Evaluation
              </Button>
            )}
          </CardContent>
        </Card>

        {/* KSA Evaluation Results */}
        {ksaEvaluation && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                KSA Evaluation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {ksaEvaluation.scores.knowledge.overall}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Knowledge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {ksaEvaluation.scores.skills.overall}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {ksaEvaluation.scores.abilities.overall}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Abilities</div>
                </div>
              </div>
              <div className="text-sm">
                <strong>Overall Compatibility:</strong> {ksaEvaluation.overallCompatibility.score}/10
                <br />
                <strong>Recommendation:</strong> {ksaEvaluation.overallCompatibility.recommendation.replace('-', ' ')}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Traditional Scoring Interface (Original) */}
        {currentSession && (
          <>
            {/* Stage Switcher */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Current Evaluator Role</h3>
                      <p className="text-2xl font-bold mt-1">{currentStageInfo?.name} Evaluator</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {completedAttributes.size} of {stageAttributes.length} attributes scored
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    {demoStages.map(stage => (
                      <Button
                        key={stage.id}
                        variant={currentStage === stage.id ? "primary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentStage(stage.id)
                          setSelectedAttribute(null)
                          setCompletedAttributes(new Set())
                        }}
                        className="flex-1"
                      >
                        {stage.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Info */}
            {selectedCandidate && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedCandidate.personalInfo.firstName[0]}{selectedCandidate.personalInfo.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {selectedCandidate.personalInfo.firstName} {selectedCandidate.personalInfo.lastName}
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Briefcase className="h-4 w-4" />
                        {selectedCandidate.experience.currentPosition.title}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      Evaluation in Progress
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attribute Selection */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Step 1: Select Attribute to Evaluate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stageAttributes.map(attr => {
                  const questionCount = demoQuestions.filter(q =>
                    q.stageId === currentStage && q.attributeIds.includes(attr.id)
                  ).length
                  const isCompleted = completedAttributes.has(attr.id)

                  return (
                    <Card
                      key={attr.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md py-2 relative",
                        selectedAttribute === attr.id && "ring-2 ring-primary shadow-md",
                        isCompleted && "opacity-60"
                      )}
                      onClick={() => setSelectedAttribute(attr.id)}
                    >
                      {isCompleted && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                      <CardHeader className='border-none'>
                        <div className="space-y-3">
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl flex-shrink-0">{attr.icon}</span>
                            <span className="flex-1">{attr.name}</span>
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {attr.description}
                          </CardDescription>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                            </Badge>
                            {isCompleted && (
                              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                                Scored
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Questions and Answers */}
            {selectedAttribute && relevantQuestions.length > 0 && (
              <div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Step 2: Review Questions & Candidate Answers
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ask as many questions as you need to get enough signal to score this attribute.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {questionsAskedCount} of {relevantQuestions.length} asked
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  {relevantQuestions.map((question, idx) => {
                    const answer = candidateAnswers.find(a => a.questionId === question.id)
                    const isAsked = askedQuestions.has(question.id)

                    return (
                      <Card
                        key={question.id}
                        className={cn(
                          "transition-all",
                          isAsked && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <CardHeader className='py-4'>
                          <div className="flex items-start gap-4 w-full">
                            <div className="pt-1">
                              <input
                                type="checkbox"
                                checked={isAsked}
                                onChange={() => toggleQuestionAsked(question.id)}
                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <CardTitle className={cn(
                                    "text-lg",
                                    isAsked && "text-primary"
                                  )}>
                                    Question {idx + 1}: {question.text}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {question.description}
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge variant="outline">{question.difficultyLevel}</Badge>
                                  {isAsked && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20">
                                      Asked
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 ml-9">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Candidate's Answer:
                              </label>
                              <div className="mt-2 p-4 bg-muted rounded-lg">
                                {answer ? (
                                  <p className="text-sm leading-relaxed">{answer.answer}</p>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">
                                    No answer provided yet
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Scoring Interface */}
            {selectedAttribute && relevantQuestions.length > 0 && (
              <Card className="border-2 border-primary/20">
                <CardHeader className='py-4'>
                  <CardTitle className="flex items-center gap-2">
                    <Badge>{demoAttributes.find(a => a.id === selectedAttribute)?.name}</Badge>
                    <span className="text-sm text-muted-foreground">Scoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LevelIcon className={cn("h-6 w-6", levelStyles.color)} />
                        <div>
                          <h3 className={cn("font-semibold text-lg", levelStyles.color)}>
                            {levelStyles.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Score: {score[0]} / 10
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(levelStyles.color, "text-sm")}>
                        {scoringLevel === 'poor' && 'Needs Improvement'}
                        {scoringLevel === 'average' && 'Acceptable'}
                        {scoringLevel === 'great' && 'Excellent'}
                      </Badge>
                    </div>

                    <div className="relative space-y-3" ref={sliderRef}>
                      <Slider
                        value={score}
                        onValueChange={(value) => {
                          setScore(value)
                          setIsDragging(true)
                        }}
                        onPointerDown={() => setIsDragging(true)}
                        onPointerUp={() => setTimeout(() => setIsDragging(false), 300)}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      >
                        <SliderThumb />
                      </Slider>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="text-red-600">⚠️</span>
                          Poor (1-3)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-amber-600">⚡</span>
                          Average (4-6)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-green-600">✓</span>
                          Great (7-10)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Evaluation Notes (Optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any specific observations about this candidate's performance on this attribute..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScore([5])
                        setNotes('')
                      }}
                    >
                      Reset Score
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAttribute(null)
                          setScore([5])
                          setNotes('')
                        }}
                      >
                        Skip Attribute
                      </Button>
                      <Button onClick={saveCurrentScore}>
                        Save Score & Continue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Complete Stage Button */}
            {completedAttributes.size === stageAttributes.length && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">All Attributes Completed</h3>
                      <p className="text-muted-foreground">
                        You've evaluated all attributes for the {currentStageInfo?.name} stage.
                      </p>
                    </div>
                    <Button onClick={completeEvaluation} size="lg">
                      Complete {currentStageInfo?.name} Evaluation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}