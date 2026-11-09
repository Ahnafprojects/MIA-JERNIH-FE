import { Calendar, Droplet, TrendingDown } from "lucide-react";
import { liter, rupiah } from "@/lib/format";

function Ubin({
  Ikon,
  judul,
  nilai,
  keterangan,
}: {
  Ikon: typeof TrendingDown;
  judul: string;
  nilai: string;
  keterangan: string;
}) {
  return (
    <div className="permukaan-rata angkat p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100 dark:text-brand-700">
          <Ikon size={16} />
        </span>
        <span className="eyebrow text-muted">{judul}</span>
      </div>
      <p className="tabular mt-3 font-mono text-2xl font-black text-ink">
        {nilai}
      </p>
      <p className="mt-1 text-[11px] text-muted">{keterangan}</p>
    </div>
  );
}

export function KartuPemakaian({
  totalHariIniL,
  totalBulanL,
  targetHarianL,
  biayaBulanRp,
  namaBulan,
}: {
  totalHariIniL: number;
  totalBulanL: number;
  targetHarianL: number;
  biayaBulanRp: number;
  namaBulan: string;
}) {
  return (
    <div className="berjenjang grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Ubin
        Ikon={TrendingDown}
        judul="Pemakaian Hari Ini"
        nilai={liter(totalHariIniL, 1)}
        keterangan={
          targetHarianL > 0
            ? `Rata-rata 7 hari: ${liter(targetHarianL, 0)}`
            : "Belum ada rata-rata"
        }
      />

      {/*
        Angka SUNGGUHAN dari `rentang=bulan`, bukan pemakaian hari ini
        dikalikan 24. Perkalian itu memberi "bulan berjalan" yang berubah
        drastis tiap jam dan tidak pernah cocok dengan tagihan mana pun.
      */}
      <Ubin
        Ikon={Calendar}
        judul="Bulan Berjalan"
        nilai={liter(totalBulanL, 0)}
        keterangan={`${namaBulan} sampai hari ini`}
      />

      <Ubin
        Ikon={Droplet}
        judul="Biaya Bulan Ini"
        nilai={rupiah(biayaBulanRp)}
        keterangan="Rp 7,5 / liter (Gol. Rumah)"
      />
    </div>
  );
}
