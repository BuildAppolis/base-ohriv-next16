"use client";

import { memo, type ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils"; // or whatever your className helper is

// Give this component the same props as Streamdown
type ResponseProps = ComponentProps<typeof Streamdown>;

/**
 * Response
 *
 * A thin wrapper around Streamdown that:
 * - Renders streaming markdown from the model
 * - Plays nicely with Tailwind / AI chat UIs
 * - Is memoized to avoid pointless re-renders
 */
export const Response = memo(function Response({
    className,
    ...props
}: ResponseProps) {
    return (
        <Streamdown
            className={cn(
                // full-size + remove extra top/bottom spacing
                "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                className,
            )}
            {...props}
        />
    );
});
