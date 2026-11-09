"use client";

import { Suspense, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Transisi masuk setiap kali rute berpindah.
 *
 * ── Masalah yang diperbaiki ──────────────────────────────────────────
 *
 * Versi sebelumnya memasang `key={pathname}` lalu menyerahkan sisanya ke
 * kelas CSS `halaman-masuk`, dan animasinya memang BERJALAN. Rekaman bingkai
 * demi bingkai dari Beranda ke Riwayat membuktikannya: opacity 0 ke 1, geser
 * 10px ke 0, penuh 320ms. Tidak ada yang rusak pada animasinya sendiri.
 *
 * Yang rusak adalah APA yang dianimasikan:
 *
 *   t=  14ms  /beranda  tinggi 1667  animasi selesai
 *   t= 162ms  /riwayat  tinggi  368  animasi mulai      <- ambruk 78%
 *   t= 481ms  /riwayat  tinggi  925  animasi SUDAH habis
 *   t= 663ms  /riwayat  tinggi 1000
 *
 * Tiap halaman portal adalah komponen klien yang mengambil datanya sendiri
 * lewat hook, dengan keadaan memuat yang kembali lebih awal. Jadi yang
 * terpasang saat rute berganti hanyalah rangka setinggi 368px, sementara
 * halaman yang ditinggalkan 1667px. Isi sebenarnya baru tiba pada 481ms,
 * yaitu 161ms SETELAH animasinya habis, lalu melompat 368 ke 925 ke 1000
 * tanpa animasi sama sekali.
 *
 * Itu persis yang dilaporkan: "gada animasinya malah kek aneh". Animasinya
 * terpakai habis untuk rangka yang nyaris tidak sempat dilihat, dan yang
 * benar-benar dipandang orang muncul mendadak sesudahnya, disertai dokumen
 * yang ambruk ke seperempat tingginya lalu memanjang lagi.
 *
 * ── Dua hal yang dikerjakan berkas ini ───────────────────────────────
 *
 * 1. LANTAI TINGGI. Tinggi halaman yang ditinggalkan dipakai sebagai batas
 *    bawah sementara, jadi dokumen tidak ambruk saat rangka terpasang.
 *    Terukur: tinggi dokumen bertahan di 1617 selama 480ms penuh sampai
 *    isinya tiba, lalu meluncur turun; sebelumnya ia terjun seketika.
 *
 * 2. ISI YANG TERLAMBAT TETAP BERANIMASI. Rangka memudar masuk seketika
 *    seperti semula, dan ketika isi sungguhan akhirnya tiba ia mendapat
 *    gerakan mendarat pendek miliknya sendiri.
 *
 * ── Kenapa gerakan mendarat TIDAK mulai dari opacity 0 ───────────────
 *
 * Percobaan pertama menahan animasinya sampai isi tiba. Hasilnya terukur
 * lebih buruk: rangka tampil penuh lebih dulu, lalu pada 780ms mendadak
 * dijatuhkan ke opacity 0 dan memudar ulang. Yang terlihat bukan transisi
 * melainkan KEDIPAN, karena sesuatu yang sudah terbaca mata tiba-tiba
 * dihapus. Karena itu gerakan mendarat berangkat dari 0,55: cukup untuk
 * terbaca sebagai sesuatu yang baru mendarat, tidak cukup untuk terbaca
 * sebagai layar yang dikosongkan.
 *
 * ── Kenapa tanpa `key` dan tanpa kelas CSS baru ──────────────────────
 *
 * `key={pathname}` memasang ulang komponennya tiap perpindahan, jadi ingatan
 * tinggi halaman sebelumnya harus dititipkan ke komponen induk lewat prop
 * ref — dan `react-hooks/immutability` menolaknya, karena props dibekukan.
 * Maka gerakannya dijalankan lewat Web Animations API dari satu komponen
 * saja: tidak ada yang dipasang ulang, tidak ada ref yang menyeberang.
 *
 * Kelas `halaman-masuk` tetap dipakai untuk GAMBARAN PERTAMA, saat JS belum
 * tentu sempat berjalan. Perpindahan sesudahnya ditangani WAAPI. Tidak ada
 * kelas baru yang ditambahkan ke `globals.css`, dan itu disengaja: berkas itu
 * sedang dikerjakan bersamaan, dan menaruh kebutuhan berkas ini di sana hanya
 * menambah tempat yang bisa bentrok.
 *
 * `prefers-reduced-motion` mematikan GERAKANNYA, bukan isinya: lantai
 * tinggi, peluncuran, dan kedua gerakan dilewati seluruhnya. Terukur pada
 * jalur itu: nol animasi berjalan, opacity 1, tabel tetap tergambar.
 *
 * ── Kenapa ada `<Suspense>` di sini ──────────────────────────────────
 *
 * `usePathname()` membaca keadaan navigasi, dan keadaan itu belum ada saat
 * Next.js memprarender halaman di waktu bangun. Tanpa batas Suspense,
 * `next build` BERHENTI dengan `CLIENT_HOOK_DYNAMIC` pada rute berparameter,
 * dibuktikan oleh `/konsol/pelanggan/[id]` yang menggagalkan seluruh build.
 * Batasnya diletakkan DI DALAM komponen ini, bukan dibebankan ke setiap tata
 * letak yang memakainya.
 */

/** Gerakan masuk saat rute berganti, sepadan dengan @keyframes halaman-masuk. */
const DURASI_MASUK_MS = 320;

/** Gerakan masuk untuk isi yang baru tiba setelah rangka. */
const DURASI_MENDARAT_MS = 300;

/** Lama lantai tinggi meluncur turun setelah isinya menetap. */
const DURASI_LUNCUR_MS = 380;

/**
 * Batas menunggu isi sebelum lantai tingginya dilepas begitu saja.
 *
 * Isi Riwayat terukur tiba pada 481ms terhadap API produksi. 900ms memberi
 * kelonggaran untuk jaringan yang lebih lambat; kalau datanya belum juga
 * datang, lantainya tetap dilepas supaya halaman tidak menyisakan ruang
 * kosong yang menggantung tanpa batas.
 */
const BATAS_TUNGGU_MS = 900;

/**
 * Ambang untuk menyebut isinya "benar-benar berubah".
 *
 * Tanpa ambang, pergeseran satu-dua piksel dari pembulatan tata letak sudah
 * dianggap kedatangan isi.
 */
const AMBANG_PERUBAHAN_PX = 24;

const PELAN = "cubic-bezier(0.22, 0.72, 0.24, 1)";

/*
 * Kurva khusus peluncuran lantai, sengaja BEDA dari `PELAN`.
 *
 * `PELAN` sangat condong ke depan: ia menempuh separuh jaraknya dalam
 * sepersepuluh waktunya. Itu benar untuk opacity, tetapi salah untuk lantai
 * tinggi, karena bagian yang benar-benar terlihat hanyalah dari tinggi lama
 * sampai tinggi isi yang baru — di Riwayat 1667px ke 925px, yaitu 44% awal
 * rentangnya. Dengan `PELAN`, 44% itu habis dalam 66ms terukur dan
 * peluncurannya kembali terbaca sebagai sentakan. Kurva ini jauh lebih
 * merata: terukur 8 langkah halus, bukan 4.
 */
const MELUNCUR = "cubic-bezier(0.4, 0, 0.2, 1)";

const hematGerak = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TransisiHalaman({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="motion-aware halaman-masuk">{children}</div>}
    >
      <BerkunciPadaRute>{children}</BerkunciPadaRute>
    </Suspense>
  );
}

function BerkunciPadaRute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const luar = useRef<HTMLDivElement>(null);
  const dalam = useRef<HTMLDivElement>(null);
  const tinggiTerakhir = useRef(0);
  const pertamaKali = useRef(true);

  useLayoutEffect(() => {
    const kotak = luar.current;
    const isi = dalam.current;
    if (!kotak || !isi) return;

    /*
     * Dibaca SEKARANG, sebelum apa pun disentuh.
     *
     * Effect tata letak berjalan setelah DOM baru dipasang tetapi sebelum
     * peramban menggambar, dan `tinggiTerakhir` baru diperbarui di ujung
     * effect ini. Jadi hanya di momen ini angkanya masih memuat tinggi
     * halaman LAMA, dan hanya di sini ia bisa dibaca.
     */
    const lantai = tinggiTerakhir.current;
    const tinggiAwal = isi.offsetHeight;

    const catat = () => {
      tinggiTerakhir.current = isi.offsetHeight;
    };

    // Gambaran pertama sudah diurus kelas CSS-nya, dan belum ada halaman
    // sebelumnya yang tingginya perlu ditahan.
    if (pertamaKali.current) {
      pertamaKali.current = false;
      catat();
      return;
    }

    if (hematGerak()) {
      catat();
      return;
    }

    /*
     * Bersihkan gerakan perpindahan sebelumnya.
     *
     * Elemen ini tidak pernah dipasang ulang, sementara tiap gerakan dibuat
     * dengan `fill: "both"` supaya keadaan akhirnya bertahan. Akibatnya objek
     * animasinya ikut bertahan: terbaca di rekaman sebagai `undefined:finished`
     * yang menumpuk satu per perpindahan, dan pada sesi panjang ia menjadi
     * ratusan objek yang menggantung di satu elemen.
     *
     * Aman dibatalkan karena keadaan akhir setiap gerakan ini memang sama
     * dengan keadaan wajar elemennya: opacity 1, tanpa geseran.
     */
    for (const lama of isi.getAnimations()) lama.cancel();

    // Perpindahan: elemennya TIDAK dipasang ulang, jadi animasi CSS tidak
    // berjalan lagi dengan sendirinya. WAAPI yang menjalankannya.
    isi.animate(
      [
        { opacity: 0, transform: "translate3d(0, 10px, 0)" },
        { opacity: 1, transform: "translate3d(0, 0, 0)" },
      ],
      { duration: DURASI_MASUK_MS, easing: PELAN, fill: "both" },
    );

    if (lantai > tinggiAwal) {
      kotak.style.minHeight = `${lantai}px`;
    }

    let sudah = false;
    const lepaskan = (isinyaBerubah: boolean) => {
      if (sudah) return;
      sudah = true;
      pengamat?.disconnect();
      window.clearTimeout(jam);

      /*
       * Gerakan mendarat hanya untuk isi yang datang TERLAMBAT.
       *
       * Kalau isinya tiba sementara gerakan masuk masih berjalan, gerakan itu
       * sendiri sudah membawanya. Menumpuk gerakan kedua di atasnya membuat
       * halaman bergoyang dua kali.
       */
      const masihBergerak = isi
        .getAnimations()
        .some((a) => a.playState === "running");

      if (isinyaBerubah && !masihBergerak) {
        isi.animate(
          [
            { opacity: 0.55, transform: "translate3d(0, 8px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ],
          { duration: DURASI_MENDARAT_MS, easing: PELAN, fill: "both" },
        );
      }

      if (kotak.style.minHeight) {
        // Dicabut langsung, dokumen menyentak persis seperti sebelum berkas
        // ini ada. Jadi lantainya diturunkan, bukan dicabut.
        kotak.style.transition = `min-height ${DURASI_LUNCUR_MS}ms ${MELUNCUR}`;
        kotak.style.minHeight = "0px";
        window.setTimeout(() => {
          kotak.style.transition = "";
          kotak.style.minHeight = "";
          catat();
        }, DURASI_LUNCUR_MS + 40);
      } else {
        catat();
      }
    };

    /*
     * Laporan PERTAMA `ResizeObserver` dipakai sebagai patokan, bukan sebagai
     * perubahan.
     *
     * `observe()` selalu mengantar satu laporan berisi ukuran saat itu juga.
     * Dibaca sebagai "isinya berubah", laporan itu melepaskan lantainya pada
     * bingkai berikutnya — terukur pada t=182ms, padahal isi Riwayat baru tiba
     * pada t=638ms. Lantainya lepas sebelum sempat berguna.
     */
    let patokan = tinggiAwal;
    let pertamaLapor = true;

    const pengamat =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (pertamaLapor) {
              pertamaLapor = false;
              patokan = isi.offsetHeight;
              return;
            }
            if (Math.abs(isi.offsetHeight - patokan) >= AMBANG_PERUBAHAN_PX) {
              lepaskan(true);
            }
          })
        : null;
    pengamat?.observe(isi);

    const jam = window.setTimeout(() => lepaskan(false), BATAS_TUNGGU_MS);

    return () => {
      pengamat?.disconnect();
      window.clearTimeout(jam);
      kotak.style.transition = "";
      kotak.style.minHeight = "";
    };
  }, [pathname]);

  return (
    <div ref={luar}>
      <div ref={dalam} className="motion-aware halaman-masuk">
        {children}
      </div>
    </div>
  );
}
