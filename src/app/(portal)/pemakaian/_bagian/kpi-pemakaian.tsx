import { Calendar, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { liter, rupiah } from "@/lib/format";
import { RATA_ZONA_L_HARI, TARIF_PER_LITER } from "../_konstanta";
import type { RingkasanKpi } from "../_tipe";

export function KpiPemakaian({ kpi }: { kpi: RingkasanKpi }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="permukaan p-4">
        <div className="flex items-center justify-between text-muted">
          <span className="eyebrow">Hari Ini</span>
          <Clock size={14} />
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
          {liter(kpi.hariIniL, 1)}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Biaya:{" "}
          <strong className="font-mono text-ink">
            {rupiah(kpi.hariIniL * TARIF_PER_LITER)}
          </strong>
        </p>
      </div>

      <div className="permukaan p-4">
        <div className="flex items-center justify-between text-muted">
          <span className="eyebrow">7 Hari Terakhir</span>
          <Calendar size={14} />
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
          {liter(kpi.mingguIniL, 0)}
        </p>
        <p className="mt-1 text-[11px] text-muted">Akumulasi 1 minggu</p>
      </div>

      <div className="permukaan p-4">
        <div className="flex items-center justify-between text-muted">
          <span className="eyebrow">Bulan Berjalan</span>
          <TrendingUp size={14} />
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
          {liter(kpi.bulanIniL, 0)}
        </p>
        {/* "Terjumlah", bukan "Proyeksi 30 hari": angkanya kini benar-benar
            dijumlahkan dari tanggal yang jatuh di bulan ini, bukan rata-rata
            dikali tiga puluh. Label lamanya menjanjikan ramalan untuk angka
            yang sebenarnya catatan. */}
        <p className="mt-1 text-[11px] text-muted">Terjumlah bulan ini</p>
      </div>

      <div className="permukaan p-4">
        <div className="flex items-center justify-between text-muted">
          <span className="eyebrow">Rata-rata Harian</span>
          <TrendingDown size={14} />
        </div>
        <p className="tabular mt-2 font-mono text-2xl font-black text-ink sm:text-3xl">
          {liter(kpi.rataRataHarianL, 1)}
        </p>
        {/*
          Dibandingkan dengan rata-rata ZONA, bukan "baku mutu 50 L/hari".
          Angka 50 itu tidak berasal dari mana pun — bukan dari server, bukan
          dari standar yang dirujuk — dan ia muncul tepat di sebelah rata-rata
          asli warga yang 130 L. Membaca keduanya berdampingan, satu-satunya
          kesimpulan yang bisa ditarik adalah "saya melanggar baku mutu",
          padahal tidak ada baku mutu yang sedang diukur.
        */}
        <p className="mt-1 text-[11px] text-muted">
          Rata-rata zona: {liter(RATA_ZONA_L_HARI, 1)} / hari
        </p>
      </div>
    </div>
  );
}
