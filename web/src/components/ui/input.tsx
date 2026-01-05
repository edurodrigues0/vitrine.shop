import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  isSuccess?: boolean
  isError?: boolean
  isLoading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", isSuccess, isError, isLoading, disabled, ...props },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        data-state={isSuccess ? "success" : isError ? "error" : undefined}
        data-loading={isLoading ? "true" : undefined}
        disabled={disabled}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input border-input h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[var(--feedback-disabled-opacity)] md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/25 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "data-[state=success]:border-success data-[state=success]:ring-success/20",
          "data-[state=error]:border-destructive data-[state=error]:ring-destructive/30",
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = "Input"

export { Input }
