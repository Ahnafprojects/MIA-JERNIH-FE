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

/** Dari mana koordinat laporan berasal, dari bukti terkuat ke terlemah. */
export type SumberLokasi =
  | "GPS_PERANGKAT"
  | "DIPILIH_MANUAL"
  | "METER_TERDAFTAR"
  | "TIDAK_ADA";

export type KeyakinanLokasi = "TINGGI" | "SEDANG" | "RENDAH" | "TIDAK_DIKETAHUI";

/**
 * Hasil pemeriksaan server atas sebuah laporan.
 *
 * Seluruhnya bersifat PENANDA, bukan penolakan: laporan tetap tercatat apa
 * pun isinya. Bentuknya mengikuti blok `validasi` pada jawaban
 * `POST /api/tiket`.
 */
export interface ValidasiLaporan {
  keyakinanLokasi: KeyakinanLokasi;
  sumberLokasi: SumberLokasi;
  catatan: string[];
  jarakKeMeterM: number | null;
  jarakKeFotoM: number | null;
  fotoBerGps: number;
  jumlahFoto: number;
  /** Nomor seri meter yang laporannya terikat padanya. */
  terikatMeter: string | null;
  dugaanGanda: boolean;
  catatanGanda: string | null;
  nomorSerupa: string[];
}

export interface TiketBerhasil {
  nomor: string;
  sla: string;
  validasi?: ValidasiLaporan | null;
}
