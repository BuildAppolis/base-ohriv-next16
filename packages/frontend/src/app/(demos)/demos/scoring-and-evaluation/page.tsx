'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAtom, useAtomValue } from 'jotai'
import { candidatesAtom } from '@/lib/atoms/candidate-atoms'
import { ksaScoresAtom, addKSAScoreAtom, SimpleKSAScore } from '@/lib/atoms/multistage-ksa-atoms'
import { Target, Plus, Save } from 'lucide-react'

export default function ScoringAndEvaluationPage() {
  const candidates = useAtomValue(candidatesAtom)
  const ksaScores = useAtomValue(ksaScoresAtom)
  const [, addScore] = useAtom(addKSAScoreAtom)

  const [selectedCandidate, setSelectedCandidate] = useState<string>('')
  const [jobTitle, setJobTitle] = useState<string>('')
  const [knowledge, setKnowledge] = useState<number>(5)
  const [skills, setSkills] = useState<number>(5)
  const [abilities, setAbilities] = useState<number>(5)

  const handleSaveScore = () => {
    if (!selectedCandidate || !jobTitle) return

    const overall = Math.round((knowledge + skills + abilities) / 3 * 10) / 10

    let recommendation: 'strong-recommend' | 'recommend' | 'consider' | 'reject'
    if (overall >= 8) recommendation = 'strong-recommend'
    else if (overall >= 6) recommendation = 'recommend'
    else if (overall >= 4) recommendation = 'consider'
    else recommendation = 'reject'

    const score: SimpleKSAScore = {
      id: `${selectedCandidate}-${jobTitle}-${Date.now()}`,
      candidateId: selectedCandidate,
      jobTitle,
      evaluationDate: new Date().toISOString(),
      knowledge,
      skills,
      abilities,
      overall,
      recommendation
    }

    addScore(score)

    // Reset form
    setSelectedCandidate('')
    setJobTitle('')
    setKnowledge(5)
    setSkills(5)
    setAbilities(5)
  }

  const candidateScores = selectedCandidate
    ? Object.values(ksaScores).filter(score => score.candidateId === selectedCandidate)
    : []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">KSA Scoring & Evaluation</h1>
          <p className="text-muted-foreground">Manually score candidates on Knowledge, Skills, and Abilities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add KSA Score
            </CardTitle>
            <CardDescription>
              Enter scores for a candidate&apos;s KSA evaluation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidate">Candidate</Label>
                <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(candidates).map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.firstName} {candidate.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="knowledge">Knowledge: {knowledge}/10</Label>
                <input
                  type="range"
                  id="knowledge"
                  min="1"
                  max="10"
                  value={knowledge}
                  onChange={(e) => setKnowledge(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills: {skills}/10</Label>
                <input
                  type="range"
                  id="skills"
                  min="1"
                  max="10"
                  value={skills}
                  onChange={(e) => setSkills(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <Label htmlFor="abilities">Abilities: {abilities}/10</Label>
                <input
                  type="range"
                  id="abilities"
                  min="1"
                  max="10"
                  value={abilities}
                  onChange={(e) => setAbilities(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveScore}
              disabled={!selectedCandidate || !jobTitle}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Score
            </Button>
          </CardContent>
        </Card>

        {/* Recent Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scores</CardTitle>
            <CardDescription>
              Latest KSA evaluations entered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.values(ksaScores)
                .sort((a, b) => new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime())
                .slice(0, 10)
                .map((score) => {
                  const candidate = candidates[score.candidateId]
                  return (
                    <div key={score.id} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          {candidate?.firstName} {candidate?.lastName}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          score.recommendation === 'strong-recommend' ? 'bg-green-100 text-green-800' :
                          score.recommendation === 'recommend' ? 'bg-blue-100 text-blue-800' :
                          score.recommendation === 'consider' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {score.recommendation.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {score.jobTitle} • {new Date(score.evaluationDate).toLocaleDateString()}
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{score.overall}/10</div>
                          <div className="text-muted-foreground">Overall</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{score.knowledge}/10</div>
                          <div className="text-muted-foreground">Knowledge</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{score.skills}/10</div>
                          <div className="text-muted-foreground">Skills</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{score.abilities}/10</div>
                          <div className="text-muted-foreground">Abilities</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              {Object.values(ksaScores).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No scores entered yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Candidate&apos;s Scores */}
      {selectedCandidate && candidateScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {candidates[selectedCandidate]?.firstName} {candidates[selectedCandidate]?.lastName}&apos;s Scores
            </CardTitle>
            <CardDescription>
              All KSA evaluations for this candidate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidateScores.map((score) => (
                <div key={score.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{score.jobTitle}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      score.recommendation === 'strong-recommend' ? 'bg-green-100 text-green-800' :
                      score.recommendation === 'recommend' ? 'bg-blue-100 text-blue-800' :
                      score.recommendation === 'consider' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {score.recommendation.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(score.evaluationDate).toLocaleDateString()}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{score.overall}/10</div>
                      <div className="text-muted-foreground">Overall</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{score.knowledge}/10</div>
                      <div className="text-muted-foreground">Knowledge</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{score.skills}/10</div>
                      <div className="text-muted-foreground">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{score.abilities}/10</div>
                      <div className="text-muted-foreground">Abilities</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}