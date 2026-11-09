"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Droplet,
  LifeBuoy,
  KeyRound,
  ExternalLink,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { liter, debit, rupiah, meterKubik } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { TokenField } from "@/components/domain/token-field";
import { LcdDisplay } from "@/components/domain/lcd";
import { LivePill, FlowVis } from "@/components/domain/live";
import { GrafikAir } from "@/components/domain/grafik-air";
import { BolaAir } from "@/components/ui/bola-air";
import { PemilihMeter } from "../_nav-portal";
import LoadingBeranda from "./loading";

/*
 * Acuan penuh bola saldo bagi warga yang belum punya riwayat.
 *
 * Begitu ada riwayat, acuannya diganti pemakaian warga SENDIRI selama
 * sebulan (lihat `acuanBolaL`). Seribu liter hanya dipakai sampai angka itu
 * tersedia — tanpa riwayat, tidak ada acuan lain yang lebih baik.
 */
const ACUAN_BACA_L = 1000;

/**
 * Tarif golongan rumah tangga, rupiah per liter.
 *
 * Beranda hanya MEMPERKIRAKAN biaya dan tidak pernah menagih — nilai yang
 * mengikat selalu datang dari server pada saat transaksi dibuat, lewat
 * `/api/paket`. Angka di sini tidak boleh dipakai untuk apa pun yang
 * menghasilkan tagihan.
 */
const TARIF_PER_LITER = 7.5;

interface DataLiveMeter {
  meterId: string;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  saklarOn: boolean;
  relay: string;
  buzzer: string;
  daring: boolean;
  ts: string;
}

interface DeretPemakaian {
  waktu: string;
  volumeL: number;
}

/** Bentuknya mengikuti `/api/transaksi` di `riwayat/page.tsx`. */
interface TransaksiRingkas {
  id: string;
  jenis: "BELI" | "ISI_TOKEN";
  volumeL: number;
  jumlahRp: number;
  metode: string;
  status: "LUNAS" | "MENUNGGU" | "GAGAL" | "KEDALUWARSA";
  dibuatPada: string;
}

interface NotifRingkas {
  id: string;
  judul: string;
  teks: string;
  dibuatPada: string;
}

/**
 * Keterangan meter dari `GET /api/meter/:id`.
 *
 * `MeterSingkat` di `auth-tipe.ts` hanya membawa id, nomor seri, saldo, dan
 * relay — cukup untuk memilih meter, tidak cukup untuk menamainya. Label,
 * alamat, dan versi firmware diambil dari sini supaya kepala halaman
 * menyebut rumah yang benar alih-alih menampilkan alamat karangan.
 */
interface MeterDetail {
  label?: string | null;
  alamat?: string | null;
  serial?: string | null;
  zona?: string | null;
  versiFirmware?: string | null;
}

/**
 * `GET /api/meter/:id` membungkus isinya: `{ meter: {...}, lcd: {...} }`.
 *
 * Dibuktikan langsung ke server, bukan ditebak. Percobaan pertama menganggap
 * bentuknya rata dan hasilnya seluruh keterangan meter diam-diam `undefined` —
 * tidak ada galat, halaman hanya menampilkan teks cadangan selamanya. Jenis
 * kegagalan yang paling sulit terlihat: semuanya tampak bekerja.
 */
interface JawabanMeter {
  meter?: MeterDetail | null;
}

/**
 * Mengembalikan teks hanya bila benar-benar ada isinya.
 *
 * `??` tidak cukup: `label` pada meter demo berisi STRING KOSONG, bukan null,
 * dan string kosong lolos dari `??` lalu tergambar sebagai judul kosong di
 * kepala halaman. Yang dinilai di sini keberadaan isi, bukan keberadaan
 * nilai.
 */
function isi(teks: string | null | undefined): string | null {
  const t = teks?.trim();
  return t ? t : null;
}

/**
 * Sapaan menurut jam setempat.
 *
 * Batasnya mengikuti kebiasaan Indonesia, bukan pembagian 6 jam yang rapi:
 * "siang" membentang sampai pukul 15, dan "sore" baru menyerah pada pukul
 * 18. Membagi hari menjadi empat bagian yang sama panjang menghasilkan
 * sapaan yang terasa salah bagi orang yang membaca — "selamat malam" pada
 * pukul 18.00 terbaca seperti jam dinding yang tidak dicocokkan.
 */
function sapaan(jam: number): string {
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

function KontenBeranda() {
  const router = useRouter();
  const { pengguna, meter, meterAktif, memuat, muatUlangData } = useAuth();

  const [dataLive, setDataLive] = useState<DataLiveMeter | null>(null);
  const [deretPemakaian, setDeretPemakaian] = useState<DeretPemakaian[]>([]);
  const [deretBulan, setDeretBulan] = useState<DeretPemakaian[]>([]);
  const [transaksi, setTransaksi] = useState<TransaksiRingkas[]>([]);
  const [notifikasi, setNotifikasi] = useState<NotifRingkas[]>([]);
  const [detailMeter, setDetailMeter] = useState<MeterDetail | null>(null);
  const [memuatPemakaian, setMemuatPemakaian] = useState(false);

  // Form isi token cepat
  const [tokenInput, setTokenInput] = useState("");
  const [memuatTukar, setMemuatTukar] = useState(false);
  const [pesanTukar, setPesanTukar] = useState<{
    tipe: "sukses" | "galat";
    teks: string;
  } | null>(null);

  // Jika warga belum menghubungkan meter, arahkan ke /hubungkan-meter
  useEffect(() => {
    if (!memuat && pengguna && meter.length === 0) {
      router.replace("/hubungkan-meter");
    }
  }, [memuat, meter, pengguna, router]);

  // Polling data telemetri live tiap 5 detik
  const ambilDataLive = useCallback(async (meterId: string) => {
    try {
      const data = await api<DataLiveMeter>(`/api/meter/${meterId}/live`);
      setDataLive(data);
    } catch {
      // Polling fallback tenang
    }
  }, []);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      setMemuatPemakaian(true);
      try {
        const live = await api<DataLiveMeter>(
          `/api/meter/${meterAktif.id}/live`,
        );
        if (aktif) setDataLive(live);
      } catch {
        // Abaikan
      }

      try {
        const p = await api<{ deret: DeretPemakaian[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=minggu`,
        );
        if (aktif) setDeretPemakaian(p.deret || []);
      } catch {
        // Abaikan
      } finally {
        if (aktif) setMemuatPemakaian(false);
      }

      /*
       * Pemakaian bulan berjalan diambil TERPISAH, bukan dijumlahkan dari
       * deret mingguan. Tujuh hari terakhir hampir tidak pernah berimpit
       * dengan satu bulan kalender — menjumlahkannya akan memberi angka
       * "bulan ini" yang sebenarnya memotong bulan lalu.
       */
      try {
        const b = await api<{ deret: DeretPemakaian[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=bulan`,
        );
        if (aktif) setDeretBulan(b.deret || []);
      } catch {
        // Abaikan
      }

      /* Aktivitas terakhir dan pengumuman: keduanya hiasan konteks, jadi
         kegagalannya tidak boleh menghentikan apa pun di halaman ini. */
      try {
        const t = await api<{ rows: TransaksiRingkas[] }>(
          "/api/transaksi?page=1&perPage=4",
        );
        if (aktif) setTransaksi(t.rows ?? []);
      } catch {
        // Abaikan
      }

      try {
        const n = await api<{ rows: NotifRingkas[] }>("/api/notifikasi");
        if (aktif) setNotifikasi((n.rows ?? []).slice(0, 2));
      } catch {
        // Abaikan
      }

      try {
        const d = await api<JawabanMeter>(`/api/meter/${meterAktif.id}`);
        if (aktif) setDetailMeter(d.meter ?? null);
      } catch {
        // Abaikan
      }
    })();

    const interval = setInterval(() => {
      ambilDataLive(meterAktif.id);
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [meterAktif, ambilDataLive]);

  // Handle submit isi token cepat
  const handleTukarTokenCepat = async () => {
    if (!meterAktif || tokenInput.length < 4) return;

    setMemuatTukar(true);
    setPesanTukar(null);

    try {
      const res = await api<{
        status: string;
        nilaiL: number;
        saldoBaruL: number;
      }>("/api/token/tukar", {
        method: "POST",
        body: JSON.stringify({
          kode: tokenInput,
          meterId: meterAktif.id,
        }),
      });

      setPesanTukar({
        tipe: "sukses",
        teks: `Token valid! Saldo Anda bertambah +${liter(res.nilaiL, 0)}.`,
      });
      setTokenInput("");
      muatUlangData();
      ambilDataLive(meterAktif.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanTukar({ tipe: "galat", teks: err.message });
      } else {
        setPesanTukar({
          tipe: "galat",
          teks: "Token salah atau sudah dipakai. Periksa kode di struk atau email Anda.",
        });
      }
    } finally {
      setMemuatTukar(false);
    }
  };

  /*
   * Pemakaian hari ini, dijumlahkan dari ember jam-jaman.
   *
   * Nilai cadangan 18,5 yang dulu ada di sini DIHAPUS. Angka itu muncul
   * persis ketika servernya tidak punya data, yaitu satu-satunya saat
   * halaman ini seharusnya mengatakan "belum ada" — dan 18,5 L terbaca
   * sebagai pengukuran, bukan sebagai ketiadaan. Nol yang benar lebih baik
   * daripada angka yang meyakinkan tetapi tidak berasal dari mana pun.
   *
   * Deret bulanan dipakai sebagai sumber cadangan karena `rentang=minggu`
   * memang bisa menjawab kosong sementara `rentang=bulan` berisi.
   */
  const totalHariIniL = useMemo(() => {
    const sumber = deretPemakaian.length > 0 ? deretPemakaian : deretBulan;
    const kiniHari = new Date().toDateString();
    return sumber
      .filter((d) => new Date(d.waktu).toDateString() === kiniHari)
      .reduce((acc, curr) => acc + curr.volumeL, 0);
  }, [deretPemakaian, deretBulan]);

  const totalBulanL = useMemo(
    () => deretBulan.reduce((a, d) => a + d.volumeL, 0),
    [deretBulan],
  );

  /*
   * Target harian = rata-rata tujuh hari terakhir, dibulatkan.
   *
   * SENGAJA diturunkan dari data warga sendiri, bukan angka tetap. Target
   * yang dipatok di kode berlaku sama untuk rumah berisi dua orang dan
   * rumah berisi delapan — salah satunya pasti melanggarnya tiap hari, dan
   * garis yang selalu dilanggar berhenti dibaca sebagai target.
   *
   * Nol dikembalikan bila belum ada data; grafik tidak menggambar garisnya
   * sama sekali pada nilai itu, dan itu benar — belum ada yang bisa
   * dijadikan acuan.
   */
  const targetHarianL = useMemo(() => {
    /*
     * Deret mingguan dulu, deret BULANAN sebagai cadangan.
     *
     * Bukan kerapian: `rentang=minggu` benar-benar menjawab `deret: []` pada
     * meter yang riwayat embernya lebih tua dari tujuh hari, sementara
     * `rentang=bulan` tetap berisi. Versi pertama hanya membaca deret
     * mingguan, dan hasilnya halaman menulis "belum ada rata-rata" tepat di
     * bawah grafik tujuh hari yang penuh batang — dua pernyataan yang saling
     * membantah di satu layar yang sama.
     */
    const kumpul = (d: DeretPemakaian[]) => {
      const hari = new Map<string, number>();
      d.forEach((x) => {
        const k = new Date(x.waktu).toDateString();
        hari.set(k, (hari.get(k) ?? 0) + x.volumeL);
      });
      return hari;
    };

    const hari = kumpul(
      deretPemakaian.length > 0 ? deretPemakaian : deretBulan,
    );
    if (hari.size === 0) return 0;
    const total = Array.from(hari.values()).reduce((a, b) => a + b, 0);
    return Math.round(total / hari.size);
  }, [deretPemakaian, deretBulan]);

  /*
   * Tujuh hari terakhir.
   *
   * Dua hal diperbaiki dari versi sebelumnya:
   *
   * 1. Deret bulanan dipakai sebagai cadangan, bukan tujuh angka yang
   *    ditulis mati. Angka mati itu tergambar sebagai grafik yang rapi dan
   *    meyakinkan tepat ketika servernya tidak punya data sama sekali —
   *    dan tidak ada apa pun di layar yang memberi tahu bedanya.
   *
   * 2. Pengelompokannya memakai TANGGAL, bukan nama hari. Nama hari
   *    berulang tiap tujuh hari: pada rentang bulanan, empat hari Senin
   *    yang berbeda dijumlahkan menjadi satu batang, dan grafiknya
   *    diam-diam menampilkan angka berlipat empat dengan label yang benar.
   */
  const grafik7HariData = useMemo(() => {
    const sumber = deretPemakaian.length > 0 ? deretPemakaian : deretBulan;

    const perTanggal = new Map<string, number>();
    sumber.forEach((d) => {
      const t = new Date(d.waktu);
      const kunci = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
      perTanggal.set(kunci, (perTanggal.get(kunci) ?? 0) + d.volumeL);
    });

    const urut = Array.from(perTanggal.entries())
      .sort((a, b) => Date.parse(a[0].replace(/-/g, "/")) -
        Date.parse(b[0].replace(/-/g, "/")))
      .slice(-7);

    if (urut.length === 0) {
      return { labels: [] as string[], deret: [] };
    }

    const labels = urut.map(([k]) => {
      const [th, bl, tg] = k.split("-").map(Number);
      return new Date(th, bl, tg).toLocaleDateString("id-ID", {
        weekday: "short",
      });
    });

    return {
      labels,
      deret: [
        {
          name: "Pemakaian Air",
          unit: "L",
          points: urut.map(([, v]) => Math.round(v)),
        },
      ],
    };
  }, [deretPemakaian, deretBulan]);

  if (memuat || !meterAktif) {
    return (
      <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded-card bg-soft" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-card bg-soft lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-card bg-soft" />
        </div>
      </div>
    );
  }

  const saldoSekarang = dataLive?.saldoL ?? meterAktif.saldoLiter ?? 0;
  const debitSekarang = dataLive?.debitLpm ?? 0;
  const saldoMenipis = saldoSekarang <= 5.0;

  const sekarang = new Date();
  const tanggalPanjang = sekarang.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /*
   * Luring ditentukan oleh bendera `daring` dari server, dan HANYA bila
   * servernya memang menjawab. `dataLive` yang masih null berarti
   * permintaannya belum selesai — bukan berarti meternya mati. Menyamakan
   * keduanya membuat halaman berkedip "OFFLINE" tiap kali dimuat ulang.
   */
  const luring = dataLive !== null && dataLive.daring === false;

  /*
   * Target sebulan = rata-rata harian × jumlah hari di bulan INI, bukan 30.
   * Februari dan Juli bukan bulan yang sama panjangnya, dan memakai 30 untuk
   * keduanya membuat persentasenya meleset sampai sepuluh persen di bulan
   * terpendek — tepat pada angka yang dipakai orang untuk menilai dirinya.
   */
  const hariDalamBulan = new Date(
    sekarang.getFullYear(),
    sekarang.getMonth() + 1,
    0,
  ).getDate();
  const targetBulanL = targetHarianL * hariDalamBulan;
  const melebihiTarget = targetBulanL > 0 && totalBulanL > targetBulanL;

  /*
   * Bola penuh = pemakaian warga sendiri selama sebulan, bukan seribu liter.
   *
   * Angka tetap tidak bisa ditafsirkan siapa pun: 1.877 L di atas acuan
   * 1.000 L menggambar bola penuh dan berhenti di situ, jadi saldo dua kali
   * lipat dan saldo pas-pasan terlihat sama persis. Diukur terhadap
   * pemakaian sendiri, tinggi airnya langsung berarti "berapa bulan lagi" —
   * satu-satunya pertanyaan yang benar-benar ditanyakan orang di sini.
   */
  const acuanBolaL = targetBulanL > 0 ? targetBulanL : ACUAN_BACA_L;

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Banner Saldo Menipis (Sesuai Firmware: meter sudah berbunyi tiap 10 detik) ── */}
      {saldoMenipis ? (
        <aside
          role="alert"
          className="permukaan flex flex-col gap-3 border-danger/40 bg-danger-soft p-4 text-ink sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-danger text-white shadow-[var(--kedalaman-2)] ring-1 ring-white/25 ring-inset">
              <AlertTriangle size={18} />
            </span>
            <div>
              <p className="font-mono text-xs font-bold tracking-wider text-danger uppercase">
                Peringatan Saldo Kritis
              </p>
              <h2 className="text-sm font-bold text-ink">
                Saldo air tersisa {liter(saldoSekarang, 1)} — meter sudah
                berbunyi tiap 10 detik.
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Katup relay akan menutup otomatis saat saldo 0 liter. Segera isi
                token untuk menjaga pasokan air.
              </p>
            </div>
          </div>
          <Link href="/beli" className="shrink-0">
            <Button varian="bahaya" ukuran="sm" className="w-full sm:w-auto">
              Beli Token Sekarang
              <ArrowRight size={14} />
            </Button>
          </Link>
        </aside>
      ) : null}

      {/* ── Header Sambutan Warga ── */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-baseline">
        <div>
          <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
            {tanggalPanjang}
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {sapaan(sekarang.getHours())}, {pengguna?.nama ?? "Warga"}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {/*
              Label dan alamat berasal dari server, bukan dikarang. Selama
              permintaannya belum selesai yang tampil nomor serinya saja —
              menampilkan alamat sementara lalu menukarnya dengan alamat
              sungguhan akan terbaca sebagai data yang berubah sendiri.
            */}
            {/*
              Nomor seri DIHAPUS dari baris ini; tempatnya sekarang di kartu
              saldo. Di sini ia berdiri sebagai potongan kode di ujung kalimat
              alamat — tidak menjelaskan apa-apa. Di sebelah angka saldo, ia
              menjawab "saldo ini milik meter yang mana", dan itu memang
              satu-satunya pertanyaan yang bisa dijawab sebuah nomor seri.
            */}
            <strong className="text-ink">
              {isi(detailMeter?.label) ?? "Meter aktif"}
            </strong>
            {isi(detailMeter?.alamat) ? ` · ${detailMeter!.alamat}` : null}
            {isi(detailMeter?.zona) ? ` · ${detailMeter!.zona}` : null}
          </p>
        </div>

        {/*
          Tombol aksi: ikon saja di ponsel, ikon + label mulai `sm`.

          Ketiganya sebelumnya memaksakan label penuh di setiap lebar, dan
          pada 390px "Beli Token" serta "Laporkan Gangguan" pecah di tengah
          kata menjadi dua baris — tombolnya tumbuh ke bawah dan barisnya
          terbaca rusak. Menyusut jadi ikon lebih jujur daripada memotong
          kata: ikon yang sama persis dengan yang dipakai di bilah navigasi
          bawah, jadi artinya sudah dikenali sebelum pertama kali ditekan.

          `aria-label` dipasang di SEMUA lebar, bukan hanya saat labelnya
          hilang — pembaca layar membaca atribut itu, bukan apa yang kebetulan
          terlihat pada lebar jendela saat itu.
        */}
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/beli">
            <Button varian="utama" ukuran="sm" aria-label="Beli token">
              <Droplet size={14} aria-hidden />
              <span className="hidden whitespace-nowrap sm:inline">
                Beli Token
              </span>
            </Button>
          </Link>
          <Link href="/token">
            <Button
              varian="sekunder"
              ukuran="sm"
              aria-label="Buka keypad dan tukar token"
            >
              <KeyRound size={14} aria-hidden />
              <span className="hidden whitespace-nowrap sm:inline">
                Keypad &amp; Tukar
              </span>
            </Button>
          </Link>
          <Link href="/bantuan">
            <Button
              varian="bahaya"
              ukuran="sm"
              className="font-bold shadow-sm"
              aria-label="Laporkan gangguan"
            >
              <LifeBuoy size={14} aria-hidden />
              <span className="hidden whitespace-nowrap sm:inline">
                Laporkan Gangguan
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Saldo: satu benda, bukan satu angka ──────────────────────────
       *
       * Dipisahkan dari grid dan diberi lebar penuh. Sebelumnya saldo adalah
       * kartu PERTAMA dari tujuh kartu yang semuanya seukuran dan setingkat,
       * jadi tidak ada yang memberi tahu mata bahwa yang satu ini berbeda —
       * padahal ini satu-satunya angka yang membuat orang membuka halaman.
       */}
      <section className="permukaan-naik relative overflow-hidden p-6 sm:p-8">
        {/* Cahaya yang masuk dari atas-kiri, searah dengan seluruh situs.
            `pointer-events-none` wajib: lapisan ini menutupi tombol di
            bawahnya dan akan menelan kliknya. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "var(--cahaya-permukaan)" }}
        />

        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-stretch sm:gap-10">
          <div className="flex shrink-0 flex-col items-center">
            <BolaAir
              isiL={saldoSekarang}
              kapasitasL={acuanBolaL}
              kritis={saldoMenipis}
              className="h-[208px] w-[208px]"
            />
            <p className="mt-3 text-center font-mono text-[10px] leading-relaxed tracking-wider text-muted uppercase">
              Penuh = {liter(acuanBolaL, 0)}
              <br />
              {targetBulanL > 0 ? "Sebulan pakai Anda" : "Acuan sementara"}
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="eyebrow text-muted">Saldo Air Tersedia</span>
                  {/*
                    Pemilih meter pindah KE SINI dari bilah atas. Di bilah ia
                    melayang tanpa konteks; di sini ia menempel pada angka
                    yang diterangkannya. Warga bermeter tunggal hanya melihat
                    nomor serinya — tidak ada tombol, karena tidak ada yang
                    bisa dipilih.
                  */}
                  <PemilihMeter />
                </div>
                {/*
                  Penanda "Live" hanya dipasang kalau datanya MEMANG hidup.
                  Meter yang terputus tetap mengirim angka terakhir yang
                  diketahui server, dan menandainya live membuat angka basi
                  tampak baru — kesalahan yang paling mahal di halaman ini,
                  karena saldo basi membuat orang mengira airnya masih ada.
                */}
                {luring ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-warn/40 bg-warn-soft px-2 py-0.5 text-[11px] font-bold tracking-wider text-warn uppercase">
                    <WifiOff size={11} />
                    Luring
                  </span>
                ) : (
                  <LivePill teks="Sensor Live" />
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="tabular font-mono text-5xl leading-none font-black tracking-tight text-ink sm:text-6xl">
                  {liter(saldoSekarang, 2)}
                </span>
                {/*
                  `meterKubik()`, BUKAN `(n/1000).toFixed(3)`.
                  `toFixed` memakai titik sebagai pemisah DESIMAL, sementara
                  di Indonesia titik adalah pemisah RIBUAN: saldo 22.377 L
                  tergambar "22.377 m³" dan terbaca dua puluh dua ribu meter
                  kubik — seribu kali lipat dari yang dimaksud, tepat di
                  sebelah angka liter yang benar.
                */}
                <span className="font-mono text-xs text-muted">
                  ({meterKubik(saldoSekarang, 2)})
                </span>
              </div>

              {/*
                Perkiraan sisa hari dihitung dari RATA-RATA tujuh hari, bukan
                dari pemakaian hari ini. Membaginya dengan angka hari ini
                membuat perkiraannya melompat sepanjang hari — pukul enam pagi
                pemakaiannya masih nol dan sisanya terbaca ratusan hari, lalu
                menyusut tiap kali keran dibuka. Rata-rata tidak punya cacat
                itu, dan tetap angka warga sendiri.
              */}
              <p className="mt-3 max-w-prose text-sm text-muted">
                {saldoMenipis
                  ? "Hampir habis. Katup menutup sendiri begitu menyentuh nol liter."
                  : targetHarianL > 0
                    ? `Cukup kira-kira ${Math.max(1, Math.round(saldoSekarang / targetHarianL))} hari lagi pada pemakaian rata-rata Anda.`
                    : "Belum ada cukup riwayat untuk memperkirakan sisa hari."}
              </p>
            </div>

            {/* Alur air. Dibuat CEKUNG: ini saluran yang dilewati air, bukan
                benda yang menumpang di atas kartu. */}
            <div className="cekung mt-6 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">
                  {luring ? "Debit Terakhir Diterima" : "Debit Aliran Saat Ini"}
                </span>
                <span className="tabular font-mono font-bold text-ink">
                  {debit(debitSekarang)}
                </span>
              </div>
              <div className="mt-2">
                <FlowVis lpm={debitSekarang} />
              </div>
              <p className="mt-2 text-[11px] text-muted">
                {luring
                  ? "Meter belum mengirim data baru. Angka ini laporan terakhir yang diterima."
                  : debitSekarang > 0
                    ? "Kran terbuka, air sedang dialirkan ke instalasi rumah Anda."
                    : "Kran tertutup, tidak terdeteksi aliran air."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tiga angka pendamping ── */}
      <div className="berjenjang grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="permukaan-rata angkat p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100 dark:text-brand-700">
              <TrendingDown size={16} />
            </span>
            <span className="eyebrow text-muted">Pemakaian Hari Ini</span>
          </div>
          <p className="tabular mt-3 font-mono text-2xl font-black text-ink">
            {liter(totalHariIniL, 1)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {targetHarianL > 0
              ? `Rata-rata 7 hari: ${liter(targetHarianL, 0)}`
              : "Belum ada rata-rata"}
          </p>
        </div>

        <div className="permukaan-rata angkat p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100 dark:text-brand-700">
              <Calendar size={16} />
            </span>
            <span className="eyebrow text-muted">Bulan Berjalan</span>
          </div>
          {/*
            Angka SUNGGUHAN dari `rentang=bulan`, bukan pemakaian hari ini
            dikalikan 24. Perkalian itu memberi "bulan berjalan" yang berubah
            drastis tiap jam dan tidak pernah cocok dengan tagihan mana pun.
          */}
          <p className="tabular mt-3 font-mono text-2xl font-black text-ink">
            {liter(totalBulanL, 0)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {sekarang.toLocaleDateString("id-ID", { month: "long" })} sampai
            hari ini
          </p>
        </div>

        <div className="permukaan-rata angkat p-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100 dark:text-brand-700">
              <Droplet size={16} />
            </span>
            <span className="eyebrow text-muted">Biaya Bulan Ini</span>
          </div>
          <p className="tabular mt-3 font-mono text-2xl font-black text-ink">
            {rupiah(totalBulanL * TARIF_PER_LITER)}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Rp 7,5 / liter (Gol. Rumah)
          </p>
        </div>
      </div>

      {/* ── Target hemat bulan berjalan ──────────────────────────────────
       *
       * Acuannya rata-rata harian dikali jumlah hari di bulan ini — angka
       * warga sendiri, bukan patokan dari luar. Batangnya dibuat CEKUNG
       * supaya terbaca sebagai bejana yang sedang terisi, sejalan dengan
       * bola saldo di atasnya.
       */}
      {targetHarianL > 0 ? (
        <section className="permukaan p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-bold text-ink">
              Target hemat{" "}
              {sekarang.toLocaleDateString("id-ID", { month: "long" })}
            </h2>
            <span className="tabular font-mono text-sm font-black text-ink">
              {Math.round((totalBulanL / targetBulanL) * 100)}%
            </span>
          </div>

          <div className="cekung mt-3 h-3 overflow-hidden rounded-full p-0">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.min(100, (totalBulanL / targetBulanL) * 100)}%`,
                backgroundImage: melebihiTarget
                  ? "linear-gradient(to bottom, var(--color-warn), var(--color-chart-4-dalam))"
                  : "linear-gradient(to bottom, var(--color-brand-400), var(--color-brand-600))",
              }}
            />
          </div>

          <p className="mt-2 text-[11px] text-muted">
            <strong className="font-mono text-ink">
              {liter(totalBulanL, 0)}
            </strong>{" "}
            dari {liter(targetBulanL, 0)} &middot;{" "}
            {melebihiTarget
              ? "Sudah melewati rata-rata Anda sendiri untuk bulan ini."
              : "Masih di bawah rata-rata Anda sendiri."}
          </p>
        </section>
      ) : null}

      {/* ── Grid Kartu Utama ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Grafik Pemakaian 7 Hari */}
          <div className="permukaan p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-ink">
                  Grafik Pemakaian 7 Hari Terakhir
                </h2>
                <p className="text-xs text-muted">
                  Liter per hari &middot; garis putus = rata-rata Anda sendiri.
                </p>
              </div>
              <Link
                href="/pemakaian"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
              >
                <span>Analisis Penuh</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {!memuatPemakaian ? (
              <GrafikAir
                data={grafik7HariData.labels.map((l, i) => ({
                  label: l,
                  nilai: grafik7HariData.deret[0]?.points[i] ?? 0,
                }))}
                tinggi={210}
                target={targetHarianL}
                labelTarget={`Rata-rata ${liter(targetHarianL, 0)}`}
                format={(n) => liter(n, 0)}
              />
            ) : (
              <div className="cekung h-48 animate-pulse" />
            )}
          </div>

          {/* ── Aktivitas terakhir ──────────────────────────────────────
           *
           * Empat baris, bukan daftar penuh: halaman ini menjawab "apa yang
           * sedang terjadi", bukan "apa saja yang pernah terjadi". Riwayat
           * lengkapnya punya halamannya sendiri, dan tautannya ada di sini.
           */}
          <div className="permukaan p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink">
                Aktivitas terakhir
              </h2>
              <Link
                href="/riwayat"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
              >
                <span>Semua riwayat</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {transaksi.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">
                Belum ada pembelian atau penukaran token.
              </p>
            ) : (
              <ul className="berjenjang space-y-2">
                {transaksi.map((t) => (
                  <li
                    key={t.id}
                    className="permukaan-rata flex items-center justify-between gap-3 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100">
                        {t.jenis === "BELI" ? (
                          <Droplet size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-ink">
                          {t.jenis === "BELI" ? "Beli paket" : "Isi token"}{" "}
                          {liter(t.volumeL, 0)}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          {new Date(t.dibuatPada).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {t.metode ? ` · ${t.metode}` : null}
                        </p>
                      </div>
                    </div>
                    <span className="tabular shrink-0 font-mono text-xs font-black text-ink">
                      {rupiah(t.jumlahRp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Isi Token Cepat + LCD Display Live ── */}
        <div className="space-y-6">
          {/* Layar LCD Live — dibingkai seperti perangkatnya sendiri:
              panel yang MEMEGANG sebuah layar, bukan gambar layar. */}
          <div className="permukaan p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">
                  {isi(detailMeter?.label) ?? "Meter air Anda"}
                </p>
                <p className="truncate font-mono text-[10px] text-muted">
                  {isi(detailMeter?.serial) ?? meterAktif.nomorSeri}
                  {isi(detailMeter?.versiFirmware)
                    ? ` · FW ${detailMeter!.versiFirmware}`
                    : null}
                </p>
              </div>
              {luring ? (
                <span className="shrink-0 rounded-[7px] border border-warn/40 bg-warn-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-warn uppercase">
                  Luring
                </span>
              ) : (
                <span className="shrink-0 rounded-[7px] border border-success/40 bg-success-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-success uppercase">
                  Daring
                </span>
              )}
            </div>

            <span className="eyebrow text-muted">
              {luring ? "Layar meter · data terakhir" : "Layar LCD fisik meter"}
            </span>

            <div className="mt-2">
              <LcdDisplay
                baris1={`S=${saldoSekarang.toFixed(2)}L  ${dataLive?.saklarOn !== false ? "ON" : "OFF"}`}
                baris2={`D=${debitSekarang.toFixed(1)}   V=${(dataLive?.volumeTotalL ?? 0).toFixed(1)}`}
              />
            </div>

            {/*
              Tiga keadaan perangkat yang paling sering ditanyakan saat air
              tidak keluar: saklarnya, katupnya, dan kapan terakhir meternya
              melapor. Sebelumnya ketiganya tidak ada di halaman mana pun,
              jadi satu-satunya cara mengetahuinya adalah mendatangi meternya.
            */}
            <div className="berjenjang mt-4 grid grid-cols-3 gap-2">
              <div className="cekung p-2.5 text-center">
                <p className="font-mono text-[9px] tracking-wider text-muted uppercase">
                  Saklar
                </p>
                <p className="mt-1 font-mono text-xs font-black text-ink">
                  {dataLive?.saklarOn !== false ? "ON" : "OFF"}
                </p>
              </div>
              <div className="cekung p-2.5 text-center">
                <p className="font-mono text-[9px] tracking-wider text-muted uppercase">
                  Relay
                </p>
                <p className="mt-1 font-mono text-xs font-black text-ink">
                  {dataLive?.relay === "AKTIF" ? "Buka" : "Tutup"}
                </p>
              </div>
              <div className="cekung p-2.5 text-center">
                <p className="font-mono text-[9px] tracking-wider text-muted uppercase">
                  Sinkron
                </p>
                <p className="mt-1 font-mono text-xs font-black text-ink">
                  {dataLive?.ts
                    ? new Date(dataLive.ts).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Widget Isi Token Cepat */}
          <div className="permukaan p-5">
            <h2 className="font-display text-base font-bold text-ink">
              Isi Token Cepat
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Masukkan 4–10 digit kode token dari struk pembelian.
            </p>

            {pesanTukar ? (
              <div
                role="alert"
                className={`my-3 rounded-[10px] border p-2.5 text-xs font-medium shadow-[var(--kedalaman-1)] ${
                  pesanTukar.tipe === "sukses"
                    ? "border-success/40 bg-success-soft text-success"
                    : "border-danger/40 bg-danger-soft text-danger"
                }`}
              >
                {pesanTukar.teks}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <TokenField
                nilai={tokenInput}
                onChange={setTokenInput}
                onKirim={handleTukarTokenCepat}
                nonaktif={memuatTukar}
              />

              <Button
                type="button"
                varian="utama"
                blok
                memuat={memuatTukar}
                disabled={tokenInput.length < 4}
                onClick={handleTukarTokenCepat}
              >
                Tukarkan Token
                {!memuatTukar ? <ArrowRight size={16} /> : null}
              </Button>

              {/*
                Aturan jeda ditulis DI DEPAN, bukan muncul sebagai pesan
                galat setelah percobaan kelima. Orang yang sudah terkunci
                sepuluh menit tidak bisa berbuat apa-apa dengan keterangan
                itu; orang yang sedang mengetik ulang kode masih bisa.
              */}
              <p className="text-[11px] leading-relaxed text-muted">
                Salah 5 kali berturut-turut, pengisian token dijeda 10 menit
                demi keamanan.
              </p>

              <div className="pt-1 text-center">
                <Link
                  href="/token"
                  className="text-xs text-brand-700 hover:underline dark:text-accent"
                >
                  Buka simulasi keypad & daftar token tersimpan &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* ── Info PDAM ─────────────────────────────────────────────── */}
          <div className="permukaan p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink">
                Info PDAM
              </h2>
              <Link
                href="/notifikasi"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
              >
                <span>Semua</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {notifikasi.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted">
                Belum ada pengumuman dari PDAM untuk Anda.
              </p>
            ) : (
              <ul className="berjenjang space-y-2">
                {notifikasi.map((n) => (
                  <li key={n.id} className="cekung p-3">
                    <p className="text-xs font-bold text-ink">{n.judul}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">
                      {n.teks}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted">
                      {new Date(n.dibuatPada).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HalamanBeranda() {
  return (
    <Suspense fallback={<LoadingBeranda />}>
      <KontenBeranda />
    </Suspense>
  );
}
