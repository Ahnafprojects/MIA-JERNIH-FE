export interface DataLiveMeter {
  meterId: string;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  saklarOn: boolean;
  relay: string;
  buzzer: string;
  daring: boolean;
  ts: string;
}

export interface DeretPemakaian {
  waktu: string;
  volumeL: number;
}

export interface PesanTukar {
  tipe: "sukses" | "galat";
  teks: string;
}

/** Bentuknya mengikuti `/api/transaksi` di `riwayat/page.tsx`. */
export interface TransaksiRingkas {
  id: string;
  jenis: "BELI" | "ISI_TOKEN";
  volumeL: number;
  jumlahRp: number;
  metode: string;
  status: "LUNAS" | "MENUNGGU" | "GAGAL" | "KEDALUWARSA";
  dibuatPada: string;
}

export interface NotifRingkas {
  id: string;
  judul: string;
  teks: string;
  dibuatPada: string;
}

/**
 * Keterangan meter dari `GET /api/meter/:id`.
 *
 * `MeterSingkat` di `auth-tipe.ts` hanya membawa id, nomor seri, saldo, dan
 * relay — cukup untuk memilih meter, tidak cukup untuk menamainya. Label,
 * alamat, dan versi firmware diambil dari sini supaya kepala halaman
 * menyebut rumah yang benar alih-alih menampilkan alamat karangan.
 */
export interface MeterDetail {
  label?: string | null;
  alamat?: string | null;
  serial?: string | null;
  zona?: string | null;
  versiFirmware?: string | null;
}

/**
 * `GET /api/meter/:id` membungkus isinya: `{ meter: {...}, lcd: {...} }`.
 *
 * Dibuktikan langsung ke server, bukan ditebak. Percobaan pertama menganggap
 * bentuknya rata dan hasilnya seluruh keterangan meter diam-diam `undefined` —
 * tidak ada galat, halaman hanya menampilkan teks cadangan selamanya. Jenis
 * kegagalan yang paling sulit terlihat: semuanya tampak bekerja.
 */
export interface JawabanMeter {
  meter?: MeterDetail | null;
}
