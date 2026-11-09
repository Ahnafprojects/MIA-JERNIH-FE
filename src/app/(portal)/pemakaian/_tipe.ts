export interface TitikEmber {
  waktu: string;
  volumeL: number;
}

/**
 * Tiga rentang riwayat konsumsi.
 *
 * Pilihan "6bulan" yang lama DIHAPUS karena datanya tidak pernah ada —
 * versi sebelumnya menambalnya dengan enam angka yang ditulis mati
 * ("Mei 4.200 L, Jun 3.900 L, …"), sama untuk setiap warga, tergambar rapi
 * tanpa satu pun berasal dari meternya.
 *
 * Penggantinya tetap dibatasi oleh apa yang benar-benar dikirim server.
 * Lihat `JANGKAUAN_HARI` di `_konstanta.ts`.
 */
export type ModeGrafik = "bulan" | "tahun" | "pilih";

export interface RingkasanKpi {
  hariIniL: number;
  mingguIniL: number;
  bulanIniL: number;
  rataRataHarianL: number;
}

/** Satu kolom pada grafik riwayat konsumsi. Bentuknya mengikuti `KolomAir`. */
export interface TitikGrafik {
  label: string;
  nilai: number;
}

export interface JamBoros {
  jam: number;
  rataL: number;
}

export interface ProyeksiSaldo {
  labels: string[];
  deret: { name: string; unit: string; points: number[] }[];
  hariPenuh: number;
  /** Jarak antar titik dalam hari; >1 saat saldonya besar. */
  langkah: number;
}

/** Tanggal paling awal dan paling akhir yang benar-benar punya rekaman. */
export interface JangkauanData {
  mulai: string;
  akhir: string;
}
