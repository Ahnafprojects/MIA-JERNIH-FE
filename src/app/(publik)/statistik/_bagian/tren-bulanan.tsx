"use client";

import { Badge } from "@/components/ui/badge";
import { GrafikGaris } from "@/components/domain/grafik";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import { JudulSeksi } from "./judul-seksi";
import type { TitikBulanan, TolokUkur } from "./tipe";

/**
 * Kehilangan air bulan demi bulan, dua belas bulan terakhir.
 *
 * Tombol 7/30/90 hari menjawab "sekarang di posisi mana". Tidak satu pun di
 * antaranya menjawab "arahnya ke mana" — dan melacak layanan publik berarti
 * melihat arah, bukan cuma posisi. Angka 19% yang turun dari 24% adalah
 * kabar yang sama sekali berbeda dari 19% yang naik dari 15%.
 *
 * Deret ini SENGAJA tidak ikut berubah saat rentang di atas diganti: arah
 * setahun bukan sesuatu yang berubah karena seseorang menekan tombol 7 hari.
 */
export function SeksiTrenBulanan({
  bulanan,
  tolokUkur,
  memuat,
  galat,
  onCoba,
}: {
  bulanan: TitikBulanan[];
  tolokUkur: TolokUkur[];
  memuat: boolean;
  galat: string | null;
  onCoba: () => void;
}) {
  const target = tolokUkur.find((t) => t.kunci === "target")?.nilaiPct ?? null;

  const nilai = bulanan.map((b) => b.nrwPct);
  const awal = nilai[0] ?? null;
  const akhir = nilai[nilai.length - 1] ?? null;
  const selisih =
    awal !== null && akhir !== null ? Math.round((akhir - awal) * 10) / 10 : null;

  /** Berapa bulan BERUNTUN terakhir yang sudah berada di bawah target. */
  let beruntun = 0;
  if (target !== null) {
    for (let i = nilai.length - 1; i >= 0 && nilai[i] <= target; i -= 1) {
      beruntun += 1;
    }
  }

  /*
   * Sumbu dipatok ke kisaran datanya, bukan ke nol. Kehilangan air bergerak
   * di pita 19–24%; dengan sumbu 0–100 seluruh garis terjepit di seperempat
   * bawah dan terbaca datar — justru menyembunyikan penurunan yang ingin
   * ditunjukkan. Garis target tetap digambar, jadi pembaca selalu punya
   * patokan dan tahu sumbunya tidak dimulai dari nol.
   */
  const terendah = nilai.length > 0 ? Math.min(...nilai) : 0;
  const tertinggi = nilai.length > 0 ? Math.max(...nilai) : 0;
  const domain: [number, number] = [
    Math.floor(Math.min(terendah - 1, (target ?? terendah) - 1)),
    Math.ceil(Math.max(tertinggi + 1, (target ?? tertinggi) + 1)),
  ];

  return (
    <section className="mt-12">
      <JudulSeksi judul="Arahnya setahun terakhir">
        Dua belas bulan terakhir, satu titik per bulan. Rentang 7, 30, dan 90
        hari di atas menunjukkan posisi; bagian ini menunjukkan arah — dan
        arah yang keliru pada angka yang terlihat baik adalah hal yang paling
        mudah luput.
      </JudulSeksi>

      {galat ? (
        <div className="mt-5 rounded-card border border-line bg-surface">
          <KeadaanGalat pesan={galat} onCoba={onCoba} />
        </div>
      ) : memuat ? (
        <Skeleton className="mt-6 h-64 w-full" />
      ) : (
        <>
          {selisih !== null ? (
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Badge nada={selisih <= 0 ? "sukses" : "bahaya"} titik>
                {selisih === 0
                  ? "Tidak berubah dalam 12 bulan"
                  : `${selisih < 0 ? "Turun" : "Naik"} ${angka(Math.abs(selisih), 1)} poin dalam 12 bulan`}
              </Badge>
              {target !== null ? (
                <Badge nada={beruntun > 0 ? "sukses" : "peringatan"}>
                  {beruntun > 0
                    ? `${beruntun} bulan terakhir di bawah target ${angka(target, 0)}%`
                    : `Belum menyentuh target ${angka(target, 0)}%`}
                </Badge>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6">
            <GrafikGaris
              labels={bulanan.map((b) => b.label)}
              deret={[
                { name: "Kehilangan air bulanan", unit: "%", points: nilai },
              ]}
              domain={domain}
              ambang={target ?? undefined}
              labelAmbang={
                target === null ? undefined : `Target ${angka(target, 0)}%`
              }
              format={(n) => `${angka(n, 1)}%`}
              formatSumbu={(n) => `${angka(n, 0)}%`}
              tinggi={248}
            />
          </div>

          <p className="mt-4 max-w-[62ch] text-[12.5px] leading-relaxed text-muted">
            Sumbu tegak sengaja tidak dimulai dari nol — kehilangan air
            bergerak di pita sempit, dan sumbu penuh akan membuat seluruh
            garis terbaca datar. Garis putus-putus adalah target yang jadi
            patokannya.
          </p>
        </>
      )}
    </section>
  );
}
