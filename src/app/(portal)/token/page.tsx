"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { liter, tanggal } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TokenField } from "@/components/domain/token-field";
import { LcdDisplay } from "@/components/domain/lcd";
import { MeterDevice } from "@/components/domain/meter-device";

interface TokenBelumDipakai {
  id: string;
  kodeBertopeng: string;
  nilaiL: number;
  meterId?: string | null;
  kedaluwarsaPada: string;
  dibuatPada: string;
}

export default function HalamanToken() {
  const { meter, meterAktif, pilihMeter, muatUlangData } = useAuth();

  const [kodeToken, setKodeToken] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [daftarToken, setDaftarToken] = useState<TokenBelumDipakai[]>([]);
  const [memuatTokenList, setMemuatTokenList] = useState(false);

  // Status hasil penukaran
  const [hasilSukses, setHasilSukses] = useState<{
    nilaiL: number;
    saldoBaruL: number;
    lcd?: { baris1: string; baris2: string };
  } | null>(null);

  const [hasilGalat, setHasilGalat] = useState<{
    pesan: string;
    lcdBaris1: string;
    lcdBaris2: string;
  } | null>(null);

  // Batas 5x salah -> cooldown 10 menit
  const [salahCount, setSalahCount] = useState(0);
  const [terkunciSampai, setTerkunciSampai] = useState<number | null>(null);
  const [sisaWaktuKunci, setSisaWaktuKunci] = useState(0);

  // Ambil daftar token belum dipakai
  const ambilTokenBelumDipakai = useCallback(async () => {
    setMemuatTokenList(true);
    try {
      const res = await api<{ tokens: TokenBelumDipakai[] }>("/api/token/belum-dipakai");
      setDaftarToken(res.tokens || []);
    } catch {
      // Abaikan jika belum ada
    } finally {
      setMemuatTokenList(false);
    }
  }, []);

  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const res = await api<{ tokens: TokenBelumDipakai[] }>("/api/token/belum-dipakai");
        if (aktif) setDaftarToken(res.tokens || []);
      } catch {
        // Abaikan
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  // Timer hitung mundur jika terkunci
  useEffect(() => {
    if (!terkunciSampai) return;

    const interval = setInterval(() => {
      const sisa = Math.max(0, Math.ceil((terkunciSampai - Date.now()) / 1000));
      setSisaWaktuKunci(sisa);
      if (sisa <= 0) {
        setTerkunciSampai(null);
        setSalahCount(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [terkunciSampai]);

  // Simulasi keypad fisik: * (mode isi) -> digit -> A (enter)
  const handleTekanKeypad = (tombol: string) => {
    if (terkunciSampai) return;

    if (tombol >= "0" && tombol <= "9") {
      if (kodeToken.length < 10) {
        setKodeToken((prev) => prev + tombol);
      }
    } else if (tombol === "D") {
      setKodeToken((prev) => prev.slice(0, -1));
    } else if (tombol === "*") {
      setKodeToken("");
    } else if (tombol === "A") {
      if (kodeToken.length >= 4) {
        handleTukarToken();
      }
    }
  };

  const handleTukarToken = async (kodeOverride?: string) => {
    const kodeTarget = (kodeOverride ?? kodeToken).trim();
    if (!meterAktif || kodeTarget.length < 4 || terkunciSampai) return;

    setMemuat(true);
    setHasilSukses(null);
    setHasilGalat(null);

    try {
      const res = await api<{
        status: string;
        nilaiL: number;
        saldoBaruL: number;
        lcd?: { baris1: string; baris2: string };
      }>("/api/token/tukar", {
        method: "POST",
        body: JSON.stringify({
          kode: kodeTarget,
          meterId: meterAktif.id,
        }),
      });

      setHasilSukses({
        nilaiL: res.nilaiL,
        saldoBaruL: res.saldoBaruL,
        lcd: res.lcd,
      });
      setKodeToken("");
      setSalahCount(0);
      muatUlangData();
      ambilTokenBelumDipakai();
    } catch (err) {
      const baruSalah = salahCount + 1;
      setSalahCount(baruSalah);

      let pesanError = "Token salah atau sudah dipakai. Periksa kode di struk atau email Anda.";
      if (err instanceof ApiError) {
        pesanError = err.message;
      }

      if (baruSalah >= 5) {
        const expired = Date.now() + 10 * 60 * 1000;
        setTerkunciSampai(expired);
        setSisaWaktuKunci(600);
      }

      setHasilGalat({
        pesan: pesanError,
        lcdBaris1: "TOKEN SALAH",
        lcdBaris2: `SISA COBA: ${Math.max(0, 5 - baruSalah)}`,
      });
    } finally {
      setMemuat(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* ── Header Halaman ── */}
      <div className="border-b border-line pb-4">
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
          Isi Saldo Air
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Penukaran Token Prabayar
        </h1>
        <p className="mt-1 text-xs text-muted text-balance">
          Tukarkan kode token 4–10 digit yang Anda terima setelah pembelian menjadi saldo liter air.
        </p>
      </div>

      {/* Pemilih meter jika punya lebih dari 1 */}
      {meter.length > 1 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[3px] border border-line bg-surface p-3">
          <span className="text-xs font-semibold text-ink">Pilih Meter Tujuan:</span>
          <div className="flex flex-wrap gap-2">
            {meter.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pilihMeter(m.id)}
                className={`rounded-[2px] px-3 py-1 font-mono text-xs font-bold transition-colors ${
                  m.id === meterAktif?.id
                    ? "bg-brand-600 text-white"
                    : "border border-line bg-soft text-muted hover:text-ink"
                }`}
              >
                {m.nomorSeri} ({liter(m.saldoLiter, 0)})
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Banner Kunci 5x Percobaan Salah ── */}
      {terkunciSampai ? (
        <aside
          role="alert"
          className="rounded-[3px] border border-danger/40 bg-danger/10 p-4 text-xs font-medium text-danger"
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock size={16} />
            <span>Percobaan Ditangguhkan (5x Salah)</span>
          </div>
          <p className="mt-1 leading-relaxed">
            Terlalu banyak percobaan kode token yang salah. Kolom penukaran dinonaktifkan demi keamanan.
            Coba lagi dalam <strong className="font-mono">{Math.floor(sisaWaktuKunci / 60)} menit {sisaWaktuKunci % 60} detik</strong>.
          </p>
        </aside>
      ) : null}

      {/* ── Grid Dua Kolom: Formulir Token + Simulasi Meter Fisik ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Kolom Kiri: Form Input Token & Demo Chips */}
        <div className="space-y-6">
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <h2 className="font-display text-base font-bold text-ink">
              Masukkan Kode Token
            </h2>
            <p className="mt-1 text-xs text-muted">
              Angka saja. Tempel otomatis membersihkan spasi. Tekan Enter untuk mengirim.
            </p>

            {/* Chip Token Demo */}
            <div className="my-4 flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted">Token Demo:</span>
              <button
                type="button"
                disabled={Boolean(terkunciSampai) || memuat}
                onClick={() => {
                  setKodeToken("1111");
                  handleTukarToken("1111");
                }}
                className="rounded-[2px] border border-line bg-soft px-2.5 py-1 font-mono text-xs font-bold text-brand-700 hover:bg-brand-500/10 dark:text-accent"
              >
                1111 (+5 L)
              </button>
              <button
                type="button"
                disabled={Boolean(terkunciSampai) || memuat}
                onClick={() => {
                  setKodeToken("2222");
                  handleTukarToken("2222");
                }}
                className="rounded-[2px] border border-line bg-soft px-2.5 py-1 font-mono text-xs font-bold text-brand-700 hover:bg-brand-500/10 dark:text-accent"
              >
                2222 (+10 L)
              </button>
            </div>

            <div className="space-y-4">
              <TokenField
                nilai={kodeToken}
                onChange={setKodeToken}
                onKirim={() => handleTukarToken()}
                nonaktif={Boolean(terkunciSampai) || memuat}
                galat={hasilGalat ? hasilGalat.pesan : null}
              />

              <Button
                type="button"
                varian="utama"
                blok
                memuat={memuat}
                disabled={Boolean(terkunciSampai) || kodeToken.length < 4}
                onClick={() => handleTukarToken()}
              >
                Tukarkan ke Meter
              </Button>
            </div>

            {/* Layar Hasil Sukses */}
            {hasilSukses ? (
              <div className="mt-6 rounded-[3px] border border-success/40 bg-success/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-success">
                  <CheckCircle2 size={16} />
                  <span>TOKEN VALID (+{liter(hasilSukses.nilaiL, 0)})</span>
                </div>
                <p className="mt-1 text-xs text-ink">
                  Saldo baru pada meter {meterAktif?.nomorSeri}:{" "}
                  <strong className="font-mono font-bold text-success">
                    {liter(hasilSukses.saldoBaruL, 2)}
                  </strong>
                </p>
                <div className="mt-3">
                  <LcdDisplay
                    baris1="TOKEN VALID"
                    baris2={`+${hasilSukses.nilaiL}L  S=${hasilSukses.saldoBaruL.toFixed(1)}L`}
                  />
                </div>
              </div>
            ) : null}

            {/* Layar Hasil Gagal */}
            {hasilGalat ? (
              <div className="mt-6 rounded-[3px] border border-danger/40 bg-danger/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-danger">
                  <AlertCircle size={16} />
                  <span>TOKEN SALAH</span>
                </div>
                <p className="mt-1 text-xs text-danger">
                  {hasilGalat.pesan}
                </p>
                <div className="mt-3">
                  <LcdDisplay
                    baris1={hasilGalat.lcdBaris1}
                    baris2={hasilGalat.lcdBaris2}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Daftar Token Belum Dipakai (Tampil Bertopeng) */}
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-display text-sm font-bold text-ink">
                  Token Belum Digunakan
                </h3>
                <p className="text-[11px] text-muted">
                  Tampil bertopeng sebagai pengingat. Kode utuh ada pada email struk Anda.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-muted">
                {daftarToken.length} Token
              </span>
            </div>

            {memuatTokenList ? (
              <div className="py-4 text-center font-mono text-xs text-muted">
                Memuat daftar token...
              </div>
            ) : daftarToken.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">
                Tidak ada token aktif yang belum digunakan.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {daftarToken.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <span className="font-mono font-semibold tracking-wider text-ink select-none">
                        {t.kodeBertopeng}
                      </span>
                      <p className="text-[10px] text-muted">
                        Diterbitkan: {tanggal(t.dibuatPada)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-brand-700 dark:text-accent">
                        +{liter(t.nilaiL, 0)}
                      </span>
                      <p className="text-[10px] text-muted">
                        Batas: {tanggal(t.kedaluwarsaPada)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex items-start gap-1.5 rounded-[2px] bg-soft p-2.5 text-[11px] text-muted">
              <Info size={14} className="shrink-0 text-brand-600 dark:text-accent" />
              <span>
                Server tidak pernah menyimpan kode utuh demi keamanan. Kode token lengkap hanya dikirim sekali pada email konfirmasi pembelian.
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panduan Keypad Fisik & Perangkat Meter */}
        <div className="space-y-6">
          <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <h2 className="font-display text-base font-bold text-ink">
              Simulasi Meter Fisik
            </h2>
            <p className="mt-1 text-xs text-muted">
              Anda juga dapat mengetik langsung pada keypad meter: tekan <strong>*</strong> &rarr; masukkan kode &rarr; tekan <strong>A</strong>.
            </p>

            <div className="mt-6 flex justify-center">
              <MeterDevice
                baris1={
                  kodeToken
                    ? `INPUT: ${kodeToken}`
                    : `S=${(meterAktif?.saldoLiter ?? 0).toFixed(2)}L  ON`
                }
                baris2={
                  kodeToken
                    ? "TEKAN A=KIRIM"
                    : `D=0.0   V=${(meterAktif?.saldoLiter ?? 0).toFixed(1)}`
                }
                relayAktif={meterAktif?.saldoLiter ? meterAktif.saldoLiter > 0 : false}
                onTombol={handleTekanKeypad}
              />
            </div>

            <div className="mt-6 rounded-[3px] border border-line bg-soft p-3 text-xs text-muted">
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <HelpCircle size={14} />
                <span>Petunjuk Keypad 4×4 ESP32:</span>
              </div>
              <ul className="mt-2 list-inside list-disc space-y-1 text-[11px]">
                <li>Tombol <strong>*</strong>: Mengosongkan isian layar.</li>
                <li>Tombol <strong>0–9</strong>: Memasukkan digit kode token.</li>
                <li>Tombol <strong>D</strong>: Menghapus satu karakter terakhir (Backspace).</li>
                <li>Tombol <strong>A</strong>: Mengonfirmasi dan mengirimkan token (Enter).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
