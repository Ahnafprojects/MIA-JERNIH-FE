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

export interface DetailPelanggan
  extends Omit<BarisPelanggan, "koordinat" | "terakhirLapor"> {
  /** `null` bila meternya belum pernah melapor sama sekali. */
  terakhirLapor: string | null;
  email: string;
  /** Id METER untuk aksi relay; `null` bila pelanggan belum punya meter. */
  meterId: string | null;
  hp: string | null;
  alamat: string | null;
  golongan: string | null;
  serial: string;
  aktif: boolean;
  volumeTotalL: number;
  /** `null` bila meternya belum dipetakan. Nol derajat adalah titik asli. */
  koordinat: [number, number] | null;
  alarm: { ringan: boolean; berat: boolean; tertutup: boolean };
  pakaiHarian: { labels: string[]; points: number[] };
  token: TokenPelanggan[];
  aktivitas: { pada: string; teks: string }[];
}

/* ══════════════════════════════════════════════════════════════════════
   BENTUK MENTAH DARI SERVER, DAN PEMETANYA
   ══════════════════════════════════════════════════════════════════════ */

/*
 * `GET /api/admin/pelanggan/:id` mengirim objek BERSARANG
 * (`detail`, `meter`, `riwayatToken`, `liniMasa`), sedangkan halaman detail
 * membaca objek datar. Selisih itu tidak pernah menimbulkan galat kompilasi:
 * `useApi<DetailPelanggan>` hanya MENGAKU bentuknya tanpa memeriksanya saat
 * jalan, sehingga setiap bacaan bernilai `undefined` dan `.map()` pertama
 * melempar ke batas galat. Yang terlihat pengguna hanyalah layar
 * "This page couldn't load" tanpa satu petunjuk pun.
 *
 * Pemetaan ditaruh di sini, bukan di halaman, supaya hanya ada SATU tempat
 * yang tahu bentuk jawaban server. Nilai yang dipakai halaman tetapi tidak
 * dikirim server tidak dikarang di sini: yang tidak ada menjadi `null`,
 * dan halaman menampilkannya sebagai tanda hubung.
 */
export interface DetailPelangganMentah {
  detail: {
    id: string;
    nama: string;
    email: string;
    hp: string | null;
    alamat: string | null;
    zona: { id: string; nama: string } | string | null;
    golongan: string | null;
    aktif: boolean;
    dibuatPada: string;
  };
  meter: {
    id: string;
    serial: string;
    label: string | null;
    saldoL: number;
    debitLpm: number;
    volumeTotalL: number;
    relay: string;
    saklarOn: boolean;
    daring: boolean;
    terakhirTerlihat: string | null;
    lat: number | null;
    lng: number | null;
  }[];
  adaInsiden: boolean;
  pakaiHarian: { labels: string[]; points: number[] };
  riwayatToken: {
    id: string;
    kodeBertopeng: string;
    nilaiL: number;
    status: string;
    dipakaiPada: string | null;
    dibuatPada: string;
  }[];
  liniMasa: { aksi: string; detail: string | null; ts: string }[];
}

/** Urutan prioritas status WAJIB sama dengan tabel, peta, dan dasbor. */
function statusDari(
  adaInsiden: boolean,
  daring: boolean,
  saldoL: number,
): StatusMeter {
  if (adaInsiden) return "insiden";
  if (!daring) return "offline";
  if (saldoL <= AMBANG.ringan) return "alarm";
  return "normal";
}

export function rapikanDetail(
  mentah: DetailPelangganMentah | null,
): DetailPelanggan | null {
  if (!mentah?.detail) return null;
  const d = mentah.detail;
  const m = mentah.meter?.[0];

  const saldoL = m ? m.saldoL : 0;
  const relayOn = m ? m.relay === "AKTIF" : false;
  const daring = m ? m.daring : false;
  const zona =
    typeof d.zona === "string" ? d.zona : (d.zona?.nama ?? "Tanpa zona");
  const zonaId = typeof d.zona === "string" ? "" : (d.zona?.id ?? "");

  return {
    id: d.id,
    nama: d.nama,
    email: d.email,
    meterId: m?.id ?? null,
    hp: d.hp,
    alamat: d.alamat,
    golongan: d.golongan,
    aktif: d.aktif,
    zona,
    zonaId,
    serial: m?.serial ?? "-",
    saldoL,
    debitLpm: m ? m.debitLpm : 0,
    volumeTotalL: m ? m.volumeTotalL : 0,
    relayOn,
    saklarOn: m ? m.saklarOn : false,
    online: daring,
    adaInsiden: mentah.adaInsiden ?? false,
    /* Keduanya harus ada. Satu koordinat saja tidak menunjuk ke mana pun. */
    koordinat:
      m && m.lat !== null && m.lng !== null ? [m.lng, m.lat] : null,
    terakhirLapor: m?.terakhirTerlihat ?? null,
    status: statusDari(mentah.adaInsiden ?? false, daring, saldoL),
    /* Ambang ini milik meter, dan dihitung dari saldo yang sama dengan
       yang tampil di kartu, supaya tangga alarm tidak pernah bertentangan
       dengan angka di atasnya. */
    alarm: {
      ringan: saldoL <= AMBANG.ringan,
      berat: saldoL <= AMBANG.berat,
      tertutup: !relayOn,
    },
    pakaiHarian: mentah.pakaiHarian ?? { labels: [], points: [] },
    token: (mentah.riwayatToken ?? []).map((t) => ({
      kode: t.kodeBertopeng,
      liter: t.nilaiL,
      pada: t.dipakaiPada ?? t.dibuatPada,
      /* Enum backend bernilai TERPAKAI. Dulu dicocokkan dengan "DIPAKAI",
         sehingga tidak ada satu token pun yang pernah tampil terpakai. */
      dipakai: t.status === "TERPAKAI",
    })),
    aktivitas: (mentah.liniMasa ?? []).map((l) => ({
      pada: l.ts,
      teks: l.detail ? `${l.aksi} — ${l.detail}` : l.aksi,
    })),
  };
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
