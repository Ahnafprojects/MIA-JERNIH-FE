import { Search } from "lucide-react";

/**
 * Nilai status HARUS sama persis dengan enum `StatusTransaksi` di backend
 * (`prisma/schema.prisma`): MENUNGGU, LUNAS, GAGAL, KEDALUWARSA.
 *
 * Sebelumnya daftar ini memuat "DIBATALKAN" yang tidak pernah dikirim backend,
 * sekaligus melewatkan "GAGAL" yang benar-benar dikirim. Akibatnya transaksi
 * yang gagal tampil sebagai lencana kelabu bertuliskan nama enum mentah, dan
 * warga tidak punya cara menyaringnya.
 */
const LABEL_FILTER = [
  { nilai: "SEMUA", label: "Semua Transaksi" },
  { nilai: "LUNAS", label: "Lunas" },
  { nilai: "MENUNGGU", label: "Menunggu" },
  { nilai: "GAGAL", label: "Gagal" },
  { nilai: "KEDALUWARSA", label: "Kedaluwarsa" },
] as const;

export function FilterRiwayat({
  filterStatus,
  setFilterStatus,
  setHalaman,
  kataKunci,
  setKataKunci,
}: {
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  setHalaman: (v: number) => void;
  kataKunci: string;
  setKataKunci: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-muted">Status:</span>
        {LABEL_FILTER.map(({ nilai: st, label }) => (
          <button
            key={st}
            type="button"
            onClick={() => {
              setFilterStatus(st);
              setHalaman(1);
            }}
            className={`rounded-[3px] px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterStatus === st
                ? "bg-brand-600 text-white"
                : "border border-line bg-soft text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-64">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Cari invoice atau meter..."
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
          className="h-9 w-full rounded-[3px] border border-line bg-canvas pl-9 pr-3 font-mono text-xs text-ink outline-none focus:border-brand-500"
        />
      </div>
    </div>
  );
}
