"use client";

import { useMemo } from "react";
import useApi from "@/lib/use-api";
import { nilaiKpi } from "@/types/publik";
import { angkaSah, pasanganCelah, type Dashboard } from "../_bagian/tipe";

/**
 * Semua pengambilan dan penurunan data untuk dashboard konsol.
 *
 * Dua kebiasaan yang dijaga: `kpi` adalah ARRAY yang dicari lewat `key`
 * (`nilaiKpi()`), dan tidak ada `NaN`/`undefined`/`Infinity` yang sampai ke
 * layar — setiap angka lewat `angkaSah()` dulu.
 */
export function useDashboard() {
  const { data, memuat, menyegarkan, galat, muatUlang } = useApi<Dashboard>(
    "/api/admin/dashboard",
  );

  const kpi = data?.kpi ?? [];
  const insiden = data?.insiden ?? [];
  const berbunyi = data?.meterBerbunyi ?? [];

  /*
   * Jumlah TOTAL, bukan panjang daftar yang dikirim.
   *
   * Kedua daftar di rel kanan sengaja dipotong server (enam insiden,
   * delapan meter). Memakai panjangnya sebagai jumlah membuat pita genting
   * mengumumkan "6 insiden" sementara panel di sebelahnya menulis 87 untuk
   * hari yang sama — dan dua angka yang berselisih di satu layar adalah hal
   * pertama yang dihitung ulang orang, lalu seluruh halaman berhenti
   * dipercaya. Panjang daftar hanya dipakai sebagai cadangan terakhir.
   */
  const jumlahInsiden = data
    ? (angkaSah(data.jumlahStatus?.insiden) ?? insiden.length)
    : null;
  const jumlahBerbunyi = data
    ? (angkaSah(data.totalMeterBerbunyi) ?? berbunyi.length)
    : null;

  // Zona yang disebut di pita genting: gabungan dari kedua antrean, tanpa
  // pengulangan, urut supaya kalimatnya tidak berganti susunan tiap muat.
  const zonaTerdampak = Array.from(
    new Set([...insiden, ...berbunyi].map((x) => x.zona).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "id-ID"));

  /*
   * Grafik distabilkan lewat ISI-nya, bukan referensinya.
   *
   * Tiap pengambilan berkala menghasilkan objek baru walau tiap titiknya
   * sama persis, dan Recharts menggambar ulang seluruh deret — garisnya
   * menyapu dari kiri ke kanan tiap dua belas detik tanpa ada satu pun
   * nilai yang berganti. Dengan kunci teks sebagai satu-satunya kebergantungan,
   * objeknya baru berganti kalau angkanya memang berganti.
   */
  const kunciGrafik = JSON.stringify(data?.grafik ?? null);
  const grafik = useMemo(
    () => JSON.parse(kunciGrafik) as Dashboard["grafik"] | null,
    [kunciGrafik],
  );

  const { atas, bawah } = pasanganCelah(grafik?.series);
  const nrwRata = data ? nilaiKpi(kpi, "nrwRataPct") : null;

  return {
    data,
    memuat,
    menyegarkan,
    galat,
    muatUlang,
    kpi,
    jumlahInsiden,
    jumlahBerbunyi,
    zonaTerdampak,
    grafik,
    atas,
    bawah,
    nrwRata,
  };
}
