"use client";

import { useSyncExternalStore } from "react";

export const KUNCI_RINGKAS = "jernih-konsol-ringkas";

/*
 * Lebar sidebar disimpan di DOM (`data-konsol` pada <html>), bukan di state
 * React — pola yang sama persis dengan tombol tema.
 *
 * Alasannya juga sama: `useSyncExternalStore` membacanya langsung dari sana,
 * jadi tidak perlu "set state di dalam effect" yang memicu render berantai,
 * dan nilai render pertamanya cocok dengan yang dipasang skrip di <head>
 * sehingga tidak ada kedipan lebar saat berpindah halaman.
 *
 * Kenapa diingat sama sekali: konsol ini dipelototi berjam-jam. Sidebar yang
 * kembali melebar tiap kali petugas membuka halaman lain adalah gangguan yang
 * terasa puluhan kali sehari.
 */
const toko = {
  langganan(ubah: () => void) {
    const pengamat = new MutationObserver(ubah);
    pengamat.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-konsol"],
    });
    return () => pengamat.disconnect();
  },
  bacaKlien: () => document.documentElement.dataset.konsol === "ringkas",
  bacaServer: () => false,
};

export function useRingkas(): boolean {
  return useSyncExternalStore(toko.langganan, toko.bacaKlien, toko.bacaServer);
}

export function setRingkas(ringkas: boolean): void {
  const akar = document.documentElement;
  if (ringkas) akar.dataset.konsol = "ringkas";
  else delete akar.dataset.konsol;
  try {
    localStorage.setItem(KUNCI_RINGKAS, ringkas ? "1" : "0");
  } catch {
    // Mode penyamaran memblokir localStorage. Lebarnya tetap berganti untuk
    // sesi ini, hanya tidak diingat. Bukan alasan untuk gagal.
  }
}

/** Dijalankan sebelum render pertama; mencegah sidebar berkedip lebar. */
export const skripRingkas = `
(function(){try{
  if(localStorage.getItem("${KUNCI_RINGKAS}")==="1")
    document.documentElement.dataset.konsol="ringkas";
}catch(e){}})();
`;
