/**
 * Aksi konsol terhadap pelanggan: relay dan email.
 *
 * ── Kenapa berkas ini ada ─────────────────────────────────────────────
 *
 * Sebelumnya tombol "Tutup aliran", "Buka aliran", dan "Kirim email" di
 * daftar dan detail pelanggan hanya MENAMPILKAN pesan sukses. Tidak satu
 * permintaan pun dikirim ke server, padahal pesannya menulis "Tercatat di
 * audit log atas nama akun Anda". Petugas yang menutup aliran sebuah rumah
 * mengira airnya sudah berhenti; muat ulang halaman, dan relaynya masih
 * terbuka.
 *
 * Endpointnya sudah lama ada (BE src/rute/meter.ts dan konsol.ts). Semua
 * panggilan dikumpulkan di sini supaya daftar dan detail memakai jalur yang
 * sama, dan pesan sukses hanya muncul untuk yang memang berhasil.
 */
import { api, ApiError } from "@/lib/api";
import type { IsiTutupRelay } from "./dialog-relay";

/** Satu kalimat alasan untuk server, yang menuntut minimal tiga karakter. */
export function alasanRelay(isi: IsiTutupRelay): string {
  const ket = isi.keterangan.trim();
  return ket ? `${isi.alasan}: ${ket}` : isi.alasan;
}

/** `meterId` adalah id METER, bukan id pengguna. */
export async function ubahRelay(
  meterId: string,
  aksi: "buka" | "tutup",
  alasan: string,
): Promise<void> {
  await api(`/api/meter/${encodeURIComponent(meterId)}/relay`, {
    method: "POST",
    body: JSON.stringify({ aksi, alasan }),
  });
}

/**
 * `id` boleh id pengguna maupun id meter; server memetakan keduanya
 * (`idPenggunaDariIdKonsol` di BE src/rute/konsol.ts).
 */
export async function kirimEmailPelanggan(
  id: string,
  subjek: string,
  pesan: string,
): Promise<void> {
  await api(`/api/admin/pelanggan/${encodeURIComponent(id)}/email`, {
    method: "POST",
    body: JSON.stringify({ subjek, pesan }),
  });
}

/** Email pengingat isi ulang. Isinya tidak menyebut angka saldo: angka itu
 *  bisa sudah basi saat dibaca, dan portal selalu menampilkan yang terbaru. */
export const EMAIL_PENGINGAT = {
  subjek: "Pengingat saldo air Jernih",
  pesan:
    "Petugas Jernih mengingatkan Anda untuk memeriksa sisa saldo air pada meter Anda. " +
    "Sisa saldo terbaru selalu tampil di halaman Beranda portal Jernih. " +
    "Bila saldo menipis, beli token di halaman Beli Token lalu masukkan kodenya di halaman Isi Token atau langsung di keypad meter.",
};

export function emailPenutupan(alasan: string) {
  return {
    subjek: "Aliran air meter Anda ditutup sementara",
    pesan:
      `Petugas Jernih menutup aliran air pada meter Anda. Alasan: ${alasan}. ` +
      "Bila penutupan karena saldo habis, aliran bisa dibuka kembali dari portal setelah token dimasukkan. " +
      "Untuk alasan lain, hubungi layanan pelanggan Jernih dan sebutkan nomor meter Anda.",
  };
}

export interface HasilBanyak {
  berhasil: string[];
  gagal: { id: string; pesan: string }[];
}

/**
 * Jalankan satu aksi untuk banyak pelanggan, BERURUTAN.
 *
 * Berurutan, bukan `Promise.all`: backend memasang batas 300 permintaan per
 * menit per alamat, dan ratusan permintaan serentak dari satu konsol akan
 * menolak dirinya sendiri di tengah jalan. Kegagalan satu pelanggan tidak
 * menghentikan yang lain, dan tiap kegagalan dicatat dengan pesan servernya.
 */
export async function jalankanBanyak(
  ids: string[],
  aksi: (id: string) => Promise<void>,
): Promise<HasilBanyak> {
  const hasil: HasilBanyak = { berhasil: [], gagal: [] };
  for (const id of ids) {
    try {
      await aksi(id);
      hasil.berhasil.push(id);
    } catch (e) {
      hasil.gagal.push({
        id,
        pesan: e instanceof ApiError ? e.message : "Permintaan gagal.",
      });
    }
  }
  return hasil;
}

export function pesanGalat(e: unknown, cadangan: string): string {
  return e instanceof ApiError ? e.message : cadangan;
}
