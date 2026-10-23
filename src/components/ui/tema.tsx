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
    pasangTema(baru);
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

/**
 * Memasang tema ke elemen akar.
 *
 * Menulis DUA penanda, dan keduanya diperlukan:
 *
 * - kelas `dark` — yang dibaca Tailwind untuk menukar token warna.
 * - `data-theme` — penanda EKSPLISIT untuk tema terang maupun gelap.
 *
 * Tanpa `data-theme`, tema terang tidak meninggalkan jejak apa pun di DOM:
 * ia hanya berarti "kelas dark tidak ada". Komponen pihak ketiga yang mencari
 * tema lalu tidak menemukannya akan jatuh ke `prefers-color-scheme` —
 * sehingga peta MapLibre tetap memakai basemap hitam padahal halamannya
 * sudah terang, karena sistem operasi penggunanya gelap.
 */
function pasangTema(gelap: boolean): void {
  const akar = document.documentElement;
  akar.classList.toggle("dark", gelap);
  akar.dataset.theme = gelap ? "dark" : "light";
}

/** Dijalankan sebelum render pertama; mencegah kedip tema saat muat halaman. */
export const skripTema = `
(function(){try{
  var t=localStorage.getItem("${KUNCI}");
  var g=t?t==="gelap":matchMedia("(prefers-color-scheme: dark)").matches;
  var r=document.documentElement;
  if(g)r.classList.add("dark");
  r.dataset.theme=g?"dark":"light";
}catch(e){}})();
`;
