export default function LoadingPortal() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-[3px] bg-soft" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-[3px] bg-soft lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-[3px] bg-soft" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-[3px] bg-soft" />
        <div className="h-28 animate-pulse rounded-[3px] bg-soft" />
        <div className="h-28 animate-pulse rounded-[3px] bg-soft" />
      </div>
    </div>
  );
}
