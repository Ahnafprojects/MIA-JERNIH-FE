"use client";

/**
 * W07 — Peta jaringan.
 *
 * Sebaran seluruh meter dalam satu layar, dengan legenda yang jujur.
 *
 * ── Satu himpunan, tiga tampilan ──────────────────────────────────────
 *
 * Peta, takaran status, dan daftar teks membaca array `pin` yang SAMA, lalu
 * menyaringnya dengan predikat yang sama. Tidak ada satu pun angka di
 * halaman ini yang dihitung dengan rumus kedua. Itu bukan kerapian: begitu
 * legenda dan peta punya dua jalur hitung, keduanya akan berselisih pada
 * suatu hari, dan yang pertama dihitung ulang orang adalah justru angka yang
 * sedang dipakai mengambil keputusan.
 *
 * `jumlahStatus` yang ikut dikirim API sengaja TIDAK dipakai, walau nilainya
 * sama persis hari ini. Yang dijaga adalah bahwa ia tidak BISA berbeda:
 * legenda menghitung dari array yang sama dengan yang diunggah ke GPU.
 *
 * ── Yang tidak bisa diturunkan dari pin ────────────────────────────────
 *
 * `tanpaKoordinat` dan `totalMeter` datang apa adanya dari API — mereka
 * tentang meter yang justru TIDAK ada di `pin`. Keduanya ditampilkan sebagai
 * penjumlahan terbuka di kaki takaran, supaya selisih antara 8.219 meter
 * terdaftar dan pin yang tergambar selalu punya penjelasan di layar.
 */

import { useCallback, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeadaanGalat, Skeleton } from "@/components/ui/keadaan";
import useApi from "@/lib/use-api";
import { angka } from "@/lib/format";
import type { StatusLayanan } from "@/types/publik";
import PetaDinamis from "./_bagian/peta-dinamis";
import type {
  FokusPeta,
  PilihPin,
  PosisiKartu,
} from "./_bagian/peta-meter";
import { DaftarMeter, urutkanPin } from "./_bagian/daftar-meter";
import { DaftarZona, type RingkasZona } from "./_bagian/daftar-zona";
import { KartuMeter } from "./_bagian/kartu-meter";
import { KotakCentang } from "./_bagian/kendali";
import { Takaran } from "./_bagian/takaran";
import { URUTAN_METER } from "./_bagian/status-meter";
import type { BatasZona, PetaKonsol, PinMeter, StatusMeter } from "./_bagian/tipe";

const SEMUA_STATUS: StatusMeter[] = URUTAN_METER;

const TINGGI_PETA = "h-[20rem] sm:h-[26rem] lg:h-[34rem]";

export default function HalamanPeta() {
  const { data, memuat, menyegarkan, galat, muatUlang } =
    useApi<PetaKonsol>("/api/admin/peta");

  const [statusAktif, setStatusAktif] = useState<StatusMeter[]>(SEMUA_STATUS);
  const [zonaAktif, setZonaAktif] = useState<string | null>(null);
  const [batasZona, setBatasZona] = useState(false);
  const [dipilih, setDipilih] = useState<string | null>(null);
  const [fokus, setFokus] = useState<FokusPeta | null>(null);
  const [posisiKartu, setPosisiKartu] = useState<PosisiKartu>("kiri-bawah");
  const [halaman, setHalaman] = useState(1);

  /*
   * Batas wilayah diambil hanya saat lapisannya dinyalakan.
   *
   * Jalur `null` membuat `useApi` tidak mengambil apa pun, dan isi yang
   * sudah pernah tiba tetap disimpan — mematikan lalu menyalakan kembali
   * kotak centangnya tidak memicu permintaan kedua.
   *
   * Sumbernya endpoint publik: poligon zona memang data terbuka yang sama,
   * dan menyalinnya ke konsol berarti dua daftar koordinat yang harus
   * dijaga tetap sama. Kalau gagal, hanya lapisan ini yang hilang; peta,
   * pin, dan seluruh angka di halaman tetap utuh.
   */
  const batasApi = useApi<StatusLayanan>(
    batasZona ? "/api/publik/status-layanan" : null,
  );

  const pin = useMemo(() => data?.pin ?? [], [data]);

  /** Jumlah per status — dari array yang sama dengan yang digambar peta. */
  const jumlah = useMemo(() => {
    const h: Record<StatusMeter, number> = {
      normal: 0,
      alarm: 0,
      insiden: 0,
      offline: 0,
    };
    for (const p of pin) h[p.status] += 1;
    return h;
  }, [pin]);

  const zonaRingkas = useMemo<RingkasZona[]>(() => {
    const daftar = data?.zona ?? [];
    const kosong = (): Record<StatusMeter, number> => ({
      normal: 0,
      alarm: 0,
      insiden: 0,
      offline: 0,
    });
    const per = new Map(daftar.map((z) => [z.id, kosong()]));
    const total = new Map(daftar.map((z) => [z.id, 0]));
    for (const p of pin) {
      const isi = per.get(p.zonaId);
      if (!isi) continue;
      isi[p.status] += 1;
      total.set(p.zonaId, (total.get(p.zonaId) ?? 0) + 1);
    }
    return daftar.map((z) => ({
      id: z.id,
      nama: z.nama,
      meter: total.get(z.id) ?? 0,
      per: per.get(z.id) ?? kosong(),
    }));
  }, [data, pin]);

  const batas = useMemo<BatasZona[]>(() => {
    const zona = batasApi.data?.zona ?? [];
    return zona
      .filter((z) => z.batas !== null && z.batas.length >= 4)
      .map((z) => ({ id: z.id, nama: z.nama, cincin: z.batas ?? [] }));
  }, [batasApi.data]);

  /** Predikat tunggal. Peta menerjemahkannya jadi ekspresi MapLibre. */
  const pinSaring = useMemo(
    () =>
      pin.filter(
        (p) =>
          statusAktif.includes(p.status) &&
          (zonaAktif === null || p.zonaId === zonaAktif),
      ),
    [pin, statusAktif, zonaAktif],
  );

  const pinUrut = useMemo(() => urutkanPin(pinSaring), [pinSaring]);

  const pinDipilih = useMemo(
    () => pin.find((p) => p.id === dipilih) ?? null,
    [pin, dipilih],
  );

  const disaring = statusAktif.length < SEMUA_STATUS.length || zonaAktif !== null;

  /*
   * Nomor halaman dikembalikan ke 1 DI DALAM penangan, bukan lewat effect
   * yang mengamati saringan. Keduanya terlihat sama di layar, tapi effect
   * berarti memanggil setState sebagai reaksi terhadap render: satu render
   * tambahan tiap penyaringan, dan tabel sempat tergambar pada halaman yang
   * sudah tidak ada.
   */
  const ubahStatus = useCallback((s: StatusMeter) => {
    setHalaman(1);
    setStatusAktif((lama) =>
      lama.includes(s) ? lama.filter((x) => x !== s) : [...lama, s],
    );
  }, []);

  const semuaStatus = useCallback(() => {
    setHalaman(1);
    setStatusAktif(SEMUA_STATUS);
  }, []);

  const pilihZona = useCallback((id: string | null) => {
    setHalaman(1);
    setZonaAktif(id);
  }, []);

  const lepasSaring = useCallback(() => {
    setHalaman(1);
    setStatusAktif(SEMUA_STATUS);
    setZonaAktif(null);
  }, []);

  // Dipilih dari peta: pandangan JANGAN digeser — titiknya sudah di bawah
  // kursor, dan memindahkan peta saat diklik membuat klik berikutnya meleset.
  // Yang berpindah justru kartunya, ke sudut yang tidak sedang ditunjuk.
  const pilihDariPeta = useCallback<PilihPin>((id, opsi) => {
    setDipilih(id);
    if (opsi) setPosisiKartu(opsi.posisi);
  }, []);

  // Dipilih dari daftar: pandangan harus menyusul, kalau tidak kartunya
  // terbuka untuk titik yang tidak terlihat di mana pun.
  const pilihDariDaftar = useCallback((p: PinMeter) => {
    setDipilih(p.id);
    // Pin dibawa ke tengah peta, jadi sudut kiri bawah pasti bebas.
    setPosisiKartu("kiri-bawah");
    setFokus((lama) => ({ titik: p.koordinat, nonce: (lama?.nonce ?? 0) + 1 }));
  }, []);

  const tutupKartu = useCallback(() => setDipilih(null), []);

  return (
    <div className="px-4 py-7 sm:px-6 lg:py-9">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="eyebrow text-brand-600">Sebaran jaringan</p>
          <h2 className="mt-1.5 font-display text-[clamp(1.35rem,3.2vw,1.85rem)] leading-[1.12] font-extrabold tracking-[-0.02em]">
            Seluruh meter pada satu bidang yang sama
          </h2>
          {data ? (
            <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
              <span className="font-mono text-ink tabular">
                {angka(data.totalMeter)}
              </span>{" "}
              meter terdaftar di {angka(zonaRingkas.length)} zona layanan.{" "}
              <span className="font-mono text-ink tabular">
                {angka(pin.length)}
              </span>{" "}
              di antaranya punya koordinat dan digambar di peta;{" "}
              <span className="font-mono text-ink tabular">
                {angka(data.tanpaKoordinat)}
              </span>{" "}
              belum dipetakan dan tetap ikut dihitung.
            </p>
          ) : (
            <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-muted">
              Sebaran meter pelanggan, diwarnai menurut status yang dilaporkan
              perangkat.
            </p>
          )}
        </div>

        <Button
          varian="sekunder"
          onClick={muatUlang}
          memuat={menyegarkan}
          aria-label="Muat ulang data peta"
        >
          <RefreshCw size={15} aria-hidden />
          Perbarui
        </Button>
      </header>

      {galat ? (
        <div className="mt-7 rounded-card border border-line bg-surface">
          <KeadaanGalat pesan={galat} onCoba={muatUlang} />
        </div>
      ) : (
        /*
          Dua kolom, TIGA panel — dan dua hal di bawah ini yang menahannya.

          1. PENEMPATAN DITULIS EKSPLISIT.
             Urutan di DOM sengaja peta → takaran → zona → daftar, karena
             itulah urutan baca yang benar di ponsel: peta, lalu angkanya,
             lalu wilayahnya, baru daftar panjangnya. Di layar lebar urutan
             itu dibongkar lewat koordinat baris/kolom — takaran dan zona
             menempati kolom kanan setinggi dua baris, dan daftar naik ke
             bawah peta. Tanpa itu daftar duduk di barisnya sendiri dan
             menyisakan lubang kosong setinggi setengah layar di bawah peta,
             karena kolom kanan jauh lebih tinggi daripada petanya.

          2. `min-w-0` DI SETIAP ANAK GRID.
             Ukuran minimum otomatis sebuah grid item adalah lebar min-content
             isinya. Tabel daftar meter punya lebar minimum sendiri, jadi
             tanpa `min-w-0` satu tabel menarik SELURUH kolom — termasuk peta
             — sampai 674px di layar 390px, dan halamannya bergulir mendatar.
             Diukur, bukan dikira: `scrollWidth - clientWidth` = 300px sebelum
             diperbaiki, 0 sesudahnya. Tabelnya sendiri sudah bergulir di
             dalam wadahnya.
        */
        <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20.5rem]">
          {/* ── Peta ──────────────────────────────────────────────── */}
          <section
            aria-labelledby="judul-peta"
            className="min-w-0 overflow-hidden rounded-card border border-line bg-surface lg:col-start-1 lg:row-start-1"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 border-b border-line px-5 py-2.5">
              <h2
                id="judul-peta"
                className="font-display text-[15px] font-bold tracking-[-0.02em]"
              >
                Peta sebaran meter
              </h2>
              <KotakCentang
                aktif={batasZona}
                onUbah={setBatasZona}
                label="Batas zona"
                keterangan={
                  batasZona && batasApi.galat
                    ? "Batas wilayah gagal dimuat"
                    : batasZona && batas.length === 0
                      ? "Memuat batas wilayah…"
                      : "Lapisan tambahan di atas peta"
                }
              />
            </div>

            {/*
              Pembungkus `relative` membungkus peta DAN kartunya.

              Kartu ditulis sebagai SAUDARA peta, bukan anaknya: mulai lebar
              `sm` ia mengambang di atas peta (dan pembungkus inilah acuan
              koordinatnya), sedangkan di ponsel ia mengalir sebagai blok di
              bawah peta — pembungkus ini yang ikut memanjang menampungnya.
            */}
            <div className="relative">
              <div className={`relative w-full ${TINGGI_PETA}`}>
                {memuat ? (
                  <div className="grid h-full place-items-center">
                    <p className="text-[13px] text-muted">
                      Memuat sebaran meter…
                    </p>
                  </div>
                ) : (
                  <PetaDinamis
                    pin={pin}
                    statusAktif={statusAktif}
                    zonaAktif={zonaAktif}
                    batasZona={batasZona}
                    batas={batas}
                    dipilih={dipilih}
                    fokus={fokus}
                    onPilih={pilihDariPeta}
                  />
                )}
              </div>
              {pinDipilih ? (
                <KartuMeter
                  pin={pinDipilih}
                  posisi={posisiKartu}
                  onTutup={tutupKartu}
                />
              ) : null}
            </div>

            {/*
              Angka yang BISA diperiksa: berapa pin yang benar-benar tergambar
              sekarang, dari berapa yang berkoordinat. Saat tidak ada saringan
              aktif, angka kiri wajib sama dengan jumlah keempat baris takaran.
            */}
            <p className="border-t border-line px-5 py-2.5 text-[11.5px] text-muted">
              <span className="font-mono font-semibold text-ink tabular">
                {angka(pinSaring.length)}
              </span>{" "}
              pin tergambar dari{" "}
              <span className="font-mono tabular">{angka(pin.length)}</span>{" "}
              berkoordinat
              {disaring ? " (saringan aktif)" : ""} · klik pin untuk membuka
              detailnya.
            </p>
          </section>

          {/* ── Takaran + zona ────────────────────────────────────── */}
          <aside className="grid min-w-0 gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {memuat || !data ? (
              <RangkaPanel />
            ) : (
              <Takaran
                jumlah={jumlah}
                pinTergambar={pin.length}
                tanpaKoordinat={data.tanpaKoordinat}
                totalMeter={data.totalMeter}
                aktif={statusAktif}
                onUbah={ubahStatus}
                onSemua={semuaStatus}
              />
            )}

            {memuat || !data ? (
              <RangkaPanel />
            ) : (
              <DaftarZona
                zona={zonaRingkas}
                aktif={zonaAktif}
                total={pin.length}
                onPilih={pilihZona}
              />
            )}
          </aside>

          {/* ── Daftar teks ───────────────────────────────────────── */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            {memuat || !data ? (
              <RangkaPanel tinggi="h-64" />
            ) : (
              <DaftarMeter
                pin={pinUrut}
                halaman={halaman}
                onHalaman={setHalaman}
                dipilih={dipilih}
                onPilih={pilihDariDaftar}
                tanpaKoordinat={data.tanpaKoordinat}
                disaring={disaring}
                onLepasSaring={lepasSaring}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RangkaPanel({ tinggi = "h-44" }: { tinggi?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className={`mt-4 w-full ${tinggi}`} />
    </div>
  );
}
