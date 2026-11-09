"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
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

export function TombolTema({
  className,
  label,
  ukuranIkon = 18,
}: {
  className?: string;
  /**
   * Teks yang tergambar DI DALAM tombol, untuk dipakai sebagai baris menu.
   *
   * Sebelumnya tombol ini tidak bisa membawa label, dan pemanggil yang
   * membutuhkannya memakai jalan pintas: tombolnya direntangkan
   * `absolute inset-0 z-10 w-full` menutupi seluruh baris, lalu teksnya
   * digambar di lapisan TERPISAH di bawahnya dengan `pointer-events-none`.
   *
   * Susunan itu rapuh pada satu titik yang tidak terlihat saat ditulis:
   * tombolnya berada di atas, jadi latar apa pun yang ia cat akan menutupi
   * teks yang seharusnya ia beri nama. `hover:bg-soft` melakukan persis itu,
   * menyapukan #e3edf0 selebar baris dan menyisakan ikon di tepi kiri dengan
   * kapsul kosong memanjang ke kanan.
   *
   * Karena itu labelnya sekarang masuk ke DALAM tombol. Tidak ada lagi dua
   * lapisan yang bisa saling menutup, dan seluruh lebar baris tetap bisa
   * ditekan karena tombolnya memang baris itu sendiri.
   */
  label?: string;
  ukuranIkon?: number;
}) {
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
      /*
       * Nama yang dibacakan pembaca layar mengikuti apa yang TERLIHAT.
       *
       * Saat labelnya tergambar, `aria-label` tidak dipasang: menimpanya
       * dengan kalimat lain membuat nama yang terdengar berbeda dari tulisan
       * yang terbaca, sehingga perintah suara "klik Tema terang / gelap"
       * tidak menemukan sasarannya. Keadaan nyala/mati disampaikan lewat
       * `aria-pressed`, yang memang disediakan untuk tombol dwi-keadaan.
       *
       * Tanpa label, ikonnya sendirian dan tidak menyisakan teks apa pun
       * untuk dibacakan, jadi di situ `aria-label` tetap wajib.
       */
      aria-label={
        label ? undefined : gelap ? "Ganti ke tema terang" : "Ganti ke tema gelap"
      }
      aria-pressed={label ? gelap : undefined}
      /*
       * Cincin fokus dibawa KOMPONENNYA, bukan dititipkan ke pemanggil.
       *
       * Sebelumnya `className` pemanggil adalah satu-satunya gaya yang ada
       * di sini — tombol ini tidak punya hover maupun cincin bawaan sama
       * sekali. Hasilnya tergantung siapa yang memakainya: bilah publik
       * menulis cincinnya sendiri, tempat lain lupa, dan tombol yang sama
       * berperilaku berbeda di dua halaman.
       *
       * `className` tetap ditaruh SESUDAHNYA supaya pemanggil masih bisa
       * menimpa — bilah gelap, misalnya, perlu cincin terang.
       */
      className={cn(
        "cincin-fokus transition-colors hover:text-ink",
        className,
      )}
    >
      {label ? (
        <>
          {/* Ikon diredupkan dan teksnya penuh, mengikuti baris menu
              sebelahnya: di sana ikon adalah penanda, teks adalah isinya. */}
          {gelap ? (
            <Sun size={ukuranIkon} aria-hidden className="shrink-0 text-muted" />
          ) : (
            <Moon
              size={ukuranIkon}
              aria-hidden
              className="shrink-0 text-muted"
            />
          )}
          <span>{label}</span>
        </>
      ) : gelap ? (
        <Sun size={ukuranIkon} aria-hidden />
      ) : (
        <Moon size={ukuranIkon} aria-hidden />
      )}
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

/**
 * Dijalankan sebelum render pertama; mencegah kedip tema saat muat halaman.
 *
 * BAWAANNYA TERANG, bukan mengikuti setelan sistem.
 *
 * Sebelumnya baris ini jatuh ke `prefers-color-scheme`, sehingga pengunjung
 * ber-OS gelap membuka situs dalam keadaan gelap tanpa pernah memilihnya.
 * Untuk portal yang dibuka orang asing — dan dinilai juri yang laptopnya bisa
 * saja bertema gelap — tampilan pertama harus tema yang memang dirancang dan
 * diperiksa, bukan yang kebetulan dipakai perangkatnya.
 *
 * Pilihan pengguna tetap dihormati: begitu tombol tema ditekan, pilihannya
 * tersimpan di localStorage dan dipakai di kunjungan berikutnya.
 */
export const skripTema = `
(function(){try{
  var t=localStorage.getItem("${KUNCI}");
  var g=t==="gelap";
  var r=document.documentElement;
  if(g)r.classList.add("dark");
  r.dataset.theme=g?"dark":"light";
}catch(e){}})();
`;
