'use client'

import { useState } from 'react'
import { BucketedSlider } from '@/components/buildappolis/bucketed-slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const tailoredBuckets = [
  { label: 'Unable to perform job duties', helper: '1-2' },
  { label: 'Able to perform with heavy coaching', helper: '3-4' },
  { label: 'Performs with minimal guidance', helper: '5-6' },
  { label: 'Performs and improves performance of peers', helper: '7-8' },
  { label: 'Transforms how the team delivers', helper: '9-10' }
]

export default function UIDemosPage() {
  const [defaultScore, setDefaultScore] = useState(6)
  const [customScore, setCustomScore] = useState(8)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">UI Demos · Scoring Anchors</h1>
        <p className="text-muted-foreground">
          Five buckets of two points (1-10). Hover or focus the thumb to see bucket details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">5×2 Buckets</Badge>
            Default Buckets
          </CardTitle>
          <CardDescription>
            Standard labels: Needs improvement → Outstanding. Use on KSA or values scoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BucketedSlider
            value={defaultScore}
            onChange={setDefaultScore}
            label={`Current score: ${defaultScore}/10`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>Custom Labels</Badge>
            Tailored Buckets
          </CardTitle>
          <CardDescription>
            Swap in role- or value-specific anchors; buckets remain 1-10 in 5 groups of 2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BucketedSlider
            value={customScore}
            onChange={setCustomScore}
            buckets={tailoredBuckets}
            label={`Current score: ${customScore}/10`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
