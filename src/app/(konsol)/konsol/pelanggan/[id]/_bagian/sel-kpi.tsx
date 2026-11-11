import { cn } from "@/lib/cn";

export function SelKpi({
  label,
  nilai,
  satuan,
  nada = "netral",
  kaki,
  garisKiri,
}: {
  label: string;
  nilai: string | null;
  satuan: string;
  nada?: "netral" | "brand" | "peringatan" | "bahaya" | "sukses" | "info";
  kaki?: React.ReactNode;
  garisKiri?: boolean;
}) {
  const warna =
    nada === "bahaya"
      ? "text-danger"
      : nada === "peringatan"
        ? "text-warn"
        : nada === "brand"
          ? "text-brand-600"
          : "text-ink";

  return (
    <div
      className={cn(
        "px-4 py-3 sm:py-4",
        garisKiri && "border-t border-line sm:border-t-0 sm:border-l",
      )}
    >
      <dt className="eyebrow text-muted">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-1.5 sm:mt-2">
        <span
          className={cn(
            "tabular font-mono text-[22px] leading-none font-bold sm:text-[26px]",
            nilai === null ? "text-muted" : warna,
          )}
        >
          {nilai ?? "—"}
        </span>
        {nilai === null ? null : (
          <span className="text-[12.5px] font-medium text-muted">{satuan}</span>
        )}
      </dd>
      {kaki ? (
        <div className="mt-1.5 text-[12px] text-muted">{kaki}</div>
      ) : null}
    </div>
  );
}
