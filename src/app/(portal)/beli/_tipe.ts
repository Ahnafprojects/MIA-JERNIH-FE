export interface PaketOpsi {
  volumeL: number;
  hargaRp: number;
  label: string;
}

export interface DataPaketResponse {
  golongan: string;
  tarifPerLiter: number;
  minimalLiter: number;
  /**
   * Batas atas satu kali pembelian, dari server.
   *
   * Opsional karena server lama belum mengirimnya; pemakainya menyediakan
   * nilai cadangan. Tanpa batas ini warga bisa mengetik berapa pun digit
   * sampai muncul tagihan dua puluh digit yang menjulur keluar kartu — dan
   * server menerimanya, sampai batas 100.000 L ditambahkan di backend.
   */
  maksimalLiter?: number;
  paket: PaketOpsi[];
}

export type ModePilihan = "paket" | "bebas";
