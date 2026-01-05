import { toast } from "sonner";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const SUCCESS_DURATION = 4000;
const INFO_DURATION = 4500;
const ERROR_DURATION = 6000;

export function showSuccess(message: string, options?: ToastOptions) {
  toast.success(message, {
    duration: options?.duration ?? SUCCESS_DURATION,
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
}

export function showError(message: string, options?: ToastOptions) {
  toast.error(message, {
    duration: options?.duration ?? ERROR_DURATION,
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
}

export function showInfo(message: string, options?: ToastOptions) {
  toast(message, {
    duration: options?.duration ?? INFO_DURATION,
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  });
}
