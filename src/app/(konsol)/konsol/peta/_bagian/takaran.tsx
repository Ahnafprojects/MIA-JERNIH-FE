"use client";

/**
 * Takaran status — legenda yang sekaligus penyaring.
 *
 * ── Kenapa berbentuk gelas ukur, bukan deretan keping warna ────────────
 *
 * Legenda biasa menjawab "warna ini artinya apa". Pertanyaan yang sebenarnya
 * dipakai petugas tiap pagi adalah "seberapa banyak", dan itu pertanyaan
 * ukuran. Jadi legendanya memang alat ukur: satu pita berskala yang panjang
 * penuhnya adalah SELURUH meter terdaftar, dengan penggaris di bawahnya yang
 * bergaris tiap 500 meter — bentuk yang diambil dari dunia subjeknya sendiri,
 * bukan hiasan yang bisa ditempel di dasbor mana pun.
 *
 * ── Kenapa meter tanpa koordinat ikut masuk pita ───────────────────────
 *
 * Karena mereka ada. Pita yang berhenti di 8.055 akan terbaca sebagai seluruh
 * jaringan, padahal 164 meter lagi tidak ada di peta sama sekali. Mereka
 * mendapat segmen sendiri dengan arsiran, bukan warna — "terhitung, tidak
 * tergambar" — dan selisihnya dijumlahkan terbuka di kaki panel. Menaruhnya
 * di 0,0 supaya jumlahnya genap akan meletakkan 164 rumah di Teluk Guinea.
 */

import { cn } from "@/lib/cn";
import { angka } from "@/lib/format";
import { STATUS_METER, URUTAN_METER } from "./status-meter";
import type { StatusMeter } from "./tipe";

/** Satu garis penggaris per 500 meter; yang bernomor tiap 2.000. */
const LANGKAH_GARIS = 500;
const LANGKAH_ANGKA = 2000;

/** Arsiran "terhitung, tidak tergambar". Token, bukan hex. */
const ARSIR = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--color-line-strong) 0 1.5px, transparent 1.5px 5px)",
} as const;

export interface TakaranProps {
  /** Dihitung dari `pin[]` yang SAMA dengan yang digambar peta. */
  jumlah: Record<StatusMeter, number>;
  pinTergambar: number;
  tanpaKoordinat: number;
  totalMeter: number;
  aktif: StatusMeter[];
  onUbah: (status: StatusMeter) => void;
  onSemua: () => void;
}

export function Takaran({
  jumlah,
  pinTergambar,
  tanpaKoordinat,
  totalMeter,
  aktif,
  onUbah,
  onSemua,
}: TakaranProps) {
  // Pembagi nol hanya mungkin sebelum data tiba, tapi "NaN%" di layar sekali
  // saja sudah cukup untuk membuat seluruh angka di halaman ini diragukan.
  const dasar = totalMeter > 0 ? totalMeter : 1;
  const persen = (n: number) => (n / dasar) * 100;
  const teksPersen = (n: number) => `${angka(persen(n), 1)}%`;

  const garis: number[] = [];
  for (let n = 0; n <= totalMeter; n += LANGKAH_GARIS) garis.push(n);

  const semuaAktif = aktif.length === URUTAN_METER.length;

  return (
    <section
      aria-labelledby="judul-takaran"
      className="overflow-hidden rounded-card border border-line bg-surface"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2
            id="judul-takaran"
            className="font-display text-[15px] font-bold tracking-[-0.02em]"
          >
            Takaran status
          </h2>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Panjang penuh = seluruh meter terdaftar.
          </p>
        </div>
        {semuaAktif ? null : (
          <button
            type="button"
            onClick={onSemua}
            className="shrink-0 rounded-[3px] px-2 py-1 text-[12px] font-semibold text-brand-600 hover:bg-soft"
          >
            Tampilkan semua
          </button>
        )}
      </div>

      {/* ── Pita berskala ───────────────────────────────────────────── */}
      <div className="px-5 pt-5">
        <div
          className="flex h-8 w-full overflow-hidden rounded-[3px] border border-line"
          role="img"
          aria-label={
            URUTAN_METER.map(
              (s) =>
                `${STATUS_METER[s].label} ${angka(jumlah[s])} meter` +
                ` (${teksPersen(jumlah[s])})`,
            ).join(", ") +
            `, tanpa koordinat ${angka(tanpaKoordinat)} meter ` +
            `(${teksPersen(tanpaKoordinat)}), dari ${angka(totalMeter)} meter terdaftar`
          }
        >
          {URUTAN_METER.map((s) => (
            <span
              key={s}
              // Lebar dari data. `minWidth` menjaga segmen 1% tetap terlihat:
              // segmen yang menyusut jadi nol terbaca sebagai nol kejadian.
              style={{ width: `${persen(jumlah[s])}%`, minWidth: "3px" }}
              className={cn(
                "block h-full transition-opacity duration-150",
                STATUS_METER[s].garis,
                s === "normal" && "opacity-55",
                aktif.includes(s) ? "" : "opacity-15",
              )}
            />
          ))}
          <span
            style={{ ...ARSIR, width: `${persen(tanpaKoordinat)}%` }}
            className="block h-full border-l border-line-strong bg-surface-2"
          />
        </div>

        {/*
          Penggaris. Garisnya bukan ornamen: tiap garis 500 meter, jadi lebar
          sebuah segmen bisa DIBACA, bukan hanya dibandingkan.
        */}
        <div aria-hidden className="relative mt-0 h-7">
          {garis.map((n) => {
            const besar = n % LANGKAH_ANGKA === 0;
            const kiri = persen(n);
            const geser =
              kiri < 4
                ? "translateX(0)"
                : kiri > 94
                  ? "translateX(-100%)"
                  : "translateX(-50%)";
            return (
              <span key={n}>
                <span
                  className={cn(
                    "absolute top-0 w-px",
                    besar ? "h-2.5 bg-line-strong" : "h-1.5 bg-line",
                  )}
                  style={{ left: `${kiri}%` }}
                />
                {besar ? (
                  <span
                    className="absolute top-3.5 font-mono text-[10px] text-muted tabular"
                    style={{ left: `${kiri}%`, transform: geser }}
                  >
                    {angka(n)}
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
        <p aria-hidden className="mt-1 text-right text-[10.5px] text-muted">
          meter · satu garis = {angka(LANGKAH_GARIS)}
        </p>
      </div>

      {/* ── Baris legenda, sekaligus tombol saring ──────────────────── */}
      <ul className="mt-3 border-t border-line">
        {URUTAN_METER.map((s) => {
          const arti = STATUS_METER[s];
          const nyala = aktif.includes(s);
          return (
            <li key={s} className="border-b border-line/70 last:border-b-0">
              <button
                type="button"
                aria-pressed={nyala}
                onClick={() => onUbah(s)}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-2.5 text-left",
                  "transition-colors hover:bg-soft motion-reduce:transition-none",
                )}
              >
                {/* Garis takar tegak, motif yang sama dengan lencana dan
                    penanda halaman aktif. Bukan titik bulat. */}
                <span
                  aria-hidden
                  className={cn(
                    "h-7 w-[3px] shrink-0",
                    arti.garis,
                    s === "normal" && "opacity-70",
                    !nyala && "opacity-20",
                  )}
                />
                <span className={cn("min-w-0 flex-1", !nyala && "opacity-55")}>
                  <span className="block text-[13px] font-semibold">
                    {arti.label}
                  </span>
                  <span className="block truncate text-[11.5px] text-muted">
                    {nyala ? arti.arti : "Disembunyikan dari peta"}
                  </span>
                </span>
                <span
                  className={cn("shrink-0 text-right", !nyala && "opacity-55")}
                >
                  <span className="block font-mono text-[13.5px] font-semibold tabular">
                    {angka(jumlah[s])}
                  </span>
                  <span className="block font-mono text-[10.5px] text-muted tabular">
                    {teksPersen(jumlah[s])}
                  </span>
                </span>
              </button>
            </li>
          );
        })}

        <li className="flex items-center gap-3 border-t border-line px-5 py-2.5">
          <span
            aria-hidden
            style={ARSIR}
            className="h-7 w-[3px] shrink-0 bg-surface-2"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-muted">
              Tanpa koordinat
            </span>
            <span className="block text-[11.5px] text-muted">
              Terdaftar, belum dipetakan
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-mono text-[13.5px] font-semibold text-muted tabular">
              {angka(tanpaKoordinat)}
            </span>
            <span className="block font-mono text-[10.5px] text-muted tabular">
              {teksPersen(tanpaKoordinat)}
            </span>
          </span>
        </li>
      </ul>

      {/*
        Selisihnya dijumlahkan terbuka.
        Angka peta yang tidak bisa dijelaskan selalu dianggap karangan, dan
        yang pertama dihitung ulang orang adalah "kenapa pinnya kurang".
      */}
      <p className="border-t border-line bg-silt/60 px-5 py-3 text-[11.5px] leading-relaxed text-muted">
        <span className="font-mono font-semibold text-ink tabular">
          {angka(pinTergambar)}
        </span>{" "}
        pin tergambar +{" "}
        <span className="font-mono font-semibold text-ink tabular">
          {angka(tanpaKoordinat)}
        </span>{" "}
        tanpa koordinat ={" "}
        <span className="font-mono font-semibold text-ink tabular">
          {angka(totalMeter)}
        </span>{" "}
        meter terdaftar.
      </p>
    </section>
  );
}
