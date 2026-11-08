"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Wallet, AlertTriangle, Info } from "lucide-react";
import { api } from "@/lib/api";
import { tanggalJam } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Notif {
  id: string;
  jenis: string;
  judul: string;
  teks: string;
  tautan: string | null;
  dibaca: boolean;
  dibuatPada: string;
}
const TABS = [
  { id: "SEMUA", label: "Semua" },
  { id: "BELUM", label: "Belum dibaca" },
  { id: "SALDO", label: "Saldo & token" },
  { id: "KEBOCORAN", label: "Kebocoran" },
  { id: "INFO", label: "Info PDAM" },
];
function ikon(jenis: string) {
  if (jenis.includes("SALDO") || jenis.includes("TOKEN"))
    return <Wallet size={17} />;
  if (jenis.includes("KEBOCORAN")) return <AlertTriangle size={17} />;
  return <Info size={17} />;
}
export default function HalamanNotifikasi() {
  const [items, setItems] = useState<Notif[]>([]);
  const [tab, setTab] = useState("SEMUA");
  const [loading, setLoading] = useState(true);
  const [kanal, setKanal] = useState<
    Record<string, { push: boolean; email: boolean }>
  >({
    SALDO: { push: true, email: true },
    TOKEN: { push: true, email: true },
    KEBOCORAN: { push: true, email: true },
    INFO: { push: false, email: true },
  });
  useEffect(() => {
    let ok = true;
    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const r = await api<{ notifikasi: Notif[] }>("/api/notifikasi");
          if (ok) setItems(r.notifikasi || []);
        } finally {
          if (ok) setLoading(false);
        }
      })();
      try {
        const x = localStorage.getItem("jernih_kanal_notifikasi");
        if (x) setKanal(JSON.parse(x));
      } catch {}
    }, 0);
    return () => {
      ok = false;
      window.clearTimeout(timer);
    };
  }, []);
  const filtered = useMemo(
    () =>
      items.filter(
        (x) =>
          tab === "SEMUA" ||
          (tab === "BELUM" && !x.dibaca) ||
          (tab !== "BELUM" && tab !== "SEMUA" && x.jenis.includes(tab)),
      ),
    [items, tab],
  );
  const baca = async (id: string) => {
    await api(`/api/notifikasi/${id}/baca`, { method: "PATCH" });
    setItems((x) => x.map((n) => (n.id === id ? { ...n, dibaca: true } : n)));
  };
  const ubahKanal = (jenis: string, field: "push" | "email") => {
    const next = {
      ...kanal,
      [jenis]: { ...kanal[jenis], [field]: !kanal[jenis]?.[field] },
    };
    setKanal(next);
    localStorage.setItem("jernih_kanal_notifikasi", JSON.stringify(next));
  };
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="border-b border-line pb-4">
        <span className="eyebrow text-brand-700 dark:text-accent">
          Pusat Informasi
        </span>
        <h1 className="font-display text-3xl font-bold text-ink">Notifikasi</h1>
        <p className="mt-1 text-xs text-muted">
          Kabar saldo, perangkat, kebocoran, dan layanan PDAM Anda.
        </p>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-line pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-semibold ${tab === t.id ? "border-b-2 border-brand-500 text-brand-700 dark:text-accent" : "text-muted"}`}
          >
            {t.label}
          </button>
        ))}
        <Button
          varian="halus"
          ukuran="sm"
          className="ml-auto"
          onClick={async () => {
            await Promise.all(
              items
                .filter((x) => !x.dibaca)
                .map((x) =>
                  api(`/api/notifikasi/${x.id}/baca`, { method: "PATCH" }),
                ),
            );
            setItems((x) => x.map((n) => ({ ...n, dibaca: true })));
          }}
        >
          <Check size={14} /> Tandai semua
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="border border-line bg-surface">
          {loading ? (
            <p className="p-8 text-xs text-muted">Memuat notifikasi...</p>
          ) : filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">
              Tidak ada notifikasi pada tab ini.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((n) => (
                <li
                  key={n.id}
                  className={`flex gap-3 p-4 ${!n.dibaca ? "bg-brand-500/5" : ""}`}
                >
                  <span className="grid size-9 shrink-0 place-items-center bg-soft text-brand-600">
                    {ikon(n.jenis)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-bold text-ink">{n.judul}</p>
                      {!n.dibaca && <Badge nada="brand">Baru</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted">{n.teks}</p>
                    <p className="mt-2 font-mono text-[10px] text-muted">
                      {tanggalJam(n.dibuatPada)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {n.tautan && (
                      <Link
                        href={n.tautan}
                        className="text-brand-700 dark:text-accent"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    )}
                    {!n.dibaca && (
                      <button
                        onClick={() => baca(n.id)}
                        className="font-mono text-[10px] text-muted"
                      >
                        Baca
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="border border-line bg-surface p-5">
          <h2 className="font-display font-bold text-ink">
            Kanal Pemberitahuan
          </h2>
          <p className="mt-1 text-xs text-muted">
            Atur push dan email secara terpisah. Tidak ada kanal SMS.
          </p>
          <div className="mt-4 divide-y divide-line">
            {Object.entries(kanal).map(([jenis, v]) => (
              <div key={jenis} className="py-3">
                <p className="text-xs font-bold text-ink capitalize">
                  {jenis.toLowerCase()}
                </p>
                <div className="mt-2 flex gap-4 text-xs">
                  <label>
                    <input
                      type="checkbox"
                      checked={v.push}
                      onChange={() => ubahKanal(jenis, "push")}
                    />{" "}
                    Push
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={v.email}
                      onChange={() => ubahKanal(jenis, "email")}
                    />{" "}
                    Email
                  </label>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
