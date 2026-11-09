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
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { liter, rupiah, meterKubik } from "@/lib/format";
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
  maksimalLiter?: number;
  paket: PaketOpsi[];
}

/** Bentuk jawaban `GET/PUT /api/isi-otomatis`. */
interface PengaturanIsiOtomatis {
  meterId: string;
  aktif: boolean;
  ambangL: number;
  volumeL: number;
  metode: string;
  terakhirPada: string | null;
}

/*
 * Ambang bawaan isi otomatis, dalam liter.
 *
 * Seratus liter, bukan angka di dekat alarm meter. Alarm firmware baru
 * berbunyi pada ≤5 L, dan membeli di titik itu sudah terlambat: tokennya
 * masih harus diterbitkan, sampai ke warga, lalu ditukarkan ke meter —
 * sementara relay menutup begitu saldo menyentuh nol.
 */
const AMBANG_BAWAAN_L = 100;

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
  /*
   * Batas satu kali pembelian DIAMBIL DARI SERVER, bukan ditulis ulang di sini.
   *
   * Sebelumnya tidak ada batas atas sama sekali: warga bisa mengetik berapa pun
   * digit sampai muncul tagihan "Rp 15.000.000.000.000.000.000.000" yang jebol
   * keluar kartu — dan server menerimanya. Menyimpan angkanya di dua tempat
   * hanya memindahkan masalah: begitu salah satu berubah, yang lain diam-diam
   * tertinggal. Nilai di bawah hanya cadangan bila /api/paket gagal dimuat.
   */
  const [maksLiter, setMaksLiter] = useState(100_000);
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

  // Isi otomatis — disimpan per meter di server.
  const [isiOtomatis, setIsiOtomatis] = useState<PengaturanIsiOtomatis | null>(
    null,
  );
  const [ambangInput, setAmbangInput] = useState<string>(String(AMBANG_BAWAAN_L));
  const [menyimpanOtomatis, setMenyimpanOtomatis] = useState(false);
  const [galatOtomatis, setGalatOtomatis] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<DataPaketResponse>("/api/paket");
        setTarifPerLiter(res.tarifPerLiter);
        if (res.maksimalLiter) setMaksLiter(res.maksimalLiter);
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

  /*
   * Pengaturan isi otomatis dimuat ULANG tiap kali meter aktif berganti.
   *
   * Disimpan per meter, bukan per akun: satu warga bisa memegang rumah dan
   * kos sekaligus, dan ambang yang masuk akal untuk satu sambungan tidak
   * pernah otomatis masuk akal untuk sambungan lain.
   */
  useEffect(() => {
    if (!meterAktif) return;
    let hidup = true;

    (async () => {
      try {
        const res = await api<PengaturanIsiOtomatis>(
          `/api/isi-otomatis?meterId=${encodeURIComponent(meterAktif.id)}`,
        );
        if (!hidup) return;
        setIsiOtomatis(res);
        setAmbangInput(String(res.ambangL));
      } catch {
        // Gagal memuat bukan alasan menghalangi pembelian biasa.
        if (hidup) setIsiOtomatis(null);
      }
    })();

    return () => {
      hidup = false;
    };
  }, [meterAktif]);

  /**
   * Menyimpan pengaturan isi otomatis.
   *
   * Paket yang diikat adalah paket yang SEDANG dipilih di halaman ini, dan
   * metodenya metode yang sedang dipilih — itulah arti "beli paket ini
   * otomatis". Mengirim keduanya tiap kali menyimpan membuat tombolnya
   * punya makna yang sama dengan yang terlihat di layar.
   */
  const simpanIsiOtomatis = async (aktif: boolean) => {
    if (!meterAktif) return;

    const ambangL = Math.max(10, Math.min(50_000, Number(ambangInput) || AMBANG_BAWAAN_L));

    setMenyimpanOtomatis(true);
    setGalatOtomatis(null);
    try {
      const res = await api<PengaturanIsiOtomatis>("/api/isi-otomatis", {
        method: "PUT",
        body: JSON.stringify({
          meterId: meterAktif.id,
          aktif,
          ambangL,
          volumeL: volumeFinalL >= 500 ? volumeFinalL : undefined,
          metode,
        }),
      });
      setIsiOtomatis(res);
      setAmbangInput(String(res.ambangL));
    } catch (err) {
      setGalatOtomatis(
        err instanceof ApiError
          ? err.message
          : "Gagal menyimpan pengaturan isi otomatis.",
      );
    } finally {
      setMenyimpanOtomatis(false);
    }
  };

  // Sinkronisasi dua arah untuk nominal bebas
  const handleUbahLiterBebas = (val: string) => {
    const angkaSaja = val.replace(/\D/g, "");
    // Dipotong di sumbernya, bukan hanya ditolak saat menekan bayar: angka
    // yang mustahil tidak boleh sempat tergambar di kartu ringkasan.
    const n = Math.min(Number(angkaSaja) || 0, maksLiter);
    setInputLiterBebas(n > 0 ? String(n) : "");
    const rp = Math.round(n * tarifPerLiter);
    setInputRupiahBebas(rp > 0 ? String(rp) : "");
  };

  const handleUbahRupiahBebas = (val: string) => {
    const angkaSaja = val.replace(/\D/g, "");
    const rpMentah = Number(angkaSaja) || 0;
    const literMentah = Math.round(rpMentah / tarifPerLiter);
    const l = Math.min(literMentah, maksLiter);
    const rp = l === literMentah ? rpMentah : Math.round(l * tarifPerLiter);
    setInputRupiahBebas(rp > 0 ? String(rp) : "");
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
    if (volumeFinalL > maksLiter) {
      setPesanGalat(
        `Pembelian maksimal ${maksLiter.toLocaleString("id-ID")} liter sekali transaksi.`,
      );
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

      // Ringkasan transaksi disimpan agar halaman invoice langsung tampil
      // tanpa berkedip kosong. Kode tokennya sendiri TIDAK lagi dititipkan ke
      // peramban — ia diambil dari server lewat `/api/token/:id/kode`.
      if (typeof window !== "undefined") {
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
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
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
          className="rounded-[10px] border border-danger/40 bg-danger/10 p-3.5 text-xs font-medium text-danger"
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
          <div className="permukaan p-5">
            <label className="text-xs font-bold text-ink">Meter Tujuan</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {meter.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pilihMeter(m.id)}
                  /*
                   * Yang terpilih TIMBUL, yang tidak terpilih CEKUNG.
                   * Sebelumnya keduanya dibedakan hanya oleh warna garis dan
                   * latar tipis — perbedaan yang hilang sama sekali bagi mata
                   * yang sedang bergerak cepat, dan bagi siapa pun yang sulit
                   * membedakan biru dari abu-abu. Bentuk tidak punya masalah
                   * itu: menonjol dan masuk ke dalam terbaca tanpa warna.
                   */
                  className={`angkat flex items-center gap-2 rounded-[10px] border px-3 py-2 text-xs ${
                    m.id === meterAktif?.id
                      ? "border-brand-500 bg-brand-50 font-bold text-brand-700 shadow-[var(--kilau-tepi),var(--kedalaman-2)] dark:text-accent"
                      : "border-line bg-surface-2 text-muted shadow-[var(--cekung-dalam)] hover:text-ink"
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
          <div className="permukaan p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-ink">Nominal Air</h2>
                <p className="text-[11px] text-muted">
                  Golongan: <strong className="text-ink">{golonganNama}</strong> &middot; Tarif {rupiah(tarifPerLiter, 1)}/L
                </p>
              </div>

              {/* Toggle Mode — alurnya CEKUNG, bidak yang aktif TIMBUL di
                  dalamnya. Itu bentuk sakelar sungguhan, dan satu-satunya
                  bentuk yang langsung memberi tahu mana sisi yang menyala. */}
              <div className="cekung flex p-1">
                <button
                  type="button"
                  onClick={() => setModePilihan("paket")}
                  className={`rounded-[7px] px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    modePilihan === "paket"
                      ? "bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Paket Pilihan
                </button>
                <button
                  type="button"
                  onClick={() => setModePilihan("bebas")}
                  className={`rounded-[7px] px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    modePilihan === "bebas"
                      ? "bg-surface text-ink shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                      : "text-muted hover:text-ink"
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
                      /*
                       * Yang terpilih duduk LEBIH TINGGI, bukan sekadar
                       * bergaris biru. Pada layar yang dilihat sekilas — dan
                       * halaman beli selalu dilihat sekilas — perbedaan
                       * tinggi terbaca lebih cepat daripada perbedaan warna
                       * garis setebal satu piksel, dan tetap terbaca oleh
                       * orang yang sulit membedakan biru dari abu-abu.
                       */
                      className={`angkat flex flex-col items-start rounded-card border p-3.5 text-left ${
                        aktif
                          ? "border-brand-500 bg-brand-50 shadow-[var(--kilau-tepi),var(--kedalaman-3)] ring-1 ring-brand-500"
                          : "border-line bg-surface shadow-[var(--kilau-tepi),var(--kedalaman-1)] hover:border-line-strong"
                      }`}
                    >
                      <span className="font-mono text-sm font-bold text-ink">
                        {liter(p.volumeL, 0)}
                      </span>
                      <span className="font-mono text-xs text-brand-700 dark:text-accent font-semibold">
                        {rupiah(p.hargaRp)}
                      </span>
                      <span className="mt-1 text-[10px] text-muted">
                        {meterKubik(p.volumeL, 1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 cekung border-line bg-soft p-4">
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
                        className="tabular h-10 w-full permukaan-rata px-3 font-mono text-sm font-bold text-ink outline-none focus:border-brand-500"
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
                        className="tabular h-10 w-full permukaan-rata pl-9 pr-3 font-mono text-sm font-bold text-ink outline-none focus:border-brand-500"
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
          <div className="permukaan p-5 shadow-xs">
            <h2 className="mb-3 text-sm font-bold text-ink">Metode Pembayaran</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {METODE_BAYAR.map(({ id, nama, sub, Ikon }) => {
                const terpilih = metode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMetode(id)}
                    className={`angkat flex items-start gap-3 rounded-card border p-3.5 text-left ${
                      terpilih
                        ? "border-brand-500 bg-brand-50 shadow-[var(--kilau-tepi),var(--kedalaman-3)] ring-1 ring-brand-500"
                        : "border-line bg-surface shadow-[var(--kilau-tepi),var(--kedalaman-1)]"
                    }`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100 dark:text-accent">
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

          {/* ── Isi otomatis ──────────────────────────────────────────────
           *
           * Diletakkan SETELAH paket dan metode, bukan sebelumnya, karena
           * yang diikat sakelar ini adalah paket dan metode yang sedang
           * dipilih di atasnya. Ditaruh lebih dulu, warga diminta menyetujui
           * sesuatu yang belum mereka tentukan.
           */}
          <div className="permukaan p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100 dark:text-accent">
                  <RefreshCw size={16} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-ink">Isi otomatis</h2>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                    Beli paket ini otomatis saat saldo turun di bawah ambang,
                    sebelum alarm meter berbunyi. Bisa dimatikan kapan saja.
                  </p>
                </div>
              </div>

              {/*
                Sakelar digambar sebagai alur CEKUNG dengan bidak TIMBUL di
                dalamnya — bentuk sakelar sungguhan. Warnanya saja tidak
                cukup: keadaan nyala dan mati harus bisa dibedakan tanpa
                bergantung pada kemampuan membedakan biru dari abu-abu.
              */}
              <button
                type="button"
                role="switch"
                aria-checked={isiOtomatis?.aktif ?? false}
                aria-label="Aktifkan isi otomatis"
                disabled={menyimpanOtomatis || !meterAktif}
                onClick={() => simpanIsiOtomatis(!(isiOtomatis?.aktif ?? false))}
                className={`cekung relative h-7 w-12 shrink-0 rounded-full p-0 transition-colors disabled:opacity-50 ${
                  isiOtomatis?.aktif ? "bg-brand-500" : "bg-surface-2"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute top-1 size-5 rounded-full bg-surface shadow-[var(--kilau-tepi),var(--kedalaman-2)] transition-[left] duration-200 ${
                    isiOtomatis?.aktif ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ambang-isi-otomatis"
                  className="text-[11px] font-semibold text-muted"
                >
                  Belikan saat saldo di bawah
                </label>
                <div className="relative mt-1">
                  <input
                    id="ambang-isi-otomatis"
                    type="text"
                    inputMode="numeric"
                    value={ambangInput}
                    onChange={(e) =>
                      setAmbangInput(e.target.value.replace(/\D/g, "").slice(0, 5))
                    }
                    onBlur={() => {
                      if (isiOtomatis?.aktif) void simpanIsiOtomatis(true);
                    }}
                    className="cekung tabular h-10 w-full px-3 font-mono text-sm font-bold text-ink outline-none focus:border-brand-500"
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-muted">
                    L
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-muted">
                  Paket yang dibelikan
                </span>
                <div className="cekung mt-1 flex h-10 items-center px-3">
                  <span className="tabular font-mono text-sm font-bold text-ink">
                    {volumeFinalL >= 500 ? liter(volumeFinalL, 0) : "—"}
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-muted">
                    {metode}
                  </span>
                </div>
              </div>
            </div>

            {galatOtomatis ? (
              <p role="alert" className="mt-3 text-[11px] font-medium text-danger">
                {galatOtomatis}
              </p>
            ) : null}

            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {isiOtomatis?.aktif ? (
                <>
                  Aktif untuk meter{" "}
                  <strong className="font-mono text-ink">
                    {meterAktif?.nomorSeri}
                  </strong>
                  . Tagihan dan kode token dikirim ke email Anda setiap kali
                  pembelian otomatis terbit.
                </>
              ) : (
                <>
                  Alarm meter baru berbunyi pada saldo 5 liter — terlalu dekat
                  untuk sempat membeli dan menukarkan token. Ambang di atas
                  memberi jeda beberapa hari sebelum itu terjadi.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Kolom 3: Ringkasan Lengket di Samping */}
        <div>
          <div className="sticky top-24 permukaan p-6 shadow-xs">
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
                <span className="shrink-0 text-muted">Tarif Dasar</span>
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
              {/*
                `min-w-0` + `break-all` pada angkanya: tanpa itu, nominal
                panjang memaksa lebar flex melebihi kartu dan tulisannya
                menjulur keluar kotak, bukan membungkus ke bawah.
              */}
              <div className="flex items-baseline justify-between gap-3">
                <span className="shrink-0 text-xs font-bold text-muted">
                  Total Tagihan
                </span>
                <span className="tabular min-w-0 break-all text-right font-mono text-2xl font-black text-ink">
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

            <div className="mt-4 flex items-start gap-2 rounded-[8px] bg-soft p-3 text-[11px] leading-relaxed text-muted">
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
