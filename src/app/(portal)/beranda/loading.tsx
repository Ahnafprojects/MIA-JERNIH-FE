export default function LoadingBeranda() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header skeleton */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded-[2px] bg-soft" />
          <div className="h-8 w-56 animate-pulse rounded-[3px] bg-soft" />
          <div className="h-3 w-40 animate-pulse rounded-[2px] bg-soft" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-[3px] bg-soft" />
          <div className="h-9 w-28 animate-pulse rounded-[3px] bg-soft" />
        </div>
      </div>

      {/* Grid utama */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom kiri: Saldo & Grafik */}
        <div className="space-y-6 lg:col-span-2">
          <div className="h-56 animate-pulse rounded-[4px] border border-line bg-surface p-6" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-28 animate-pulse rounded-[3px] border border-line bg-surface p-4" />
            <div className="h-28 animate-pulse rounded-[3px] border border-line bg-surface p-4" />
            <div className="h-28 animate-pulse rounded-[3px] border border-line bg-surface p-4" />
          </div>
          <div className="h-64 animate-pulse rounded-[4px] border border-line bg-surface p-6" />
        </div>

        {/* Kolom kanan: LCD & Token cepat */}
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-[4px] border border-line bg-surface p-5" />
          <div className="h-64 animate-pulse rounded-[4px] border border-line bg-surface p-5" />
          <div className="h-20 animate-pulse rounded-[4px] border border-line bg-surface p-4" />
        </div>
      </div>
    </div>
  );
}
