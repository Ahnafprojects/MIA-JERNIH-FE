"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
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

/*
 * Pilihan penerima, disalin dari `TARGET_BROADCAST` di backend.
 *
 * "Tunggakan" sengaja TIDAK ada di sini. Produk ini prabayar: air hanya
 * mengalir selama saldo masih ada, jadi tidak ada pemakaian yang bisa
 * menunggak. Backend menolaknya dengan 400, dan membiarkannya tetap
 * terpilih di layar hanya memindahkan kebingungan ke operator.
 */
const TARGET = [
  { nilai: "SEMUA_WARGA", label: "Semua warga" },
  { nilai: "SALDO_RENDAH", label: "Saldo di bawah ambang alarm meter" },
  { nilai: "ZONA", label: "Per zona" },
] as const;

export default function HalamanBroadcast() {
  const [riwayat, setRiwayat] = useState<RiwayatBroadcast[]>([]);
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [target, setTarget] = useState("SEMUA_WARGA");
  const [zona, setZona] = useState("");
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [telegram, setTelegram] = useState(false);
  const [zonaTersedia, setZonaTersedia] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const load = async () => {
    const response = await api<{ broadcast: RiwayatBroadcast[]; zona?: Zona[] }>(
      "/api/admin/broadcast",
    );
    setRiwayat(response.broadcast);
    setZonaTersedia(response.zona ?? []);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => load().catch(() => {}), 0);
    return () => window.clearTimeout(timer);
  }, []);

  /*
   * Zona WAJIB untuk target "Per zona". Backend menolaknya dengan 400, jadi
   * dicegat di sini supaya operator melihat kalimat yang bisa ditindak,
   * bukan pesan galat mentah setelah menekan kirim.
   */
  const siap =
    judul.trim() !== "" &&
    pesan.trim().length >= 5 &&
    (push || email || telegram) &&
    (target !== "ZONA" || zona !== "");

  const kirim = async () => {
    if (!siap) return;
    const konfirmasi = confirm(
      `Kirim broadcast kepada ${target === "SEMUA_WARGA" ? "semua warga" : target.toLowerCase()}? Pesan tidak dapat ditarik kembali.`,
    );
    if (!konfirmasi) return;
    setLoading(true);
    try {
      await api("/api/admin/broadcast", {
        method: "POST",
        body: JSON.stringify({
          judul,
          pesan,
          target,
          zona: zona || undefined,
          kanal: { push, email, telegram },
        }),
      });
      setJudul("");
      setPesan("");
      setGalat(null);
      await load();
    } catch (e) {
      /*
       * Galat ditampilkan, bukan ditelan. Broadcast yang gagal diam-diam
       * membuat operator mengira pengumumannya sudah sampai, dan itu
       * kesalahan yang baru ketahuan setelah warga tidak ada yang tahu.
       */
      setGalat(
        e instanceof Error ? e.message : "Broadcast gagal dikirim.",
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
                {TARGET.map((t) => (
                  <option key={t.nilai} value={t.nilai}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            {target === "ZONA" && (
              /*
                Daftar, bukan isian bebas. Id zona berbentuk cuid seperti
                `cmvuq9ajy0008`, dan mengetiknya dengan tangan praktis
                selalu salah. Backend mengirim daftarnya bersama riwayat.
              */
              <label className="block text-[13px] font-semibold">
                Zona penerima
                <select
                  className="mt-1 h-11 w-full rounded-input border border-line-strong bg-surface px-3 text-sm outline-none hover:border-brand-500/60 focus:border-brand-600 focus:ring-2 focus:ring-brand-600"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                >
                  <option value="">Pilih zona…</option>
                  {zonaTersedia.map((z) => (
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

            {/* Channel hanya menerima pengumuman untuk SELURUH warga.
                Isinya terbuka bagi siapa pun yang mengikuti channel, jadi
                pesan untuk satu zona atau untuk warga bersaldo rendah tidak
                diterbitkan di sana. Aturan ini ditegakkan backend; kalimat
                ini hanya memberitahukannya lebih awal. */}
            {telegram ? (
              <p className="text-[12px] leading-relaxed text-muted">
                {target === "SEMUA_WARGA" && !zona
                  ? "Dikirim ke Telegram tiap warga yang sudah menautkan akunnya, dan sekali ke channel pengumuman."
                  : "Dikirim ke Telegram tiap warga yang sudah menautkan akunnya. Tidak diterbitkan di channel, sebab pengumuman ini tidak ditujukan ke seluruh warga."}
              </p>
            ) : null}

            <div className="cekung p-4">
              <p className="eyebrow text-muted">Pratinjau</p>
              <p className="mt-2 font-bold text-ink">{judul || "Judul broadcast"}</p>
              <p className="mt-1 text-xs text-muted">
                {pesan || "Isi pesan akan tampil di sini."}
              </p>
            </div>

            {galat ? (
              <p className="text-[13px] font-semibold text-danger">{galat}</p>
            ) : null}

            {target === "ZONA" && zona === "" ? (
              <p className="text-[12px] text-muted">
                Pilih zona penerima dulu.
              </p>
            ) : null}
            {!push && !email && !telegram ? (
              <p className="text-[12px] text-muted">
                Pilih sedikitnya satu kanal pengiriman.
              </p>
            ) : null}

            <Button onClick={kirim} disabled={loading || !siap}>
              {loading ? "Mengirim..." : "Kirim Broadcast"}
            </Button>
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
                    <Badge>{item.target}</Badge>
                  </div>
                  <p className="mt-1 text-muted">
                    {item.penerima} penerima · {item.dibuka} dibuka
                  </p>
                  <p className="mt-1 text-muted">
                    {[
                      item.kanalPush ? "Aplikasi" : null,
                      item.kanalEmail ? "Email" : null,
                      item.kanalTelegram ? "Telegram" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Tanpa kanal"}
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
