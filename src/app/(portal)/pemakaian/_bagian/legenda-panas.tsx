/** Lima tingkat skala warna peta panas, plus satu keadaan "belum ada data". */
const TINGKAT = [
  { kelas: "border-line/40 bg-surface", teks: "0 L" },
  { kelas: "border-brand-500/20 bg-brand-500/15", teks: "< 5 L" },
  { kelas: "border-brand-500/40 bg-brand-500/35", teks: "5–15 L" },
  { kelas: "border-brand-500/70 bg-brand-500/65", teks: "15–30 L" },
  { kelas: "border-brand-600 bg-brand-600", teks: "> 30 L" },
];

export function LegendaPanas() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 text-xs text-muted">
      {/* `flex-wrap` pada deretan tingkatnya: enam penanda berdampingan tidak
          muat pada 390px, dan tanpa pembungkusan ia mendorong seluruh kartu
          melebar sehingga halamannya ikut bisa digulir mendatar. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-semibold text-ink">Skala Volume:</span>
        {TINGKAT.map(({ kelas, teks }) => (
          <div key={teks} className="flex items-center gap-1">
            <span className={`size-3.5 rounded-[8px] border ${kelas}`} />
            <span>{teks}</span>
          </div>
        ))}
        <div className="ml-2 flex items-center gap-1">
          <span className="size-3.5 rounded-[8px] border border-dashed border-line/50 bg-soft/40" />
          <span>Belum ada data</span>
        </div>
      </div>

      <span className="font-mono text-[11px]">Sensor ESP32 JM-200</span>
    </div>
  );
}
