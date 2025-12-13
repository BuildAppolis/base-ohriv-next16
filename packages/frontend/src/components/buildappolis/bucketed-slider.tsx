'use client'

import { useMemo } from 'react'
import { Slider, SliderThumb } from '@/components/ui/slider'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'

type Bucket = {
  label: string
  helper?: string
  example?: string
}

type BucketedSliderProps = {
  value: number
  onChange: (val: number) => void
  buckets?: Bucket[]
  className?: string
  label?: string
}

const defaultBuckets: Bucket[] = [
  {
    label: 'Unable to perform job duties',
    helper: 'Needs step-by-step guidance; cannot complete tasks independently.',
    example: 'Needs detailed walkthroughs or shadowing before attempting tasks.'
  },
  {
    label: 'Able to perform with heavy coaching',
    helper: 'Can contribute with significant training and oversight.',
    example: 'Delivers parts of a task when paired or given checklists.'
  },
  {
    label: 'Performs with minimal guidance',
    helper: 'Operates independently on standard work.',
    example: 'Completes typical assignments with occasional feedback.'
  },
  {
    label: 'Performs and improves performance of peers',
    helper: 'Executes well and raises the bar for others.',
    example: 'Shares patterns, unblocks teammates, and improves team output.'
  },
  {
    label: 'Transforms how the team delivers',
    helper: 'Redefines expectations and delivery quality.',
    example: 'Introduces practices that others adopt across teams.'
  }
]

export function BucketedSlider({
  value,
  onChange,
  buckets = defaultBuckets,
  className,
  label
}: BucketedSliderProps) {
  const bucketIndex = useMemo(() => {
    const idx = Math.floor((value - 1) / 2)
    return Math.min(Math.max(idx, 0), buckets.length - 1)
  }, [value, buckets.length])

  const activeBucket = buckets[bucketIndex]
  const bucketRangeStart = bucketIndex * 2 + 1
  const bucketRangeEnd = Math.min(bucketRangeStart + 1, buckets.length * 2)

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Score {value}/10</span>
        <span>Bucket {bucketRangeStart} or {bucketRangeEnd}</span>
      </div>
      <div className="relative">
        <HoverCard openDelay={80} closeDelay={40}>
          <HoverCardTrigger asChild>
            <div className="relative">
              <Slider
                min={1}
                max={10}
                step={1}
                value={[value]}
                onValueChange={(vals) => {
                  const next = Math.max(1, Math.min(10, Math.round(vals[0])))
                  onChange(next)
                }}
                className="w-full"
              >
                <SliderThumb />
              </Slider>
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="top" align="center" className="w-72">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{activeBucket?.label || 'Bucket'}</p>
                <p className="text-xs text-muted-foreground">Scores {bucketRangeStart} or {bucketRangeEnd}</p>
                {activeBucket?.helper && (
                  <p className="text-xs text-muted-foreground mt-1">{activeBucket.helper}</p>
                )}
                {activeBucket?.example && (
                  <p className="text-xs text-muted-foreground mt-1 italic">Example: {activeBucket.example}</p>
                )}
              </div>
              <span className="text-sm font-semibold">{value}/10</span>
            </div>
          </HoverCardContent>
        </HoverCard>
        <div className="grid grid-cols-10 text-[11px] text-muted-foreground mt-1 gap-0.5">
          {Array.from({ length: 10 }, (_, idx) => {
            const score = idx + 1
            const isEdge = score === 1 || score === 10
            return (
              <span
                key={score}
                className={cn(
                  "text-center",
                  isEdge && (score === 1 ? "text-left" : "text-right"),
                  score === value && "text-foreground font-semibold"
                )}
              >
                {score}
              </span>
            )
          })}
        </div>
        <div className="grid grid-cols-5 text-[11px] text-muted-foreground mt-1">
          {buckets.map((bucket, idx) => {
            const start = idx * 2 + 1
            const end = Math.min(start + 1, buckets.length * 2)
            return (
              <span
                key={bucket.label}
                className={cn(
                  "text-center",
                  idx === 0 && "text-left",
                  idx === buckets.length - 1 && "text-right"
                )}
              >
                {start} {end}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BucketedSlider
