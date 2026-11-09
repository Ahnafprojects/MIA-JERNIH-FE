"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Check, Link2Off, Send, Smartphone } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Pendaftaran saluran kabar: WhatsApp dan Telegram.
 *
 * ── Kenapa persetujuannya berupa centang terpisah ─────────────────────
 *
 * Pengirim WhatsApp-nya nomor bisnis sungguhan milik tim. Kalau ada warga
 * yang merasa tidak pernah meminta lalu melaporkannya sebagai spam, yang
 * hilang bukan satu pesan melainkan seluruh saluran untuk semua warga
 * sekaligus. Jadi menyimpan nomor saja tidak pernah cukup: centangnya harus
 * ditekan sendiri, dan isinya menyebutkan apa yang akan dikirim serta cara
 * berhenti.
 *
 * ── Kenapa keadaannya diambil dari endpoint sendiri ───────────────────
 *
 * Bukan dari `useAuth()`. Keadaan saluran berubah tepat di halaman ini, dan
 * konteks auth dimuat sekali saat masuk; membacanya dari sana membuat layar
 * memperlihatkan keadaan sebelum perubahan yang baru saja dilakukan orangnya
 * sendiri.
 */

interface KeadaanSaluran {
  whatsapp: { nomor: string | null; aktif: boolean };
  telegram: { tertaut: boolean };
  layananSiap: boolean;
}

type Hasil = { tipe: "sukses" | "galat"; teks: string } | null;

/** Tampilan nomor `62...` dikembalikan ke bentuk yang biasa dibaca orang. */
function nomorTerbaca(nomor: string): string {
  const lokal = nomor.startsWith("62") ? `0${nomor.slice(2)}` : nomor;
  return lokal.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function Kabar({ hasil }: { hasil: Hasil }) {
  if (!hasil) return null;
  return (
    <p
      role="alert"
      className={`mt-3 rounded-[10px] border p-2.5 text-xs font-medium ${
        hasil.tipe === "sukses"
          ? "border-success/40 bg-success-soft text-success"
          : "border-danger/40 bg-danger-soft text-danger"
      }`}
    >
      {hasil.teks}
    </p>
  );
}

export function SaluranKabar() {
  const [keadaan, setKeadaan] = useState<KeadaanSaluran | null>(null);
  const [memuat, setMemuat] = useState(true);

  const [nomor, setNomor] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [kirimWa, setKirimWa] = useState(false);
  const [hasilWa, setHasilWa] = useState<Hasil>(null);

  const [kode, setKode] = useState("");
  const [kirimTg, setKirimTg] = useState(false);
  const [hasilTg, setHasilTg] = useState<Hasil>(null);

  const muat = useCallback(async () => {
    try {
      const r = await api<KeadaanSaluran>("/api/me/notifikasi");
      setKeadaan(r);
      setNomor(r.whatsapp.nomor ? nomorTerbaca(r.whatsapp.nomor) : "");
      /*
       * Centang mengikuti keadaan tersimpan, supaya orang yang sudah setuju
       * tidak perlu menyetujui ulang hanya untuk mengganti nomornya.
       */
      setSetuju(r.whatsapp.aktif);
    } catch {
      /* Keadaan yang gagal dimuat ditampilkan sebagai belum terdaftar, dan
         itu aman: yang terburuk terjadi orangnya mendaftar ulang. */
    } finally {
      setMemuat(false);
    }
  }, []);

  /*
   * Pemuatan ditunda satu tick, mengikuti pola yang sudah dipakai halaman
   * induk. `react-hooks/set-state-in-effect` menolak pemanggilan yang
   * berpotensi menyetel state langsung di badan effect, dan penundaan ini
   * memindahkannya keluar dari badan itu. Timernya dibersihkan supaya
   * pemuatan tidak berlanjut pada komponen yang sudah dilepas.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => void muat(), 0);
    return () => window.clearTimeout(timer);
  }, [muat]);

  const simpanWa = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasilWa(null);
    setKirimWa(true);
    try {
      const r = await api<KeadaanSaluran>("/api/me/notifikasi/whatsapp", {
        method: "PUT",
        body: JSON.stringify({ nomor, setuju }),
      });
      setKeadaan(r);
      setHasilWa({
        tipe: "sukses",
        teks: "Nomor WhatsApp tersimpan. Kabar pengaduan dan pembelian akan dikirim ke nomor itu.",
      });
    } catch (err) {
      setHasilWa({
        tipe: "galat",
        teks:
          err instanceof ApiError
            ? err.message
            : "Gagal menyimpan nomor. Coba lagi.",
      });
    } finally {
      setKirimWa(false);
    }
  };

  const matikanWa = async () => {
    if (!confirm("Berhenti menerima kabar lewat WhatsApp? Nomor Anda akan dihapus.")) return;
    setHasilWa(null);
    setKirimWa(true);
    try {
      const r = await api<KeadaanSaluran>("/api/me/notifikasi/whatsapp", {
        method: "DELETE",
      });
      setKeadaan(r);
      setNomor("");
      setSetuju(false);
      setHasilWa({
        tipe: "sukses",
        teks: "WhatsApp dimatikan dan nomor Anda sudah dihapus.",
      });
    } catch {
      setHasilWa({ tipe: "galat", teks: "Gagal mematikan. Coba lagi." });
    } finally {
      setKirimWa(false);
    }
  };

  const tautTg = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasilTg(null);
    setKirimTg(true);
    try {
      const r = await api<KeadaanSaluran>("/api/me/notifikasi/telegram", {
        method: "POST",
        body: JSON.stringify({ kode }),
      });
      setKeadaan(r);
      setKode("");
      setHasilTg({ tipe: "sukses", teks: "Telegram tertaut." });
    } catch (err) {
      setHasilTg({
        tipe: "galat",
        teks:
          err instanceof ApiError ? err.message : "Gagal menautkan. Coba lagi.",
      });
    } finally {
      setKirimTg(false);
    }
  };

  const lepasTg = async () => {
    if (!confirm("Lepas tautan Telegram?")) return;
    setHasilTg(null);
    setKirimTg(true);
    try {
      const r = await api<KeadaanSaluran>("/api/me/notifikasi/telegram", {
        method: "DELETE",
      });
      setKeadaan(r);
      setHasilTg({ tipe: "sukses", teks: "Tautan Telegram dilepas." });
    } catch {
      setHasilTg({ tipe: "galat", teks: "Gagal melepas tautan. Coba lagi." });
    } finally {
      setKirimTg(false);
    }
  };

  if (memuat) {
    return (
      <div className="space-y-3">
        <div className="h-7 w-44 animate-pulse rounded-card bg-soft" />
        <div className="h-32 animate-pulse rounded-card bg-soft" />
      </div>
    );
  }

  const waAktif = keadaan?.whatsapp.aktif ?? false;
  const tgTertaut = keadaan?.telegram.tertaut ?? false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Saluran Kabar</h2>
        <p className="mt-1 text-xs text-muted">
          Pilih ke mana kabar perubahan status pengaduan, pembelian token, dan
          saldo menipis dikirim. Email selalu aktif dan tidak bisa dimatikan.
        </p>
      </div>

      {/*
        Peringatan ini muncul ketika backend melaporkan layanan pengirimnya
        belum terpasang. Tanpa ini warga bisa menyalakan persetujuan lalu
        menunggu kabar yang memang tidak akan pernah datang, tanpa satu pun
        petunjuk kenapa.
      */}
      {keadaan && !keadaan.layananSiap ? (
        <p className="cekung p-3 text-xs text-muted">
          Layanan pengirim pesan belum terpasang di lingkungan ini. Nomor yang
          Anda simpan tetap tercatat dan akan dipakai begitu layanannya
          tersedia.
        </p>
      ) : null}

      {/* ── WhatsApp ─────────────────────────────────────────────────── */}
      <section className="border-t border-line pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            <Smartphone size={15} aria-hidden /> WhatsApp
          </h3>
          {waAktif ? (
            <Badge nada="sukses" titik>
              Aktif
            </Badge>
          ) : (
            <Badge nada="netral">Belum aktif</Badge>
          )}
        </div>

        {/*
          Nomornya TIDAK ditampilkan lagi sebagai baris terpisah di sini.
          Kolom isian di bawah sudah memuat nilai yang sama, dan menampilkan
          keduanya membuat satu nomor terbaca dua kali berturut-turut tanpa
          ada bedanya. Terlihat saat memeriksa tangkapan layar keadaan aktif.
        */}
        <form onSubmit={simpanWa} className="mt-4 max-w-sm space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink">
              Nomor WhatsApp
            </span>
            <input
              type="tel"
              inputMode="tel"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
              placeholder="081234567890"
              autoComplete="tel"
              className="cincin-fokus cekung h-11 w-full px-3 font-mono text-sm text-ink outline-none focus:bg-surface"
            />
            <span className="mt-1 block text-[11px] text-muted">
              Boleh ditulis dengan awalan 0 atau 62. Nomor ini terpisah dari
              nomor HP di profil Anda.
            </span>
          </label>

          {/*
            Persetujuan sebagai centang, dan isinya menyebut tiga hal yang
            harus diketahui sebelum menekannya: apa yang dikirim, dari nomor
            mana, dan cara berhenti.
          */}
          <label className="cekung flex cursor-pointer items-start gap-2.5 p-3">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              className="cincin-fokus mt-0.5 size-4 shrink-0 accent-brand-600"
            />
            <span className="text-[11.5px] leading-relaxed text-muted">
              Saya setuju menerima kabar pengaduan, pembelian token, dan saldo
              menipis lewat WhatsApp dari nomor resmi Jernih. Saya bisa
              berhenti kapan saja lewat tombol di bawah.
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" memuat={kirimWa} disabled={!setuju || !nomor}>
              <Check size={14} aria-hidden />
              {waAktif ? "Perbarui Nomor" : "Aktifkan WhatsApp"}
            </Button>
            {waAktif ? (
              <Button
                type="button"
                varian="bahaya"
                onClick={matikanWa}
                memuat={kirimWa}
              >
                Berhenti
              </Button>
            ) : null}
          </div>

          <Kabar hasil={hasilWa} />
        </form>
      </section>

      {/* ── Telegram ─────────────────────────────────────────────────── */}
      <section className="border-t border-line pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            <Send size={15} aria-hidden /> Telegram
          </h3>
          {tgTertaut ? (
            <Badge nada="sukses" titik>
              Tertaut
            </Badge>
          ) : (
            <Badge nada="netral">Belum tertaut</Badge>
          )}
        </div>

        {tgTertaut ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted">
              Kabar Jernih dikirim ke akun Telegram Anda.
            </p>
            <Button
              type="button"
              varian="sekunder"
              onClick={lepasTg}
              memuat={kirimTg}
            >
              <Link2Off size={14} aria-hidden /> Lepas Tautan
            </Button>
            <Kabar hasil={hasilTg} />
          </div>
        ) : (
          <form onSubmit={tautTg} className="mt-4 max-w-sm space-y-3">
            {/*
              Urutannya dijelaskan sebagai langkah bernomor karena memang
              berurutan, dan langkah pertamanya terjadi di aplikasi lain.
              Tanpa penjelasan ini kolom kode di bawah tidak bisa diisi siapa
              pun: tidak ada tempat lain yang memberi tahu kodenya dari mana.
            */}
            <ol className="cekung space-y-1.5 p-3 text-[11.5px] leading-relaxed text-muted">
              <li>1. Buka bot Jernih di Telegram, lalu kirim /start.</li>
              <li>2. Bot membalas dengan kode enam angka.</li>
              <li>3. Masukkan kode itu di bawah. Kode berlaku 10 menit.</li>
            </ol>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">
                Kode dari bot
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={kode}
                onChange={(e) =>
                  setKode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                className="cincin-fokus cekung tabular h-11 w-full px-3 font-mono text-sm tracking-[0.3em] text-ink outline-none focus:bg-surface"
              />
            </label>

            <Button type="submit" memuat={kirimTg} disabled={kode.length !== 6}>
              Tautkan Telegram
            </Button>

            <Kabar hasil={hasilTg} />
          </form>
        )}
      </section>
    </div>
  );
}
