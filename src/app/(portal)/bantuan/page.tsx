"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  Copy,
  ExternalLink,
  LifeBuoy,
  MapPin,
  Phone,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const KATEGORI_GANGGUAN = [
  { id: "air keruh/berbau", label: "Air Keruh / Berbau", sla: "SLA: 24 Jam" },
  { id: "kebocoran pipa", label: "Kebocoran Pipa Distribusi", sla: "SLA: 6 Jam" },
  { id: "air tidak mengalir", label: "Air Tidak Mengalir", sla: "SLA: 12 Jam" },
  { id: "meter/keypad rusak", label: "Meter atau Keypad Rusak", sla: "SLA: 48 Jam" },
  { id: "tekanan lemah", label: "Tekanan Air Lemah", sla: "SLA: 24 Jam" },
  { id: "lainnya", label: "Kendala Lainnya", sla: "SLA: 72 Jam" },
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
    return <Badge nada="sukses" titik>Selesai</Badge>;
  }
  if (slaTerlampaui) {
    return <Badge nada="bahaya" titik>Melewati SLA</Badge>;
  }
  if (status === "DIPROSES") {
    return <Badge nada="brand" titik>Diproses</Badge>;
  }
  return <Badge nada="peringatan" titik>Laporan Baru</Badge>;
}

function KontenBantuan() {
  const { meterAktif } = useAuth();

  const [tabAktif, setTabAktif] = useState<"lapor" | "tiket" | "faq">("lapor");

  // Form State
  const [kategori, setKategori] = useState(KATEGORI_GANGGUAN[0].id);
  const [deskripsi, setDeskripsi] = useState("");
  const [lampirkanSensor, setLampirkanSensor] = useState(true);
  const [daftarFoto, setDaftarFoto] = useState<string[]>([]);
  const titikKoordinat = {
    lat: -6.9175,
    lng: 107.6191,
  };

  const [memuatKirim, setMemuatKirim] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  // Modal Tiket Berhasil Dibuat
  const [tiketBerhasil, setTiketBerhasil] = useState<{ nomor: string; sla: string } | null>(null);
  const [sudahSalin, setSudahSalin] = useState(false);

  // Tiket Saya
  const [daftarTiketSaya, setDaftarTiketSaya] = useState<TiketItem[]>([]);
  const [memuatTiket, setMemuatTiket] = useState(false);

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
      // Abaikan
    }
  };

  // Handle Unggah Foto Maksimal 3
  const handleUnggahFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (daftarFoto.length + files.length > 3) {
      setPesanGalat("Maksimal 3 foto pendukung yang dapat diunggah.");
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setPesanGalat(`Foto ${file.name} melebihi ukuran maksimal 5 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setDaftarFoto((prev) => [...prev, reader.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleHapusFoto = (indeks: number) => {
    setDaftarFoto((prev) => prev.filter((_, i) => i !== indeks));
  };

  // Kirim Laporan Gangguan
  const handleKirimLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deskripsi.trim().length < 5) {
      setPesanGalat("Deskripsi pengaduan minimal 5 karakter.");
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
          lat: titikKoordinat.lat,
          lng: titikKoordinat.lng,
          meterId: meterAktif?.id,
        }),
      });

      setTiketBerhasil({
        nomor: res.tiket.nomor,
        sla: res.tiket.slaJatuhTempo,
      });

      // Reset form
      setDeskripsi("");
      setDaftarFoto([]);
      ambilTiketSaya();
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal mengirimkan laporan gangguan. Coba lagi beberapa saat.");
      }
    } finally {
      setMemuatKirim(false);
    }
  };

  const handleSalinNomorTiket = () => {
    if (!tiketBerhasil) return;
    navigator.clipboard.writeText(tiketBerhasil.nomor);
    setSudahSalin(true);
    setTimeout(() => setSudahSalin(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            Layanan Pelanggan & Aduan
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Bantuan & Pengaduan
          </h1>
          <p className="mt-1 text-xs text-muted text-balance">
            Lapor gangguan saluran air, pantau kepatuhan SLA teknisi, dan lacak tindak lanjut secara terbuka.
          </p>
        </div>

        {/* Tab Pemilih */}
        <div className="flex rounded-[3px] border border-line bg-soft p-1">
          <button
            type="button"
            onClick={() => setTabAktif("lapor")}
            className={`rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors ${
              tabAktif === "lapor" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            Lapor Gangguan
          </button>
          <button
            type="button"
            onClick={() => setTabAktif("tiket")}
            className={`rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors ${
              tabAktif === "tiket" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            Tiket Saya ({daftarTiketSaya.length})
          </button>
          <button
            type="button"
            onClick={() => setTabAktif("faq")}
            className={`rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors ${
              tabAktif === "faq" ? "bg-surface text-ink shadow-xs" : "text-muted hover:text-ink"
            }`}
          >
            Bantuan & FAQ
          </button>
        </div>
      </div>

      {pesanGalat ? (
        <aside
          role="alert"
          className="rounded-[3px] border border-danger/40 bg-danger/10 p-3.5 text-xs font-medium text-danger"
        >
          {pesanGalat}
        </aside>
      ) : null}

      {/* ── TAB 1: FORMULIR LAPOR GANGGUAN ── */}
      {tabAktif === "lapor" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Kolom 1 & 2: Formulir Pengaduan */}
          <div className="space-y-6 lg:col-span-2">
            <form onSubmit={handleKirimLaporan} className="space-y-5 rounded-[4px] border border-line bg-surface p-6 shadow-xs">
              <h2 className="font-display text-base font-bold text-ink">
                Formulir Pengaduan Warga
              </h2>

              {/* 1. Pilih Kategori Gangguan */}
              <div>
                <label className="mb-2 block text-xs font-bold text-ink">
                  Kategori Masalah
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {KATEGORI_GANGGUAN.map((k) => {
                    const aktif = kategori === k.id;
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setKategori(k.id)}
                        className={`flex flex-col items-start rounded-[3px] border p-3 text-left transition-colors ${
                          aktif
                            ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                            : "border-line bg-surface hover:bg-soft"
                        }`}
                      >
                        <span className="text-xs font-bold text-ink">{k.label}</span>
                        <span className="font-mono text-[10px] font-semibold text-brand-700 dark:text-accent">
                          {k.sla}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Deskripsi Masalah */}
              <div>
                <label htmlFor="deskripsi" className="mb-1.5 block text-xs font-bold text-ink">
                  Rincian Deskripsi Gangguan
                </label>
                <textarea
                  id="deskripsi"
                  rows={4}
                  required
                  placeholder="Jelaskan kendala secara spesifik, misalnya: air keruh kekuningan sejak subuh tadi di seluruh keran rumah..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full rounded-[3px] border border-line bg-canvas p-3 text-xs leading-relaxed text-ink outline-none focus:border-brand-500"
                />
              </div>

              {/* 3. Unggah Foto Bukti (Maks 3, <= 5 MB) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink">
                    Foto Bukti Kondisi (Maksimal 3 Foto)
                  </label>
                  <span className="font-mono text-[11px] text-muted">
                    {daftarFoto.length}/3 Foto
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-3">
                  {daftarFoto.map((fotoUrl, idx) => (
                    <div key={idx} className="relative size-20 overflow-hidden rounded-[3px] border border-line">
                      {/*
                        Sengaja <img>, bukan next/image: sumbernya data URI
                        hasil FileReader yang belum pernah diunggah ke mana pun.
                        next/image tidak bisa mengoptimalkan skema `data:` dan
                        akan melempar galat saat dirender.
                      */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fotoUrl} alt={`Foto bukti ${idx + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleHapusFoto(idx)}
                        className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {daftarFoto.length < 3 ? (
                    <label className="flex size-20 cursor-pointer flex-col items-center justify-center rounded-[3px] border-2 border-dashed border-line text-muted hover:border-brand-500 hover:text-brand-600">
                      <Camera size={18} />
                      <span className="mt-1 font-mono text-[9px]">Pilih Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUnggahFoto}
                      />
                    </label>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[10px] text-muted">
                  Format gambar JPG, PNG, atau WEBP (maksimal 5 MB per foto).
                </p>
              </div>

              {/* 4. Lampirkan Data Sensor 24 Jam */}
              <div className="flex items-start gap-2.5 rounded-[3px] border border-line bg-soft p-3">
                <input
                  id="sensor"
                  type="checkbox"
                  checked={lampirkanSensor}
                  onChange={(e) => setLampirkanSensor(e.target.checked)}
                  className="mt-0.5 size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="sensor" className="text-xs leading-relaxed text-ink">
                  <strong>Lampirkan telemetri meter 24 jam terakhir</strong> ({meterAktif?.nomorSeri}).
                  <span className="block text-[11px] text-muted">
                    Memungkinkan petugas teknis melihat grafik penurunan tekanan/debit langsung tanpa perlu survei awal.
                  </span>
                </label>
              </div>

              {/* 5. MiniMap Titik Lokasi */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink">
                    Titik Lokasi Gangguan
                  </label>
                  <span className="font-mono text-[10px] text-muted">
                    Lat: {titikKoordinat.lat.toFixed(4)}, Lng: {titikKoordinat.lng.toFixed(4)}
                  </span>
                </div>
                <div className="mt-2 flex h-36 items-center justify-center rounded-[3px] border border-line bg-soft text-center p-4">
                  <div>
                    <MapPin size={24} className="mx-auto text-danger animate-bounce" />
                    <p className="mt-1 font-mono text-xs font-bold text-ink">
                      Lokasi Terdeteksi di Sekitar Meter Anda
                    </p>
                    <p className="text-[10px] text-muted">
                      Koordinat tersemat otomatis berdasarkan zona meter air terdaftar.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                varian="utama"
                blok
                memuat={memuatKirim}
              >
                Kirim Pengaduan Layanan
                {!memuatKirim ? <Send size={14} /> : null}
              </Button>
            </form>
          </div>

          {/* Kolom Kanan: Panduan Pelacakan & Transparansi */}
          <div className="space-y-6">
            <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
              <h3 className="font-display text-sm font-bold text-ink">
                Standar Layanan Publik (SLA)
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Setiap laporan yang masuk memiliki batas waktu respon yang mengikat secara transparan:
              </p>

              <ul className="mt-3 space-y-2 text-xs font-mono">
                <li className="flex justify-between border-b border-line pb-1.5">
                  <span className="text-muted">Kebocoran Pipa:</span>
                  <span className="font-bold text-danger">Maks. 6 Jam</span>
                </li>
                <li className="flex justify-between border-b border-line pb-1.5">
                  <span className="text-muted">Air Tidak Mengalir:</span>
                  <span className="font-bold text-warn">Maks. 12 Jam</span>
                </li>
                <li className="flex justify-between border-b border-line pb-1.5">
                  <span className="text-muted">Kualitas Air & Tekanan:</span>
                  <span className="font-bold text-ink">Maks. 24 Jam</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted">Kerusakan Alat Meter:</span>
                  <span className="font-bold text-ink">Maks. 48 Jam</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[4px] border border-brand-500/30 bg-brand-500/5 p-4 text-xs text-ink leading-relaxed">
              <strong className="text-brand-700 dark:text-accent">Transparansi Lacak Pengaduan:</strong>
              <p className="mt-1 text-muted">
                Setelah mengirim laporan, Anda akan menerima nomor tiket unik. Tiket ini dapat diperiksa kapan saja di halaman publik tanpa perlu masuk.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── TAB 2: DAFTAR TIKET SAYA & SLA ── */}
      {tabAktif === "tiket" ? (
        <div className="space-y-4">
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <h2 className="font-display text-base font-bold text-ink">
              Daftar Tiket Pengaduan Saya
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Pantau status penanganan teknisi PDAM dan sisa waktu jatuh tempo SLA.
            </p>

            {memuatTiket ? (
              <div className="py-12 text-center text-xs text-muted">Memuat daftar tiket...</div>
            ) : daftarTiketSaya.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-muted">Belum ada tiket pengaduan yang dibuat.</p>
                <button
                  type="button"
                  onClick={() => setTabAktif("lapor")}
                  className="mt-3 text-xs font-bold text-brand-700 hover:underline dark:text-accent"
                >
                  Buat Pengaduan Pertama &rarr;
                </button>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-line">
                {daftarTiketSaya.map((t) => (
                  <div key={t.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-ink">{t.nomor}</span>
                        {lencanaStatusTiket(t.status, t.slaTerlampaui)}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-ink capitalize">{t.kategori}</p>
                      <p className="mt-0.5 text-xs text-muted line-clamp-1">{t.deskripsi}</p>
                      <span className="mt-1 block font-mono text-[10px] text-muted">
                        Dilaporkan: {tanggalJam(t.dibuatPada)}
                      </span>
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="text-left sm:text-right">
                        <span className="font-mono text-[11px] text-muted">Batas SLA:</span>
                        <p className={`font-mono text-xs font-bold ${t.slaTerlampaui ? "text-danger" : "text-ink"}`}>
                          {tanggalJam(t.slaJatuhTempo)}
                        </p>
                      </div>
                      <Link
                        href={`/lacak?nomor=${t.nomor}`}
                        className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
                      >
                        <span>Lacak Publik</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ── TAB 3: BANTUAN & FAQ ── */}
      {tabAktif === "faq" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <h2 className="font-display text-base font-bold text-ink">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>

            <div className="space-y-3 text-xs leading-relaxed text-muted">
              <div className="rounded-[3px] border border-line bg-soft p-3">
                <strong className="block text-ink">Bagaimana cara mengisi saldo air setelah membeli token?</strong>
                Masukkan 4–10 digit kode token melalui keypad fisik meter air (tekan * lalu kode lalu A) atau ketik langsung di halaman <strong>Isi Token</strong> portal Jernih.
              </div>
              <div className="rounded-[3px] border border-line bg-soft p-3">
                <strong className="block text-ink">Mengapa air tidak mengalir padahal saldo masih ada?</strong>
                Periksa saklar mekanik fisik pada badan meter JM-200. Katup relay hanya akan terbuka bila saklar fisik berada pada posisi ON.
              </div>
              <div className="rounded-[3px] border border-line bg-soft p-3">
                <strong className="block text-ink">Berapa lama laporan kebocoran pipa ditangani?</strong>
                Sesuai Piagam Kepatuhan SLA Jernih, insiden kebocoran pipa distribusi ditargetkan selesai ditangani maksimal dalam 6 jam.
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <h2 className="font-display text-base font-bold text-ink">
              Kontak Darurat PDAM Jernih
            </h2>
            <p className="text-xs text-muted">
              Petugas call center siap membantu penanganan darurat 24 jam.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-3 rounded-[3px] border border-line bg-soft p-3">
                <Phone size={18} className="text-brand-600 dark:text-accent" />
                <div>
                  <span className="block font-semibold text-ink">Hotline Gangguan 24 Jam</span>
                  <span className="font-mono text-xs text-muted">(022) 1500-247</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[3px] border border-line bg-soft p-3">
                <LifeBuoy size={18} className="text-brand-600 dark:text-accent" />
                <div>
                  <span className="block font-semibold text-ink">WhatsApp Aduan Teknis</span>
                  <span className="font-mono text-xs text-muted">+62 811-234-5678</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── MODAL POPUP: NOMOR TIKET BERHASIL DIBUAT ── */}
      {tiketBerhasil ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setTiketBerhasil(null)}
            className="fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
            aria-label="Tutup popup"
          />

          <div className="relative z-10 w-full max-w-md rounded-[6px] border border-line bg-surface p-6 shadow-2xl text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={28} />
            </div>

            <span className="mt-3 inline-block font-mono text-[11px] font-bold text-success uppercase">
              Laporan Berhasil Terkirim
            </span>
            <h3 className="font-display text-xl font-bold text-ink">
              Tiket Pengaduan Diterbitkan
            </h3>

            {/* Kotak Nomor Tiket Besar */}
            <div className="my-5 rounded-[4px] border-2 border-dashed border-brand-500 bg-brand-500/5 p-4">
              <span className="font-mono text-[10px] uppercase text-muted">
                Nomor Tiket Anda
              </span>
              <div className="my-1 font-mono text-2xl font-black tracking-wider text-ink">
                {tiketBerhasil.nomor}
              </div>
              <Button
                type="button"
                varian="sekunder"
                ukuran="sm"
                onClick={handleSalinNomorTiket}
              >
                <Copy size={13} />
                <span>{sudahSalin ? "Nomor Tersalin!" : "Salin Nomor Tiket"}</span>
              </Button>
            </div>

            {/* Pesan Edukasi Kunci: Sambungan ke Lacak Publik */}
            <p className="text-xs leading-relaxed text-muted text-balance">
              Simpan nomor ini. Anda dapat melacak perkembangan penanganan di halaman <strong className="text-ink">Lacak Pengaduan</strong> publik tanpa perlu masuk ke akun.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link href={`/lacak?nomor=${tiketBerhasil.nomor}`}>
                <Button varian="utama" blok>
                  Buka Pelacakan Tiket Publik
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
                Tutup & Lihat Tiket Saya
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Memuat bantuan...</div>}>
      <KontenBantuan />
    </Suspense>
  );
}
