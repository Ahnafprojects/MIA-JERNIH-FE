"use client";

/**
 * Geser untuk konfirmasi.
 *
 * Dipakai hanya untuk tindakan yang TIDAK bisa dibatalkan dengan satu klik —
 * menutup aliran air ke rumah orang. Tombol biasa terlalu mudah ditekan oleh
 * tangan yang sedang bergerak cepat di tabel berisi ribuan baris, dan
 * "Apakah Anda yakin?" sudah lama berhenti dibaca siapa pun.
 *
 * ── Kenapa di atas `<input type="range">` ────────────────────────────
 *
 * Versi yang digambar sendiri dengan `pointerdown`/`pointermove` tampak
 * sama, tapi mati total bagi pengguna papan ketik dan tidak dikenali
 * pembaca layar sebagai apa pun. Input range memberi tiga hal gratis dan
 * benar: seret dengan tetikus, seret dengan jari, dan papan ketik (`End`
 * langsung penuh, panah menggeser bertahap). Perannya `slider`, nilainya
 * terbaca, dan labelnya menyebut tindakan yang akan terjadi.
 *
 * Inputnya dibuat tembus pandang dan menutupi seluruh jalur; yang terlihat
 * adalah gambar di bawahnya. Ibu jari semunya tetap diberi ukuran lewat
 * pseudo-elemen supaya daerah seretnya selebar gambarnya — kalau tidak,
 * seretan hanya bekerja di titik kecil dan terasa rusak.
 *
 * Kembali ke nol hanya saat lepas JARI/TETIKUS, bukan saat lepas tombol
 * papan ketik: kalau keduanya direset, pengguna panah tidak akan pernah
 * sampai ke ujung.
 */

import { useId, useState } from "react";
import { ChevronsRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function GeserKonfirmasi({
  label,
  labelPanjang,
  labelSelesai = "Terkirim",
  nonaktif,
  alasanNonaktif,
  onSelesai,
}: {
  /**
   * Tulisan DI DALAM jalur. Pendek — jalurnya hanya setinggi satu tombol,
   * dan di 390px kalimat panjang pecah jadi tiga baris lalu meluber keluar
   * jalurnya. Jumlah pelanggannya sudah berdiri besar di judul dialog.
   */
  label: string;
  /**
   * Kalimat lengkap untuk pembaca layar, mis. "tutup aliran untuk 14
   * pelanggan". Pembaca layar tidak melihat judul dialog saat fokus ada di
   * jalur ini, jadi jumlahnya harus ikut disebut di sini.
   */
  labelPanjang: string;
  labelSelesai?: string;
  nonaktif?: boolean;
  /** Kenapa belum bisa digeser. Wajib diisi bila `nonaktif`. */
  alasanNonaktif?: string;
  onSelesai: () => void;
}) {
  const [nilai, setNilai] = useState(0);
  const [selesai, setSelesai] = useState(false);
  const idBantuan = useId();

  const kunci = selesai || nonaktif;

  function ubah(v: number) {
    if (kunci) return;
    setNilai(v);
    if (v >= 100) {
      setSelesai(true);
      onSelesai();
    }
  }

  function lepas() {
    if (!selesai && nilai < 100) setNilai(0);
  }

  return (
    <div>
      <div
        className={cn(
          "relative h-13 w-full overflow-hidden rounded-[3px] border",
          selesai
            ? "border-success/50 bg-success-soft"
            : nonaktif
              ? "border-line bg-soft"
              : "border-danger/50 bg-danger-soft",
        )}
      >
        {/* Jejak yang sudah dilewati — memberi tahu seberapa jauh lagi. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0",
            selesai ? "bg-success/20" : "bg-danger/18",
          )}
          style={{ width: `${selesai ? 100 : nilai}%` }}
        />

        {/* Garis takar di jalur — motif yang sama dengan sisi kolom air dan
            lencana status. Jalurnya jadi terbaca sebagai skala yang harus
            dilalui, bukan sekadar kotak panjang. */}
        <span aria-hidden className="takar absolute inset-0 opacity-50" />

        {/*
          Tulisannya MEMUDAR seiring jalurnya dilalui. Tanpa itu ibu jari
          menyeberangi huruf dan memotongnya di tengah kata — terbaca sebagai
          dua lapisan yang bertabrakan, bukan satu benda. Memudar juga
          memberi umpan balik kedua selain posisi: tulisannya "habis" persis
          saat tindakannya siap.
        */}
        <span
          style={{ opacity: selesai ? 1 : Math.max(0, 1 - nilai / 55) }}
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "px-12 text-center text-[12.5px] leading-tight font-semibold",
            selesai ? "text-success" : nonaktif ? "text-muted" : "text-danger",
          )}
        >
          {selesai ? (
            <span className="inline-flex items-center gap-2">
              <Check size={15} aria-hidden />
              {labelSelesai}
            </span>
          ) : (
            `Geser untuk ${label}`
          )}
        </span>

        {/* Ibu jari yang terlihat. Posisinya dihitung agar tidak pernah
            keluar jalur: 3rem lebarnya, jadi perjalanannya 100% − 3rem. */}
        <span
          aria-hidden
          className={cn(
            "absolute top-1 bottom-1 grid w-12 place-items-center rounded-[2px]",
            "motion-aware transition-[left] duration-150",
            // `text-canvas`, bukan `text-white`: `danger` dan `success`
            // dicerahkan di tema gelap (#e0695f, #3dba87), dan putih di
            // atasnya turun ke 2,9:1. `canvas` ditukar ke arah berlawanan
            // sehingga pasangan ini terbaca di kedua tema.
            selesai
              ? "bg-success text-canvas"
              : nonaktif
                ? "bg-line-strong text-canvas"
                : "bg-danger text-canvas",
          )}
          style={{
            left: `calc(${selesai ? 100 : nilai}% - ${((selesai ? 100 : nilai) / 100) * 3}rem + 0.25rem)`,
          }}
        >
          {selesai ? (
            <Check size={18} aria-hidden />
          ) : (
            <ChevronsRight size={18} aria-hidden />
          )}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={selesai ? 100 : nilai}
          disabled={kunci}
          aria-label={`Geser untuk ${labelPanjang}`}
          aria-describedby={idBantuan}
          aria-valuetext={
            selesai ? labelSelesai : `${nilai} dari 100 — belum terkonfirmasi`
          }
          onChange={(e) => ubah(Number(e.target.value))}
          onPointerUp={lepas}
          onPointerCancel={lepas}
          onBlur={lepas}
          className={cn(
            "absolute inset-0 h-full w-full cursor-grab appearance-none bg-transparent opacity-0",
            "active:cursor-grabbing disabled:cursor-not-allowed",
            "[&::-webkit-slider-thumb]:h-12 [&::-webkit-slider-thumb]:w-12",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-moz-range-thumb]:h-12 [&::-moz-range-thumb]:w-12",
            "[&::-moz-range-thumb]:border-0",
          )}
        />
      </div>

      <p id={idBantuan} className="mt-2 text-[12px] text-muted">
        {nonaktif
          ? alasanNonaktif
          : selesai
            ? "Perintah sudah dikirim."
            : "Dengan papan ketik: fokuskan jalur ini lalu tekan End."}
      </p>
    </div>
  );
}
