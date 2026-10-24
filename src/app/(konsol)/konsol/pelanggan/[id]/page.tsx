"use client";

/**
 * W04 — Konsol: detail satu pelanggan.
 *
 * Halaman ini dibuka setelah petugas menemukan orangnya di daftar, dan
 * hampir selalu karena ada yang akan DILAKUKAN: menutup aliran, menerbitkan
 * token, atau menjawab telepon yang sedang berlangsung. Jadi urutannya
 * mengikuti urutan percakapan itu —
 *
 *   1. siapa dan sedang bagaimana   → kepala + status + aksi cepat
 *   2. apa yang terbaca sekarang    → layar meter hidup, saklar, relay
 *   3. kenapa begitu                → ambang alarm, pemakaian 30 hari
 *   4. apa yang sudah terjadi       → riwayat token, lini masa aktivitas
 *
 * Layar LCD di kolom kanan adalah satu-satunya hal mencolok di halaman ini;
 * sisanya sengaja tenang. Ia juga bukan hiasan: dua barisnya sama persis
 * dengan yang sedang menyala di dinding rumah pelanggan, jadi petugas dan
 * penelepon membaca benda yang sama.
 */

import { Suspense, use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Power,
  PowerOff,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, Panel } from "@/components/ui/card";
import { GrafikBatang } from "@/components/domain/grafik";
import {
  KeadaanGalat,
  KeadaanKosong,
  Pemberitahuan,
  Skeleton,
} from "@/components/ui/keadaan";
import { Kolom, Tabel } from "@/components/ui/tabel";
import useApi from "@/lib/use-api";
import { angka, liter, tanggal, tanggalJam } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  DialogTutupRelay,
  type IsiTutupRelay,
} from "../_bagian/dialog-relay";
import { LayarMeterLive, useBacaanLive } from "../_bagian/meter-live";
import { TabungSaldo } from "../_bagian/tabung";
import {
  AMBANG,
  STATUS_METER,
  nadaSaldo,
  type DetailPelanggan,
  type TokenPelanggan,
} from "../_bagian/tipe";

/**
 * `params` adalah Promise di Next 16, dan membacanya dengan `use()` berarti
 * komponen ini MENANGGUHKAN diri.
 *
 * Dengan `cacheComponents: true` di `next.config.ts`, data tak ter-cache yang
 * dibaca DI LUAR `<Suspense>` membatalkan prerender seluruh rute — Next
 * melaporkannya sebagai galat merah di konsol browser, dan halamannya
 * dikirim lebih lambat karena tidak ada satu bagian pun yang bisa
 * digambar lebih dulu. Batas di bawah ini yang membuat rangka pemuatan
 * terkirim dari server sementara segmen `[id]`-nya diselesaikan.
 *
 * Fallback-nya RANGKA yang sama dengan rangka pengambilan data, bukan layar
 * kosong: dua keadaan menunggu yang berurutan tidak boleh terlihat sebagai
 * dua halaman yang berbeda.
 */
export default function HalamanDetailPelanggan({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
          <RangkaDetail />
        </div>
      }
    >
      <PembacaDetail params={params} />
    </Suspense>
  );
}

function PembacaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, memuat, galat, muatUlang } = useApi<DetailPelanggan>(
    `/api/admin/pelanggan/${encodeURIComponent(id)}`,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
      <Link
        href="/konsol/pelanggan"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted hover:text-brand-600"
      >
        <ArrowLeft size={15} aria-hidden />
        Kembali ke daftar pelanggan
      </Link>

      {galat ? (
        <Card className="mt-6">
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
          <div className="border-t border-line px-6 py-5 text-center">
            <p className="mx-auto max-w-[52ch] text-[13px] leading-relaxed text-muted">
              ID yang diminta:{" "}
              <span className="tabular font-mono font-semibold text-ink">
                {id}
              </span>
              . Nomor pelanggan Jernih berbentuk{" "}
              <span className="tabular font-mono">JRN-10153</span> — periksa
              kembali, atau cari namanya di daftar.
            </p>
            {/* Tautan, bukan tombol ber-`window.location`: jalur keluar dari
                halaman galat harus tetap bekerja sebagai tautan biasa —
                bisa dibuka di tab baru, dan tidak bergantung pada JavaScript
                yang barusan saja gagal mengambil datanya. */}
            <Link
              href="/konsol/pelanggan"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-input border border-line-strong bg-surface px-4 text-sm font-semibold hover:bg-soft"
            >
              Buka daftar pelanggan
            </Link>
          </div>
        </Card>
      ) : memuat || !data ? (
        <RangkaDetail />
      ) : (
        /*
          `key` berisi id pelanggan, dan itu bukan formalitas: `IsiDetail`
          menyimpan keadaan relay dan bacaan meter yang berjalan sendiri.
          Tanpa `key`, berpindah dari satu pelanggan ke pelanggan lain
          memakai ulang komponen yang sama — dan saldo orang sebelumnya
          masih berjalan di layar selama beberapa bingkai.
        */
        <IsiDetail key={data.id} data={data} />
      )}
    </div>
  );
}

function RangkaDetail() {
  return (
    <div className="mt-6 space-y-5">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

function IsiDetail({ data }: { data: DetailPelanggan }) {
  const [relay, setRelay] = useState(data.relayOn);
  const [dialogTutup, setDialogTutup] = useState(false);
  const [kabar, setKabar] = useState<{
    nada: "sukses" | "info" | "peringatan";
    judul: string;
    teks: string;
  } | null>(null);

  const pakai = data.pakaiHarian.points;
  const total30 = useMemo(() => pakai.reduce((t, n) => t + n, 0), [pakai]);
  const rata = pakai.length > 0 ? total30 / pakai.length : null;

  // Air mengalir hanya bila SEMUA syaratnya terpenuhi. Lihat `meter-live.tsx`.
  const mengalir =
    data.saklarOn && relay && data.online && data.debitLpm > 0 && data.saldoL > 0;
  const bacaan = useBacaanLive(data.saldoL, total30, data.debitLpm, mengalir);

  const s = STATUS_METER[data.status];
  const nada = nadaSaldo(bacaan.saldoL);

  function tutupRelay(isi: IsiTutupRelay) {
    /*
     * Perubahan disimpan di state halaman, bukan dikirim ke server: endpoint
     * mutasi relay datang bersama BE#1. Ganti baris ini dengan `PATCH` begitu
     * rutenya ada — dan jangan lupa menghapus state `relay` yang menimpa
     * `data.relayOn`.
     */
    setRelay(false);
    setDialogTutup(false);
    setKabar({
      nada: "peringatan",
      judul: "Perintah tutup aliran dikirim",
      teks: `Alasan: ${isi.alasan}${isi.keterangan ? ` — ${isi.keterangan}` : ""}. ${
        isi.kirimEmail
          ? "Email pemberitahuan dikirim ke pelanggan."
          : "Tanpa email pemberitahuan ke pelanggan."
      } Tercatat di audit log atas nama akun Anda.`,
    });
  }

  function bukaRelay() {
    setRelay(true);
    setKabar({
      nada: "sukses",
      judul: "Perintah buka aliran dikirim",
      teks: "Relay akan terbuka setelah meter menerima perintah. Tercatat di audit log atas nama akun Anda.",
    });
  }

  return (
    <>
      {/* ── 1. Siapa, dan sedang bagaimana ───────────────────────────── */}
      <header className="mt-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="eyebrow text-brand-600">Pelanggan</p>
          <h1 className="mt-1.5 font-display text-[clamp(1.6rem,4vw,2.1rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
            {data.nama}
          </h1>
          {/*
            ID dan zona di satu baris, waktu telemetri di baris sendiri.
            Versi sebelumnya menyatukan ketiganya dengan pemisah "·", dan di
            390px barisnya patah tepat sesudah pemisah — meninggalkan titik
            menggantung di ujung baris seperti salah ketik.
          */}
          <p className="tabular mt-2 font-mono text-[13px] text-muted">
            <span className="font-semibold text-ink">{data.id}</span>
            <span aria-hidden> · </span>
            <span className="font-sans">{data.zona}</span>
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            Telemetri terakhir {tanggalJam(data.terakhirLapor)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge nada={s.nada} titik>
              {s.label}
            </Badge>
            <Badge nada={data.online ? "sukses" : "netral"} titik>
              {data.online ? (
                <>
                  <Wifi size={12} aria-hidden /> Online
                </>
              ) : (
                <>
                  <WifiOff size={12} aria-hidden /> Offline
                </>
              )}
            </Badge>
            <Badge nada={relay ? "sukses" : "bahaya"} titik>
              Relay {relay ? "terbuka" : "tertutup"}
            </Badge>
            {data.adaInsiden ? (
              <Badge nada="bahaya" titik>
                Insiden terbuka
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            varian="sekunder"
            onClick={() =>
              setKabar({
                nada: "sukses",
                judul: "Token baru diterbitkan",
                teks: `Token sekali pakai dikirim ke ${data.nama}. Kodenya tidak ditampilkan di konsol — server hanya mengirimkannya satu kali, ke pelanggan.`,
              })
            }
          >
            <KeyRound size={15} aria-hidden />
            Buat token
          </Button>
          <Button
            varian="sekunder"
            onClick={() =>
              setKabar({
                nada: "sukses",
                judul: "Email dikirim",
                teks: `Ringkasan saldo dan cara isi ulang dikirim ke ${data.nama}.`,
              })
            }
          >
            <Mail size={15} aria-hidden />
            Kirim email
          </Button>
          {relay ? (
            <Button varian="bahaya" onClick={() => setDialogTutup(true)}>
              <PowerOff size={15} aria-hidden />
              Tutup aliran
            </Button>
          ) : (
            <Button onClick={bukaRelay}>
              <Power size={15} aria-hidden />
              Buka aliran
            </Button>
          )}
        </div>
      </header>

      {kabar ? (
        <div className="mt-5">
          <Pemberitahuan nada={kabar.nada} judul={kabar.judul}>
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
              <p className="max-w-[72ch]">{kabar.teks}</p>
              <button
                type="button"
                onClick={() => setKabar(null)}
                className="shrink-0 text-[12.5px] font-semibold underline underline-offset-2"
              >
                Tutup
              </button>
            </div>
          </Pemberitahuan>
        </div>
      ) : null}

      {/* ── Pita KPI liter ───────────────────────────────────────────── */}
      <section aria-label="Angka utama pelanggan" className="mt-7">
        <div aria-hidden className="takar h-1.5" />
        <dl className="grid border-y border-line sm:grid-cols-4">
          <SelKpi
            label="Saldo tersisa"
            nilai={angka(bacaan.saldoL, 2)}
            satuan="L"
            nada={nada}
            kaki={
              <span className="mt-2 block">
                <TabungSaldo saldoL={bacaan.saldoL} />
              </span>
            }
          />
          <SelKpi
            label="Debit saat ini"
            nilai={angka(mengalir ? data.debitLpm : 0, 1)}
            satuan="L/mnt"
            nada={mengalir ? "brand" : "netral"}
            kaki={mengalir ? "Air sedang mengalir" : "Tidak ada aliran"}
            garisKiri
          />
          <SelKpi
            label="Pemakaian 30 hari"
            nilai={angka(total30)}
            satuan="L"
            kaki={`Setara ${angka(total30 / 1000, 2)} m³`}
            garisKiri
          />
          <SelKpi
            label="Rata-rata harian"
            nilai={rata === null ? null : angka(rata, 1)}
            satuan="L/hari"
            kaki="Dari 30 hari terakhir"
            garisKiri
          />
        </dl>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_21rem] lg:items-start">
        {/* ── Kolom utama ───────────────────────────────────────────── */}
        <div className="min-w-0 space-y-5">
          <Panel
            judul="Pemakaian 30 hari terakhir"
            sub="Satu batang satu hari. Hari ke-30 adalah kemarin."
          >
            <GrafikBatang
              labels={data.pakaiHarian.labels}
              deret={[
                { name: "Pemakaian", unit: "L", points: data.pakaiHarian.points },
              ]}
              tinggi={230}
              format={(n) => liter(n, 0)}
              formatSumbu={(n) => angka(n)}
            />
          </Panel>

          <Panel
            judul="Riwayat token"
            sub="Lima token terakhir yang diterbitkan untuk meter ini."
            isiClassName="p-0"
          >
            <TabelToken token={data.token} />
            {/*
              Kode token ditampilkan SEBAGIAN. Server hanya mengirim kode
              lengkap satu kali, tepat setelah pembelian, dan penerimanya
              pelanggan — bukan konsol. Lima digit terakhir cukup untuk
              mencocokkan token yang disebut pelanggan di telepon, dan tidak
              cukup untuk dipakai siapa pun.
            */}
            <p className="border-t border-line px-5 py-3 text-[12px] text-muted">
              Lima digit awal disembunyikan. Kode lengkap hanya pernah ada di
              tangan pelanggan.
            </p>
          </Panel>

          <Panel
            judul="Aktivitas terakhir"
            sub="Yang terbaru di puncak."
          >
            <LiniMasa aktivitas={data.aktivitas} />
          </Panel>
        </div>

        {/* ── Kolom perangkat ───────────────────────────────────────── */}
        <aside className="space-y-5">
          <Panel judul="Layar meter" sub={`Modul 16×2 pada JM-200 · ${data.id}`}>
            <LayarMeterLive
              saldoL={bacaan.saldoL}
              volumeL={bacaan.volumeL}
              debitLpm={data.debitLpm}
              saklarOn={data.saklarOn}
              mengalir={mengalir}
            />
          </Panel>

          <Panel judul="Perangkat" isiClassName="px-5 py-2">
            <dl className="text-[13px]">
              <BarisInfo label="Saklar meter">
                <Badge nada={data.saklarOn ? "sukses" : "netral"} titik>
                  {data.saklarOn ? "ON" : "OFF"}
                </Badge>
              </BarisInfo>
              <BarisInfo label="Relay katup">
                <Badge nada={relay ? "sukses" : "bahaya"} titik>
                  {relay ? "Terbuka" : "Tertutup"}
                </Badge>
              </BarisInfo>
              <BarisInfo label="Koneksi">
                <Badge nada={data.online ? "sukses" : "netral"} titik>
                  {data.online ? "Online" : "Offline"}
                </Badge>
              </BarisInfo>
              <BarisInfo label="Firmware">
                <span className="tabular font-mono font-semibold">
                  v{data.firmware}
                </span>
              </BarisInfo>
              <BarisInfo label="Kalibrasi terakhir">
                {tanggal(data.kalibrasiTerakhir)}
              </BarisInfo>
              <BarisInfo label="Koordinat">
                <span className="tabular font-mono text-[12px]">
                  {data.koordinat[1].toFixed(5)}, {data.koordinat[0].toFixed(5)}
                </span>
              </BarisInfo>
            </dl>
          </Panel>

          <Panel
            judul="Ambang alarm"
            sub="Ambang ini milik firmware meter, bukan setelan konsol."
          >
            <TanggaAlarm saldoL={bacaan.saldoL} alarm={data.alarm} />
          </Panel>
        </aside>
      </div>

      {dialogTutup ? (
        <DialogTutupRelay
          jumlah={1}
          namaTunggal={data.nama}
          onBatal={() => setDialogTutup(false)}
          onKonfirmasi={tutupRelay}
        />
      ) : null}
    </>
  );
}

/* ── Bagian-bagian kecil ──────────────────────────────────────────── */

function SelKpi({
  label,
  nilai,
  satuan,
  nada = "netral",
  kaki,
  garisKiri,
}: {
  label: string;
  nilai: string | null;
  satuan: string;
  nada?: "netral" | "brand" | "peringatan" | "bahaya" | "sukses" | "info";
  kaki?: React.ReactNode;
  garisKiri?: boolean;
}) {
  const warna =
    nada === "bahaya"
      ? "text-danger"
      : nada === "peringatan"
        ? "text-warn"
        : nada === "brand"
          ? "text-brand-600"
          : "text-ink";

  return (
    <div
      className={cn(
        "px-4 py-3 sm:py-4",
        garisKiri && "border-t border-line sm:border-t-0 sm:border-l",
      )}
    >
      <dt className="eyebrow text-muted">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-1.5 sm:mt-2">
        <span
          className={cn(
            "tabular font-mono text-[22px] leading-none font-bold sm:text-[26px]",
            nilai === null ? "text-muted" : warna,
          )}
        >
          {nilai ?? "—"}
        </span>
        {nilai === null ? null : (
          <span className="text-[12.5px] font-medium text-muted">{satuan}</span>
        )}
      </dd>
      {kaki ? (
        <div className="mt-1.5 text-[12px] text-muted">{kaki}</div>
      ) : null}
    </div>
  );
}

function BarisInfo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/70 py-2.5 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

/**
 * Tangga ambang alarm.
 *
 * Ditampilkan sebagai TANGGA MENURUN, bukan tiga lencana sejajar: ketiganya
 * dilalui berurutan saat saldo habis, dan urutan itulah informasinya. Anak
 * tangga yang sedang berlaku ditandai bentuk (garis takar tebal) DAN kata
 * — "Berlaku sekarang" — bukan warna saja.
 */
function TanggaAlarm({
  saldoL,
  alarm,
}: {
  saldoL: number;
  alarm: DetailPelanggan["alarm"];
}) {
  const anak = [
    {
      ambang: AMBANG.ringan,
      judul: "Peringatan saldo tipis",
      arti: "Meter berbunyi pendek, pelanggan dikirimi notifikasi.",
      aktif: alarm.ringan,
    },
    {
      ambang: AMBANG.berat,
      judul: "Peringatan keras",
      arti: "Bunyi panjang berulang. Air masih mengalir.",
      aktif: alarm.berat,
    },
    {
      ambang: AMBANG.tutup,
      judul: "Relay menutup otomatis",
      arti: "Aliran berhenti sampai token baru ditukarkan.",
      aktif: alarm.tertutup,
    },
  ];

  return (
    <div>
      <p className="text-[12.5px] text-muted">
        Saldo sekarang{" "}
        <span className="tabular font-mono font-semibold text-ink">
          {angka(saldoL, 2)} L
        </span>
      </p>
      <ul className="mt-3">
        {anak.map((a) => (
          <li
            key={a.judul}
            className="flex gap-3 border-t border-line py-3 first:border-0 first:pt-0"
          >
            <span
              aria-hidden
              className={cn(
                "mt-0.5 w-[3px] shrink-0 self-stretch",
                a.aktif ? "bg-danger" : "bg-line",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-semibold">{a.judul}</p>
                <p className="tabular shrink-0 font-mono text-[12px] text-muted">
                  ≤ {angka(a.ambang)} L
                </p>
              </div>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">
                {a.arti}
              </p>
              <p
                className={cn(
                  "mt-1 text-[11.5px] font-semibold",
                  a.aktif ? "text-danger" : "text-muted",
                )}
              >
                {a.aktif ? "Berlaku sekarang" : "Belum tercapai"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TabelToken({ token }: { token: TokenPelanggan[] }) {
  const kolom: Kolom<TokenPelanggan>[] = [
    {
      kunci: "kode",
      label: "Kode token",
      render: (t) => (
        <span className="tabular font-mono text-[13px] font-semibold">
          ••••• {t.kode.split(" ")[1] ?? t.kode.slice(-5)}
        </span>
      ),
    },
    {
      kunci: "liter",
      label: "Nilai",
      rata: "kanan",
      render: (t) => (
        <span className="tabular font-mono text-[13px]">{liter(t.liter, 0)}</span>
      ),
    },
    {
      kunci: "pada",
      label: "Diterbitkan",
      sembunyiKecil: true,
      render: (t) => <span className="text-[13px]">{tanggal(t.pada)}</span>,
    },
    {
      kunci: "status",
      label: "Status",
      rata: "kanan",
      render: (t) => (
        <Badge nada={t.dipakai ? "netral" : "sukses"} titik>
          {t.dipakai ? "Sudah ditukar" : "Belum ditukar"}
        </Badge>
      ),
    },
  ];

  return (
    <Tabel
      kolom={kolom}
      data={token}
      kunciBaris={(t) => t.kode}
      lebarMin="22rem"
      kosong={
        <KeadaanKosong
          judul="Belum ada token"
          pesan="Meter ini belum pernah menerima token. Terbitkan satu dari tombol di atas."
        />
      }
    />
  );
}

/**
 * Lini masa aktivitas.
 *
 * Garis tegaknya memakai motif `takar-tegak` — sisi gelas ukur, sama dengan
 * yang dipakai lencana dan kolom air. Ia pembatas waktu, bukan hiasan.
 */
function LiniMasa({
  aktivitas,
}: {
  aktivitas: DetailPelanggan["aktivitas"];
}) {
  if (aktivitas.length === 0) {
    return (
      <KeadaanKosong
        judul="Belum ada aktivitas tercatat"
        pesan="Telemetri, penukaran token, dan perubahan relay akan muncul di sini."
      />
    );
  }

  return (
    <ol className="relative">
      <span
        aria-hidden
        className="takar-tegak absolute top-1 bottom-1 left-[5px] w-px"
      />
      {aktivitas.map((a) => (
        <li key={a.pada} className="relative flex gap-4 pb-4 last:pb-0">
          <span
            aria-hidden
            className="mt-1.5 h-3 w-[3px] shrink-0 translate-x-[4px] bg-brand-500"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium">{a.teks}</p>
            <p className="tabular mt-0.5 font-mono text-[11.5px] text-muted">
              {tanggalJam(a.pada)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
