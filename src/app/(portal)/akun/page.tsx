"use client";

import React, { useEffect, useState } from "react";
import { Unlink, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { liter } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TombolTema } from "@/components/ui/tema";
import { Badge } from "@/components/ui/badge";

interface Sesi {
  id: string;
  perangkat: string;
  ip: string;
  terakhirPada: string;
  dibuatPada: string;
}
const BAGIAN = [
  "Profil",
  "Keamanan",
  "Peringatan",
  "Meter tertaut",
  "Tampilan",
];

/**
 * Satu kolom kata sandi.
 *
 * Dibuat `.cekung` seperti kolom isian lain di portal: di sistem ini bentuk
 * membawa arti — yang menonjol adalah benda, yang masuk ke dalam adalah
 * tempat menaruh sesuatu.
 *
 * `autoComplete` DIISI, bukan dikosongkan. Pengelola kata sandi memakainya
 * untuk membedakan sandi lama dari sandi baru; tanpa itu ia mengisi ketiga
 * kolom dengan nilai yang sama, dan formulirnya ditolak server tanpa
 * pengguna tahu sebabnya.
 */
function KolomSandi({
  label,
  nilai,
  onUbah,
  autoComplete,
  petunjuk,
}: {
  label: string;
  nilai: string;
  onUbah: (v: string) => void;
  autoComplete: "current-password" | "new-password";
  petunjuk?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink">
        {label}
      </span>
      <input
        type="password"
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
        autoComplete={autoComplete}
        className="cekung h-11 w-full px-3 text-sm text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-brand-500/30"
      />
      {petunjuk && <span className="mt-1 block text-[11px] text-muted">{petunjuk}</span>}
    </label>
  );
}
export default function HalamanAkun() {
  const { pengguna, meter } = useAuth();
  const [bagian, setBagian] = useState("Profil");
  const [sesi, setSesi] = useState<Sesi[]>([]);
  const [ambang, setAmbang] = useState(100);
  const [pesan, setPesan] = useState<string | null>(null);

  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [sandiUlang, setSandiUlang] = useState("");
  const [kirimSedang, setKirimSedang] = useState(false);
  const [hasilSandi, setHasilSandi] = useState<{
    tipe: "sukses" | "galat";
    teks: string;
  } | null>(null);
  useEffect(() => {
    let ok = true;
    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const r = await api<{ sesi: Sesi[] }>("/api/me/sesi");
          if (ok) setSesi(r.sesi || []);
        } catch {}
      })();
      if (pengguna?.ambangPeringatanL) setAmbang(pengguna.ambangPeringatanL);
    }, 0);
    return () => {
      ok = false;
      window.clearTimeout(timer);
    };
  }, [pengguna]);
  const currentUA = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const lepas = async (id: string) => {
    if (!confirm("Keluarkan sesi ini dari akun Anda?")) return;
    await api(`/api/me/sesi/${id}`, { method: "DELETE" });
    setSesi((x) => x.filter((s) => s.id !== id));
  };
  /**
   * Mengirim penggantian kata sandi.
   *
   * Kecocokan "ulangi kata sandi" diperiksa DI SINI dan tidak pernah dikirim
   * ke server — server tidak punya urusan dengan kolom ketiga itu. Gunanya
   * cuma satu: menangkap salah ketik sebelum sandi yang tidak pernah diniatkan
   * tersimpan, dan setelah tersimpan tidak ada cara memulihkannya selain
   * lewat email.
   *
   * Galat dari server ditampilkan apa adanya. Pesannya sudah Bahasa Indonesia
   * dan jauh lebih berguna daripada kalimat umum — "Kata sandi lama salah"
   * memberi tahu kolom mana yang harus diperbaiki.
   */
  const kirimSandi = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasilSandi(null);

    if (sandiBaru !== sandiUlang) {
      setHasilSandi({
        tipe: "galat",
        teks: "Ulangan kata sandi baru tidak sama.",
      });
      return;
    }

    setKirimSedang(true);
    try {
      await api("/api/me/kata-sandi", {
        method: "PUT",
        body: JSON.stringify({
          kataSandiLama: sandiLama,
          kataSandiBaru: sandiBaru,
        }),
      });
      setHasilSandi({
        tipe: "sukses",
        teks: "Kata sandi berhasil diubah. Sesi lain sudah dikeluarkan.",
      });
      setSandiLama("");
      setSandiBaru("");
      setSandiUlang("");

      /* Daftar sesi di bawah formulir ini baru saja berubah isinya. Tanpa
         dimuat ulang, layar masih memperlihatkan perangkat yang sudah
         dicabut — persis kebalikan dari yang baru saja diberitahukan. */
      try {
        const r = await api<{ sesi: Sesi[] }>("/api/me/sesi");
        setSesi(r.sesi || []);
      } catch {
        // Daftar basi tidak sepenting pesan berhasil di atas.
      }
    } catch (err) {
      setHasilSandi({
        tipe: "galat",
        teks:
          err instanceof ApiError
            ? err.message
            : "Gagal mengubah kata sandi. Coba lagi.",
      });
    } finally {
      setKirimSedang(false);
    }
  };

  const simpanAmbang = async () => {
    setPesan(
      "Ambang tersimpan di perangkat ini. Endpoint server untuk menyimpan preferensi akun belum tersedia.",
    );
    localStorage.setItem("jernih_ambang", String(ambang));
  };
  return (
    <main className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-line pb-4">
        <span className="eyebrow text-brand-700 dark:text-accent">
          Pengaturan Pribadi
        </span>
        <h1 className="font-display text-3xl font-bold text-ink">
          Akun & Keamanan
        </h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[13rem_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {BAGIAN.map((x) => (
            <button
              key={x}
              onClick={() => setBagian(x)}
              className={`whitespace-nowrap px-3 py-2 text-left text-xs font-semibold ${bagian === x ? "border-l-2 border-brand-500 bg-brand-500/5 text-brand-700 dark:text-accent" : "text-muted hover:bg-soft"}`}
            >
              {x}
            </button>
          ))}
        </nav>
        <section className="border border-line bg-surface p-6">
          {bagian === "Profil" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Profil</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="eyebrow text-muted">Nama</span>
                  <p className="mt-1 text-sm font-semibold">
                    {pengguna?.nama || "—"}
                  </p>
                </div>
                <div>
                  <span className="eyebrow text-muted">Email</span>
                  <p className="mt-1 text-sm font-semibold">
                    {pengguna?.email || "—"}{" "}
                    <Badge nada="sukses">Terverifikasi</Badge>
                  </p>
                </div>
                <div>
                  <span className="eyebrow text-muted">Nomor HP</span>
                  <p className="mt-1 text-sm font-mono">
                    {pengguna?.hp || "—"}
                  </p>
                  <p className="text-xs text-muted">Untuk dihubungi petugas.</p>
                </div>
              </div>
            </div>
          )}
          {bagian === "Keamanan" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold">Keamanan</h2>
                <p className="mt-1 text-xs text-muted">
                  Mengganti kata sandi akan mengeluarkan sesi lain dari akun
                  Anda. Perangkat ini tetap masuk.
                </p>

                <form onSubmit={kirimSandi} className="mt-4 max-w-sm space-y-3">
                  <KolomSandi
                    label="Kata sandi lama"
                    nilai={sandiLama}
                    onUbah={setSandiLama}
                    autoComplete="current-password"
                  />
                  <KolomSandi
                    label="Kata sandi baru"
                    nilai={sandiBaru}
                    onUbah={setSandiBaru}
                    autoComplete="new-password"
                    petunjuk="Minimal 8 karakter."
                  />
                  <KolomSandi
                    label="Ulangi kata sandi baru"
                    nilai={sandiUlang}
                    onUbah={setSandiUlang}
                    autoComplete="new-password"
                  />

                  {hasilSandi && (
                    <p
                      role="alert"
                      className={`rounded-[10px] border p-2.5 text-xs font-medium ${
                        hasilSandi.tipe === "sukses"
                          ? "border-success/40 bg-success-soft text-success"
                          : "border-danger/40 bg-danger-soft text-danger"
                      }`}
                    >
                      {hasilSandi.teks}
                    </p>
                  )}

                  <Button type="submit" memuat={kirimSedang}>
                    Ubah Kata Sandi
                  </Button>
                </form>
              </div>
              <div className="border-t border-line pt-5">
                <h3 className="font-bold text-ink">Sesi Aktif</h3>
                <ul className="mt-3 divide-y divide-line">
                  {sesi.map((s) => {
                    const ini = s.perangkat === currentUA;
                    return (
                      <li
                        key={s.id}
                        className="flex justify-between gap-3 py-3 text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold">
                            {s.perangkat.slice(0, 70)}{" "}
                            {ini && <Badge nada="brand">Perangkat ini</Badge>}
                          </p>
                          <p className="text-muted">{s.ip}</p>
                        </div>
                        {!ini && (
                          <Button
                            varian="bahaya"
                            ukuran="sm"
                            onClick={() => lepas(s.id)}
                          >
                            <LogOut size={13} /> Keluarkan
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          {bagian === "Peringatan" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">
                Peringatan Saldo
              </h2>
              <p className="text-xs text-muted">
                Peringatan aplikasi ini terpisah dari alarm meter: 5 L, 2 L, dan
                0 L yang diatur firmware dan tidak bisa diubah dari sini.
              </p>
              <select
                value={ambang}
                onChange={(e) => setAmbang(Number(e.target.value))}
                className="h-11 permukaan-rata border-line bg-canvas px-3 text-sm"
              >
                {[50, 100, 250, 500].map((x) => (
                  <option key={x} value={x}>
                    {liter(x, 0)}
                  </option>
                ))}
              </select>
              <br />
              <Button onClick={simpanAmbang}>Simpan Ambang</Button>
              {pesan && <p className="text-xs text-muted">{pesan}</p>}
            </div>
          )}
          {bagian === "Meter tertaut" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Meter Tertaut</h2>
              {meter.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between border-b border-line py-3 text-sm"
                >
                  <span className="font-mono">
                    {m.nomorSeri} · {liter(m.saldoLiter, 0)}
                  </span>
                  <Button
                    varian="bahaya"
                    ukuran="sm"
                    disabled
                    title="Konfirmasi lepas meter akan tersedia setelah endpoint terhubung"
                  >
                    <Unlink size={13} /> Lepas
                  </Button>
                </div>
              ))}
            </div>
          )}
          {bagian === "Tampilan" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Tampilan</h2>
              <p className="text-xs text-muted">
                Tema tersimpan antar kunjungan.
              </p>
              <TombolTema />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
