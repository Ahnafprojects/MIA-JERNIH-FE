// SEMENTARA — lihat `../_sementara/data-admin.ts`. Hapus setelah backend siap.
import { NextResponse } from "next/server";
import {
  hitungStatus,
  semuaPelanggan,
  statusMeter,
  ZONA_KONSOL,
} from "../_sementara/data-admin";
import { statistik } from "../../publik/_sementara/data";

export function GET() {
  const semua = semuaPelanggan();
  const jumlah = hitungStatus(semua);

  const aktif = semua.filter((p) => p.saklarOn && p.saldoL > 0).length;
  const saldoBeredar = Math.round(semua.reduce((t, p) => t + p.saldoL, 0));
  const berbunyi = semua.filter((p) => statusMeter(p) === "alarm");

  // Diturunkan dari sumber yang SAMA dengan halaman publik `/statistik`.
  // Konsol dan halaman publik yang menyebut NRW berbeda untuk hari yang sama
  // adalah hal pertama yang akan ditemukan orang.
  const s = statistik(30);
  const hariIni = Math.round(s.volumeDisalurkanM3 / 30);

  return NextResponse.json({
    /*
     * `kpi` adalah ARRAY berisi objek ber-`key`, bukan objek.
     *
     * Bentuk ini dipilih supaya urutan kartu ditentukan server dan klien
     * mencarinya lewat `key` — bukan lewat indeks, dan TIDAK PERNAH lewat
     * `label`. Teks label milik server dan bisa berubah kapan saja; kode yang
     * mencocokkan label akan diam-diam berhenti bekerja saat kata diperbaiki.
     */
    kpi: [
      { key: "pelangganAktif", label: "Pelanggan aktif", value: aktif },
      {
        key: "pelangganNonaktif",
        label: "Nonaktif",
        value: semua.length - aktif,
      },
      {
        key: "volumeHariIniM3",
        label: "Volume hari ini",
        value: hariIni,
        unit: "m³",
      },
      {
        key: "saldoBeredarL",
        label: "Saldo beredar",
        value: saldoBeredar,
        unit: "L",
      },
      {
        key: "nrwRataPct",
        label: "Kehilangan air",
        value: s.nrwPct,
        unit: "%",
        tone: s.nrwPct <= 20 ? "success" : "warn",
      },
    ],

    jumlahStatus: jumlah,

    meterBerbunyi: berbunyi.slice(0, 8).map((p) => ({
      id: p.id,
      nama: p.nama,
      zona: p.zona,
      saldoL: p.saldoL,
    })),
    totalMeterBerbunyi: berbunyi.length,

    insiden: semua
      .filter((p) => p.adaInsiden)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        nama: p.nama,
        zona: p.zona,
        sejak: p.terakhirLapor,
      })),

    /* Deret dicari klien lewat NAMA, bukan indeks — lihat issue FE#19. */
    grafik: {
      labels: s.labels,
      series: [
        { name: "Air disuplai", unit: "m³", points: s.series[0].points },
        { name: "Air tercatat", unit: "m³", points: s.series[1].points },
      ],
    },

    nrwPerZona: s.perZona.map((z) => ({ nama: z.nama, nrwPct: z.nrwPct })),

    /*
     * Diurutkan menurut TELEMETRI TERBARU, bukan debit tertinggi.
     *
     * Mengurutkan menurut debit terdengar masuk akal tapi menghasilkan tabel
     * yang mati: dengan ribuan pelanggan mengalir dan debit dibulatkan ke
     * 0,1 L/mnt, dua belas teratas SELALU mentok di nilai puncak yang sama
     * persis — dua belas baris berisi angka identik. Itu terjadi berapa pun
     * jangkauan debitnya; yang salah bukan datanya, melainkan pilihan
     * urutannya.
     *
     * "Live" juga memang berarti yang paling baru melapor, bukan yang paling
     * deras. Petugas membaca tabel ini untuk melihat jaringan sedang bergerak
     * — dan laporan terbaru itulah buktinya.
     */
    pelangganLive: semua
      .filter((p) => p.debitLpm > 0)
      .sort(
        (a, b) =>
          Date.parse(b.terakhirLapor) - Date.parse(a.terakhirLapor),
      )
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        nama: p.nama,
        zona: p.zona,
        saldoL: p.saldoL,
        debitLpm: p.debitLpm,
        saklarOn: p.saklarOn,
        relayOn: p.relayOn,
      })),

    /* Angka, bukan objek. Rinciannya terpisah — lihat issue FE#19. */
    tokenHariIni: 134,
    tokenHariIniDetail: ZONA_KONSOL.map((z, i) => ({
      zona: z.nama,
      jumlah: [52, 33, 31, 18][i],
    })),
  });
}
