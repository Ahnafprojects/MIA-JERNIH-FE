export interface PaketOpsi {
  volumeL: number;
  hargaRp: number;
  label: string;
}

export interface DataPaketResponse {
  golongan: string;
  tarifPerLiter: number;
  minimalLiter: number;
  paket: PaketOpsi[];
}

export type ModePilihan = "paket" | "bebas";
