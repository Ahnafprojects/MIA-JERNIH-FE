"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Tombol salin untuk kode token dan nomor invoice.
 *
 * ── Kenapa tidak memanggil `navigator.clipboard` begitu saja ──────────
 *
 * `navigator.clipboard` TIDAK SELALU ADA. Ia hanya tersedia pada konteks
 * aman — HTTPS atau `localhost` — jadi begitu seseorang membuka portal ini
 * lewat alamat IP di jaringan lokal (yang persis dilakukan saat menguji di
 * ponsel), objeknya `undefined` dan pemanggilannya melempar. Izinnya juga
 * bisa ditolak pengguna, dan di Safari ia hanya bekerja bila dipanggil
 * langsung dari gerakan pengguna.
 *
 * Versi sebelumnya di halaman bayar memanggilnya tanpa `await`, tanpa
 * `catch`, dan tetap menyetel penanda "Kode Tersalin!" setelahnya. Jadi
 * pada setiap keadaan gagal di atas, tombolnya tetap mengaku berhasil —
 * warga menempelkan sesuatu yang tidak pernah disalin ke keypad meter, lalu
 * menyalahkan meternya.
 *
 * ── Tiga keadaan, bukan dua ──────────────────────────────────────────
 *
 * Diam, berhasil, dan GAGAL. Keadaan ketiga yang biasanya dilewatkan, dan
 * ia yang paling perlu: kalau penyalinan tidak bisa dilakukan, satu-satunya
 * jalan keluar warga adalah menyalinnya sendiri dengan tangan — dan ia
 * hanya akan melakukannya kalau diberi tahu.
 *
 * `aria-live="polite"` memberitakan perubahan itu kepada pembaca layar.
 * Tombol yang hanya berubah ikon tidak menyampaikan apa-apa bagi orang yang
 * tidak melihatnya.
 */

/** Berapa lama penanda hasil bertahan sebelum kembali ke keadaan diam. */
const JEDA_PULIH_MS = 2200;

type Keadaan = "diam" | "tersalin" | "gagal";

/**
 * Menyalin teks ke papan klip, dengan jalur cadangan.
 *
 * Mengembalikan `true` hanya bila penyalinan benar-benar berhasil. Jalur
 * cadangannya memakai `document.execCommand("copy")` — API usang yang
 * sengaja dipakai justru karena ia bekerja di tempat `navigator.clipboard`
 * tidak ada, dan tidak menuntut konteks aman.
 */
async function salinKePapanKlip(teks: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(teks);
      return true;
    }
  } catch {
    // Jatuh ke jalur cadangan di bawah, bukan menyerah.
  }

  try {
    const kotak = document.createElement("textarea");
    kotak.value = teks;
    /*
     * Di luar layar, BUKAN `display: none`. Elemen yang tidak dirender
     * tidak bisa dipilih, dan `execCommand("copy")` menyalin dari pilihan.
     * `readOnly` mencegah papan ketik ponsel ikut terbuka sekejap.
     */
    kotak.setAttribute("readonly", "");
    kotak.style.position = "fixed";
    kotak.style.top = "-1000px";
    kotak.style.opacity = "0";
    document.body.appendChild(kotak);
    kotak.select();
    kotak.setSelectionRange(0, teks.length);
    const berhasil = document.execCommand("copy");
    document.body.removeChild(kotak);
    return berhasil;
  } catch {
    return false;
  }
}

export function SalinKode({
  nilai,
  label,
  teks,
  className,
}: {
  /** Teks yang benar-benar disalin. Sudah bersih — lihat catatan pemanggil. */
  nilai: string;
  /** Nama yang dibacakan pembaca layar, mis. "Salin kode token". */
  label: string;
  /** Teks yang tampil di tombol saat diam. Kosongkan untuk tombol ikon saja. */
  teks?: string;
  className?: string;
}) {
  const [keadaan, setKeadaan] = useState<Keadaan>("diam");
  const jam = useRef<number | null>(null);

  /* Pengatur waktu dibersihkan saat komponen dilepas. Tanpa ini, menutup
     lembar struk tepat setelah menyalin membuat `setKeadaan` dipanggil pada
     komponen yang sudah tidak ada. */
  useEffect(
    () => () => {
      if (jam.current) window.clearTimeout(jam.current);
    },
    [],
  );

  const tangani = async () => {
    const berhasil = await salinKePapanKlip(nilai);
    setKeadaan(berhasil ? "tersalin" : "gagal");

    if (jam.current) window.clearTimeout(jam.current);
    jam.current = window.setTimeout(() => setKeadaan("diam"), JEDA_PULIH_MS);
  };

  const Ikon =
    keadaan === "tersalin" ? Check : keadaan === "gagal" ? TriangleAlert : Copy;

  const tulisan =
    keadaan === "tersalin"
      ? "Tersalin"
      : keadaan === "gagal"
        ? "Salin manual"
        : teks;

  return (
    <button
      type="button"
      onClick={tangani}
      aria-label={label}
      /* `print:hidden`: tombol tidak punya arti di atas kertas, dan di
         halaman riwayat ia berada di dalam elemen yang ikut tercetak. */
      className={cn(
        /* `cincin-fokus`: tombol ini hidup di dalam kotak kode yang
           sudah ramai garis putus-putus, dan cincin bawaan peramban
           di sana tertukar dengan salah satu garis itu. */
        "angkat cincin-fokus inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap print:hidden",
        keadaan === "tersalin" &&
          "border-success/40 bg-success-soft text-success",
        keadaan === "gagal" && "border-warn/40 bg-warn-soft text-warn",
        keadaan === "diam" &&
          "border-line bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)] hover:border-brand-500/60 hover:bg-brand-50 hover:text-brand-700",
        className,
      )}
    >
      <Ikon size={13} aria-hidden />
      {tulisan ? <span>{tulisan}</span> : null}
      {/*
        Hasilnya diberitakan terpisah dari label tombol. Mengubah
        `aria-label` saja tidak memicu pengumuman apa pun pada sebagian
        pembaca layar — perubahan nama elemen yang sedang difokus tidak
        selalu dibacakan ulang.
      */}
      <span className="sr-only" aria-live="polite">
        {keadaan === "tersalin"
          ? "Disalin ke papan klip."
          : keadaan === "gagal"
            ? "Gagal menyalin. Silakan salin manual."
            : ""}
      </span>
    </button>
  );
}
