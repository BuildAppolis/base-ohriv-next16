'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  candidatesAtom,
  filteredCandidatesAtom,
  candidateViewModeAtom,
  candidateFiltersAtom,
  sortByAtom,
  generationParamsAtom,
  isGeneratingCandidatesAtom,
  generationProgressAtom,
  selectedCandidateIdsAtom,
  currentCandidateIdAtom,
  upsertCandidateAtom,
  deleteCandidateAtom,
  resetFiltersAtom
} from '@/lib/atoms/candidate-atoms'
import { generateMultipleAIEnhancedCandidates, batchGenerateCandidatesWithProgress } from '@/lib/ai-candidate-generator'
import { CandidateGenerationParams } from '@/types/candidate'
import {
  Search,
  Plus,
  Filter,
  Grid3X3,
  List,
  Table,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Star,
  Settings,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  BrainCircuit,
  Users,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Candidate Card Component
 */
function CandidateCard({ candidate, onView, onEdit, onDelete }: {
  candidate: any
  onView: (candidate: any) => void
  onEdit: (candidate: any) => void
  onDelete: (candidateId: string) => void
}) {
  const [, setSelectedIds] = useAtom(selectedCandidateIdsAtom)
  const [selected, setSelected] = useState(false)

  const handleSelect = (checked: boolean) => {
    setSelected(checked)
    if (checked) {
      setSelectedIds(prev => [...prev, candidate.id])
    } else {
      setSelectedIds(prev => prev.filter(id => id !== candidate.id))
    }
  }

  const experienceLevel = candidate.metadata.tags.find(tag =>
    ['entry', 'junior', 'mid', 'senior', 'lead', 'principal'].includes(tag)
  ) || 'mid'

  return (
    <Card className={cn('relative hover:shadow-md transition-shadow', selected && 'ring-2 ring-blue-500')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelect}
            />
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidate.personalInfo.avatar} />
              <AvatarFallback>
                {candidate.personalInfo.firstName[0]}{candidate.personalInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {candidate.personalInfo.firstName} {candidate.personalInfo.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {candidate.experience.currentPosition.title}
              </p>
            </div>
          </div>
          <Badge variant="secondary">{experienceLevel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-32">{candidate.personalInfo.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{candidate.personalInfo.location.city}, {candidate.personalInfo.location.state}</span>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-1">
            {candidate.technicalSkills.programmingLanguages.slice(0, 3).map((lang: any, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {lang.language}
              </Badge>
            ))}
            {candidate.technicalSkills.frameworksAndTools.slice(0, 2).map((tool: any, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tool.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Interview Performance Preview */}
        <div>
          <h4 className="text-sm font-medium mb-2">Interview Scores</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {candidate.interviewPerformance.simulatedInterviewScores.behavioral.overall}
              </div>
              <div className="text-xs text-muted-foreground">Behavioral</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {candidate.interviewPerformance.simulatedInterviewScores.technical.overall}
              </div>
              <div className="text-xs text-muted-foreground">Technical</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {candidate.interviewPerformance.simulatedInterviewScores.cultural.companyFit}
              </div>
              <div className="text-xs text-muted-foreground">Cultural</div>
            </div>
          </div>
        </div>

        {/* Personality Traits Preview */}
        <div>
          <h4 className="text-sm font-medium mb-2">Personality</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Innovation</span>
              <span>{candidate.personality.openness}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Team Player</span>
              <span>{candidate.personality.agreeableness}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Leadership</span>
              <span>{candidate.personality.extraversion}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => onView(candidate)}>
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(candidate)}>
            <Settings className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(candidate.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Candidate Generation Dialog
 */
function CandidateGenerationDialog({ open, onOpenChange }: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [generationParams, setGenerationParams] = useAtom(generationParamsAtom)
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingCandidatesAtom)
  const [generationProgress, setGenerationProgress] = useAtom(generationProgressAtom)
  const [upsertCandidate] = useAtom(upsertCandidateAtom)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress({
      stage: 'preparing',
      progress: 0,
      message: 'Preparing candidate generation...'
    })

    try {
      const candidates = await batchGenerateCandidatesWithProgress(
        generationParams,
        (progress, current, total, message) => {
          setGenerationProgress({
            stage: progress === 100 ? 'completed' : 'generating',
            progress,
            current,
            total,
            message
          })
        }
      )

      // Store candidates
      candidates.forEach(candidate => {
        upsertCandidate(candidate)
      })

      setGenerationProgress({
        stage: 'completed',
        progress: 100,
        message: `Successfully generated ${candidates.length} candidates`
      })

      setTimeout(() => {
        setIsGenerating(false)
        onOpenChange(false)
      }, 2000)

    } catch (error) {
      console.error('Candidate generation failed:', error)
      setGenerationProgress({
        stage: 'error',
        progress: 0,
        message: 'Generation failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate AI Candidates
          </DialogTitle>
          <DialogDescription>
            Create realistic candidates with AI-enhanced personalities and backgrounds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isGenerating ? (
            <div className="space-y-4">
              <div className="text-center">
                <BrainCircuit className="h-12 w-12 mx-auto text-blue-500 animate-pulse" />
                <h3 className="text-lg font-semibold mt-2">
                  {generationProgress.stage === 'completed' ? 'Generation Complete!' : 'Generating Candidates...'}
                </h3>
                <p className="text-muted-foreground">
                  {generationProgress.message}
                </p>
              </div>

              <Progress value={generationProgress.progress} className="w-full" />

              {generationProgress.current && generationProgress.total && (
                <div className="text-center text-sm text-muted-foreground">
                  {generationProgress.current} of {generationProgress.total} candidates generated
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Basic Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Experience Level</label>
                  <Select
                    value={generationParams.experienceLevel}
                    onValueChange={(value: any) =>
                      setGenerationParams(prev => ({ ...prev, experienceLevel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Number of Candidates</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={generationParams.count || 1}
                    onChange={(e) =>
                      setGenerationParams(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>

              {/* Role and Industry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Role</label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={generationParams.targetRole || ''}
                    onChange={(e) =>
                      setGenerationParams(prev => ({ ...prev, targetRole: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Industry Background</label>
                  <Input
                    placeholder="e.g., Technology, Finance"
                    value={generationParams.industryBackground || ''}
                    onChange={(e) =>
                      setGenerationParams(prev => ({ ...prev, industryBackground: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Personality Archetype */}
              <div>
                <label className="text-sm font-medium">Personality Archetype</label>
                <Select
                  value={generationParams.personalityArchetype}
                  onValueChange={(value: any) =>
                    setGenerationParams(prev => ({ ...prev, personalityArchetype: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced Professional</SelectItem>
                    <SelectItem value="innovator">Innovation Leader</SelectItem>
                    <SelectItem value="specialist">Technical Expert</SelectItem>
                    <SelectItem value="leader">Natural Leader</SelectItem>
                    <SelectItem value="collaborator">Team Collaborator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Technical Focus */}
              <div>
                <label className="text-sm font-medium">Technical Focus (Optional)</label>
                <Textarea
                  placeholder="e.g., frontend, backend, devops, ai/ml"
                  value={generationParams.technicalFocus?.join(', ') || ''}
                  onChange={(e) =>
                    setGenerationParams(prev => ({
                      ...prev,
                      technicalFocus: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))
                  }
                />
              </div>

              {/* Location Preference */}
              <div>
                <label className="text-sm font-medium">Location Preference (Optional)</label>
                <Input
                  placeholder="e.g., San Francisco, CA"
                  value={generationParams.locationPreference || ''}
                  onChange={(e) =>
                    setGenerationParams(prev => ({ ...prev, locationPreference: e.target.value }))
                  }
                />
              </div>

              {/* Custom Requirements */}
              <div>
                <label className="text-sm font-medium">Custom Requirements (Optional)</label>
                <Textarea
                  placeholder="Any specific requirements or characteristics for the candidates"
                  value={generationParams.customRequirements?.join(', ') || ''}
                  onChange={(e) =>
                    setGenerationParams(prev => ({
                      ...prev,
                      customRequirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={!generationParams.experienceLevel}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Candidates
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Main Candidates Page
 */
export default function CandidatesPage() {
  const candidates = useAtomValue(filteredCandidatesAtom)
  const viewMode = useAtomValue(candidateViewModeAtom)
  const filters = useAtomValue(candidateFiltersAtom)
  const sortBy = useAtomValue(sortByAtom)
  const setViewMode = useSetAtom(candidateViewModeAtom)
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm)
  const [showGenerationDialog, setShowGenerationDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [showCandidateDetails, setShowCandidateDetails] = useState(false)
  const [, setCurrentCandidateId] = useAtom(currentCandidateIdAtom)
  const [deleteCandidate] = useAtom(deleteCandidateAtom)
  const [resetFilters] = useAtom(resetFiltersAtom)

  // Update search term with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // This would update the atom in a real implementation
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate)
    setCurrentCandidateId(candidate.id)
    setShowCandidateDetails(true)
  }

  const handleEditCandidate = (candidate: any) => {
    setSelectedCandidate(candidate)
    setCurrentCandidateId(candidate.id)
    // Open edit dialog
  }

  const handleDeleteCandidate = (candidateId: string) => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate(candidateId)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">
            Manage and evaluate candidates with AI-powered personality insights
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={showGenerationDialog} onOpenChange={setShowGenerationDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Candidates
              </Button>
            </DialogTrigger>
            <CandidateGenerationDialog
              open={showGenerationDialog}
              onOpenChange={setShowGenerationDialog}
            />
          </Dialog>

          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.metadata.source === 'ai-generated' || c.metadata.source === 'ai-enhanced').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Interview Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.length > 0
                ? Math.round(
                    candidates.reduce((sum, c) =>
                      sum + (c.interviewPerformance.simulatedInterviewScores.behavioral.overall +
                             c.interviewPerformance.simulatedInterviewScores.technical.overall +
                             c.interviewPerformance.simulatedInterviewScores.cultural.companyFit) / 3, 0
                    ) / candidates.length
                  )
                : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* This would come from selectedCandidateIdsAtom */}
              0
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>

            {/* Reset Filters */}
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Display */}
      {candidates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by generating some AI-powered candidates
            </p>
            <Button onClick={() => setShowGenerationDialog(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Candidates
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
          viewMode === 'list' && 'space-y-4',
          viewMode === 'table' && 'space-y-4'
        )}>
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onView={handleViewCandidate}
              onEdit={handleEditCandidate}
              onDelete={handleDeleteCandidate}
            />
          ))}
        </div>
      )}

      {/* Candidate Details Dialog */}
      <Dialog open={showCandidateDetails} onOpenChange={setShowCandidateDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCandidate?.personalInfo?.firstName} {selectedCandidate?.personalInfo?.lastName}
            </DialogTitle>
            <DialogDescription>
              Detailed candidate profile and evaluation insights
            </DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedCandidate.personalInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{selectedCandidate.personalInfo.location.city}, {selectedCandidate.personalInfo.location.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedCandidate.personalInfo.phone || 'Not provided'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Position</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span>{selectedCandidate.experience.currentPosition.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span>{selectedCandidate.experience.currentPosition.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry:</span>
                      <span>{selectedCandidate.experience.currentPosition.industry}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Personality Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personality Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Openness to Experience</span>
                          <span className="text-sm">{selectedCandidate.personality.openness}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${selectedCandidate.personality.openness}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Conscientiousness</span>
                          <span className="text-sm">{selectedCandidate.personality.conscientiousness}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${selectedCandidate.personality.conscientiousness}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Extraversion</span>
                          <span className="text-sm">{selectedCandidate.personality.extraversion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{ width: `${selectedCandidate.personality.extraversion}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Agreeableness</span>
                          <span className="text-sm">{selectedCandidate.personality.agreeableness}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${selectedCandidate.personality.agreeableness}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Neuroticism</span>
                          <span className="text-sm">{selectedCandidate.personality.neuroticism}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${selectedCandidate.personality.neuroticism}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interview Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Performance Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-3">Behavioral</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Overall</span>
                          <span className="font-semibold">{selectedCandidate.interviewPerformance.simulatedInterviewScores.behavioral.overall}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Communication</span>
                          <span>{selectedCandidate.interviewPerformance.simulatedInterviewScores.behavioral.communication}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Problem Solving</span>
                          <span>{selectedCandidate.interviewPerformance.simulatedInterviewScores.behavioral.problemSolving}/10</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3">Technical</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Overall</span>
                          <span className="font-semibold">{selectedCandidate.interviewPerformance.simulatedInterviewScores.technical.overall}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Coding</span>
                          <span>{selectedCandidate.interviewPerformance.simulatedInterviewScores.technical.coding}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">System Design</span>
                          <span>{selectedCandidate.interviewPerformance.simulatedInterviewScores.technical.systemDesign}/10</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-600 mb-3">Cultural</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Company Fit</span>
                          <span className="font-semibold">{selectedCandidate.interviewPerformance.simulatedInterviewScores.cultural.companyFit}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Values Alignment</span>
                          <span>{selectedCandidate.interviewPerformance.simulatedInterviewScores.cultural.valuesAlignment}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Collaboration</span>
                          <span>{selectedCandidate.interviewPerformance.simulatedInterviewScores.cultural.collaboration}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Key Strengths</h4>
                      <ul className="text-sm space-y-1">
                        {selectedCandidate.interviewPerformance.keyStrengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <Star className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Potential Concerns</h4>
                      <ul className="text-sm space-y-1">
                        {selectedCandidate.interviewPerformance.potentialRedFlags.map((flag: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <AlertCircle className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}