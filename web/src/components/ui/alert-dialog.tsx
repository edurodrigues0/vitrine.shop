"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  isConfirmLoading?: boolean;
  confirmLoadingText?: string;
  status?: "idle" | "success" | "error";
  statusMessage?: string;
  autoCloseOnConfirm?: boolean;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
  children,
  isConfirmLoading = false,
  confirmLoadingText,
  status = "idle",
  statusMessage,
  autoCloseOnConfirm = true,
}: AlertDialogProps) {
  if (!open) return null;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (isConfirmLoading) return;
    onConfirm();
    if (autoCloseOnConfirm) {
      onOpenChange(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={handleCancel}
      />
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={cn(
            "bg-background border border-border rounded-lg shadow-lg w-full max-w-md m-4 p-6 pointer-events-auto animate-slide-up",
            className
          )}
          style={{ backgroundColor: 'hsl(var(--background))' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
          {children && <div className="mb-6">{children}</div>}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isConfirmLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              isLoading={isConfirmLoading}
              loadingText={confirmLoadingText ?? confirmText}
              isSuccess={status === "success"}
              isError={status === "error"}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
          {status !== "idle" && statusMessage && (
            <p
              className={cn(
                "mt-4 text-sm",
                status === "error" ? "text-destructive" : "text-success",
              )}
            >
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

