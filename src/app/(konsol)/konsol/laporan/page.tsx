"use client";

import React, { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TiketKanban {
  id: string;
  nomor: string;
  kategori: string;
  deskripsi: string;
  status: string;
  zona: string | null;
  pelapor: { nama: string };
  teknisi: string | null;
  slaJatuhTempo: string;
  slaTerlampaui: boolean;
}

const KOLOM_STATUS = ["BARU", "DIPROSES", "SELESAI"] as const;

export default function HalamanLaporan() {
  const [tiket, setTiket] = useState<TiketKanban[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);
  const [aksiId, setAksiId] = useState<string | null>(null);

  const muatTiket = useCallback(async () => {
    setMemuat(true);
    setPesanGalat(null);
    try {
      const data = await api<{ tiket: TiketKanban[] }>("/api/admin/tiket");
      setTiket(data.tiket);
    } catch {
      setPesanGalat("Daftar laporan tidak dapat dimuat.");
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      muatTiket();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [muatTiket]);

  const ubahStatus = async (id: string, status: string) => {
    setAksiId(id);
    setPesanGalat(null);
    try {
      await api(`/api/admin/tiket/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await muatTiket();
    } catch {
      setPesanGalat("Status laporan tidak dapat diperbarui.");
    } finally {
      setAksiId(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Laporan Pelanggan</h1>
        <p className="mt-1 text-xs text-muted">
          Perubahan status di sini memengaruhi rapor layanan publik.
        </p>
      </div>

      {pesanGalat ? (
        <p
          role="alert"
          className="border border-danger/40 bg-danger/10 p-3 text-xs text-danger"
        >
          {pesanGalat}
        </p>
      ) : null}

      {memuat ? (
        <p className="text-xs text-muted">Memuat antrean laporan...</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {KOLOM_STATUS.map((status) => (
            <section
              key={status}
              className="min-h-80 border border-line bg-soft p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display font-bold">{status}</h2>
                <span className="font-mono text-xs text-muted">
                  {tiket.filter((item) => item.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {tiket
                  .filter((item) => item.status === status)
                  .map((item) => (
                    <article
                      key={item.id}
                      className={`border bg-surface p-4 ${item.slaTerlampaui ? "border-danger" : "border-line"}`}
                    >
                      <div className="flex justify-between gap-2">
                        <span className="font-mono text-xs font-bold">
                          {item.nomor}
                        </span>
                        <Badge nada={item.slaTerlampaui ? "bahaya" : "netral"}>
                          {item.slaTerlampaui ? "Lewat SLA" : item.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-bold">{item.kategori}</p>
                      <p className="mt-1 text-xs text-muted">
                        {item.pelapor.nama} · {item.zona || "—"}
                      </p>
                      <p className="mt-2 text-[11px] text-muted">
                        SLA: {tanggalJam(item.slaJatuhTempo)}
                      </p>
                      <div className="mt-3 flex gap-1">
                        {status !== "DIPROSES" ? (
                          <Button
                            ukuran="sm"
                            varian="sekunder"
                            disabled={aksiId === item.id}
                            onClick={() => ubahStatus(item.id, "DIPROSES")}
                          >
                            Proses
                          </Button>
                        ) : null}
                        {status !== "SELESAI" ? (
                          <Button
                            ukuran="sm"
                            disabled={aksiId === item.id}
                            onClick={() => ubahStatus(item.id, "SELESAI")}
                          >
                            Selesai
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
