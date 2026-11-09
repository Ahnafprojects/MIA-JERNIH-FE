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
  penerima: number;
  dibuka: number;
  dibuatPada: string;
}

export default function HalamanBroadcast() {
  const [riwayat, setRiwayat] = useState<RiwayatBroadcast[]>([]);
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [target, setTarget] = useState("SEMUA_WARGA");
  const [zona, setZona] = useState("");
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const response = await api<{ broadcast: RiwayatBroadcast[] }>(
      "/api/admin/broadcast",
    );
    setRiwayat(response.broadcast);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => load().catch(() => {}), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const kirim = async () => {
    if (!judul.trim() || pesan.trim().length < 5 || (!push && !email)) return;
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
          kanal: { push, email },
        }),
      });
      setJudul("");
      setPesan("");
      await load();
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
                <option value="SEMUA_WARGA">Semua warga</option>
                <option value="SALDO_RENDAH">Saldo ≤ 5 L</option>
                <option value="TUNGGAKAN">Tunggakan</option>
                <option value="ZONA">Per zona</option>
              </select>
            </label>

            {target === "ZONA" && (
              <TextField
                label="ID zona"
                placeholder="ID zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
              />
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
                  className="size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
                  checked={push}
                  onChange={(e) => setPush(e.target.checked)}
                />{" "}
                Notifikasi aplikasi
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 rounded-[2px] border-line text-brand-600 focus:ring-brand-500"
                  checked={email}
                  onChange={(e) => setEmail(e.target.checked)}
                />{" "}
                Email
              </label>
            </div>

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
                (!push && !email)
              }
            >
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
