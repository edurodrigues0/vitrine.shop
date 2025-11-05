import { Card } from "@/components/ui/card";

export function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-48 bg-muted animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-full" />
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-10 bg-muted rounded animate-pulse w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-full" />
        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
        <div className="h-10 bg-muted rounded animate-pulse w-full" />
      </div>
    </Card>
  );
}

export function SkeletonStoreCard() {
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-muted rounded animate-pulse w-2/3" />
        <div className="h-4 bg-muted rounded animate-pulse w-full" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-10 bg-muted rounded animate-pulse w-full" />
      </div>
    </Card>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-muted rounded animate-pulse ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

