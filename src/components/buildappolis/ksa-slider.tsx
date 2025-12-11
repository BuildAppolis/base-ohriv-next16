import { cn } from "@/lib/utils";
import React, { useState, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { Badge } from "../ui/badge";
import { MIN_TOTAL_RANGE, MAX_TOTAL_RANGE } from "@/types/company/ksa-new";

// Type definitions
interface SliderConfig {
    center: number;
    leftPoints: number;
    rightPoints: number;
}

interface SliderData {
    ksa: {
        [key: string]: SliderConfig;
    };
    values: {
        [key: string]: SliderConfig;
    };
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

    // Constants for constraints
    const LENIENCY = MIN_TOTAL_RANGE; // Minimum total points allowed
    const MAX_RANGE = MAX_TOTAL_RANGE; // Maximum total points allowed

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

                // Enforce range constraints: LENIENCY <= newLeftPoints + rightPoints <= MAX_RANGE
                const minLeftPoints = Math.max(0, LENIENCY - rightPoints);
                const maxLeftPoints = Math.max(0, MAX_RANGE - rightPoints);
                const clampedLeftPoints = Math.max(minLeftPoints, Math.min(maxLeftPoints, newLeftPoints));
                const finalLeftPoints = clampedLeftPoints;

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

                // Enforce range constraints: LENIENCY <= leftPoints + newRightPoints <= MAX_RANGE
                const minRightPoints = Math.max(0, LENIENCY - leftPoints);
                const maxRightPoints = Math.max(0, MAX_RANGE - leftPoints);
                const clampedRightPoints = Math.max(minRightPoints, Math.min(maxRightPoints, newRightPoints));
                const finalRightPoints = clampedRightPoints;

                flushSync(() => {
                    setRightPoints(finalRightPoints);
                });
                onChange?.({ center, leftPoints, rightPoints: finalRightPoints });
            }
        },
        [center, leftPoints, rightPoints, min, max, maxDeviation, onChange, LENIENCY, MAX_RANGE]
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
            const maxLeftPoints = Math.max(0, MAX_RANGE - rightPoints);
            const clampedLeftPoints = Math.max(minLeftPoints, Math.min(maxLeftPoints, newLeftPoints));
            const finalLeftPoints = clampedLeftPoints;
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
            const maxRightPoints = Math.max(0, MAX_RANGE - leftPoints);
            const clampedRightPoints = Math.max(minRightPoints, Math.min(maxRightPoints, newRightPoints));
            const finalRightPoints = clampedRightPoints;
            displayRightValue = center + finalRightPoints;
        }
    }

    const leftPercent = getPositionPercent(displayLeftValue);
    const rightPercent = getPositionPercent(displayRightValue);

    const styles = {
        trackBg: `relative h-2 bg-primary from-red-500 to-green-500 rounded-full `,
        headerText: `text-base font-semibold text-gray-700`,
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
        <div className="grid grid-cols-10 relative my-4 gap-2 items-end">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 bg-muted rounded items-center justify-center p-2 h-8">
                <span className={cn(styles.headerText)}>{label.charAt(0)}</span>
            </div>

            {/* Slider Container - with padding for min/max labels */}
            <div className="relative px-4 py-6 col-span-9">
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

                    {/* Cennter text */}
                    <div
                        className={cn("absolute w-max top-10 left-1/2 -translate-x-1/2 -translate-y-6 text-sm font-medium text-gray-600")}
                        style={{ left: `${centerPercent}%` }}
                    >
                        Acceptance Range: {leftPoints + rightPoints}%
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

// Empty state component
const EmptyState: React.FC<{ hasValidData: boolean }> = ({ hasValidData }) => (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Slider Data Available</h3>
        <p className="text-gray-500 max-w-md">
            {hasValidData
                ? "No KSA values or company values have been configured yet."
                : "Invalid data format provided. Please check your data structure."
            }
        </p>
    </div>
);

// Main Group Component
const RangeSliderGroup: React.FC<RangeSliderGroupProps> = ({
    data,
    maxDeviation = 10,
    min = 1,
    max = 100,
    onChange,
}) => {
    const [sliderData, setSliderData] = useState<SliderData>(data);

    const handleSliderChange = (category: 'ksa' | 'values', key: string) => (config: SliderConfig) => {
        const newData = {
            ...sliderData,
            [category]: {
                ...sliderData[category],
                [key]: config
            }
        };
        setSliderData(newData);
        onChange?.(newData);
    };

    // Validate data structure and format
    const isValidSliderData = (data: unknown): data is SliderData => {
        if (!data || typeof data !== "object") return false;

        const obj = data as { ksa?: unknown; values?: unknown };
        return (
            "ksa" in obj &&
            "values" in obj &&
            typeof obj.ksa === "object" &&
            obj.ksa !== null &&
            typeof obj.values === "object" &&
            obj.values !== null
        );
    };

    // Check if data exists and is valid
    const hasValidData = isValidSliderData(sliderData);
    const hasKsaData = hasValidData && Object.keys(sliderData.ksa).length > 0;
    const hasValuesData = hasValidData && Object.keys(sliderData.values).length > 0;
    const hasAnyData = hasKsaData || hasValuesData;

    // Return empty state if no data or invalid data
    if (!hasAnyData) {
        return <EmptyState hasValidData={hasValidData} />;
    }

    return (
        <>
            {/* KSA JobFit Section */}
            {hasKsaData && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">KSA Job Fit</h3>
                    {Object.entries(sliderData.ksa).map(([key, config]) => (
                        <RangeSlider
                            key={`ksa-${key}`}
                            label={key}
                            config={config}
                            maxDeviation={maxDeviation}
                            min={min}
                            max={max}
                            onChange={handleSliderChange('ksa', key)}
                        />
                    ))}
                </div>
            )}

            {/* Values CompanyFit Section */}
            {hasValuesData && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Values</h3>
                    {Object.entries(sliderData.values).map(([key, config]) => (
                        <RangeSlider
                            key={`values-${key}`}
                            label={key}
                            config={config}
                            maxDeviation={maxDeviation}
                            min={min}
                            max={max}
                            onChange={handleSliderChange('values', key)}
                        />
                    ))}
                </div>
            )}
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
        ksa: {
            Knowledge: { center: 25, leftPoints: 4, rightPoints: 6 },
            Skills: { center: 50, leftPoints: 6, rightPoints: 8 },
            Ability: { center: 25, leftPoints: 5, rightPoints: 5 },
        },
        values: {
            "Company Value 1": { center: 30, leftPoints: 3, rightPoints: 4 },
            "Company Value 2": { center: 40, leftPoints: 5, rightPoints: 3 },
        },
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
