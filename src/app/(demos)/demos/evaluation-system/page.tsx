'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider, SliderThumb } from '@/components/ui/slider'
import { Info, CheckCircle2, AlertCircle, Zap, User, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

// Define types matching our schema
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

// Demo data
const demoStages: DemoStage[] = [
    {
        id: 'stage-1',
        name: 'Phone Screen',
        description: 'Initial screening call',
        order: 1,
        color: 'blue'
    },
    {
        id: 'stage-2',
        name: 'Technical Interview',
        description: 'In-depth technical assessment',
        order: 2,
        color: 'purple'
    },
    {
        id: 'stage-3',
        name: 'Final Interview',
        description: 'Culture fit and leadership assessment',
        order: 3,
        color: 'green'
    }
]

const demoAttributes: DemoAttribute[] = [
    {
        id: 'attr-1',
        name: 'Technical Skills',
        icon: '💻',
        color: 'blue',
        description: 'Technical proficiency and problem-solving ability'
    },
    {
        id: 'attr-2',
        name: 'Communication',
        icon: '💬',
        color: 'green',
        description: 'Clarity, articulation, and active listening'
    },
    {
        id: 'attr-3',
        name: 'Problem Solving',
        icon: '🧩',
        color: 'purple',
        description: 'Analytical thinking and creative solutions'
    },
    {
        id: 'attr-4',
        name: 'Leadership',
        icon: '👥',
        color: 'amber',
        description: 'Team leadership and mentorship capabilities'
    },
    {
        id: 'attr-5',
        name: 'Adaptability',
        icon: '🔄',
        color: 'pink',
        description: 'Flexibility and learning agility'
    }
]

const demoQuestions: DemoQuestion[] = [
    {
        id: 'q-1',
        text: 'Describe your experience with React and Next.js',
        description: 'Evaluates technical depth in modern web frameworks',
        difficultyLevel: 'Intermediate',
        attributeIds: ['attr-1'],
        stageId: 'stage-2',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Cannot explain basic React concepts',
                    'No hands-on Next.js experience',
                    'Confused about client vs server components'
                ],
                average: [
                    'Understands React fundamentals',
                    'Some Next.js experience but limited',
                    'Can explain basics but lacks depth'
                ],
                great: [
                    'Deep understanding of React hooks and patterns',
                    'Extensive Next.js 13+ App Router experience',
                    'Can articulate performance optimization strategies',
                    'Understands server components and streaming'
                ]
            }
        }
    },
    {
        id: 'q-2',
        text: 'Walk me through how you would debug a production performance issue',
        description: 'Tests systematic problem-solving approach',
        difficultyLevel: 'Advanced',
        attributeIds: ['attr-1', 'attr-3'],
        stageId: 'stage-2',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'No systematic approach',
                    'Relies on guessing',
                    'Unfamiliar with monitoring tools'
                ],
                average: [
                    'Basic debugging methodology',
                    'Some familiarity with dev tools',
                    'Can identify common issues'
                ],
                great: [
                    'Systematic approach using monitoring tools',
                    'Uses profiling and tracing effectively',
                    'Considers multiple hypotheses before acting',
                    'Documents findings and solutions'
                ]
            }
        }
    },
    {
        id: 'q-3',
        text: 'Tell me about a time you had to explain a complex technical concept to a non-technical stakeholder',
        description: 'Assesses communication and stakeholder management',
        difficultyLevel: 'Intermediate',
        attributeIds: ['attr-2'],
        stageId: 'stage-1',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Cannot simplify technical jargon',
                    'Shows impatience with non-technical audience',
                    'No specific example provided'
                ],
                average: [
                    'Provides an example but lacks detail',
                    'Some attempt to simplify concepts',
                    'Basic communication skills demonstrated'
                ],
                great: [
                    'Uses analogies and visual aids effectively',
                    'Tailors explanation to audience level',
                    'Confirms understanding through questions',
                    'Shows patience and empathy'
                ]
            }
        }
    },
    {
        id: 'q-4',
        text: 'Describe a situation where you had to learn a new technology quickly under pressure',
        description: 'Evaluates adaptability and learning agility',
        difficultyLevel: 'Intermediate',
        attributeIds: ['attr-5', 'attr-3'],
        stageId: 'stage-1',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Struggles with learning new things',
                    'No concrete example',
                    'Shows resistance to change'
                ],
                average: [
                    'Can learn when given time',
                    'Basic example provided',
                    'Some learning strategies mentioned'
                ],
                great: [
                    'Systematic learning approach',
                    'Leverages documentation and community resources',
                    'Applies learning immediately to solve problems',
                    'Shows excitement for continuous learning'
                ]
            }
        }
    },
    {
        id: 'q-5',
        text: 'How do you handle disagreements with team members about technical decisions?',
        description: 'Tests communication and collaboration skills',
        difficultyLevel: 'Intermediate',
        attributeIds: ['attr-2', 'attr-4'],
        stageId: 'stage-3',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Avoids conflict entirely',
                    'Becomes defensive or aggressive',
                    'Unable to see other perspectives'
                ],
                average: [
                    'Attempts to discuss differences',
                    'Sometimes compromises',
                    'Basic conflict resolution'
                ],
                great: [
                    'Seeks to understand other viewpoints first',
                    'Uses data and reasoning to support positions',
                    'Finds win-win solutions',
                    'Maintains positive relationships despite disagreements'
                ]
            }
        }
    },
    {
        id: 'q-6',
        text: 'Tell me about a time you mentored or coached a junior developer',
        description: 'Assesses leadership and teaching ability',
        difficultyLevel: 'Advanced',
        attributeIds: ['attr-4', 'attr-2'],
        stageId: 'stage-3',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'No mentoring experience',
                    'Impatient with less experienced developers',
                    'Cannot explain their approach'
                ],
                average: [
                    'Some informal mentoring',
                    'Willing to help when asked',
                    'Basic teaching skills'
                ],
                great: [
                    'Proactive in identifying mentoring opportunities',
                    'Tailors approach to individual learning styles',
                    'Provides constructive feedback effectively',
                    'Tracks mentee progress and growth'
                ]
            }
        }
    },
    {
        id: 'q-7',
        text: 'Describe your approach to code reviews',
        description: 'Evaluates technical standards and communication',
        difficultyLevel: 'Intermediate',
        attributeIds: ['attr-1', 'attr-2'],
        stageId: 'stage-2',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Rarely does code reviews',
                    'Overly critical or harsh',
                    'Focuses only on syntax'
                ],
                average: [
                    'Reviews code when assigned',
                    'Provides basic feedback',
                    'Checks for obvious issues'
                ],
                great: [
                    'Constructive and respectful feedback',
                    'Considers architecture, security, and performance',
                    'Asks clarifying questions',
                    'Shares knowledge through reviews'
                ]
            }
        }
    },
    {
        id: 'q-8',
        text: 'How do you prioritize technical debt vs new features?',
        description: 'Tests strategic thinking and problem-solving',
        difficultyLevel: 'Advanced',
        attributeIds: ['attr-3', 'attr-1'],
        stageId: 'stage-2',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Always prioritizes new features',
                    'Ignores technical debt',
                    'No systematic approach'
                ],
                average: [
                    'Acknowledges both are important',
                    'Sometimes addresses tech debt',
                    'Basic understanding of tradeoffs'
                ],
                great: [
                    'Uses data to assess tech debt impact',
                    'Balances business needs with code health',
                    'Communicates costs/benefits to stakeholders',
                    'Prevents debt through good practices'
                ]
            }
        }
    },
    {
        id: 'q-9',
        text: 'Tell me about a project that failed and what you learned',
        description: 'Assesses self-awareness and adaptability',
        difficultyLevel: 'Advanced',
        attributeIds: ['attr-5', 'attr-3'],
        stageId: 'stage-3',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Blames others for failure',
                    'No real learning or growth',
                    'Defensive about mistakes'
                ],
                average: [
                    'Acknowledges failure happened',
                    'Some reflection on causes',
                    'Basic lessons learned'
                ],
                great: [
                    'Takes ownership of their role',
                    'Deep analysis of what went wrong',
                    'Specific changes made based on learning',
                    'Shows growth mindset and resilience'
                ]
            }
        }
    },
    {
        id: 'q-10',
        text: 'How do you stay current with rapidly evolving web technologies?',
        description: 'Evaluates continuous learning and adaptability',
        difficultyLevel: 'Basic',
        attributeIds: ['attr-5', 'attr-1'],
        stageId: 'stage-1',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Doesn\'t actively learn',
                    'Relies only on work experience',
                    'Unaware of recent developments'
                ],
                average: [
                    'Occasionally reads tech blogs',
                    'Some professional development',
                    'Aware of major changes'
                ],
                great: [
                    'Multiple learning sources (blogs, podcasts, courses)',
                    'Contributes to open source or community',
                    'Experiments with new technologies',
                    'Shares knowledge with team'
                ]
            }
        }
    },
    // Additional Phone Screen questions
    {
        id: 'q-11',
        text: 'What interests you most about this role and our company?',
        description: 'Assesses motivation and cultural fit',
        difficultyLevel: 'Basic',
        attributeIds: ['attr-2'],
        stageId: 'stage-1',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Generic answer with no research',
                    'Only focused on compensation',
                    'Cannot articulate specific interests'
                ],
                average: [
                    'Basic knowledge of company',
                    'Some genuine interest shown',
                    'Mentions a few relevant points'
                ],
                great: [
                    'Deep research into company mission and values',
                    'Connects personal career goals to role',
                    'Asks thoughtful questions about culture',
                    'Shows enthusiasm backed by specifics'
                ]
            }
        }
    },
    {
        id: 'q-12',
        text: 'Describe your ideal work environment and team dynamic',
        description: 'Evaluates cultural fit and communication preferences',
        difficultyLevel: 'Basic',
        attributeIds: ['attr-2', 'attr-5'],
        stageId: 'stage-1',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'No clear preferences or all preferences',
                    'Rigid expectations that don\'t match role',
                    'Unable to adapt to different styles'
                ],
                average: [
                    'Some self-awareness of preferences',
                    'Open to different environments',
                    'Basic understanding of teamwork'
                ],
                great: [
                    'Clear self-awareness with flexibility',
                    'Values diverse perspectives',
                    'Understands collaboration vs autonomy balance',
                    'Aligns well with company culture'
                ]
            }
        }
    },
    // Additional Technical Interview questions
    {
        id: 'q-13',
        text: 'Explain how you would architect a scalable microservices system',
        description: 'Tests system design and technical depth',
        difficultyLevel: 'Expert',
        attributeIds: ['attr-1', 'attr-3'],
        stageId: 'stage-2',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'No understanding of microservices concepts',
                    'Cannot explain service boundaries',
                    'Ignores scalability considerations'
                ],
                average: [
                    'Basic microservices knowledge',
                    'Mentions some patterns but lacks depth',
                    'Some consideration of tradeoffs'
                ],
                great: [
                    'Comprehensive architecture with clear service boundaries',
                    'Discusses data consistency patterns',
                    'Addresses observability and monitoring',
                    'Considers failure scenarios and resilience'
                ]
            }
        }
    },
    {
        id: 'q-14',
        text: 'How would you handle a critical security vulnerability in production?',
        description: 'Tests technical judgment and problem-solving under pressure',
        difficultyLevel: 'Advanced',
        attributeIds: ['attr-3', 'attr-1', 'attr-2'],
        stageId: 'stage-2',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Panics or no clear plan',
                    'Ignores communication with stakeholders',
                    'Rushes to fix without assessment'
                ],
                average: [
                    'Has a basic incident response plan',
                    'Fixes issue but limited communication',
                    'Some post-mortem consideration'
                ],
                great: [
                    'Systematic incident response process',
                    'Clear communication chain established',
                    'Documents timeline and impact',
                    'Thorough post-mortem with preventive measures'
                ]
            }
        }
    },
    {
        id: 'q-15',
        text: 'Walk through your testing strategy for a critical feature',
        description: 'Evaluates technical rigor and quality mindset',
        difficultyLevel: 'Intermediate',
        attributeIds: ['attr-1'],
        stageId: 'stage-2',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Manual testing only',
                    'No test coverage consideration',
                    'Tests after deployment'
                ],
                average: [
                    'Some automated tests',
                    'Basic unit test coverage',
                    'Tests major happy paths'
                ],
                great: [
                    'Comprehensive testing pyramid (unit, integration, e2e)',
                    'TDD or test-first approach',
                    'Considers edge cases and error scenarios',
                    'Includes performance and security testing'
                ]
            }
        }
    },
    // Additional Final Interview questions
    {
        id: 'q-16',
        text: 'Tell me about a time you had to make a difficult technical decision with incomplete information',
        description: 'Assesses decision-making and leadership under uncertainty',
        difficultyLevel: 'Advanced',
        attributeIds: ['attr-4', 'attr-3'],
        stageId: 'stage-3',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Avoided making a decision',
                    'Made decision without any analysis',
                    'Blamed others for lack of information'
                ],
                average: [
                    'Made a decision with some rationale',
                    'Gathered available information',
                    'Basic risk assessment'
                ],
                great: [
                    'Structured decision-making process',
                    'Identified assumptions and risks explicitly',
                    'Involved stakeholders appropriately',
                    'Set up validation mechanisms'
                ]
            }
        }
    },
    {
        id: 'q-17',
        text: 'How do you build psychological safety within your team?',
        description: 'Evaluates leadership philosophy and emotional intelligence',
        difficultyLevel: 'Advanced',
        attributeIds: ['attr-4', 'attr-2'],
        stageId: 'stage-3',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Doesn\'t understand psychological safety',
                    'Creates fear-based environment',
                    'Discourages questions or concerns'
                ],
                average: [
                    'Aware of concept',
                    'Attempts to be approachable',
                    'Some inclusive behaviors'
                ],
                great: [
                    'Actively models vulnerability and learning',
                    'Celebrates failures as learning opportunities',
                    'Creates space for diverse perspectives',
                    'Measures and improves team dynamics'
                ]
            }
        }
    },
    {
        id: 'q-18',
        text: 'Describe how you balance team autonomy with alignment to company goals',
        description: 'Tests strategic thinking and leadership balance',
        difficultyLevel: 'Expert',
        attributeIds: ['attr-4', 'attr-3'],
        stageId: 'stage-3',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Complete micromanagement or complete hands-off',
                    'No connection to company objectives',
                    'Unable to articulate framework'
                ],
                average: [
                    'Basic delegation skills',
                    'Some alignment with goals',
                    'Periodic check-ins'
                ],
                great: [
                    'Clear framework for decision-making authority',
                    'OKRs or goals cascade from company to team',
                    'Empowers team within guardrails',
                    'Regular calibration and feedback loops'
                ]
            }
        }
    },
    {
        id: 'q-19',
        text: 'How do you handle a high-performing team member who is toxic to team culture?',
        description: 'Assesses leadership courage and values prioritization',
        difficultyLevel: 'Expert',
        attributeIds: ['attr-4', 'attr-2'],
        stageId: 'stage-3',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Ignores behavior due to performance',
                    'Avoids difficult conversation',
                    'Blames team for not adapting'
                ],
                average: [
                    'Acknowledges it\'s a problem',
                    'Has a conversation eventually',
                    'May take some action'
                ],
                great: [
                    'Addresses immediately with clear expectations',
                    'Values culture over individual performance',
                    'Provides support and coaching first',
                    'Makes tough decisions to protect team health'
                ]
            }
        }
    },
    {
        id: 'q-20',
        text: 'What\'s your approach to giving and receiving feedback?',
        description: 'Evaluates communication maturity and growth mindset',
        difficultyLevel: 'Intermediate',
        attributeIds: ['attr-2', 'attr-4', 'attr-5'],
        stageId: 'stage-3',
        expectations: {
            answerCharacteristics: {
                poor: [
                    'Defensive when receiving feedback',
                    'Avoids giving feedback',
                    'Only gives negative feedback in anger'
                ],
                average: [
                    'Accepts feedback professionally',
                    'Gives feedback when required',
                    'Basic communication skills'
                ],
                great: [
                    'Actively seeks feedback for growth',
                    'Timely, specific, and actionable feedback',
                    'Uses SBI or similar framework',
                    'Creates continuous feedback culture'
                ]
            }
        }
    }
]

// Demo candidate answers
const candidateAnswers: CandidateAnswer[] = [
    {
        questionId: 'q-1',
        answer: 'I\'ve been working with React for 4 years and Next.js for 2 years. Recently migrated our app to Next.js 14 with App Router. I leverage server components for better performance, use streaming for faster initial loads, and implement route handlers for API endpoints. I\'m comfortable with RSC patterns, server actions, and optimizing bundle sizes through dynamic imports.'
    },
    {
        questionId: 'q-2',
        answer: 'First, I\'d check our monitoring dashboard (DataDog/New Relic) to identify patterns - when did it start, which users are affected, error rates. Then I\'d use browser dev tools and Lighthouse for client-side profiling. For server issues, I\'d check APM traces to find slow database queries or external API calls. I document everything and create a hypothesis before making changes, then verify the fix with metrics.'
    },
    {
        questionId: 'q-3',
        answer: 'Our PM wanted to understand why we needed to refactor our auth system. I used a house analogy - the foundation (current auth) had cracks that would cause problems later. I drew a simple diagram showing the security risks and explained it would be like fixing the foundation now vs waiting for the house to have major issues. They understood and we got approval for the refactor.'
    },
    {
        questionId: 'q-4',
        answer: 'We had a client demo in 3 days and needed to add real-time features using WebSockets, which I\'d never used in production. I spent the first day reading Socket.io docs and building a small proof-of-concept. Day 2, I implemented it in our app while pair programming with a colleague who had some experience. Day 3, we tested thoroughly. The demo went great and now I\'m the team\'s WebSocket expert.'
    },
    {
        questionId: 'q-5',
        answer: 'Recently disagreed with a senior dev about using GraphQL vs REST. Instead of arguing, I asked to understand their concerns first - they worried about the learning curve. I proposed a small pilot project where we could measure developer experience and performance. We ran it for 2 weeks, gathered data, and made a collaborative decision based on results, not opinions. We ended up using GraphQL and they became a strong advocate.'
    },
    {
        questionId: 'q-6',
        answer: 'I mentored a junior dev who joined our team last year. I started with pair programming to understand their learning style, then created a personalized growth plan with small achievable milestones. We had weekly 1:1s where I provided specific feedback on their code reviews and PRs. After 6 months, they were confidently handling medium-complexity features and started mentoring an intern themselves.'
    },
    {
        questionId: 'q-11',
        answer: 'What really excites me is your company\'s mission to democratize access to technology education. I spent time going through your open-source curriculum and was impressed by the thought put into progressive learning paths. This aligns perfectly with my belief that technology should be accessible to everyone. I\'m particularly interested in contributing to your infrastructure team to help scale the platform to reach more learners globally.'
    },
    {
        questionId: 'q-13',
        answer: 'I\'d start by identifying service boundaries using domain-driven design principles. Each service would own its data with clear APIs for communication. For inter-service communication, I\'d use async messaging (Kafka/RabbitMQ) for eventual consistency and REST/gRPC for synchronous calls. I\'d implement circuit breakers, distributed tracing with OpenTelemetry, and use Kubernetes for orchestration with proper resource limits and auto-scaling based on metrics.'
    },
    {
        questionId: 'q-17',
        answer: 'I start by modeling vulnerability myself - sharing my mistakes in team retros and asking for feedback publicly. I actively celebrate "interesting failures" where we learn something valuable, not just successes. In code reviews, I encourage questions by responding with curiosity, not defensiveness. We have a "no blame" incident response culture. I also measure psychological safety through anonymous team surveys and act on the feedback.'
    }
]

type ScoringLevel = 'poor' | 'average' | 'great'

function UIDemoPage() {
    const [currentStage, setCurrentStage] = useState<string>('stage-1') // Start with Phone Screen
    const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null)
    const [score, setScore] = useState([5])
    const [notes, setNotes] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
    const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set())
    const [completedAttributes, setCompletedAttributes] = useState<Set<string>>(new Set())
    const sliderRef = useRef<HTMLDivElement>(null)

    // Get current stage info
    const currentStageInfo = useMemo(() =>
        demoStages.find(s => s.id === currentStage),
        [currentStage]
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

    // Reset askedQuestions when switching attributes
    useEffect(() => {
        setAskedQuestions(new Set())
        setScore([5])
        setNotes('')
    }, [selectedAttribute])

    const questionsAskedCount = relevantQuestions.filter(q => askedQuestions.has(q.id)).length

    // Handle saving attribute score
    const handleSaveScore = () => {
        const attributeName = demoAttributes.find(a => a.id === selectedAttribute)?.name
        if (questionsAskedCount === 0) {
            const confirmSave = confirm(`You haven't marked any questions as asked. Are you sure you want to save this score for ${attributeName}?`)
            if (!confirmSave) return
        }

        // Mark attribute as completed
        if (selectedAttribute) {
            setCompletedAttributes(prev => new Set([...prev, selectedAttribute]))
            alert(`✅ Score saved!\n\nAttribute: ${attributeName}\nScore: ${score[0]}/10\nQuestions Asked: ${questionsAskedCount}/${relevantQuestions.length}\nNotes: ${notes || 'None'}\n\nYou can continue to the next attribute or switch stages.`)
            // Reset for next attribute
            setSelectedAttribute(null)
            setScore([5])
            setNotes('')
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-7xl">
            <div className="space-y-6">
                {/* Header with Stage Switcher */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold">Candidate Evaluation System</h1>
                        <p className="text-muted-foreground mt-2">
                            Each evaluator focuses on one interview stage at a time
                        </p>
                    </div>

                    {/* Stage/Evaluator Selector */}
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
                                            variant={currentStage === stage.id ? "default" : "outline"}
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

                                <p className="text-xs text-muted-foreground">
                                    💡 Switch between evaluator roles to see how each stage is evaluated independently
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Candidate Info */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                JD
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    John Doe
                                </h3>
                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                    <Briefcase className="h-4 w-4" />
                                    Senior Full Stack Developer - Applied 3 days ago
                                </p>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                In Progress
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

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
                                        You can adjust the score during or after the interview.
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-sm whitespace-nowrap",
                                        questionsAskedCount > 0 && "border-primary/50 bg-primary/10 text-primary"
                                    )}
                                >
                                    {questionsAskedCount} of {relevantQuestions.length} asked
                                </Badge>
                            </div>

                            {questionsAskedCount === 0 && (
                                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        <strong>Getting started:</strong> Check the box next to each question as you ask it during the interview.
                                        This helps you track which questions you've covered.
                                    </p>
                                </div>
                            )}
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
                                                        aria-label={`Mark question ${idx + 1} as asked`}
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

                {/* Scoring Interface - Variant 2 (Compact) */}
                {selectedAttribute && relevantQuestions.length > 0 && (
                    <Card className="border-2 border-primary/20">
                        <CardHeader className='py-4'>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant={"info"} className="text-xs">
                                    Step 3: Score the Attribute
                                </Badge>
                            </div>
                            <CardTitle className="flex items-center gap-2">
                                <Badge>{demoAttributes.find(a => a.id === selectedAttribute)?.name}</Badge>
                            </CardTitle>
                            <CardDescription>
                                Use the slider to score this attribute during or after the interview (1-10 scale).
                                You only need to ask enough questions to feel confident in your evaluation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Compact Score Slider with Floating Popover */}
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

                                {/* Slider with Popover */}
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

                                    {/* Floating Popover that follows cursor */}
                                    {isDragging && currentCharacteristics.length > 0 && (
                                        <div
                                            className="fixed z-50 pointer-events-none animate-in fade-in-0 zoom-in-95"
                                            style={{
                                                left: `${popoverPosition.x}px`,
                                                top: `${popoverPosition.y}px`,
                                                transform: 'translate(-50%, -100%)',
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "relative mb-2 rounded-lg border-2 shadow-lg backdrop-blur-sm max-w-sm",
                                                    levelStyles.bg,
                                                    levelStyles.border
                                                )}
                                            >
                                                {/* Arrow pointing down to slider */}
                                                <div
                                                    className={cn(
                                                        "absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r-2 border-b-2",
                                                        levelStyles.bg,
                                                        levelStyles.border
                                                    )}
                                                />

                                                <div className="relative p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <LevelIcon className={cn("h-5 w-5", levelStyles.color)} />
                                                        <h4 className={cn("font-semibold text-sm", levelStyles.color)}>
                                                            {levelStyles.label} ({score[0]}/10)
                                                        </h4>
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {currentCharacteristics.slice(0, 4).map((trait: string, idx: number) => (
                                                            <li key={idx} className="text-xs flex items-start gap-2">
                                                                <span className={cn("mt-0.5 flex-shrink-0", levelStyles.color)}>
                                                                    {levelStyles.emoji}
                                                                </span>
                                                                <span className="leading-tight">{trait}</span>
                                                            </li>
                                                        ))}
                                                        {currentCharacteristics.length > 4 && (
                                                            <li className="text-xs text-muted-foreground italic">
                                                                +{currentCharacteristics.length - 4} more traits...
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Range Labels */}
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

                                {/* Compact Summary - Only shown when not dragging */}
                                {!isDragging && (
                                    <div className="p-3 rounded-lg bg-muted/50 border border-muted animate-in fade-in-0 slide-in-from-bottom-2">
                                        <p className="text-sm text-muted-foreground">
                                            <strong className={cn("text-foreground", levelStyles.color)}>
                                                {score[0]}/10 ({levelStyles.label})
                                            </strong>
                                            {' - '}Drag slider to see detailed characteristics
                                        </p>
                                    </div>
                                )}
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
                                    <Button onClick={handleSaveScore}>
                                        Save Score & Continue
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Info Box */}
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            How the Evaluation System Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
                        <div className="space-y-2">
                            <p className="font-semibold">Key Concept: Stage-Based Evaluation by Attribute</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li><strong>Each evaluator focuses on one stage</strong> - Phone Screen, Technical, or Final Interview</li>
                                <li>Questions are <strong>tagged to attributes</strong> (e.g., Technical Skills, Communication)</li>
                                <li>Evaluators score the <strong>attribute as a whole</strong>, considering all relevant questions</li>
                                <li>Each attribute gets one score per stage, not individual question scores</li>
                                <li>Different evaluators handle different stages independently</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <p className="font-semibold">Evaluation Workflow (Per Stage):</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li><strong>Your stage is pre-selected</strong> based on your evaluator role</li>
                                <li>Choose an attribute to evaluate (only attributes for your stage shown)</li>
                                <li><strong>Ask questions</strong> - Check off each question as you ask it. Ask enough to get signal</li>
                                <li><strong>Score the attribute</strong> - Use the slider anytime (1-10). Drag to see characteristics</li>
                                <li>Save and continue to next attribute until stage is complete</li>
                            </ol>
                        </div>

                        <div className="space-y-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <p className="font-semibold">💡 Multi-Evaluator System:</p>
                            <p>
                                In production, each evaluator only sees their assigned stage. Use the stage switcher above to simulate
                                different evaluator roles. Completed attributes are marked with a checkmark. This ensures each stage
                                evaluation is independent and focused.
                            </p>
                        </div>

                        <div className="pt-3 border-t border-blue-200 dark:border-blue-800 space-y-2">
                            <p>
                                <strong>Scoring Ranges:</strong> Poor (1-3), Average (4-6), Great (7-10)
                            </p>
                            <p>
                                <strong>Demo Data:</strong> 3 stages • 5 attributes • 20 questions
                            </p>
                            <div className="text-xs space-y-1 mt-2 pl-2">
                                <p><strong>Phone Screen:</strong> Communication (4q), Adaptability (3q), Technical Skills (1q)</p>
                                <p><strong>Technical Interview:</strong> Technical Skills (6q), Problem Solving (3q), Communication (2q)</p>
                                <p><strong>Final Interview:</strong> Leadership (5q), Communication (3q), Problem Solving (2q), Adaptability (1q)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default UIDemoPage;