"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive";
  };
  className?: string;
}

export function ErrorState({
  title = "Erro ao carregar",
  description,
  icon: Icon = AlertCircle,
  action,
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn("p-12 text-center", className)}>
      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="p-4 rounded-full bg-destructive/10 mb-4 animate-in fade-in zoom-in-95 duration-200">
          <Icon className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        {action && (
          <Button
            variant={action.variant || "default"}
            onClick={action.onClick}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}

