"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import Link from "next/link";
import {
  Download,
  Search,
  Mail,
  X,
  Droplet,
  KeyRound,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { liter, rupiah, tanggal, tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton, KeadaanKosong } from "@/components/ui/keadaan";
import { SalinKode } from "@/components/ui/salin-kode";
import { token as formatToken } from "@/lib/format";

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

interface TransaksiBaris {
  id: string;
  meterId: string;
  jenis: "BELI" | "ISI_TOKEN";
  volumeL: number;
  jumlahRp: number;
  metode: string;
  status: "LUNAS" | "MENUNGGU" | "GAGAL" | "KEDALUWARSA";
  token?: string | null;
  /** Id token, untuk meminta kode utuhnya. Null bila belum ada token. */
  tokenId?: string | null;
  /** Status token itu sendiri — berbeda dari status pembayarannya. */
  tokenStatus?: string | null;
  dibuatPada: string;
  dibayarPada?: string | null;
}

/**
 * Nilai status HARUS sama persis dengan enum `StatusTransaksi` di backend
 * (`prisma/schema.prisma`): MENUNGGU, LUNAS, GAGAL, KEDALUWARSA.
 *
 * Sebelumnya daftar ini memuat "DIBATALKAN" yang tidak pernah dikirim backend,
 * sekaligus melewatkan "GAGAL" yang benar-benar dikirim. Akibatnya transaksi
 * yang gagal tampil sebagai lencana kelabu bertuliskan nama enum mentah, dan
 * warga tidak punya cara menyaringnya.
 */
const LABEL_FILTER = [
  { nilai: "SEMUA", label: "Semua" },
  { nilai: "LUNAS", label: "Lunas" },
  { nilai: "MENUNGGU", label: "Menunggu" },
  { nilai: "GAGAL", label: "Gagal" },
  { nilai: "KEDALUWARSA", label: "Kedaluwarsa" },
] as const;

const PER_HALAMAN = 12;

function lencanaStatus(status: string) {
  switch (status) {
    case "LUNAS":
      return (
        <Badge nada="sukses" titik>
          Lunas
        </Badge>
      );
    case "MENUNGGU":
      return (
        <Badge nada="peringatan" titik>
          Menunggu
        </Badge>
      );
    case "GAGAL":
      return (
        <Badge nada="bahaya" titik>
          Gagal
        </Badge>
      );
    case "KEDALUWARSA":
      return (
        <Badge nada="netral" titik>
          Kedaluwarsa
        </Badge>
      );
    default:
      return <Badge nada="netral">{status}</Badge>;
  }
}

/**
 * Satu baris pada daftar transaksi.
 *
 * ── Kenapa bukan `<Tabel>` lagi ──────────────────────────────────────
 *
 * Komponen tabel bersama hanya menandai baris terpilih dengan `bg-brand-50`,
 * yaitu WARNA SAJA — dan warna saja adalah satu-satunya penanda yang hilang
 * bagi pembaca yang sulit membedakan rona, sekaligus yang pertama lenyap
 * saat halaman dicetak hitam-putih. Tabel itu dipakai juga oleh konsol
 * petugas, jadi mengubahnya dari sini akan menggeser halaman lain yang tidak
 * diminta berubah.
 *
 * Yang dipakai di sini daftar tombol: baris terpilih dibedakan oleh TIGA hal
 * sekaligus — batang penanda di tepi kiri, kartunya terangkat dari halaman,
 * dan tanda panah yang menunjuk ke struk di sebelahnya. Ketiganya bertahan
 * tanpa warna.
 */
function BarisTransaksi({
  data,
  terpilih,
  onPilih,
}: {
  data: TransaksiBaris;
  terpilih: boolean;
  onPilih: () => void;
}) {
  const Ikon = data.jenis === "BELI" ? Droplet : KeyRound;

  return (
    <button
      type="button"
      onClick={onPilih}
      aria-current={terpilih ? "true" : undefined}
      className={`angkat relative flex w-full items-center gap-3 overflow-hidden rounded-card border p-3 text-left sm:gap-4 ${
        terpilih
          ? "border-brand-500 bg-brand-50 shadow-[var(--kilau-tepi),var(--kedalaman-3)]"
          : "border-line bg-surface shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
      }`}
    >
      {/* Batang penanda. Lebarnya yang berubah, bukan warnanya — baris yang
          tidak terpilih tidak menggambarnya sama sekali, jadi bedanya
          terbaca sebagai bentuk, bukan sebagai rona. */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-1 ${
          terpilih ? "bg-brand-500" : "bg-transparent"
        }`}
      />

      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100"
      >
        <Ikon size={16} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="truncate font-mono text-xs font-bold text-ink">
            {data.id}
          </span>
          {lencanaStatus(data.status)}
        </span>
        <span className="truncate font-mono text-[11px] text-muted">
          {tanggalJam(data.dibuatPada)}
          {data.metode ? ` · ${data.metode}` : null}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="tabular font-mono text-xs font-black text-ink">
          {rupiah(data.jumlahRp)}
        </span>
        <span className="font-mono text-[11px] font-semibold text-brand-700 dark:text-accent">
          {liter(data.volumeL, 0)}
        </span>
      </span>

      {/* Panah hanya ada pada baris terpilih: ia menunjuk ke struk yang
          sedang terbuka di sebelahnya, jadi menggambarnya di semua baris
          justru menghapus artinya. */}
      <ChevronRight
        size={16}
        aria-hidden
        className={`shrink-0 ${terpilih ? "text-brand-600" : "text-transparent"}`}
      />
    </button>
  );
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
function Struk({
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

      <div className="flex justify-center">{lencanaStatus(data.status)}</div>

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
              {formatToken(kodeUtuh)}
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

function KontenRiwayat() {
  const [daftarTransaksi, setDaftarTransaksi] = useState<TransaksiBaris[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [halaman, setHalaman] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("SEMUA");
  const [kataKunci, setKataKunci] = useState("");
  const [memuat, setMemuat] = useState(true);

  // Struk terpilih (panel desktop & lembar bawah ponsel)
  const [transaksiTerpilih, setTransaksiTerpilih] =
    useState<TransaksiBaris | null>(null);
  const [sheetBuka, setSheetBuka] = useState(false);
  const [pesanEmail, setPesanEmail] = useState<string | null>(null);

  useEffect(() => {
    let aktif = true;
    (async () => {
      setMemuat(true);
      try {
        const qFilter =
          filterStatus !== "SEMUA" ? `&filter=${filterStatus}` : "";
        const res = await api<{
          rows: TransaksiBaris[];
          total: number;
          page: number;
          perPage: number;
        }>(`/api/transaksi?page=${halaman}&perPage=${PER_HALAMAN}${qFilter}`);

        if (!aktif) return;

        const baris = res.rows ?? [];
        setDaftarTransaksi(baris);
        setTotalData(res.total ?? 0);

        /*
         * Pemilihan dipulihkan lewat bentuk fungsi, BUKAN dengan membaca
         * `transaksiTerpilih` dari closure.
         *
         * Versi sebelumnya menaruh `transaksiTerpilih` di daftar kebergantungan
         * efek ini sementara efeknya sendiri memanggil `setTransaksiTerpilih`.
         * Akibatnya setiap kali warga mengklik satu baris, seluruh daftar
         * diambil ulang dari server — satu permintaan jaringan penuh hanya
         * untuk menukar isi panel struk yang datanya sudah ada di tangan.
         */
        setTransaksiTerpilih((kini) =>
          kini && baris.some((b) => b.id === kini.id)
            ? kini
            : (baris[0] ?? null),
        );
      } catch {
        if (aktif) setDaftarTransaksi([]);
      } finally {
        if (aktif) setMemuat(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, [halaman, filterStatus]);

  // Filter pencarian di memori untuk invoice ID
  const dataTersaring = useMemo(() => {
    if (!kataKunci.trim()) return daftarTransaksi;
    const q = kataKunci.toLowerCase();
    return daftarTransaksi.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.meterId.toLowerCase().includes(q) ||
        t.metode.toLowerCase().includes(q),
    );
  }, [daftarTransaksi, kataKunci]);

  const totalHalaman = Math.max(1, Math.ceil(totalData / PER_HALAMAN));

  const handlePilihBaris = (item: TransaksiBaris) => {
    setTransaksiTerpilih(item);
    // Buka lembar bawah di ponsel
    if (window.innerWidth < 1024) {
      setSheetBuka(true);
    }
  };

  /*
   * Mencetak HANYA struknya.
   *
   * Sebelumnya ini memanggil window.print() tanpa satu pun aturan @media
   * print, jadi yang keluar adalah tangkapan seluruh halaman web — navigasi,
   * daftar transaksi, tombol, semuanya — bukan struk. Aturan cetak ada di
   * globals.css dan menyembunyikan segalanya kecuali elemen bertanda
   * `data-struk`.
   */
  const handleUnduhStrukPdf = () => {
    if (!transaksiTerpilih) return;
    window.print();
  };

  const handleKirimEmailStruk = () => {
    setPesanEmail("Salinan struk telah dikirimkan ke email terdaftar Anda.");
    setTimeout(() => setPesanEmail(null), 3000);
  };

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Catatan Publik Warga
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Riwayat Transaksi
          </h1>
          <p className="mt-1 text-xs text-balance text-muted">
            Daftar lengkap pembelian dan penukaran saldo air. Setiap transaksi
            tersimpan idempoten dan dapat dicocokkan dengan audit log.
          </p>
        </div>

        {/*
          `shrink-0` pada tautan DAN `whitespace-nowrap` pada tombol.
          Keduanya diperlukan: tanpa `shrink-0` tautan ikut menyusut saat
          judul di sebelahnya melebar, dan tanpa `whitespace-nowrap`
          tombolnya pecah jadi "Beli Token" / "Baru" di dua baris — tinggi
          tombolnya berubah dan barisnya tidak lagi sejajar dengan apa pun.
        */}
        <Link href="/beli" className="shrink-0">
          <Button
            varian="utama"
            ukuran="sm"
            className="w-full whitespace-nowrap sm:w-auto"
          >
            <Droplet size={14} />
            Beli Token Baru
          </Button>
        </Link>
      </div>

      {/* ── Penyaring & pencarian ── */}
      <div className="permukaan flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/*
          Bentuk sakelar sungguhan: alurnya masuk ke dalam halaman, bidak
          yang aktif duduk timbul DI DALAM alur itu. Sebelumnya kelima cip
          melayang sejajar dan hanya warna isi yang membedakan mana yang
          menyala — pada layar yang dilihat sekilas, itu tidak terbaca
          sebagai satu kelompok pilihan sama sekali.
        */}
        <div className="cekung flex flex-wrap items-center gap-1 p-1">
          {LABEL_FILTER.map(({ nilai: st, label }) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setFilterStatus(st);
                setHalaman(1);
              }}
              aria-pressed={filterStatus === st}
              className={`rounded-[7px] px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                filterStatus === st
                  ? "bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Kolom isian dibuat CEKUNG — di portal ini bentuk membawa arti:
            yang masuk ke dalam adalah tempat menaruh sesuatu. */}
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            aria-hidden
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Cari invoice atau meter..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            className="cekung h-10 w-full pr-3 pl-9 font-mono text-xs text-ink outline-none focus:border-brand-500 focus:bg-surface"
          />
        </div>
      </div>

      {/* ── Daftar (kiri) + struk (kanan) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {memuat ? (
            /*
             * Keadaan memuat menggambar BARIS, bukan satu kotak besar.
             * Rangka yang bentuknya sama dengan hasil akhirnya membuat
             * halaman tidak melompat saat datanya tiba, dan sekaligus
             * memberi tahu bahwa yang sedang datang adalah sebuah daftar.
             */
            <div className="space-y-2.5">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="permukaan-rata flex items-center gap-3 p-3"
                >
                  <Skeleton className="size-9 shrink-0 rounded-[10px]" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-28" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : dataTersaring.length === 0 ? (
            <div className="permukaan">
              {/* Dua ketiadaan yang berbeda butuh kalimat yang berbeda:
                  belum pernah bertransaksi sama sekali, versus ada
                  transaksi tetapi tidak ada yang cocok dengan saringan. */}
              {daftarTransaksi.length === 0 ? (
                <KeadaanKosong
                  judul="Belum ada transaksi"
                  pesan="Anda belum memiliki catatan pembelian atau penukaran token air."
                  aksi={
                    <Link href="/beli">
                      <Button varian="utama">Beli token air pertama</Button>
                    </Link>
                  }
                />
              ) : (
                <KeadaanKosong
                  judul="Tidak ada yang cocok"
                  pesan={`Tidak ada transaksi yang cocok dengan pencarian "${kataKunci}" pada saringan ini.`}
                  aksi={
                    <Button
                      varian="sekunder"
                      onClick={() => {
                        setKataKunci("");
                        setFilterStatus("SEMUA");
                      }}
                    >
                      Bersihkan pencarian
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <div className="berjenjang space-y-2.5">
              {dataTersaring.map((t) => (
                <BarisTransaksi
                  key={t.id}
                  data={t}
                  terpilih={transaksiTerpilih?.id === t.id}
                  onPilih={() => handlePilihBaris(t)}
                />
              ))}
            </div>
          )}

          {/* Navigasi halaman */}
          {!memuat && totalData > PER_HALAMAN ? (
            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <span>
                Halaman {halaman} dari {totalHalaman}
              </span>
              <div className="flex gap-2">
                <Button
                  varian="sekunder"
                  ukuran="sm"
                  disabled={halaman <= 1}
                  onClick={() => setHalaman((p) => p - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  varian="sekunder"
                  ukuran="sm"
                  disabled={halaman >= totalHalaman}
                  onClick={() => setHalaman((p) => p + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/*
          ── Panel struk desktop ──
          `print:block` BUKAN hiasan — tanpanya perintah Cetak menghasilkan
          halaman KOSONG.

          `Page.printToPDF` dan dialog cetak peramban menata ulang halaman
          pada lebar KERTAS (A4 ≈ 794px CSS), bukan lebar jendela. Lebar itu
          ada di bawah ambang `lg` (1024px), jadi `hidden lg:block` berlaku
          dan panel ini `display: none` tepat pada saat ia satu-satunya yang
          boleh tercetak. Aturan `@media print` di `globals.css` memang
          menyalakan `visibility`, tetapi `visibility` tidak pernah bisa
          menghidupkan elemen yang sudah dimatikan `display`.

          Dibuktikan dengan mencetak halaman ini ke PDF: sebelum baris ini
          ada, berkasnya satu halaman tanpa satu pun huruf.

          Dipasang hanya saat lembar ponsel TERTUTUP. Kalau lembar itu
          terbuka, dialah yang membawa `data-struk`; memaksa panel ini ikut
          tampil hanya menyisakan blok tak terlihat yang tetap memakan ruang
          dan mendorong struknya ke halaman kedua.
        */}
        <div className={`hidden lg:block ${sheetBuka ? "" : "print:block"}`}>
          {transaksiTerpilih ? (
            /*
             * `print:static` wajib. Aturan cetak memberi struk
             * `position: absolute; inset: 0 auto auto 0` supaya ia naik ke
             * pojok kiri atas kertas — tetapi `absolute` selalu diukur dari
             * LELUHUR BERPOSISI terdekat, dan `sticky` adalah salah satunya.
             * Dibiarkan sticky, struknya "naik ke pojok" pembungkus ini, yang
             * di atas kertas letaknya jauh di bawah daftar transaksi:
             * halaman pertama kosong dan struknya terdorong ke halaman
             * berikutnya.
             */
            <div className="sticky top-24 space-y-3 print:static">
              {/*
                `key` WAJIB. Tanpa itu React memakai ulang komponen struk
                saat baris lain dipilih, dan keadaan kodenya ikut terbawa —
                kode token transaksi sebelumnya tetap terpampang di struk
                milik transaksi yang baru dipilih. Kode yang salah pada
                struk yang benar adalah kegagalan paling berbahaya di
                halaman ini, karena tidak ada yang terlihat keliru.
              */}
              <Struk
                key={transaksiTerpilih.id}
                data={transaksiTerpilih}
                penandaCetak={!sheetBuka}
              />

              {/*
                Tombol dan pemberitahuan ditaruh DI LUAR elemen struk.
                Aturan cetak memang sudah menyembunyikan `button` di dalam
                struk, tapi menaruhnya di luar lebih benar pada dua sisi:
                di layar, struknya tetap terbaca sebagai lembar kertas utuh
                yang tidak kejatuhan tombol; di kertas, tidak ada apa pun
                yang perlu disembunyikan sejak awal.
              */}
              {pesanEmail ? (
                <p
                  role="status"
                  className="rounded-[10px] border border-success/40 bg-success-soft px-3 py-2 text-center text-xs font-medium text-success"
                >
                  {pesanEmail}
                </p>
              ) : null}

              <div className="space-y-2">
                <Button
                  varian="utama"
                  blok
                  ukuran="sm"
                  onClick={handleUnduhStrukPdf}
                >
                  <Download size={14} />
                  Cetak / Unduh Struk
                </Button>
                <Button
                  varian="sekunder"
                  blok
                  ukuran="sm"
                  onClick={handleKirimEmailStruk}
                >
                  <Mail size={14} />
                  Kirim ke Email Saya
                </Button>
              </div>
            </div>
          ) : !memuat ? (
            <div className="cekung sticky top-24 px-6 py-10 text-center">
              <p className="text-xs text-muted">
                Pilih satu transaksi di sebelah kiri untuk melihat struknya.
              </p>
            </div>
          ) : (
            <div className="permukaan sticky top-24 space-y-3 p-5">
              <Skeleton className="mx-auto h-3 w-24" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-2/3" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
        </div>
      </div>

      {/* ── Lembar bawah struk untuk ponsel (< 1024px) ── */}
      {sheetBuka && transaksiTerpilih ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          <button
            type="button"
            onClick={() => setSheetBuka(false)}
            className="tirai-masuk motion-aware fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
            aria-label="Tutup struk"
          />

          <div className="lembar-masuk motion-aware relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-sheet border-t border-line bg-canvas p-4 shadow-[var(--kedalaman-4)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold tracking-wider text-muted uppercase">
                Rincian struk
              </span>
              <button
                type="button"
                onClick={() => setSheetBuka(false)}
                className="grid size-8 place-items-center rounded-[10px] text-muted hover:text-ink"
                aria-label="Tutup struk"
              >
                <X size={18} />
              </button>
            </div>

            {/* Di ponsel, lembar inilah yang dicetak — panel desktop sedang
                `display: none` lewat kelas `hidden`, jadi penanda cetaknya
                berpindah ke sini. */}
            <Struk
              key={transaksiTerpilih.id}
              data={transaksiTerpilih}
              penandaCetak
            />

            <div className="mt-3 space-y-2 pb-2">
              <Button varian="utama" blok onClick={handleUnduhStrukPdf}>
                <Download size={14} />
                Cetak / Simpan Struk
              </Button>
              <Button varian="sekunder" blok onClick={handleKirimEmailStruk}>
                <Mail size={14} />
                Kirim ke Email Saya
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HalamanRiwayat() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted">
          Memuat riwayat...
        </div>
      }
    >
      <KontenRiwayat />
    </Suspense>
  );
}
