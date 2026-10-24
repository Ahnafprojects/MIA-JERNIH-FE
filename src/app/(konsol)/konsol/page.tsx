"use client";

/**
 * W02 — Dashboard konsol petugas.
 *
 * ── Satu pertanyaan, tiga detik ────────────────────────────────────────
 *
 * Layar ini dipelototi delapan jam sehari oleh orang yang sama, dan setiap
 * kali ia dibuka pertanyaannya persis sama: ADA YANG PERLU DITANGANI
 * SEKARANG ATAU TIDAK? Karena itu urutannya dibalik dari dashboard pada
 * umumnya — jawabannya lebih dulu (pita genting), angka jaringannya
 * menyusul, dan grafik tren baru di bawah. Grafik tidak pernah jadi alasan
 * seseorang mengangkat telepon.
 *
 * Yang padat didahulukan: KPI jadi satu pita bergaris, bukan lima kartu
 * berbayang, supaya tinggi layar yang terbatas diberikan ke tabel live dan
 * dua antrean kerja di rel kanan.
 *
 * ── Kenapa penyegarannya polling, bukan WebSocket ──────────────────────
 *
 * Issue menyebut WebSocket, dan memang ke situ arahnya — tapi kanal WS-nya
 * bagian dari backend yang belum ada (BE). Menuliskan klien WS sekarang
 * berarti menulis klien yang tidak pernah tersambung, lalu menambal
 * "datanya" dengan angka yang dibangkitkan di peramban. Itu bukan live; itu
 * animasi yang menyamar jadi data, dan satu-satunya saat ketahuannya adalah
 * saat angkanya dicocokkan dengan basis data.
 *
 * Jadi yang dipakai pengambilan berkala ke endpoint yang sama. Bentuk
 * antarmukanya sudah benar — nilai berubah tanpa halaman dimuat ulang, isi
 * lama tetap tampil selama yang baru diambil, dan tidak ada yang melompat —
 * jadi menukar sumbernya dengan WS nanti cuma mengganti baris
 * pengambilannya, bukan tata letaknya.
 *
 * ── Dua kebiasaan yang dijaga di seluruh berkas ini ────────────────────
 *
 * - `kpi` adalah ARRAY. Dicari lewat `key` memakai `nilaiKpi()`, tidak
 *   pernah lewat indeks dan tidak pernah dengan mencocokkan `label`.
 * - Tidak ada `NaN`, `undefined`, atau `Infinity` yang boleh sampai ke
 *   layar. Setiap angka lewat `angkaSah()` dulu, dan yang tidak lolos
 *   tampil "—" — bukan 0, karena nol adalah hasil pengukuran.
 */

import { useMemo } from "react";
import { Card, Panel } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import useApi from "@/lib/use-api";
import { angka } from "@/lib/format";
import { nilaiKpi } from "@/types/publik";
import { DenyutSegar, JEDA_SEGAR_DETIK } from "./_bagian/denyut";
import { PitaGenting } from "./_bagian/pita-genting";
import { PitaKpi } from "./_bagian/kpi";
import { StatusJaringan } from "./_bagian/status-jaringan";
import { GrafikSuplai } from "./_bagian/grafik-suplai";
import { TabelLive } from "./_bagian/tabel-live";
import { DaftarBerbunyi, DaftarInsiden } from "./_bagian/antrian";
import { DaftarNrwZona } from "./_bagian/nrw-zona";
import { TokenHariIni } from "./_bagian/token-hari-ini";
import { angkaSah, pasanganCelah, type Dashboard } from "./_bagian/tipe";

export default function HalamanKonsol() {
  const { data, memuat, menyegarkan, galat, muatUlang } = useApi<Dashboard>(
    "/api/admin/dashboard",
  );

  const kpi = data?.kpi ?? [];
  const insiden = data?.insiden ?? [];
  const berbunyi = data?.meterBerbunyi ?? [];

  /*
   * Jumlah TOTAL, bukan panjang daftar yang dikirim.
   *
   * Kedua daftar di rel kanan sengaja dipotong server (enam insiden,
   * delapan meter). Memakai panjangnya sebagai jumlah membuat pita genting
   * mengumumkan "6 insiden" sementara panel di sebelahnya menulis 87 untuk
   * hari yang sama — dan dua angka yang berselisih di satu layar adalah hal
   * pertama yang dihitung ulang orang, lalu seluruh halaman berhenti
   * dipercaya. Panjang daftar hanya dipakai sebagai cadangan terakhir.
   */
  const jumlahInsiden = data
    ? (angkaSah(data.jumlahStatus?.insiden) ?? insiden.length)
    : null;
  const jumlahBerbunyi = data
    ? (angkaSah(data.totalMeterBerbunyi) ?? berbunyi.length)
    : null;

  // Zona yang disebut di pita genting: gabungan dari kedua antrean, tanpa
  // pengulangan, urut supaya kalimatnya tidak berganti susunan tiap muat.
  const zonaTerdampak = Array.from(
    new Set([...insiden, ...berbunyi].map((x) => x.zona).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "id-ID"));

  /*
   * Grafik distabilkan lewat ISI-nya, bukan referensinya.
   *
   * Tiap pengambilan berkala menghasilkan objek baru walau tiap titiknya
   * sama persis, dan Recharts menggambar ulang seluruh deret — garisnya
   * menyapu dari kiri ke kanan tiap dua belas detik tanpa ada satu pun
   * nilai yang berganti. Dengan kunci teks sebagai satu-satunya kebergantungan,
   * objeknya baru berganti kalau angkanya memang berganti.
   */
  const kunciGrafik = JSON.stringify(data?.grafik ?? null);
  const grafik = useMemo(
    () => JSON.parse(kunciGrafik) as Dashboard["grafik"] | null,
    [kunciGrafik],
  );

  const { atas, bawah } = pasanganCelah(grafik?.series);
  const nrwRata = data ? nilaiKpi(kpi, "nrwRataPct") : null;

  if (galat) {
    return (
      <div className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6">
        <Card>
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6">
      {/* ── Kepala halaman ──────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="eyebrow text-brand-600">Pantauan jaringan</p>
          <h2 className="mt-1.5 font-display text-[1.5rem] leading-tight font-bold tracking-[-0.02em]">
            Keadaan hari ini
          </h2>
          <p className="mt-1.5 max-w-[56ch] text-[13.5px] leading-relaxed text-muted">
            Angka di halaman ini diambil ulang setiap {JEDA_SEGAR_DETIK} detik.
            Yang berubah bergerak sendiri; sisanya diam.
          </p>
        </div>

        <DenyutSegar
          memuat={memuat}
          menyegarkan={menyegarkan}
          onSegarkan={muatUlang}
        />
      </header>

      <div aria-hidden className="takar mt-5 h-2.5 border-t border-line" />

      {/* ── Jawaban lebih dulu ──────────────────────────────────────── */}
      <div className="mt-5">
        <PitaGenting
          insiden={jumlahInsiden}
          berbunyi={jumlahBerbunyi}
          zonaTerdampak={zonaTerdampak}
          memuat={memuat}
        />
      </div>

      {/* ── Lima KPI jaringan ───────────────────────────────────────── */}
      <div className="mt-5">
        <PitaKpi kpi={kpi} memuat={memuat} />
      </div>

      {/* ── Isi utama: kerja di kiri, antrean di kanan ──────────────── */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-5">
          <Panel
            judul="Air disuplai dan air tercatat"
            sub="30 hari terakhir · meter kubik per hari"
            aksi={
              nrwRata === null ? null : (
                <Badge
                  nada={
                    nrwRata <= 20
                      ? "sukses"
                      : nrwRata <= 30
                        ? "peringatan"
                        : "bahaya"
                  }
                  titik
                >
                  <span className="tabular font-mono">
                    {angka(nrwRata, 1)}%
                  </span>
                  <span className="ml-1 font-semibold">hilang</span>
                </Badge>
              )
            }
          >
            {memuat ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <GrafikSuplai
                labels={grafik?.labels ?? []}
                atas={atas}
                bawah={bawah}
              />
            )}
          </Panel>

          <Panel
            judul="Pelanggan yang sedang mengalir"
            sub="Diurutkan dari debit terbesar"
            isiClassName="p-0"
          >
            <TabelLive baris={data?.pelangganLive} memuat={memuat} />
          </Panel>

          <Panel
            judul="Kehilangan air per zona"
            sub="Penanda tipis pada batang adalah ambang 20%"
            isiClassName="p-0"
          >
            <DaftarNrwZona zona={data?.nrwPerZona} memuat={memuat} />
          </Panel>
        </div>

        <aside className="min-w-0 space-y-5">
          <Panel
            judul="Status seluruh meter"
            sub="Dihitung dari laporan terakhir tiap meter"
          >
            <StatusJaringan jumlah={data?.jumlahStatus} memuat={memuat} />
          </Panel>

          <Panel
            judul="Meter berbunyi"
            sub="Saldo paling tipis di atas"
            aksi={
              jumlahBerbunyi === null ? null : (
                <Badge nada={jumlahBerbunyi > 0 ? "peringatan" : "netral"}>
                  <span className="tabular font-mono">
                    {angka(jumlahBerbunyi)}
                  </span>
                </Badge>
              )
            }
            isiClassName="p-0"
          >
            <DaftarBerbunyi
              daftar={data?.meterBerbunyi}
              total={jumlahBerbunyi}
              memuat={memuat}
            />
          </Panel>

          <Panel
            judul="Insiden terbaru"
            sub="Laporan yang belum ditutup"
            aksi={
              jumlahInsiden === null ? null : (
                <Badge nada={jumlahInsiden > 0 ? "bahaya" : "netral"}>
                  <span className="tabular font-mono">
                    {angka(jumlahInsiden)}
                  </span>
                </Badge>
              )
            }
            isiClassName="p-0"
          >
            <DaftarInsiden
              daftar={data?.insiden}
              total={jumlahInsiden}
              memuat={memuat}
            />
          </Panel>

          <Panel
            judul="Token hari ini"
            sub="Sejak tengah malam"
            isiClassName="p-0"
          >
            <TokenHariIni
              total={data ? angkaSah(data.tokenHariIni) : null}
              rincian={data?.tokenHariIniDetail}
              memuat={memuat}
            />
          </Panel>
        </aside>
      </div>
    </div>
  );
}
