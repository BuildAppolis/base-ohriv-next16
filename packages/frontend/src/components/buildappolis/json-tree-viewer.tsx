/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Copy, Check, MoreHorizontal, ChevronUp, Code, FileJson, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

type JsonViewerProps = {
    data: any
    rootName?: string
    defaultExpanded?: boolean
    className?: string
}

export function JsonViewer({ data, rootName = "root", defaultExpanded = true, className }: JsonViewerProps) {
    const [isRawMode, setIsRawMode] = React.useState(false)
    const [isCopied, setIsCopied] = React.useState(false)
    const [isFullscreen, setIsFullscreen] = React.useState(false)

    const handleCopyRaw = () => {
        const jsonString = JSON.stringify(data, null, 2)
        navigator.clipboard.writeText(jsonString)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
        setIsRawMode(false)
    }

    // Handle Escape key to exit fullscreen
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
        }

        if (isFullscreen) {
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isFullscreen])

    const content = (
        <TooltipProvider>
            <div className={cn("font-mono text-sm relative group", className, isFullscreen && "h-screen")}>
                {/* Floating Mode Toggle Buttons - Only show when not in fullscreen */}
                {!isFullscreen && (
                    <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 -translate-y-8">

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleFullscreen}
                                    className="h-6 w-6 p-0"
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="h-3 w-3" />
                                    ) : (
                                        <Maximize2 className="h-3 w-3" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="end">
                                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {/* Content */}
                {isRawMode ? (
                    <div className={cn(isFullscreen ? "h-full" : "max-h-96")}>
                        {/* Custom JSON display without CodeBlock constraints */}
                        <div className="relative bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                            {/* Copy button */}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2000);
                                }}
                                className="absolute top-3 right-3 z-10 p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                title="Copy to clipboard"
                            >
                                {isCopied ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                    <Copy className="h-4 w-4 text-slate-600" />
                                )}
                            </button>

                            {/* Scrollable content area */}
                            <div className={cn(
                                "overflow-auto",
                                isFullscreen ? "h-[calc(100vh-116px)]" : "max-h-96"
                            )}>
                                <div className="p-4">
                                    <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre">
                                        {JSON.stringify(data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cn(isFullscreen ? "h-full overflow-auto p-4" : "")}>
                        <JsonNode name={rootName} data={data} isRoot={true} defaultExpanded={defaultExpanded} />
                    </div>
                )}
            </div>
        </TooltipProvider>
    )

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-background">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">JSON Viewer - Fullscreen</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsRawMode(!isRawMode)}>
                            {isRawMode ? <FileJson className="h-4 w-4 mr-2" /> : <Code className="h-4 w-4 mr-2" />}
                            {isRawMode ? 'Tree View' : 'Raw View'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCopyRaw}>
                            {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                            <Minimize2 className="h-4 w-4 mr-2" />
                            Exit Fullscreen
                        </Button>
                    </div>
                </div>
                <div className="h-[calc(100vh-73px)]">
                    {content}
                </div>
            </div>
        )
    }

    return content
}

type JsonNodeProps = {
    name: string
    data: any
    isRoot?: boolean
    defaultExpanded?: boolean
    level?: number
}

function JsonNode({ name, data, isRoot = false, defaultExpanded = true, level = 0 }: JsonNodeProps) {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
    const [isCopied, setIsCopied] = React.useState(false)

    const handleToggle = () => {
        setIsExpanded(!isExpanded)
    }

    const copyToClipboard = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(JSON.stringify(data, null, 2))
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const dataType = data === null ? "null" : Array.isArray(data) ? "array" : typeof data
    const isExpandable = data !== null && data !== undefined && !(data instanceof Date) && (dataType === "object" || dataType === "array")
    const itemCount = isExpandable && data !== null && data !== undefined ? Object.keys(data).length : 0

    return (
        <div className={cn("pl-4 group/object", level > 0 && "border-l border-border")}>
            <div
                className={cn(
                    "flex items-center gap-1 py-1 hover:bg-muted/50 rounded px-1 -ml-4 cursor-pointer group/property",
                    isRoot && "text-primary font-semibold",
                )}
                onClick={isExpandable ? handleToggle : undefined}
            >
                {isExpandable ? (
                    <div className="w-4 h-4 flex items-center justify-center">
                        {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </div>
                ) : (
                    <div className="w-4" />
                )}

                <span className="text-primary">{name}</span>

                <span className="text-muted-foreground">
                    {isExpandable ? (
                        <>
                            {dataType === "array" ? "[" : "{"}
                            {!isExpanded && (
                                <span className="text-muted-foreground">
                                    {" "}
                                    {itemCount} {itemCount === 1 ? "item" : "items"} {dataType === "array" ? "]" : "}"}
                                </span>
                            )}
                        </>
                    ) : (
                        ":"
                    )}
                </span>

                {!isExpandable && <JsonValue data={data} />}

                {!isExpandable && <div className="w-3.5" />}

                <button
                    onClick={copyToClipboard}
                    className="ml-auto opacity-0 group-hover/property:opacity-100 hover:bg-muted p-1 rounded"
                    title="Copy to clipboard"
                >
                    {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                </button>
            </div>

            {isExpandable && isExpanded && data !== null && data !== undefined && (
                <div className="pl-4">
                    {Object.keys(data).map((key) => (
                        <JsonNode
                            key={key}
                            name={dataType === "array" ? `${key}` : key}
                            data={data[key]}
                            level={level + 1}
                            defaultExpanded={level < 1}
                        />
                    ))}
                    <div className="text-muted-foreground pl-4 py-1">{dataType === "array" ? "]" : "}"}</div>
                </div>
            )}
        </div>
    )
}

// Update the JsonValue function to make the entire row clickable with an expand icon
function JsonValue({ data }: { data: any }) {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const dataType = typeof data
    const TEXT_LIMIT = 80 // Character limit before truncation

    if (data === null) {
        return <span className="text-rose-500">null</span>
    }

    if (data === undefined) {
        return <span className="text-muted-foreground">undefined</span>
    }

    if (data instanceof Date) {
        return <span className="text-purple-500">{data.toISOString()}</span>
    }

    switch (dataType) {
        case "string":
            if (data.length > TEXT_LIMIT) {
                return (
                    <div
                        className="text-emerald-500 flex-1 flex items-center relative group cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsExpanded(!isExpanded)
                        }}
                    >
                        {`"`}
                        {isExpanded ? (
                            <span className="inline-block max-w-full">{data}</span>
                        ) : (
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <span className="inline-block max-w-full">{data.substring(0, TEXT_LIMIT)}...</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-md text-xs p-2 break-words">
                                    {data}
                                </TooltipContent>
                            </Tooltip>
                        )}
                        {`"`}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+4px)] opacity-0 group-hover:opacity-100 transition-opacity">
                            {isExpanded ? (
                                <ChevronUp className="h-3 w-3 text-muted-foreground" />
                            ) : (
                                <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                            )}
                        </div>
                    </div>
                )
            }
            return <span className="text-emerald-500">{`"${data}"`}</span>
        case "number":
            return <span className="text-amber-500">{data}</span>
        case "boolean":
            return <span className="text-blue-500">{data.toString()}</span>
        default:
            return <span>{String(data)}</span>
    }
}
