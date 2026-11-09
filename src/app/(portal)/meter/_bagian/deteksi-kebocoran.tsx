import { Badge } from "@/components/ui/badge";
import { GrafikGaris } from "@/components/domain/grafik";
import { liter } from "@/lib/format";

/**
 * Deteksi kebocoran dini hari.
 *
 * ── Kenapa lencananya dihitung, bukan ditulis ─────────────────────────
 *
 * Versi sebelumnya memasang `<Badge nada="sukses">Saluran Rapat</Badge>`
 * secara tetap: hijau untuk setiap warga, pada setiap keadaan, termasuk
 * ketika tidak ada satu pun data yang diperiksa. Dipasangkan dengan grafik
 * yang isinya tujuh angka nol yang juga ditulis mati, halaman ini
 * menyatakan "saluran rapat" tanpa pernah mengukur apa pun.
 *
 * Itu kegagalan terburuk yang bisa dimiliki bagian ini. Kartu kosong
 * membuat orang bertanya; kartu hijau membuat orang berhenti bertanya —
 * dan ia berhenti bertanya justru pada saat rumahnya mungkin sedang bocor.
 *
 * ── Dasar, bukan puncak ───────────────────────────────────────────────
 *
 * Yang menuduh adalah malam paling SEPI. Satu malam tinggi bisa berarti ada
 * yang mandi tengah malam; yang tidak bisa dijelaskan selain kebocoran
 * adalah dasar yang tidak pernah menyentuh nol, malam demi malam.
 */
export function DeteksiKebocoran({
  dataDeteksiKebocoran,
}: {
  dataDeteksiKebocoran: {
    ada: boolean;
    labels: string[];
    deret: { name: string; unit: string; points: number[] }[];
    ambangBocor: number;
    dasar: number;
    puncak: number;
    jumlahMalam: number;
  };
}) {
  const { ada, ambangBocor, dasar, puncak, jumlahMalam } = dataDeteksiKebocoran;

  const dugaanBocor = ada && dasar > ambangBocor;
  const perluDiamati = ada && !dugaanBocor && puncak > ambangBocor;

  return (
    <div className="permukaan p-6">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-ink">
            Deteksi Kebocoran Dini Hari
          </h3>
          <p className="text-xs text-muted">
            Rata-rata pemakaian tengah malam sampai pukul 05.30, saat rumah
            tangga beristirahat.
          </p>
        </div>

        {!ada ? (
          <Badge nada="netral">Belum ada rekaman</Badge>
        ) : dugaanBocor ? (
          <Badge nada="bahaya" titik>
            Dugaan kebocoran
          </Badge>
        ) : perluDiamati ? (
          <Badge nada="peringatan" titik>
            Perlu diamati
          </Badge>
        ) : (
          <Badge nada="sukses" titik>
            Saluran rapat
          </Badge>
        )}
      </div>

      {ada ? (
        <>
          <GrafikGaris
            labels={dataDeteksiKebocoran.labels}
            deret={dataDeteksiKebocoran.deret}
            tinggi={160}
            ambang={ambangBocor}
            labelAmbang={`Ambang bocor (${liter(ambangBocor, 0)}/jam)`}
            /* Sumbu dipaksa mulai dari nol. Dibiarkan menyesuaikan sendiri,
               ia merapat ke pita datanya dan garis ambangnya jatuh di luar
               bingkai — legendanya menjanjikan garis yang tidak pernah
               tergambar. */
            domain={[0, Math.max(puncak, ambangBocor) * 1.25]}
            format={(v) => `${liter(v, 1)}/jam`}
          />

          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            {dugaanBocor ? (
              <>
                Malam paling sepi pun bertahan di{" "}
                <strong className="font-mono text-ink">
                  {liter(dasar, 1)}/jam
                </strong>{" "}
                selama {jumlahMalam} malam terakhir — tidak pernah menyentuh
                nol. Saat semua keran tertutup, pemakaian seharusnya mendekati
                nol; angka yang bertahan menandakan air bergerak tanpa ada yang
                memakainya, biasanya rembesan kloset atau sambungan longgar.
              </>
            ) : perluDiamati ? (
              <>
                Ada malam yang melewati ambang, tetapi malam paling sepi masih{" "}
                <strong className="font-mono text-ink">
                  {liter(dasar, 1)}/jam
                </strong>
                . Itu lebih mungkin pemakaian sungguhan daripada kebocoran —
                pantau beberapa malam lagi.
              </>
            ) : (
              <>
                Selama {jumlahMalam} malam terakhir, pemakaian dini hari
                bertahan di bawah ambang. Tidak ada tanda air bergerak saat
                keran tertutup.
              </>
            )}
          </p>
        </>
      ) : (
        /*
         * Keadaan kosong menyebut SEBABNYA, bukan sekadar "tidak ada data".
         * Orang yang menduga rumahnya bocor perlu tahu apakah ia sedang
         * melihat hasil pemeriksaan atau ketiadaan pemeriksaan.
         */
        <div className="cekung p-6 text-center">
          <p className="text-sm text-muted">
            Belum cukup rekaman per jam dari meter untuk membentuk pola malam.
            Dibutuhkan minimal dua malam dengan catatan antara tengah malam dan
            pukul 05.30.
          </p>
        </div>
      )}
    </div>
  );
}
