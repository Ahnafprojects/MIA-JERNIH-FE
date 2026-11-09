export const KATEGORI_GANGGUAN = [
  { id: "air keruh/berbau", label: "Air Keruh / Berbau", sla: "SLA: 24 Jam" },
  { id: "kebocoran pipa", label: "Kebocoran Pipa Distribusi", sla: "SLA: 6 Jam" },
  { id: "air tidak mengalir", label: "Air Tidak Mengalir", sla: "SLA: 12 Jam" },
  { id: "meter/keypad rusak", label: "Meter atau Keypad Rusak", sla: "SLA: 48 Jam" },
  { id: "tekanan lemah", label: "Tekanan Air Lemah", sla: "SLA: 24 Jam" },
  { id: "lainnya", label: "Kendala Lainnya", sla: "SLA: 72 Jam" },
];

export function PilihKategori({
  kategori,
  setKategori,
}: {
  kategori: string;
  setKategori: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-ink">Kategori Masalah</label>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {KATEGORI_GANGGUAN.map((k) => {
          const aktif = kategori === k.id;
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => setKategori(k.id)}
              className={`flex flex-col items-start rounded-[3px] border p-3 text-left transition-colors ${
                aktif
                  ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                  : "border-line bg-surface hover:bg-soft"
              }`}
            >
              <span className="text-xs font-bold text-ink">{k.label}</span>
              <span className="font-mono text-[10px] font-semibold text-brand-700 dark:text-accent">
                {k.sla}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
