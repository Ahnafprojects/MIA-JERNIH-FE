"use client";

import { useSyncExternalStore } from "react";

const KUERI = "(prefers-reduced-motion: reduce)";

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
