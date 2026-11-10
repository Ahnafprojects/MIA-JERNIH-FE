export interface TiketKanban {
  id: string;
  nomor: string;
  kategori: string;
  deskripsi: string;
  status: string;
  zona: string | null;
  pelapor: { nama: string };
  teknisi: string | null;
  slaJatuhTempo: string;
  slaTerlampaui: boolean;
}

export const KOLOM_STATUS = ["BARU", "DIPROSES", "SELESAI"] as const;
