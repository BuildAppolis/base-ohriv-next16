'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  filteredCandidatesAtom,
  candidateViewModeAtom,
  selectedCandidateIdsAtom,
  currentCandidateIdAtom,
  resetFiltersAtom
} from '@/lib/atoms/candidate-atoms'
import { SimpleCandidate } from '@/lib/candidate-data'
import { CandidateScorecard } from './_components/candidate-scorecard'
import { User } from 'lucide-react'


/**
 * Candidate Card Component
 */
function CandidateCard({ candidate, isSelected, onView }: {
  candidate: SimpleCandidate
  isSelected: boolean
  onSelect: (id: string) => void
  onView: (id: string) => void
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
      onClick={() => onView(candidate.id)}
    >
      <CardContent className="">
        <div className="flex flex-col gap-4 h-full justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {candidate.firstName} {candidate.lastName}
              </CardTitle>
              <CardDescription>
                Age {candidate.age} • ID: {candidate.id.split('-')[1]}
              </CardDescription>
            </div>

          </div>
          <Badge
            variant={isSelected ? "primary" : "secondary"}
            className="text-xs"
          >
            {isSelected ? 'Selected' : 'Available'}
          </Badge>
        </div>


      </CardContent>
    </Card>
  )
}

/**
 * Candidate List View Component
 */
function CandidateListView({ candidates, selectedIds, onView }: {
  candidates: SimpleCandidate[]
  selectedIds: string[]
  onSelect: (id: string) => void
  onView: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${selectedIds.includes(candidate.id) ? 'bg-blue-50 border-blue-200' : ''
            }`}
          onClick={() => onView(candidate.id)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {candidate.firstName} {candidate.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                Age {candidate.age} • ID: {candidate.id.split('-')[1]}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={selectedIds.includes(candidate.id) ? "primary" : "secondary"} className="text-xs">
              {selectedIds.includes(candidate.id) ? 'Selected' : 'Available'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Main Candidates Page
 */
export default function CandidatesPage() {
  const filteredCandidates = useAtomValue(filteredCandidatesAtom)
  const [viewMode,] = useAtom(candidateViewModeAtom)
  const [selectedIds, setSelectedIds] = useAtom(selectedCandidateIdsAtom)
  const [, setCurrentId] = useAtom(currentCandidateIdAtom)
  const resetFilters = useSetAtom(resetFiltersAtom)
  const [showScorecard, setShowScorecard] = useState(false)

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedIds(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const handleViewCandidate = (candidateId: string) => {
    setCurrentId(candidateId)
    setShowScorecard(true)
  }


  const handleResetFilters = () => {
    resetFilters()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">
            Fixed pool of 10 candidates for evaluation
          </p>
        </div>

      </div>


      {/* Candidates Display */}
      <div>
        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedIds.includes(candidate.id)}
                onSelect={handleSelectCandidate}
                onView={handleViewCandidate}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <CandidateListView
                candidates={filteredCandidates}
                selectedIds={selectedIds}
                onSelect={handleSelectCandidate}
                onView={handleViewCandidate}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Candidate Scorecard Dialog */}
      <CandidateScorecard
        open={showScorecard}
        onOpenChange={setShowScorecard}
      />
    </div>
  )
}