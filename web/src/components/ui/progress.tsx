"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, label, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
      <div className={cn("w-full", className)} {...props} ref={ref}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {label || "Progresso"}
            </span>
            <span className="text-sm font-medium text-foreground">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label || "Progresso"}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };

