export interface TiketItem {
  id: string;
  nomor: string;
  kategori: string;
  deskripsi: string;
  status: "BARU" | "DIPROSES" | "SELESAI";
  slaJatuhTempo: string;
  slaTerlampaui?: boolean;
  dibuatPada: string;
  selesaiPada?: string | null;
}

export type TabAktif = "lapor" | "tiket" | "faq";

export interface TiketBerhasil {
  nomor: string;
  sla: string;
}
