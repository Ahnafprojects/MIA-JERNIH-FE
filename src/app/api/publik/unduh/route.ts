// SEMENTARA — lihat `../_sementara/data.ts`. Hapus setelah backend siap.
//
// Unduhan data mentah. Satu endpoint, empat kumpulan data, dua format.
//
//   /api/publik/unduh?set=harian&format=csv&rentang=30
//
// Isinya DITURUNKAN dari fungsi yang sama dengan yang menyuapi halaman, bukan
// disalin ulang. Berkas unduhan yang isinya berbeda sedikit dari angka di
// layar lebih merusak kepercayaan daripada tidak menyediakan unduhan sama
// sekali — orang pertama yang mencocokkannya akan menyimpulkan salah satunya
// dikarang, dan ia tidak akan tahu yang mana.
import { NextResponse } from "next/server";
import { KEPALA_TERBUKA, OPTIONS_TERBUKA } from "../_terbuka";
import { statistik } from "../_sementara/data";
import {
  META,
  neracaAir,
  rentangSah,
  tanggalHarian,
  trenBulanan,
} from "../_sementara/data-statistik";

type Nilai = string | number;

interface Kolom {
  kunci: string;
  label: string;
  satuan?: string;
}

interface Kumpulan {
  kunci: string;
  judul: string;
  /** `true` bila isinya berubah mengikuti rentang waktu yang dipilih. */
  ikutRentang: boolean;
  kolom: Kolom[];
  baris: Record<string, Nilai>[];
}

/* ── Kumpulan data ──────────────────────────────────────────────────── */

function kumpulanHarian(hari: number): Kumpulan {
  const dasar = statistik(hari);
  const tanggal = tanggalHarian(hari);
  const disalurkan = dasar.series.find((d) => /disalur/i.test(d.name));
  const tercatat = dasar.series.find((d) => /tercatat/i.test(d.name));

  return {
    kunci: "harian",
    judul: "Ringkasan harian",
    ikutRentang: true,
    kolom: [
      { kunci: "tanggal", label: "Tanggal" },
      { kunci: "disalurkan_m3", label: "Air disalurkan", satuan: "m3" },
      { kunci: "tercatat_m3", label: "Air tercatat", satuan: "m3" },
      { kunci: "kehilangan_m3", label: "Kehilangan", satuan: "m3" },
      { kunci: "nrw_persen", label: "Kehilangan air (NRW)", satuan: "%" },
    ],
    baris: tanggal.map((t, i) => {
      const d = disalurkan?.points[i] ?? 0;
      const c = tercatat?.points[i] ?? 0;
      const hilang = d - c;
      return {
        tanggal: t,
        disalurkan_m3: d,
        tercatat_m3: c,
        kehilangan_m3: hilang,
        nrw_persen: d > 0 ? Math.round((hilang / d) * 1000) / 10 : 0,
      };
    }),
  };
}

function kumpulanZona(hari: number): Kumpulan {
  return {
    kunci: "zona",
    judul: "Rincian per zona",
    ikutRentang: true,
    kolom: [
      { kunci: "zona", label: "Zona distribusi" },
      { kunci: "pelanggan", label: "Sambungan aktif" },
      { kunci: "volume_m3", label: "Volume tercatat", satuan: "m3" },
      { kunci: "nrw_persen", label: "Kehilangan air (NRW)", satuan: "%" },
    ],
    baris: statistik(hari).perZona.map((z) => ({
      zona: z.nama,
      pelanggan: z.pelanggan,
      volume_m3: z.volumeM3,
      nrw_persen: z.nrwPct,
    })),
  };
}

function kumpulanNeraca(hari: number): Kumpulan {
  const n = neracaAir(hari);
  return {
    kunci: "neraca",
    judul: "Neraca air",
    ikutRentang: true,
    kolom: [
      { kunci: "kelompok", label: "Kelompok" },
      { kunci: "komponen", label: "Komponen" },
      { kunci: "volume_m3", label: "Volume", satuan: "m3" },
      {
        kunci: "porsi_persen",
        label: "Porsi dari seluruh kehilangan",
        satuan: "%",
      },
    ],
    baris: n.kelompok.flatMap((g) =>
      g.komponen.map((k) => ({
        kelompok: g.nama,
        komponen: k.nama,
        volume_m3: k.volumeM3,
        porsi_persen: k.porsiPct,
      })),
    ),
  };
}

function kumpulanBulanan(): Kumpulan {
  return {
    kunci: "bulanan",
    judul: "Tren bulanan 12 bulan",
    ikutRentang: false,
    kolom: [
      { kunci: "bulan", label: "Bulan" },
      { kunci: "disalurkan_m3", label: "Air disalurkan", satuan: "m3" },
      { kunci: "tercatat_m3", label: "Air tercatat", satuan: "m3" },
      { kunci: "kehilangan_m3", label: "Kehilangan", satuan: "m3" },
      { kunci: "nrw_persen", label: "Kehilangan air (NRW)", satuan: "%" },
    ],
    baris: trenBulanan().map((b) => ({
      bulan: b.bulan,
      disalurkan_m3: b.disalurkanM3,
      tercatat_m3: b.tercatatM3,
      kehilangan_m3: b.kehilanganM3,
      nrw_persen: b.nrwPct,
    })),
  };
}

const PEMBUAT: Record<string, (hari: number) => Kumpulan> = {
  harian: kumpulanHarian,
  zona: kumpulanZona,
  neraca: kumpulanNeraca,
  bulanan: () => kumpulanBulanan(),
};

export const SET_TERSEDIA = Object.keys(PEMBUAT);

/* ── CSV ────────────────────────────────────────────────────────────── */

/**
 * CSV menurut RFC 4180: pemisah koma, TITIK desimal, akhir baris CRLF.
 *
 * Bukan format Indonesia, dan itu disengaja. Berkas ini dibuat untuk dibaca
 * ULANG oleh alat lain — pandas, R, Google Sheets, QGIS — dan semuanya
 * membaca RFC 4180 tanpa disetel. Memakai titik koma dan koma desimal akan
 * membuatnya nyaman di satu aplikasi dan rusak di semua yang lain. Pilihan
 * ini ditulis apa adanya di halaman, jadi tidak ada yang tertipu.
 *
 * BOM UTF-8 tetap dipasang: tanpanya Excel di Windows membaca "m³" dan nama
 * zona berhuruf non-ASCII sebagai sampah.
 */
const BOM = "﻿";

function sel(v: Nilai): string {
  const s = typeof v === "number" ? String(v) : v;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function keCsv(k: Kumpulan): string {
  // Nama kolom sudah membawa satuannya sendiri (`volume_m3`, `nrw_persen`),
  // jadi tidak ditempeli satuan sekali lagi. Baris kepala yang berisi
  // "volume_m3 (m3)" harus dibersihkan tangan sebelum dipakai di mana pun.
  const kepala = k.kolom.map((c) => sel(c.kunci));
  const baris = k.baris.map((b) => k.kolom.map((c) => sel(b[c.kunci] ?? "")));
  return BOM + [kepala, ...baris].map((r) => r.join(",")).join("\r\n") + "\r\n";
}

/* ── Rute ───────────────────────────────────────────────────────────── */

function galat(pesan: string, code: string) {
  return NextResponse.json(
    { error: { code, message: pesan } },
    { status: 400, headers: KEPALA_TERBUKA },
  );
}

/**
 * Tanggal hari ini menurut waktu SETEMPAT, bukan UTC.
 *
 * `toISOString().slice(0,10)` sempat dipakai di sini dan hasilnya salah
 * sehari setiap kali berkas diunduh sebelum pukul 07.00 WIB: namanya tertulis
 * "…-2026-10-23" sementara baris terakhir di dalamnya bertanggal 2026-10-24,
 * karena tanggal datanya memang disusun dari waktu setempat. Nama berkas yang
 * membantah isinya sendiri adalah hal pertama yang membuat orang curiga pada
 * seluruh angkanya.
 */
function hariIni(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const set = q.get("set") ?? "harian";
  const pembuat = PEMBUAT[set];
  if (!pembuat) {
    return galat(
      `Kumpulan data "${set}" tidak ada. Pilihan yang tersedia: ${SET_TERSEDIA.join(", ")}.`,
      "SET_TIDAK_DIKENAL",
    );
  }

  const format = (q.get("format") ?? "csv").toLowerCase();
  if (format !== "csv" && format !== "json") {
    return galat(
      `Format "${format}" tidak didukung. Pilihan yang tersedia: csv, json.`,
      "FORMAT_TIDAK_DIDUKUNG",
    );
  }

  const hari = rentangSah(Number(q.get("rentang") ?? 30));
  const kumpulan = pembuat(hari);

  const namaBerkas = [
    "jernih",
    kumpulan.kunci,
    kumpulan.ikutRentang ? `${hari}hari` : null,
    hariIni(),
  ]
    .filter(Boolean)
    .join("-");

  // `attachment` yang membuat tombol di halaman benar-benar mengunduh berkas,
  // bukan membuka JSON mentah di tab baru.
  const kepala = {
    ...KEPALA_TERBUKA,
    "Content-Disposition": `attachment; filename="${namaBerkas}.${format}"`,
  };

  if (format === "json") {
    return NextResponse.json(
      {
        set: kumpulan.kunci,
        judul: kumpulan.judul,
        rentangHari: kumpulan.ikutRentang ? hari : null,
        dibuatPada: new Date().toISOString(),
        jumlahBaris: kumpulan.baris.length,
        kolom: kumpulan.kolom,
        data: kumpulan.baris,
        meta: META,
      },
      { headers: kepala },
    );
  }

  return new NextResponse(keCsv(kumpulan), {
    headers: { ...kepala, "Content-Type": "text/csv; charset=utf-8" },
  });
}

export const OPTIONS = OPTIONS_TERBUKA;
