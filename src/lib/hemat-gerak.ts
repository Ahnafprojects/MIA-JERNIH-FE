"use client";

import { useSyncExternalStore } from "react";

const KUERI = "(prefers-reduced-motion: reduce)";

/**
 * `true` bila pengguna meminta gerakan dikurangi.
 *
 * Dibaca lewat `useSyncExternalStore`, bukan `useState` + effect: nilainya
 * sudah benar pada render PERTAMA, sehingga tidak ada animasi yang sempat
 * mulai lalu dibatalkan sepersekian detik kemudian — dan tidak ada panggilan
 * `setState` di dalam effect, yang memicu render berantai dan memang dilarang
 * aturan lint proyek ini.
 *
 * Tinggal di `src/lib` karena dipakai dua tempat yang tidak saling mengenal:
 * grafik dan klip hero. Dua salinan hook yang sama adalah cara paling pelan
 * untuk membuat keduanya berbeda perilaku enam bulan lagi.
 */
export function useHematGerak(): boolean {
  return useSyncExternalStore(
    (ubah) => {
      const mq = window.matchMedia(KUERI);
      mq.addEventListener("change", ubah);
      return () => mq.removeEventListener("change", ubah);
    },
    () => window.matchMedia(KUERI).matches,
    // Di server tidak ada preferensi yang bisa dibaca; anggap gerakan boleh,
    // lalu klien mengoreksinya sendiri bila perlu.
    () => false,
  );
}
