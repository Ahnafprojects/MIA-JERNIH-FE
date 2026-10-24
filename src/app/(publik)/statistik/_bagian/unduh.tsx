"use client";

import { useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";
import { cn } from "@/lib/cn";
import { JudulSeksi } from "./judul-seksi";

/**
 * Unduhan data mentah dan alamat API terbuka.
 *
 * Untuk subtema "Public Service Tracking", inilah bagian yang memisahkan
 * transparansi sungguhan dari transparansi tampilan. Angka yang hanya bisa
 * dipandang di layar masih sepenuhnya di bawah kendali yang menampilkannya:
 * tidak ada yang bisa menghitung ulang, membandingkan dengan kota lain, atau
 * membuat grafiknya sendiri. Data yang bisa DIBAWA PERGI bisa diperiksa
 * orang lain — dan kemungkinan diperiksa itulah yang membuat angkanya layak
 * dipercaya sejak awal.
 *
 * Karena itu tombolnya harus benar-benar bekerja, dan isinya harus sama
 * persis dengan yang di layar. Tombol unduh yang menghasilkan berkas kosong
 * atau berkas yang angkanya berbeda jauh lebih merusak daripada tidak ada
 * tombol sama sekali.
 */

/** `apiUrl` melempar bila alamat server belum diatur; jalur relatif tetap sah. */
function tautan(jalur: string): string {
  try {
    return apiUrl(jalur);
  } catch {
    return jalur;
  }
}

interface Kumpulan {
  set: string;
  judul: string;
  isi: string;
  /** `true` bila isinya mengikuti rentang 7/30/90 hari yang sedang dipilih. */
  ikutRentang: boolean;
  /** Berapa baris yang akan didapat, supaya tidak ada kejutan di berkasnya. */
  baris: (hari: number) => string;
}

const KUMPULAN: Kumpulan[] = [
  {
    set: "harian",
    judul: "Ringkasan harian",
    isi: "Tanggal, air disalurkan, air tercatat, kehilangan, dan persentase NRW untuk tiap hari.",
    ikutRentang: true,
    baris: (hari) => `${hari} baris`,
  },
  {
    set: "zona",
    judul: "Rincian per zona",
    isi: "Nama zona, jumlah sambungan aktif, volume tercatat, dan NRW tiap zona distribusi.",
    ikutRentang: true,
    baris: () => "4 baris",
  },
  {
    set: "neraca",
    judul: "Neraca air",
    isi: "Delapan komponen kehilangan air lengkap dengan kelompok, volume, dan porsinya.",
    ikutRentang: true,
    baris: () => "8 baris",
  },
  {
    set: "bulanan",
    judul: "Tren bulanan",
    isi: "Volume dan NRW tiap bulan selama dua belas bulan terakhir.",
    ikutRentang: false,
    baris: () => "12 baris",
  },
];

/*
 * Tinggi 44px (`h-11`), bukan 36px.
 *
 * Ketiga tombol di seksi ini — CSV, JSON, dan Salin — adalah satu-satunya
 * aksi di seluruh halaman statistik. Tombol unduh setinggi 36px dan tombol
 * salin setinggi 32px sama-sama di bawah target sentuh minimum, dan dua di
 * antaranya berdampingan rapat sehingga salah tekan di ponsel mengunduh
 * format yang bukan diminta.
 */
const GAYA_TOMBOL =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-input border border-line-strong " +
  "bg-surface px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-soft active:bg-surface-2";

function TombolSalin({ teks, label }: { teks: string; label: string }) {
  const [tersalin, setTersalin] = useState(false);
  const jam = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (jam.current) clearTimeout(jam.current);
    },
    [],
  );

  return (
    <button
      type="button"
      // Alamatnya tetap terlihat utuh di sebelah tombol ini. Kalau peramban
      // menolak akses papan klip — konteks tak aman, izin ditolak — pengguna
      // tidak kehilangan apa pun, cukup menyalinnya sendiri.
      onClick={() => {
        navigator.clipboard
          ?.writeText(teks)
          .then(() => {
            setTersalin(true);
            if (jam.current) clearTimeout(jam.current);
            jam.current = setTimeout(() => setTersalin(false), 2000);
          })
          .catch(() => setTersalin(false));
      }}
      aria-label={`Salin alamat ${label}`}
      className={cn(GAYA_TOMBOL, "shrink-0 px-3 text-[12px]")}
    >
      <span aria-live="polite">{tersalin ? "Tersalin" : "Salin"}</span>
    </button>
  );
}

function BarisEndpoint({
  jalur,
  keterangan,
}: {
  jalur: string;
  keterangan: string;
}) {
  const penuh = tautan(jalur);
  return (
    <li className="border-t border-line py-3.5 first:border-t-0">
      <div className="flex items-center gap-3">
        {/*
         * Alamatnya DIPATAHKAN, bukan dipotong.
         *
         * Versi pertama menggulirkan alamat panjang di dalam kotaknya
         * sendiri. Di 390px hasilnya tiga baris yang terbaca sama persis —
         * ".../api/publik" untuk ketiganya — dan tidak ada cara membedakan
         * endpoint mana yang mana tanpa menggulir masing-masing. `break-all`
         * menampilkannya utuh dalam dua baris, dan tetap tidak pernah
         * menambah gulir mendatar pada halaman.
         */}
        <code className="tabular min-w-0 flex-1 rounded-input border border-line bg-canvas px-3 py-2 font-mono text-[12px] break-all text-ink">
          {penuh}
        </code>
        <TombolSalin teks={penuh} label={keterangan} />
      </div>
      <p className="mt-1.5 text-[12.5px] text-muted">{keterangan}</p>
    </li>
  );
}

export function SeksiUnduh({ hari }: { hari: number }) {
  return (
    <section className="mt-12">
      <JudulSeksi judul="Ambil datanya">
        Seluruh angka di halaman ini bisa diunduh sebagai berkas, atau diambil
        langsung lewat alamat di bawah. Isinya persis yang Anda lihat di
        layar — bukan ringkasan lain yang kebetulan mirip.
      </JudulSeksi>

      <div className="mt-5 overflow-hidden rounded-card border border-line bg-surface">
        <ul className="px-5">
          {KUMPULAN.map((k, i) => (
            <li
              key={k.set}
              className={cn(
                "grid gap-x-6 gap-y-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
                i > 0 && "border-t border-line",
              )}
            >
              <div className="min-w-0">
                <h3 className="font-display text-[14.5px] font-bold tracking-tight">
                  {k.judul}
                </h3>
                <p className="mt-1 max-w-[52ch] text-[12.5px] leading-relaxed text-muted">
                  {k.isi}
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  <span className="tabular font-mono">{k.baris(hari)}</span>
                  {k.ikutRentang
                    ? ` · mengikuti rentang ${hari} hari`
                    : " · tidak terpengaruh pilihan rentang"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {(["csv", "json"] as const).map((format) => (
                  <a
                    key={format}
                    href={tautan(
                      `/api/publik/unduh?set=${k.set}&format=${format}&rentang=${hari}`,
                    )}
                    download
                    className={GAYA_TOMBOL}
                  >
                    {format.toUpperCase()}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-[15px] font-bold tracking-tight">
            API terbuka
          </h3>
          <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-muted">
            Tiga alamat di bawah membalas JSON, boleh dipanggil dari mana saja
            (CORS terbuka), dan tidak menuntut kunci atau pendaftaran. Parameter{" "}
            <code className="font-mono text-[12px] text-ink">rentang</code>{" "}
            menerima 7, 30, atau 90.
          </p>
        </div>
        <ul className="px-5 py-1">
          <BarisEndpoint
            jalur={`/api/publik/statistik?rentang=${hari}`}
            keterangan="Agregat distribusi: volume, NRW, deret harian, dan rincian per zona."
          />
          <BarisEndpoint
            jalur={`/api/publik/neraca-air?rentang=${hari}`}
            keterangan="Neraca air, tolok ukur, pemakaian per orang, dan tren dua belas bulan."
          />
          <BarisEndpoint
            jalur={`/api/publik/unduh?set=harian&format=json&rentang=${hari}`}
            keterangan="Berkas unduhan dalam bentuk JSON. Ganti set ke zona, neraca, atau bulanan."
          />
        </ul>
        <div className="border-t border-line bg-soft/60 px-5 py-4">
          <p className="max-w-[66ch] text-[12.5px] leading-relaxed text-muted">
            Berkas CSV memakai pemisah koma, titik desimal, dan akhir baris
            CRLF sesuai RFC 4180 — bukan format Indonesia — supaya langsung
            terbaca oleh alat analisis mana pun. Tanda BOM UTF-8 disertakan
            agar Excel tidak merusak huruf beraksen. Datanya bebas dipakai
            ulang, termasuk untuk tujuan komersial, dengan menyebut Jernih
            sebagai sumber.
          </p>
        </div>
      </div>
    </section>
  );
}
