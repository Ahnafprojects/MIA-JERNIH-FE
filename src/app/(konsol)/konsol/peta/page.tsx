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

import { KeadaanGalat } from "@/components/ui/keadaan";
import { usePeta } from "./_hooks/use-peta";
import { KepalaPeta } from "./_bagian/kepala-peta";
import { BidangPeta } from "./_bagian/bidang-peta";
import { RangkaPanel } from "./_bagian/rangka-panel";
import { DaftarMeter } from "./_bagian/daftar-meter";
import { DaftarZona } from "./_bagian/daftar-zona";
import { Takaran } from "./_bagian/takaran";

export default function HalamanPeta() {
  const p = usePeta();

  return (
    <div className="px-4 py-7 sm:px-6 lg:py-9">
      <KepalaPeta
        data={p.data}
        jumlahZona={p.zonaRingkas.length}
        jumlahPin={p.pin.length}
        menyegarkan={p.menyegarkan}
        onMuatUlang={p.muatUlang}
      />

      {p.galat ? (
        <div className="mt-7 rounded-card border border-line bg-surface">
          <KeadaanGalat pesan={p.galat} onCoba={p.muatUlang} />
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
          <BidangPeta
            memuat={p.memuat}
            pin={p.pin}
            jumlahTergambar={p.pinSaring.length}
            statusAktif={p.statusAktif}
            zonaAktif={p.zonaAktif}
            disaring={p.disaring}
            batasZona={p.batasZona}
            onBatasZona={p.setBatasZona}
            batas={p.batas}
            batasGalat={p.batasApiGalat}
            dipilih={p.dipilih}
            pinDipilih={p.pinDipilih}
            fokus={p.fokus}
            posisiKartu={p.posisiKartu}
            onPilih={p.pilihDariPeta}
            onTutupKartu={p.tutupKartu}
          />

          {/* ── Takaran + zona ────────────────────────────────────── */}
          <aside className="grid min-w-0 gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {p.memuat || !p.data ? (
              <RangkaPanel />
            ) : (
              <Takaran
                jumlah={p.jumlah}
                pinTergambar={p.pin.length}
                tanpaKoordinat={p.data.tanpaKoordinat}
                totalMeter={p.data.totalMeter}
                aktif={p.statusAktif}
                onUbah={p.ubahStatus}
                onSemua={p.semuaStatus}
              />
            )}

            {p.memuat || !p.data ? (
              <RangkaPanel />
            ) : (
              <DaftarZona
                zona={p.zonaRingkas}
                aktif={p.zonaAktif}
                total={p.pin.length}
                onPilih={p.pilihZona}
              />
            )}
          </aside>

          {/* ── Daftar teks ───────────────────────────────────────── */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            {p.memuat || !p.data ? (
              <RangkaPanel tinggi="h-64" />
            ) : (
              <DaftarMeter
                pin={p.pinUrut}
                halaman={p.halaman}
                onHalaman={p.setHalaman}
                dipilih={p.dipilih}
                onPilih={p.pilihDariDaftar}
                tanpaKoordinat={p.data.tanpaKoordinat}
                disaring={p.disaring}
                onLepasSaring={p.lepasSaring}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
