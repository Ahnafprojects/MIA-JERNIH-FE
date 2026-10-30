"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  QrCode,
  Building,
  Store,
  Droplets,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { liter, rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface PaketOpsi {
  volumeL: number;
  hargaRp: number;
  label: string;
}

interface DataPaketResponse {
  golongan: string;
  tarifPerLiter: number;
  minimalLiter: number;
  paket: PaketOpsi[];
}

const METODE_BAYAR = [
  { id: "QRIS", nama: "QRIS", sub: "GoPay, OVO, Dana, ShopeePay", Ikon: QrCode },
  { id: "VA", nama: "Virtual Account", sub: "BCA, Mandiri, BNI, BRI", Ikon: Building },
  { id: "EWALLET", nama: "E-Wallet Langsung", sub: "AstraPay, LinkAja", Ikon: CreditCard },
  { id: "GERAI", nama: "Gerai Retail", sub: "Indomaret, Alfamart", Ikon: Store },
];

export default function HalamanBeliToken() {
  const router = useRouter();
  const { meter, meterAktif, pilihMeter } = useAuth();

  const [tarifPerLiter, setTarifPerLiter] = useState(7.5);
  const [golonganNama, setGolonganNama] = useState("Rumah Tangga Umum");
  const [daftarPaket, setDaftarPaket] = useState<PaketOpsi[]>([]);
  const [modePilihan, setModePilihan] = useState<"paket" | "bebas">("paket");

  // State pilihan paket atau bebas
  const [literTerpilih, setLiterTerpilih] = useState<number>(2000);
  const [inputLiterBebas, setInputLiterBebas] = useState<string>("1500");
  const [inputRupiahBebas, setInputRupiahBebas] = useState<string>("11250");

  const [metode, setMetode] = useState<string>("QRIS");
  const [memuatBayar, setMemuatBayar] = useState(false);
  const [tahapBayar, setTahapBayar] = useState<string | null>(null);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<DataPaketResponse>("/api/paket");
        setTarifPerLiter(res.tarifPerLiter);
        setGolonganNama(res.golongan);
        setDaftarPaket(res.paket);
        if (res.paket.length > 0) {
          setLiterTerpilih(res.paket[1]?.volumeL ?? res.paket[0]!.volumeL);
        }
      } catch {
        // Fallback nilai standar bila gagal fetch
        setDaftarPaket([
          { volumeL: 500, hargaRp: 3750, label: "0,5 m³ (500 Liter)" },
          { volumeL: 1000, hargaRp: 7500, label: "1 m³ (1.000 Liter)" },
          { volumeL: 2000, hargaRp: 15000, label: "2 m³ (2.000 Liter)" },
          { volumeL: 5000, hargaRp: 37500, label: "5 m³ (5.000 Liter)" },
          { volumeL: 10000, hargaRp: 75000, label: "10 m³ (10.000 Liter)" },
        ]);
      }
    })();
  }, []);

  // Sinkronisasi dua arah untuk nominal bebas
  const handleUbahLiterBebas = (val: string) => {
    const angkaSaja = val.replace(/\D/g, "");
    setInputLiterBebas(angkaSaja);
    const n = Number(angkaSaja) || 0;
    const rp = Math.round(n * tarifPerLiter);
    setInputRupiahBebas(rp > 0 ? String(rp) : "");
  };

  const handleUbahRupiahBebas = (val: string) => {
    const angkaSaja = val.replace(/\D/g, "");
    setInputRupiahBebas(angkaSaja);
    const rp = Number(angkaSaja) || 0;
    const l = Math.round(rp / tarifPerLiter);
    setInputLiterBebas(l > 0 ? String(l) : "");
  };

  // Hitung total volume & rupiah final
  const volumeFinalL = modePilihan === "paket" ? literTerpilih : Number(inputLiterBebas) || 0;
  const totalHargaRp = Math.round(volumeFinalL * tarifPerLiter);

  const handleBayar = async () => {
    if (!meterAktif) {
      setPesanGalat("Pilih meter tujuan terlebih dahulu.");
      return;
    }
    if (volumeFinalL < 500) {
      setPesanGalat("Pembelian minimal adalah 500 liter.");
      return;
    }

    setPesanGalat(null);
    setMemuatBayar(true);
    setTahapBayar("Menghubungkan ke gerbang pembayaran...");

    try {
      const res = await api<{
        invoiceId: string;
        jumlahRp: number;
        status: string;
        volumeL: number;
        kode?: string;
        meterId: string;
        qrString?: string | null;
        vaNumber?: string | null;
      }>("/api/pembayaran", {
        method: "POST",
        body: JSON.stringify({
          meterId: meterAktif.id,
          liter: volumeFinalL,
          metode,
        }),
      });

      setTahapBayar("Menerbitkan tagihan dan token air...");

      // Simpan ringkasan transaksi & token ke sessionStorage agar halaman invoice langsung tampil tanpa blank
      if (typeof window !== "undefined") {
        if (res.kode) {
          sessionStorage.setItem(`jernih_token_${res.invoiceId}`, res.kode);
        }
        sessionStorage.setItem(
          `jernih_tx_${res.invoiceId}`,
          JSON.stringify({
            invoiceId: res.invoiceId,
            meterId: res.meterId,
            volumeL: res.volumeL,
            jumlahRp: res.jumlahRp,
            metode,
            status: res.status,
            qrString: res.qrString,
            nomorVa: res.vaNumber,
            dibuatPada: new Date().toISOString(),
          }),
        );
      }

      router.push(`/bayar/${res.invoiceId}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal memproses tagihan pembelian. Silakan coba kembali.");
      }
      setMemuatBayar(false);
      setTahapBayar(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* ── Header ── */}
      <div className="border-b border-line pb-4">
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
          Isi Ulang Saldo
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Beli Token Air
        </h1>
        <p className="mt-1 text-xs text-muted">
          Pilih paket liter atau isi nominal bebas. Tarif dihitung sesuai golongan pelanggan Anda.
        </p>
      </div>

      {pesanGalat ? (
        <aside
          role="alert"
          className="rounded-[3px] border border-danger/40 bg-danger/10 p-3.5 text-xs font-medium text-danger"
        >
          <div className="flex gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{pesanGalat}</span>
          </div>
        </aside>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Kolom 1 & 2: Pilihan Paket & Metode Pembayaran */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pemilih Meter Tujuan */}
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <label className="text-xs font-bold text-ink">Meter Tujuan</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {meter.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pilihMeter(m.id)}
                  className={`flex items-center gap-2 rounded-[3px] border px-3 py-2 text-xs transition-colors ${
                    m.id === meterAktif?.id
                      ? "border-brand-500 bg-brand-500/10 font-bold text-brand-700 dark:text-accent"
                      : "border-line bg-soft text-muted hover:text-ink"
                  }`}
                >
                  <Droplets size={14} />
                  <span>{m.nomorSeri}</span>
                  <span className="font-mono text-[11px] text-muted">
                    ({liter(m.saldoLiter, 0)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Paket Liter / Nominal Bebas */}
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-ink">Nominal Air</h2>
                <p className="text-[11px] text-muted">
                  Golongan: <strong className="text-ink">{golonganNama}</strong> &middot; Tarif {rupiah(tarifPerLiter, 1)}/L
                </p>
              </div>

              {/* Toggle Mode */}
              <div className="flex rounded-[3px] border border-line bg-soft p-0.5">
                <button
                  type="button"
                  onClick={() => setModePilihan("paket")}
                  className={`rounded-[2px] px-2.5 py-1 text-xs font-semibold ${
                    modePilihan === "paket" ? "bg-surface text-ink shadow-xs" : "text-muted"
                  }`}
                >
                  Paket Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setModePilihan("bebas")}
                  className={`rounded-[2px] px-2.5 py-1 text-xs font-semibold ${
                    modePilihan === "bebas" ? "bg-surface text-ink shadow-xs" : "text-muted"
                  }`}
                >
                  Nominal Bebas
                </button>
              </div>
            </div>

            {modePilihan === "paket" ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {daftarPaket.map((p) => {
                  const aktif = literTerpilih === p.volumeL;
                  return (
                    <button
                      key={p.volumeL}
                      type="button"
                      onClick={() => setLiterTerpilih(p.volumeL)}
                      className={`flex flex-col items-start rounded-[3px] border p-3 text-left transition-colors ${
                        aktif
                          ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                          : "border-line bg-surface hover:border-line-strong hover:bg-soft"
                      }`}
                    >
                      <span className="font-mono text-sm font-bold text-ink">
                        {liter(p.volumeL, 0)}
                      </span>
                      <span className="font-mono text-xs text-brand-700 dark:text-accent font-semibold">
                        {rupiah(p.hargaRp)}
                      </span>
                      <span className="mt-1 text-[10px] text-muted">
                        {(p.volumeL / 1000).toFixed(1)} m³
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 rounded-[3px] border border-line bg-soft p-4">
                <p className="text-xs font-medium text-ink">
                  Masukkan jumlah liter atau nominal rupiah (minimal 500 liter):
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted">
                      Volume Air (Liter)
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputLiterBebas}
                        onChange={(e) => handleUbahLiterBebas(e.target.value)}
                        className="tabular h-10 w-full rounded-[3px] border border-line bg-surface px-3 font-mono text-sm font-bold text-ink outline-none focus:border-brand-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">
                        L
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted">
                      Total Pembayaran (Rupiah)
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputRupiahBebas}
                        onChange={(e) => handleUbahRupiahBebas(e.target.value)}
                        className="tabular h-10 w-full rounded-[3px] border border-line bg-surface pl-9 pr-3 font-mono text-sm font-bold text-ink outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted">
                  Nominal dibulatkan ke rupiah terdekat: {rupiah(totalHargaRp)}.
                </p>
              </div>
            )}
          </div>

          {/* Pilihan Metode Pembayaran */}
          <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
            <h2 className="mb-3 text-sm font-bold text-ink">Metode Pembayaran</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {METODE_BAYAR.map(({ id, nama, sub, Ikon }) => {
                const terpilih = metode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMetode(id)}
                    className={`flex items-start gap-3 rounded-[3px] border p-3 text-left transition-colors ${
                      terpilih
                        ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                        : "border-line bg-surface hover:bg-soft"
                    }`}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-[2px] bg-soft text-brand-600 dark:text-accent">
                      <Ikon size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">{nama}</p>
                      <p className="text-[10px] text-muted">{sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom 3: Ringkasan Lengket di Samping */}
        <div>
          <div className="sticky top-24 rounded-[4px] border border-line bg-surface p-6 shadow-xs">
            <h2 className="font-display text-base font-bold text-ink">
              Ringkasan Pembelian
            </h2>
            <div className="mt-4 space-y-2.5 border-t border-line pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Meter Tujuan</span>
                <span className="font-mono font-bold text-ink">
                  {meterAktif?.nomorSeri}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Volume Air</span>
                <span className="font-mono font-bold text-ink">
                  {liter(volumeFinalL, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tarif Dasar</span>
                <span className="font-mono text-muted">
                  {rupiah(tarifPerLiter, 1)} / Liter
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Metode Bayar</span>
                <span className="font-semibold text-ink">{metode}</span>
              </div>
            </div>

            <div className="my-4 border-t border-line pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-muted">Total Tagihan</span>
                <span className="tabular font-mono text-2xl font-black text-ink">
                  {rupiah(totalHargaRp)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              varian="utama"
              blok
              memuat={memuatBayar}
              disabled={volumeFinalL < 500}
              onClick={handleBayar}
            >
              {memuatBayar
                ? tahapBayar ?? "Memproses..."
                : `Bayar ${rupiah(totalHargaRp)}`}
              {!memuatBayar ? <ArrowRight size={16} /> : null}
            </Button>

            {memuatBayar ? (
              <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[11px] text-muted">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-brand-500" />
                <span>{tahapBayar}</span>
              </div>
            ) : null}

            <div className="mt-4 flex items-start gap-2 rounded-[2px] bg-soft p-3 text-[11px] leading-relaxed text-muted">
              <ShieldCheck size={16} className="shrink-0 text-success" />
              <span>
                Pembelian ini menerbitkan kode token sekali pakai. Saldo fisik meter baru akan bertambah setelah token ditukarkan ke meter.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
