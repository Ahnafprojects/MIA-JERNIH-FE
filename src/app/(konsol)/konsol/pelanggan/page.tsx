"use client";

/**
 * W03 — Konsol: daftar pelanggan.
 *
 * 8.219 pelanggan. Pekerjaan di halaman ini bukan "melihat semuanya"
 * melainkan MENEMUKAN SATU, lalu menindaklanjutinya — kadang satu orang,
 * kadang empat belas sekaligus. Susunannya mengikuti urutan itu:
 *
 *   1. berapa banyak yang sedang bermasalah  → pita ringkasan status
 *   2. persempit                              → cari, zona, urut, keping
 *   3. baca dan bandingkan                    → tabel / daftar bergaris
 *   4. tindak lanjuti                         → bilah aksi massal
 *
 * ── Yang dijaga di berkas ini ────────────────────────────────────────
 *
 * - **Paginasi dari server.** Yang berpindah hanya `?halaman=`. Lihat
 *   `_bagian/paginasi.tsx`.
 * - **Pencarian ditunda 300 ms.** Tanpa tundaan, "Agus Firdaus" adalah dua
 *   belas permintaan ke server dan dua belas kali tabel berkedip.
 * - **Pilihan melintasi halaman**, dan jumlahnya selalu ditulis di depan
 *   mata sebelum aksi massal berjalan.
 * - **Ekspor CSV berlokal Indonesia.** Lihat alasannya di `_bagian/csv.ts`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  KeadaanGalat,
  KeadaanKosong,
  Pemberitahuan,
  Skeleton,
} from "@/components/ui/keadaan";
import useApi from "@/lib/use-api";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { BilahMassal } from "./_bagian/bilah-massal";
import { stempel, unduhCsv, type KolomCsv } from "./_bagian/csv";
import { DaftarPelangganTabel, KotakSemua } from "./_bagian/daftar";
import {
  DialogKonfirmasiMassal,
  DialogTutupRelay,
  type IsiTutupRelay,
} from "./_bagian/dialog-relay";
import { Paginasi } from "./_bagian/paginasi";
import { Penyaring } from "./_bagian/penyaring";
import {
  STATUS_METER,
  URUTAN,
  URUTAN_STATUS,
  type BarisPelanggan,
  type DaftarPelanggan,
  type SaringKunci,
} from "./_bagian/tipe";

/** Kolom berkas unduhan. Urutannya sama dengan yang dibaca di layar. */
const KOLOM_CSV: KolomCsv<BarisPelanggan>[] = [
  { label: "ID pelanggan", nilai: (b) => b.id },
  { label: "Nama", nilai: (b) => b.nama },
  { label: "Zona", nilai: (b) => b.zona },
  { label: "Saldo (L)", nilai: (b) => b.saldoL, desimal: 2 },
  { label: "Debit (L/mnt)", nilai: (b) => b.debitLpm, desimal: 1 },
  { label: "Saklar ON", nilai: (b) => b.saklarOn },
  { label: "Relay terbuka", nilai: (b) => b.relayOn },
  { label: "Online", nilai: (b) => b.online },
  { label: "Ada insiden", nilai: (b) => b.adaInsiden },
  { label: "Status", nilai: (b) => STATUS_METER[b.status].label },
  { label: "Telemetri terakhir", nilai: (b) => stempel(b.terakhirLapor) },
];

type Aksi = "email" | "token" | "relay" | null;

export default function HalamanPelanggan() {
  const [cari, setCari] = useState("");
  const [cariTunda, setCariTunda] = useState("");
  const [zona, setZona] = useState("");
  const [saring, setSaring] = useState<SaringKunci | "">("");
  const [urutan, setUrutan] = useState(URUTAN[0].kunci);
  const [halaman, setHalaman] = useState(1);
  const [perHalaman, setPerHalaman] = useState(25);

  const [terpilih, setTerpilih] = useState<Set<string>>(new Set());
  const [aksi, setAksi] = useState<Aksi>(null);
  const [kabar, setKabar] = useState<{
    nada: "sukses" | "info" | "peringatan";
    judul: string;
    teks: string;
  } | null>(null);

  /*
   * Penutupan relay yang sudah dikonfirmasi disimpan di sini dan ditumpuk
   * di atas data server saat ditampilkan.
   *
   * Belum ada endpoint yang menerimanya — mutasi relay datang bersama BE#1.
   * Menyimpannya di klien membuat akibat tindakan langsung terlihat di baris
   * yang benar, tapi JANGAN disalahpahami sebagai persistensi: muat ulang
   * halaman dan daftar ini kosong lagi. Ganti dengan `PATCH` ke server
   * begitu rutenya ada, lalu hapus state ini seluruhnya.
   */
  const [relayDitutup, setRelayDitutup] = useState<Set<string>>(new Set());

  // Pencarian ditunda; sisanya berlaku seketika karena datang dari klik.
  useEffect(() => {
    const t = setTimeout(() => setCariTunda(cari.trim()), 300);
    return () => clearTimeout(t);
  }, [cari]);

  /*
   * Tiap perubahan penyaring mengembalikan ke halaman 1.
   *
   * Tanpa ini, mencari "Budi" dari halaman 300 menghasilkan daftar kosong
   * yang terbaca sebagai "tidak ada Budi" padahal hanya salah halaman.
   *
   * Dikerjakan di PENANGAN PERISTIWA, bukan di `useEffect` yang mengamati
   * penyaringnya. Effect yang memanggil setState menjalankan render
   * berantai — satu untuk penyaring barunya, satu lagi untuk halamannya —
   * dan di antaranya sempat ada satu putaran dengan penyaring baru di
   * halaman lama, yaitu permintaan ke server yang hasilnya langsung
   * dibuang. Mengubah penyaring memang tindakan pengguna; tempatnya di
   * sini.
   */
  function gantiSaringan(ubah: () => void) {
    ubah();
    setHalaman(1);
  }

  const pilihanUrut = URUTAN.find((u) => u.kunci === urutan) ?? URUTAN[0];

  const jalur = useMemo(() => {
    const q = new URLSearchParams({
      halaman: String(halaman),
      per: String(perHalaman),
      urut: pilihanUrut.urut,
      arah: pilihanUrut.arah,
    });
    if (cariTunda) q.set("cari", cariTunda);
    if (zona) q.set("zona", zona);
    if (saring) q.set("saring", saring);
    return `/api/admin/pelanggan?${q.toString()}`;
  }, [halaman, perHalaman, pilihanUrut, cariTunda, zona, saring]);

  const { data, memuat, menyegarkan, galat, muatUlang } =
    useApi<DaftarPelanggan>(jalur);

  /** Baris apa adanya dari server, ditimpa penutupan relay yang baru terjadi. */
  const baris = useMemo(
    () =>
      (data?.baris ?? []).map((b) =>
        relayDitutup.has(b.id) ? { ...b, relayOn: false } : b,
      ),
    [data, relayDitutup],
  );

  const semuaHalamanTerpilih =
    baris.length > 0 && baris.every((b) => terpilih.has(b.id));
  const sebagianTerpilih =
    !semuaHalamanTerpilih && baris.some((b) => terpilih.has(b.id));

  const togglePilih = useCallback((id: string) => {
    setTerpilih((lama) => {
      const baru = new Set(lama);
      if (baru.has(id)) baru.delete(id);
      else baru.add(id);
      return baru;
    });
  }, []);

  const toggleHalaman = useCallback(
    (pilihSemua: boolean) => {
      setTerpilih((lama) => {
        const baru = new Set(lama);
        for (const b of baris) {
          if (pilihSemua) baru.add(b.id);
          else baru.delete(b.id);
        }
        return baru;
      });
    },
    [baris],
  );

  const idTerpilih = useMemo(() => [...terpilih], [terpilih]);
  const jumlahTerpilih = idTerpilih.length;

  /** Satu nama hanya bila yang dipilih memang satu DAN ada di halaman ini. */
  const namaTunggal =
    jumlahTerpilih === 1
      ? baris.find((b) => b.id === idTerpilih[0])?.nama
      : undefined;

  /*
   * Yang diekspor adalah YANG SEDANG TAMPIL — atau yang dicentang bila ada.
   *
   * Bukan seluruh 8.219 baris: berkas yang isinya tidak sama dengan layar
   * membuat orang pertama yang mencocokkannya berhenti percaya pada
   * keduanya. Tombolnya menyebutkan jumlah barisnya supaya tidak ada yang
   * perlu menebak.
   */
  const barisEkspor = useMemo(
    () => (jumlahTerpilih > 0 ? baris.filter((b) => terpilih.has(b.id)) : baris),
    [baris, terpilih, jumlahTerpilih],
  );

  function ekspor() {
    unduhCsv("pelanggan-jernih", KOLOM_CSV, barisEkspor);
    setKabar({
      nada: "info",
      judul: "Berkas CSV diunduh",
      teks: `${angka(barisEkspor.length)} baris, pemisah titik koma dan desimal koma — langsung rapi di Excel berlokal Indonesia.`,
    });
  }

  function jalankanEmail() {
    setAksi(null);
    setKabar({
      nada: "sukses",
      judul: "Email pemberitahuan diantrekan",
      teks: `${angka(jumlahTerpilih)} pelanggan akan menerima email berisi sisa saldo dan cara mengisi ulang.`,
    });
    setTerpilih(new Set());
  }

  function jalankanToken() {
    setAksi(null);
    setKabar({
      nada: "sukses",
      judul: "Permintaan token dikirim",
      teks: `Token baru diterbitkan untuk ${angka(jumlahTerpilih)} pelanggan. Kodenya hanya dikirim ke pelanggan, tidak ditampilkan di konsol.`,
    });
    setTerpilih(new Set());
  }

  function jalankanTutupRelay(isi: IsiTutupRelay) {
    const sasaran = idTerpilih;
    setRelayDitutup((lama) => new Set([...lama, ...sasaran]));
    setAksi(null);
    setKabar({
      nada: "peringatan",
      judul: `Perintah tutup aliran dikirim untuk ${angka(sasaran.length)} pelanggan`,
      teks: `Alasan: ${isi.alasan}${isi.keterangan ? ` — ${isi.keterangan}` : ""}. ${
        isi.kirimEmail
          ? "Email pemberitahuan ikut dikirim ke pelanggan."
          : "Tanpa email pemberitahuan ke pelanggan."
      } Tercatat di audit log atas nama akun Anda.`,
    });
    setTerpilih(new Set());
  }

  const total = data?.total ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="eyebrow text-brand-600">Basis pelanggan</p>
          <h1 className="mt-1.5 font-display text-[clamp(1.6rem,4vw,2.1rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
            Pelanggan terdaftar
          </h1>
          <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            Cari satu pelanggan di antara{" "}
            <span className="tabular font-mono font-semibold text-ink">
              {total === null ? "—" : angka(total)}
            </span>{" "}
            meter terpasang, lalu tindak lanjuti dari sini. Saldo dan debit
            dibaca dari telemetri terakhir tiap meter.
          </p>
        </div>
        <Button
          varian="halus"
          onClick={muatUlang}
          aria-label="Muat ulang daftar pelanggan"
        >
          <RefreshCw
            size={15}
            aria-hidden
            className={cn(menyegarkan && "motion-aware animate-spin")}
          />
          Perbarui
        </Button>
      </header>

      {galat ? (
        <Card className="mt-7">
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </Card>
      ) : (
        <>
          <PitaStatus data={data} memuat={memuat} />

          <Card className="mt-6 p-4 sm:p-5">
            <Penyaring
              cari={cari}
              onCari={(v) => gantiSaringan(() => setCari(v))}
              zona={zona}
              onZona={(v) => gantiSaringan(() => setZona(v))}
              daftarZona={data?.zona ?? []}
              saring={saring}
              onSaring={(v) => gantiSaringan(() => setSaring(v))}
              urutan={urutan}
              onUrutan={(v) => gantiSaringan(() => setUrutan(v))}
              jumlahSaring={data?.jumlahSaring ?? null}
              total={total}
            />
          </Card>

          {kabar ? (
            <div className="mt-4">
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

          <Card className="mt-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line px-4 py-3 sm:px-5">
              <KotakSemua
                semua={semuaHalamanTerpilih}
                sebagian={sebagianTerpilih}
                jumlah={baris.length}
                onUbah={toggleHalaman}
              />
              <Button
                varian="sekunder"
                ukuran="sm"
                onClick={ekspor}
                disabled={barisEkspor.length === 0}
              >
                <Download size={14} aria-hidden />
                Ekspor CSV ({angka(barisEkspor.length)} baris)
              </Button>
            </div>

            {memuat ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <DaftarPelangganTabel
                baris={baris}
                terpilih={terpilih}
                onToggle={togglePilih}
                menyegarkan={menyegarkan}
                kosong={
                  <KeadaanKosong
                    judul="Tidak ada pelanggan yang cocok"
                    pesan="Tidak ada yang cocok dengan pencarian, zona, dan saringan yang sedang aktif. Longgarkan salah satunya."
                    aksi={
                      <Button
                        varian="sekunder"
                        onClick={() =>
                          gantiSaringan(() => {
                            setCari("");
                            setZona("");
                            setSaring("");
                          })
                        }
                      >
                        Kosongkan semua saringan
                      </Button>
                    }
                  />
                }
              />
            )}

            {data && data.total > 0 ? (
              <Paginasi
                halaman={data.halaman}
                halamanTerakhir={data.halamanTerakhir}
                perHalaman={data.perHalaman}
                total={data.total}
                jumlahDitampilkan={baris.length}
                onHalaman={setHalaman}
                onPerHalaman={(n) => gantiSaringan(() => setPerHalaman(n))}
              />
            ) : null}
          </Card>

          <p className="mt-4 max-w-[70ch] text-[12.5px] leading-relaxed text-muted">
            Pilihan tetap tersimpan saat Anda berpindah halaman — jumlah di
            bilah bawah adalah jumlah sesungguhnya, bukan jumlah yang terlihat
            di layar ini.
          </p>
        </>
      )}

      <BilahMassal
        jumlah={jumlahTerpilih}
        onKosongkan={() => setTerpilih(new Set())}
        onEmail={() => setAksi("email")}
        onToken={() => setAksi("token")}
        onTutupRelay={() => setAksi("relay")}
      />

      {aksi === "email" ? (
        <DialogKonfirmasiMassal
          judul={`Kirim email ke ${angka(jumlahTerpilih)} pelanggan?`}
          sub="Email berisi sisa saldo dan cara mengisi ulang. Email yang sudah terkirim tidak bisa ditarik kembali."
          labelAksi="Kirim sekarang"
          jumlah={jumlahTerpilih}
          onBatal={() => setAksi(null)}
          onKonfirmasi={jalankanEmail}
        />
      ) : null}

      {aksi === "token" ? (
        <DialogKonfirmasiMassal
          judul={`Buat token untuk ${angka(jumlahTerpilih)} pelanggan?`}
          sub="Tiap pelanggan menerima satu token sekali pakai yang terikat pada meternya. Kode token tidak ditampilkan di konsol."
          labelAksi="Terbitkan token"
          jumlah={jumlahTerpilih}
          onBatal={() => setAksi(null)}
          onKonfirmasi={jalankanToken}
        />
      ) : null}

      {aksi === "relay" ? (
        <DialogTutupRelay
          jumlah={jumlahTerpilih}
          namaTunggal={namaTunggal}
          onBatal={() => setAksi(null)}
          onKonfirmasi={jalankanTutupRelay}
        />
      ) : null}
    </div>
  );
}

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
function PitaStatus({
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
