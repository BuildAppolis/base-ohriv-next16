import { cn } from "@/lib/utils";
import React, { useState, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { Badge } from "../ui/badge";

// Type definitions
interface SliderConfig {
    center: number;
    leftPoints: number;
    rightPoints: number;
}

interface SliderData {
    [key: string]: SliderConfig;
}

interface RangeSliderProps {
    label: string;
    config: SliderConfig;
    maxDeviation?: number;
    min?: number;
    max?: number;
    onChange?: (config: SliderConfig) => void;
}

interface RangeSliderGroupProps {
    data: SliderData;
    maxDeviation?: number;
    min?: number;
    max?: number;
    onChange?: (data: SliderData) => void;
}

const LENIENCY = 2; // Minimum total leniency between both sides

// Individual Slider Component
const RangeSlider: React.FC<RangeSliderProps> = ({
    label,
    config,
    maxDeviation = 10,
    min = 1,
    max = 100,
    onChange,
}) => {
    const [leftPoints, setLeftPoints] = useState(config.leftPoints);
    const [rightPoints, setRightPoints] = useState(config.rightPoints);
    const [dragPreview, setDragPreview] = useState<{ thumb: "left" | "right"; value: number } | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const { center } = config;

    // Calculate actual values on the scale
    const leftValue = center - leftPoints;
    const rightValue = center + rightPoints;

    const getPositionPercent = (value: number): number =>
        ((value - min) / (max - min)) * 100;

    const handleDrag = useCallback(
        (e: MouseEvent | TouchEvent, thumb: "left" | "right") => {
            if (!trackRef.current) return;

            const rect = trackRef.current.getBoundingClientRect();
            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            const x = clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            const value = Math.round(min + (percent / 100) * (max - min));

            // Set drag preview for immediate visual feedback
            setDragPreview({ thumb, value });

            if (thumb === "left") {
                const minAllowedValue = Math.max(min, center - maxDeviation);
                const maxAllowedValue = center;
                const clampedValue = Math.max(
                    minAllowedValue,
                    Math.min(maxAllowedValue, value)
                );
                const newLeftPoints = center - clampedValue;

                // Enforce minimum 2-point leniency: newLeftPoints + rightPoints >= 2
                const minLeftPoints = Math.max(0, LENIENCY - rightPoints);
                const finalLeftPoints = Math.max(minLeftPoints, newLeftPoints);

                flushSync(() => {
                    setLeftPoints(finalLeftPoints);
                });
                onChange?.({ center, leftPoints: finalLeftPoints, rightPoints });
            } else {
                const minAllowedValue = center;
                const maxAllowedValue = Math.min(max, center + maxDeviation);
                const clampedValue = Math.max(
                    minAllowedValue,
                    Math.min(maxAllowedValue, value)
                );
                const newRightPoints = clampedValue - center;

                // Enforce minimum 2-point leniency: leftPoints + newRightPoints >= 2
                const minRightPoints = Math.max(0, LENIENCY - leftPoints);
                const finalRightPoints = Math.max(minRightPoints, newRightPoints);

                flushSync(() => {
                    setRightPoints(finalRightPoints);
                });
                onChange?.({ center, leftPoints, rightPoints: finalRightPoints });
            }
        },
        [center, leftPoints, rightPoints, min, max, maxDeviation, onChange]
    );

    const handleMouseDown =
        (thumb: "left" | "right") => (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();

            // Optimized drag handling with reduced throttling
            const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
                moveEvent.preventDefault();
                handleDrag(moveEvent, thumb);
            };

            const handleUp = () => {
                setDragPreview(null);
                document.removeEventListener("mousemove", handleMove);
                document.removeEventListener("mouseup", handleUp);
                document.removeEventListener("touchmove", handleMove);
                document.removeEventListener("touchend", handleUp);
            };

            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", handleUp);
            document.addEventListener("touchmove", handleMove, { passive: false });
            document.addEventListener("touchend", handleUp);
        };

    // Calculate positions with real-time drag preview for perfect synchronization
    const centerPercent = getPositionPercent(center);

    // Use drag preview values for immediate visual feedback during drag
    let displayLeftValue = leftValue;
    let displayRightValue = rightValue;

    if (dragPreview) {
        if (dragPreview.thumb === "left") {
            const minAllowedValue = Math.max(min, center - maxDeviation);
            const maxAllowedValue = center;
            const clampedValue = Math.max(
                minAllowedValue,
                Math.min(maxAllowedValue, dragPreview.value)
            );
            const newLeftPoints = center - clampedValue;
            const minLeftPoints = Math.max(0, LENIENCY - rightPoints);
            const finalLeftPoints = Math.max(minLeftPoints, newLeftPoints);
            displayLeftValue = center - finalLeftPoints;
        } else {
            const minAllowedValue = center;
            const maxAllowedValue = Math.min(max, center + maxDeviation);
            const clampedValue = Math.max(
                minAllowedValue,
                Math.min(maxAllowedValue, dragPreview.value)
            );
            const newRightPoints = clampedValue - center;
            const minRightPoints = Math.max(0, LENIENCY - leftPoints);
            const finalRightPoints = Math.max(minRightPoints, newRightPoints);
            displayRightValue = center + finalRightPoints;
        }
    }

    const leftPercent = getPositionPercent(displayLeftValue);
    const rightPercent = getPositionPercent(displayRightValue);

    const styles = {
        trackBg: `relative h-2 bg-primary from-red-500 to-green-500 rounded-full `,
        headerText: `text-base font-semibold text-gray-700 mb-3`,
        labelCenter: `absolute -top-9 transform -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none`,
        labelBg: ` border-2 border-green-500 bg-green-100 p-0.5 px-2 rounded-md shadow-md`,
        labelText: `text-xs font-medium text-green-700 select-none`,
        thumb: `absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-4 bg-background rounded border-2 border-primary cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-all z-50 select-none rounded-lg`,
        thumbText: `absolute top-4 -translate-x-1/2 text-xs font-medium text-muted-foreground select-none`,
        centerLine: `w-1 h-4 bg-green-500 z-20 pointer-events-none`,
        minMaxLabel: `absolute top-1/2 -translate-y-1/2 text-xs   select-none  min-w-8 text-center rounded-full border-2 border-primary bg-background p-0.5 px-2 shadow-md`,
        activeRange: `absolute h-full bg-green-500 rounded-full will-change-transform`,
    };

    return (
        <div className="">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <span className={cn(styles.headerText)}>{label} ({Math.round(((rightValue - leftValue) / (max - min)) * 100)}% Leniency)</span>
            </div>

            {/* Slider Container - with padding for min/max labels */}
            <div className="relative px-4 py-6">
                {/* Track Container - this is the reference for all positioning */}
                <div className="relative">
                    {/* Center Label - positioned relative to track */}
                    <div
                        className={cn(styles.labelCenter)}
                        style={{ left: `${centerPercent}%` }}
                    >
                        <div className={cn(styles.labelBg)}>
                            <div className={cn(styles.labelText)}>{center}</div>
                        </div>
                        {/* Center line marker on track */}
                        <div className={cn(styles.centerLine)} />
                    </div>

                    {/* Track Background */}
                    <div
                        ref={trackRef}
                        className={cn(styles.trackBg)}
                    >
                        {/* Active Range - the blue bar between thumbs */}
                        <div
                            className={cn(styles.activeRange)}
                            style={{
                                left: `${leftPercent}%`,
                                width: '100%',
                                transform: `scaleX(${(rightPercent - leftPercent) / 100})`,
                                transformOrigin: 'left center',
                            }}
                        />
                    </div>

                    {/* Left Thumb */}
                    <div
                        className={cn(styles.thumb, ' bg-background items-center flex justify-center h-6')}

                        style={{
                            left: `${leftPercent}%`,
                        }}
                        onMouseDown={handleMouseDown("left")}
                        onTouchStart={handleMouseDown("left")}
                    >
                        <span className="text-xs ">{displayLeftValue}</span>
                    </div>

                    {/* Right Thumb */}
                    <div
                        className={cn(styles.thumb, ' bg-background items-center flex justify-center h-6')}
                        style={{
                            left: `${rightPercent}%`,
                        }}
                        onMouseDown={handleMouseDown("right")}
                        onTouchStart={handleMouseDown("right")}
                    >
                        <span className="text-xs ">{displayRightValue}</span>
                    </div>
                </div>

                {/* Min/Max Labels - positioned outside the track container */}
                <div className={cn(styles.minMaxLabel, "left-0")}>
                    {min}
                </div>
                <div className={cn(styles.minMaxLabel, "right-0")}>
                    {max}
                </div>
            </div>
        </div>
    );
};

// Main Group Component
const RangeSliderGroup: React.FC<RangeSliderGroupProps> = ({
    data,
    maxDeviation = 10,
    min = 1,
    max = 100,
    onChange,
}) => {
    const [sliderData, setSliderData] = useState<SliderData>(data);

    const handleSliderChange = (key: string) => (config: SliderConfig) => {
        const newData = { ...sliderData, [key]: config };
        setSliderData(newData);
        onChange?.(newData);
    };

    return (
        <>
            {Object.entries(sliderData).map(([key, config]) => (
                <RangeSlider
                    key={key}
                    label={key}
                    config={config}
                    maxDeviation={maxDeviation}
                    min={min}
                    max={max}
                    onChange={handleSliderChange(key)}
                />
            ))}
        </>
    );
};

export default RangeSliderGroup;

// Export types for external use
export type {
    SliderConfig,
    SliderData,
    RangeSliderProps,
    RangeSliderGroupProps,
};

// Example usage component
export const ExampleUsage: React.FC = () => {
    const initialData: SliderData = {
        Knowledge: { center: 25, leftPoints: 4, rightPoints: 6 },
        Skills: { center: 50, leftPoints: 6, rightPoints: 8 },
        Ability: { center: 25, leftPoints: 5, rightPoints: 5 },
    };

    const handleChange = (data: SliderData) => {
        console.log("Updated data:", data);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <RangeSliderGroup
                data={initialData}
                maxDeviation={10}
                onChange={handleChange}
            />
        </div>
    );
};
