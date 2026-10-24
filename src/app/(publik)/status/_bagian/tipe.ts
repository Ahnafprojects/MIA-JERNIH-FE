/**
 * Bentuk jawaban `/api/publik/riwayat-zona`.
 *
 * Ditulis di sini, bukan di `src/types/publik.ts`, karena kontrak ini masih
 * milik satu halaman saja. Begitu backend (MIA-JERNIH-BE) menerbitkan
 * endpoint-nya, PINDAHKAN berkas ini ke `src/types/publik.ts` supaya seluruh
 * kontrak publik tetap berada di satu tempat.
 *
 * Aturannya sama dengan kontrak publik lainnya: nilai yang TIDAK dikirim
 * server bertipe `null`, bukan 0. Nol adalah hasil pengukuran yang sah —
 * "sisa klor 0 mg/L" berarti airnya tidak diklorinasi, bukan berarti
 * laboratoriumnya belum mengirim hasil.
 */

import type { StatusZona } from "@/types/publik";

/**
 * Kejadian yang membuat layanan tidak normal.
 *
 * `gangguan` di luar rencana, `perbaikan` terjadwal. Keduanya sama-sama
 * memotong keandalan — warga yang airnya mati tidak peduli apakah matinya
 * sudah dijadwalkan — tetapi dibedakan karena yang terjadwal bisa disiapkan.
 */
export type JenisInsiden = Exclude<StatusZona, "normal">;

export interface Insiden {
  id: string;
  zonaId: string;
  zonaNama: string;
  jenis: JenisInsiden;
  mulai: string;
  /** `null` berarti BELUM selesai — masih berlangsung sampai `ts`. */
  selesai: string | null;
  /** Lama kejadian dalam jam; untuk yang belum selesai, lama berjalannya. */
  durasiJam: number;
  sebab: string;
  pelangganTerdampak: number;
}

/** Satu petak pada strip harian. `tanggal` adalah awal hari waktu setempat. */
export interface HariStatus {
  tanggal: string;
  status: StatusZona;
}

/** Hasil uji mutu air terakhir di satu zona. */
export interface KualitasAir {
  /** Sisa klor bebas, mg/L. */
  klorMgL: number | null;
  /** Kekeruhan, NTU. */
  kekeruhanNtu: number | null;
  ph: number | null;
  diujiPada: string | null;
  titikUji: string | null;
}

export interface KeandalanZona {
  id: string;
  nama: string;
  /** Bagian waktu layanan normal selama periode, dalam persen. */
  keandalanPct: number | null;
  jumlahGangguan: number;
  totalJamTerganggu: number;
  /** Satu petak per hari, paling lama lebih dulu. */
  harian: HariStatus[];
  kualitas: KualitasAir;
}

export interface Pemeliharaan {
  id: string;
  zonaId: string;
  zonaNama: string;
  mulai: string;
  selesai: string;
  durasiJam: number;
  pekerjaan: string;
  pelangganTerdampak: number;
}

/** Titik pengambilan air darurat saat zona terganggu. */
export interface TitikAir {
  id: string;
  zonaId: string;
  zonaNama: string;
  nama: string;
  alamat: string;
  kapasitasLiter: number;
  /** Jam layanan, mis. "06.00 – 18.00". */
  jamLayanan: string;
}

export interface Kontak {
  jenis: "telepon" | "whatsapp" | "surel";
  label: string;
  nilai: string;
  keterangan: string;
}

/**
 * Ambang mutu air minum menurut Permenkes.
 *
 * Dikirim SERVER, tidak ditulis di halaman: kalau regulasinya berubah,
 * angkanya berubah di satu tempat dan seluruh penandaan "di luar ambang"
 * ikut benar dengan sendirinya.
 */
export interface AmbangMutu {
  klor: [number, number];
  kekeruhanMaks: number;
  ph: [number, number];
  acuan: string;
}

export interface RiwayatZona {
  periode: { mulai: string; selesai: string; hari: number };
  ambang: AmbangMutu;
  /** Keandalan rata-rata seluruh zona terpantau, persen. */
  keandalanJaringanPct: number | null;
  zona: KeandalanZona[];
  /** Seluruh zona, terbaru lebih dulu. */
  insiden: Insiden[];
  /** Hanya yang BELUM dimulai, paling dekat lebih dulu. */
  pemeliharaan: Pemeliharaan[];
  titikAir: TitikAir[];
  kontak: Kontak[];
  ts: string;
}
