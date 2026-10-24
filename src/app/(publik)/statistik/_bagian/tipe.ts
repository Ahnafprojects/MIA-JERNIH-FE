/**
 * Bentuk jawaban `/api/publik/neraca-air` dan `/api/publik/unduh`.
 *
 * Berkas ini memainkan peran yang sama dengan `src/types/publik.ts`, tetapi
 * untuk lapisan yang hanya dipakai halaman statistik: neraca air, tolok ukur,
 * pemakaian per orang, dan tren bulanan. Letaknya di samping halamannya
 * sendiri karena tidak ada halaman lain yang membacanya.
 *
 * Harus sama persis dengan yang dikirim backend. Kalau backend mengubah
 * bentuknya, berkas ini ikut diubah dalam PR yang sama — jangan ditebak
 * sendiri di komponen.
 */

/** Tiga kelompok neraca air menurut kerangka IWA. */
export type KelompokKunci = "fisik" | "komersial" | "resmi";

export interface KomponenNeraca {
  kunci: string;
  kelompok: KelompokKunci;
  nama: string;
  /** Satu kalimat pendek: apa sebenarnya yang dihitung di baris ini. */
  catatan: string;
  volumeM3: number;
  /** Porsi terhadap SELURUH kehilangan, bukan terhadap kelompoknya. */
  porsiPct: number;
}

export interface KelompokNeraca {
  kunci: KelompokKunci;
  nama: string;
  ringkas: string;
  volumeM3: number;
  porsiPct: number;
  komponen: KomponenNeraca[];
}

export interface TolokUkur {
  kunci: string;
  nama: string;
  nilaiPct: number;
  sumber: string;
}

export interface TitikBulanan {
  /** `2026-10` — kunci mesin, dipakai di berkas unduhan. */
  bulan: string;
  /** `Okt` atau `Jan 26` — label manusia untuk sumbu grafik. */
  label: string;
  disalurkanM3: number;
  tercatatM3: number;
  kehilanganM3: number;
  nrwPct: number;
}

export interface PemakaianPerOrang {
  jiwaTerlayani: number;
  /** Asumsi jiwa per sambungan. Diakui sebagai asumsi, bukan hasil pendataan. */
  jiwaPerSambungan: number;
  disalurkanLOrangHari: number;
  tercatatLOrangHari: number;
  kebutuhanDasarLOrangHari: number;
  /** Berapa persen kebutuhan dasar yang ditutup air PDAM yang tercatat. */
  pemenuhanPct: number;
}

export interface MetaData {
  sumber: string;
  pembaruan: string;
  lisensi: string;
  /** Batasan yang diakui sendiri. Ikut terbawa ke berkas JSON yang diunduh. */
  catatan: string[];
}

export interface NeracaAirPublik {
  rentangHari: number;
  totalDisalurkanM3: number;
  totalTercatatM3: number;
  totalKehilanganM3: number;
  nrwPct: number;
  kelompok: KelompokNeraca[];
  perOrang: PemakaianPerOrang;
  tolokUkur: TolokUkur[];
  bulanan: TitikBulanan[];
  meta: MetaData;
}
