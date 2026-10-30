"use client";

/**
 * J03 — Lacak pengaduan dengan nomor tiket. TANPA LOGIN.
 *
 * Inilah yang membuat "tracking yang transparan dari sisi pengguna" pada
 * subtema menjadi nyata, bukan klaim: melacak pengaduan semudah melacak paket.
 *
 * Halaman ini sengaja TIDAK berhenti di kotak pencarian. Sebuah kotak yang
 * menuntut nomor adalah jalan buntu bagi orang yang belum pernah melapor, dan
 * sebuah status tanpa janji waktu tidak bisa dinilai siapa pun — "sedang
 * ditangani" sejak kapan, dan sampai kapan masih wajar? Karena itu halaman
 * membawa empat hal lain yang semuanya menjawab pertanyaan orang yang sedang
 * menunggu sesuatu diperbaiki di rumahnya:
 *
 *   1. janji waktu tiap kategori, beserta seberapa sering ditepati;
 *   2. tahapan yang akan dilalui laporannya dan lama tiap tahap;
 *   3. kanal lain untuk melapor, lengkap dengan jam layanannya;
 *   4. pengaduan yang baru ditutup — anonim — sebagai bukti sistemnya hidup.
 *
 * Angka janji dan ketepatan DIAMBIL dari sumber yang sama dengan halaman
 * Rapor Kinerja (lihat `_sementara/data-lacak.ts`), bukan ditulis ulang di
 * sini: dua halaman yang menyebut angka berbeda untuk hal yang sama adalah
 * cacat yang paling cepat ditemukan orang.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Search } from "lucide-react";
import { Card, Panel } from "@/components/ui/card";
import { Badge, type Nada } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { KeadaanGalat, Pemberitahuan, Skeleton } from "@/components/ui/keadaan";
import { api, ApiError } from "@/lib/api";
import useApi from "@/lib/use-api";
import { tanggalJam } from "@/lib/format";
import type { LacakTiket } from "@/types/publik";
import { AlurPenanganan } from "./_bagian/alur-penanganan";
import { jamJanji } from "./_bagian/durasi";
import { JanjiWaktu } from "./_bagian/janji-waktu";
import { KanalLaporan } from "./_bagian/kanal-lapor";
import { SelesaiTerbaru } from "./_bagian/selesai-terbaru";
import { TanyaJawab } from "./_bagian/tanya-jawab";
import type { PanduanAduan } from "./_bagian/tipe";

const STATUS: Record<LacakTiket["status"], { label: string; nada: Nada }> = {
  BARU: { label: "Baru diterima", nada: "info" },
  DIPROSES: { label: "Sedang ditangani", nada: "peringatan" },
  SELESAI: { label: "Selesai", nada: "sukses" },
};

/**
 * Sisa waktu SLA dihitung dari stempel waktu milik SERVER.
 *
 * Jangan menghitung tenggatnya sendiri di klien: jam browser warga dan jam
 * browser petugas bisa berbeda, dan dua layar akan menampilkan sisa waktu
 * yang tidak sama untuk tiket yang sama.
 */
function sisaSla(jatuhTempo: string, terlampaui: boolean): string {
  const selisih = new Date(jatuhTempo).getTime() - Date.now();
  const menit = Math.round(Math.abs(selisih) / 60000);
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  const durasi = jam > 0 ? `${jam} jam ${sisa} menit` : `${menit} menit`;
  return terlampaui || selisih < 0
    ? `Melewati batas ${durasi}`
    : `Sisa ${durasi}`;
}

export default function HalamanLacak() {
  const [nomor, setNomor] = useState("");
  const [tiket, setTiket] = useState<LacakTiket | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  /*
   * Pendamping pencarian diambil TERPISAH dari tiketnya.
   *
   * Janji waktu, tahapan, dan kanal pelaporan harus tetap tampil meskipun
   * belum ada nomor yang dicari — dan sebaliknya, kotak pencarian wajib tetap
   * bekerja meskipun permintaan ini gagal. Keduanya tidak pernah saling
   * menunggu.
   */
  const {
    data: panduan,
    memuat,
    galat: galatPanduan,
    muatUlang,
  } = useApi<PanduanAduan>("/api/publik/panduan-lacak");

  /*
   * Bawa hasilnya ke layar begitu ketemu.
   *
   * Kartu hasil muncul di bawah panduan dan daftar nomor contoh — pada layar
   * laptop ia lahir di luar pandangan. Tanpa ini halaman tampak tidak
   * bereaksi sama sekali setelah tombol Lacak ditekan, dan orang menekannya
   * lagi karena menyangka gagal.
   *
   * Dipicu oleh BERUBAHNYA `tiket`, bukan dipanggil di dalam `jalankanCari`:
   * di sana `setTiket` belum selesai dan elemennya belum ada di DOM untuk
   * digulirkan.
   */
  const rujukanHasil = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!tiket) return;
    rujukanHasil.current?.scrollIntoView({
      // Gulir mendadak pada orang yang menyetel "kurangi gerak" bukan sekadar
      // tidak nyaman — bagi sebagian orang ia memicu pusing.
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, [tiket]);

  /** Satu jalur pencarian untuk form dan untuk nomor contoh — supaya tombol
   *  contoh tidak bisa diam-diam berperilaku lain dari tombol Lacak. */
  async function jalankanCari(teks: string) {
    const bersih = teks.trim();
    if (!bersih) return;

    setSibuk(true);
    setGalat(null);
    setTiket(null);
    try {
      const hasil = await api<LacakTiket>(
        `/api/publik/lacak/${encodeURIComponent(bersih)}`,
      );
      setTiket(hasil);
    } catch (e) {
      // Pesan dari server sudah menjelaskan apa yang harus dilakukan;
      // menggantinya dengan kalimat umum justru menghapus petunjuknya.
      setGalat(
        e instanceof ApiError
          ? e.message
          : "Gagal menghubungi server. Coba lagi beberapa saat.",
      );
    } finally {
      setSibuk(false);
    }
  }

  function cari(e: FormEvent) {
    e.preventDefault();
    void jalankanCari(nomor);
  }

  function pakaiContoh(n: string) {
    setNomor(n);
    void jalankanCari(n);
  }

  /** Janji waktu untuk kategori tiket yang sedang dilihat, bila ada. */
  const janjiTiket =
    tiket === null
      ? null
      : (panduan?.janji.find((j) => j.kategori === tiket.kategori) ?? null);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-7">
        <p className="eyebrow text-brand-600">Transparansi</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Lacak Pengaduan
        </h1>
        <p className="mt-3 max-w-[58ch] text-muted">
          Masukkan nomor pengaduan dari bukti laporan Anda untuk melihat status
          dan sisa waktu penanganannya. Tidak perlu masuk ke akun.
        </p>
      </header>

      {/* ── Pencarian, dan tepat di bawahnya jalan keluar bagi yang belum
             punya nomor. Keduanya satu benda, dipisah garis. ─────────── */}
      <section className="overflow-hidden rounded-card border border-line bg-surface">
        <div>
          <div className="p-5 sm:p-6">
            <form
              onSubmit={cari}
              className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end"
            >
              <TextField
                label="Nomor pengaduan"
                placeholder="LP-2026-10-0384"
                value={nomor}
                onChange={(e) => setNomor(e.target.value)}
                hint="Boleh diketik dengan atau tanpa tanda hubung."
                depan={<Search size={16} aria-hidden />}
                autoComplete="off"
              />
              <Button
                type="submit"
                ukuran="lg"
                memuat={sibuk}
                disabled={nomor.trim() === ""}
                className="sm:mb-6"
              >
                Lacak
              </Button>
            </form>

            {/* Nomor contoh. Tanpa ini halaman mustahil dicoba siapa pun yang
                belum pernah melapor — termasuk orang yang sedang menilainya.
                Sekali klik langsung menjalankan pencarian yang sama persis
                dengan tombol Lacak, bukan jalur lain. */}
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[12.5px] text-muted">
                Belum memegang nomor? Klik salah satu{" "}
                <b className="font-semibold text-ink">nomor contoh</b> berikut —
                keduanya laporan tiruan untuk peragaan:
              </p>
              <div className="mt-2.5 grid max-w-3xl gap-2 sm:grid-cols-2">
                {memuat ? (
                  <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : (
                  (panduan?.contoh ?? []).map((c) => (
                    /*
                     * `flex-wrap` dan nomor yang tidak boleh dipenggal.
                     *
                     * Di 320px nomornya pernah patah jadi "LP-2026-10-" dan
                     * "0384" di dua baris — sebuah nomor tiket yang terbelah
                     * tidak bisa dibaca ulang maupun disalin dengan yakin.
                     * Sekarang nomornya utuh dan keterangannya yang turun ke
                     * baris berikutnya kalau tempatnya habis. Tingginya
                     * dijaga 44px supaya tetap bisa diketuk.
                     */
                    <button
                      key={c.nomor}
                      type="button"
                      onClick={() => pakaiContoh(c.nomor)}
                      disabled={sibuk}
                      className="flex min-h-11 w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-input border border-line-strong px-3 py-2.5 text-left transition-colors hover:bg-soft disabled:opacity-60"
                    >
                      <span className="tabular font-mono text-[13px] font-semibold whitespace-nowrap">
                        {c.nomor}
                      </span>
                      <span className="text-[12px] text-muted">
                        {c.keterangan}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Yang paling sering ditanyakan sebelum orang berani mengetik
                nomornya: apakah ini membocorkan sesuatu. Jawabannya harus ada
                DI SEBELAH kotaknya, bukan di dasar halaman. */}
            <p className="mt-4 max-w-[76ch] text-[12.5px] leading-relaxed text-muted">
              Nomor pengaduan cukup untuk melacak, dan tidak cukup untuk
              mengetahui siapa pelapornya: halaman ini tidak pernah menampilkan
              nama, alamat, nomor sambungan, maupun kontak siapa pun.
            </p>
          </div>

          <div className="border-t border-line bg-soft/40 p-5 sm:p-6">
            <KanalLaporan
              kanal={panduan?.kanal ?? []}
              memuat={memuat}
              galat={galatPanduan}
              onCoba={muatUlang}
            />
          </div>
        </div>
      </section>

      {galat ? (
        <div className="mt-5">
          <Pemberitahuan nada="peringatan" judul="Tidak ditemukan">
            {galat}
          </Pemberitahuan>
        </div>
      ) : null}

      {/*
        `scroll-mt-24` WAJIB: bilah atas situs ini melekat (sticky), dan
        `scrollIntoView` menaruh elemennya di garis nol — tepat di bawah bilah
        itu, sehingga baris pertama hasilnya tertutup.
      */}
      <div ref={rujukanHasil} className="scroll-mt-24">
        {tiket ? (
          <HasilTiket
            tiket={tiket}
            janjiJam={janjiTiket === null ? null : janjiTiket.janjiJam}
          />
        ) : null}
      </div>

      {galatPanduan ? (
        <Card className="mt-12">
          <KeadaanGalat pesan={galatPanduan} onCoba={muatUlang} />
        </Card>
      ) : (
        <>
          <JanjiWaktu
            janji={panduan?.janji ?? []}
            // Nilai cadangan hanya terpakai saat rangka pemuatan tampil —
            // tidak ada angka yang terbaca dari sini.
            targetPct={panduan?.targetPct ?? 90}
            rentangHari={panduan?.rentangHari ?? 30}
            ketepatanPct={panduan?.ketepatanPct ?? null}
            memuat={memuat}
            sorotKategori={tiket?.kategori ?? null}
          />

          <AlurPenanganan
            tahapan={panduan?.tahapan ?? []}
            tanggapMenit={panduan?.tanggapMenit ?? null}
            memuat={memuat}
          />

          <SelesaiTerbaru
            daftar={panduan?.selesaiTerbaru ?? []}
            memuat={memuat}
          />
        </>
      )}

      <TanyaJawab />

      {/* Dua tautan ini dulu tertanam di tengah kalimat. Di ponsel sasarannya
          setinggi huruf — 15px — dan saat kalimatnya pecah jadi dua baris,
          sasarannya malah jadi kotak selebar paragraf yang sebagian besarnya
          bukan tautan. Dikeluarkan jadi dua plat setinggi 44px: ukurannya
          tetap di semua lebar, dan tujuannya terbaca tanpa kalimat. */}
      <nav
        aria-label="Halaman terkait"
        className="mt-10 border-t border-line pt-5"
      >
        <p className="max-w-[62ch] text-[13px] leading-relaxed text-muted">
          Ingin tahu seberapa cepat pengaduan ditangani secara keseluruhan, atau
          gangguan apa yang sedang berlangsung di wilayah Anda? Dua halaman
          berikut menjawabnya.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/kinerja"
            className="inline-flex min-h-11 items-center rounded-[3px] border border-line-strong px-3.5 text-[13px] font-semibold text-brand-600 transition-colors hover:bg-soft"
          >
            Lihat rapor kinerja
          </Link>
          <Link
            href="/status"
            className="inline-flex min-h-11 items-center rounded-[3px] border border-line-strong px-3.5 text-[13px] font-semibold text-brand-600 transition-colors hover:bg-soft"
          >
            Periksa status layanan
          </Link>
        </div>
      </nav>
    </div>
  );
}

function HasilTiket({
  tiket,
  janjiJam,
}: {
  tiket: LacakTiket;
  /** Janji kategori ini, bila pendampingnya sudah termuat. */
  janjiJam: number | null;
}) {
  const s = STATUS[tiket.status];
  const selesai = tiket.status === "SELESAI";

  return (
    <div className="mt-6 space-y-5">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="tabular font-mono text-lg font-bold">{tiket.nomor}</p>
            <p className="mt-1 text-[13.5px] text-muted">
              {tiket.kategori} · Zona {tiket.zona}
            </p>
          </div>
          <Badge nada={s.nada} titik>
            {s.label}
          </Badge>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-[13px] sm:grid-cols-2">
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-muted">Dilaporkan</dt>
            <dd className="font-medium sm:mt-0.5">
              {tanggalJam(tiket.dibuatPada)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 sm:block">
            <dt className="text-muted">Batas waktu penanganan</dt>
            <dd
              className={`font-semibold sm:mt-0.5 ${
                tiket.slaTerlampaui ? "text-danger" : "text-ink"
              }`}
            >
              {selesai && !tiket.slaTerlampaui
                ? "Selesai tepat waktu"
                : sisaSla(tiket.slaJatuhTempo, tiket.slaTerlampaui)}
            </dd>
          </div>
        </dl>

        {/* Sisa waktu di atas baru berarti kalau pembacanya tahu janji
            kategorinya. Angkanya DIAMBIL dari daftar janji di bawah, bukan
            dihitung ulang di sini. */}
        {janjiJam === null ? null : (
          <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
            Janji waktu untuk kategori {tiket.kategori} adalah{" "}
            <b className="tabular font-mono text-ink">{jamJanji(janjiJam)}</b>{" "}
            sejak laporan diterima — barisnya ditandai pada daftar janji waktu
            di bawah.
          </p>
        )}
      </Panel>

      <Panel judul="Kronologi penanganan">
        <ol className="relative space-y-5 pl-6">
          {/* Garis vertikal penghubung langkah. */}
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-[0.3125rem] w-px bg-line"
          />
          {tiket.kronologi.map((k, i) => {
            const terakhir = i === tiket.kronologi.length - 1;
            return (
              <li key={k.waktu + k.judul} className="relative">
                <span
                  aria-hidden
                  className={`absolute top-1 -left-6 flex size-2.5 items-center justify-center rounded-full ${
                    terakhir && selesai
                      ? "bg-success"
                      : terakhir
                        ? "bg-brand-500"
                        : "bg-line-strong"
                  }`}
                >
                  {terakhir && selesai ? (
                    <Check size={8} className="text-white" />
                  ) : null}
                </span>
                <p className="text-[14px] font-semibold">{k.judul}</p>
                <p className="mt-0.5 text-[12.5px] text-muted">
                  {tanggalJam(k.waktu)}
                </p>
                {k.catatan ? (
                  <p className="mt-1 text-[13px] text-muted">{k.catatan}</p>
                ) : null}
              </li>
            );
          })}
        </ol>

        {/* Halaman ini hanya menampilkan status dan kronologi. Nama, alamat,
            dan kontak pelapor TIDAK pernah ikut — nomor tiket cukup untuk
            melacak, tapi tidak boleh membocorkan siapa pelapornya. */}
        <p className="mt-6 rounded-input bg-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
          Demi privasi pelapor, halaman ini tidak menampilkan nama, alamat,
          maupun kontak siapa pun.
        </p>
      </Panel>
    </div>
  );
}
