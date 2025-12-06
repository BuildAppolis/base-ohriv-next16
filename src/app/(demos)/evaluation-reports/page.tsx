'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, FileText } from 'lucide-react'
import Link from 'next/link'
import { EvaluationReportsDashboard } from '@/components/evaluation/evaluation-reports-dashboard'

export default function EvaluationReportsPage() {
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/demos">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Demos
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Evaluation Reports Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Comprehensive analysis of multi-stage KSA evaluations and candidate performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/evaluation">
                <FileText className="h-4 w-4 mr-2" />
                Quick Evaluation
              </Link>
            </Button>
            <Button asChild>
              <Link href="/demos/scoring-and-evaluation">
                <BarChart3 className="h-4 w-4 mr-2" />
                Start New Evaluation
              </Link>
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Multi-Stage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View comprehensive reports that aggregate candidate performance across all evaluation stages,
                including phone screening, technical interviews, and final interviews.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">KSA Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed breakdowns of Knowledge, Skills, and Abilities assessments with progression tracking
                and trend analysis across evaluation stages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Identify key strengths, areas for improvement, and evaluation discrepancies to make
                informed hiring decisions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard */}
        <EvaluationReportsDashboard />

        {/* Usage Guide */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">How to Use This Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 dark:text-blue-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Getting Started</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Complete multi-stage evaluations using the scoring system</li>
                  <li>• Upload KSA frameworks for enhanced analysis</li>
                  <li>• Generate comprehensive reports for candidates</li>
                  <li>• Export reports for sharing and documentation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Understanding Reports</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Final Score:</strong> Weighted average across all stages</li>
                  <li>• <strong>Progression:</strong> How performance changes between stages</li>
                  <li>• <strong>Discrepancies:</strong> Notable differences between evaluators</li>
                  <li>• <strong>Recommendations:</strong> Overall hiring recommendation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}