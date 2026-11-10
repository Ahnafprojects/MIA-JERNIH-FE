"use client";

import React, { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";

interface RiwayatBroadcast {
  id: string;
  judul: string;
  pesan: string;
  target: string;
  kanalPush: boolean;
  kanalEmail: boolean;
  kanalTelegram: boolean;
  penerima: number;
  dibuka: number;
  dibuatPada: string;
}

interface Zona {
  id: string;
  nama: string;
}

/**
 * Label target yang dibaca operator, beserta arti sebenarnya.
 *
 * Artinya ditulis di sini karena dulu label dan perilakunya tidak cocok:
 * "Saldo ≤ 5 L" dikirim ke SELURUH warga, sebab backend hanya menyimpan
 * pilihan itu tanpa menyaringnya. Pilihan "Tunggakan" dihapus: produknya
 * prabayar, jadi tidak ada warga yang bisa menunggak. Penyaringnya kini ada di
 * BE src/lib/sasaran-broadcast.ts, dan kalimat di bawah mengikutinya.
 */
const TARGET: Record<string, { label: string; arti: string }> = {
  SEMUA_WARGA: {
    label: "Semua warga",
    arti: "Seluruh warga yang akunnya aktif. Bila kanal Telegram dipilih, pengumuman juga terbit di channel Jernih.",
  },
  ZONA: { label: "Per zona", arti: "Warga yang terdaftar di zona yang dipilih." },
  SALDO_RENDAH: {
    label: "Saldo di ambang alarm",
    arti: "Warga yang memegang meter dengan saldo di bawah atau sama dengan ambang alarm meternya (bawaan 5 L).",
  },
};

/** Kanal yang dipakai satu siaran, mis. " · lewat aplikasi, Telegram". */
function kanalRiwayat(b: RiwayatBroadcast): string {
  const kanal = [
    b.kanalPush && "aplikasi",
    b.kanalEmail && "email",
    b.kanalTelegram && "Telegram",
  ].filter(Boolean);
  return kanal.length > 0 ? ` · lewat ${kanal.join(", ")}` : "";
}

export default function HalamanBroadcast() {
  const [riwayat, setRiwayat] = useState<RiwayatBroadcast[]>([]);
  const [daftarZona, setDaftarZona] = useState<Zona[]>([]);
  const [telegram, setTelegram] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [berhasil, setBerhasil] = useState<string | null>(null);
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [target, setTarget] = useState("SEMUA_WARGA");
  const [zona, setZona] = useState("");
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const response = await api<{ broadcast: RiwayatBroadcast[]; zona?: Zona[] }>(
      "/api/admin/broadcast",
    );
    setRiwayat(response.broadcast);
    setDaftarZona(response.zona ?? []);
  };

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        load().catch((e: unknown) =>
          setGalat(
            e instanceof ApiError ? e.message : "Riwayat broadcast tidak bisa dimuat.",
          ),
        ),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  const adaKanal = push || email || telegram;
  const zonaKurang = target === "ZONA" && !zona;
  const namaZona = daftarZona.find((z) => z.id === zona)?.nama;

  const kirim = async () => {
    if (!judul.trim() || pesan.trim().length < 5 || !adaKanal || zonaKurang) return;
    const sasaran =
      target === "ZONA" && namaZona
        ? `warga zona ${namaZona}`
        : (TARGET[target]?.label.toLowerCase() ?? target);
    const konfirmasi = confirm(
      `Kirim broadcast kepada ${sasaran}? Pesan tidak dapat ditarik kembali.`,
    );
    if (!konfirmasi) return;
    setLoading(true);
    setGalat(null);
    setBerhasil(null);
    try {
      const hasil = await api<{ penerima: number }>("/api/admin/broadcast", {
        method: "POST",
        body: JSON.stringify({
          judul,
          pesan,
          target,
          zona: target === "ZONA" ? zona : undefined,
          kanal: { push, email, telegram },
        }),
      });
      setJudul("");
      setPesan("");
      setBerhasil(`Terkirim ke ${hasil.penerima.toLocaleString("id-ID")} warga.`);
      await load();
    } catch (e) {
      /*
       * Sebelumnya galat ditelan tanpa jejak: tombol berhenti berputar,
       * pesannya tetap di kotak, dan operator tidak tahu apakah siarannya
       * terkirim. Penolakan seperti "tidak ada warga yang cocok" kini
       * terbaca apa adanya dari server.
       */
      setGalat(
        e instanceof ApiError ? e.message : "Broadcast gagal dikirim. Coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Komunikasi Operasional</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Broadcast
        </h1>
        <p className="mt-1 max-w-[56ch] text-xs text-muted">
          Kirim informasi layanan dengan konfirmasi penerima dan kanal yang
          jelas.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Panel judul="Tulis Pesan">
          <div className="space-y-4">
            <label className="block text-[13px] font-semibold">
              Penerima
              <select
                className="mt-1 h-11 w-full rounded-input border border-line-strong bg-surface px-3 text-sm outline-none hover:border-brand-500/60 focus:border-brand-600 focus:ring-2 focus:ring-brand-600"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                {Object.entries(TARGET).map(([id, t]) => (
                  <option key={id} value={id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] font-normal text-muted">
                {TARGET[target]?.arti}
              </span>
            </label>

            {target === "ZONA" && (
              <label className="block text-[13px] font-semibold">
                Zona
                <select
                  className="mt-1 h-11 w-full rounded-input border border-line-strong bg-surface px-3 text-sm outline-none hover:border-brand-500/60 focus:border-brand-600 focus:ring-2 focus:ring-brand-600"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                >
                  <option value="">Pilih zona…</option>
                  {daftarZona.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nama}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <TextField
              label="Judul pesan"
              maxLength={120}
              placeholder="Judul pesan"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />

            <label className="block text-[13px] font-semibold">
              Isi pesan
              <textarea
                className="mt-1 min-h-32 w-full rounded-input border border-line-strong bg-surface p-3 text-sm outline-none hover:border-brand-500/60 focus:border-brand-600 focus:ring-2 focus:ring-brand-600"
                maxLength={500}
                placeholder="Isi pesan"
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
              />
            </label>
            <p className="text-right font-mono text-[11px] text-muted">
              {pesan.length}/500
            </p>

            <div className="flex gap-5 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="cincin-fokus size-4 accent-brand-600"
                  checked={push}
                  onChange={(e) => setPush(e.target.checked)}
                />{" "}
                Notifikasi aplikasi
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="cincin-fokus size-4 accent-brand-600"
                  checked={email}
                  onChange={(e) => setEmail(e.target.checked)}
                />{" "}
                Email
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="cincin-fokus size-4 accent-brand-600"
                  checked={telegram}
                  onChange={(e) => setTelegram(e.target.checked)}
                />{" "}
                Telegram
              </label>
            </div>
            {/* WhatsApp sengaja tidak tersedia untuk siaran massal: pengirimnya
                menahan laju 2,5 detik per pesan, dan ratusan pesan beruntun
                dari satu nomor bisnis adalah pola tercepat untuk diblokir.
                Lihat komentar kolom `kanalTelegram` di skema backend. */}
            <p className="text-[11px] text-muted">
              Telegram hanya sampai ke warga yang sudah menautkan akunnya.
              WhatsApp tidak dipakai untuk siaran massal.
            </p>

            <div className="cekung p-4">
              <p className="eyebrow text-muted">Pratinjau</p>
              <p className="mt-2 font-bold text-ink">{judul || "Judul broadcast"}</p>
              <p className="mt-1 text-xs text-muted">
                {pesan || "Isi pesan akan tampil di sini."}
              </p>
            </div>

            <Button
              onClick={kirim}
              disabled={
                loading ||
                !judul.trim() ||
                pesan.trim().length < 5 ||
                !adaKanal ||
                zonaKurang
              }
            >
              {loading ? "Mengirim..." : "Kirim Broadcast"}
            </Button>

            {galat ? (
              <p
                role="alert"
                className="rounded-[10px] border border-danger/40 bg-danger-soft p-2.5 text-xs font-medium text-danger"
              >
                {galat}
              </p>
            ) : null}
            {berhasil ? (
              <p
                role="status"
                className="rounded-[10px] border border-success/40 bg-success-soft p-2.5 text-xs font-medium text-success"
              >
                {berhasil}
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel judul="Riwayat Pengiriman">
          <div className="berjenjang divide-y divide-line">
            {riwayat.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">Belum ada broadcast terkirim.</p>
            ) : (
              riwayat.map((item) => (
                <div className="py-3 text-xs" key={item.id}>
                  <div className="flex justify-between gap-2">
                    <b className="text-ink">{item.judul}</b>
                    <Badge>{TARGET[item.target]?.label ?? item.target}</Badge>
                  </div>
                  <p className="mt-1 text-muted">
                    <span className="tabular font-mono">
                      {item.penerima.toLocaleString("id-ID")}
                    </span>{" "}
                    penerima ·{" "}
                    <span className="tabular font-mono">
                      {item.dibuka.toLocaleString("id-ID")}
                    </span>{" "}
                    dibuka
                    {kanalRiwayat(item)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {tanggalJam(item.dibuatPada)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </main>
  );
}
