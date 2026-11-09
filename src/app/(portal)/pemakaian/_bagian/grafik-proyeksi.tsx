import { GrafikGaris } from "@/components/domain/grafik";
import { liter } from "@/lib/format";
import { AMBANG_ALARM_L } from "../_konstanta";
import type { ProyeksiSaldo } from "../_tipe";

/**
 * Proyeksi saldo sebagai GRAFIK GARIS yang menurun sampai nol.
 *
 * Sempat diganti deretan tabung air agar seragam dengan grafik riwayat, dan
 * pemilik repo menolaknya: bentuk garis sudah benar untuk besaran yang
 * menyusut terus-menerus. Jangan diganti lagi.
 */
export function GrafikProyeksi({
  proyeksiSaldo,
  sisaHariProyeksi,
  rataRataHarianL,
}: {
  proyeksiSaldo: ProyeksiSaldo | null;
  sisaHariProyeksi: number | null;
  rataRataHarianL: number;
}) {
  return (
    <div className="permukaan p-6 lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Proyeksi Saldo Air
          </h2>
          <p className="text-xs text-muted">
            Perkiraan sisa saldo bila pemakaian harian tidak berubah.
          </p>
        </div>
        {proyeksiSaldo ? (
          <span className="cekung px-3 py-1.5 font-mono text-xs font-bold whitespace-nowrap text-ink">
            {/* Memakai `sisaHariProyeksi`, angka yang SAMA dengan kartu
                "Perkiraan Saldo Habis" di atasnya. Menghitungnya sendiri di
                sini menghasilkan selisih satu hari (bulat ke atas vs
                pembulatan biasa), dan dua angka berbeda untuk hal yang sama,
                bersebelahan di satu layar, membatalkan kepercayaan pada
                keduanya. */}
            Habis ± {sisaHariProyeksi} hari
          </span>
        ) : null}
      </div>

      {proyeksiSaldo ? (
        <>
          {/*
            Ambang 5 L digambar sebagai garis, bukan ditulis di catatan kaki.
            Di titik itulah firmware mulai berbunyi tiap 10 detik — kejadian
            yang dialami warga JAUH sebelum saldonya benar-benar nol, dan
            satu-satunya bagian grafik ini yang berbunyi.
          */}
          <GrafikGaris
            labels={proyeksiSaldo.labels}
            deret={proyeksiSaldo.deret}
            tinggi={210}
            ambang={AMBANG_ALARM_L}
            labelAmbang={`Alarm meter mulai berbunyi (${liter(AMBANG_ALARM_L, 0)})`}
            format={(n) => liter(n, 0)}
          />

          <p className="mt-2 text-[11px] text-muted">
            Dihitung dari rata-rata {liter(rataRataHarianL, 1)} per hari
            {proyeksiSaldo.langkah > 1
              ? `, satu titik tiap ${proyeksiSaldo.langkah} hari`
              : ""}
            . Perkiraan, bukan jaminan — pemakaian yang berubah mengubah
            garisnya.
          </p>
        </>
      ) : (
        <div className="cekung grid h-[210px] place-items-center p-6 text-center">
          <p className="max-w-sm text-sm text-muted">
            Belum bisa diproyeksikan: saldo Anda nol, atau riwayat pemakaiannya
            belum cukup untuk membentuk rata-rata harian.
          </p>
        </div>
      )}
    </div>
  );
}
