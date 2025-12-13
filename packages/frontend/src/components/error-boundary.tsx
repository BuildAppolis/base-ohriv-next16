"use client"

import React, { ReactNode } from 'react'


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  AlertCircle,
  Bug,
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

export type ErrorBoundaryMode = 'dot' | 'title' | 'full'

export interface ErrorBoundaryProps {
  children: ReactNode
  mode?: ErrorBoundaryMode
  title?: string
  description?: string
  icon?: ReactNode
  onRetry?: () => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  className?: string
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundaryComponent extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onRetry?.()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    // Custom fallback
    if (this.props.fallback) {
      return <>{this.props.fallback}</>
    }

    const { mode = 'title', title, description, icon, onRetry, className } = this.props
    const { error } = this.state

    switch (mode) {
      case 'dot':
        return (
          <ErrorBoundaryDot
            error={error}
            onClick={this.handleRetry}
            className={className}
          />
        )

      case 'title':
        return (
          <ErrorBoundaryTitle
            error={error}
            title={title}
            description={description}
            icon={icon}
            onClick={this.handleRetry}
            onRetry={onRetry}
            className={className}
          />
        )

      case 'full':
      default:
        return (
          <ErrorBoundaryFull
            error={error}
            title={title}
            description={description}
            icon={icon}
            onClick={this.handleRetry}
            onRetry={onRetry}
            className={className}
          />
        )
    }
  }
}

// Red dot indicator with dialog
function ErrorBoundaryDot({
  error,
  onClick,
  className
}: {
  error: Error | null
  onClick?: () => void
  className?: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          onClick={onClick}
          className={`relative group ${className || ''}`}
          aria-label="Show error details"
        >
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 bg-destructive rounded-full opacity-75 animate-ping" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Error Details
          </DialogTitle>
          <DialogDescription>
            An error occurred while rendering this component
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              View error details
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-48">
              {error?.stack || error?.message || 'Unknown error occurred'}
            </pre>
          </details>
          <div className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogTrigger>
            <Button onClick={onClick} size="sm">
              Retry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Title bar with dialog
function ErrorBoundaryTitle({
  error,
  title,
  description,
  icon,
  onClick,
  className
}: {
  error: Error | null
  title?: string
  description?: string
  icon?: ReactNode
  onClick?: () => void
  onRetry?: () => void
  className?: string
}) {
  const defaultIcon = <AlertCircle className="h-4 w-4" />

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={`border-destructive/20 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors ${className || ''}`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {icon || defaultIcon}
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {title || 'Rendering Error'}
                </p>
                {description && (
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon || defaultIcon}
            {title || 'Error Details'}
          </DialogTitle>
          <DialogDescription>
            {description || 'An error occurred while rendering this component'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              View error details
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-48">
              {error?.stack || error?.message || 'Unknown error occurred'}
            </pre>
          </details>
          <div className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogTrigger>
            <Button onClick={onClick} size="sm" >
              Retry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Full error display with all details visible
function ErrorBoundaryFull({
  error,
  title,
  description,
  icon,
  onClick,
  className
}: {
  error: Error | null
  title?: string
  description?: string
  icon?: ReactNode
  onClick?: () => void
  onRetry?: () => void
  className?: string
}) {
  const defaultIcon = <AlertCircle className="h-6 w-6" />

  return (
    <Card className={`border-destructive bg-destructive/5 ${className || ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
            {icon || defaultIcon}
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-semibold text-destructive">
                {title || 'Rendering Error'}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClick}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>

        <details className="text-left mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Show error details
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-64">
            {error?.stack || error?.message || 'Unknown error occurred'}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}

export { ErrorBoundaryComponent as ErrorBoundary }