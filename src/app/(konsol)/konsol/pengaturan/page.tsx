"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
interface Member {
  id: string;
  nama: string;
  email: string;
  peran: string;
  emailVerified: boolean;
}
interface Gol {
  id: string;
  nama: string;
  tarifPerLiter: number;
}
export default function HalamanPengaturan() {
  const [tab, setTab] = useState("tim");
  const [members, setMembers] = useState<Member[]>([]);
  const [golongan, setGolongan] = useState<Gol[]>([]);
  const [security, setSecurity] = useState<Record<string, unknown>>({});
  const [notif, setNotif] = useState<Record<string, unknown>>({});
  const { pengguna } = useAuth();
  const supervisor = pengguna?.peran === "SUPERVISOR";
  useEffect(() => {
    const load = async () => {
      try {
        const [m, t, s, n] = await Promise.all([
          api<{ members: Member[] }>("/api/admin/pengaturan/tim"),
          api<{ golongan: Gol[] }>("/api/admin/pengaturan/tarif"),
          api<Record<string, unknown>>("/api/admin/pengaturan/keamanan"),
          api<Record<string, unknown>>("/api/admin/pengaturan/notifikasi"),
        ]);
        setMembers(m.members);
        setGolongan(t.golongan);
        setSecurity(s);
        setNotif(n);
      } catch {}
    };
    load();
  }, []);
  const save = async (path: string, value: Record<string, unknown>) => {
    await api(path, { method: "PATCH", body: JSON.stringify(value) });
    alert("Pengaturan tersimpan");
  };
  const tabs = [
    ...(supervisor
      ? [
          { id: "tim", label: "Tim & akses" },
          { id: "tarif", label: "Tarif & golongan" },
        ]
      : []),
    { id: "keamanan", label: "Keamanan" },
    { id: "notifikasi", label: "Notifikasi operator" },
  ];
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Pengaturan</h1>
      <div className="flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-semibold ${tab === t.id ? "border-b-2 border-brand-500 text-brand-700 dark:text-accent" : "text-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "tim" && (
        <section className="divide-y divide-line border border-line bg-surface">
          {members.map((m) => (
            <div className="flex justify-between p-4 text-sm" key={m.id}>
              <span>
                {m.nama}
                <small className="ml-2 text-muted">{m.email}</small>
              </span>
              <Badge>{m.peran}</Badge>
            </div>
          ))}
        </section>
      )}
      {tab === "tarif" && (
        <section className="space-y-3 border border-line bg-surface p-5">
          {golongan.map((g) => (
            <div
              className="flex items-center justify-between border-b border-line py-3 text-sm"
              key={g.id}
            >
              <span>{g.nama}</span>
              <span className="font-mono">{rupiah(g.tarifPerLiter, 1)}/L</span>
            </div>
          ))}
        </section>
      )}
      {tab === "keamanan" && (
        <section className="space-y-4 border border-line bg-surface p-5">
          {Object.entries(security).map(([k, v]) => (
            <label className="flex justify-between text-sm" key={k}>
              {k}
              <input
                className="w-32 border border-line bg-canvas px-2 font-mono"
                value={String(v)}
                onChange={(e) =>
                  setSecurity({ ...security, [k]: e.target.value })
                }
              />
            </label>
          ))}
          {supervisor && (
            <Button
              onClick={() => save("/api/admin/pengaturan/keamanan", security)}
            >
              Simpan
            </Button>
          )}
        </section>
      )}
      {tab === "notifikasi" && (
        <section className="space-y-4 border border-line bg-surface p-5">
          {Object.entries(notif).map(([k, v]) => (
            <label className="flex justify-between text-sm" key={k}>
              {k}
              <input
                className="border border-line bg-canvas px-2"
                value={String(v)}
                onChange={(e) => setNotif({ ...notif, [k]: e.target.value })}
              />
            </label>
          ))}
          {supervisor && (
            <Button
              onClick={() => save("/api/admin/pengaturan/notifikasi", notif)}
            >
              Simpan
            </Button>
          )}
        </section>
      )}
    </main>
  );
}
