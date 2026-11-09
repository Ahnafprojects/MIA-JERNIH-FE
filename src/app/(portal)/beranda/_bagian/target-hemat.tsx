import { liter } from "@/lib/format";

/**
 * Target hemat bulan berjalan.
 *
 * Acuannya rata-rata harian warga dikali jumlah hari di bulan ini — angka
 * warga sendiri, bukan patokan dari luar. Patokan dari luar berlaku sama
 * untuk rumah berisi dua orang dan rumah berisi delapan, dan salah satunya
 * pasti melanggarnya tiap hari.
 *
 * Batangnya dibuat CEKUNG supaya terbaca sebagai bejana yang sedang terisi,
 * sejalan dengan bola saldo di atasnya.
 */
export function TargetHemat({
  totalBulanL,
  targetBulanL,
  melebihiTarget,
  namaBulan,
}: {
  totalBulanL: number;
  targetBulanL: number;
  melebihiTarget: boolean;
  namaBulan: string;
}) {
  const persen = (totalBulanL / targetBulanL) * 100;

  return (
    <section className="permukaan p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-bold text-ink">
          Target hemat {namaBulan}
        </h2>
        <span className="tabular font-mono text-sm font-black text-ink">
          {Math.round(persen)}%
        </span>
      </div>

      <div className="cekung mt-3 h-3 overflow-hidden rounded-full p-0">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${Math.min(100, persen)}%`,
            backgroundImage: melebihiTarget
              ? "linear-gradient(to bottom, var(--color-warn), var(--color-chart-4-dalam))"
              : "linear-gradient(to bottom, var(--color-brand-400), var(--color-brand-600))",
          }}
        />
      </div>

      <p className="mt-2 text-[11px] text-muted">
        <strong className="font-mono text-ink">{liter(totalBulanL, 0)}</strong>{" "}
        dari {liter(targetBulanL, 0)} &middot;{" "}
        {melebihiTarget
          ? "Sudah melewati rata-rata Anda sendiri untuk bulan ini."
          : "Masih di bawah rata-rata Anda sendiri."}
      </p>
    </section>
  );
}
