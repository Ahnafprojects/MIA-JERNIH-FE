import { Skeleton } from "@/components/ui/keadaan";

export function RangkaDetail() {
  return (
    <div className="mt-6 space-y-5">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
