import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { STATUS_METER, URUTAN_STATUS, type DaftarPelanggan } from "./tipe";

/**
 * Pita ringkasan status.
 *
 * Dibuat sebagai PITA BERGARIS, bukan empat kartu membulat: keempat angka
 * ini satu bacaan alat ukur yang sama, dan susunan kartu menyamaratakan
 * "7.129 normal" dengan "87 insiden" padahal yang kedualah alasan orang
 * membuka halaman ini.
 *
 * Angkanya dihitung server SETELAH pencarian dan zona — jadi ia ikut
 * menyempit bersama penyaringnya, dan itu disebutkan di kakinya.
 */
export function PitaStatus({
  data,
  memuat,
}: {
  data: DaftarPelanggan | null;
  memuat: boolean;
}) {
  return (
    <section aria-label="Ringkasan status meter" className="mt-7">
      <div aria-hidden className="takar h-1.5" />
      {/*
        Satu kolom di ponsel, EMPAT mulai `sm` — tidak ada tahap dua kolom.
        Dua kolom memaksa garis pemisahnya berbeda antara baris pertama dan
        kedua, dan tiap penimpaan `sm:border-t-0` yang bertabrakan dengan
        `sm:border-t` adalah garis yang hilang di satu tempat tanpa ada yang
        menyadarinya. Empat angka berderet juga memang lebih benar: ini satu
        bacaan alat ukur, bukan dua pasang.
      */}
      <dl className="grid border-y border-line sm:grid-cols-4">
        {URUTAN_STATUS.map((s, i) => {
          const info = STATUS_METER[s];
          return (
            /*
              Di ponsel tiap angka jadi SATU BARIS mendatar; mulai `sm` ia
              bertumpuk seperti bacaan alat ukur. Susunan tegak yang sama
              di 390px memakan hampir seribu piksel sebelum tabelnya
              terlihat sama sekali — ringkasan yang harus digulir melewati
              tiga layar berhenti menjadi ringkasan. Keterangan arti tiap
              status ikut disembunyikan di sana: katanya sudah ada di
              lencananya.
            */
            <div
              key={s}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3",
                "sm:block sm:py-4",
                i > 0 && "border-t border-line sm:border-t-0 sm:border-l",
              )}
            >
              <dt>
                <Badge nada={info.nada} titik>
                  {info.label}
                </Badge>
              </dt>
              <dd className="flex items-baseline gap-1.5 sm:mt-2.5">
                {memuat ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <>
                    <span className="tabular font-mono text-[24px] leading-none font-bold sm:text-[28px]">
                      {data ? angka(data.jumlahStatus[s]) : "—"}
                    </span>
                    <span className="text-[12.5px] text-muted">meter</span>
                  </>
                )}
              </dd>
              <p className="mt-1.5 hidden max-w-[32ch] text-[12.5px] leading-snug text-muted sm:block">
                {info.arti}
              </p>
            </div>
          );
        })}
      </dl>
      {/*
        Tidak ada stempel "diperbarui pukul …" di sini. Halaman ini di-render
        di server lebih dulu, dan `new Date()` menghasilkan jam yang berbeda
        antara server dan klien — React melaporkannya sebagai ketidakcocokan
        hidrasi, lalu membuang hasil render servernya. Waktu telemetri tiap
        meter tetap ada di halaman detail, di tempat ia memang berarti.
      */}
      <p className="mt-2 text-[12px] text-muted">
        Dihitung dari pelanggan yang cocok dengan pencarian dan zona, sebelum
        saring cepat diterapkan.
      </p>
    </section>
  );
}
