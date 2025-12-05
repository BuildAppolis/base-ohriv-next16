/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "../ui/button"

interface DynamicStep {
    id: string
    title: string
    description: string
    icon:
    | React.ComponentType<{ className?: string }>
    | React.ReactElement<{ className?: string }>
    content: React.ReactNode
    disabled?: boolean
    disabledReason?: string
}

interface DynamicToolbarExpandableProps {
    steps: DynamicStep[]
    className?: string
    activeStep?: string | null
    onActiveStepChange?: (stepId: string | null) => void
}

const DynamicToolbarExpandable = React.memo<DynamicToolbarExpandableProps>(
    function DynamicToolbarExpandable({
        steps,
        activeStep: controlledActiveStep,
        onActiveStepChange,
    }) {
        const [internalActive, setInternalActive] = useState<string | null>(null)

        const active =
            controlledActiveStep !== undefined ? controlledActiveStep : internalActive

        const setActive = useCallback(
            (value: string | null) => {
                if (onActiveStepChange) {
                    onActiveStepChange(value)
                } else {
                    setInternalActive(value)
                }
            },
            [onActiveStepChange]
        )

        const [previousIndex, setPreviousIndex] = useState<number | null>(null)
        const [menuRef] = useMeasure()
        const menuContainerRef = useRef<any>(null)



        const scrollButtonIntoView = useCallback(
            (currentIndex: number, previousIndex: number | null) => {
                if (!menuContainerRef.current) return

                const isMovingForward =
                    previousIndex !== null && currentIndex > previousIndex
                const isMovingBackward =
                    previousIndex !== null && currentIndex < previousIndex

                let targetIndex = currentIndex

                if (isMovingForward) {
                    const nextIndex = currentIndex + 1
                    if (nextIndex < steps.length) {
                        targetIndex = nextIndex
                    }
                } else if (isMovingBackward) {
                    const prevIndex = currentIndex - 1
                    if (prevIndex >= 0) {
                        targetIndex = prevIndex
                    }
                }

                const targetButton = menuContainerRef.current.querySelector(
                    `[data-step-index="${targetIndex}"]`
                ) as HTMLElement

                if (targetButton) {
                    targetButton.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                    })
                }
            },
            [steps.length]
        )

        const handleNavClick = useCallback(
            (item: string) => {
                // Check if step is disabled
                const step = steps.find((s) => s.id === item)
                if (step?.disabled) {
                    // Don't allow navigation to disabled steps
                    return
                }

                const currentIndex = steps.findIndex((step) => step.id === item)
                setActive(item)

                if (currentIndex >= 0) {
                    setTimeout(() => {
                        scrollButtonIntoView(currentIndex, previousIndex)
                    }, 100)

                    setPreviousIndex(currentIndex)
                }
            },
            [
                steps,
                scrollButtonIntoView,
                previousIndex,
                setActive,
            ]
        )

        const renderContent = useCallback(() => {
            if (!active) return null

            const step = steps.find((s) => s.id === active)
            if (!step) return null

            return (
                <div className="space-y-4">
                    {step.content}
                </div>
            )
        }, [active, steps])


        const navigationButtons = useMemo(
            () =>
                steps.map((step, index) => ({
                    id: step.id,
                    label: step.title,
                    step: (index + 1).toString(),
                    onClick: () => handleNavClick(step.id),
                    isActive: active === step.id,
                    isFirst: index === 0,
                    isLast: index === steps.length - 1,
                    disabled: step.disabled || false,
                    disabledReason: step.disabledReason,
                })),
            [steps, active, handleNavClick]
        )

        return (

            <div
                className="w-full   bg-muted overflow-hidden rounded-xl border"
            >

                {/* Navigation bar */}
                <div className="relative z-10">
                    <ScrollArea
                        className="w-full"
                        viewportClassName="scrollbar-hide"
                        maskHeight={16}
                        ref={(element) => {
                            if (element) {
                                menuContainerRef.current = element
                                menuRef(element)
                            }
                        }}
                    >
                        <div className="grid grid-cols-3 w-max min-w-full">
                            {navigationButtons.map((button, index) => (
                                <div key={button.id} className="flex items-center h-10">
                                    <Button
                                        data-step-index={index}
                                        onClick={button.onClick}
                                        disabled={button.disabled || button.isActive}
                                        title={button.disabled ? button.disabledReason : button.label}
                                        className={cn('w-full rounded-none h-full group',
                                            button.isActive
                                                ? "text-primary bg-primary/10 border-b-2 border-primary font-semibold"
                                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        )}
                                        aria-disabled={button.disabled}
                                        aria-label={button.disabled ? button.disabledReason : `${button.label}, step ${button.step}`}
                                    >
                                        <Badge
                                            className={cn(
                                                "w-6 h-6 flex items-center justify-center text-xs font-bold",
                                                button.isActive
                                                    ? "text-primary-foreground "
                                                    : "text-primary bg-primary/20 group-hover:bg-primary/30 group-hover:text-primary-foreground"
                                            )}
                                        >
                                            <span className="text-white">
                                                {button.step}
                                            </span>
                                        </Badge>

                                        <span>
                                            {button.label}
                                        </span>

                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                {/* Always expanded content area */}
                <div className="">
                    {renderContent()}
                </div>
            </div>
        )
    }
)

DynamicToolbarExpandable.displayName = "DynamicToolbarExpandable"

// ________________________ HOOKS ________________________
interface Bounds {
    left: number
    top: number
    width: number
    height: number
}

function useMeasure(): [
    (node: HTMLElement | null) => void,
    Bounds,
    () => void,
] {
    const [bounds, setBounds] = useState<Bounds>({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    })

    const [node, setNode] = useState<HTMLElement | null>(null)
    const observer = useRef<ResizeObserver | null>(null)

    const disconnect = useCallback(() => {
        if (observer.current) {
            observer.current.disconnect()
        }
    }, [])

    const ref = useCallback((node: HTMLElement | null) => {
        setNode(node)
    }, [])

    useEffect(() => {
        if (!node) return

        if (observer.current) {
            observer.current.disconnect()
        }

        observer.current = new ResizeObserver(([entry]) => {
            if (entry && entry.contentRect) {
                const { left, top, width, height } = entry.contentRect
                setBounds({ left, top, width, height })
            }
        })

        observer.current.observe(node)

        return () => {
            if (observer.current) {
                observer.current.disconnect()
            }
        }
    }, [node])

    return [ref, bounds, disconnect]
}


function useTouchPrimary() {
    const [isTouchPrimary, setIsTouchPrimary] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return

        const controller = new AbortController()
        const { signal } = controller

        const handleTouch = () => {
            const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0
            const prefersTouch = window.matchMedia("(pointer: coarse)").matches
            setIsTouchPrimary(hasTouch && prefersTouch)
        }

        const mq = window.matchMedia("(pointer: coarse)")
        mq.addEventListener("change", handleTouch, { signal })
        window.addEventListener("pointerdown", handleTouch, { signal })

        handleTouch()

        return () => controller.abort()
    }, [])

    return isTouchPrimary
}

// ________________________ MODIFIED SCROLL AREA ________________________
// https://lina.sameer.sh/

const ScrollAreaContext = React.createContext<boolean>(false)
type Mask = {
    top: boolean
    bottom: boolean
    left: boolean
    right: boolean
}

const ScrollArea = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
        viewportClassName?: string
        /**
         * `maskHeight` is the height of the mask in pixels.
         * pass `0` to disable the mask
         * @default 30
         */
        maskHeight?: number
        maskClassName?: string
    }
>(
    (
        {
            className,
            children,
            scrollHideDelay = 0,
            viewportClassName,
            maskClassName,
            maskHeight = 30,
            ...props
        },
        ref
    ) => {
        const [showMask, setShowMask] = React.useState<Mask>({
            top: false,
            bottom: false,
            left: false,
            right: false,
        })
        const viewportRef = React.useRef<HTMLDivElement>(null)
        const isTouch = useTouchPrimary()

        const checkScrollability = React.useCallback(() => {
            const element = viewportRef.current
            if (!element) return

            const {
                scrollTop,
                scrollLeft,
                scrollWidth,
                clientWidth,
                scrollHeight,
                clientHeight,
            } = element
            setShowMask((prev) => ({
                ...prev,
                top: scrollTop > 0,
                bottom: scrollTop + clientHeight < scrollHeight - 1,
                left: scrollLeft > 0,
                right: scrollLeft + clientWidth < scrollWidth - 1,
            }))
        }, [])

        React.useEffect(() => {
            if (typeof window === "undefined") return

            const element = viewportRef.current
            if (!element) return

            const controller = new AbortController()
            const { signal } = controller

            const resizeObserver = new ResizeObserver(checkScrollability)
            resizeObserver.observe(element)

            element.addEventListener("scroll", checkScrollability, { signal })
            window.addEventListener("resize", checkScrollability, { signal })

            checkScrollability()

            return () => {
                controller.abort()
                resizeObserver.disconnect()
            }
        }, [checkScrollability, isTouch])

        return (
            <ScrollAreaContext.Provider value={isTouch}>
                {isTouch ? (
                    <div
                        ref={ref}
                        role="group"
                        data-slot="scroll-area"
                        aria-roledescription="scroll area"
                        className={cn("relative overflow-hidden", className)}
                        {...props}
                    >
                        <div
                            ref={viewportRef}
                            data-slot="scroll-area-viewport"
                            className={cn(
                                "size-full overflow-auto rounded-[inherit]",
                                viewportClassName
                            )}
                            tabIndex={0}
                        >
                            {children}
                        </div>

                        {maskHeight > 0 && (
                            <ScrollMask
                                showMask={showMask}
                                className={maskClassName}
                                maskHeight={maskHeight}
                            />
                        )}
                    </div>
                ) : (
                    <ScrollAreaPrimitive.Root
                        ref={ref}
                        data-slot="scroll-area"
                        scrollHideDelay={scrollHideDelay}
                        className={cn("relative overflow-hidden", className)}
                        {...props}
                    >
                        <ScrollAreaPrimitive.Viewport
                            ref={viewportRef}
                            data-slot="scroll-area-viewport"
                            className={cn("size-full rounded-[inherit]", viewportClassName)}
                        >
                            {children}
                        </ScrollAreaPrimitive.Viewport>

                        {maskHeight > 0 && (
                            <ScrollMask
                                showMask={showMask}
                                className={maskClassName}
                                maskHeight={maskHeight}
                            />
                        )}
                        <ScrollBar />
                        <ScrollAreaPrimitive.Corner />
                    </ScrollAreaPrimitive.Root>
                )}
            </ScrollAreaContext.Provider>
        )
    }
)

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => {
    const isTouch = React.useContext(ScrollAreaContext)

    if (isTouch) return null

    return (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
            ref={ref}
            orientation={orientation}
            data-slot="scroll-area-scrollbar"
            className={cn(
                "hover:bg-muted dark:hover:bg-muted/50 data-[state=visible]:fade-in-0 data-[state=hidden]:fade-out-0 data-[state=visible]:animate-in data-[state=hidden]:animate-out flex touch-none p-px transition-[colors] duration-150 select-none",
                orientation === "vertical" &&
                "h-full w-2.5 border-l border-l-transparent",
                orientation === "horizontal" &&
                "h-2.5 flex-col border-t border-t-transparent px-1 pr-1.25",
                className
            )}
            {...props}
        >
            <ScrollAreaPrimitive.ScrollAreaThumb
                data-slot="scroll-area-thumb"
                className={cn(
                    "bg-border relative flex-1 origin-center rounded-full transition-[scale]",
                    orientation === "vertical" && "my-1 active:scale-y-95",
                    orientation === "horizontal" && "active:scale-x-98"
                )}
            />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
    )
})

ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

const ScrollMask = ({
    showMask,
    maskHeight,
    className,
    ...props
}: React.ComponentProps<"div"> & {
    showMask: Mask
    maskHeight: number
}) => {
    return (
        <>
            <div
                {...props}
                aria-hidden="true"
                style={
                    {
                        "--top-fade-height": showMask.top ? `${maskHeight}px` : "0px",
                        "--bottom-fade-height": showMask.bottom ? `${maskHeight}px` : "0px",
                    } as React.CSSProperties
                }
                className={cn(
                    "pointer-events-none absolute inset-0 z-10",
                    "before:absolute before:inset-x-0 before:top-0 before:transition-[height,opacity] before:duration-300 before:content-['']",
                    "after:absolute after:inset-x-0 after:bottom-0 after:transition-[height,opacity] after:duration-300 after:content-['']",
                    "before:h-(--top-fade-height) after:h-(--bottom-fade-height)",
                    showMask.top ? "before:opacity-100" : "before:opacity-0",
                    showMask.bottom ? "after:opacity-100" : "after:opacity-0",
                    "before:from-background before:bg-gradient-to-b before:to-transparent",
                    "after:from-background after:bg-gradient-to-t after:to-transparent",
                    className
                )}
            />
            <div
                {...props}
                aria-hidden="true"
                style={
                    {
                        "--left-fade-width": showMask.left ? `${maskHeight}px` : "0px",
                        "--right-fade-width": showMask.right ? `${maskHeight}px` : "0px",
                    } as React.CSSProperties
                }
                className={cn(
                    "pointer-events-none absolute inset-0 z-10",
                    "before:absolute before:inset-y-0 before:left-0 before:transition-[width,opacity] before:duration-300 before:content-['']",
                    "after:absolute after:inset-y-0 after:right-0 after:transition-[width,opacity] after:duration-300 after:content-['']",
                    "before:w-(--left-fade-width) after:w-(--right-fade-width)",
                    showMask.left ? "before:opacity-100" : "before:opacity-0",
                    showMask.right ? "after:opacity-100" : "after:opacity-0",
                    "before:from-background before:bg-gradient-to-r before:to-transparent",
                    "after:from-background after:bg-gradient-to-l after:to-transparent",
                    className
                )}
            />
        </>
    )
}

export function ToolbarExpandable(
    props: DynamicToolbarExpandableProps
) {
    return <DynamicToolbarExpandable {...props} />
}
