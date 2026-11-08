"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <div>
        <span className="eyebrow text-brand-700 dark:text-accent">
          Komunikasi Operasional
        </span>
        <h1 className="font-display text-3xl font-bold">Broadcast</h1>
        <p className="mt-1 text-xs text-muted">
          Kirim informasi layanan dengan konfirmasi penerima dan kanal yang
          jelas.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-4 border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-bold">Tulis Pesan</h2>
          <select
            className="h-10 w-full border border-line bg-canvas px-3 text-sm"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            <option value="SEMUA_WARGA">Semua warga</option>
            <option value="SALDO_RENDAH">Saldo ≤ 5 L</option>
            <option value="TUNGGAKAN">Tunggakan</option>
            <option value="ZONA">Per zona</option>
          </select>
          {target === "ZONA" && (
            <input
              className="h-10 w-full border border-line bg-canvas px-3 text-sm"
              placeholder="ID zona"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
            />
          )}
          <input
            className="h-10 w-full border border-line bg-canvas px-3 text-sm"
            maxLength={120}
            placeholder="Judul pesan"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
          />
          <textarea
            className="min-h-32 w-full border border-line bg-canvas p-3 text-sm"
            maxLength={500}
            placeholder="Isi pesan"
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
          />
          <p className="text-right font-mono text-[11px] text-muted">
            {pesan.length}/500
          </p>
          <div className="flex gap-5 text-sm">
            <label>
              <input
                type="checkbox"
                checked={push}
                onChange={(e) => setPush(e.target.checked)}
              />{" "}
              Notifikasi aplikasi
            </label>
            <label>
              <input
                type="checkbox"
                checked={email}
                onChange={(e) => setEmail(e.target.checked)}
              />{" "}
              Email
            </label>
          </div>
          <div className="border border-line bg-soft p-4">
            <p className="eyebrow text-muted">Pratinjau</p>
            <p className="mt-2 font-bold">{judul || "Judul broadcast"}</p>
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
        </section>
        <section className="border border-line bg-surface p-5">
          <h2 className="font-display text-xl font-bold">Riwayat Pengiriman</h2>
          <div className="mt-4 divide-y divide-line">
            {riwayat.map((item) => (
              <div className="py-3 text-xs" key={item.id}>
                <div className="flex justify-between gap-2">
                  <b>{item.judul}</b>
                  <Badge>{item.target}</Badge>
                </div>
                <p className="mt-1 text-muted">
                  {item.penerima} penerima · {item.dibuka} dibuka
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted">
                  {tanggalJam(item.dibuatPada)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
