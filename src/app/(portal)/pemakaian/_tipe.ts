export interface TitikEmber {
  waktu: string;
  volumeL: number;
}

export type RentangGrafik = "7hari" | "6bulan";

export interface RingkasanKpi {
  hariIniL: number;
  mingguIniL: number;
  bulanIniL: number;
  rataRataHarianL: number;
  rasioZonaPersen: number;
}
