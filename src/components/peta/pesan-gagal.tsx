"use client";

import { useSyncExternalStore } from "react";

/**
 * Pesan yang tampil saat peta gagal digambar.
 *
 * Sebelumnya kalimatnya dipatok: "Peramban ini tidak mendukung WebGL." Batas
 * galat di pembungkus peta menangkap SEMUA lemparan, jadi kalimat itu ikut
 * tampil untuk sebab apa pun — dan sebab yang sebenarnya pernah terjadi
 * adalah satu medan data yang hilang dari jawaban server, pada peramban yang
 * WebGL-nya sehat.
 *
 * Pesan yang menuding hal yang salah bukan sekadar kurang rapi: ia mengirim
 * orang memeriksa kartu grafis dan setelan peramban, sementara yang rusak ada
 * di server. Jadi di sini WebGL benar-benar DIPERIKSA, dan kalimatnya
 * mengikuti hasil pemeriksaan.
 */

/**
 * Hasil pemeriksaan disimpan sekali.
 *
 * `getSnapshot` boleh dipanggil berkali-kali tiap render; membuat elemen
 * `<canvas>` baru setiap kali adalah pemborosan yang tidak perlu, dan
 * dukungan WebGL tidak berubah selama halaman hidup.
 */
let tersimpan: boolean | null = null;

function dukunganWebgl(): boolean {
  if (tersimpan !== null) return tersimpan;
  try {
    const kanvas = document.createElement("canvas");
    tersimpan = Boolean(
      kanvas.getContext("webgl2") ??
        kanvas.getContext("webgl") ??
        kanvas.getContext("experimental-webgl"),
    );
  } catch {
    // Sebagian peramban MELEMPAR alih-alih mengembalikan null saat WebGL
    // dimatikan lewat setelan. Hasilnya sama: tidak tersedia.
    tersimpan = false;
  }
  return tersimpan;
}

const toko = {
  // Nilainya tidak pernah berubah selama halaman hidup, jadi tidak ada yang
  // perlu dilanggani — tetapi React tetap menuntut fungsi pembatalan.
  langganan: () => () => {},
  bacaKlien: dukunganWebgl,
  /*
   * Di server dianggap DIDUKUNG, sehingga kalimat yang tampil lebih dulu
   * adalah yang umum. Menebak "tidak didukung" di server berarti menuduh
   * peramban orang untuk kegagalan yang belum tentu sebabnya itu.
   */
  bacaServer: () => true,
};

export function PesanPetaGagal({
  /** Apa yang MASIH bisa dibaca meski petanya gagal. */
  sisa = "daftar zona di bawah",
}: {
  sisa?: string;
}) {
  const adaWebgl = useSyncExternalStore(
    toko.langganan,
    toko.bacaKlien,
    toko.bacaServer,
  );

  return (
    <div className="px-5 py-10 text-center">
      <p className="font-display font-bold">Peta tidak bisa ditampilkan</p>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted">
        {adaWebgl
          ? "Terjadi kesalahan saat menggambar peta."
          : "Peramban ini tidak mendukung WebGL, sehingga peta tidak bisa digambar."}{" "}
        Seluruh isinya tetap tersedia sebagai {sisa}.
      </p>
    </div>
  );
}
