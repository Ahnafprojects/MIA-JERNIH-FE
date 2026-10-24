/**
 * Bentuk jawaban `GET /api/admin/peta`.
 *
 * Ditulis ulang di sini, BUKAN di `src/types/publik.ts`: tipe di sana milik
 * halaman publik dan dipakai lima berkas lain. Bentuk konsol masih ikut
 * kontrak BE#8/BE#10 yang belum beku, dan menumpanginya ke tipe publik berarti
 * satu perubahan backend konsol merembet ke halaman warga.
 */

/**
 * Status sebuah meter — DITURUNKAN di server dari online/insiden/saldo,
 * bukan medan tersendiri. Urutan prioritasnya ada di
 * `src/app/api/admin/_sementara/data-admin.ts` dan jangan ditiru ulang di
 * klien: dua rumus yang "kira-kira sama" adalah persis cara angka legenda
 * mulai berselisih dengan jumlah pin.
 */
export type StatusMeter = "normal" | "alarm" | "insiden" | "offline";

/** Satu titik dalam urutan GeoJSON: **[bujur, lintang]**. */
export type Titik = [number, number];

/**
 * Satu meter yang PUNYA koordinat.
 *
 * Meter tanpa koordinat tidak pernah masuk ke sini — lihat `tanpaKoordinat`.
 */
export interface PinMeter {
  id: string;
  nama: string;
  zonaId: string;
  zona: string;
  koordinat: Titik;
  status: StatusMeter;
  saldoL: number;
  debitLpm: number;
  relayOn: boolean;
}

/** Baris zona apa adanya dari API. Hanya `id` dan `nama` yang dipakai. */
export interface ZonaPeta {
  id: string;
  nama: string;
  meter: number;
  alarm: number;
  offline: number;
}

export interface PetaKonsol {
  pin: PinMeter[];
  jumlahStatus: Record<StatusMeter, number>;
  /** Meter terdaftar yang belum punya koordinat. Tidak digambar, tetap dihitung. */
  tanpaKoordinat: number;
  totalMeter: number;
  zona: ZonaPeta[];
}

/** Cincin batas satu zona, siap dijadikan Polygon. */
export interface BatasZona {
  id: string;
  nama: string;
  cincin: Titik[];
}
