import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted animate-pulse rounded-md relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "dark:before:via-white/5",
        className
      )}
      {...props}
    />
  )
}

// Skeleton variations for common use cases
function SkeletonText({ lines = 1, className, ...props }: React.ComponentProps<"div"> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && "w-3/4" // Last line is shorter
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("rounded-lg border border-border p-6 space-y-4", className)} {...props}>
      <Skeleton className="h-6 w-3/4" />
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}

function SkeletonAvatar({ size = "md", className, ...props }: React.ComponentProps<"div"> & { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }
  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar }
