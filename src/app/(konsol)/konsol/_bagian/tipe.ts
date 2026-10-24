/**
 * Bentuk jawaban `GET /api/admin/dashboard`.
 *
 * Disalin dari kontrak di `src/app/api/admin/dashboard/route.ts`. Kalau
 * backend mengubah bentuknya, berkas ini ikut diubah dalam PR yang sama —
 * jangan ditebak sendiri di halaman.
 */
import type { Deret, Kpi } from "@/types/publik";

export interface MeterBerbunyi {
  id: string;
  nama: string;
  zona: string;
  saldoL: number;
}

export interface InsidenRingkas {
  id: string;
  nama: string;
  zona: string;
  sejak: string;
}

export interface BarisLive {
  id: string;
  nama: string;
  zona: string;
  saldoL: number;
  debitLpm: number;
  saklarOn: boolean;
  relayOn: boolean;
}

export interface NrwZona {
  nama: string;
  nrwPct: number;
}

export interface TokenZona {
  zona: string;
  jumlah: number;
}

export interface Dashboard {
  /** ARRAY, bukan objek. Dicari lewat `key` — lihat `nilaiKpi()`. */
  kpi: Kpi[];
  /** Jumlah meter per status turunan: normal · alarm · insiden · offline. */
  jumlahStatus: Record<string, number>;
  meterBerbunyi: MeterBerbunyi[];
  totalMeterBerbunyi: number;
  insiden: InsidenRingkas[];
  /** Deret dicari lewat NAMA, bukan indeks. */
  grafik: { labels: string[]; series: Deret[] };
  nrwPerZona: NrwZona[];
  pelangganLive: BarisLive[];
  /** ANGKA, bukan objek. Rinciannya di `tokenHariIniDetail`. */
  tokenHariIni: number;
  tokenHariIniDetail: TokenZona[];
}

/**
 * Angka yang boleh ditampilkan, atau `null`.
 *
 * Dipakai sebagai gerbang terakhir sebelum apa pun dicetak ke layar:
 * `undefined`, `NaN`, dan `Infinity` semuanya keluar sebagai `null` dan
 * tampil "—". Konsol ini pernah menampilkan lima kartu berisi `NaN` selama
 * berhari-hari tanpa ada yang sadar; satu fungsi di satu tempat lebih murah
 * daripada memeriksanya ulang di tiap komponen.
 */
export const angkaSah = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/** Saldo di bawah ambang ini membunyikan alarm di meter. */
export const AMBANG_ALARM_L = 5;

/** Kehilangan air di bawah ambang ini tergolong baik menurut acuan PDAM. */
export const AMBANG_NRW_BAIK = 20;

/**
 * Deret dicari lewat NAMANYA, bukan indeks — urutan milik server dan bisa
 * bertambah sewaktu-waktu. Pencocokannya longgar (`/disuplai|disalur/`)
 * supaya penghalusan kata di server tidak mematikan grafiknya diam-diam.
 */
export function pasanganCelah(series: Deret[] | undefined): {
  atas: Deret | null;
  bawah: Deret | null;
} {
  const daftar = series ?? [];
  if (daftar.length < 2) return { atas: null, bawah: null };

  const atas = daftar.find((d) => /disuplai|disalur/i.test(d.name));
  const bawah = daftar.find((d) => /tercatat/i.test(d.name));
  if (atas && bawah && atas !== bawah) return { atas, bawah };

  /*
   * Cadangan bila namanya tidak dikenali: deret dengan total terbesar jadi
   * langit-langit. Itu bukan tebakan — untuk grafik selisih, yang lebih
   * besar memang yang di atas menurut definisinya.
   */
  const total = (d: Deret) =>
    d.points.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  const urut = [...daftar].sort((a, b) => total(b) - total(a));
  return { atas: urut[0] ?? null, bawah: urut[1] ?? null };
}

/**
 * "3 menit lalu".
 *
 * Dihitung di klien dari jam klien. Itu disengaja: data konsol datang lewat
 * pengambilan di klien, jadi tidak ada hasil render server yang bisa
 * berselisih dengannya saat hidrasi.
 */
export function sejakKini(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;

  const detik = Math.round((Date.now() - t) / 1000);
  if (detik < 0) return "baru saja";
  if (detik < 60) return `${detik} detik lalu`;
  const menit = Math.round(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.round(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.round(jam / 24)} hari lalu`;
}
