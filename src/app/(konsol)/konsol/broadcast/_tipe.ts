export interface RiwayatBroadcast {
  id: string;
  judul: string;
  pesan: string;
  target: string;
  kanalPush: boolean;
  kanalEmail: boolean;
  kanalTelegram: boolean;
  penerima: number;
  dibuka: number;
  dibuatPada: string;
}

export interface Zona {
  id: string;
  nama: string;
}

export interface JawabanBroadcast {
  broadcast: RiwayatBroadcast[];
  zona?: Zona[];
}

/**
 * Label target yang dibaca operator, beserta arti sebenarnya.
 *
 * Artinya ditulis di sini karena dulu label dan perilakunya tidak cocok:
 * "Saldo ≤ 5 L" dikirim ke SELURUH warga, sebab backend hanya menyimpan
 * pilihan itu tanpa menyaringnya. Pilihan "Tunggakan" dihapus: produknya
 * prabayar, jadi tidak ada warga yang bisa menunggak. Penyaringnya kini ada di
 * BE src/lib/sasaran-broadcast.ts, dan kalimat di bawah mengikutinya.
 */
export const TARGET: Record<string, { label: string; arti: string }> = {
  SEMUA_WARGA: {
    label: "Semua warga",
    arti: "Seluruh warga yang akunnya aktif. Bila kanal Telegram dipilih, pengumuman juga terbit di channel Jernih.",
  },
  ZONA: { label: "Per zona", arti: "Warga yang terdaftar di zona yang dipilih." },
  SALDO_RENDAH: {
    label: "Saldo di ambang alarm",
    arti: "Warga yang memegang meter dengan saldo di bawah atau sama dengan ambang alarm meternya (bawaan 5 L).",
  },
};

/** Kanal yang dipakai satu siaran, mis. " · lewat aplikasi, Telegram". */
export function kanalRiwayat(b: RiwayatBroadcast): string {
  const kanal = [
    b.kanalPush && "aplikasi",
    b.kanalEmail && "email",
    b.kanalTelegram && "Telegram",
  ].filter(Boolean);
  return kanal.length > 0 ? ` · lewat ${kanal.join(", ")}` : "";
}
