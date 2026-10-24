"use client";

/**
 * Keandalan 30 hari per zona — inti "melacak" di halaman ini.
 *
 * Seluruh bagian halaman di atasnya adalah potret detik ini: peta, daftar
 * zona, panel detail. Yang itu menjawab "sekarang bagaimana". Seksi ini
 * menjawab pertanyaan yang sebenarnya dibawa orang ke halaman status:
 * **"zona saya ini bisa diandalkan atau tidak?"** — dan pertanyaan itu
 * hanya bisa dijawab oleh sebulan ke belakang, bukan oleh satu jepretan.
 *
 * Disusun sebagai DAFTAR BERGARIS, bukan empat kartu membulat: angka ini
 * memang untuk dibandingkan antar zona, dan garis membuatnya terbaca
 * sebagai satu catatan publik.
 *
 * Tiap baris adalah tombol yang memilih zonanya — pilihan yang sama dipakai
 * peta dan panel detail di atas, jadi membaca riwayat lalu ingin melihat
 * letaknya tidak memaksa siapa pun menggulir balik untuk mengklik lagi.
 */

import { Badge, type Nada } from "@/components/ui/badge";
import { BarMini } from "@/components/domain/grafik";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import { Skeleton } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { LegendaStrip, StripHarian } from "./strip-harian";
import { durasi } from "./waktu";
import type { KeandalanZona } from "./tipe";

/**
 * Janji layanan PDAM: air mengalir sekurang-kurangnya 95% waktu dalam
 * sebulan. Dipakai sama persis di angka jaringan, lencana tiap zona, dan
 * penanda pada tiap batang — satu angka, satu arti.
 */
export const TARGET_KEANDALAN = 95;

/**
 * Sumbu batang mulai dari 90%, BUKAN 0%.
 *
 * Keandalan air bergerak di pita 94–99%. Dengan sumbu 0–100, keempat batang
 * tampak sama-sama penuh dan terbaca "semua baik" — justru menyembunyikan
 * selisih yang ingin ditunjukkan. Angka persennya tetap ditulis di sebelah
 * batang, jadi tidak ada yang tertipu oleh panjangnya.
 */
const DASAR_BAR = 90;

const skala = (p: number | null): number | null =>
  p === null ? null : Math.max(0, ((p - DASAR_BAR) / (100 - DASAR_BAR)) * 100);

function nada(p: number | null): Nada {
  if (p === null) return "netral";
  return p >= TARGET_KEANDALAN ? "sukses" : "peringatan";
}

function kata(p: number | null): string {
  if (p === null) return "Angka belum tersedia";
  return p >= TARGET_KEANDALAN ? "Memenuhi janji layanan" : "Di bawah janji layanan";
}

export function SeksiKeandalan({
  zona,
  keandalanJaringanPct,
  hari,
  memuat,
  dipilih,
  onPilih,
}: {
  zona: KeandalanZona[];
  keandalanJaringanPct: number | null;
  hari: number;
  memuat: boolean;
  dipilih: string | null;
  onPilih: (id: string) => void;
}) {
  const meleset = zona.filter(
    (z) => z.keandalanPct !== null && z.keandalanPct < TARGET_KEANDALAN,
  ).length;

  return (
    <section aria-labelledby="judul-keandalan" className="mt-12">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <div className="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <h2
            id="judul-keandalan"
            className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]"
          >
            Keandalan {angka(hari)} hari terakhir
          </h2>
          <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            Berapa bagian waktu air benar-benar mengalir di tiap zona, dihitung
            dari seluruh gangguan dan pekerjaan perbaikan yang tercatat —
            termasuk yang sedang berlangsung saat ini.
          </p>
        </div>

        {/* Angka jaringan sengaja TIDAK sebesar angka utama halaman lain:
            peta di atas sudah menjadi satu-satunya momen mencolok di sini. */}
        <div className="shrink-0 border-l-2 border-brand-500 pl-4">
          <p className="eyebrow text-muted">Rata-rata seluruh zona</p>
          <p className="mt-1.5 flex items-baseline gap-1">
            {memuat ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <AngkaBergerak
                  nilai={keandalanJaringanPct}
                  desimal={1}
                  className={cn(
                    "tabular font-mono text-[2rem] leading-none font-bold",
                    keandalanJaringanPct === null
                      ? "text-muted"
                      : keandalanJaringanPct >= TARGET_KEANDALAN
                        ? "text-success"
                        : "text-warn",
                  )}
                />
                {keandalanJaringanPct === null ? null : (
                  <span className="font-mono text-[15px] font-semibold text-muted">
                    %
                  </span>
                )}
              </>
            )}
          </p>
          <p className="mt-1.5 text-[12px] text-muted">
            janji layanan {TARGET_KEANDALAN}%
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <LegendaStrip />
        {!memuat && meleset > 0 ? (
          <Badge nada="peringatan" titik>
            {angka(meleset)} zona di bawah janji layanan
          </Badge>
        ) : null}
      </div>
      {/* Keterangan skala ditulis SEKALI di sini, bukan di bawah tiap batang.
          Empat kali kalimat yang sama hanya menebalkan halaman tanpa
          menambah satu pun keterangan baru. */}
      <p className="mt-2 text-[12px] text-muted">
        Batang diukur pada skala {angka(DASAR_BAR)}–100% agar selisih antar
        zona terbaca; penanda tipis pada tiap batang adalah janji{" "}
        {TARGET_KEANDALAN}%.
      </p>

      {memuat ? (
        <div className="mt-5 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <ul className="mt-5 border-t border-line">
          {zona.map((z) => (
            <li key={z.id} className="border-b border-line">
              <BarisKeandalan
                zona={z}
                terpilih={z.id === dipilih}
                onPilih={() => onPilih(z.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BarisKeandalan({
  zona,
  terpilih,
  onPilih,
}: {
  zona: KeandalanZona;
  terpilih: boolean;
  onPilih: () => void;
}) {
  const p = zona.keandalanPct;

  /*
   * Nama tombol ditulis sendiri, tidak dibiarkan dirangkai dari isinya.
   *
   * Di dalam baris ini ada strip 30 hari yang sudah punya ringkasannya
   * sendiri; tanpa label ini, pembaca layar menerima nama tombol sepanjang
   * tiga kalimat setiap kali menekan Tab. Isinya tetap dibaca utuh saat
   * pengguna menjelajah baris, dan rincian hariannya tetap tersedia sebagai
   * teks di seksi Riwayat gangguan.
   */
  const label =
    `${zona.nama}: ${p === null ? "keandalan belum tersedia" : `${angka(p, 1)} persen waktu normal`}, ` +
    `${angka(zona.jumlahGangguan)} kali terganggu, total ${durasi(zona.totalJamTerganggu)} tanpa air. ` +
    "Pilih untuk menyorotnya di peta.";

  return (
    <button
      type="button"
      onClick={onPilih}
      aria-pressed={terpilih}
      aria-label={label}
      className={cn(
        "relative block w-full px-4 py-4 text-left transition-colors sm:px-5",
        terpilih ? "bg-brand-50 dark:bg-brand-900/25" : "hover:bg-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          terpilih ? "bg-brand-500" : "bg-transparent",
        )}
      />

      <div className="grid gap-x-7 gap-y-3.5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-display font-bold tracking-[-0.01em]">
              {zona.nama}
            </span>
            <Badge nada={nada(p)}>{kata(p)}</Badge>
          </div>

          <p className="mt-2 flex items-baseline gap-1.5">
            <AngkaBergerak
              nilai={p}
              desimal={1}
              className={cn(
                "tabular font-mono text-[1.75rem] leading-none font-bold",
                p === null
                  ? "text-muted"
                  : p >= TARGET_KEANDALAN
                    ? "text-success"
                    : "text-warn",
              )}
            />
            {p === null ? null : (
              <span className="text-[12.5px] font-medium text-muted">
                waktu normal
              </span>
            )}
          </p>

          <div className="mt-2.5">
            <BarMini
              nilai={skala(p)}
              maks={100}
              tanda={skala(TARGET_KEANDALAN) ?? undefined}
              nada={p !== null && p >= TARGET_KEANDALAN ? "sukses" : "peringatan"}
              className="h-1.5 lg:max-w-[15rem]"
            />
          </div>

          <p className="tabular mt-2.5 font-mono text-[12.5px] text-muted">
            {angka(zona.jumlahGangguan)} kali terganggu ·{" "}
            {durasi(zona.totalJamTerganggu)} tanpa air
          </p>
        </div>

        <StripHarian harian={zona.harian} />
      </div>
    </button>
  );
}
