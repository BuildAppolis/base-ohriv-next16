/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider, SliderThumb } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sliders, Settings, AlertCircle, Download, Copy, Check, Brain, Zap, Bug, CheckCircle2, Thermometer, Hash, Info, ChevronDown } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CodeEditor } from '@/components/buildappolis/code-editor'
import { ErrorBoundary } from '@/components/error-boundary'
import { CostIndicator, CostComparison } from '@/components/cost-indicator'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { AI_MODELS, getMaxTokensForModel, supportsTemperature } from '@/lib/ai/ai-models'
import { estimateTokens, estimateCost } from '@/lib/ai/cost-calculator'
import {
  type KSAInterviewOutput,
  type KSAInterviewError,
  type KSARawOutput,
  // type KSAJobFit,
  // type KSACoreValuesCompanyFit,
  // type KSAFramework
} from '@/types/company/ksa'
import { CompanyContextInput } from '@/types/ai/company'
import { GPT5_FAMILY_OPTIONS, type AIModelOption } from '@/lib/ai/ai-models'

// Type guard functions
function isKSAInterviewError(output: any): output is KSAInterviewError {
  return output && typeof output === 'object' && 'error' in output;
}

function isKSARawOutput(output: any): output is KSARawOutput {
  return output && typeof output === 'object' && 'raw' in output;
}

function isKSAInterviewOutput(output: any): output is KSAInterviewOutput {
  return output && typeof output === 'object' &&
    !isKSAInterviewError(output) &&
    !isKSARawOutput(output) &&
    (output.KSA_Framework || output.KSAs || output.KSA_JobFit || output.CoreValues_CompanyFit || output.positions || output.Positions);
}


const sampleData: CompanyContextInput = {
  company_profile: {
    name: "TechCorp Solutions",
    industry: "technology",
    sub_industry: "Enterprise Software",
    size: "201-500",
    location: "San Francisco, CA",
    stage: {
      name: "Series B",
      phase: "growth"
    }
  },
  mission_and_culture: {
    mission_statement: "We're dedicated to transforming businesses through innovative enterprise software that combines cutting-edge technology with practical business solutions. Our mission is to accelerate digital transformation and empower organizations to reach their full potential.",
    core_values: [
      {
        name: "Innovation",
        description: "Pushing boundaries and exploring new possibilities"
      },
      {
        name: "Excellence",
        description: "Delivering high-quality solutions and exceeding expectations"
      },
      {
        name: "Collaboration",
        description: "Working together to achieve common goals"
      },
      {
        name: "Growth",
        description: "Continuous learning and personal development"
      }
    ]
  },
  interview_steps: {
    total_steps: 6,
    steps: [
      {
        name: "Screening",
        order: 1,
        type: "screening",
        generates_questions: true,
        description: "Initial resume and application review"
      },
      {
        name: "Technical Assessment",
        order: 2,
        type: "technical",
        generates_questions: true,
        description: "Skills and technical evaluation"
      },
      {
        name: "Behavioral Interview",
        order: 3,
        type: "cultural",
        generates_questions: true,
        description: "Cultural fit and behavioral assessment"
      }
    ]
  },
  technologies: {
    languages: [
      { name: "TypeScript", company_specific: false },
      { name: "Python", company_specific: false }
    ],
    frameworks: [
      {
        name: "React",
        type: "fullstack",
        description: "Component-based UI library for building user interfaces",
        company_specific: false
      },
      {
        name: "FastAPI",
        type: "fullstack",
        description: "Modern, fast web framework for building APIs with Python",
        company_specific: false
      }
    ],
    databases: [
      {
        name: "PostgreSQL",
        type: "sql",
        usage_pattern: "Advanced open-source relational database with rich features",
        scale: "small",
        company_specific: false
      },
      {
        name: "Redis",
        type: "cache",
        usage_pattern: "In-memory data structure store for caching and real-time data",
        scale: "small",
        company_specific: false
      }
    ],
    infrastructure: [
      {
        name: "Amazon Web Services",
        category: "cloud",
        purpose: "Enterprise cloud infrastructure with managed services",
        company_specific: false
      },
      {
        name: "Kubernetes",
        category: "cloud",
        purpose: "Container orchestration platform for automating deployment",
        company_specific: false
      }
    ],
    tools: [
      {
        name: "GitHub",
        category: "collaboration",
        purpose: "Version control and collaboration",
        company_specific: false
      },
      {
        name: "Jira",
        category: "collaboration",
        purpose: "Project management and issue tracking",
        company_specific: false
      }
    ]
  },
  positions: [
    {
      title: "Software Engineer",
      category: "engineering",
      seniority_level: 5,
      total_levels: 3,
      role_requirements: {
        core_responsibilities: [
          "Design and develop robust software architecture",
          "Write clean, maintainable, and testable code",
          "Collaborate with product managers and designers"
        ],
        key_objectives: [
          "Transform business requirements into scalable software solutions"
        ],
        impact_areas: [
          "End-to-end software development from concept to deployment"
        ],
        scope: "company",
        reach: "internal",
        complexity: "strategic"
      },
      extended_descriptions: [
        "This role is ideal for developers looking to grow their skills in a fast-paced environment. You'll work closely with senior engineers and have opportunities to contribute to production features."
      ],
      position_tools: [
        {
          name: "Docker",
          category: "cloud_infrastructure",
          usage_frequency: "daily",
          proficiency_required: 6,
          job_specific_usage: "Containerize applications and manage deployments"
        },
        {
          name: "Kubernetes",
          category: "cloud_infrastructure",
          usage_frequency: "daily",
          proficiency_required: 6,
          job_specific_usage: "Deploy applications and manage container workloads"
        }
      ]
    }
  ]
}

export default function TestResponsePage() {
  // Load sample data explicitly
  const [inputData, setInputData] = useState<string>(() => {
    const data = JSON.stringify(sampleData, null, 2);
    return data;
  });
  const [copied, setCopied] = useState<boolean>(false)
  const [output, setOutput] = useState<KSAInterviewOutput | KSAInterviewError | KSARawOutput | null>(null)
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS.GPT_5_1)
  const [selectedModelInfo, setSelectedModelInfo] = useState<AIModelOption | undefined>(GPT5_FAMILY_OPTIONS.find(m => m.value === AI_MODELS.GPT_5_1))
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(3000)
  const [, setEstimatedCost] = useState<number>(0)
  const [actualCost, setActualCost] = useState<number | null>(null)
  const [estimatedInputTokens, setEstimatedInputTokens] = useState<number>(0)
  const [estimatedOutputTokens,] = useState<number>(1500)
  const [reasoningEffort, setReasoningEffort] = useState<'none' | 'low' | 'medium' | 'high'>('none')
  const [verbosity, setVerbosity] = useState<'low' | 'medium' | 'high'>('medium')
  const streamingContainerRef = useRef<HTMLDivElement>(null)

  // Calculate model-specific limits
  const modelMaxTokens = useMemo(() => {
    return getMaxTokensForModel(selectedModel)
  }, [selectedModel])

  const supportsTemperatureModel = useMemo(() => {
    return supportsTemperature(selectedModel)
  }, [selectedModel])

  const supportsReasoningModel = useMemo(() => {
    // Check if model supports reasoning (GPT-5 series and O-series)
    const reasoningModels = [
      AI_MODELS.GPT_5_1, AI_MODELS.GPT_5, AI_MODELS.GPT_5_MINI, AI_MODELS.GPT_5_NANO, AI_MODELS.GPT_5_PRO,
      AI_MODELS.O3, AI_MODELS.O3_PRO, AI_MODELS.O3_DEEP_RESEARCH,
      AI_MODELS.O4_MINI, AI_MODELS.O4_MINI_DEEP_RESEARCH,
      AI_MODELS.O1, AI_MODELS.O1_PRO
    ]
    return reasoningModels.includes(selectedModel as any)
  }, [selectedModel])

  // Update max tokens when model changes
  useEffect(() => {
    const newMaxTokens = Math.min(maxTokens, modelMaxTokens)
    setMaxTokens(newMaxTokens)
    // Reset actual cost when model changes
    setActualCost(null)

    // Reset reasoning and verbosity based on model capabilities
    if (!supportsReasoningModel) {
      setReasoningEffort('none')
    }
    if (!supportsTemperatureModel) {
      setTemperature(0.7)
    }
  }, [selectedModel, modelMaxTokens, supportsReasoningModel, supportsTemperatureModel, maxTokens])

  // Calculate estimated cost
  const estimatedCostBreakdown = useMemo(() => {
    const prompt = "Generate KSA-based interview questions. Use the company data provided to create specific questions that reflect the actual company name, technologies, and core values."
    const fullPrompt = `${prompt}\n\n${inputData}`

    const inputTokens = estimateTokens(fullPrompt)
    const outputTokens = estimatedOutputTokens

    setEstimatedInputTokens(inputTokens)

    const cost = estimateCost(selectedModel, inputTokens, outputTokens)
    return cost
  }, [selectedModel, inputData, estimatedOutputTokens])

  useEffect(() => {
    setEstimatedCost(estimatedCostBreakdown?.totalCost || 0)
  }, [estimatedCostBreakdown])

  // Auto-scroll streaming content to bottom
  useEffect(() => {
    if (streamingContainerRef.current && streamingContent) {
      streamingContainerRef.current.scrollTop = streamingContainerRef.current.scrollHeight
    }
  }, [streamingContent])

  const {
    generate,
    isLoading,
    isStreaming,
    error,
    reset
  } = useAIGeneration({
    prompt: "", // Will be set in generateQuestions
    model: selectedModel,
    type: 'json',
    responseFormat: 'json',
    maxTokens: maxTokens,
    temperature: supportsTemperatureModel ? temperature : undefined,
    enableStreaming: true, // Enable streaming for real-time feedback
    onSuccess: (result) => {
      // Clear streaming content and set final parsed output
      setStreamingContent('');

      // Calculate actual cost
      const actualInputTokens = estimateTokens(inputData) + 200; // Add some buffer for system prompts
      const actualOutputTokens = estimateTokens(result.content);
      const actualCostCalc = estimateCost(selectedModel, actualInputTokens, actualOutputTokens);
      setActualCost(actualCostCalc?.totalCost || null);

      try {
        // Look for JSON in the complete result content
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedOutput = JSON.parse(jsonMatch[0]);
          setOutput(parsedOutput);
        } else {
          // If no JSON found, try parsing the entire content
          const parsedOutput = JSON.parse(result.content);
          setOutput(parsedOutput);
        }
      } catch (parseError) {
        console.error('Failed to parse final JSON output:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          contentLength: result.content.length,
          contentPreview: result.content.slice(0, 200)
        });
        // If parsing fails, set the raw content
        setOutput({
          raw: result.content,
          parseError: parseError instanceof Error ? parseError.message : 'Unknown error'
        } as KSARawOutput);
      }
    },
    onProgress: (_progress, content) => {
      // Update streaming content for real-time display
      setStreamingContent(content);

      // Try to parse partial JSON during streaming for structured output
      try {
        // Look for JSON in the streamed content with better error handling
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          // Check if it looks like complete JSON (balanced braces)
          const jsonStr = jsonMatch[0];
          let braceCount = 0;
          let isValid = true;

          for (let i = 0; i < jsonStr.length; i++) {
            if (jsonStr[i] === '{') braceCount++;
            if (jsonStr[i] === '}') braceCount--;
            if (braceCount < 0) {
              isValid = false;
              break;
            }
          }

          if (isValid && braceCount === 0) {
            const parsedPartial = JSON.parse(jsonStr);
            setOutput(parsedPartial);
          }
        }
      } catch (parseError) {
        // Log for debugging but don't crash
        console.debug('Partial JSON parse failed, this is normal during streaming:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          contentLength: content.length
        });
        // Don't update structured output on partial JSON parse errors
        // The final result will be handled in onSuccess
      }
    },
    onError: (errorMessage) => {
      console.error('AI generation failed:', errorMessage);

      // Show error in streaming content with helpful info
      setStreamingContent(`❌ AI Generation Failed

📋 Error Details:
• Error: ${errorMessage}
• Model: ${selectedModel}
• Timestamp: ${new Date().toISOString()}

🔧 Troubleshooting:
• Try selecting a different model (GPT-4o mini recommended)
• Check your JSON input for errors
• Verify internet connection
• Wait a moment and try again

📝 If using GPT-5 models:
• These models may have stricter limits
• Try GPT-4o or GPT-4o mini for better reliability`);
    }
  });

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    const modelInfo = GPT5_FAMILY_OPTIONS.find(m => m.value === modelId)
    setSelectedModelInfo(modelInfo)
  }

  const generateQuestions = async () => {
    reset(); // Clear previous results
    setStreamingContent(''); // Clear streaming content

    try {
      const data: CompanyContextInput = JSON.parse(inputData)

      // Log the data size to check if we're hitting limits
      console.log('Data size check:', {
        dataSize: JSON.stringify(data).length,
        companyProfileSize: JSON.stringify(data.company_profile).length,
        missionCultureSize: JSON.stringify(data.mission_and_culture).length,
        positionsCount: data.positions?.length || 0
      });

      // Validate required fields
      if (!data.company_profile?.name || !data.mission_and_culture?.core_values?.length) {
        throw new Error('Missing required company profile or core values')
      }

      // Show initial loading message
      setStreamingContent('🚀 Starting AI generation...');

      // Generate using the AI utility with shorter instruction set
      await generate({
        prompt: "Generate KSA-based interview questions. Use the company data provided to create specific questions that reflect the actual company name, technologies, and core values.",
        context: data,
        instructionSet: 'ksa-framework-short', // Use the shorter instruction set
        model: selectedModel,
        temperature: supportsTemperatureModel && reasoningEffort === 'none' ? temperature : undefined,
        maxTokens: maxTokens,
        reasoning: supportsReasoningModel ? reasoningEffort : undefined,
        verbosity: supportsReasoningModel ? verbosity : undefined,
      })

    } catch (err) {
      // Handle the error directly here since ErrorBoundary won't catch async errors
      console.error('Error in generateQuestions:', err)

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      const errorDetails = err instanceof Error ? err.stack : undefined

      // Show error state in output
      setOutput({
        error: {
          message: errorMessage,
          type: 'generation_error',
          timestamp: new Date().toISOString(),
          details: errorDetails
        }
      } as KSAInterviewError)

      // Show detailed error in streaming content
      setStreamingContent(`❌ Error: ${errorMessage}

📋 Error Details:
• Type: Generation Error
• Message: ${errorMessage}
• Timestamp: ${new Date().toISOString()}

🔧 Possible Solutions:
• Check your JSON input format
• Verify all required fields are present
• Try a different AI model
• Check internet connection
• Try again in a few moments

If this error persists, please check the console for more details.`)
    }
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(JSON.stringify(output, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadOutput = () => {
    if (output) {
      const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'interview-questions.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }


  return (
    <div className=" mx-auto max-w-[1400px] p-6 ">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-500" />
            AI Interview Question Generator Testing Squite v3
          </h1>
          <p className="text-muted-foreground">
            Generate custom interview questions using our comprehensive KSA guidelines
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              Company Data Input
            </CardTitle>
            <CardDescription>
              Paste your company JSON data below. AI will analyze this information using our KSA framework to generate personalized interview questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model-select" className="flex items-center gap-2 text-sm font-medium">
                <Settings className="h-4 w-4" />
                AI Model Selection
              </Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger id="model-select" className="w-full">
                  <SelectValue placeholder="Select an AI model" />
                </SelectTrigger>
                <SelectContent>
                  {GPT5_FAMILY_OPTIONS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModelInfo && (
                <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded">
                  <strong>Selected:</strong> {selectedModelInfo.label} • {selectedModelInfo.description} •
                  <Badge variant="outline" className="ml-1 text-xs">Group: {selectedModelInfo.group}</Badge>
                </div>
              )}
            </div>

            {/* Advanced Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Advanced configuration
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <Sliders className="h-4 w-4 mr-2" />
                    Advanced
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <ScrollArea className="max-h-96">
                    <div className="space-y-4 pr-2">
                      {/* Reasoning Controls */}
                      {supportsReasoningModel && (
                        <div className="space-y-4">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            Reasoning Controls
                          </Label>

                          {/* Reasoning Effort */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="reasoning-effort" className="text-xs">Reasoning Effort</Label>
                              <span className="text-xs text-muted-foreground">{reasoningEffort}</span>
                            </div>
                            <Select value={reasoningEffort} onValueChange={(value: 'none' | 'low' | 'medium' | 'high') => setReasoningEffort(value)}>
                              <SelectTrigger id="reasoning-effort" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <div className="flex items-center gap-2">
                                    <span>None</span>
                                    <span className="text-xs text-muted-foreground">Fastest responses</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="low">
                                  <div className="flex items-center gap-2">
                                    <span>Low</span>
                                    <span className="text-xs text-muted-foreground">Quick reasoning</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                  <div className="flex items-center gap-2">
                                    <span>Medium</span>
                                    <span className="text-xs text-muted-foreground">Balanced reasoning</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="high">
                                  <div className="flex items-center gap-2">
                                    <span>High</span>
                                    <span className="text-xs text-muted-foreground">Deep reasoning</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="text-xs text-muted-foreground">
                              {reasoningEffort === 'none' && 'Lowest latency, minimal reasoning tokens'}
                              {reasoningEffort === 'low' && 'Quick reasoning for simple tasks'}
                              {reasoningEffort === 'medium' && 'Balanced approach for most tasks'}
                              {reasoningEffort === 'high' && 'Thorough reasoning for complex problems'}
                            </div>
                          </div>

                          {/* Verbosity Control */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="verbosity" className="text-xs">Output Verbosity</Label>
                              <span className="text-xs text-muted-foreground">{verbosity}</span>
                            </div>
                            <Select value={verbosity} onValueChange={(value: 'low' | 'medium' | 'high') => setVerbosity(value)}>
                              <SelectTrigger id="verbosity" className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">
                                  <div className="flex items-center gap-2">
                                    <span>Low</span>
                                    <span className="text-xs text-muted-foreground">Concise responses</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                  <div className="flex items-center gap-2">
                                    <span>Medium</span>
                                    <span className="text-xs text-muted-foreground">Balanced length</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="high">
                                  <div className="flex items-center gap-2">
                                    <span>High</span>
                                    <span className="text-xs text-muted-foreground">Detailed responses</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="text-xs text-muted-foreground">
                              {verbosity === 'low' && 'Shorter responses, lower token usage'}
                              {verbosity === 'medium' && 'Balanced response length'}
                              {verbosity === 'high' && 'Longer, more detailed responses'}
                            </div>
                          </div>

                          {reasoningEffort !== 'none' && supportsTemperatureModel && (
                            <div className="text-xs text-orange-600 flex items-center gap-1 p-2 bg-orange-50 rounded">
                              <Info className="h-3 w-3" />
                              Temperature is disabled when reasoning effort is set above &quot;none&quot;
                            </div>
                          )}
                        </div>
                      )}

                      {/* Temperature Control */}
                      {supportsTemperatureModel && reasoningEffort === 'none' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="temperature-slider" className="text-xs flex items-center gap-1">
                              <Thermometer className="h-3 w-3" />
                              Temperature
                            </Label>
                            <span className="text-xs text-muted-foreground">{temperature.toFixed(2)}</span>
                          </div>
                          <Slider
                            id="temperature-slider"
                            min={0}
                            max={2}
                            step={0.1}
                            value={[temperature]}
                            onValueChange={(value) => setTemperature(value[0])}
                            className="w-full"
                          >
                            <SliderThumb />
                          </Slider>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Precise (0.0)</span>
                            <span>Balanced (1.0)</span>
                            <span>Creative (2.0)</span>
                          </div>
                        </div>
                      )}

                      {/* Max Tokens Control */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="tokens-slider" className="text-xs flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              Max Output Tokens
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Maximum number of tokens for the AI response output</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className="text-xs text-muted-foreground">{maxTokens}</span>
                        </div>
                        <Slider
                          id="tokens-slider"
                          min={500}
                          max={modelMaxTokens}
                          step={100}
                          value={[maxTokens]}
                          onValueChange={(value) => setMaxTokens(value[0])}
                          className="w-full"
                        >
                          <SliderThumb />
                        </Slider>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>500</span>
                          <span>Max: {modelMaxTokens.toLocaleString()}</span>
                        </div>
                        {maxTokens >= modelMaxTokens && (
                          <div className="text-xs text-orange-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            At maximum token limit for {selectedModelInfo?.label}
                          </div>
                        )}
                      </div>

                      {/* Cost Estimation */}
                      {estimatedCostBreakdown && (
                        <div className="space-y-2">
                          <Label className="text-xs">Estimated Cost</Label>
                          <CostIndicator
                            cost={estimatedCostBreakdown}
                            showWarning={true}
                            size="sm"
                          />
                          <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                            <div>Input: ~{estimatedInputTokens.toLocaleString()} tokens</div>
                            <div>Output: ~{estimatedOutputTokens.toLocaleString()} tokens</div>
                          </div>
                        </div>
                      )}

                      {/* Actual Cost Display */}
                      {actualCost !== null && estimatedCostBreakdown && (
                        <div className="space-y-2">
                          <Label className="text-xs">Generation Complete</Label>
                          <CostComparison
                            before={estimatedCostBreakdown}
                            after={{
                              ...estimatedCostBreakdown,
                              totalCost: actualCost,
                              outputCost: actualCost - estimatedCostBreakdown.inputCost,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setInputData(JSON.stringify(sampleData, null, 2))}
                variant="outline"
              >
                Default Sample Data
              </Button>
              <Button
                onClick={generateQuestions}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    {isStreaming ? (
                      <>
                        Generating with {selectedModelInfo?.label || 'AI'}...
                        <span className="ml-2 text-xs text-muted-foreground">(Streaming live)</span>
                      </>
                    ) : (
                      <>
                        Starting {selectedModelInfo?.label || 'AI'}...
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate with {selectedModelInfo?.label || 'AI'}
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <div className={`${isLoading ? 'hidden' : ''}`}>
                <CodeEditor
                  value={inputData}
                  onChange={setInputData}
                  height="400px"
                  title="Company Data JSON"
                  language="json"
                  downloadFileName="company-data.json"
                />
              </div>
              {/* Loading Overlay */}
              <div className={`flex items-center bg-background h-[400px] ${isLoading || isStreaming ? '' : 'hidden'}`}>
                <div className="overflow-hidden animate-in fade-in duration-300 w-full">
                  <div className='flex'>
                    <div className="text-center space-y-6  p-8 h-full w-full">
                      <div className="flex items-center justify-center space-x-3">

                        <div className="space-y-1 text-left">
                          <p className="font-bold  text-lg">
                            {isStreaming ? 'Generating Data...' : 'Initializing AI...'}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {isStreaming && (
                        <div className=" h-2 bg-blue-950/50 rounded-full overflow-hidden border border-blue-500/20">
                          <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full animate-pulse" style={{
                            width: '75%',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                          }}></div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>


            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  {error.includes('API key') && (
                    <div className="mt-2 text-xs">
                      Please ensure your OpenAI API key is configured in the environment variables.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader className="py-4">
            <div className="flex justify-between items-center w-full">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {(isStreaming || (isKSAInterviewOutput(output) && output.processing_method === 'real_ai')) && <Brain className="h-5 w-5 text-blue-500" />}
                  Generated Output
                </CardTitle>
                <CardDescription>
                  Interview questions based on your company data
                  {isKSAInterviewOutput(output) && output.ai_model && (
                    <span className="ml-1 text-blue-600">
                      • Powered by {output.ai_model}
                      {output.model_parameters?.optimization && (
                        <span className="ml-1 text-gray-500">
                          • {output.model_parameters.optimization} optimization
                        </span>
                      )}
                    </span>
                  )}
                </CardDescription>
              </div>
              {output && (
                <div className="flex gap-2">

                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    onClick={downloadOutput}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ErrorBoundary
              mode="full"
              title="AI Generation Error"
              description="There was an error generating or displaying the interview questions."
              icon={<Bug className="h-6 w-6" />}
              onError={(error, errorInfo) => {
                console.error('Error in AI output generation:', error, errorInfo)
              }}
              onRetry={() => {
                // Reset output and streaming content to retry generation
                setOutput(null)
                setStreamingContent('')
                reset()
              }}
            >
              {(isLoading || isStreaming) ? (
                // Loading state with simple streaming content display
                <div className="flex items-center justify-center  text-muted-foreground w-full">
                  <div className="text-center space-y-4">

                    {isStreaming && (
                      <>

                        {streamingContent && (
                          <div className="w-full">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                Live Streaming Output
                              </Badge>
                            </div>
                            <div
                              ref={streamingContainerRef}
                              className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-y-auto border border-gray-700 w-full"
                              style={{ height: "200px", maxHeight: "200px", width: "100%" }}
                            >
                              <pre className="whitespace-pre-wrap break-words text-left w-full">{streamingContent}</pre>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : output ? (
                // Output display state - Handle different output types
                <>
                  {isKSAInterviewError(output) ? (
                    // Error display
                    <div className="p-6">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-destructive">Generation Failed</h3>
                          <p className="text-muted-foreground">{output.error.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(output.error.timestamp || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        <Button onClick={() => {
                          setOutput(null)
                          reset()
                        }} variant="outline">
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : isKSARawOutput(output) ? (
                    // Raw content display (for parsing errors)
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-semibold">Raw AI Response</h3>
                          <p className="text-muted-foreground text-sm">
                            The AI response couldn&apos;t be parsed as JSON, but here&apos;s the raw output:
                          </p>
                          {output.parseError && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                              <p className="text-sm text-destructive">
                                <strong>Parse Error:</strong> {output.parseError}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-xs font-mono whitespace-pre-wrap">
                            {output.raw}
                          </pre>
                        </div>
                        <div className="flex justify-center">
                          <Button onClick={() => {
                            setOutput(null)
                            reset()
                          }} variant="outline">
                            Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Normal structured output display
                    <Tabs defaultValue="framework" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="framework">KSA Framework</TabsTrigger>
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                        <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                        {isKSAInterviewOutput(output) && output.ai_model && <TabsTrigger value="model">Model Info</TabsTrigger>}
                      </TabsList>
                      {/* if tab is on raw value, show this div */}
                      <TabsContent value="raw" className='mb-2'>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Raw Generated JSON</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(JSON.stringify(output, null, 2))}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'interview-questions.json';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value='framework' className='mt-4  relative'>
                        <h3 className="text-lg font-semibold">Knowledge, Skills, Abilities Framework</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                          Core Evaluation Framework
                        </p>
                        <div className='h-[1px] bg-border w-full mt-1 ' />
                      </TabsContent>

                      <ScrollArea className="h-[calc(100vh-320px)]">
                        <TabsContent value="framework" className="mt-4">
                          <div className="space-y-6">
                            {/* KSA Framework Display */}
                            {(() => {
                              const ksas = output.KSAs || output.KSA_Framework?.KSAs || {};
                              const weightingDistribution: Record<string, number> = output.KSA_Framework?.weightingDistribution || {};

                              return Object.keys(ksas).length > 0 ? (
                                <div>
                                  {/* KSA Categories Grid - Compact with Popovers */}
                                  <div className="grid gap-3 md:grid-cols-3">
                                    {Object.entries(ksas).map(([key, value]: [string, any]) => {
                                      const weightPercentage = value.weighting || weightingDistribution[key] || 0;
                                      const isHighestWeight = weightPercentage === Math.max(...Object.values(ksas).map((k: any) => k.weighting || 0));

                                      return (
                                        <Popover key={key}>
                                          <PopoverTrigger asChild>
                                            <Card className={`relative overflow-hidden border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${key === 'Knowledge' ? 'border-blue-200 hover:border-blue-300' :
                                              key === 'Skills' ? 'border-green-200 hover:border-green-300' :
                                                key === 'Abilities' ? 'border-purple-200 hover:border-purple-300' :
                                                  'border-amber-200 hover:border-amber-300'
                                              }`}>
                                              <CardHeader className="relative py-3 px-4">
                                                <div className="flex justify-between items-center w-full">
                                                  <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${key === 'Knowledge' ? 'bg-blue-100 dark:bg-blue-900/50' :
                                                      key === 'Skills' ? 'bg-green-100 dark:bg-green-900/50' :
                                                        key === 'Abilities' ? 'bg-purple-100 dark:bg-purple-900/50' :
                                                          'bg-amber-100 dark:bg-amber-900/50'
                                                      }`}>
                                                      {key === 'Knowledge' && <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                                                      {key === 'Skills' && <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                                      {key === 'Abilities' && <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                                                      {key === 'Value' && <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                                                    </div>
                                                    <div>
                                                      <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                        {key}
                                                      </CardTitle>
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col items-end gap-1">
                                                    <Badge
                                                      variant="outline"
                                                      className={`text-xs font-bold px-2 py-0.5 ${isHighestWeight ? 'ring-1 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-orange-400 border-orange-300 text-orange-700 dark:text-orange-300' :
                                                        key === 'Knowledge' ? 'border-blue-300 text-blue-700 dark:text-blue-300' :
                                                          key === 'Skills' ? 'border-green-300 text-green-700 dark:text-green-300' :
                                                            key === 'Abilities' ? 'border-purple-300 text-purple-700 dark:text-purple-300' :
                                                              'border-amber-300 text-amber-700 dark:text-amber-300'
                                                        }`}
                                                    >
                                                      {weightPercentage}%
                                                    </Badge>

                                                  </div>
                                                </div>
                                              </CardHeader>
                                            </Card>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-96" align="start" side="bottom">
                                            <div className="space-y-4">
                                              <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                  <div className={`p-2 rounded-lg ${key === 'Knowledge' ? 'bg-blue-100 dark:bg-blue-900/50' :
                                                    key === 'Skills' ? 'bg-green-100 dark:bg-green-900/50' :
                                                      key === 'Abilities' ? 'bg-purple-100 dark:bg-purple-900/50' :
                                                        'bg-amber-100 dark:bg-amber-900/50'
                                                    }`}>
                                                    {key === 'Knowledge' && <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                                                    {key === 'Skills' && <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />}
                                                    {key === 'Abilities' && <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                                                    {key === 'Value' && <CheckCircle2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                                                  </div>
                                                  <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{key}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                      {key === 'Knowledge' ? 'Information & Understanding' :
                                                        key === 'Skills' ? 'Capabilities & Proficiency' :
                                                          key === 'Abilities' ? 'Performance & Execution' :
                                                            'Alignment & Culture'}
                                                    </p>
                                                  </div>
                                                  <div className="ml-auto">
                                                    <Badge
                                                      variant="outline"
                                                      className={`text-sm font-bold px-2 py-1 ${isHighestWeight ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-orange-400 border-orange-300 text-orange-700 dark:text-orange-300' :
                                                        key === 'Knowledge' ? 'border-blue-300 text-blue-700 dark:text-blue-300' :
                                                          key === 'Skills' ? 'border-green-300 text-green-700 dark:text-green-300' :
                                                            key === 'Abilities' ? 'border-purple-300 text-purple-700 dark:text-purple-300' :
                                                              'border-amber-300 text-amber-700 dark:text-amber-300'
                                                        }`}
                                                    >
                                                      {weightPercentage}%
                                                    </Badge>
                                                  </div>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                  {value.definition}
                                                </p>
                                              </div>

                                              <Separator />

                                              {/* Behavioral Indicators */}
                                              {value.behavioral_indicators && value.behavioral_indicators.length > 0 && (
                                                <div>
                                                  <h5 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${key === 'Knowledge' ? 'bg-blue-500' :
                                                      key === 'Skills' ? 'bg-green-500' :
                                                        key === 'Abilities' ? 'bg-purple-500' :
                                                          'bg-amber-500'
                                                      }`}></span>
                                                    Key Indicators
                                                  </h5>
                                                  <ul className="space-y-1">
                                                    {value.behavioral_indicators.map((indicator: string, i: number) => (
                                                      <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                                        <span className={`mt-1.5 w-1 h-1 rounded-full ${key === 'Knowledge' ? 'bg-blue-400' :
                                                          key === 'Skills' ? 'bg-green-400' :
                                                            key === 'Abilities' ? 'bg-purple-400' :
                                                              'bg-amber-400'
                                                          }`}></span>
                                                        <span>{indicator}</span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}

                                              {/* Assessment Methods */}
                                              {value.assessment_methods && value.assessment_methods.length > 0 && (
                                                <div>
                                                  <h5 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Assessment Methods</h5>
                                                  <div className="flex flex-wrap gap-1">
                                                    {value.assessment_methods.map((method: string, i: number) => (
                                                      <Badge key={i} variant="secondary" className="text-xs">
                                                        {method}
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Role Expectations */}
                                              {value.role_level_expectations && (
                                                <div>
                                                  <h5 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">Role Expectations</h5>
                                                  <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                    {value.role_level_expectations}
                                                  </p>
                                                </div>
                                              )}

                                              {/* Red Flags */}
                                              {value.red_flag_indicators && value.red_flag_indicators.length > 0 && (
                                                <div>
                                                  <h5 className="font-semibold text-sm text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Red Flags
                                                  </h5>
                                                  <ul className="space-y-1">
                                                    {value.red_flag_indicators.map((flag: string, i: number) => (
                                                      <li key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                                                        <span className="mt-1.5 text-red-500">•</span>
                                                        <span>{flag}</span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      );
                                    })}
                                  </div>
                                  <Separator className="my-6" />

                                  {/* Weight Distribution Summary */}
                                  {Object.keys(weightingDistribution).length > 0 && (
                                    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 mt-8">
                                      <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                          <Zap className="h-5 w-5 text-orange-500" />
                                          Weight Distribution
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Total allocation across all KSA categories
                                        </p>
                                      </CardHeader>
                                      <CardContent className="pt-0">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          {Object.entries(weightingDistribution).map(([key, weight]) => (
                                            <div key={key} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                              <Badge
                                                variant="outline"
                                                className={`mb-2 ${key === 'Knowledge' ? 'border-blue-300 text-blue-700 dark:text-blue-300' :
                                                  key === 'Skills' ? 'border-green-300 text-green-700 dark:text-green-300' :
                                                    key === 'Abilities' ? 'border-purple-300 text-purple-700 dark:text-purple-300' :
                                                      'border-amber-300 text-amber-700 dark:text-amber-300'
                                                  }`}
                                              >
                                                {key}
                                              </Badge>
                                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {weight}%
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                  <p className="text-lg text-gray-500 dark:text-gray-400">No KSA framework data available</p>
                                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Generate questions to see the evaluation framework</p>
                                </div>
                              );
                            })()}
                          </div>

                          {/* KSA Scoring Metrics */}
                          {(() => {
                            const ksas = output.KSAs || output.KSA_Framework?.KSAs || {};
                            const companyFitData = output.CoreValues_CompanyFit || {};

                            return Object.keys(ksas).length > 0 ? (
                              <div className="grid gap-6 md:grid-cols-2">
                                {/* Job Fit Scoring */}
                                <Card className="border-blue-200">
                                  <CardHeader className="py-4">
                                    <div className="flex items-center gap-2">
                                      <Brain className="h-5 w-5 text-blue-500" />
                                      <CardTitle className="text-lg">Job Fit Scoring Metrics</CardTitle>
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">KSA Assessment</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Evaluation criteria and scoring weights for position requirements
                                    </p>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {Object.entries(ksas).map(([key, value]: [string, any]) => (
                                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${key === 'Knowledge' ? 'bg-blue-500' :
                                            key === 'Skills' ? 'bg-green-500' :
                                              key === 'Abilities' ? 'bg-purple-500' : 'bg-amber-500'}`} />
                                          <span className="font-medium text-sm">{key}</span>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-lg font-bold">{value.weighting || 0}%</div>
                                          <div className="text-xs text-muted-foreground">Weight</div>
                                        </div>
                                      </div>
                                    ))}

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Evaluation Methods
                                      </h4>
                                      {Object.values(ksas).flatMap((k: any) => k.assessment_methods || []).map((method: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="mr-1 mb-1">
                                          {method}
                                        </Badge>
                                      ))}
                                    </div>

                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-orange-500" />
                                        Red Flag Indicators
                                      </h4>
                                      {Object.values(ksas).flatMap((k: any) => k.red_flag_indicators || []).slice(0, 4).map((indicator: string, idx: number) => (
                                        <div key={idx} className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                          <span className="w-1 h-1 bg-orange-500 rounded-full" />
                                          {indicator}
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Company Fit Scoring */}
                                <Card className="border-purple-200">
                                  <CardHeader className="py-4">
                                    <div className="flex items-center gap-2">
                                      <Settings className="h-5 w-5 text-purple-500" />
                                      <CardTitle className="text-lg">Company Fit Scoring Metrics</CardTitle>
                                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 w-[120px]">Cultural Alignment</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Core values alignment and cultural fit assessment criteria
                                    </p>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {Object.entries(companyFitData).map(([value, data]: [string, any]) => (
                                      <div key={value} className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center justify-between mb-2">
                                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                            {value}
                                          </Badge>
                                          <span className="text-xs text-purple-600 dark:text-purple-400">
                                            {data.questions?.length || 0} questions
                                          </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          Assesses alignment with company&apos;s core value of {value.toLowerCase()}
                                        </p>
                                      </div>
                                    ))}

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                      <h4 className="text-sm font-medium flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Strong Response Indicators
                                      </h4>
                                      {Object.values(companyFitData).flatMap((c: any) =>
                                        c.questions?.flatMap((q: any) =>
                                          q.sample_indicators?.strong_response ? [q.sample_indicators.strong_response] : []
                                        ) || []
                                      ).slice(0, 3).map((indicator: string, idx: number) => (
                                        <div key={idx} className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                          <span className="w-1 h-1 bg-green-500 rounded-full" />
                                          {indicator.length > 80 ? indicator.slice(0, 80) + '...' : indicator}
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            ) : null;
                          })()}

                          {/* Values Section - Company Fit */}
                          {(() => {
                            const companyData = JSON.parse(inputData);
                            const companyValues = companyData.company_profile?.values || [];
                            const missionValues = companyData.mission_and_culture?.core_values || [];

                            // Handle both string arrays and object arrays with name/description
                            const extractValues = (valuesArray: any[]) => {
                              return valuesArray.map(v =>
                                typeof v === 'string' ? v :
                                  typeof v === 'object' && v.name ? v.name :
                                    String(v)
                              );
                            };

                            const companyValuesList = extractValues(companyValues);
                            const missionValuesList = extractValues(missionValues);
                            const allValues = [...new Set([...companyValuesList, ...missionValuesList])];

                            return allValues.length > 0 ? (
                              <div>
                                <Separator className="my-6" />
                                <div className="space-y-6">
                                  <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="h-5 w-5 text-amber-500" />
                                    <h3 className="text-lg font-semibold">Values: Company Fit</h3>
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">Cultural Alignment</Badge>
                                  </div>

                                  <Card className="border-amber-200">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-base flex items-center gap-2">
                                        <Badge variant="outline" className="border-amber-300 text-amber-700">
                                          Company Values from Input Data
                                        </Badge>
                                      </CardTitle>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Core values pulled directly from company profile and mission data
                                      </p>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {allValues.map((value: string, idx: number) => (
                                          <div key={idx} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                                Value {idx + 1}
                                              </Badge>
                                              <span className="text-xs text-amber-600 dark:text-amber-400">
                                                Company Core Value
                                              </span>
                                            </div>
                                            <div className="font-medium text-sm mb-1">{value}</div>
                                            <div className="text-xs text-muted-foreground">
                                              Behavioral question generated for cultural fit assessment
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      <Separator className="my-4" />

                                      <div className="space-y-2">
                                        <h4 className="text-sm font-medium flex items-center gap-2">
                                          <Info className="h-4 w-4 text-blue-500" />
                                          Assessment Approach
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                          Values are extracted from your company profile and mission statements.
                                          For each value, the AI generates behavioral interview questions to assess
                                          cultural fit and alignment with your organization&apos;s core principles.
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </TabsContent>

                        <TabsContent value="questions" className="mt-4  transition duration-200 ease-in-out ">
                          <div className="space-y-8">
                            {/* Job Fit KSA Questions */}
                            {(() => {
                              const jobFitData = output.KSA_JobFit || {};
                              return Object.keys(jobFitData).length > 0 ? (
                                <div className='w-fit'>
                                  <div className="flex items-center gap-2 mb-4">
                                    <Brain className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-lg font-semibold">Job Fit Interview Questions</h3>
                                    <Badge variant="secondary">KSA Assessment</Badge>
                                  </div>

                                  <div className="space-y-6">
                                    {Object.entries(jobFitData).map(([category, data]: [string, any]) => (
                                      <Card key={category} className="relative overflow-hidden">
                                        {/* Category Header */}
                                        <div className={`absolute inset-0 bg-gradient-to-r opacity-5 ${category === 'Knowledge' ? 'from-blue-500 to-blue-600' :
                                          category === 'Skills' ? 'from-green-500 to-green-600' :
                                            (category === 'Ability' || category === 'Abilities') ? 'from-purple-500 to-purple-600' :
                                              category === 'Value' ? 'from-amber-500 to-amber-600' :
                                                'from-gray-500 to-gray-600'
                                          }`} />

                                        <CardHeader className="relative">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <CardTitle className="text-base flex items-center gap-2">
                                                {category === 'Knowledge' && <Brain className="h-4 w-4 text-blue-500" />}
                                                {category === 'Skills' && <Zap className="h-4 w-4 text-green-500" />}
                                                {(category === 'Ability' || category === 'Abilities') && <Settings className="h-4 w-4 text-purple-500" />}
                                                {category === 'Value' && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                                                {category}
                                              </CardTitle>
                                              {data.attribute && (
                                                <div className="mt-2 space-y-1">
                                                  <p className="text-sm text-muted-foreground">{data.attribute.definition}</p>
                                                  <div className="flex items-center gap-2 text-xs">
                                                    <Badge variant="outline">Weight: {data.attribute?.weighting || 'N/A'}%</Badge>
                                                    <Badge variant="secondary">Questions: {data.questions?.length || 0}</Badge>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </CardHeader>

                                        <CardContent className="relative space-y-3">
                                          {/* Questions - Compact with Popovers */}
                                          {data.questions && data.questions.length > 0 && (
                                            <div className="space-y-2">
                                              {data.questions.map((question: any, qIndex: number) => (
                                                <Popover key={question.id || qIndex}>
                                                  <PopoverTrigger asChild>
                                                    <div className="border-l-4 border-blue-200 hover:border-blue-300 bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 p-3 rounded-r-lg cursor-pointer transition-colors">
                                                      <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-medium flex-1 truncate pr-2">
                                                          {question.questionText || question.question_text}
                                                        </p>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                          {question.difficulty && (
                                                            <Badge variant="outline" className="text-xs">
                                                              {question.difficulty}
                                                            </Badge>
                                                          )}
                                                          <ChevronDown className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-96" align="start" side="bottom">
                                                    <div className="space-y-3">
                                                      <div>
                                                        <p className="font-medium text-sm mb-2">
                                                          {question.questionText || question.question_text}
                                                        </p>
                                                        {question.difficulty && (
                                                          <Badge variant="outline" className="text-xs mb-2">
                                                            Difficulty: {question.difficulty}
                                                          </Badge>
                                                        )}
                                                      </div>

                                                      <Separator />

                                                      <div className="space-y-2 text-xs">
                                                        {question.evaluationCriteria && (
                                                          <div>
                                                            <span className="font-medium text-blue-600 dark:text-blue-400">Evaluation Criteria:</span>
                                                            <p className="mt-1 text-gray-600 dark:text-gray-300">{question.evaluationCriteria}</p>
                                                          </div>
                                                        )}

                                                        {question.expectedAnswers && (
                                                          <div>
                                                            <span className="font-medium text-green-600 dark:text-green-400">Expected Answers:</span>
                                                            <p className="mt-1 text-gray-600 dark:text-gray-300">{question.expectedAnswers}</p>
                                                          </div>
                                                        )}

                                                        {question.followUpProbes && question.followUpProbes.length > 0 && (
                                                          <div>
                                                            <span className="font-medium text-purple-600 dark:text-purple-400">Follow-up Probes:</span>
                                                            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                              {question.followUpProbes.map((probe: string, pIndex: number) => (
                                                                <li key={pIndex}>{probe}</li>
                                                              ))}
                                                            </ul>
                                                          </div>
                                                        )}

                                                        {question.redFlagIndicators && question.redFlagIndicators.length > 0 && (
                                                          <div>
                                                            <span className="font-medium text-red-600 dark:text-red-400">Red Flag Indicators:</span>
                                                            <ul className="list-disc list-inside mt-1 space-y-1 text-red-600 dark:text-red-400">
                                                              {question.redFlagIndicators.map((flag: string, fIndex: number) => (
                                                                <li key={fIndex}>{flag}</li>
                                                              ))}
                                                            </ul>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </PopoverContent>
                                                </Popover>
                                              ))}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              ) : null;
                            })()}

                            {/* Company Fit Questions */}
                            {(() => {
                              const companyFitData = output.CoreValues_CompanyFit || {};
                              return Object.keys(companyFitData).length > 0 ? (
                                <div className='b'>
                                  <Separator className="my-6" />
                                  <div className="flex items-center gap-2 mb-4">
                                    <Settings className="h-5 w-5 text-purple-500" />
                                    <h3 className="text-lg font-semibold">Core Values Company Fit Questions</h3>
                                    <Badge variant="secondary">Cultural Alignment</Badge>
                                  </div>

                                  <div className="space-y-6">
                                    {Object.entries(companyFitData).map(([value, data]: [string, any]) => (
                                      <Card key={value} className="relative overflow-hidden">
                                        {/* Company Value Header */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10" />

                                        <CardHeader className="relative">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <CardTitle className="text-base flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                  {value}
                                                </Badge>
                                              </CardTitle>
                                              <p className="text-sm text-muted-foreground mt-1">
                                                Assesses alignment with company&apos;s core value of {value.toLowerCase()}
                                              </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                              {data.questions?.length || 0} questions
                                            </Badge>
                                          </div>
                                        </CardHeader>

                                        <CardContent className="relative space-y-2 ">
                                          {/* Company Fit Questions - Compact with Popovers */}
                                          {data.questions && data.questions.map((question: any, qIndex: number) => (
                                            <Popover key={question.id || qIndex}>
                                              <PopoverTrigger asChild>
                                                <div className=" border-l-4 border-purple-200 hover:border-purple-300 bg-purple-50/30 dark:bg-purple-950/10 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 p-3 rounded-r-lg cursor-pointer transition-colors">
                                                  <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-medium flex-1 truncate pr-2">
                                                      {question.questionText || question.question_text}
                                                    </p>
                                                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                  </div>
                                                </div>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-[450px]" align="start" side="bottom">
                                                <div className="space-y-3">
                                                  <div>
                                                    <p className="font-medium text-sm mb-2">
                                                      {question.questionText || question.question_text}
                                                    </p>
                                                  </div>

                                                  <Separator />

                                                  <div className="space-y-3 text-xs">
                                                    {/* Scoring Anchors */}
                                                    {question.sampleIndicators && (
                                                      <div>
                                                        <span className="font-medium text-purple-600 dark:text-purple-400">📊 Scoring Anchors:</span>
                                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                                          {/* Great (7-10) */}
                                                          <div className="p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                                                            <div className="flex items-center gap-2 mb-1">
                                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                              <span className="font-medium text-green-700 dark:text-green-300">Great (7-10)</span>
                                                            </div>
                                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                              {question.sampleIndicators.strongResponse}
                                                            </p>
                                                          </div>

                                                          {/* Poor (1-3) */}
                                                          <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                                                            <div className="flex items-center gap-2 mb-1">
                                                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                              <span className="font-medium text-red-700 dark:text-red-300">Poor (1-3)</span>
                                                            </div>
                                                            <p className="text-xs text-red-600 dark:text-red-400">
                                                              {question.sampleIndicators.weakResponse}
                                                            </p>
                                                          </div>

                                                          {/* Average (4-6) */}
                                                          <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded">
                                                            <div className="flex items-center gap-2 mb-1">
                                                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                              <span className="font-medium text-amber-700 dark:text-amber-300">Average (4-6)</span>
                                                            </div>
                                                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                                              Mix of strong and weak indicators, some relevant examples but inconsistent depth
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}

                                                    {question.followUpProbes && question.followUpProbes.length > 0 && (
                                                      <div>
                                                        <span className="font-medium text-blue-600 dark:text-blue-400">Follow-up Probes:</span>
                                                        <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600 dark:text-gray-300">
                                                          {question.followUpProbes.map((probe: string, pIndex: number) => (
                                                            <li key={pIndex}>{probe}</li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </PopoverContent>
                                            </Popover>
                                          ))}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              ) : null;
                            })()}

                            {/* Position-based fallback */}
                            {(() => {
                              const positions = output.positions || output.Positions || [];
                              return (!output.KSA_JobFit && !output.CoreValues_CompanyFit) && positions && Array.isArray(positions) && positions.length > 0 ? (
                                positions.map((positionData: any, index: number) => (
                                  <div key={index}>
                                    <h3 className="text-lg font-semibold mb-4">
                                      {positionData.position || positionData.title || `Position ${index + 1}`}
                                    </h3>

                                    {/* Job Fit Questions */}
                                    {positionData.KSA_JobFit && Object.keys(positionData.KSA_JobFit).length > 0 && (
                                      <div className="space-y-4 mb-6">
                                        <h4 className="font-medium">Job Fit Questions</h4>
                                        {Object.entries(positionData.KSA_JobFit).map(([category, data]: [string, any]) => (
                                          <Card key={category}>
                                            <CardHeader>
                                              <div className="flex justify-between items-center">
                                                <CardTitle className="text-sm">{category}</CardTitle>
                                                <Badge variant="outline">{data.questions?.length || 0} questions</Badge>
                                              </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                              {data.questions && data.questions.map((question: any, qIndex: number) => (
                                                <div key={qIndex} className="border-l-2 border-primary pl-3">
                                                  <p className="text-sm font-medium mb-1">{question.question_text}</p>
                                                  <div className="text-xs text-muted-foreground space-y-1">
                                                    <p><strong>Evaluation:</strong> {question.evaluation_criteria}</p>
                                                    {question.follow_up_probes && (
                                                      <p><strong>Follow-ups:</strong> {question.follow_up_probes.slice(0, 2).join(', ')}</p>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    )}

                                    {/* Company Fit Questions */}
                                    {positionData.CoreValues_CompanyFit && Object.keys(positionData.CoreValues_CompanyFit).length > 0 && (
                                      <div className="space-y-4">
                                        <h4 className="font-medium">Company Fit Questions</h4>
                                        {Object.entries(positionData.CoreValues_CompanyFit).map(([value, data]: [string, any]) => (
                                          <Card key={value}>
                                            <CardHeader>
                                              <div className="flex justify-between items-center">
                                                <CardTitle className="text-sm">Value: {value}</CardTitle>
                                                <Badge variant="outline">{data.questions?.length || 0} questions</Badge>
                                              </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                              {data.questions && data.questions.map((question: any, qIndex: number) => (
                                                <div key={qIndex} className="border-l-2 border-secondary pl-3">
                                                  <p className="text-sm font-medium mb-1">{question.question_text}</p>
                                                  <div className="text-xs text-muted-foreground">
                                                    <p><strong>Strong response:</strong> {question.sample_indicators?.strong_response}</p>
                                                  </div>
                                                </div>
                                              ))}
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    )}

                                    {index < positions.length - 1 && <Separator />}
                                  </div>
                                ))
                              ) : null;
                            })()}

                            {/* No data state */}
                            {(!output.KSA_JobFit && !output.CoreValues_CompanyFit && (!output.positions || output.positions.length === 0)) && (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>No interview questions available</p>
                                <p className="text-sm">Generate questions to see job fit and company fit assessments</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="raw" className='mt-0 hover:pr-2 transition duration-200 ease-in-out'>
                          <div className="space-y-4">

                            <div className="bg-muted  p-4 rounded-lg overflow-x-auto">
                              <pre className="text-xs font-mono whitespace-pre-wrap">
                                {JSON.stringify(output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </TabsContent>

                        {output?.ai_model && (
                          <TabsContent value="model" className="mt-4">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Model Information</h3>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-blue-500" />
                                    AI Model Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground">Model</h4>
                                      <p className="text-sm font-semibold">{output.ai_model}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground">Optimization</h4>
                                      <p className="text-sm font-semibold capitalize">{output.model_parameters?.optimization}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground">Temperature</h4>
                                      <p className="text-sm font-semibold">{output.model_parameters?.temperature}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm text-muted-foreground">Max Tokens</h4>
                                      <p className="text-sm font-semibold">{output.model_parameters?.max_tokens}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Generated At</h4>
                                    <p className="text-sm">
                                      {new Date(output.generated_at || Date.now()).toLocaleString()}
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Processing Method</h4>
                                    <Badge variant={output.processing_method === 'real_ai' ? 'primary' : 'secondary'}>
                                      {output.processing_method === 'real_ai' ? 'Real AI Generation' : 'Template Generation'}
                                    </Badge>
                                  </div>

                                  {output.model_parameters?.optimization && (
                                    <Alert>
                                      <AlertCircle className="h-4 w-4" />
                                      <AlertDescription>
                                        {output.model_parameters.optimization === 'premium' && 'This generation used premium optimization with higher token limits and increased creativity.'}
                                        {output.model_parameters.optimization === 'cost_efficient' && 'This generation used cost-efficient optimization with lower token limits for faster, more affordable responses.'}
                                        {output.model_parameters.optimization === 'standard' && 'This generation used standard optimization with balanced performance and cost.'}
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                        )}
                      </ScrollArea>

                    </Tabs>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <p>Generated questions will appear here</p>
                    <p className="text-sm">Enter your company data and click &quot;Generate Questions&quot; to begin</p>
                  </div>
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}