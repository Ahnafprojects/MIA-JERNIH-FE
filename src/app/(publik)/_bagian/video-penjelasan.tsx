"use client";

import { useEffect, useState } from "react";

const SUMBER = "/penjelasan.mp4";
const POSTER = "/penjelasan.jpg";
const TAKARIR = "/penjelasan.id.vtt";

/**
 * Pemutar video penjelasan 90 detik.
 *
 * SENGAJA BERBEDA DARI VIDEO HERO, dan perbedaannya bukan selera:
 *
 * - Hero itu LATAR: tanpa kontrol, tanpa suara, berjalan terus. Ia tidak
 *   meminta apa pun dari pengguna.
 * - Yang ini ISI: punya kontrol penuh, bersuara, dan TIDAK PERNAH berjalan
 *   sendiri. Video 90 detik bersuara yang menyala tanpa diminta adalah
 *   salah satu hal yang paling cepat membuat orang menutup halaman.
 *
 * `preload="none"`: tanpa ini browser mengunduh video 90 detik untuk setiap
 * pengunjung landing, termasuk yang tidak pernah menontonnya. Yang terunduh
 * di awal hanya gambar posternya.
 */
export function VideoPenjelasan() {
  const [gagal, setGagal] = useState(false);

  /*
   * Keberadaan berkasnya DITANYAKAN, tidak ditunggu.
   *
   * `onError` pada <video> tidak pernah berbunyi selama `preload="none"`,
   * karena browser memang belum mencoba memuat apa pun. Akibatnya saat
   * berkasnya belum ada, yang tampil kotak hitam dengan tombol putar yang
   * gagal ketika ditekan — keadaan paling buruk dari semuanya, karena
   * terlihat seperti situsnya rusak.
   *
   * Satu permintaan HEAD hanya mengambil kepala tanggapan, bukan isinya,
   * jadi janji "tidak mengunduh 90 detik video di awal" tetap ditepati.
   */
  useEffect(() => {
    let batal = false;
    fetch(SUMBER, { method: "HEAD" })
      .then((r) => {
        if (!batal && !r.ok) setGagal(true);
      })
      .catch(() => {
        if (!batal) setGagal(true);
      });
    return () => {
      batal = true;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-sheet border border-line lapis-permukaan">
      {gagal ? (
        /*
         * Keadaan cadangan saat berkasnya belum ada atau gagal dimuat.
         *
         * Seksi yang menampilkan pemutar rusak lebih buruk daripada seksi
         * yang mengakui videonya belum ada — terutama di halaman yang
         * seluruh gagasannya tentang keterbukaan.
         */
        <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-soft px-6 text-center">
          <p className="font-display text-lg font-semibold">
            Videonya belum terpasang
          </p>
          <p className="max-w-sm text-[13.5px] leading-relaxed text-muted">
            Seluruh isinya juga tersedia sebagai teks di Status Layanan, Lacak
            Pengaduan, Rapor Kinerja, dan Statistik — tidak ada satu pun
            keterangan yang hanya hidup di dalam video.
          </p>
        </div>
      ) : (
        <video
          className="block aspect-video w-full bg-brand-900"
          controls
          preload="none"
          poster={POSTER}
          playsInline
          onError={() => setGagal(true)}
        >
          <source src={SUMBER} type="video/mp4" />
          {/*
            Takarir WAJIB, dan bukan sekadar untuk aksesibilitas: videonya
            tidak bernarasi suara, jadi takarir adalah satu-satunya bentuk
            isinya yang bisa dibaca mesin pencari, dibaca orang yang menonton
            tanpa suara, dan dibaca cepat oleh juri.
          */}
          <track
            kind="captions"
            src={TAKARIR}
            srcLang="id"
            label="Bahasa Indonesia"
            default
          />
        </video>
      )}
    </div>
  );
}
