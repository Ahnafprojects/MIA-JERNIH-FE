import { cn } from "@/lib/cn";

/**
 * Kartu dipisah oleh GARIS, bukan bayangan — bayangan hanya untuk elemen yang
 * benar-benar melayang (dialog, sheet, toast). Konsisten begini membuat
 * halaman padat data tetap tenang dibaca.
 */
export function Card({
  className,
  children,
  ...sisa
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface",
        className,
      )}
      {...sisa}
    >
      {children}
    </div>
  );
}

export function Panel({
  judul,
  sub,
  aksi,
  className,
  isiClassName,
  children,
}: {
  judul?: React.ReactNode;
  sub?: React.ReactNode;
  aksi?: React.ReactNode;
  className?: string;
  isiClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {judul ? (
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-bold tracking-tight">
              {judul}
            </h2>
            {sub ? (
              <p className="mt-0.5 text-[13px] text-muted">{sub}</p>
            ) : null}
          </div>
          {aksi ? <div className="shrink-0">{aksi}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-5", isiClassName)}>{children}</div>
    </Card>
  );
}
