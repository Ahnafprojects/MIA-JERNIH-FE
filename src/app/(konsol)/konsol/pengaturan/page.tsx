"use client";

import React, { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/card";
import { TextField } from "@/components/ui/field";
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
  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [sandiUlang, setSandiUlang] = useState("");
  const [kirimSandi, setKirimSandi] = useState(false);
  const [hasilSandi, setHasilSandi] = useState<{
    tipe: "sukses" | "galat";
    teks: string;
  } | null>(null);
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
  /*
   * Ganti kata sandi sendiri lewat `PUT /api/me/kata-sandi`.
   * Kecocokan "ulangi sandi" diperiksa di klien dan tidak dikirim ke server;
   * galat server (SANDI_LAMA_SALAH / SANDI_SAMA) ditampilkan apa adanya.
   */
  const gantiSandi = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasilSandi(null);
    if (sandiBaru !== sandiUlang) {
      setHasilSandi({ tipe: "galat", teks: "Ulangan kata sandi baru tidak sama." });
      return;
    }
    setKirimSandi(true);
    try {
      await api("/api/me/kata-sandi", {
        method: "PUT",
        body: JSON.stringify({ kataSandiLama: sandiLama, kataSandiBaru: sandiBaru }),
      });
      setHasilSandi({
        tipe: "sukses",
        teks: "Kata sandi berhasil diubah. Sesi lain sudah dikeluarkan.",
      });
      setSandiLama("");
      setSandiBaru("");
      setSandiUlang("");
    } catch (err) {
      setHasilSandi({
        tipe: "galat",
        teks: err instanceof ApiError ? err.message : "Gagal mengubah kata sandi. Coba lagi.",
      });
    } finally {
      setKirimSandi(false);
    }
  };
  const tabs = [
    ...(supervisor
      ? [
          { id: "tim", label: "Tim & akses" },
          { id: "tarif", label: "Tarif & golongan" },
        ]
      : []),
    { id: "sandi", label: "Kata sandi" },
    { id: "keamanan", label: "Keamanan" },
    { id: "notifikasi", label: "Notifikasi operator" },
  ];
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-4">
        <p className="eyebrow text-brand-600">Preferensi konsol</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Pengaturan
        </h1>
      </header>

      <div className="flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-xs font-semibold transition-colors",
              tab === t.id
                ? "border-brand-600 text-brand-700 dark:text-accent"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tim" && (
        <Panel isiClassName="p-0">
          <div className="divide-y divide-line">
            {members.map((m) => (
              <div className="flex items-center justify-between p-4 text-sm" key={m.id}>
                <span className="text-ink">
                  {m.nama}
                  <small className="ml-2 font-mono text-muted">{m.email}</small>
                </span>
                <Badge>{m.peran}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "tarif" && (
        <Panel>
          <div className="space-y-1">
            {golongan.map((g) => (
              <div
                className="flex items-center justify-between border-b border-line py-3 text-sm last:border-0"
                key={g.id}
              >
                <span className="text-ink">{g.nama}</span>
                <span className="tabular font-mono text-ink">
                  {rupiah(g.tarifPerLiter, 1)}/L
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {tab === "sandi" && (
        <Panel judul="Ganti Kata Sandi" sub="Sesi lain akan dikeluarkan setelah berhasil">
          <form onSubmit={gantiSandi} className="max-w-md space-y-4">
            <TextField
              label="Kata sandi lama"
              type="password"
              autoComplete="current-password"
              value={sandiLama}
              onChange={(e) => setSandiLama(e.target.value)}
            />
            <TextField
              label="Kata sandi baru"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              value={sandiBaru}
              onChange={(e) => setSandiBaru(e.target.value)}
            />
            <TextField
              label="Ulangi kata sandi baru"
              type="password"
              autoComplete="new-password"
              value={sandiUlang}
              onChange={(e) => setSandiUlang(e.target.value)}
            />
            {hasilSandi ? (
              <p
                role="status"
                className={cn(
                  "rounded-[3px] border p-3 text-xs font-medium",
                  hasilSandi.tipe === "sukses"
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-danger/40 bg-danger/10 text-danger",
                )}
              >
                {hasilSandi.teks}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={kirimSandi || !sandiLama || sandiBaru.length < 8}
            >
              {kirimSandi ? "Menyimpan..." : "Simpan kata sandi"}
            </Button>
          </form>
        </Panel>
      )}

      {tab === "keamanan" && (
        <Panel>
          <div className="space-y-4">
            {Object.entries(security).map(([k, v]) => (
              <div className="flex items-center justify-between gap-4 text-sm" key={k}>
                <span className="text-muted">{k}</span>
                <TextField
                  label=""
                  className="w-40 [&_input]:font-mono"
                  value={String(v)}
                  onChange={(e) => setSecurity({ ...security, [k]: e.target.value })}
                />
              </div>
            ))}
            {supervisor && (
              <Button onClick={() => save("/api/admin/pengaturan/keamanan", security)}>
                Simpan
              </Button>
            )}
          </div>
        </Panel>
      )}

      {tab === "notifikasi" && (
        <Panel>
          <div className="space-y-4">
            {Object.entries(notif).map(([k, v]) => (
              <div className="flex items-center justify-between gap-4 text-sm" key={k}>
                <span className="text-muted">{k}</span>
                <TextField
                  label=""
                  className="w-40 [&_input]:font-mono"
                  value={String(v)}
                  onChange={(e) => setNotif({ ...notif, [k]: e.target.value })}
                />
              </div>
            ))}
            {supervisor && (
              <Button onClick={() => save("/api/admin/pengaturan/notifikasi", notif)}>
                Simpan
              </Button>
            )}
          </div>
        </Panel>
      )}
    </main>
  );
}
