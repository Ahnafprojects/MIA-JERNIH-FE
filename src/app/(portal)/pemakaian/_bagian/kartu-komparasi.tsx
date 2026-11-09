import { TrendingDown, TrendingUp } from "lucide-react";
import { liter } from "@/lib/format";
import { RATA_ZONA_L_HARI } from "../_konstanta";

/**
 * Perbandingan pemakaian warga dengan rata-rata zonanya.
 *
 * Arah perbandingannya DIHITUNG dari kedua angka yang ditampilkan, bukan
 * ditulis mati. Versi sebelumnya memaksakan "18% lebih hemat" sambil
 * mencetak "Rata-rata zona 48,2 L/hari · Penggunaan Anda 130,0 L/hari"
 * tepat di bawahnya — kartu yang membantah dirinya sendiri dalam dua baris
 * berturut-turut. Warga yang membaca keduanya berhenti memercayai angka
 * mana pun di halaman ini, dan itu kerugian yang jauh lebih besar daripada
 * satu pujian yang hilang.
 *
 * Rata-rata zonanya sendiri masih nilai tetap: tidak ada endpoint yang
 * mengirimnya. Yang diperbaiki di sini bukan sumber datanya, melainkan
 * kesimpulan yang ditarik darinya.
 */
export function KartuKomparasi({
  lebihBoros,
  selisihZonaPersen,
  rataRataHarianL,
}: {
  lebihBoros: boolean;
  selisihZonaPersen: number;
  rataRataHarianL: number;
}) {
  return (
    <div className="permukaan p-5">
      <div className="flex items-center gap-2">
        <span
          className={`grid size-7 place-items-center rounded-[8px] ${
            lebihBoros ? "bg-warn/10 text-warn" : "bg-success/10 text-success"
          }`}
        >
          {lebihBoros ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </span>
        <h2 className="text-sm font-bold text-ink">
          Dibanding Rumah Tangga Sezona
        </h2>
      </div>
      <div className="mt-3">
        {rataRataHarianL > 0 ? (
          <p className="text-base font-medium text-ink">
            Konsumsi rumah Anda{" "}
            <strong
              className={`font-mono text-lg font-bold ${
                lebihBoros ? "text-warn" : "text-success"
              }`}
            >
              {selisihZonaPersen}% lebih {lebihBoros ? "boros" : "hemat"}
            </strong>{" "}
            daripada rata-rata pelanggan golongan serupa di zona Anda.
          </p>
        ) : (
          <p className="text-base font-medium text-muted">
            Belum ada rata-rata harian Anda untuk dibandingkan dengan zona.
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-muted">
          Rata-rata zona: {liter(RATA_ZONA_L_HARI, 1)}/hari &middot; Penggunaan
          Anda: {liter(rataRataHarianL, 1)}/hari
        </p>
      </div>
    </div>
  );
}
