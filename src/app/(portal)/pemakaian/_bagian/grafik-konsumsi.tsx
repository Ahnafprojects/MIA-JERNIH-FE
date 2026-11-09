import { Info } from "lucide-react";
import { GrafikAir } from "@/components/domain/grafik-air";
import { liter } from "@/lib/format";
import { JANGKAUAN_HARI } from "../_konstanta";
import type { JangkauanData, ModeGrafik, TitikGrafik } from "../_tipe";

const MODE: ReadonlyArray<readonly [ModeGrafik, string]> = [
  ["bulan", "Bulan"],
  ["tahun", "Tahun"],
  ["pilih", "Pilih sendiri"],
];

const KETERANGAN: Record<ModeGrafik, string> = {
  bulan: "Total tiap hari sepanjang riwayat yang tersimpan server.",
  tahun: "Total tiap bulan — dibatasi riwayat yang tersimpan server.",
  pilih: "Total tiap hari pada rentang yang Anda pilih.",
};

const tanggalPanjang = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * Riwayat konsumsi — SATU-SATUNYA tempat tabung air di halaman ini.
 *
 * Proyeksi saldo dan peta panas sempat ikut diubah jadi tabung agar seragam,
 * dan pemilik repo menolak keduanya. Yang diminta berubah hanya grafik ini.
 */
export function GrafikKonsumsi({
  memuat,
  modeGrafik,
  setModeGrafik,
  mulaiPilih,
  setMulaiPilih,
  akhirPilih,
  setAkhirPilih,
  jangkauanData,
  dataGrafik,
}: {
  memuat: boolean;
  modeGrafik: ModeGrafik;
  setModeGrafik: (m: ModeGrafik) => void;
  mulaiPilih: string;
  setMulaiPilih: (v: string) => void;
  akhirPilih: string;
  setAkhirPilih: (v: string) => void;
  jangkauanData: JangkauanData | null;
  dataGrafik: TitikGrafik[];
}) {
  return (
    <div className="permukaan p-6">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Riwayat Konsumsi
          </h2>
          <p className="text-xs text-muted">{KETERANGAN[modeGrafik]}</p>
        </div>

        {/* Alurnya CEKUNG, bidak aktif TIMBUL di dalamnya — bentuk sakelar
            sungguhan, dan satu-satunya bentuk yang memberi tahu sisi mana
            yang menyala tanpa bergantung pada warna. */}
        <div className="cekung flex shrink-0 p-1">
          {MODE.map(([nilai, teks]) => (
            <button
              key={nilai}
              type="button"
              onClick={() => setModeGrafik(nilai)}
              aria-pressed={modeGrafik === nilai}
              className={`rounded-[7px] px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                modeGrafik === nilai
                  ? "bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              {teks}
            </button>
          ))}
        </div>
      </div>

      {/*
        Kolom tanggal hanya digambar pada mode "pilih sendiri".
        `min`/`max` diikat ke rentang data yang BENAR-BENAR ada, jadi tanggal
        di luar jangkauan tidak bisa dipilih sejak awal — mencegahnya lebih
        baik daripada menjelaskan kekosongan sesudahnya.
      */}
      {modeGrafik === "pilih" ? (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted">
              Dari tanggal
            </span>
            <input
              type="date"
              value={mulaiPilih}
              min={jangkauanData?.mulai}
              max={jangkauanData?.akhir}
              onChange={(e) => setMulaiPilih(e.target.value)}
              className="cekung bg-surface-2 px-3 py-2 font-mono text-xs text-ink outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-muted">
              Sampai tanggal
            </span>
            <input
              type="date"
              value={akhirPilih}
              /* Batas bawahnya mengikuti kolom pertama: rentang terbalik
                 tidak bisa dibentuk sejak awal, alih-alih dibentuk lalu
                 dijawab kosong. */
              min={mulaiPilih || jangkauanData?.mulai}
              max={jangkauanData?.akhir}
              onChange={(e) => setAkhirPilih(e.target.value)}
              className="cekung bg-surface-2 px-3 py-2 font-mono text-xs text-ink outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </label>

          {jangkauanData ? (
            <p className="pb-2 text-[11px] text-muted">
              Riwayat tersedia{" "}
              <strong className="font-mono text-ink">
                {tanggalPanjang(jangkauanData.mulai)}
              </strong>{" "}
              s/d{" "}
              <strong className="font-mono text-ink">
                {tanggalPanjang(jangkauanData.akhir)}
              </strong>
              .
            </p>
          ) : null}
        </div>
      ) : null}

      {/*
        Keterangan jujur soal batas server — hanya pada mode "Tahun", karena
        di situlah selisih antara yang DIMINTA dan yang BISA diberikan paling
        besar. Warga yang menekan "Tahun" lalu melihat satu kolom berhak tahu
        kenapa, alih-alih menyangka meternya rusak.
      */}
      {modeGrafik === "tahun" && dataGrafik.length > 0 ? (
        <p className="mb-4 flex items-start gap-2 rounded-[8px] bg-warn-soft px-3 py-2 text-[11px] leading-relaxed text-warn">
          <Info size={13} className="mt-px shrink-0" />
          <span>
            Server menyimpan rekaman per jam hanya {JANGKAUAN_HARI} hari
            terakhir, jadi tampilan tahunan ini belum bisa menampilkan dua
            belas bulan penuh. Yang tergambar adalah bulan yang benar-benar
            punya rekaman.
          </span>
        </p>
      ) : null}

      {memuat ? (
        <div className="cekung h-60 animate-pulse" />
      ) : dataGrafik.length === 0 ? (
        <div className="cekung grid h-60 place-items-center p-6 text-center">
          {/* Tiga sebab kosong yang BERBEDA, dan masing-masing menuntut
              tindakan berbeda dari warga. Satu kalimat seragam untuk
              ketiganya membuat dua di antaranya terbaca seperti kerusakan. */}
          <p className="max-w-sm text-sm text-muted">
            {modeGrafik === "pilih" && (!mulaiPilih || !akhirPilih)
              ? "Pilih tanggal mulai dan tanggal akhir untuk menggambar grafiknya."
              : modeGrafik === "pilih"
                ? "Tidak ada rekaman pemakaian pada rentang tanggal itu. Coba rentang di dalam riwayat yang tersedia."
                : "Meter belum mengirim rekaman pemakaian, jadi belum ada pola yang bisa digambar."}
          </p>
        </div>
      ) : (
        /*
          Lebar MINIMUM mengikuti JUMLAH KOLOM, bukan mode.
          Tiga puluh hari pada 390px hanya kebagian ~11px per tabung dan
          angkanya saling menindih, jadi penggulir mendatar lebih baik
          daripada angka bertumpuk.

          Lebar MAKSIMUM sengaja TIDAK dipasang. Tabungnya sudah dibatasi
          `max-w-[4.5rem]` di dalam `GrafikAir` sementara kolomnya tetap
          `flex-1`, jadi sisa ruang menjadi jarak merata antar tabung.
          Membungkusnya dengan `mx-auto max-w-[44rem]` justru membuat
          grafiknya menggerombol di tengah dan menyisakan pita kosong di
          samping — keluhan yang baru saja diperbaiki.
        */
        <div className="overflow-x-auto pb-1">
          <div className={dataGrafik.length > 12 ? "min-w-[52rem]" : ""}>
            <GrafikAir
              data={dataGrafik}
              tinggi={230}
              format={(n) => liter(n, 0)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
