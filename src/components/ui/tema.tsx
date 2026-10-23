"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const KUNCI = "jernih-tema";

/*
 * Tema disimpan di DOM (kelas `dark` pada <html>), bukan di state React.
 *
 * `useSyncExternalStore` membacanya langsung dari sana. Itu menghindari
 * pola "set state di dalam effect" yang memicu render berantai, sekaligus
 * memberi nilai server yang benar saat render pertama sehingga tidak ada
 * ketidakcocokan hidrasi.
 */
const toko = {
  langganan(ubah: () => void) {
    const pengamat = new MutationObserver(ubah);
    pengamat.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => pengamat.disconnect();
  },
  bacaKlien: () => document.documentElement.classList.contains("dark"),
  // Di server kelas `dark` belum ada; skrip di <head> yang memasangnya
  // sebelum React jalan.
  bacaServer: () => false,
};

export function TombolTema({ className }: { className?: string }) {
  const gelap = useSyncExternalStore(
    toko.langganan,
    toko.bacaKlien,
    toko.bacaServer,
  );

  function ganti() {
    const baru = !gelap;
    document.documentElement.classList.toggle("dark", baru);
    try {
      localStorage.setItem(KUNCI, baru ? "gelap" : "terang");
    } catch {
      // Mode penyamaran memblokir localStorage. Temanya tetap berganti untuk
      // sesi ini, hanya tidak diingat. Bukan alasan untuk gagal.
    }
  }

  return (
    <button
      type="button"
      onClick={ganti}
      aria-label={gelap ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      className={className}
    >
      {gelap ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

/** Dijalankan sebelum render pertama; mencegah kedip tema saat muat halaman. */
export const skripTema = `
(function(){try{
  var t=localStorage.getItem("${KUNCI}");
  var g=t?t==="gelap":matchMedia("(prefers-color-scheme: dark)").matches;
  if(g)document.documentElement.classList.add("dark");
}catch(e){}})();
`;
