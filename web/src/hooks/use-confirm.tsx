"use client";

import { useState, useCallback } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
  }>({
    isOpen: false,
    options: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState({
      isOpen: true,
      options,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmState.options) return;

    setIsLoading(true);
    try {
      await confirmState.options.onConfirm();
      setConfirmState({ isOpen: false, options: null });
    } catch (error) {
      console.error("Error in confirm action:", error);
    } finally {
      setIsLoading(false);
    }
  }, [confirmState.options]);

  const handleCancel = useCallback(() => {
    confirmState.options?.onCancel?.();
    setConfirmState({ isOpen: false, options: null });
    setIsLoading(false);
  }, [confirmState.options]);

  const ConfirmDialogComponent = confirmState.options ? (
    <AlertDialog
      open={confirmState.isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={confirmState.options.title}
      description={confirmState.options.description}
      confirmText={confirmState.options.confirmText || "Confirmar"}
      cancelText={confirmState.options.cancelText || "Cancelar"}
      variant={confirmState.options.variant || "default"}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      isConfirmLoading={isLoading}
    />
  ) : null;

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}

