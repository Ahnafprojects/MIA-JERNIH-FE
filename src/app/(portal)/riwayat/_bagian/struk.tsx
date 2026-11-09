"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { liter, rupiah, tanggal, tanggalJam, token as fmtToken } from "@/lib/format";
import { SalinKode } from "@/components/ui/salin-kode";

import type { TransaksiBaris } from "../_tipe";
import { LencanaStatus } from "./lencana-status";

/**
 * Keadaan kode token untuk satu invoice.
 *
 * ── Kenapa kodenya diambil dari SERVER sekarang ──────────────────────
 *
 * Sebelumnya kode utuh hanya hidup di `sessionStorage`, ditulis halaman
 * beli. Itu patah pada dua keadaan yang justru paling sering terjadi:
 *
 *   1. Beli hari ini, isi besok dari perangkat lain. `sessionStorage`
 *      terikat ke satu tab di satu peramban; tokennya sudah dibayar tetapi
 *      kodenya tidak ada di mana pun.
 *   2. Isi otomatis. SERVER yang menerbitkan tokennya — warga tidak pernah
 *      membuka halaman apa pun, jadi tidak ada peramban yang sempat
 *      menyimpan kodenya sama sekali.
 *
 * Akarnya: kode token dulu di-hash seperti kata sandi. Itu salah kategori.
 * Kata sandi di-hash justru supaya aslinya tidak terbaca lagi; kode token
 * harus bisa ditunjukkan ulang kepada pemiliknya sampai dipakai, persis
 * seperti kode pada struk token listrik.
 *
 * Sekarang server menyimpannya terenkripsi dan mengembalikannya lewat
 * `GET /api/token/:id/kode` — hanya kepada pemiliknya, hanya selama token
 * belum dipakai. Lihat `lib/kode-token.ts` di repo backend.
 */
interface KodeTokenJawaban {
  id: string;
  kode: string | null;
  kodeBertopeng: string;
  status: string;
  /** `TOKEN_TIDAK_AKTIF` atau `KODE_TIDAK_TERSIMPAN` saat `kode` null. */
  alasan?: string;
}


/**
 * Baris rincian di dalam struk.
 *
 * Titik-titik pemandu di antara label dan nilainya bukan hiasan: itu cara
 * struk kertas menuntun mata dari nama pos ke angkanya tanpa perlu garis
 * tabel. Dibuat dari `border-b` putus-putus pada elemen perantara yang
 * melar, jadi panjangnya menyesuaikan sendiri.
 */
function BarisStruk({
  label,
  children,
  tebal,
}: {
  label: string;
  children: React.ReactNode;
  tebal?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={tebal ? "font-semibold text-ink" : "text-muted"}>
        {label}
      </span>
      <span
        aria-hidden
        className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-line-strong/60"
      />
      <span className="shrink-0 text-right">{children}</span>
    </div>
  );
}

/**
 * Struk pembayaran — benda kertas, bukan kartu biasa.
 *
 * Seluruh halaman ini berisi permukaan bersudut lembut yang tingginya sama.
 * Struk harus keluar dari keluarga itu, sebab ia satu-satunya yang bisa
 * BERPINDAH MEDIA: dicetak, disimpan, dilampirkan. Empat hal yang
 * membedakannya, dan semuanya meniru kertas sungguhan:
 *
 *   1. Sudut jauh lebih rapat daripada kartu lain — kertas tidak membulat.
 *   2. Tepi bawah bergerigi, seperti struk yang disobek dari gulungan.
 *   3. Seluruh isinya huruf monospasi dan rata kolom, seperti cetakan
 *      dot-matrix mesin kasir.
 *   4. Pemisahnya garis putus-putus, bukan garis penuh.
 *
 * ── Yang WAJIB dijaga saat mengubah berkas ini ───────────────────────
 *
 * Atribut `data-struk` adalah satu-satunya pegangan aturan `@media print` di
 * `globals.css`: semua isi halaman disembunyikan kecuali elemen bertanda itu
 * beserta anaknya. Menghapusnya membuat perintah Cetak kembali mencetak
 * seluruh tangkapan halaman web — navigasi, daftar transaksi, tombol —
 * persis cacat yang dulu dilaporkan.
 *
 * Hiasan kertasnya diberi `print:hidden`. Gerigi dan tekstur hanya berguna
 * di layar; di atas kertas ia tercetak sebagai noda abu-abu di tepi halaman.
 */
export function Struk({
  data,
  penandaCetak,
}: {
  data: TransaksiBaris;
  /**
   * Hanya SATU struk boleh membawa `data-struk` pada satu saat.
   *
   * Panel desktop dan lembar bawah ponsel sama-sama ada di pohon DOM. Kalau
   * keduanya ditandai sekaligus, hasil cetaknya menumpuk dua struk di posisi
   * yang sama — aturan cetaknya memaksa `position: absolute; inset: 0`.
   */
  penandaCetak: boolean;
}) {
  /*
   * Kode diminta ke server saat struknya dibuka, bukan dibaca dari
   * penyimpanan peramban.
   *
   * Diminta per struk — bukan sekalian untuk seluruh daftar — karena
   * membukanya DICATAT di audit log. Mengambil semuanya di muka berarti
   * mencatat belasan pembukaan kode yang tidak pernah dilihat siapa pun,
   * dan audit yang penuh kejadian palsu tidak bisa dipakai saat benar-benar
   * dibutuhkan.
   */
  const [kodeUtuh, setKodeUtuh] = useState<string | null>(null);
  const [alasanKode, setAlasanKode] = useState<string | null>(null);
  const [memuatKode, setMemuatKode] = useState(false);

  const tokenId = data.tokenId ?? null;

  useEffect(() => {
    /* Tanpa `tokenId` tidak ada yang bisa diminta: transaksi yang belum
       lunas memang belum punya token. Keluar lebih awal TANPA menyetel
       keadaan apa pun: pemanggilnya memberi `key={id}` pada komponen ini,
       jadi memilih baris lain MEMASANG ULANG struknya dengan keadaan
       bersih. Menyetelnya di sini hanya memicu render berantai yang
       dilarang lint tanpa memperbaiki apa pun. */
    if (!tokenId) return;

    let hidup = true;

    (async () => {
      setMemuatKode(true);
      try {
        const res = await api<KodeTokenJawaban>(
          `/api/token/${encodeURIComponent(tokenId)}/kode`,
        );
        if (!hidup) return;
        setKodeUtuh(res.kode);
        setAlasanKode(res.kode ? null : (res.alasan ?? "TIDAK_DIKETAHUI"));
      } catch {
        /* Gangguan jaringan DIBEDAKAN dari "kodenya memang tidak ada": yang
           pertama bisa dicoba lagi, yang kedua tidak. Menyamakan keduanya
           membuat warga menyerah pada kode yang sebenarnya masih bisa
           diambil. */
        if (hidup) setAlasanKode("GAGAL_MEMUAT");
      } finally {
        if (hidup) setMemuatKode(false);
      }
    })();

    return () => {
      hidup = false;
    };
  }, [tokenId]);

  return (
    <article
      {...(penandaCetak ? { "data-struk": true } : {})}
      className="relative rounded-[8px] border border-line bg-surface px-5 pt-5 pb-7 shadow-[var(--kilau-tepi),var(--kedalaman-3)]"
    >
      {/* Kepala struk: nama penerbit di atas, seperti cetakan mesin kasir. */}
      <div className="text-center">
        <p className="font-mono text-[11px] font-bold tracking-[0.3em] text-ink uppercase">
          Jernih
        </p>
        <p className="mt-0.5 font-mono text-[10px] tracking-wider text-muted uppercase">
          Struk Pembayaran Air
        </p>
      </div>

      <div
        aria-hidden
        className="my-4 border-t border-dashed border-line-strong/70"
      />

      <div className="flex justify-center"><LencanaStatus status={data.status} /></div>

      <div className="mt-4 space-y-2 font-mono text-[11px]">
        <BarisStruk label="No. Invoice">
          <span className="font-bold text-ink">{data.id}</span>
        </BarisStruk>
        <BarisStruk label="Meter">
          <span className="text-ink">{data.meterId}</span>
        </BarisStruk>
        <BarisStruk label="Tanggal">
          <span className="text-ink">{tanggal(data.dibuatPada)}</span>
        </BarisStruk>
        <BarisStruk label="Waktu">
          <span className="text-ink">{tanggalJam(data.dibuatPada)}</span>
        </BarisStruk>
        <BarisStruk label="Jenis">
          <span className="text-ink">
            {data.jenis === "BELI" ? "Pembelian token" : "Isi token"}
          </span>
        </BarisStruk>
        <BarisStruk label="Metode">
          <span className="text-ink">{data.metode || "—"}</span>
        </BarisStruk>
        <BarisStruk label="Volume air">
          <span className="font-bold text-ink">{liter(data.volumeL, 0)}</span>
        </BarisStruk>
      </div>

      <div
        aria-hidden
        className="my-4 border-t border-dashed border-line-strong/70"
      />

      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] font-bold tracking-wider text-muted uppercase">
          Total bayar
        </span>
        {/*
          `min-w-0` + `break-all`: nominal panjang pernah memaksa lebar baris
          melebihi kertasnya dan tulisannya menjulur keluar struk alih-alih
          membungkus ke bawah.
        */}
        <span className="tabular min-w-0 text-right font-mono text-xl font-black break-all text-ink">
          {rupiah(data.jumlahRp)}
        </span>
      </div>

      {/* Kode token: dibuat CEKUNG supaya terbaca sebagai bidang yang
          dicetak ke dalam kertas, bukan tempelan di atasnya. */}
      <div className="cekung mt-4 px-3 py-3 text-center">
        <span className="font-mono text-[9px] tracking-widest text-muted uppercase">
          {kodeUtuh
            ? "Kode token air"
            : alasanKode === "TOKEN_TIDAK_AKTIF"
              ? "Kode token air (sudah dipakai)"
              : "Kode token air (bertopeng)"}
        </span>

        {memuatKode ? (
          /* Rangka setinggi kodenya, bukan teks "memuat". Tinggi yang sama
             mencegah seluruh struk melompat begitu kodenya tiba. */
          <div className="my-1 h-7 animate-pulse rounded-[6px] bg-soft" />
        ) : kodeUtuh ? (
          <>
            {/*
              `select-all` DILEPAS saat kodenya utuh: di sini kodenya memang
              boleh — dan harus — bisa diblok dan disalin tangan. Pada versi
              bertopeng sebaliknya, karena yang tersalin cuma titik-titik.
            */}
            <div className="my-1 font-mono text-lg font-black tracking-widest text-ink select-all">
              {fmtToken(kodeUtuh)}
            </div>
            <div className="mt-2 flex justify-center">
              {/*
                Spasi DIBUANG dari nilai yang disalin. Kode tampil per lima
                digit supaya mudah dibaca, tetapi keypad meter hanya
                menerima angka — menempelkan versi berspasi akan ditolak.
              */}
              <SalinKode
                nilai={kodeUtuh.replace(/\D/g, "")}
                label="Salin kode token"
                teks="Salin kode token"
              />
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted">
              Bisa dibuka lagi kapan saja dari perangkat mana pun selama token
              belum dipakai.
            </p>
          </>
        ) : (
          <>
            <div className="my-1 font-mono text-lg font-black tracking-widest text-ink select-none">
              {data.token || "••••• •••••"}
            </div>
            {/*
              TIDAK ADA tombol salin kode di cabang ini, dan itu disengaja.
              Yang tampil cuma lima digit pertama; tombol yang menyalin
              `32573 •••••` akan membuat warga menempelkannya ke keypad
              meter dan gagal — lebih buruk daripada tidak ada tombol,
              karena kegagalannya terjadi di depan meter, bukan di layar.

              Alasannya dibedakan satu per satu: "sudah dipakai", "gagal
              dimuat", dan "tidak pernah tersimpan" menuntut tindakan yang
              sama sekali berbeda dari warga.
            */}
            <p className="text-[10px] leading-relaxed text-muted">
              {alasanKode === "TOKEN_TIDAK_AKTIF"
                ? "Token ini sudah ditukarkan ke meter, jadi kodenya tidak berlaku lagi."
                : alasanKode === "GAGAL_MEMUAT"
                  ? "Kode gagal dimuat. Periksa sambungan Anda lalu buka struk ini lagi."
                  : alasanKode === "KODE_TIDAK_TERSIMPAN"
                    ? "Token ini terbit sebelum kode bisa disimpan ulang. Ambil kode utuhnya dari email struk Anda."
                    : "Kode utuh belum bisa ditampilkan untuk transaksi ini. Ambil dari email struk Anda."}
            </p>
            {alasanKode === "KODE_TIDAK_TERSIMPAN" ? (
              <div className="mt-2 flex justify-center">
                <SalinKode
                  nilai={data.id}
                  label="Salin nomor invoice"
                  teks="Salin no. invoice"
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      <div
        aria-hidden
        className="my-4 border-t border-dashed border-line-strong/70"
      />

      <p className="text-center font-mono text-[10px] leading-relaxed text-muted">
        Terima kasih. Struk ini sah tanpa tanda tangan dan dapat dicocokkan
        dengan audit log PDAM.
      </p>

      {/*
        Tepi bawah bergerigi.
        Setengah lingkaran sewarna LATAR HALAMAN digambar menindih tepi
        bawah kartu, jadi yang terlihat seolah kertasnya disobek di situ.
        `print:hidden` wajib: di atas kertas, gerigi ini tercetak sebagai
        deretan noktah abu-abu yang tidak ada artinya.
      */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-2.5 print:hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 100%, var(--color-canvas) 4.5px, transparent 5px)",
          backgroundSize: "13px 10px",
          backgroundRepeat: "repeat-x",
        }}
      />
    </article>
  );
}

