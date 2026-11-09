"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  Crosshair,
  ExternalLink,
  LifeBuoy,
  LoaderCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { SalinNomor } from "./_bagian/salin-nomor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PetaTitikDinamis } from "./_bagian/peta-titik-dinamis";
import type { Titik } from "./_bagian/peta-titik";

/**
 * Kategori gangguan beserta janji waktunya.
 *
 * Jam SLA di sini HARUS sama dengan `JAM_SLA_KATEGORI` di
 * `MIA-JERNIH-BE/src/rute/tiket.ts`, dan `id`-nya harus sama persis — server
 * mencocokkannya dengan `kategori.toLowerCase()` lalu jatuh ke 48 jam bila
 * tidak dikenal. Nilai yang meleset di sini tidak menghasilkan galat apa pun;
 * halaman hanya menjanjikan tenggat yang berbeda dari yang dihitung server.
 */
const KATEGORI_GANGGUAN = [
  { id: "air tidak mengalir", label: "Air tidak mengalir", jam: 12 },
  { id: "air keruh/berbau", label: "Air keruh / berbau", jam: 24 },
  { id: "kebocoran pipa", label: "Kebocoran pipa", jam: 6 },
  { id: "meter/keypad rusak", label: "Meter / keypad rusak", jam: 48 },
  { id: "tekanan lemah", label: "Tekanan lemah", jam: 24 },
  { id: "lainnya", label: "Lainnya", jam: 72 },
];

/** Batas yang ditegakkan server: `deskripsi` minimal 5 karakter. */
const DESKRIPSI_MIN = 5;
const DESKRIPSI_MAKS = 500;
const MAKS_FOTO = 3;
/** Server menolak data URI di atas 7 juta karakter; 5 MB berkas aman di bawahnya. */
const MAKS_UKURAN_FOTO = 5 * 1024 * 1024;

/**
 * Titik awal pin: pusat kota layanan.
 *
 * BUKAN letak meter. `GET /api/meter/:id` mengembalikan `alamat` dan `zona`
 * tetapi tidak `lat`/`lng`, walaupun kedua kolom itu ada di tabel `Meter` —
 * jadi koordinat meter memang belum tersedia di sisi warga. Halaman
 * mengatakannya apa adanya dan meminta warga menggeser pinnya, alih-alih
 * menyebut angka ini "terdeteksi" seperti versi sebelumnya.
 */
const TITIK_AWAL: Titik = { lat: -6.9175, lng: 107.6191 };

const FAQ = [
  {
    tanya: "Apa itu token angka?",
    jawab:
      "Token adalah deret 4–10 digit yang Anda terima setelah membeli air. Kode itu menambah saldo liter pada satu meter tertentu dan hanya bisa dipakai sekali.",
  },
  {
    tanya: "Meter saya sedang tidak terhubung internet. Bisa isi token?",
    jawab:
      "Bisa. Tekan * pada keypad meter, ketik kodenya, lalu tekan A. Layar menampilkan TOKEN VALID dan saldo langsung bertambah. Portal ikut diperbarui begitu meter tersambung kembali.",
  },
  {
    tanya: "Kenapa meter saya berbunyi?",
    jawab:
      "Bunyi berasal dari firmware dan menandakan saldo menipis: bip tiap 10 detik saat saldo ≤ 5 L, tiap 2 detik saat ≤ 2 L, dan bunyi terus saat 0 L — di titik itu relay menutup aliran sampai token diisi.",
  },
  {
    tanya: "Kenapa air tidak mengalir padahal saldo masih ada?",
    jawab:
      "Periksa saklar fisik pada badan meter. Relay hanya terbuka bila saldo di atas nol DAN saklar berada pada posisi ON.",
  },
  {
    tanya: "Apakah nomor HP dipakai untuk verifikasi?",
    jawab:
      "Tidak. Verifikasi akun hanya lewat kode 6 digit yang dikirim ke email. Nomor HP dipakai petugas untuk menghubungi Anda saat menangani laporan.",
  },
  {
    tanya: "Bisa satu akun untuk beberapa meter?",
    jawab:
      "Bisa. Meter yang sudah terhubung ke akun Anda dapat dipilih lewat penukar meter di bagian atas portal, dan tiap laporan melekat pada meter yang sedang aktif.",
  },
];

interface TiketItem {
  id: string;
  nomor: string;
  kategori: string;
  deskripsi: string;
  status: "BARU" | "DIPROSES" | "SELESAI";
  slaJatuhTempo: string;
  slaTerlampaui?: boolean;
  dibuatPada: string;
  selesaiPada?: string | null;
}

function lencanaStatusTiket(status: string, slaTerlampaui?: boolean) {
  if (status === "SELESAI") {
    return (
      <Badge nada="sukses" titik>
        Selesai
      </Badge>
    );
  }
  if (slaTerlampaui) {
    return (
      <Badge nada="bahaya" titik>
        Melewati SLA
      </Badge>
    );
  }
  if (status === "DIPROSES") {
    return (
      <Badge nada="brand" titik>
        Diproses
      </Badge>
    );
  }
  return (
    <Badge nada="peringatan" titik>
      Laporan baru
    </Badge>
  );
}

function KontenBantuan() {
  const { meterAktif } = useAuth();

  const [tabAktif, setTabAktif] = useState<"lapor" | "tiket" | "faq">("lapor");

  const [kategori, setKategori] = useState(KATEGORI_GANGGUAN[0].id);
  const [deskripsi, setDeskripsi] = useState("");
  const [lampirkanSensor, setLampirkanSensor] = useState(true);
  const [daftarFoto, setDaftarFoto] = useState<string[]>([]);

  const [titik, setTitik] = useState<Titik>(TITIK_AWAL);
  /* Dinaikkan hanya saat titiknya berubah dari LUAR peta, supaya petanya tahu
     kapan harus memusatkan ulang — dan tidak melakukannya saat pin diseret. */
  const [nonceTitik, setNonceTitik] = useState(0);
  const [mencariLokasi, setMencariLokasi] = useState(false);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const [memuatKirim, setMemuatKirim] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const [tiketBerhasil, setTiketBerhasil] = useState<{
    nomor: string;
    sla: string;
  } | null>(null);

  const [daftarTiketSaya, setDaftarTiketSaya] = useState<TiketItem[]>([]);
  const [memuatTiket, setMemuatTiket] = useState(false);

  const [faqTerbuka, setFaqTerbuka] = useState<number | null>(0);

  useEffect(() => {
    let aktif = true;
    (async () => {
      setMemuatTiket(true);
      try {
        const res = await api<{ tiket: TiketItem[] }>("/api/tiket");
        if (aktif) setDaftarTiketSaya(res.tiket || []);
      } catch {
        if (aktif) setDaftarTiketSaya([]);
      } finally {
        if (aktif) setMemuatTiket(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  const ambilTiketSaya = async () => {
    try {
      const res = await api<{ tiket: TiketItem[] }>("/api/tiket");
      setDaftarTiketSaya(res.tiket || []);
    } catch {
      // Daftar tiket adalah pelengkap; kegagalannya tidak boleh menutupi
      // keberhasilan pengiriman yang baru saja terjadi.
    }
  };

  const pakaiLokasiSaya = () => {
    if (!("geolocation" in navigator)) {
      setPesanLokasi("Peramban ini tidak menyediakan layanan lokasi.");
      return;
    }

    setPesanLokasi(null);
    setMencariLokasi(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTitik({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNonceTitik((n) => n + 1);
        setMencariLokasi(false);
      },
      (err) => {
        setMencariLokasi(false);
        /*
         * Sebabnya dibedakan. "Gagal mengambil lokasi" mengirim orang
         * memeriksa sinyal GPS padahal yang terjadi mereka menekan "Blokir"
         * pada permintaan izin — dua hal yang penyelesaiannya sama sekali
         * berbeda.
         */
        setPesanLokasi(
          err.code === err.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Geser pin pada peta untuk menandai titiknya."
            : "Lokasi tidak terbaca. Geser pin pada peta untuk menandai titiknya.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const handleUnggahFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (daftarFoto.length + files.length > MAKS_FOTO) {
      setPesanGalat(`Maksimal ${MAKS_FOTO} foto pendukung.`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > MAKS_UKURAN_FOTO) {
        setPesanGalat(`Foto ${file.name} melebihi ukuran maksimal 5 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setDaftarFoto((prev) =>
            [...prev, reader.result as string].slice(0, MAKS_FOTO),
          );
        }
      };
      reader.readAsDataURL(file);
    });

    /* Nilai input dikosongkan supaya berkas yang SAMA bisa dipilih lagi
       setelah dihapus; tanpa ini `change` tidak berbunyi untuk nama berkas
       yang tidak berubah. */
    e.target.value = "";
  };

  const handleHapusFoto = (indeks: number) => {
    setDaftarFoto((prev) => prev.filter((_, i) => i !== indeks));
  };

  const handleKirimLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deskripsi.trim().length < DESKRIPSI_MIN) {
      setPesanGalat(`Ceritakan masalahnya minimal ${DESKRIPSI_MIN} karakter.`);
      return;
    }

    setPesanGalat(null);
    setMemuatKirim(true);

    try {
      const res = await api<{
        ok: boolean;
        tiket: { nomor: string; slaJatuhTempo: string };
      }>("/api/tiket", {
        method: "POST",
        body: JSON.stringify({
          kategori,
          deskripsi: deskripsi.trim(),
          foto: daftarFoto,
          lat: titik.lat,
          lng: titik.lng,
          /*
           * Kotak centang sensor BENAR-BENAR mengubah yang dikirim.
           *
           * Server tidak punya medan "lampirkan telemetri", tetapi ia
           * menyimpan `meterId` — dan dari situlah petugas menarik rekaman
           * debit, saldo, relay, dan saklar milik meter tersebut. Jadi
           * mengirim atau menahan `meterId` persis sama artinya dengan
           * memberi atau tidak memberi akses ke telemetrinya.
           *
           * Versi sebelumnya selalu mengirim `meterId` apa pun keadaan
           * kotaknya: kendalinya hanya gambar, dan mematikannya tidak
           * menahan apa pun.
           */
          meterId: lampirkanSensor ? meterAktif?.id : undefined,
        }),
      });

      setTiketBerhasil({
        nomor: res.tiket.nomor,
        sla: res.tiket.slaJatuhTempo,
      });

      setDeskripsi("");
      setDaftarFoto([]);
      ambilTiketSaya();
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat(
          "Gagal mengirimkan laporan gangguan. Coba lagi beberapa saat.",
        );
      }
    } finally {
      setMemuatKirim(false);
    }
  };

  const tabKelas = (aktif: boolean) =>
    `rounded-[7px] px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
      aktif
        ? "bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
        : "text-muted hover:text-ink"
    }`;

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Kepala halaman ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Pusat bantuan
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Bantuan &amp; lapor gangguan
          </h1>
          <p className="mt-1 text-xs text-balance text-muted">
            Laporkan gangguan saluran air, pantau tenggat penanganan, dan baca
            jawaban pertanyaan yang paling sering masuk.
          </p>
        </div>

        {/* Alurnya CEKUNG, bidak yang aktif TIMBUL di dalamnya — bentuk sakelar
            sungguhan, dan satu-satunya bentuk yang langsung memberi tahu sisi
            mana yang sedang menyala. */}
        <div className="cekung flex shrink-0 p-1">
          <button
            type="button"
            onClick={() => setTabAktif("lapor")}
            className={tabKelas(tabAktif === "lapor")}
          >
            Lapor gangguan
          </button>
          <button
            type="button"
            onClick={() => setTabAktif("tiket")}
            className={tabKelas(tabAktif === "tiket")}
          >
            Tiket saya ({daftarTiketSaya.length})
          </button>
          <button
            type="button"
            onClick={() => setTabAktif("faq")}
            className={tabKelas(tabAktif === "faq")}
          >
            Pertanyaan umum
          </button>
        </div>
      </div>

      {pesanGalat ? (
        <aside
          role="alert"
          className="permukaan border-danger/40 bg-danger-soft p-3.5 text-xs font-medium text-danger"
        >
          {pesanGalat}
        </aside>
      ) : null}

      {/* ── Lapor gangguan ── */}
      {tabAktif === "lapor" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleKirimLaporan} className="permukaan space-y-6 p-6">
              <h2 className="font-display text-base font-bold text-ink">
                Lapor gangguan baru
              </h2>

              {/* 1. Jenis gangguan */}
              <div>
                <label className="mb-2 block text-xs font-bold text-ink">
                  Jenis gangguan
                </label>
                <div className="berjenjang grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {KATEGORI_GANGGUAN.map((k) => {
                    const aktif = kategori === k.id;
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setKategori(k.id)}
                        /*
                         * Yang terpilih duduk LEBIH TINGGI, bukan sekadar
                         * bergaris biru. Perbedaan tinggi terbaca lebih cepat
                         * daripada perbedaan warna garis setebal satu piksel,
                         * dan tetap terbaca oleh orang yang sulit membedakan
                         * biru dari abu-abu.
                         */
                        className={`angkat flex flex-col items-start rounded-card border p-3 text-left ${
                          aktif
                            ? "border-brand-500 bg-brand-50 shadow-[var(--kilau-tepi),var(--kedalaman-3)] ring-1 ring-brand-500"
                            : "border-line bg-surface shadow-[var(--kilau-tepi),var(--kedalaman-1)] hover:border-line-strong"
                        }`}
                      >
                        <span className="text-xs font-bold text-ink">
                          {k.label}
                        </span>
                        <span className="mt-0.5 font-mono text-[10px] font-semibold text-brand-700 dark:text-accent">
                          Ditangani maks. {k.jam} jam
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Ceritakan masalahnya */}
              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="deskripsi" className="text-xs font-bold text-ink">
                    Ceritakan masalahnya
                  </label>
                  <span className="font-mono text-[11px] text-muted">
                    {deskripsi.length}/{DESKRIPSI_MAKS}
                  </span>
                </div>
                {/* Kolom isian dibuat CEKUNG: di seluruh portal, yang menonjol
                    adalah benda dan yang masuk ke dalam adalah tempat menaruh
                    sesuatu. */}
                <textarea
                  id="deskripsi"
                  rows={4}
                  required
                  maxLength={DESKRIPSI_MAKS}
                  placeholder="Contoh: air keruh kekuningan sejak subuh di seluruh keran rumah, tetangga sebelah juga mengalami hal yang sama."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="cekung w-full p-3 text-xs leading-relaxed text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              {/* 3. Foto pendukung */}
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-xs font-bold text-ink">
                    Foto pendukung
                  </label>
                  <span className="font-mono text-[11px] text-muted">
                    {daftarFoto.length}/{MAKS_FOTO} &middot; JPG/PNG
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-3">
                  {daftarFoto.map((fotoUrl, idx) => (
                    <div
                      key={idx}
                      className="relative size-20 overflow-hidden rounded-[10px] border border-line shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                    >
                      {/*
                        Sengaja <img>, bukan next/image: sumbernya data URI
                        hasil FileReader yang belum pernah diunggah ke mana pun.
                        next/image tidak bisa mengoptimalkan skema `data:` dan
                        akan melempar galat saat dirender.
                      */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fotoUrl}
                        alt={`Foto pendukung ${idx + 1}`}
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleHapusFoto(idx)}
                        aria-label={`Hapus foto ${idx + 1}`}
                        className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-brand-900/70 text-white hover:bg-brand-900"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {daftarFoto.length < MAKS_FOTO ? (
                    <label className="cekung flex size-20 cursor-pointer flex-col items-center justify-center border-dashed text-muted hover:text-brand-600 dark:hover:text-accent">
                      <Camera size={18} />
                      <span className="mt-1 font-mono text-[9px]">
                        Pilih foto
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={handleUnggahFoto}
                      />
                    </label>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[10px] text-muted">
                  Maksimal 5 MB per foto.
                </p>
              </div>

              {/* 4. Alamat meter + telemetri */}
              <div className="cekung space-y-3 p-4">
                <div>
                  <p className="text-xs font-bold text-ink">
                    {meterAktif?.nomorSeri ?? "Meter belum dipilih"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Laporan ini melekat pada meter yang sedang aktif di portal.
                  </p>
                </div>

                <label
                  htmlFor="sensor"
                  className="flex cursor-pointer items-start gap-2.5"
                >
                  <input
                    id="sensor"
                    type="checkbox"
                    checked={lampirkanSensor}
                    onChange={(e) => setLampirkanSensor(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 rounded-sm border-line text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs leading-relaxed text-ink">
                    <strong>Lampirkan data sensor 24 jam</strong>
                    <span className="block text-[11px] text-muted">
                      Debit, saldo, relay, dan saklar meter ini ikut dibaca
                      petugas, sehingga penyebabnya bisa ditelusuri tanpa survei
                      awal. Dimatikan berarti laporan dikirim tanpa menautkan
                      meter.
                    </span>
                  </span>
                </label>
              </div>

              {/* 5. Titik lokasi gangguan */}
              <div>
                <label className="mb-2 block text-xs font-bold text-ink">
                  Titik lokasi gangguan
                </label>

                <PetaTitikDinamis
                  titik={titik}
                  nonce={nonceTitik}
                  nonaktif={memuatKirim}
                  onUbah={setTitik}
                />

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={pakaiLokasiSaya}
                    disabled={memuatKirim || mencariLokasi}
                    className="angkat inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)] disabled:opacity-60"
                  >
                    {mencariLokasi ? (
                      <LoaderCircle
                        size={13}
                        className="motion-aware animate-spin"
                      />
                    ) : (
                      <Crosshair size={13} />
                    )}
                    {mencariLokasi ? "Mencari lokasi…" : "Gunakan lokasi saya"}
                  </button>

                  <span className="font-mono text-[11px] text-muted">
                    {titik.lat.toFixed(5)}, {titik.lng.toFixed(5)}
                  </span>
                </div>

                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                  {pesanLokasi ??
                    "Geser pin merah ke titik gangguan yang sebenarnya — gangguan air sering tidak berada tepat di meter."}
                </p>
              </div>

              <Button type="submit" varian="utama" blok memuat={memuatKirim}>
                Kirim laporan
                {!memuatKirim ? <Send size={14} /> : null}
              </Button>
            </form>
          </div>

          {/* Kolom kanan */}
          <div className="space-y-6">
            <div className="permukaan p-5">
              <h3 className="font-display text-sm font-bold text-ink">
                Tenggat penanganan
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Tiap laporan punya batas waktu yang dihitung otomatis sejak
                dikirim, dan bisa dilihat siapa pun lewat nomor tiketnya.
              </p>

              <ul className="mt-3 space-y-2 font-mono text-xs">
                {KATEGORI_GANGGUAN.map((k) => (
                  <li
                    key={k.id}
                    className="flex justify-between gap-3 border-b border-line pb-1.5 last:border-0 last:pb-0"
                  >
                    <span className="text-muted">{k.label}</span>
                    <span className="shrink-0 font-bold text-ink">
                      {k.jam} jam
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="permukaan p-5">
              <h3 className="font-display text-sm font-bold text-ink">
                Kontak petugas PDAM
              </h3>
              <p className="mt-1 text-xs text-muted">
                Untuk gangguan mendesak, hubungi langsung.
              </p>

              <div className="berjenjang mt-3 space-y-2.5 text-xs">
                <a
                  href="tel:+622215000247"
                  className="angkat flex items-center gap-3 rounded-[10px] border border-line bg-surface p-3 shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100 dark:text-accent">
                    <Phone size={16} />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">
                      Hotline gangguan 24 jam
                    </span>
                    <span className="font-mono text-xs text-muted">
                      (022) 1500-247
                    </span>
                  </span>
                </a>

                <a
                  href="https://wa.me/628112345678"
                  target="_blank"
                  rel="noreferrer"
                  className="angkat flex items-center gap-3 rounded-[10px] border border-line bg-surface p-3 shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100 dark:text-accent">
                    <LifeBuoy size={16} />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">
                      WhatsApp aduan teknis
                    </span>
                    <span className="font-mono text-xs text-muted">
                      +62 811-234-5678
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Tiket saya ── */}
      {tabAktif === "tiket" ? (
        <div className="permukaan p-5">
          <h2 className="font-display text-base font-bold text-ink">
            Tiket pengaduan saya
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Status penanganan petugas dan sisa waktu sampai tenggatnya.
          </p>

          {memuatTiket ? (
            <div className="py-12 text-center text-xs text-muted">
              Memuat daftar tiket…
            </div>
          ) : daftarTiketSaya.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-muted">
                Belum ada laporan yang Anda kirim.
              </p>
              <button
                type="button"
                onClick={() => setTabAktif("lapor")}
                className="mt-3 text-xs font-bold text-brand-700 hover:underline dark:text-accent"
              >
                Buat laporan pertama &rarr;
              </button>
            </div>
          ) : (
            <ul className="berjenjang mt-4 space-y-2.5">
              {daftarTiketSaya.map((t) => (
                <li
                  key={t.id}
                  className="permukaan-rata flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/*
                        `break-all` pada nomor: di 390px, "LP-2026-10-0035"
                        bersama lencana statusnya melebihi lebar kolom, dan
                        tanpa ini nomornya mendorong kartu sampai seluruh
                        baris menjulur keluar layar.
                      */}
                      <span className="font-mono text-sm font-bold break-all text-ink">
                        {t.nomor}
                      </span>
                      {lencanaStatusTiket(t.status, t.slaTerlampaui)}
                      <SalinNomor nomor={t.nomor} label="Salin" />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-ink capitalize">
                      {t.kategori}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                      {t.deskripsi}
                    </p>
                    <span className="mt-1 block font-mono text-[10px] text-muted">
                      Dilaporkan {tanggalJam(t.dibuatPada)}
                    </span>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <div className="text-left sm:text-right">
                      <span className="font-mono text-[11px] text-muted">
                        Tenggat
                      </span>
                      <p
                        className={`font-mono text-xs font-bold ${
                          t.slaTerlampaui ? "text-danger" : "text-ink"
                        }`}
                      >
                        {tanggalJam(t.slaJatuhTempo)}
                      </p>
                    </div>
                    <Link
                      href={`/lacak?nomor=${encodeURIComponent(t.nomor)}`}
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
                    >
                      <span>Lacak publik</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {/* ── Pertanyaan umum ── */}
      {tabAktif === "faq" ? (
        <div className="permukaan p-5">
          <h2 className="font-display text-base font-bold text-ink">
            Pertanyaan umum
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Enam hal yang paling sering ditanyakan warga.
          </p>

          <div className="berjenjang mt-4 space-y-2">
            {FAQ.map((f, i) => {
              const terbuka = faqTerbuka === i;
              return (
                <div key={f.tanya} className="permukaan-rata overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqTerbuka(terbuka ? null : i)}
                    aria-expanded={terbuka}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  >
                    <span className="text-xs font-bold text-ink">{f.tanya}</span>
                    <ChevronDown
                      size={16}
                      className={`motion-aware shrink-0 text-muted transition-transform duration-200 ${
                        terbuka ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {terbuka ? (
                    <p className="px-4 pb-4 text-xs leading-relaxed text-muted">
                      {f.jawab}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ── Nomor tiket berhasil dibuat ── */}
      {tiketBerhasil ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setTiketBerhasil(null)}
            className="tirai-masuk motion-aware fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
            aria-label="Tutup"
          />

          <div className="lembar-masuk motion-aware relative z-10 w-full max-w-md rounded-sheet border border-line bg-surface p-6 text-center shadow-[var(--kilau-tepi),var(--kedalaman-4)]">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 size={28} />
            </div>

            <span className="mt-3 inline-block font-mono text-[11px] font-bold text-success uppercase">
              Laporan terkirim
            </span>
            <h3 className="font-display text-xl font-bold text-ink">
              Tiket pengaduan diterbitkan
            </h3>

            <div className="cekung my-5 p-4">
              <span className="font-mono text-[10px] text-muted uppercase">
                Nomor tiket Anda
              </span>
              <div className="my-1 font-mono text-2xl font-black tracking-wider text-ink">
                {tiketBerhasil.nomor}
              </div>
              <SalinNomor nomor={tiketBerhasil.nomor} />
            </div>

            <p className="text-xs leading-relaxed text-balance text-muted">
              Petugas menangani laporan ini paling lambat{" "}
              <strong className="text-ink">
                {tanggalJam(tiketBerhasil.sla)}
              </strong>
              . Nomor di atas bisa dilacak siapa pun tanpa perlu masuk akun.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link href={`/lacak?nomor=${encodeURIComponent(tiketBerhasil.nomor)}`}>
                <Button varian="utama" blok>
                  Lacak tiket
                  <ExternalLink size={14} />
                </Button>
              </Link>
              <Button
                varian="halus"
                blok
                onClick={() => {
                  setTiketBerhasil(null);
                  setTabAktif("tiket");
                }}
              >
                Tutup &amp; lihat tiket saya
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HalamanBantuan() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted">
          Memuat bantuan…
        </div>
      }
    >
      <KontenBantuan />
    </Suspense>
  );
}
