import { Skeleton } from "@/components/ui/keadaan";

export function RangkaPanel({ tinggi = "h-44" }: { tinggi?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className={`mt-4 w-full ${tinggi}`} />
    </div>
  );
}
