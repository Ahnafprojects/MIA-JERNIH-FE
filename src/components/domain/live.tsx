import { cn } from "@/lib/cn";

/**
 * Penanda data sensor hidup. Denyut 1,8 detik seperti di pedoman.
 *
 * Bentuknya mengikuti `Badge`: persegi, bukan kapsul, dan penanda denyutnya
 * garis takar tegak, bukan titik bulat. Kapsul + titik adalah bentuk yang
 * sama persis dipakai hampir semua tampilan buatan AI; dua komponen berbeda
 * yang keduanya memakai bentuk itu membuat polanya makin kentara. Lihat
 * catatan panjang di `src/components/ui/badge.tsx`.
 */
export function LivePill({ teks = "Live" }: { teks?: string }) {
  return (
    <span className="motion-aware inline-flex items-center gap-1.5 rounded-[3px] border border-line bg-soft px-2 py-0.5 text-[11px] font-semibold text-muted">
      <span
        aria-hidden
        className="h-2.5 w-[2px] shrink-0 bg-accent"
        style={{ animation: "denyut 1.8s ease-in-out infinite" }}
      />
      {teks}
    </span>
  );
}

/**
 * Debit puncak yang dipakai sebagai acuan panjang batang.
 *
 * Keran rumah tangga terbuka penuh berada di sekitar 12 L/mnt. Dipakai
 * sebagai pembagi supaya panjang batang punya ARTI — sebelumnya batangnya
 * selalu penuh berapa pun debitnya, jadi 0,4 L/mnt dan 9 L/mnt tergambar
 * persis sama dan satu-satunya informasi ada pada angkanya.
 */
const DEBIT_PUNCAK_LPM = 12;

/**
 * Visual aliran air: air di dalam pipa, dilihat dari samping.
 *
 * ── Kenapa bukan garis miring berjalan ────────────────────────────────
 *
 * Bentuk sebelumnya adalah pita bergaris miring yang bergeser — pola yang
 * sama persis dengan tiang pangkas rambut, dan terbaca begitu. Dua hal yang
 * membuatnya gagal: garis miring berjalan tidak pernah menyerupai air, dan
 * kontras antar garisnya begitu tinggi sampai batang itu merebut perhatian
 * dari angka di sebelahnya — padahal angkanya yang penting.
 *
 * Yang menggantikannya meniru bagaimana air sungguhan terlihat di dalam
 * pipa bening: satu bidang yang NYARIS rata, dengan kilau menyapu pelan di
 * atasnya. Air yang mengalir cepat tidak terlihat sebagai pola yang
 * bergerak — terlihat sebagai cahaya yang berubah pada permukaan yang diam.
 *
 * ── Saluran selalu digambar, airnya tidak ─────────────────────────────
 *
 * Pipa kosong tetap terlihat sebagai pipa. Sebelumnya debit nol membuat
 * seluruh batang menghilang, dan ruang kosong terbaca sebagai komponen yang
 * gagal dimuat, bukan sebagai "tidak ada aliran".
 *
 * Animasinya HANYA jalan saat `lpm > 0`. Batang yang terus bergerak padahal
 * debitnya nol adalah kebohongan kecil yang langsung terbaca saat demo:
 * penonton melihat air "mengalir" sementara angkanya 0,0.
 */
export function FlowVis({
  lpm,
  className,
}: {
  lpm: number;
  className?: string;
}) {
  const mengalir = lpm > 0;
  /* Minimal 7%: aliran kecil harus tetap TERLIHAT sebagai aliran. Batang
     setipis satu piksel tidak bisa dibedakan dari pipa kosong. */
  const isi = mengalir
    ? Math.max(7, Math.min(100, (lpm / DEBIT_PUNCAK_LPM) * 100))
    : 0;

  return (
    <div
      className={cn(
        "motion-aware relative h-3 w-full overflow-hidden rounded-full",
        className,
      )}
      style={{
        backgroundColor: "var(--color-surface-2)",
        boxShadow: "var(--cekung-dalam)",
      }}
      role="img"
      aria-label={
        mengalir
          ? `Air mengalir ${lpm} liter per menit`
          : "Tidak ada aliran air"
      }
    >
      {mengalir ? (
        <div
          className="relative h-full overflow-hidden rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${isi}%`,
            backgroundImage:
              "linear-gradient(to bottom, var(--color-brand-400), var(--color-brand-600))",
          }}
        >
          {/* Kilau yang menyapu. Lebarnya 45% dan padam di kedua ujung,
              jadi yang terlihat cahaya lewat — bukan balok terang berjalan. */}
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(100deg, transparent 0%, rgb(255 255 255 / 0.55) 45%, transparent 90%)",
              backgroundSize: "45% 100%",
              backgroundRepeat: "no-repeat",
              animation: "sapu-aliran 2.4s linear infinite",
            }}
          />
          {/* Garis terang di tepi atas: permukaan air yang menghadap cahaya. */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-white/45"
          />
        </div>
      ) : null}
    </div>
  );
}
