import { Skeleton } from "@/components/ui/keadaan";
import { lamaWaktu } from "./durasi";
import type { TahapPenanganan } from "./tipe";

/**
 * Tahapan yang dilalui sebuah laporan, beserta lama tiap tahap.
 *
 * Sengaja memakai idiom yang SAMA PERSIS dengan kronologi pada hasil
 * pelacakan — titik, garis penghubung, judul, waktu. Orang yang membaca
 * bagian ini lebih dulu akan mengenali bentuknya kembali saat nomornya
 * ketemu, dan langsung tahu sedang berdiri di tahap yang mana.
 */

const teksPerkiraan = (t: TahapPenanganan): string =>
  t.perkiraan.jenis === "menit"
    ? `± ${lamaWaktu(t.perkiraan.menit)}`
    : t.perkiraan.teks;

export function AlurPenanganan({
  tahapan,
  tanggapMenit,
  memuat,
}: {
  tahapan: TahapPenanganan[];
  tanggapMenit: number | null;
  memuat: boolean;
}) {
  return (
    <section className="mt-12">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-14">
        <div>
          <h2 className="font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
            Yang terjadi setelah Anda melapor
          </h2>
          <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
            Tahapannya selalu urut, dan seluruhnya terlihat di kronologi laporan
            Anda. Angka di sebelah kanan tiap tahap adalah lamanya pada
            penanganan belakangan ini — perkiraan, bukan janji tersendiri.
          </p>
          {tanggapMenit === null ? null : (
            <p className="mt-4 max-w-[46ch] rounded-input bg-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
              Tiga tahap pertama berjumlah{" "}
              <b className="tabular font-mono text-ink">
                {lamaWaktu(tanggapMenit)}
              </b>
              . Itulah angka &ldquo;rata-rata waktu tanggap&rdquo; pada Rapor
              Kinerja — dihitung sampai petugas ditugaskan, bukan sampai
              pekerjaannya selesai.
            </p>
          )}
        </div>

        {memuat ? (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <ol className="relative space-y-6 pl-7">
            {/* Garis vertikal penghubung langkah — sama dengan kronologi. */}
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-[0.3125rem] w-px bg-line"
            />
            {tahapan.map((t, i) => (
              <li key={t.kunci} className="relative">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-7 flex size-2.5 items-center justify-center rounded-full bg-line-strong"
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                  <p className="font-display text-[15px] font-bold tracking-tight">
                    {/* Penanda bernomor dipakai karena isinya MEMANG urutan. */}
                    <span className="tabular mr-2 font-mono text-[12.5px] font-semibold text-muted">
                      {i + 1}
                    </span>
                    {t.judul}
                  </p>
                  <p className="tabular font-mono text-[12.5px] whitespace-nowrap text-muted">
                    {teksPerkiraan(t)}
                  </p>
                </div>
                <p className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-muted">
                  {t.keterangan}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
