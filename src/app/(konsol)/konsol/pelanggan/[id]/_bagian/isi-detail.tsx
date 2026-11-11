import { Panel } from "@/components/ui/card";
import { GrafikBatang } from "@/components/domain/grafik";
import { Pemberitahuan } from "@/components/ui/keadaan";
import { Badge } from "@/components/ui/badge";
import { angka, liter } from "@/lib/format";
import { DialogKonfirmasiMassal, DialogTutupRelay } from "../../_bagian/dialog-relay";
import { LayarMeterLive } from "../../_bagian/meter-live";
import type { DetailPelanggan } from "../../_bagian/tipe";
import { useIsiDetail } from "../_hooks/use-isi-detail";
import { KepalaDetail } from "./kepala-detail";
import { PitaKpiDetail } from "./pita-kpi-detail";
import { TabelToken } from "./tabel-token";
import { LiniMasa } from "./lini-masa";
import { TanggaAlarm } from "./tangga-alarm";
import { BarisInfo } from "./baris-info";

export function IsiDetail({ data }: { data: DetailPelanggan }) {
  const {
    relay,
    dialogTutup,
    setDialogTutup,
    dialogEmail,
    setDialogEmail,
    sibuk,
    kabar,
    setKabar,
    total30,
    rata,
    mengalir,
    bacaan,
    nada,
    tutupRelay,
    bukaRelay,
    kirimEmail,
  } = useIsiDetail(data);

  return (
    <>
      <KepalaDetail
        data={data}
        relay={relay}
        sibuk={sibuk}
        onEmail={() => setDialogEmail(true)}
        onTutup={() => setDialogTutup(true)}
        onBuka={bukaRelay}
      />

      {kabar ? (
        <div className="mt-5">
          <Pemberitahuan nada={kabar.nada} judul={kabar.judul}>
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
              <p className="max-w-[72ch]">{kabar.teks}</p>
              <button
                type="button"
                onClick={() => setKabar(null)}
                className="shrink-0 text-[12.5px] font-semibold underline underline-offset-2"
              >
                Tutup
              </button>
            </div>
          </Pemberitahuan>
        </div>
      ) : null}

      <PitaKpiDetail
        saldoL={bacaan.saldoL}
        nada={nada}
        debitLpm={data.debitLpm}
        mengalir={mengalir}
        total30={total30}
        rata={rata}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_21rem] lg:items-start">
        {/* ── Kolom utama ───────────────────────────────────────────── */}
        <div className="min-w-0 space-y-5">
          <Panel
            judul="Pemakaian 30 hari terakhir"
            sub="Satu batang satu hari. Hari ke-30 adalah kemarin."
          >
            <GrafikBatang
              labels={data.pakaiHarian.labels}
              deret={[
                { name: "Pemakaian", unit: "L", points: data.pakaiHarian.points },
              ]}
              tinggi={230}
              format={(n) => liter(n, 0)}
              formatSumbu={(n) => angka(n)}
            />
          </Panel>

          <Panel
            judul="Riwayat token"
            sub="Sepuluh token terakhir yang diterbitkan untuk meter ini."
            isiClassName="p-0"
          >
            <TabelToken token={data.token} />
            {/*
              Kode token ditampilkan SEBAGIAN. Server hanya mengirim kode
              lengkap satu kali, tepat setelah pembelian, dan penerimanya
              pelanggan — bukan konsol. Lima digit terakhir cukup untuk
              mencocokkan token yang disebut pelanggan di telepon, dan tidak
              cukup untuk dipakai siapa pun.
            */}
            <p className="border-t border-line px-5 py-3 text-[12px] text-muted">
              Lima digit awal disembunyikan. Kode lengkap hanya pernah ada di
              tangan pelanggan.
            </p>
          </Panel>

          <Panel
            judul="Aktivitas terakhir"
            sub="Yang terbaru di puncak."
          >
            <LiniMasa aktivitas={data.aktivitas} />
          </Panel>
        </div>

        {/* ── Kolom perangkat ───────────────────────────────────────── */}
        <aside className="space-y-5">
          <Panel judul="Layar meter" sub={`${data.serial} · ${data.id}`}>
            <LayarMeterLive
              saldoL={bacaan.saldoL}
              volumeL={bacaan.volumeL}
              debitLpm={data.debitLpm}
              saklarOn={data.saklarOn}
              mengalir={mengalir}
            />
          </Panel>

          <Panel judul="Perangkat" isiClassName="px-5 py-2">
            <dl className="text-[13px]">
              <BarisInfo label="Saklar meter">
                <Badge nada={data.saklarOn ? "sukses" : "netral"} titik>
                  {data.saklarOn ? "ON" : "OFF"}
                </Badge>
              </BarisInfo>
              <BarisInfo label="Relay katup">
                <Badge nada={relay ? "sukses" : "bahaya"} titik>
                  {relay ? "Terbuka" : "Tertutup"}
                </Badge>
              </BarisInfo>
              <BarisInfo label="Koneksi">
                <Badge nada={data.online ? "sukses" : "netral"} titik>
                  {data.online ? "Online" : "Offline"}
                </Badge>
              </BarisInfo>
              <BarisInfo label="Nomor seri">
                <span className="tabular font-mono font-semibold">
                  {data.serial}
                </span>
              </BarisInfo>
              <BarisInfo label="Koordinat">
                {/* Meter yang belum dipetakan ditandai tanda hubung. Menulis
                    0,00000 akan menunjuk ke Teluk Guinea, dan teknisi yang
                    membacanya tidak punya cara membedakannya dari koordinat
                    sungguhan. */}
                {data.koordinat ? (
                  <span className="tabular font-mono text-[12px]">
                    {data.koordinat[1].toFixed(5)},{" "}
                    {data.koordinat[0].toFixed(5)}
                  </span>
                ) : (
                  <span className="text-muted">Belum dipetakan</span>
                )}
              </BarisInfo>
            </dl>
          </Panel>

          <Panel
            judul="Ambang alarm"
            sub="Ambang ini milik meter, bukan setelan konsol."
          >
            <TanggaAlarm saldoL={bacaan.saldoL} alarm={data.alarm} />
          </Panel>
        </aside>
      </div>

      {dialogTutup ? (
        <DialogTutupRelay
          jumlah={1}
          namaTunggal={data.nama}
          onBatal={() => setDialogTutup(false)}
          onKonfirmasi={tutupRelay}
        />
      ) : null}

      {dialogEmail ? (
        <DialogKonfirmasiMassal
          judul={`Kirim email pengingat ke ${data.nama}?`}
          sub="Email berisi pengingat memeriksa saldo dan cara mengisi ulang. Email yang sudah terkirim tidak bisa ditarik kembali."
          labelAksi="Kirim sekarang"
          jumlah={1}
          onBatal={() => setDialogEmail(false)}
          onKonfirmasi={kirimEmail}
        />
      ) : null}
    </>
  );
}
