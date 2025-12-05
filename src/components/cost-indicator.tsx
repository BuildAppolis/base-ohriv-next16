"use client";

/**
 * Cost Indicator Component
 * Displays cost information with color coding and warnings
 */

import { CostBreakdown } from "@/lib/ai/cost-calculator";
import { getCostColors, shouldShowWarning, getCostWarning } from "@/lib/ai/cost-colors";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface CostIndicatorProps {
  cost: CostBreakdown;
  showDetails?: boolean;
  showWarning?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "badge" | "card" | "inline";
}

export function CostIndicator({
  cost,
  showDetails = false,
  showWarning = true,
  size = "md",
  variant = "badge"
}: CostIndicatorProps) {
  const colors = getCostColors(cost.totalCost);
  const needsWarning = shouldShowWarning(cost.totalCost);
  const warning = getCostWarning(cost.totalCost);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const getCostBadgeStyle = () => ({
    backgroundColor: colors.bgColor,
    color: colors.color,
    border: `1px solid ${colors.borderColor}`,
  });

  const formatCost = (amount: number) => `$${amount.toFixed(3)}`;

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <span className={sizeClasses[size]} style={{ color: colors.color }}>
          {colors.icon} {formatCost(cost.totalCost)}
        </span>
        {showDetails && (
          <span className="text-xs text-muted-foreground">
            (In: {formatCost(cost.inputCost)} + Out: {formatCost(cost.outputCost)})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showWarning && needsWarning && warning && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {warning}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="outline"
                className={`${sizeClasses[size]} cursor-help transition-all hover:opacity-80`}
                style={getCostBadgeStyle()}
              >
                <div className="flex items-center gap-1">
                  <span>{colors.icon}</span>
                  <span className="font-medium">{formatCost(cost.totalCost)}</span>
                  <span className="text-xs opacity-75">{cost.currency}</span>
                </div>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1 max-w-xs">
                <div className="font-medium">{colors.label}</div>
                <div className="text-xs text-muted-foreground">{colors.description}</div>
                {cost.cachedCost > 0 && (
                  <div className="text-xs text-green-600">
                    💰 Includes cached tokens: {formatCost(cost.cachedCost)}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Tier: {cost.pricingTier}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showDetails && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 cursor-help">
                    <TrendingUp className="h-3 w-3" />
                    <span>In: {formatCost(cost.inputCost)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Input tokens cost</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 cursor-help">
                    <TrendingDown className="h-3 w-3" />
                    <span>Out: {formatCost(cost.outputCost)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Output tokens cost</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {cost.cachedCost > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 cursor-help text-green-600">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span>Cached: {formatCost(cost.cachedCost)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cached tokens (discounted rate)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for inline usage
export function CompactCostIndicator({ cost }: { cost: CostBreakdown }) {
  const colors = getCostColors(cost.totalCost);
  const formatCost = (amount: number) => `$${amount.toFixed(3)}`;

  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-full border"
      style={{
        backgroundColor: colors.bgColor,
        color: colors.color,
        borderColor: colors.borderColor,
      }}
    >
      {colors.icon} {formatCost(cost.totalCost)}
    </span>
  );
}

// Cost comparison component
interface CostComparisonProps {
  before: CostBreakdown | null;
  after: CostBreakdown;
}

export function CostComparison({ before, after }: CostComparisonProps) {
  const savings = before ? before.totalCost - after.totalCost : 0;
  const isSaving = savings > 0;

  if (!before || savings === 0) {
    return <CostIndicator cost={after} showDetails />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Estimated:</span>
        <CompactCostIndicator cost={before} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Actual:</span>
        <CompactCostIndicator cost={after} />
      </div>
      {isSaving && (
        <div className="flex items-center justify-between text-xs text-green-600 font-medium">
          <span>💰 You saved:</span>
          <span>${savings.toFixed(3)}</span>
        </div>
      )}
    </div>
  );
}