"use client";

import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  value?: string;
  maxLength?: number;
  tooltip?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, name, error, value, maxLength, tooltip, description, required, children, className }, ref) => {
    const hasValue = value !== undefined && value !== "";
    const isValid = hasValue && !error;
    const showCounter = maxLength !== undefined && hasValue;

    return (
      <Field ref={ref} className={className}>
        <div className="flex items-center gap-2 mb-1.5">
          <FieldLabel htmlFor={name}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FieldLabel>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="relative">
          {children}
          {isValid && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600 dark:text-green-400 pointer-events-none" />
          )}
          {error && (
            <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
          )}
        </div>
        {description && !error && (
          <FieldDescription>{description}</FieldDescription>
        )}
        {error && (
          <FieldError>{error}</FieldError>
        )}
        {showCounter && (
          <p className="text-xs text-muted-foreground mt-1">
            {value.length}/{maxLength} caracteres
          </p>
        )}
      </Field>
    );
  }
);
FormField.displayName = "FormField";

