/**
 * Bentuk jawaban endpoint publik (`/api/publik/*`).
 *
 * Harus sama persis dengan yang dikirim backend — lihat issue BE#2 di repo
 * MIA-JERNIH-BE. Kalau backend mengubah bentuknya, berkas ini ikut diubah
 * dalam PR yang sama, jangan ditebak sendiri di halaman.
 */

/** Satu kartu KPI. Dicari lewat `key`, JANGAN lewat indeks atau `label`. */
export interface Kpi {
  key: string;
  label: string;
  value: number;
  unit?: string;
  delta?: string;
  tone?: "success" | "warn" | "danger" | "neutral";
}

/** Nilai satu KPI, atau `null` bila server tidak mengirimnya. */
export function nilaiKpi(kpi: Kpi[], key: string): number | null {
  const k = kpi.find((x) => x.key === key);
  return k && Number.isFinite(k.value) ? k.value : null;
}

export type StatusZona = "normal" | "gangguan" | "perbaikan";

export interface ZonaStatus {
  id: string;
  nama: string;
  status: StatusZona;
  pelangganTerdampak: number;
  sejak: string | null;
  perkiraanPulih: string | null;
  keterangan: string | null;
}

export interface StatusLayanan {
  zona: ZonaStatus[];
  ringkas: Record<StatusZona, number>;
  ts: string;
}

export interface LangkahKronologi {
  waktu: string;
  judul: string;
  catatan?: string;
}

export interface LacakTiket {
  nomor: string;
  kategori: string;
  status: "BARU" | "DIPROSES" | "SELESAI";
  zona: string;
  dibuatPada: string;
  slaJatuhTempo: string;
  slaTerlampaui: boolean;
  kronologi: LangkahKronologi[];
}

export interface Deret {
  name: string;
  unit?: string;
  points: number[];
}

export interface KinerjaPublik {
  periode: { mulai: string; selesai: string; hari: number };
  kpi: Kpi[];
  perKategori: {
    kategori: string;
    masuk: number;
    selesai: number;
    ketepatanPct: number;
  }[];
  tren: { labels: string[]; series: Deret[] };
}

export interface StatistikPublik {
  pelangganTerlayani: number;
  volumeDisalurkanM3: number;
  volumeTercatatM3: number;
  nrwPct: number;
  jumlahZona: number;
  labels: string[];
  series: Deret[];
  perZona: {
    nama: string;
    pelanggan: number;
    volumeM3: number;
    nrwPct: number;
  }[];
}
