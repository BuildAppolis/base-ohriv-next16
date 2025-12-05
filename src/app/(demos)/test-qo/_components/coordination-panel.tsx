/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sliders, Maximize2 } from "lucide-react";
import type { OptimizationResult } from "../_types/optimized";
import { JsonEditor } from "./json-editor";
import { FullscreenEditor } from "./fullscreen-editor";
import { localStorageManager } from "../_utils/localStorage-manager";
import { useSSEStream } from "../_hooks/use-sse-stream";
import {
  AI_MODEL_OPTIONS,
  getModelDescription,
  getModelGroup,
  COORDINATION_MODEL_RECOMMENDATIONS,
  getModelCategory,
} from "@/lib/ai/ai-models";

interface CoordinationPanelProps {
  optimizedCompany: OptimizationResult;
  selectedCompany: any; // Using any to avoid import issues with Company
}

export function CoordinationPanel({ optimizedCompany }: CoordinationPanelProps) {
  const [activeTab, setActiveTab] = useState("context");
  const [editedContext, setEditedContext] = useState("");
  const [orchestratorPrompt, setOrchestratorPrompt] = useState("");
  const [questionInstructions, setQuestionInstructions] = useState("");
  const [questionExpectedOutput, setQuestionExpectedOutput] = useState("");
  const [attributeInstructions, setAttributeInstructions] = useState("");
  const [attributeExpectedOutput, setAttributeExpectedOutput] = useState("");
  const [validationPrompt, setValidationPrompt] = useState("");

  // Default prompts (defined outside useEffect for accessibility)
  const defaultOrchestrationPrompt = `Based on the company context, generate a comprehensive orchestration plan for interview system optimization. This should include:

1. **Analysis of Current State**: Evaluate the company's existing interview workflow, technology stack, team structure, and hiring needs
2. **Recommended Interview Process Structure**: Design an optimized interview sequence with clear stages, purposes, and evaluation criteria
3. **Key Focus Areas for Question Generation**: Identify technical and behavioral competencies to assess based on role requirements
4. **Prioritized Attribute Categories**: Define the key attributes and skills to evaluate for different role levels (junior, mid, senior)
5. **Specific Implementation Recommendations**: Provide actionable next steps for implementing the optimized interview system

Focus on creating a scalable, consistent, and effective interview process that aligns with the company's values and business objectives. Ensure the recommendations are practical and can be implemented with reasonable effort.

Respond with a structured JSON object containing analysis, recommendations, and implementation guidance.`;

  const defaultQuestionInstructions = `Generate comprehensive interview questions that evaluate both technical competence and cultural alignment. Questions should:

1. **Technical Assessment**: Cover core skills relevant to the role (coding, system design, frameworks, databases)
2. **Problem-Solving**: Include practical scenarios that test analytical thinking and approach
3. **Behavioral Evaluation**: Assess past experience, collaboration, and decision-making using STAR format
4. **Role-Specific Focus**: Tailor difficulty and scope to seniority level (junior/mid/senior)
5. **Cultural Fit**: Evaluate alignment with company values and team dynamics

For each question, provide:
- Clear question text and context
- Expected evaluation criteria
- Sample indicators of strong vs weak responses
- Suggested follow-up probes for deeper assessment

Generate questions that can be reliably scored and provide actionable insights into candidate capabilities.`;

  const defaultQuestionExpectedOutput = `Expected output format for generated questions:

Each question should include:
- Clear, unambiguous question text
- Specific evaluation criteria
- Expected answer structure
- Follow-up probes for deeper assessment
- Time limits and difficulty levels
- Skills being assessed
- Red flag indicators

Generate structured JSON output with question objects containing id, category, type, difficulty, question text, evaluation criteria, and expected answers.`;

  const defaultAttributeInstructions = `Define structured evaluation attributes that provide comprehensive assessment of candidate qualifications and potential. Attributes should include:

**Technical Competencies:**
1. **Core Skills**: Programming language proficiency, framework expertise, system design capabilities
2. **Problem-Solving**: Algorithmic thinking, debugging skills, optimization approaches
3. **Architecture Knowledge**: Scalability considerations, trade-off analysis, technical decision-making
4. **Tool Proficiency**: Development tools, version control, testing frameworks, CI/CD understanding

**Professional Attributes:**
1. **Communication**: Clarity, active listening, technical explanation ability
2. **Collaboration**: Team interaction, conflict resolution, knowledge sharing
3. **Leadership**: Mentorship potential, decision-making, accountability, initiative
4. **Adaptability**: Learning ability, flexibility, response to change

**Cultural Alignment:**
1. **Values Fit**: Alignment with company mission and core values
2. **Work Ethic**: Initiative, ownership, quality focus, reliability
3. **Growth Mindset**: Continuous learning, feedback receptivity, improvement orientation
4. **Team Dynamics**: Interpersonal skills, emotional intelligence, cultural contribution

For each attribute, provide:
- Clear definition and behavioral indicators
- Rating scale (e.g., 1-5) with descriptive anchors
- Assessment methods and question types
- Weighting based on role priorities
- Red flag indicators to watch for

Generate attributes that enable consistent, objective evaluation while capturing both current capability and growth potential.`;

  const defaultAttributeExpectedOutput = `Expected output format for generated evaluation attributes:

Each attribute category should include:
- Clear definitions and behavioral indicators
- 5-point evaluation scale with descriptive anchors
- Assessment methods and question types
- Weighting based on role priorities
- Role-level expectations and critical indicators
- Red flag identification system

Generate structured JSON output with attribute categories, evaluation scales, behavioral indicators, and red flag systems.`;

  const defaultValidationPrompt = `Perform comprehensive final validation of all interview system components to ensure 100% readiness for production deployment. Validate:

**Input Data Completeness:**
1. Company context accuracy and completeness
2. Role requirements and responsibilities clarity
3. Technical stack and tooling specifications
4. Team structure and hiring priorities
5. Culture and values alignment

**Orchestration Plan Quality:**
1. Interview process structure efficiency
2. Stage sequencing and dependencies
3. Evaluation criteria completeness
4. Role-level differentiation clarity
5. Implementation feasibility assessment

**Question Generation Effectiveness:**
1. Technical question appropriateness for roles
2. Behavioral question alignment with values
3. Difficulty progression across seniority levels
4. Evaluation rubric reliability
5. Cultural fit assessment thoroughness

**Attribute Framework Robustness:**
1. Attribute categories comprehensiveness
2. Rating scale validity and reliability
3. Behavioral indicators clarity
4. Weighting system appropriateness
5. Red flag identification accuracy

**System Integration Readiness:**
1. Data structure compatibility
2. API endpoint requirements
3. User workflow integration
4. Quality assurance checkpoints
5. Deployment preparation status

Provide a final validation report with:
- ✅ Pass/Fail status for each category
- 🔧 Critical issues requiring immediate attention
- ⚠️ Recommendations for optimization
- 📊 Overall system readiness score (0-100)
- 🚀 Go/No-Go recommendation for production deployment

This validation ensures the interview system meets all requirements for accurate, fair, and effective candidate evaluation before going live.`;

  // AI Parameters
  const [aiModel, setAiModel] = useState("gpt-5-mini");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [confidence, setConfidence] = useState(0.8);

  // Fullscreen editor states
  const [isOrchestratorFullscreen, setIsOrchestratorFullscreen] = useState(false);
  const [isQuestionInstructionsFullscreen, setIsQuestionInstructionsFullscreen] = useState(false);
  const [isQuestionExpectedOutputFullscreen, setIsQuestionExpectedOutputFullscreen] = useState(false);
  const [isAttributeInstructionsFullscreen, setIsAttributeInstructionsFullscreen] = useState(false);
  const [isAttributeExpectedOutputFullscreen, setIsAttributeExpectedOutputFullscreen] = useState(false);

  // AI streaming states
  const orchestrationStream = useSSEStream();
  const validationStream = useSSEStream();
  const demoStream = useSSEStream();

  // Original optimized company data as fallback
  const originalContext = JSON.stringify(optimizedCompany.optimized_company, null, 2);

  // Load saved data on mount
  useEffect(() => {
    // Load saved input context
    const savedContext = localStorageManager.getCurrentVersion('input_context');
    if (savedContext) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedContext(savedContext.content);
    } else {
      setEditedContext(originalContext);
    }

    // Load saved orchestrator prompt
    const savedPrompt = localStorageManager.getCurrentVersion('orchestrator_prompt');
    if (savedPrompt) {
      setOrchestratorPrompt(savedPrompt.content);
    } else {
      setOrchestratorPrompt(defaultOrchestrationPrompt);
    }

    // Load saved question instructions
    const savedQuestionInstructions = localStorageManager.getCurrentVersion('question_instructions');
    if (savedQuestionInstructions) {
      setQuestionInstructions(savedQuestionInstructions.content);
    } else {
      setQuestionInstructions(defaultQuestionInstructions);
    }

    // Load saved question expected output
    const savedQuestionExpectedOutput = localStorageManager.getCurrentVersion('question_expected_output');
    if (savedQuestionExpectedOutput) {
      setQuestionExpectedOutput(savedQuestionExpectedOutput.content);
    } else {
      setQuestionExpectedOutput(defaultQuestionExpectedOutput);
    }

    // Load saved attribute instructions
    const savedAttributeInstructions = localStorageManager.getCurrentVersion('attribute_instructions');
    if (savedAttributeInstructions) {
      setAttributeInstructions(savedAttributeInstructions.content);
    } else {
      setAttributeInstructions(defaultAttributeInstructions);
    }

    // Load saved attribute expected output
    const savedAttributeExpectedOutput = localStorageManager.getCurrentVersion('attribute_expected_output');
    if (savedAttributeExpectedOutput) {
      setAttributeExpectedOutput(savedAttributeExpectedOutput.content);
    } else {
      setAttributeExpectedOutput(defaultAttributeExpectedOutput);
    }

    // Load saved validation prompt (optional by default)
    const savedValidationPrompt = localStorageManager.getCurrentVersion('validation_prompt');
    if (savedValidationPrompt) {
      setValidationPrompt(savedValidationPrompt.content);
    } else {
      setValidationPrompt(""); // Empty by default - validation works automatically
    }

    // Load saved AI parameters
    const savedParameters = localStorageManager.getCurrentVersion('ai_parameters');
    if (savedParameters && savedParameters.content) {
      const params = savedParameters.content;
      setAiModel(params.aiModel || "gpt-5-mini");
      setTemperature(params.temperature || 0.7);
      setMaxTokens(params.maxTokens || 4000);
      setConfidence(params.confidence || 0.8);
    }
  }, [optimizedCompany, defaultOrchestrationPrompt, defaultQuestionInstructions, defaultQuestionExpectedOutput, defaultAttributeInstructions, defaultAttributeExpectedOutput, defaultValidationPrompt, originalContext]);

  // Save edited context
  const handleSaveContext = () => {
    localStorageManager.saveVersion({
      type: 'input_context',
      name: 'Current Input Context',
      content: editedContext
    });
  };

  // Reset context to original
  const handleResetContext = () => {
    setEditedContext(originalContext);
  };

  // Reset orchestrator prompt to default
  const handleResetOrchestratorPrompt = () => {
    setOrchestratorPrompt(defaultOrchestrationPrompt);
  };

  // Reset question instructions to default
  const handleResetQuestionInstructions = () => {
    setQuestionInstructions(defaultQuestionInstructions);
  };

  // Reset question expected output to default
  const handleResetQuestionExpectedOutput = () => {
    setQuestionExpectedOutput(defaultQuestionExpectedOutput);
  };

  // Reset attribute instructions to default
  const handleResetAttributeInstructions = () => {
    setAttributeInstructions(defaultAttributeInstructions);
  };

  // Reset attribute expected output to default
  const handleResetAttributeExpectedOutput = () => {
    setAttributeExpectedOutput(defaultAttributeExpectedOutput);
  };

  // Reset validation prompt to default
  // const handleResetValidationPrompt = () => {
  //   setValidationPrompt(defaultValidationPrompt);
  // };

  // Copy orchestrator prompt to clipboard
  const handleCopyOrchestratorPrompt = async () => {
    try {
      await navigator.clipboard.writeText(orchestratorPrompt);
      console.log('📋 Orchestrator prompt copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = orchestratorPrompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Copy question instructions to clipboard
  const handleCopyQuestionInstructions = async () => {
    try {
      await navigator.clipboard.writeText(questionInstructions);
      console.log('📋 Question instructions copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      const textArea = document.createElement('textarea');
      textArea.value = questionInstructions;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Copy question expected output to clipboard
  const handleCopyQuestionExpectedOutput = async () => {
    try {
      await navigator.clipboard.writeText(questionExpectedOutput);
      console.log('📋 Question expected output copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      const textArea = document.createElement('textarea');
      textArea.value = questionExpectedOutput;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Copy attribute instructions to clipboard
  const handleCopyAttributeInstructions = async () => {
    try {
      await navigator.clipboard.writeText(attributeInstructions);
      console.log('📋 Attribute instructions copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      const textArea = document.createElement('textarea');
      textArea.value = attributeInstructions;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Copy attribute expected output to clipboard
  const handleCopyAttributeExpectedOutput = async () => {
    try {
      await navigator.clipboard.writeText(attributeExpectedOutput);
      console.log('📋 Attribute expected output copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      const textArea = document.createElement('textarea');
      textArea.value = attributeExpectedOutput;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Copy validation prompt to clipboard
  const handleCopyValidationPrompt = async () => {
    try {
      await navigator.clipboard.writeText(validationPrompt);
      console.log('📋 Validation prompt copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      const textArea = document.createElement('textarea');
      textArea.value = validationPrompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Save orchestrator prompt
  const handleSavePrompt = () => {
    localStorageManager.saveVersion({
      type: 'orchestrator_prompt',
      name: 'Current Orchestrator Prompt',
      content: orchestratorPrompt
    });
  };

  // Generate orchestration
  const handleGenerateOrchestration = async () => {
    if (!orchestratorPrompt.trim()) return;

    try {
      let contextData;
      try {
        contextData = editedContext ? JSON.parse(editedContext) : optimizedCompany.optimized_company;
        console.log('🔍 Context data loaded:', {
          hasContext: !!contextData,
          contextKeys: contextData ? Object.keys(contextData) : [],
          usingEdited: !!editedContext,
          editedContextLength: editedContext?.length || 0
        });
      } catch (jsonError) {
        console.error('❌ Failed to parse edited context:', jsonError);
        // Use original context as fallback
        contextData = optimizedCompany.optimized_company;
        console.log('🔄 Using fallback context');
      }

      const requestData = {
        context: contextData,
        prompt: orchestratorPrompt,
        questionInstructions,
        questionExpectedOutput,
        attributeInstructions,
        attributeExpectedOutput,
        model: aiModel,
        temperature,
        maxTokens
      };

      console.log('📤 Sending orchestration request:', {
        url: '/api/test-oa/orchestrate',
        model: aiModel,
        temperature,
        maxTokens,
        promptLength: orchestratorPrompt.length,
        hasQuestionInstructions: !!questionInstructions,
        hasAttributeInstructions: !!attributeInstructions,
        contextSize: JSON.stringify(contextData).length
      });

      await orchestrationStream.startStream('/api/test-oa/orchestrate', {
        method: 'POST',
        body: requestData
      });
    } catch (error) {
      console.error('❌ Failed to start orchestration:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  };

  // Save question instructions
  const handleSaveQuestionInstructions = () => {
    localStorageManager.saveVersion({
      type: 'question_instructions',
      name: 'Current Question Instructions',
      content: questionInstructions
    });
  };

  // Save question expected output
  const handleSaveQuestionExpectedOutput = () => {
    localStorageManager.saveVersion({
      type: 'question_expected_output',
      name: 'Current Question Expected Output',
      content: questionExpectedOutput
    });
  };

  // Save attribute instructions
  const handleSaveAttributeInstructions = () => {
    localStorageManager.saveVersion({
      type: 'attribute_instructions',
      name: 'Current Attribute Instructions',
      content: attributeInstructions
    });
  };

  // Save attribute expected output
  const handleSaveAttributeExpectedOutput = () => {
    localStorageManager.saveVersion({
      type: 'attribute_expected_output',
      name: 'Current Attribute Expected Output',
      content: attributeExpectedOutput
    });
  };

  // Save validation prompt
  const handleSaveValidationPrompt = () => {
    localStorageManager.saveVersion({
      type: 'validation_prompt',
      name: 'Current Validation Prompt',
      content: validationPrompt
    });
  };

  // Generate demo output
  const handleGenerateDemo = async () => {
    if (!questionInstructions.trim() && !attributeInstructions.trim()) return;

    try {
      const contextData = editedContext ? JSON.parse(editedContext) : optimizedCompany.optimized_company;

      const demoPrompt = `Generate example interview questions and candidate attributes based on the company context and provided instructions.

Question Instructions:
${questionInstructions || "Not provided"}

Attribute Instructions:
${attributeInstructions || "Not provided"}

Please provide realistic examples of interview questions and evaluation criteria that would be generated for this company.`;

      await demoStream.startStream('/api/test-oa/generate', {
        method: 'POST',
        body: {
          prompt: demoPrompt,
          context: contextData,
          questionInstructions,
          questionExpectedOutput,
          attributeInstructions,
          attributeExpectedOutput,
          instructions: `Generate sample interview questions and attributes based on the provided company context and instructions. Show concrete examples of what would be generated.`,
          type: 'custom',
          model: aiModel,
          temperature,
          maxTokens
        }
      });
    } catch (error) {
      console.error('Failed to start demo generation:', error);
    }
  };

  // AI Validation
  const handleGenerateValidation = async () => {
    if (!validationPrompt.trim()) return;

    try {
      const contextData = editedContext ? JSON.parse(editedContext) : optimizedCompany.optimized_company;

      await validationStream.startStream('/api/test-oa/validate', {
        method: 'POST',
        body: {
          context: contextData,
          orchestrationResponse: orchestrationStream.content,
          questionInstructions,
          questionExpectedOutput,
          attributeInstructions,
          attributeExpectedOutput,
          validationPrompt,
          model: aiModel,
          temperature,
          maxTokens
        }
      });
    } catch (error) {
      console.error('Failed to start validation:', error);
    }
  };

  return (
    <div className="h-full">
      <Card>

        <CardContent  >
          {/* AI Workflow Overview */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-center">🤖 AI Interview System Workflow</h3>
            <div className="flex items-center justify-between text-xs space-x-2">
              <div className="text-center flex-1">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mx-auto mb-1">1</div>
                <div className="font-medium text-blue-700">Context</div>
                <div className="text-gray-600">Company Data</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mx-auto mb-1">2</div>
                <div className="font-medium text-purple-700">Orchestrator</div>
                <div className="text-gray-600">System Plan</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mx-auto mb-1">3</div>
                <div className="font-medium text-green-700">Instructions</div>
                <div className="text-gray-600">Templates</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-center flex-1">
                <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mx-auto mb-1">4</div>
                <div className="font-medium text-red-700">Validation</div>
                <div className="text-gray-600">Final Check</div>
              </div>
            </div>
            <div className="text-xs text-center text-gray-500 mt-3">
              Each step builds on the previous. Data flows from left → right. Configure Parameters (⚙️) anytime to adjust AI behavior.
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="parameters" className="flex items-center justify-center w-fit">
                <Sliders className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="context" className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                Context
              </TabsTrigger>
              <TabsTrigger value="orchestrator" className="flex items-center gap-2">
                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                Orchestrator
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                Instructions
              </TabsTrigger>
              <TabsTrigger value="validation" className="flex items-center gap-2">
                <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                Validation
              </TabsTrigger>
            </TabsList>


            <TabsContent value="context" className="mt-0">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                    Company Context - AI Input Data
                  </h3>
                  <p className="text-sm text-blue-700">
                    This is the foundation data that ALL AI steps will use. Edit the company information, tech stack, team structure, and hiring needs.
                    <strong>Every AI step below uses this context as input.</strong>
                  </p>
                  <div className="text-xs text-blue-600 mt-2 bg-white rounded p-2">
                    <strong>📤 Used by:</strong> Orchestrator → Instructions → Validation
                  </div>
                </div>


                <JsonEditor
                  value={editedContext}
                  onChange={setEditedContext}
                  onReset={handleResetContext}
                  onSave={handleSaveContext}
                  title="Company Context Data"
                  height="400px"
                  showValidation={true}
                  description="Edit your company's information, technology stack, team structure, and hiring requirements. This data feeds into all AI generation steps."
                />
              </div>
            </TabsContent>

            <TabsContent value="orchestrator" className="mt-0 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                  AI Orchestrator - System Planning
                </h3>
                <p className="text-sm text-purple-700">
                  The orchestrator analyzes your company context and creates a comprehensive interview system plan.
                  <strong>This is the master blueprint that guides all AI generation.</strong>
                </p>
                <div className="text-xs text-purple-600 mt-2 bg-white rounded p-2">
                  <strong>📥 Input:</strong> Company Context + Your Instructions<br />
                  <strong>📤 Output:</strong> Interview System Blueprint (used by Instructions & Validation)
                </div>
              </div>
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base">AI Orchestrator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">


                    {/* Prompt Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Orchestration Prompt</label>
                      <textarea
                        value={orchestratorPrompt}
                        onChange={(e) => setOrchestratorPrompt(e.target.value)}
                        className="w-full h-32 p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your orchestration prompt here..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateOrchestration}
                        disabled={!orchestratorPrompt.trim() || orchestrationStream.isStreaming}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {orchestrationStream.isStreaming ? 'Generating...' : 'Generate Orchestration'}
                      </button>
                      <button
                        onClick={handleCopyOrchestratorPrompt}
                        disabled={!orchestratorPrompt.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy prompt to clipboard"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={handleSavePrompt}
                        disabled={!orchestratorPrompt.trim()}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Prompt
                      </button>
                      <button
                        onClick={handleResetOrchestratorPrompt}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                        title="Reset to default orchestration instructions"
                      >
                        🔄 Reset
                      </button>
                      <button
                        onClick={() => setIsOrchestratorFullscreen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                        title="Open in fullscreen editor"
                      >
                        <Maximize2 className="h-4 w-4 mr-1" />
                        Fullscreen
                      </button>
                      {orchestrationStream.isStreaming && (
                        <button
                          onClick={() => orchestrationStream.stopStream()}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Stop
                        </button>
                      )}
                    </div>

                    {/* Response Display */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Generated Response</label>
                        {orchestrationStream.content && !orchestrationStream.isStreaming && (
                          <button
                            onClick={() => orchestrationStream.stopStream()}
                            className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
                        {orchestrationStream.isStreaming && (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                              <span className="text-sm text-gray-600">Generating orchestration...</span>
                              {orchestrationStream.progress && (
                                <span className="text-xs text-gray-500">({orchestrationStream.progress.toFixed(0)}%)</span>
                              )}
                            </div>
                          </div>
                        )}
                        {orchestrationStream.error && (
                          <div className="text-red-600 text-sm p-2 bg-red-50 rounded border border-red-200">
                            Error: {orchestrationStream.error}
                          </div>
                        )}
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {orchestrationStream.content || 'Response will appear here after generation...'}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="mt-0">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                  AI Instructions - Generation Templates
                </h3>
                <p className="text-sm text-green-700">
                  Define how questions and evaluation attributes should be generated for your interview system.
                  <strong>These templates guide the AI to create consistent, role-specific content.</strong>
                </p>
                <div className="text-xs text-green-600 mt-2 bg-white rounded p-2">
                  <strong>📥 Input:</strong> Company Context + Orchestration Blueprint<br />
                  <strong>📤 Output:</strong> Question Templates & Evaluation Criteria (demo generation)
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Question Generation Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        Configure how AI should generate interview questions based on your company context and orchestration plan.
                      </div>

                      {/* Question Instructions Editor */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Question Instructions</label>
                        <textarea
                          value={questionInstructions}
                          onChange={(e) => setQuestionInstructions(e.target.value)}
                          className="w-full h-32 p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter instructions for question generation..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyQuestionInstructions}
                          disabled={!questionInstructions.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Copy question instructions to clipboard"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={handleSaveQuestionInstructions}
                          disabled={!questionInstructions.trim()}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Question Instructions
                        </button>
                        <button
                          onClick={handleResetQuestionInstructions}
                          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                          title="Reset to default question instructions"
                        >
                          🔄 Reset
                        </button>
                        <button
                          onClick={() => setIsQuestionInstructionsFullscreen(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                          title="Open in fullscreen editor"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          Fullscreen
                        </button>
                      </div>

                      {/* Question Expected Output Editor */}
                      <div className="space-y-2 pt-4 border-t">
                        <label className="text-sm font-medium text-green-700">Expected Output Format</label>
                        <div className="text-xs text-gray-600 mb-2">
                          Define the structure and format you expect AI to generate for questions
                        </div>
                        <textarea
                          value={questionExpectedOutput}
                          onChange={(e) => setQuestionExpectedOutput(e.target.value)}
                          className="w-full h-48 p-3 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                          placeholder="Define the expected output format for generated questions..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyQuestionExpectedOutput}
                          disabled={!questionExpectedOutput.trim()}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Copy question expected output to clipboard"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={handleSaveQuestionExpectedOutput}
                          disabled={!questionExpectedOutput.trim()}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Expected Output
                        </button>
                        <button
                          onClick={handleResetQuestionExpectedOutput}
                          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                          title="Reset to default expected output format"
                        >
                          🔄 Reset
                        </button>
                        <button
                          onClick={() => setIsQuestionExpectedOutputFullscreen(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                          title="Open in fullscreen editor"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          Fullscreen
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Attribute Generation Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        Configure instructions for generating candidate attributes and evaluation criteria.
                      </div>

                      {/* Attribute Instructions Editor */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Attribute Instructions</label>
                        <textarea
                          value={attributeInstructions}
                          onChange={(e) => setAttributeInstructions(e.target.value)}
                          className="w-full h-32 p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter instructions for attribute generation..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyAttributeInstructions}
                          disabled={!attributeInstructions.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Copy attribute instructions to clipboard"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={handleSaveAttributeInstructions}
                          disabled={!attributeInstructions.trim()}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Attribute Instructions
                        </button>
                        <button
                          onClick={handleResetAttributeInstructions}
                          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                          title="Reset to default attribute instructions"
                        >
                          🔄 Reset
                        </button>
                        <button
                          onClick={() => setIsAttributeInstructionsFullscreen(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                          title="Open in fullscreen editor"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          Fullscreen
                        </button>
                      </div>

                      {/* Attribute Expected Output Editor */}
                      <div className="space-y-2 pt-4 border-t">
                        <label className="text-sm font-medium text-purple-700">Expected Output Format</label>
                        <div className="text-xs text-gray-600 mb-2">
                          Define the structure and format you expect AI to generate for evaluation attributes
                        </div>
                        <textarea
                          value={attributeExpectedOutput}
                          onChange={(e) => setAttributeExpectedOutput(e.target.value)}
                          className="w-full h-48 p-3 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
                          placeholder="Define the expected output format for generated attributes..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyAttributeExpectedOutput}
                          disabled={!attributeExpectedOutput.trim()}
                          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Copy attribute expected output to clipboard"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={handleSaveAttributeExpectedOutput}
                          disabled={!attributeExpectedOutput.trim()}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Expected Output
                        </button>
                        <button
                          onClick={handleResetAttributeExpectedOutput}
                          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                          title="Reset to default expected output format"
                        >
                          🔄 Reset
                        </button>
                        <button
                          onClick={() => setIsAttributeExpectedOutputFullscreen(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                          title="Open in fullscreen editor"
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          Fullscreen
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">Demo Output & Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Version History for Input Context */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Input Context Versions</label>
                        <div className="border rounded-lg p-3 bg-gray-50">
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {localStorageManager.getVersions('input_context').length === 0 ? (
                              <div className="text-xs text-gray-500 p-2">No saved versions</div>
                            ) : (
                              localStorageManager.getVersions('input_context').map((version) => (
                                <div key={version.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div>
                                    <div className="text-sm font-medium">
                                      {version.id === localStorageManager.getCurrentVersion('input_context')?.id ? 'Current Version' : `Version ${version.id.slice(0, 8)}`}
                                    </div>
                                    <div className="text-xs text-gray-500">{localStorageManager.formatTimestamp(version.timestamp)}</div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        const loadedVersion = localStorageManager.loadVersion('input_context', version.id);
                                        if (loadedVersion) setEditedContext(loadedVersion.content);
                                      }}
                                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                      Load
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Demo Output */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Demo Output</label>
                          {demoStream.content && !demoStream.isStreaming && (
                            <button
                              onClick={() => demoStream.stopStream()}
                              className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="border rounded-lg p-4 bg-gray-50 min-h-[150px] max-h-[300px] overflow-y-auto">
                          {demoStream.isStreaming && (
                            <div className="flex items-center justify-center py-4">
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                <span className="text-sm text-gray-600">Generating demo...</span>
                                {demoStream.progress && (
                                  <span className="text-xs text-gray-500">({demoStream.progress.toFixed(0)}%)</span>
                                )}
                              </div>
                            </div>
                          )}
                          {demoStream.error && (
                            <div className="text-red-600 text-sm p-2 bg-red-50 rounded border border-red-200 mb-2">
                              Error: {demoStream.error}
                            </div>
                          )}
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {demoStream.content || 'Demo output will appear here after generation...'}
                          </pre>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleGenerateDemo}
                          disabled={(!questionInstructions.trim() && !attributeInstructions.trim()) || demoStream.isStreaming}
                          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {demoStream.isStreaming ? 'Generating...' : 'Generate Demo'}
                        </button>
                        {demoStream.isStreaming && (
                          <button
                            onClick={() => demoStream.stopStream()}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Stop
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="mt-0">
              <div className="space-y-4">
                <Card className="border">
                  <CardHeader>
                    <CardTitle className="text-base">AI Generation Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-sm text-gray-600">
                        Configure AI model parameters that will apply to all generation tasks (orchestration, demo, and validation).
                        These settings control the behavior and creativity of AI responses.
                      </div>

                      {/* Model Selection */}
                      <div className="space-y-4">
                        <label className="text-sm font-medium">AI Model</label>

                        {/* Recommended Models */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Recommended for Coordination</div>
                          <div className="grid grid-cols-1 gap-2">
                            {COORDINATION_MODEL_RECOMMENDATIONS.slice(0, 4).map(rec => (
                              <button
                                key={rec.value}
                                onClick={() => setAiModel(rec.value)}
                                className={`p-3 text-left border rounded-lg transition-colors ${aiModel === rec.value
                                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">{rec.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{rec.label}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${rec.category === 'premium' ? 'bg-purple-100 text-purple-700' :
                                        rec.category === 'standard' ? 'bg-green-100 text-green-700' :
                                          rec.category === 'research' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {rec.category}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">{rec.description}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Full Model List */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">All Available Models</div>
                          <select
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a model...</option>

                            {/* Frontier Models */}
                            <optgroup label="🚀 Frontier Models (Most Advanced)">
                              {AI_MODEL_OPTIONS
                                .filter(option => option.group === 'Frontier')
                                .map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                            </optgroup>

                            {/* Research Models */}
                            <optgroup label="🔬 Research Models">
                              {AI_MODEL_OPTIONS
                                .filter(option => option.group === 'Research')
                                .map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                            </optgroup>

                            {/* Legacy Models */}
                            <optgroup label="📚 Legacy Models (Still Available)">
                              {AI_MODEL_OPTIONS
                                .filter(option => option.group === 'Legacy')
                                .map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                        </div>

                        <div className="text-xs text-gray-500">
                          {aiModel ? (
                            <div className="space-y-1">
                              <div><strong>Category:</strong> {getModelCategory(aiModel)}</div>
                              <div><strong>Group:</strong> {getModelGroup(aiModel)}</div>
                              <div><strong>Description:</strong> {getModelDescription(aiModel)}</div>
                            </div>
                          ) : (
                            'Select an AI model to use for generation tasks.'
                          )}
                        </div>
                      </div>

                      {/* Temperature */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Temperature: {temperature}</label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0.0 (Focused)</span>
                          <span>1.0 (Balanced)</span>
                          <span>2.0 (Creative)</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Controls randomness: Lower values make output more deterministic and focused, higher values make it more creative and varied.
                        </div>
                      </div>

                      {/* Max Tokens */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Tokens: {maxTokens}</label>
                        <input
                          type="range"
                          min="500"
                          max="4000"
                          step="100"
                          value={maxTokens}
                          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>500</span>
                          <span>2000</span>
                          <span>4000</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Maximum length of AI response: Higher values allow longer responses but take more time and cost more.
                        </div>
                      </div>

                      {/* Confidence */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Confidence Threshold: {confidence}</label>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.1"
                          value={confidence}
                          onChange={(e) => setConfidence(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0.1 (Inclusive)</span>
                          <span>0.8 (Balanced)</span>
                          <span>1.0 (Strict)</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Response filtering: Lower values include more possible responses, higher values are more selective and confident.
                        </div>
                      </div>

                      {/* Save/Reset Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        <button
                          onClick={() => {
                            localStorageManager.saveVersion({
                              type: 'ai_parameters',
                              name: 'Current AI Parameters',
                              content: { aiModel, temperature, maxTokens, confidence }
                            });
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Save Parameters
                        </button>
                        <button
                          onClick={() => {
                            setAiModel("gpt-5-mini");
                            setTemperature(0.7);
                            setMaxTokens(2000);
                            setConfidence(0.8);
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                        >
                          Reset to Defaults
                        </button>
                      </div>

                      {/* Current Settings Summary */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Current Settings Summary</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Model:</span>
                            <span className="text-right">
                              {aiModel ? `${getModelGroup(aiModel)}: ${getModelDescription(aiModel).substring(0, 50)}...` : 'Not selected'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Temperature:</span>
                            <span>{temperature}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Max Tokens:</span>
                            <span>{maxTokens}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Confidence:</span>
                            <span>{confidence}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="mt-0">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                  AI Validation - Final System Check
                </h3>
                <p className="text-sm text-red-700">
                  The AI validates all components of your interview system and provides a final readiness assessment.
                  <strong>This ensures your interview system is production-ready before deployment.</strong>
                </p>
                <div className="text-xs text-red-600 mt-2 bg-white rounded p-2">
                  <strong>📥 Input:</strong> Company Context + Orchestration Output + Instructions<br />
                  <strong>📤 Output:</strong> System Readiness Report + Go/No-Go Recommendation
                </div>
              </div>

              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-base">Final System Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      The AI will validate your entire interview system and generate a comprehensive final report with readiness scores and recommendations.
                      <strong className="text-green-600"> This works automatically with your existing data - no custom prompt required.</strong>
                    </div>

                    {/* Optional Validation Prompt */}
                    <details className="border border-gray-200 rounded-lg bg-gray-50">
                      <summary className="cursor-pointer p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Optional</span>
                              Custom Validation Criteria
                            </label>
                          </div>
                          <span className="text-xs text-gray-500">▼</span>
                        </div>
                      </summary>
                      <div className="p-3 pt-0">
                        <p className="text-xs text-gray-600 mb-2">
                          Add custom validation focus areas if needed. Validation works automatically without any custom criteria.
                        </p>
                        <textarea
                          value={validationPrompt}
                          onChange={(e) => setValidationPrompt(e.target.value)}
                          className="w-full h-20 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                          placeholder="e.g., 'Pay extra attention to cultural fit alignment', 'Focus on technical accuracy', 'Validate scalability concerns', etc..."
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => setValidationPrompt("")}
                            className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </details>

                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyValidationPrompt}
                        disabled={!validationPrompt.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy validation prompt to clipboard"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={handleSaveValidationPrompt}
                        disabled={!validationPrompt.trim()}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Validation Prompt
                      </button>
                      <button
                        onClick={handleGenerateValidation}
                        disabled={validationStream.isStreaming}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validationStream.isStreaming ? 'Validating System...' : '🔍 Run Validation'}
                      </button>
                      {validationStream.isStreaming && (
                        <button
                          onClick={() => validationStream.stopStream()}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Stop
                        </button>
                      )}
                    </div>

                    {/* Final Response Display */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Final AI Response</label>
                        {validationStream.content && !validationStream.isStreaming && (
                          <button
                            onClick={() => validationStream.stopStream()}
                            className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px] max-h-[500px] overflow-y-auto">
                        {validationStream.isStreaming && (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              <span className="text-sm text-gray-600">Validating and generating final response...</span>
                              {validationStream.progress && (
                                <span className="text-xs text-gray-500">({validationStream.progress.toFixed(0)}%)</span>
                              )}
                            </div>
                          </div>
                        )}
                        {validationStream.error && (
                          <div className="text-red-600 text-sm p-2 bg-red-50 rounded border border-red-200 mb-2">
                            Error: {validationStream.error}
                          </div>
                        )}
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {validationStream.content || 'Final AI response will appear here after validation...'}
                        </pre>
                      </div>
                    </div>

                    {/* Summary of All Inputs */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Input Summary</label>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="font-medium text-blue-700 mb-1">Context</div>
                          <div className="text-blue-600">
                            {editedContext ? `${editedContext.length} chars` : 'Not loaded'}
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded border border-purple-200">
                          <div className="font-medium text-purple-700 mb-1">Orchestrator</div>
                          <div className="text-purple-600">
                            {orchestrationStream.content ? `${orchestrationStream.content.length} chars` :
                              orchestratorPrompt ? `${orchestratorPrompt.length} chars (configured)` : 'Not configured'}
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded border border-green-200">
                          <div className="font-medium text-green-700 mb-1">Questions</div>
                          <div className="text-green-600">
                            {questionInstructions ? `${questionInstructions.length} chars` : 'Not configured'}
                          </div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded border border-orange-200">
                          <div className="font-medium text-orange-700 mb-1">Attributes</div>
                          <div className="text-orange-600">
                            {attributeInstructions ? `${attributeInstructions.length} chars` : 'Not configured'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Fullscreen Editors */}
      <FullscreenEditor
        isOpen={isOrchestratorFullscreen}
        onClose={() => setIsOrchestratorFullscreen(false)}
        value={orchestratorPrompt}
        onChange={setOrchestratorPrompt}
        title="Orchestration Prompt - Fullscreen Editor"
        placeholder="Enter your orchestration prompt here..."
        onSave={handleSavePrompt}
        onCopy={handleCopyOrchestratorPrompt}
        onReset={handleResetOrchestratorPrompt}
      />

      <FullscreenEditor
        isOpen={isQuestionInstructionsFullscreen}
        onClose={() => setIsQuestionInstructionsFullscreen(false)}
        value={questionInstructions}
        onChange={setQuestionInstructions}
        title="Question Generation Instructions - Fullscreen Editor"
        placeholder="Enter instructions for question generation..."
        onSave={handleSaveQuestionInstructions}
        onCopy={handleCopyQuestionInstructions}
        onReset={handleResetQuestionInstructions}
      />

      <FullscreenEditor
        isOpen={isQuestionExpectedOutputFullscreen}
        onClose={() => setIsQuestionExpectedOutputFullscreen(false)}
        value={questionExpectedOutput}
        onChange={setQuestionExpectedOutput}
        title="Question Expected Output Format - Fullscreen Editor"
        placeholder="Define the expected output format for generated questions..."
        onSave={handleSaveQuestionExpectedOutput}
        onCopy={handleCopyQuestionExpectedOutput}
        onReset={handleResetQuestionExpectedOutput}
      />

      <FullscreenEditor
        isOpen={isAttributeInstructionsFullscreen}
        onClose={() => setIsAttributeInstructionsFullscreen(false)}
        value={attributeInstructions}
        onChange={setAttributeInstructions}
        title="Attribute Generation Instructions - Fullscreen Editor"
        placeholder="Enter instructions for attribute generation..."
        onSave={handleSaveAttributeInstructions}
        onCopy={handleCopyAttributeInstructions}
        onReset={handleResetAttributeInstructions}
      />

      <FullscreenEditor
        isOpen={isAttributeExpectedOutputFullscreen}
        onClose={() => setIsAttributeExpectedOutputFullscreen(false)}
        value={attributeExpectedOutput}
        onChange={setAttributeExpectedOutput}
        title="Attribute Expected Output Format - Fullscreen Editor"
        placeholder="Define the expected output format for generated attributes..."
        onSave={handleSaveAttributeExpectedOutput}
        onCopy={handleCopyAttributeExpectedOutput}
        onReset={handleResetAttributeExpectedOutput}
      />
    </div>
  );
}