"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import Link from "next/link";
import {
  Activity,
  Droplet,
  Gauge,
  KeyRound,
  Power,
  Radio,
  ShieldAlert,
  Waves,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { liter, debit, meterKubik, tanggalJam } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MeterDevice } from "@/components/domain/meter-device";
import { SlideToConfirm } from "@/components/ui/slide-to-confirm";
import { GrafikGaris } from "@/components/domain/grafik";

/* ── Bentuk jawaban server ─────────────────────────────────────────────
 *
 * `GET /api/meter/:id` MEMBUNGKUS isinya: `{ meter: {...}, lcd: {...} }`.
 * Menganggapnya rata membuat seluruh keterangan diam-diam `undefined` —
 * tanpa galat, tanpa peringatan, halaman hanya menampilkan teks cadangan
 * selamanya. Jenis kegagalan yang paling sulit terlihat.
 */
interface DataMeterDetail {
  id: string;
  serial: string;
  label?: string | null;
  alamat?: string | null;
  zona?: string | null;
  saldoL: number;
  debitLpm: number;
  volumeTotalL: number;
  relay: "AKTIF" | "NONAKTIF";
  saklarOn: boolean;
  daring: boolean;
  terakhirTerlihat?: string | null;
  versiFirmware?: string | null;
}

interface JawabanMeter {
  meter: DataMeterDetail;
  lcd?: { baris1: string; baris2: string };
}

/**
 * Satu ember pemakaian per jam dari `GET /api/meter/:id/pemakaian`.
 *
 * MENGGANTIKAN `/api/meter/:id/log` sebagai sumber pola malam. Endpoint log
 * menyimpan cuplikan telemetri sesaat dan untuk meter ini benar-benar
 * menjawab `log: []` — dibuktikan langsung ke server. Akibatnya bagian
 * deteksi kebocoran tidak pernah punya apa pun untuk digambar, selamanya,
 * bagi siapa pun: bukan "belum ada data hari ini", melainkan fitur yang
 * tidak pernah menyala.
 *
 * `rentang=bulan` mengirim 216 ember berisi volume per jam, dan 54 di
 * antaranya jatuh di jendela malam. Itu data yang sama berharganya untuk
 * mencari kebocoran: rumah yang semua kerannya tertutup seharusnya mencatat
 * mendekati nol liter per jam.
 *
 * Perhatikan satuannya BERBEDA dari sebelumnya — liter per JAM, bukan liter
 * per menit. Membaginya 60 agar cocok dengan label lama hanya akan
 * menghasilkan angka yang terlihat lebih teliti daripada pengukurannya.
 */
interface EmberPemakaian {
  waktu: string;
  volumeL: number;
}

/**
 * Baris meter apa adanya dari `GET /api/me`.
 *
 * DIAMBIL TERPISAH dari konteks sesi dengan sengaja. `normalisasiMeter()`
 * di `auth-tipe.ts` meringkas tiap meter menjadi lima medan saja, dan
 * `rssi`, `kalibrasi`, `node`, `label`, serta `alamat` ikut terbuang di
 * situ. Keempatnya justru yang dibutuhkan halaman ini. Daripada melebarkan
 * tipe bersama yang dipakai seluruh aplikasi, halaman ini membaca sendiri
 * baris mentahnya — endpointnya sama, hanya tidak diringkas.
 */
interface MeterMentah {
  id: string;
  node?: string | null;
  serial?: string | null;
  label?: string | null;
  alamat?: string | null;
  rssi?: number | null;
  kalibrasi?: number | string | null;
  versiFirmware?: string | null;
  /* Titik pasang meter. Ada di baris mentah tetapi TIDAK di
     `GET /api/meter/:id` — satu lagi medan yang hilang saat diringkas. */
  lat?: number | null;
  lng?: number | null;
  /* Panjang kode token yang diterima meter ini. Angka ini menentukan
     berapa digit yang harus diketik warga di keypad, jadi ia keterangan
     perangkat, bukan sekadar setelan server. */
  panjangToken?: number | null;
}

interface TransaksiRingkas {
  id: string;
  meterId: string;
  jenis: "BELI" | "ISI_TOKEN";
  volumeL: number;
  token?: string | null;
  dibuatPada: string;
}

/**
 * Mengembalikan teks hanya bila benar-benar ada isinya.
 *
 * `??` tidak cukup di sini: `label` pada meter yang belum dinamai berisi
 * STRING KOSONG, bukan `null`, dan string kosong lolos dari `??` lalu
 * tergambar sebagai judul kosong. Yang dinilai keberadaan ISI, bukan
 * keberadaan nilai.
 */
function isi(teks: string | null | undefined): string | null {
  const t = teks?.trim();
  return t ? t : null;
}

/**
 * Jarak waktu dalam kata: "baru saja", "7 menit lalu", "2 hari lalu".
 *
 * Tiap angka di halaman ini adalah CUPLIKAN, bukan nilai hidup — semuanya
 * berasal dari satu laporan terakhir meter. Tanpa penanda umur, saldo yang
 * dibaca dua hari lalu terlihat persis seperti saldo yang dibaca sedetik
 * lalu, dan itu kesalahan yang mahal: orang mengira airnya masih ada.
 *
 * Acuan "sekarang" DITERIMA sebagai argumen, tidak dibaca sendiri dari
 * `Date.now()`. Membacanya di dalam fungsi membuat hasilnya berubah tiap
 * kali komponen digambar ulang tanpa ada yang memintanya, dan pada render
 * server jam yang terbaca adalah jam server — berbeda dari jam peramban,
 * sehingga teksnya berganti sendiri saat hidrasi.
 */
function sejak(iso: string | null | undefined, acuan: number): string | null {
  if (!iso) return null;
  const ms = acuan - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;

  const menit = Math.floor(ms / 60_000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} menit lalu`;

  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;

  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

/*
 * Batas umur sebelum sebuah laporan disebut basi.
 *
 * Firmware melapor jauh lebih sering daripada ini. Dua menit memberi ruang
 * untuk satu laporan yang terlewat tanpa langsung menyatakan meter putus.
 */
const BATAS_BASI_MS = 2 * 60_000;

/** Jendela pengamatan kebocoran: tengah malam sampai menjelang subuh. */
const JAM_MALAM_MULAI = 0;
const JAM_MALAM_SELESAI = 5.5;

/**
 * Ambang pemakaian malam yang dianggap mencurigakan, dalam liter per jam.
 *
 * Rumah yang semua kerannya tertutup seharusnya mencatat mendekati nol.
 * Dua liter per jam dipilih sebagai batas karena ia jelas di atas derau
 * pengukuran tetapi masih di bawah rembesan kloset — sumber kebocoran rumah
 * tangga yang paling sering dan paling mahal. Aliran yang bertahan di atas
 * angka ini sepanjang dini hari berarti air bergerak tanpa ada yang
 * memakainya.
 *
 * Satuannya liter per JAM, mengikuti satuan ember yang dikirim server. Ini
 * bukan ambang yang sama dengan yang dipakai firmware untuk buzzer.
 */
const AMBANG_BOCOR_L_JAM = 2;

/* ── Ubin pembacaan ───────────────────────────────────────────────────
 *
 * Dibuat CEKUNG, bukan menonjol. Di seluruh portal bentuk membawa arti:
 * yang menonjol adalah benda, yang masuk ke dalam adalah wadah yang
 * menampung sesuatu. Ubin ini menampung ANGKA BACAAN dari perangkat di
 * sebelahnya — ia bukan benda tersendiri.
 */
function Ubin({
  ikon,
  nama,
  nilai,
  catatan,
  nada,
}: {
  ikon: React.ReactNode;
  nama: string;
  nilai: string;
  catatan?: string | null;
  nada?: "sukses" | "bahaya" | "muted";
}) {
  const warnaNilai =
    nada === "sukses"
      ? "text-success"
      : nada === "bahaya"
        ? "text-danger"
        : "text-ink";

  return (
    <div className="cekung p-3">
      {/*
        Namanya MEMBUNGKUS, tidak dipenggal. Pada dua kolom di lebar ponsel,
        "Volume total" tidak muat satu baris dan `truncate` memotongnya
        menjadi "VOLUME TOT…" — label yang harus ditebak. Baris kedua tidak
        merusak apa pun: sel dalam satu baris grid sudah sama tinggi.
      */}
      <div className="flex items-start gap-1.5 text-muted">
        <span className="mt-px shrink-0">{ikon}</span>
        <span className="eyebrow leading-tight">{nama}</span>
      </div>
      <p
        className={`tabular mt-1.5 font-mono text-sm font-black ${warnaNilai}`}
      >
        {nilai}
      </p>
      {catatan ? (
        <p className="mt-0.5 truncate text-[10px] text-muted">{catatan}</p>
      ) : null}
    </div>
  );
}

/**
 * Satu baris keterangan perangkat: nama di kiri, nilai di kanan.
 *
 * Dibuat sebagai DAFTAR, bukan ubin tambahan. Keterangan seperti nomor node
 * dan koordinat tidak pernah berubah dan tidak pernah dibaca sambil lalu —
 * orang mencarinya hanya saat menelepon petugas. Memberinya ubin sebesar
 * bacaan sensor akan menyamakan "angka yang harus dipantau" dengan "angka
 * yang disalin sekali seumur hidup", dan itu merusak urutan baca seluruh
 * kartu.
 */
function BarisKeterangan({
  nama,
  nilai,
}: {
  nama: string;
  nilai: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/60 py-1.5 last:border-b-0">
      <span className="shrink-0 text-[11px] text-muted">{nama}</span>
      <span className="truncate text-right font-mono text-[11px] font-semibold text-ink">
        {nilai}
      </span>
    </div>
  );
}

function KontenMeter() {
  const { meter, meterAktif, pilihMeter, muatUlangData } = useAuth();

  const [meterDetail, setMeterDetail] = useState<DataMeterDetail | null>(null);
  const [emberBulan, setEmberBulan] = useState<EmberPemakaian[]>([]);
  const [mentah, setMentah] = useState<MeterMentah[]>([]);
  const [isiToken, setIsiToken] = useState<TransaksiRingkas[]>([]);

  /*
   * Jam acuan untuk menghitung umur laporan.
   *
   * `null` sampai komponen terpasang di peramban, dan itu disengaja: render
   * server tidak boleh ikut menebak waktu. Kalau server menulis "2 hari lalu"
   * sementara peramban menghitung "3 hari lalu", React menemukan dua hasil
   * berbeda untuk markah yang sama dan melaporkan ketidakcocokan hidrasi.
   * Selama masih `null`, umurnya cukup tidak ditulis.
   */
  const [jamAcuan, setJamAcuan] = useState<number | null>(null);

  // Modal konfirmasi ubah relay
  const [modalRelay, setModalRelay] = useState<"buka" | "tutup" | null>(null);
  const [alasanRelay, setAlasanRelay] = useState("");
  const [memuatAksi, setMemuatAksi] = useState(false);
  const [pesanAksi, setPesanAksi] = useState<{
    tipe: "sukses" | "galat";
    teks: string;
  } | null>(null);

  const ambilDetailMeter = useCallback(async (meterId: string) => {
    try {
      const res = await api<JawabanMeter>(`/api/meter/${meterId}`);
      setMeterDetail(res.meter);
    } catch {
      // Jajak pendapat berkala — kegagalan satu putaran tidak diumumkan.
    }
  }, []);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    /*
     * Seluruh pengambilan awal dibungkus satu fungsi async.
     *
     * Memanggil `ambilDetailMeter()` langsung di badan efek membuat
     * `setState` berjalan serentak dengan efeknya dan memicu render
     * berantai — persis yang dilarang aturan lint proyek ini. Di dalam
     * fungsi async, setState baru terjadi setelah `await`, jadi render
     * pertamanya sudah selesai.
     *
     * Baris mentah dan riwayat token diambil SEKALI per pergantian meter,
     * bukan ikut jajak pendapat lima detik: kalibrasi dan nomor node tidak
     * pernah berubah sendiri, dan menariknya berulang hanya menambah lalu
     * lintas tanpa menambah informasi apa pun.
     */
    (async () => {
      await ambilDetailMeter(meterAktif.id);
      if (aktif) setJamAcuan(Date.now());

      try {
        const me = await api<{ meter: MeterMentah[] }>("/api/me");
        if (aktif) setMentah(me.meter ?? []);
      } catch {
        // Keterangan perangkat bersifat pelengkap; halaman tetap berguna.
      }

      try {
        const t = await api<{ rows: TransaksiRingkas[] }>(
          "/api/transaksi?page=1&perPage=20",
        );
        if (aktif) setIsiToken(t.rows ?? []);
      } catch {
        // Idem.
      }

      /*
       * Ember pemakaian diambil SEKALI, bukan tiap lima detik.
       *
       * Isinya volume per jam selama sebulan; satu jam tidak akan pernah
       * berubah dua kali dalam lima detik, jadi menariknya berulang hanya
       * memindahkan 216 titik lewat jaringan tanpa menambah satu pun
       * informasi baru.
       */
      try {
        const p = await api<{ deret: EmberPemakaian[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=bulan`,
        );
        if (aktif) setEmberBulan(p.deret ?? []);
      } catch {
        // Pola malam bersifat pelengkap; halaman tetap berguna tanpanya.
      }
    })();

    const interval = setInterval(() => {
      void ambilDetailMeter(meterAktif.id);
      // Jam acuan ikut maju tiap putaran, supaya "7 menit lalu" tidak
      // membeku di angka yang terbaca saat halaman pertama dibuka.
      setJamAcuan(Date.now());
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [meterAktif, ambilDetailMeter]);

  const handleEksekusiRelay = async () => {
    if (!meterDetail || !modalRelay || alasanRelay.trim().length < 3) return;

    setMemuatAksi(true);
    setPesanAksi(null);

    try {
      await api(`/api/meter/${meterDetail.id}/relay`, {
        method: "POST",
        body: JSON.stringify({ aksi: modalRelay, alasan: alasanRelay.trim() }),
      });

      setPesanAksi({
        tipe: "sukses",
        teks: `Perintah ${modalRelay === "buka" ? "membuka" : "menutup"} katup terkirim ke meter dan tercatat di audit log.`,
      });
      setModalRelay(null);
      setAlasanRelay("");
      await muatUlangData();
      void ambilDetailMeter(meterDetail.id);
    } catch (err) {
      setPesanAksi({
        tipe: "galat",
        teks:
          err instanceof ApiError
            ? err.message
            : "Gagal mengubah katup relay meter.",
      });
    } finally {
      setMemuatAksi(false);
    }
  };

  /* Keterangan perangkat yang hanya ada di baris mentah `/api/me`. */
  const detailMentah = useMemo(
    () => mentah.find((m) => m.id === meterAktif?.id) ?? null,
    [mentah, meterAktif?.id],
  );

  /*
   * Pola debit dini hari, disusun dari cuplikan telemetri yang jatuh di
   * jendela malam.
   *
   * TIDAK ADA angka yang dikarang di sini. Server menyimpan 20 cuplikan
   * terakhir, dan kalau tidak satu pun jatuh antara tengah malam dan 05.30,
   * hasilnya memang kosong — halaman mengatakannya terus terang alih-alih
   * menggambar garis datar nol yang terbaca sebagai "sudah diperiksa, aman".
   * Garis palsu di bagian deteksi kebocoran adalah hal paling berbahaya yang
   * bisa ditampilkan halaman ini.
   */
  const polaMalam = useMemo(() => {
    /*
     * Dikelompokkan PER MALAM, bukan per jam.
     *
     * Satu titik per jam selama sembilan malam menghasilkan 54 titik yang
     * naik-turun mengikuti kebiasaan tidur, dan pola kebocoran tenggelam di
     * dalamnya. Yang menandai kebocoran bukan satu jam yang tinggi,
     * melainkan DASAR yang tidak pernah menyentuh nol malam demi malam —
     * dan itu baru terbaca kalau tiap malam diringkas menjadi satu angka.
     */
    const perMalam = new Map<string, { total: number; jam: number }>();

    emberBulan.forEach((e) => {
      const t = new Date(e.waktu);
      const jam = t.getHours() + t.getMinutes() / 60;
      if (jam < JAM_MALAM_MULAI || jam > JAM_MALAM_SELESAI) return;

      const kunci = t.toDateString();
      const lama = perMalam.get(kunci) ?? { total: 0, jam: 0 };
      perMalam.set(kunci, { total: lama.total + e.volumeL, jam: lama.jam + 1 });
    });

    const urut = Array.from(perMalam.entries())
      .sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))
      /* Dibatasi 14 malam terakhir. Lebih dari itu label tanggalnya
         berdesakan dan sumbunya berhenti bisa dibaca. */
      .slice(-14);

    const titik = urut.map(([, v]) => Math.round((v.total / v.jam) * 100) / 100);

    return {
      /* Dua malam adalah jumlah terkecil yang masih bisa menunjukkan pola.
         Satu malam hanya sebuah angka, dan satu angka tidak pernah bisa
         membedakan kebocoran dari mandi tengah malam sekali. */
      ada: titik.length >= 2,
      labels: urut.map(([k]) =>
        new Date(k).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
      ),
      titik,
      puncak: titik.reduce((a, v) => Math.max(a, v), 0),
      /* Dasar terendah — angka yang sebenarnya menuduh. Malam paling sepi
         pun tetap di atas ambang berarti ada yang mengalir terus. */
      dasar: titik.length > 0 ? Math.min(...titik) : 0,
      jumlahMalam: titik.length,
    };
  }, [emberBulan]);

  if (!meterAktif) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-xs text-muted">
          Meter air belum terhubung ke akun Anda.
        </p>
        <Link href="/hubungkan-meter" className="mt-4 inline-block">
          <Button varian="utama">Hubungkan Meter</Button>
        </Link>
      </div>
    );
  }

  const saldo = meterDetail?.saldoL ?? meterAktif.saldoLiter ?? 0;
  const saklarOn = meterDetail?.saklarOn !== false;
  const relayAktif = meterDetail?.relay === "AKTIF";
  const debitKini = meterDetail?.debitLpm ?? 0;
  const volumeKini = meterDetail?.volumeTotalL ?? 0;

  const umur =
    jamAcuan === null ? null : sejak(meterDetail?.terakhirTerlihat, jamAcuan);
  const basi =
    jamAcuan !== null && meterDetail?.terakhirTerlihat
      ? jamAcuan - new Date(meterDetail.terakhirTerlihat).getTime() >
        BATAS_BASI_MS
      : false;

  /*
   * Luring ditentukan oleh DUA bukti, bukan satu.
   *
   * Bendera `daring` dari server bisa tertinggal: basis data masih mencatat
   * meter sebagai daring sementara laporan terakhirnya sudah berumur
   * berhari-hari — keadaan itu benar-benar terjadi pada meter demo. Umur
   * laporan bisa diperiksa langsung dan tidak bisa tertinggal, jadi
   * keduanya digabung: cukup salah satu menunjukkan meter tidak terjangkau,
   * halaman berhenti menyebut angkanya mutakhir.
   */
  const terjangkau = meterDetail?.daring !== false && !basi;

  /* Catatan umur dipasang di TIAP ubin saat meter tidak terjangkau: semua
     angka di layar berasal dari satu cuplikan yang sama. */
  const catatanUmur = terjangkau ? null : umur ? `terakhir ${umur}` : null;

  const namaMeter =
    isi(meterDetail?.label) ?? isi(detailMentah?.label) ?? "Meter air Anda";
  const alamatMeter = isi(meterDetail?.alamat);
  const zonaMeter = isi(meterDetail?.zona);
  const kalibrasi = Number(detailMentah?.kalibrasi ?? NaN);
  const rssi = detailMentah?.rssi;

  const logIsiToken = isiToken.filter((t) => t.meterId === meterAktif.id);

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Kepala halaman ───────────────────────────────────────────── */}
      <div className="border-b border-line pb-4">
        <span className="font-mono text-xs font-semibold tracking-wider text-brand-700 uppercase dark:text-accent">
          Perangkat & Kontrol
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Meter saya
        </h1>
        {/*
          Nama meter ikut ditulis di sini, bukan hanya di pemilih di bawah.
          Pemilih tidak digambar saat warga cuma punya satu meter, dan tanpa
          baris ini namanya tidak muncul di mana pun pada kasus yang justru
          paling umum.
        */}
        <p className="mt-1 text-xs text-muted">
          <strong className="text-ink">{namaMeter}</strong>
          {alamatMeter ? ` · ${alamatMeter}` : null}
          {zonaMeter ? ` · Zona ${zonaMeter}` : null}
        </p>

        {/*
          Pemilih meter hanya digambar bila warga benar-benar punya lebih
          dari satu. Satu tombol yang tidak bisa dipilih selain dirinya
          sendiri hanya menambah hal untuk dibaca.
        */}
        {meter.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {meter.map((m) => {
              const aktif = m.id === meterAktif.id;
              const baris = mentah.find((x) => x.id === m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pilihMeter(m.id)}
                  /* Terpilih MENONJOL, sisanya masuk ke dalam. Perbedaan
                     tinggi terbaca lebih cepat daripada perbedaan warna
                     garis, dan tetap terbaca tanpa membedakan warna. */
                  className={`angkat flex items-center gap-2 rounded-[10px] border px-3 py-2 text-xs ${
                    aktif
                      ? "border-brand-500 bg-brand-50 font-bold text-brand-700 shadow-[var(--kilau-tepi),var(--kedalaman-2)] dark:text-accent"
                      : "border-line bg-surface-2 text-muted shadow-[var(--cekung-dalam)] hover:text-ink"
                  }`}
                >
                  <Droplet size={13} />
                  <span>{isi(baris?.label) ?? "Meter"}</span>
                  <span className="font-mono text-[11px] text-muted">
                    {m.id}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {pesanAksi ? (
        <aside
          role="alert"
          className={`permukaan p-3.5 text-xs font-medium ${
            pesanAksi.tipe === "sukses"
              ? "border-success/40 bg-success-soft text-success"
              : "border-danger/40 bg-danger-soft text-danger"
          }`}
        >
          {pesanAksi.teks}
        </aside>
      ) : null}

      {/* ── Kondisi meter ────────────────────────────────────────────── */}
      <section className="permukaan-naik p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Kondisi meter
            </h2>
            <p className="mt-0.5 font-mono text-[11px] tracking-wider text-muted uppercase">
              {isi(detailMentah?.node) ?? "ESP32"} ·{" "}
              {isi(meterDetail?.serial) ?? meterAktif.nomorSeri}
            </p>
          </div>

          {terjangkau ? (
            <Badge nada="sukses" titik>
              <Wifi size={13} className="mr-1" />
              Daring
            </Badge>
          ) : (
            <Badge nada="peringatan" titik>
              <WifiOff size={13} className="mr-1" />
              Luring{umur ? ` · terakhir ${umur}` : ""}
            </Badge>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex shrink-0 flex-col items-center">
            <MeterDevice
              baris1={`S=${saldo.toFixed(2)}L  ${saklarOn ? "ON" : "OFF"}`}
              baris2={`D=${debitKini.toFixed(1)}   V=${volumeKini.toFixed(1)}`}
              relayAktif={relayAktif}
              buzzer={saldo <= 2 ? "crit" : saldo <= 5 ? "warn" : "off"}
            />
            {/* Lebarnya dilepas dari lebar perangkat: dipatok 19,5rem,
                keterangannya pecah dan menyisakan "(L)" sendirian di baris
                kedua. */}
            <p className="mt-3 text-center font-mono text-[10px] leading-relaxed text-nowrap text-muted">
              S = saldo · D = debit · V = volume total
            </p>
          </div>

          {/*
            Kolom kanan disusun sebagai TUMPUKAN tiga lapis, bukan satu grid
            ubin.

            Versi sebelumnya hanya memasang enam ubin di sini. Perangkat di
            kiri tingginya sekitar 620px sementara dua baris ubin berhenti di
            sekitar 200px, jadi sepertiga kartu ini kosong melompong di sudut
            kanan-bawah — ruang yang cukup besar untuk terbaca sebagai ada
            sesuatu yang gagal dimuat.

            Yang mengisinya bukan ubin yang diregangkan, melainkan dua hal
            yang memang kurang:

              1. SALDO. Angka paling penting di seluruh aplikasi, dan di
                 halaman ini ia hanya ada sebagai teks kecil di dalam layar
                 LCD tiruan. Orang membuka halaman meter justru untuk
                 memeriksanya.
              2. IDENTITAS PERANGKAT. Node, nomor seri, zona, alamat, dan
                 koordinat — yang dibacakan warga saat menelepon petugas,
                 dan sebelumnya tidak ada satu pun di halaman ini.
          */}
          <div className="flex w-full min-w-0 flex-col gap-4">
            {/* ── 1. Saldo ── */}
            <div className="cekung flex flex-wrap items-end justify-between gap-x-4 gap-y-1 p-4">
              <div className="min-w-0">
                <span className="eyebrow text-muted">Saldo air di meter</span>
                <p className="tabular mt-1 font-mono text-3xl leading-none font-black break-all text-ink">
                  {liter(saldo, 2)}
                </p>
              </div>
              <div className="text-right">
                {/*
                  `meterKubik`, bukan `toFixed(3)`. Pemformat bawaan menulis
                  "22.377" dan di Indonesia titik adalah pemisah RIBUAN —
                  angkanya terbaca dua puluh dua ribu meter kubik, seribu
                  kali lipat dari yang sebenarnya. `meterKubik` memakai
                  pemformat id-ID, jadi hasilnya "22,38 m³".
                */}
                <p className="font-mono text-xs text-muted">
                  {meterKubik(saldo, 2)}
                </p>
                {catatanUmur ? (
                  <p className="mt-0.5 text-[10px] text-muted">{catatanUmur}</p>
                ) : null}
              </div>
            </div>

            {/* ── 2. Bacaan sensor ── */}
            <div className="berjenjang grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Ubin
              ikon={<Power size={14} />}
              nama="Saklar fisik"
              nilai={saklarOn ? "ON" : "OFF"}
              catatan={catatanUmur}
              nada={saklarOn ? "sukses" : "muted"}
            />
            <Ubin
              ikon={<Droplet size={14} />}
              nama="Relay"
              nilai={relayAktif ? "Terbuka" : "Tertutup"}
              catatan={catatanUmur}
              nada={relayAktif ? "sukses" : "bahaya"}
            />
            <Ubin
              ikon={<Activity size={14} />}
              nama="Debit"
              nilai={debit(debitKini)}
              catatan={catatanUmur}
            />
            <Ubin
              ikon={<Waves size={14} />}
              nama="Volume total"
              nilai={liter(volumeKini, 1)}
              catatan={catatanUmur}
            />
            <Ubin
              ikon={<Radio size={14} />}
              nama="Firmware"
              nilai={
                isi(meterDetail?.versiFirmware) ??
                isi(detailMentah?.versiFirmware) ??
                "—"
              }
              /*
               * RSSI hanya ditulis bila servernya benar-benar mengirimnya.
               * Halaman versi lama memasang "-68 dBm (Kuat)" sebagai teks
               * tetap, dan angka itu tidak pernah berasal dari mana pun —
               * ia tetap "kuat" bahkan saat meter sudah berhari-hari diam.
               */
              catatan={
                typeof rssi === "number" ? `ESP32 · RSSI ${rssi} dBm` : "ESP32"
              }
            />
            <Ubin
              ikon={<Gauge size={14} />}
              nama="Kalibrasi"
              nilai={
                Number.isFinite(kalibrasi)
                  ? kalibrasi.toLocaleString("id-ID")
                  : "—"
              }
              catatan={
                Number.isFinite(kalibrasi) ? "pulsa per L/mnt" : "belum diatur"
              }
            />
            </div>

            {/* ── 3. Identitas perangkat ── */}
            <div className="permukaan-rata p-4">
              <span className="eyebrow text-muted">Identitas perangkat</span>
              <div className="mt-2">
                <BarisKeterangan
                  nama="Node"
                  nilai={isi(detailMentah?.node) ?? "—"}
                />
                <BarisKeterangan
                  nama="Nomor seri"
                  nilai={isi(meterDetail?.serial) ?? meterAktif.nomorSeri}
                />
                <BarisKeterangan nama="Zona" nilai={zonaMeter ?? "—"} />
                <BarisKeterangan nama="Alamat" nilai={alamatMeter ?? "—"} />
                {/*
                  Koordinat ditulis enam desimal: itu ketelitian sekitar
                  sepuluh sentimeter, dan petugas memakainya untuk menemukan
                  kotak meter di antara rumah yang berdempetan. Dibulatkan
                  lebih pendek, titiknya bisa meleset satu rumah.
                */}
                <BarisKeterangan
                  nama="Koordinat"
                  nilai={
                    typeof detailMentah?.lat === "number" &&
                    typeof detailMentah?.lng === "number"
                      ? `${detailMentah.lat.toFixed(5)}, ${detailMentah.lng.toFixed(5)}`
                      : "—"
                  }
                />
                <BarisKeterangan
                  nama="Panjang token"
                  nilai={
                    typeof detailMentah?.panjangToken === "number"
                      ? `${detailMentah.panjangToken} digit`
                      : "—"
                  }
                />
                <BarisKeterangan
                  nama="Terakhir melapor"
                  nilai={
                    meterDetail?.terakhirTerlihat
                      ? tanggalJam(meterDetail.terakhirTerlihat)
                      : "—"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        `items-start` supaya tiap kartu setinggi isinya sendiri.
        Tanpa itu grid meregangkan keduanya setinggi yang terpanjang, dan
        kartu deteksi kebocoran — yang isinya singkat saat belum ada rekaman
        — menyisakan bidang kosong setinggi setengah layar yang terbaca
        seperti ada sesuatu yang gagal dimuat di situ.
      */}
      {/* ── Deteksi kebocoran ────────────────────────────────────────────
       *
       * Dipindah ke LEBAR PENUH, keluar dari grid dua kolom.
       *
       * Sebelumnya ia berbagi baris dengan "Kontrol aliran", dan keduanya
       * tidak pernah sepadan: kontrol aliran membawa status katup, tombol,
       * dan seluruh daftar alarm, sementara deteksi kebocoran hanya satu
       * grafik. Kolom kirinya karena itu menyisakan bidang kosong panjang di
       * bawah grafik — persis keluhan "bawahnya deteksi kebocoran juga
       * kosong".
       *
       * Lebar penuh juga yang memang dibutuhkan isinya: ini satu-satunya
       * grafik deret waktu di halaman ini, dan empat belas label tanggal
       * tidak muat di setengah lebar tanpa berdesakan.
       */}
      <section className="permukaan p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Deteksi kebocoran
            </h2>
            <p className="text-xs text-muted">
              Rata-rata pemakaian dini hari, 00.00&ndash;05.30 &middot; liter
              per jam
            </p>
          </div>
          {polaMalam.ada ? (
            /*
             * Yang dinilai DASAR, bukan puncak.
             *
             * Satu malam yang tinggi bisa berarti ada yang mandi sebelum
             * subuh — itu pemakaian, bukan kebocoran. Yang menuduh adalah
             * malam PALING SEPI sekalipun tetap di atas ambang: artinya ada
             * air yang mengalir terus-menerus, setiap malam, tanpa
             * terkecuali.
             */
            polaMalam.dasar > AMBANG_BOCOR_L_JAM ? (
              <Badge nada="peringatan" titik>
                Dugaan kebocoran
              </Badge>
            ) : polaMalam.puncak > AMBANG_BOCOR_L_JAM ? (
              <Badge nada="netral" titik>
                Ada aliran malam
              </Badge>
            ) : (
              <Badge nada="sukses" titik>
                Saluran rapat
              </Badge>
            )
          ) : null}
        </div>

        {polaMalam.ada ? (
          <>
            <GrafikGaris
              labels={polaMalam.labels}
              deret={[
                {
                  name: "Rata-rata malam",
                  unit: "L/jam",
                  points: polaMalam.titik,
                },
              ]}
              tinggi={200}
              /*
               * Sumbu DIPAKSA mulai dari nol.
               *
               * Dibiarkan otomatis, Recharts merapatkan sumbu ke rentang
               * datanya sendiri — pada meter ini 8,5–11,2 — dan dua hal
               * rusak sekaligus: garis ambang 2 L/jam jatuh di luar bingkai
               * sehingga legendanya menjanjikan garis yang tidak pernah
               * tergambar, dan naik-turun kecil membesar sampai terbaca
               * seperti gejolak padahal dasarnya rata.
               *
               * Nol adalah angka yang jadi acuan seluruh bagian ini: rumah
               * tanpa kebocoran seharusnya menyentuhnya. Sumbu yang tidak
               * memuat nol menyembunyikan justru perbandingan yang penting.
               */
              domain={[0, Math.max(AMBANG_BOCOR_L_JAM * 2, Math.ceil(polaMalam.puncak * 1.2))]}
              ambang={AMBANG_BOCOR_L_JAM}
              labelAmbang={`Ambang bocor (${liter(AMBANG_BOCOR_L_JAM, 0)}/jam)`}
              format={(v) => `${liter(v, 1)}/jam`}
              formatSumbu={(v) => liter(v, 0)}
            />

            <div className="berjenjang mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="cekung p-3">
                <span className="eyebrow text-muted">Malam paling sepi</span>
                <p
                  className={`tabular mt-1 font-mono text-base font-black ${
                    polaMalam.dasar > AMBANG_BOCOR_L_JAM
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {liter(polaMalam.dasar, 1)}/jam
                </p>
                <p className="mt-0.5 text-[10px] text-muted">
                  Angka inilah yang menuduh
                </p>
              </div>
              <div className="cekung p-3">
                <span className="eyebrow text-muted">Malam paling ramai</span>
                <p className="tabular mt-1 font-mono text-base font-black text-ink">
                  {liter(polaMalam.puncak, 1)}/jam
                </p>
                <p className="mt-0.5 text-[10px] text-muted">
                  Bisa jadi pemakaian biasa
                </p>
              </div>
              <div className="cekung p-3">
                <span className="eyebrow text-muted">Malam terpantau</span>
                <p className="tabular mt-1 font-mono text-base font-black text-ink">
                  {polaMalam.jumlahMalam}
                </p>
                <p className="mt-0.5 text-[10px] text-muted">
                  Dari rekaman per jam
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Saat tidak ada keran yang dibuka, pemakaian seharusnya mendekati
              nol. Dasar yang bertahan di atas garis putus-putus malam demi
              malam menandakan air bergerak tanpa ada yang memakainya —
              biasanya rembesan kloset atau sambungan pipa yang longgar.
              {polaMalam.dasar > AMBANG_BOCOR_L_JAM ? (
                <>
                  {" "}
                  Meter ini belum pernah menyentuh nol di jam tersebut selama{" "}
                  {polaMalam.jumlahMalam} malam terakhir.
                </>
              ) : null}
            </p>

            {polaMalam.dasar > AMBANG_BOCOR_L_JAM ? (
              <Link href="/bantuan" className="mt-3 inline-block">
                <Button varian="sekunder" ukuran="sm">
                  Laporkan dugaan kebocoran
                </Button>
              </Link>
            ) : null}
          </>
        ) : (
          /*
           * Keadaan kosong yang MENJELASKAN, bukan kotak abu-abu.
           *
           * Dibuat MENDATAR — keterangan di kiri, tombol di kanan. Versi
           * tegaknya setinggi 300px dan itulah yang dulu menyisakan lubang;
           * keadaan kosong tidak berhak memakan ruang sebanyak keadaan yang
           * berisi.
           */
          <div className="cekung flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
            <Waves size={22} className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink">
                Pola aliran malam belum bisa disusun
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Jernih belum menerima rekaman pemakaian pada pukul
                00.00&ndash;05.30 dari meter{" "}
                <span className="font-mono">
                  {isi(meterDetail?.serial) ?? meterAktif.nomorSeri}
                </span>
                , jadi belum ada dasar malam yang bisa dibandingkan. Bila Anda
                menduga ada kebocoran, tutup aliran lewat panel di bawah lalu
                laporkan ke PDAM.
              </p>
            </div>
            <Link href="/bantuan" className="shrink-0">
              <Button varian="sekunder" ukuran="sm">
                Laporkan dugaan kebocoran
              </Button>
            </Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* ── Kontrol aliran ─────────────────────────────────────────── */}
        <section className="permukaan p-6">
          <h2 className="font-display text-base font-bold text-ink">
            Kontrol aliran
          </h2>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-[12px] shadow-[var(--kedalaman-2)] ring-1 ring-white/25 ring-inset ${
                relayAktif ? "bg-brand-500 text-white" : "bg-soft text-muted"
              }`}
            >
              <Droplet size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">
                {relayAktif ? "Air mengalir" : "Aliran tertutup"}
              </p>
              <p className="text-[11px] text-muted">
                {relayAktif
                  ? "Relay aktif · saldo tersedia dan saklar ON"
                  : saldo <= 0
                    ? "Relay menutup sendiri karena saldo habis"
                    : !saklarOn
                      ? "Saklar fisik di meter sedang pada posisi OFF"
                      : "Relay nonaktif"}
              </p>
            </div>
          </div>

          <p className="cekung mt-4 p-3 text-[11px] leading-relaxed text-muted">
            Relay hanya mengalirkan air bila saldo lebih dari{" "}
            <strong className="text-ink">0,01 L</strong> DAN saklar fisik pada
            posisi <strong className="text-ink">ON</strong>. Perintah dari web
            membutuhkan meter yang sedang terhubung Wi-Fi.
          </p>

          <div className="mt-4">
            {!terjangkau ? (
              /* Tombol tidak digambar sama sekali saat meter tidak
                 terjangkau. Tombol yang bisa ditekan tetapi perintahnya
                 hilang di jalan lebih buruk daripada tombol yang tidak ada:
                 orang mengira airnya sudah ditutup. */
              <div className="rounded-[10px] border border-warn/40 bg-warn-soft p-3 text-xs">
                <p className="font-semibold text-warn">
                  Meter sedang tidak terhubung
                </p>
                <p className="mt-0.5 text-muted">
                  Perintah katup ditahan sampai meter melapor kembali
                  {umur ? ` (laporan terakhir ${umur})` : ""}. Untuk
                  menghentikan air sekarang, gunakan saklar fisik di meter.
                </p>
              </div>
            ) : relayAktif ? (
              <Button
                varian="bahaya"
                blok
                onClick={() => {
                  setModalRelay("tutup");
                  setAlasanRelay("");
                }}
              >
                Tutup katup — hentikan aliran
              </Button>
            ) : (
              <>
                <Button
                  varian="utama"
                  blok
                  disabled={saldo <= 0.01 || !saklarOn}
                  onClick={() => {
                    setModalRelay("buka");
                    setAlasanRelay("");
                  }}
                >
                  Buka katup — alirkan air
                </Button>
                {saldo <= 0.01 || !saklarOn ? (
                  <p className="mt-2 text-[11px] text-muted">
                    {saldo <= 0.01
                      ? "Isi token dahulu — katup tidak bisa dibuka saat saldo nol."
                      : "Naikkan saklar fisik di meter dahulu."}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </section>

        {/* ── Alarm meter ──────────────────────────────────────────────
         *
         * Dikeluarkan menjadi kartu TERSENDIRI, bukan lagi blok di dalam
         * kartu kontrol aliran. Dua alasan, keduanya terlihat di layar:
         *
         * Pertama, ia bukan kontrol. Seluruh isi kartu di sebelah kiri bisa
         * ditekan dan mengubah sesuatu; daftar ini tidak — ia hidup di dalam
         * firmware dan tidak ada tombol mana pun yang bisa menyentuhnya.
         * Menaruhnya di bawah tombol katup membuatnya terbaca seolah ikut
         * bisa diatur.
         *
         * Kedua, ia yang menyeimbangkan baris ini. Dengan alarm masih di
         * dalamnya, kartu kontrol aliran jauh lebih panjang daripada apa pun
         * yang bisa diletakkan di sebelahnya.
         */}
        <section className="permukaan p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-bold text-ink">
              Alarm meter
            </h2>
            <span className="text-[11px] text-muted">
              Diatur firmware, tidak bisa dimatikan
            </span>
          </div>

          {/*
            Ambangnya DITULIS, bukan diambil dari server, dan itu disengaja:
              angka ini hidup di dalam firmware ESP32 dan tetap berlaku walau
              server mati. Menampilkannya seolah setelan yang bisa diubah
              justru menyesatkan — tidak ada tombol mana pun yang bisa
              membungkam buzzer ini.
            */}
            <ul className="berjenjang mt-3 space-y-2">
              {[
                {
                  ambang: "Saldo ≤ 5 L",
                  laku: "Bip 100 ms setiap 10 detik",
                  aktif: saldo > 2 && saldo <= 5,
                  nada: "text-warn",
                },
                {
                  ambang: "Saldo ≤ 2 L",
                  laku: "Bip 100 ms setiap 2 detik",
                  aktif: saldo > 0 && saldo <= 2,
                  nada: "text-danger",
                },
                {
                  ambang: "Saldo 0 L",
                  laku: "Bunyi terus, relay menutup aliran",
                  aktif: saldo <= 0,
                  nada: "text-danger",
                },
              ].map((a) => (
                <li
                  key={a.ambang}
                  className={`flex items-center justify-between gap-3 rounded-[10px] border p-2.5 text-[11px] ${
                    a.aktif
                      ? "border-danger/40 bg-danger-soft shadow-[var(--kedalaman-1)]"
                      : "border-line bg-surface-2 shadow-[var(--cekung-dalam)]"
                  }`}
                >
                  <span className={`font-mono font-bold ${a.nada}`}>
                    {a.ambang}
                  </span>
                  <span className="text-right text-muted">{a.laku}</span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[11px] text-muted">
              Pengingat lewat aplikasi dan email terpisah dari buzzer ini.
              Ambangnya diatur di{" "}
              <Link
                href="/akun"
                className="font-semibold text-brand-700 hover:underline dark:text-accent"
              >
                halaman Akun
              </Link>
            .
          </p>
        </section>
      </div>

      {/* ── Log meter ──────────────────────────────────────────────────
       *
       * Diambil dari `/api/transaksi`. Yang dicari orang di bagian ini
       * bukan cuplikan telemetri, melainkan kapan token terakhir masuk dan
       * berapa nilainya — dan hanya `/api/transaksi` yang menyimpannya.
       */}
      <section className="permukaan p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink">
            Log meter
          </h2>
          <Link
            href="/riwayat"
            className="text-xs font-semibold text-brand-700 hover:underline dark:text-accent"
          >
            Semua riwayat &rarr;
          </Link>
        </div>

        {logIsiToken.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">
            Belum ada token yang masuk ke meter ini.
          </p>
        ) : (
          <ul className="berjenjang space-y-2">
            {logIsiToken.slice(0, 8).map((t) => (
              <li
                key={t.id}
                className="permukaan-rata flex items-center justify-between gap-3 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100">
                    <KeyRound size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink">
                      {t.jenis === "BELI" ? "Beli token" : "Isi token"}{" "}
                      {liter(t.volumeL, 2)}
                    </p>
                    {/*
                      Kode datang SUDAH bertopeng dari server ("23224 •••••").
                      Jangan pernah mencoba memulihkannya: server memang tidak
                      menyimpan kode utuh, dan satu-satunya salinan lengkap ada
                      di email struk milik warga.
                    */}
                    <p className="truncate font-mono text-[11px] text-muted">
                      {isi(t.token) ?? "kode tersimpan di email"} &rarr;{" "}
                      {t.meterId}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-right font-mono text-[10px] text-muted">
                  {tanggalJam(t.dibuatPada)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Konfirmasi perubahan katup ─────────────────────────────── */}
      {modalRelay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setModalRelay(null)}
            className="motion-aware tirai-masuk fixed inset-0 bg-brand-900/40 backdrop-blur-xs"
            aria-label="Tutup dialog"
          />

          <div className="motion-aware lembar-masuk permukaan-naik relative z-10 w-full max-w-md p-6 shadow-[var(--kilau-tepi),var(--kedalaman-4)]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <ShieldAlert size={18} className="text-warn" />
                <span>
                  Konfirmasi {modalRelay === "tutup" ? "tutup" : "buka"} katup
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalRelay(null)}
                className="grid size-8 place-items-center rounded-[10px] text-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted">
              Perubahan katup memengaruhi pasokan air fisik di rumah Anda.
              Perintahnya dikirim ke firmware meter dan dicatat di{" "}
              <strong className="text-ink">audit log</strong> PDAM.
            </p>

            <div className="my-4">
              <label
                htmlFor="alasan-relay"
                className="mb-1 block text-xs font-semibold text-ink"
              >
                Alasan perubahan (wajib)
              </label>
              <input
                id="alasan-relay"
                type="text"
                placeholder="Contoh: memperbaiki keran wastafel yang bocor"
                value={alasanRelay}
                onChange={(e) => setAlasanRelay(e.target.value)}
                className="cekung h-10 w-full px-3 text-xs text-ink outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-3 pt-2">
              <SlideToConfirm
                onKonfirmasi={handleEksekusiRelay}
                memuat={memuatAksi}
                disabled={alasanRelay.trim().length < 3 || memuatAksi}
                teks={`Geser untuk ${modalRelay === "tutup" ? "menutup" : "membuka"} katup`}
                teksBerhasil="Perintah terkirim"
              />
              <Button
                varian="halus"
                blok
                ukuran="sm"
                onClick={() => setModalRelay(null)}
              >
                Batalkan
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HalamanMeterSaya() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted">
          Memuat kondisi meter...
        </div>
      }
    >
      <KontenMeter />
    </Suspense>
  );
}
