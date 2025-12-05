"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export type ActionsProps = ComponentProps<"div">;

/**
 * Simple inline action group for message/tool controls.
 */
export const Actions = ({ className, ...props }: ActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props} />
);

export type ActionProps = ComponentProps<typeof Button> & {
  label?: string;
  tooltip?: string;
};

export const Action = ({
  label,
  tooltip = label,
  children,
  size = "icon",
  variant = "ghost",
  type = "button",
  ...props
}: ActionProps) => {
  const button = (
    <Button size={size} type={type} variant={variant} {...props}>
      {children}
      {label ? <span className="sr-only">{label}</span> : null}
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
