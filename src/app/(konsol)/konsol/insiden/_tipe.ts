/** Satu insiden `GET /api/admin/insiden`. */
export interface Insiden {
  id: string;
  tipe: string;
  keparahan: string;
  judul: string;
  detail: string;
  status: string;
  meterId: string | null;
  zona: string | null;
  teknisi: { nama: string } | null;
  dibukaPada: string;
  ditutupPada: string | null;
}

export interface JawabanInsiden {
  insiden: Insiden[];
}
