import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-[var(--feedback-disabled-opacity)] disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.97] hover:shadow-md active:shadow-sm data-[state=success]:bg-success data-[state=success]:text-success-foreground data-[state=success]:hover:bg-success/90 data-[state=error]:bg-destructive data-[state=error]:text-destructive-foreground data-[state=error]:hover:bg-destructive/90 data-[loading=true]:cursor-progress",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 hover:shadow-lg active:bg-primary/95 dark:active:bg-primary/75 border border-primary/20 dark:border-primary/30 hover:border-primary/30 dark:hover:border-primary/40",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 dark:hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 active:bg-destructive/95 hover:shadow-lg border border-destructive/20 dark:border-destructive/30 hover:border-destructive/30 dark:hover:border-destructive/40",
        outline:
          "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-border hover:shadow-md dark:bg-input dark:border-input dark:hover:bg-accent dark:hover:border-border/60 active:bg-accent/90 dark:active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:hover:bg-secondary/70 hover:shadow-md active:bg-secondary/90 border border-border/50 dark:border-border/40 hover:border-border/70 dark:hover:border-border/60",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80 dark:hover:text-accent-foreground active:bg-accent/70 hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 dark:hover:text-primary/90 active:text-primary/70 shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 min-w-fit",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 min-w-fit",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 min-w-fit",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Exibe spinner e desabilita interações */
    isLoading?: boolean
    /** Texto alternativo enquanto carrega */
    loadingText?: React.ReactNode
    /** Ícone customizado para loading */
    loadingIcon?: React.ReactNode
    /** Estado visual de sucesso */
    isSuccess?: boolean
    /** Estado visual de erro */
    isError?: boolean
    /** Ícone opcional fixo */
    icon?: React.ReactNode
    iconPosition?: "left" | "right"
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      loadingIcon,
      isSuccess = false,
      isError = false,
      icon,
      iconPosition = "left",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"

    const resolvedLabel = isLoading
      ? loadingText ?? children
      : children

    const state = isSuccess ? "success" : isError ? "error" : undefined

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-loading={isLoading ? "true" : undefined}
        data-state={state}
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant, size, className }),
          isLoading && "gap-2",
        )}
        {...props}
      >
        <span className="inline-flex items-center justify-center gap-2 flex-nowrap">
          {isLoading && (loadingIcon ?? <Loader2 className="h-4 w-4 animate-spin shrink-0" />)}
          {!isLoading && icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
          <span className="inline-flex items-center gap-2 whitespace-nowrap">{resolvedLabel}</span>
          {!isLoading && icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
          {!isLoading && isSuccess && (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          {!isLoading && isError && (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
        </span>
      </Comp>
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants }
