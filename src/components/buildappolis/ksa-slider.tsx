import { cn } from "@/lib/utils";
import React, { useState, useCallback, useRef } from "react";
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

            if (thumb === "left") {
                const minAllowedValue = Math.max(min, center - maxDeviation);
                const maxAllowedValue = center;
                const clampedValue = Math.max(
                    minAllowedValue,
                    Math.min(maxAllowedValue, value)
                );
                const newLeftPoints = center - clampedValue;

                setLeftPoints(newLeftPoints);
                onChange?.({ center, leftPoints: newLeftPoints, rightPoints });
            } else {
                const minAllowedValue = center;
                const maxAllowedValue = Math.min(max, center + maxDeviation);
                const clampedValue = Math.max(
                    minAllowedValue,
                    Math.min(maxAllowedValue, value)
                );
                const newRightPoints = clampedValue - center;

                setRightPoints(newRightPoints);
                onChange?.({ center, leftPoints, rightPoints: newRightPoints });
            }
        },
        [center, leftPoints, rightPoints, min, max, maxDeviation, onChange]
    );

    const handleMouseDown =
        (thumb: "left" | "right") => (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
                moveEvent.preventDefault();
                handleDrag(moveEvent, thumb);
            };

            const handleUp = () => {
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

    const centerPercent = getPositionPercent(center);
    const leftPercent = getPositionPercent(leftValue);
    const rightPercent = getPositionPercent(rightValue);

    const styles = {
        trackBg: `relative h-2 bg-primary rounded-full `,
        headerText: `text-base font-semibold text-gray-700 mb-3`,
        labelCenter: `absolute -top-12 transform -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none`,
        labelBg: `bg-green-500 text-sm font-bold px-4 py-1.5 rounded-lg shadow-md`,
        labelText: `text-sm font-medium text-primary-foreground select-none`,
        thumb: `absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-background rounded-full border-2 border-primary cursor-grab active:cursor-grabbing shadow-lg hover:scale-110 transition-all z-50 select-none`,
        thumbText: `absolute top-4 -translate-x-1/2 text-xs font-medium text-muted-foreground select-none`,
        centerLine: `w-1 h-4 bg-green-500 z-20 pointer-events-none`,
        minMaxLabel: `absolute top-1/2 -translate-y-1/2 text-sm font-medium text-primary-foreground select-none bg-primary min-w-8 text-center rounded`,
        activeRange: `absolute h-full bg-green-500 rounded-full`,
    };

    return (
        <div className="">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <span className={cn(styles.headerText)}>{label}</span>
                <Badge variant="outline" size={'sm'}>
                    {Math.round(((rightValue - leftValue) / (max - min)) * 100)}% Leniency /
                </Badge>
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
                                width: `${rightPercent - leftPercent}%`,
                            }}
                        />
                    </div>

                    {/* Left Thumb */}
                    <div
                        className={cn(styles.thumb)}
                        style={{
                            left: `${leftPercent}%`,
                        }}
                        onMouseDown={handleMouseDown("left")}
                        onTouchStart={handleMouseDown("left")}
                    />

                    {/* Right Thumb */}
                    <div
                        className={cn(styles.thumb)}
                        style={{
                            left: `${rightPercent}%`,
                        }}
                        onMouseDown={handleMouseDown("right")}
                        onTouchStart={handleMouseDown("right")}
                    />

                    {/* Thumb value labels */}
                    <div
                        className={cn(styles.thumbText)}
                        style={{ left: `${leftPercent}%` }}
                    >
                        {leftValue}
                    </div>
                    <div
                        className={cn(styles.thumbText)}
                        style={{ left: `${rightPercent}%` }}
                    >
                        {rightValue}
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
