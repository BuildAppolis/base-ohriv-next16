'use client'

interface SmoothScrollProps {
    target: HTMLElement;
    options?: {
        duration?: number;
        easing?: (t: number) => number;
    }
}

export const smoothScrollTo = ({ target, options }: SmoothScrollProps) => {
    const startPosition = window.scrollY
    const targetPosition = target.getBoundingClientRect().top + window.scrollY
    const distance = targetPosition - startPosition
    const duration = options?.duration ?? 1000 // milliseconds
    let start: number | null = null

    // Easing function: slow start, fast middle, slow end (cubic bezier approximation)
    const easeInOutCubic = (t: number): number => {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animateScroll = (timestamp: number) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        const easing = easeInOutCubic(progress)

        window.scrollTo(0, startPosition + distance * easing)

        if (progress < 1) {
            window.requestAnimationFrame(animateScroll)
        }
    }

    window.requestAnimationFrame(animateScroll)
}