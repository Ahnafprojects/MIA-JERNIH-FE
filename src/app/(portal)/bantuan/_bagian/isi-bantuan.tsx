import type { useBantuan } from "../_hooks/use-bantuan";
import { FormPengaduan } from "./form-pengaduan";
import { TiketSaya } from "./tiket-saya";
import { FaqPdam } from "./faq-pdam";
import { ModalNomorTiket } from "./modal-nomor-tiket";

export function IsiBantuan({ bantuan }: { bantuan: ReturnType<typeof useBantuan> }) {
  return (
    <>
      {bantuan.pesanGalat ? (
        <aside
          role="alert"
          className="rounded-[3px] border border-danger/40 bg-danger/10 p-3.5 text-xs font-medium text-danger"
        >
          {bantuan.pesanGalat}
        </aside>
      ) : null}

      {bantuan.tabAktif === "lapor" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FormPengaduan
              kategori={bantuan.kategori}
              setKategori={bantuan.setKategori}
              deskripsi={bantuan.deskripsi}
              setDeskripsi={bantuan.setDeskripsi}
              lampirkanSensor={bantuan.lampirkanSensor}
              setLampirkanSensor={bantuan.setLampirkanSensor}
              daftarFoto={bantuan.daftarFoto}
              handleUnggahFoto={bantuan.handleUnggahFoto}
              handleHapusFoto={bantuan.handleHapusFoto}
              titikKoordinat={bantuan.titikKoordinat}
              sumberLokasi={bantuan.sumberLokasi}
              nonceLokasi={bantuan.nonceLokasi}
              memuatGps={bantuan.memuatGps}
              galatGps={bantuan.galatGps}
              gagalAmbilLokasiAwal={bantuan.gagalAmbilLokasiAwal}
              handleUbahTitik={bantuan.handleUbahTitik}
              handlePakaiGps={bantuan.handlePakaiGps}
              nomorSeri={bantuan.meterAktif?.nomorSeri}
              memuatKirim={bantuan.memuatKirim}
              onSubmit={bantuan.handleKirimLaporan}
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
              <h3 className="font-display text-sm font-bold text-ink">
                Standar Layanan Publik (SLA)
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Setiap laporan yang masuk memiliki batas waktu respon yang mengikat secara transparan:
              </p>

              <ul className="mt-3 space-y-2 text-xs font-mono">
                <li className="flex justify-between border-b border-line pb-1.5">
                  <span className="text-muted">Kebocoran Pipa:</span>
                  <span className="font-bold text-danger">Maks. 6 Jam</span>
                </li>
                <li className="flex justify-between border-b border-line pb-1.5">
                  <span className="text-muted">Air Tidak Mengalir:</span>
                  <span className="font-bold text-warn">Maks. 12 Jam</span>
                </li>
                <li className="flex justify-between border-b border-line pb-1.5">
                  <span className="text-muted">Kualitas Air & Tekanan:</span>
                  <span className="font-bold text-ink">Maks. 24 Jam</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted">Kerusakan Alat Meter:</span>
                  <span className="font-bold text-ink">Maks. 48 Jam</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[4px] border border-brand-500/30 bg-brand-500/5 p-4 text-xs text-ink leading-relaxed">
              <strong className="text-brand-700 dark:text-accent">Transparansi Lacak Pengaduan:</strong>
              <p className="mt-1 text-muted">
                Setelah mengirim laporan, Anda akan menerima nomor tiket unik. Tiket ini dapat diperiksa kapan saja di halaman publik tanpa perlu masuk.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {bantuan.tabAktif === "tiket" ? (
        <TiketSaya
          daftarTiketSaya={bantuan.daftarTiketSaya}
          memuatTiket={bantuan.memuatTiket}
          onBuatPertama={() => bantuan.setTabAktif("lapor")}
        />
      ) : null}

      {bantuan.tabAktif === "faq" ? <FaqPdam /> : null}

      {bantuan.tiketBerhasil ? (
        <ModalNomorTiket
          nomor={bantuan.tiketBerhasil.nomor}
          validasi={bantuan.tiketBerhasil.validasi}
          sudahSalin={bantuan.sudahSalin}
          onSalin={bantuan.handleSalinNomorTiket}
          onTutup={() => bantuan.setTiketBerhasil(null)}
          onLihatTiket={() => {
            bantuan.setTiketBerhasil(null);
            bantuan.setTabAktif("tiket");
          }}
        />
      ) : null}
    </>
  );
}
