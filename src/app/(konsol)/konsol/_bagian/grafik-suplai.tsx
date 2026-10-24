"use client";

/**
 * Grafik air disuplai dibanding air tercatat, dengan selisihnya diarsir.
 *
 * Pembungkus tipis di atas `GrafikCelah`, dan ia ada untuk satu alasan
 * teknis yang pernah membuat grafiknya tampil kosong: fungsi format yang
 * ditulis sebaris di JSX berganti identitas pada SETIAP render halaman.
 * Recharts membaca itu sebagai "datanya berubah" dan memulai lagi animasi
 * menggambarnya — pada halaman yang menyegarkan diri terus-menerus, garisnya
 * tidak pernah sempat selesai digambar.
 *
 * Di sini kedua fungsi itu tetap di lingkup modul, dan komponennya dibungkus
 * `memo`, jadi grafik hanya digambar ulang saat angkanya memang berganti.
 */

import { memo } from "react";
import { GrafikCelah } from "@/components/domain/grafik";
import { angka } from "@/lib/format";
import type { Deret } from "@/types/publik";

const format = (n: number) => `${angka(n)} m³`;
const formatSumbu = (n: number) => angka(n);

export const GrafikSuplai = memo(function GrafikSuplai({
  labels,
  atas,
  bawah,
}: {
  labels: string[];
  atas: Deret | null;
  bawah: Deret | null;
}) {
  return (
    <GrafikCelah
      labels={labels}
      atas={atas}
      bawah={bawah}
      namaCelah="Hilang di perjalanan"
      format={format}
      formatSumbu={formatSumbu}
      tinggi={252}
    />
  );
});
