'use client'

import { useEffect, useMemo, useState } from 'react'
import { BucketedSlider } from '@/components/buildappolis/bucketed-slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { jobTypeWeightingPresets } from '@/types/company/weighting-presets'
import type { JobType, WeightingBand } from '@/types/company/ksa-new'

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
  const initialLevel = Object.keys(jobTypeWeightingPresets.technical)[0]
  const [jobType, setJobType] = useState<JobType>('technical')
  const [jobLevel, setJobLevel] = useState<string>(initialLevel)
  const [ksaWeights, setKsaWeights] = useState<WeightingBand>(
    jobTypeWeightingPresets.technical[initialLevel]
  )
  const [valueWeights, setValueWeights] = useState([
    { name: 'Innovation', weight: 25 },
    { name: 'Excellence', weight: 25 },
    { name: 'Collaboration', weight: 25 },
    { name: 'Growth', weight: 25 }
  ])

  const levelOptions = useMemo(
    () => Object.keys(jobTypeWeightingPresets[jobType] as Record<string, WeightingBand>),
    [jobType]
  )

  useEffect(() => {
    const firstLevel = levelOptions[0]
    setJobLevel(firstLevel)
    setKsaWeights(
      (jobTypeWeightingPresets as Record<JobType, Record<string, WeightingBand>>)[jobType][
      firstLevel
      ]
    )
  }, [jobType, levelOptions])

  const ksaTotal =
    Math.round((ksaWeights.Knowledge + ksaWeights.Skills + ksaWeights.Ability) * 10) / 10
  const valuesTotal = valueWeights.reduce((sum, v) => sum + v.weight, 0)

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">KSA/Values</Badge>
            Weighting Presets + Overrides
          </CardTitle>
          <CardDescription>
            Choose a job type/level to load preset weights, then tweak Knowledge/Skills/Ability or
            per-value weighting. Totals highlight if they don&apos;t add up to 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Job type</span>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="technical">Technical</option>
                <option value="non-technical">Non-technical</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm md:col-span-2">
              <span className="text-muted-foreground">Job level (preset)</span>
              <select
                value={jobLevel}
                onChange={(e) => {
                  const level = e.target.value
                  setJobLevel(level)
                  const preset = (
                    jobTypeWeightingPresets as Record<JobType, Record<string, WeightingBand>>
                  )[jobType][level]
                  if (preset) setKsaWeights(preset)
                }}
                className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Preset rationale: {(jobTypeWeightingPresets as Record<string, Record<string, WeightingBand>>)[jobType][jobLevel]?.rationale}
              </p>
            </label>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Knowledge / Skills / Ability</p>
              <span
                className={`text-sm ${ksaTotal === 100 ? 'text-muted-foreground' : 'text-destructive'}`}
              >
                Total: {ksaTotal} / 100
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(['Knowledge', 'Skills', 'Ability'] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{key}</span>
                    <span>{Math.round(ksaWeights[key])}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={ksaWeights[key]}
                    onChange={(e) =>
                      setKsaWeights((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value)
                      }))
                    }
                    className="w-full accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Company values weighting</p>
              <span
                className={`text-sm ${valuesTotal === 100 ? 'text-muted-foreground' : 'text-destructive'}`}
              >
                Total: {valuesTotal} / 100
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {valueWeights.map((value, idx) => (
                <div key={value.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{value.name}</span>
                    <span>{value.weight}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={value.weight}
                    onChange={(e) =>
                      setValueWeights((prev) =>
                        prev.map((v, i) =>
                          i === idx ? { ...v, weight: Number(e.target.value) } : v
                        )
                      )
                    }
                    className="w-full accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Badge variant="secondary">Visualize Leniency Factor</Badge>
            Shows how the leniency factor might be presented in the UI
          </CardTitle>
        </CardHeader>
        <CardContent>

        </CardContent>
      </Card>
    </div>
  )
}
