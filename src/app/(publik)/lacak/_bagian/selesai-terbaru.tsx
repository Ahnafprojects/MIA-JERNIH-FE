import { Badge } from "@/components/ui/badge";
import { KeadaanKosong, Skeleton } from "@/components/ui/keadaan";
import { tanggalJam } from "@/lib/format";
import { jamJanji, lamaWaktu } from "./durasi";
import type { AduanSelesai } from "./tipe";

/**
 * Pengaduan yang baru ditutup — bukti bahwa sistemnya dipakai, bukan etalase.
 *
 * Tiga hal yang dijaga:
 *
 * 1. **Tanpa identitas, dan dikatakan di halamannya.** Tidak ada nama,
 *    alamat, atau kontak siapa pun; zona adalah satuan terkecil yang
 *    ditampilkan. Janji itu ditulis di bawah daftar supaya pembaca tidak
 *    perlu menebaknya sendiri.
 * 2. **Yang terlambat ikut tampil.** Daftar ini adalah laporan terakhir yang
 *    ditutup apa adanya, bukan pilihan yang paling bagus. Karena itu
 *    persentase ketepatan TIDAK dihitung dari delapan baris ini — angkanya
 *    ada di bagian janji waktu, dari seluruh laporan sebulan.
 * 3. **Daftar bergaris, bukan tabel.** Pernah dicoba dengan `Tabel`, dan di
 *    390px kolom terakhir — justru kolom hasilnya — tergeser ke luar
 *    pandangan di balik gulir mendatar. Dengan daftar, tiap baris menyusun
 *    ulang dirinya sendiri dan hasilnya tidak pernah tersembunyi.
 */

export function SelesaiTerbaru({
  daftar,
  memuat,
}: {
  daftar: AduanSelesai[];
  memuat: boolean;
}) {
  // Jumlah yang meleset DIHITUNG dari daftarnya, tidak ditulis di kalimat:
  // kalimat yang menyebut "satu di antaranya" akan diam-diam jadi bohong
  // begitu datanya berganti.
  const telat = daftar.filter((d) => !d.tepatWaktu).length;

  return (
    <section className="mt-12">
      <div aria-hidden className="takar h-2.5 border-t border-line" />

      <h2 className="mt-7 font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
        Yang baru selesai ditangani
      </h2>
      <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
        Laporan terakhir yang ditutup, apa adanya menurut urutan waktu — bukan
        pilihan yang paling bagus.
        {memuat || telat === 0
          ? null
          : ` ${telat} di antaranya melewati janji waktunya, dan tetap ditampilkan.`}
      </p>

      {memuat ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : daftar.length === 0 ? (
        <div className="mt-5 rounded-card border border-line bg-surface">
          <KeadaanKosong
            judul="Belum ada yang ditutup"
            pesan="Belum ada pengaduan yang selesai ditangani dalam beberapa hari terakhir."
          />
        </div>
      ) : (
        <ul className="mt-6 border-t border-line">
          {daftar.map((d) => (
            <li
              key={d.id}
              className="grid grid-cols-2 items-baseline gap-x-5 gap-y-2 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_10rem_9.5rem] sm:items-center"
            >
              <div className="col-span-2 min-w-0 sm:col-span-1">
                <p className="font-medium">{d.kategori}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  Zona {d.zona} ·{" "}
                  <span className="tabular font-mono">
                    selesai {tanggalJam(d.selesaiPada)}
                  </span>
                </p>
              </div>

              <div className="sm:text-right">
                <p className="tabular font-mono text-[13.5px] whitespace-nowrap">
                  {lamaWaktu(d.lamaMenit)}
                </p>
                <p className="tabular mt-0.5 font-mono text-[11.5px] whitespace-nowrap text-muted">
                  janji {jamJanji(d.janjiJam)}
                </p>
              </div>

              {/* Hasil SELALU berkata, tidak pernah warna saja. */}
              <div className="justify-self-end">
                <Badge nada={d.tepatWaktu ? "sukses" : "peringatan"} titik>
                  {d.tepatWaktu ? "Tepat waktu" : "Melewati janji"}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 max-w-[66ch] text-[12.5px] leading-relaxed text-muted">
        Daftar ini anonim: tidak memuat nama, alamat, nomor sambungan, maupun
        kontak siapa pun. Zona adalah satuan wilayah terkecil yang ditampilkan,
        dan satu zona mencakup ribuan rumah.
      </p>
    </section>
  );
}
