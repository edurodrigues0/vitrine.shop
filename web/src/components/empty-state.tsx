"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "p-8",
      icon: "h-10 w-10",
      iconContainer: "p-3",
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "p-12",
      icon: "h-12 w-12",
      iconContainer: "p-4",
      title: "text-xl",
      description: "text-base",
    },
    lg: {
      container: "p-16",
      icon: "h-16 w-16",
      iconContainer: "p-6",
      title: "text-2xl",
      description: "text-lg",
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card className={cn(classes.container, "text-center", className)}>
      <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
        <div className={cn(
          "rounded-full bg-muted mb-4 transition-all hover:scale-110",
          classes.iconContainer
        )}>
          <Icon className={cn("text-muted-foreground", classes.icon)} />
        </div>
        <h3 className={cn("font-semibold mb-2 text-foreground", classes.title)}>
          {title}
        </h3>
        <p className={cn("text-muted-foreground mb-6 max-w-md leading-relaxed", classes.description)}>
          {description}
        </p>
        {action && (
          <Button
            variant={action.variant || "default"}
            onClick={action.onClick}
            className="hovelift"
          >
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}

