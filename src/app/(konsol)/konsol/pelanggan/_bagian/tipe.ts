/**
 * Bentuk data konsol pelanggan, sesuai `/api/admin/pelanggan`.
 *
 * Ditulis di `_bagian/`, BUKAN di `src/types/publik.ts`: berkas itu memuat
 * kontrak endpoint publik yang dipakai lintas halaman, sedangkan bentuk di
 * bawah ini hanya dipakai dua halaman konsol dan akan ikut berubah begitu
 * backend sungguhan (BE#1) menggantikan rute sementara.
 */

import type { Nada } from "@/components/ui/badge";

export type StatusMeter = "normal" | "alarm" | "insiden" | "offline";

export type SaringKunci =
  | "aktif"
  | "nonaktif"
  | "saldo-menipis"
  | "offline"
  | "insiden";

export interface BarisPelanggan {
  id: string;
  nama: string;
  zonaId: string;
  zona: string;
  saldoL: number;
  debitLpm: number;
  saklarOn: boolean;
  relayOn: boolean;
  online: boolean;
  adaInsiden: boolean;
  koordinat: [number, number];
  terakhirLapor: string;
  status: StatusMeter;
}

export interface DaftarPelanggan {
  baris: BarisPelanggan[];
  total: number;
  halaman: number;
  perHalaman: number;
  halamanTerakhir: number;
  jumlahSaring: Record<SaringKunci, number>;
  jumlahStatus: Record<StatusMeter, number>;
  zona: { id: string; nama: string }[];
}

export interface TokenPelanggan {
  kode: string;
  liter: number;
  pada: string;
  dipakai: boolean;
}

export interface DetailPelanggan extends BarisPelanggan {
  firmware: string;
  kalibrasiTerakhir: string;
  /** Ambang milik firmware meter, bukan pilihan tampilan. */
  alarm: { ringan: boolean; berat: boolean; tertutup: boolean };
  pakaiHarian: { labels: string[]; points: number[] };
  token: TokenPelanggan[];
  aktivitas: { pada: string; teks: string }[];
}

/**
 * Status meter → kata + nada.
 *
 * Katanya WAJIB ikut tampil. Empat status ini dibedakan warna di tabel, dan
 * tabel padat adalah tempat paling mudah bagi pembaca dengan buta warna untuk
 * kehilangan maknanya sama sekali.
 */
export const STATUS_METER: Record<
  StatusMeter,
  { label: string; nada: Nada; arti: string }
> = {
  normal: {
    label: "Normal",
    nada: "sukses",
    arti: "Meter melapor, saldo di atas ambang",
  },
  alarm: {
    label: "Alarm saldo",
    nada: "peringatan",
    arti: "Saldo sudah menyentuh ambang peringatan",
  },
  insiden: {
    label: "Insiden",
    nada: "bahaya",
    arti: "Ada insiden terbuka di titik ini",
  },
  offline: {
    label: "Offline",
    nada: "netral",
    arti: "Tidak ada telemetri lebih dari 6 jam",
  },
};

/** Urutan tetap supaya pita ringkasan tidak berpindah-pindah antar muat. */
export const URUTAN_STATUS: StatusMeter[] = [
  "normal",
  "alarm",
  "insiden",
  "offline",
];

export const SARING: { kunci: SaringKunci; label: string }[] = [
  { kunci: "aktif", label: "Aktif" },
  { kunci: "nonaktif", label: "Nonaktif" },
  { kunci: "saldo-menipis", label: "Saldo ≤ 5 L" },
  { kunci: "offline", label: "Offline" },
  { kunci: "insiden", label: "Ada insiden" },
];

/**
 * Pilihan urutan ditulis sebagai PASANGAN SIAP PAKAI, bukan dua kontrol
 * terpisah "kolom" + "naik/turun".
 *
 * Alasannya bukan selera: pembanding `debit` di server sudah menurun dari
 * sananya (`b.debitLpm - a.debitLpm`), sedangkan `nama` dan `saldo` menaik.
 * Dengan dua kontrol terpisah, "naik" berarti A→Z pada nama tapi "tertinggi
 * dulu" pada debit — label yang berbohong pada separuh pilihannya. Dengan
 * pasangan tetap, tiap baris di bawah menyebut apa yang benar-benar terjadi.
 */
export const URUTAN: {
  kunci: string;
  label: string;
  urut: string;
  arah: "naik" | "turun";
}[] = [
  { kunci: "nama-az", label: "Nama A–Z", urut: "nama", arah: "naik" },
  { kunci: "nama-za", label: "Nama Z–A", urut: "nama", arah: "turun" },
  { kunci: "saldo-kecil", label: "Saldo terkecil", urut: "saldo", arah: "naik" },
  {
    kunci: "saldo-besar",
    label: "Saldo terbesar",
    urut: "saldo",
    arah: "turun",
  },
  {
    kunci: "debit-tinggi",
    label: "Debit tertinggi",
    urut: "debit",
    arah: "naik",
  },
  {
    kunci: "debit-rendah",
    label: "Debit terendah",
    urut: "debit",
    arah: "turun",
  },
  { kunci: "zona-az", label: "Zona A–Z", urut: "zona", arah: "naik" },
];

/** Ambang alarm firmware, dalam liter. Dipakai tampilan DAN warna saldo. */
export const AMBANG = { ringan: 5, berat: 2, tutup: 0 } as const;

/** Nada saldo mengikuti ambang firmware, bukan skala warna karangan. */
export function nadaSaldo(saldoL: number): Nada {
  if (saldoL <= AMBANG.tutup) return "bahaya";
  if (saldoL <= AMBANG.berat) return "bahaya";
  if (saldoL <= AMBANG.ringan) return "peringatan";
  return "netral";
}
