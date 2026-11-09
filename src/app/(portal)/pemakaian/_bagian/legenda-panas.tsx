export function LegendaPanas() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 text-xs text-muted">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ink">Skala Volume:</span>
        <div className="flex items-center gap-1">
          <span className="size-3.5 rounded-[2px] border border-line/40 bg-surface" />
          <span>0 L</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-3.5 rounded-[2px] border border-brand-500/20 bg-brand-500/15" />
          <span>&lt; 5 L</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-3.5 rounded-[2px] border border-brand-500/40 bg-brand-500/35" />
          <span>5–15 L</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-3.5 rounded-[2px] border border-brand-500/70 bg-brand-500/65" />
          <span>15–30 L</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="size-3.5 rounded-[2px] border border-brand-600 bg-brand-600" />
          <span>&gt; 30 L</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <span className="size-3.5 rounded-[2px] border border-dashed border-line/50 bg-soft/40" />
          <span>Belum ada data</span>
        </div>
      </div>

      <span className="font-mono text-[11px]">Sensor ESP32 JM-200</span>
    </div>
  );
}
