import { Muncul } from "@/components/ui/muncul";

import "./cara-kerja.css";

/**
 * Perjalanan satu angka, dari meter sampai ke publik.
 *
 * ── Kenapa BUKAN langkah pendaftaran ──────────────────────────────────
 *
 * Seksi ini sebelumnya memuat alur orientasi: daftar, meter terhubung,
 * beli token, masukkan token. Alurnya benar, tetapi menjawab pertanyaan
 * yang salah. Tema karya ini TRANSPARANSI LAYANAN AIR, dan "cara kerja"
 * yang menjelaskan cara membuka akun dan membeli token hanya menceritakan
 * dompet air prabayar — hal yang sama persis bisa ditulis oleh produk mana
 * pun yang menjual pulsa.
 *
 * Yang benar-benar perlu dijelaskan: bagaimana satu angka berjalan dari
 * meter sampai ke mata publik tanpa bisa diubah diam-diam di tengah jalan.
 * Itu klaim yang membedakan produk ini, dan itu pula yang bisa dibuktikan
 * ke kode.
 *
 * Langkah orientasinya tidak hilang dari halaman: seksi fitur sudah memuat
 * token sekali pakai, isi ulang otomatis, dan verifikasi email, dan hero
 * punya ajakan masuk ke akun. Yang dibuang hanya pengulangannya di tempat
 * yang seharusnya menjelaskan hal lain.
 *
 * Seperti seksi fitur, tiap langkah diverifikasi ke kode yang
 * menegakkannya, dan acuannya dicatat per butir.
 */
const LANGKAH = [
  {
    judul: "Meter mencatat tiap jam",
    teks: "Pemakaian disimpan sebagai catatan per jam, bukan ditaksir sekali sebulan. Satu meter hanya bisa punya satu catatan untuk satu jam yang sama.",
    rinci: "Satu catatan tiap jam",
    // Tabel EmberPemakaian (BE prisma/schema.prisma): kolom `jam DateTime`
    // dengan @@unique([meterId, jam]). Kunci unik itulah yang membuat satu
    // jam tidak bisa dicatat dua kali dengan angka berbeda.
  },
  {
    judul: "Warga dan petugas membaca catatan yang sama",
    teks: "Portal warga dan konsol petugas mengambil angka dari sumber yang sama. Tidak ada penyalinan ulang di tengah jalan yang bisa menghasilkan dua versi.",
    rinci: "Tanpa penyalinan ulang",
    // Portal: GET /api/meter/:id dan /live (BE src/rute/meter.ts).
    // Konsol membaca tabel Meter dan EmberPemakaian yang sama; tidak ada
    // tabel ringkasan terpisah yang ditulis ulang untuk sisi petugas.
  },
  {
    judul: "Air yang hilang diumumkan, bukan dibulatkan",
    teks: "Selisih antara air yang disalurkan dan yang tercatat diterbitkan per zona, dipisah menjadi kehilangan fisik, kehilangan non-fisik, dan pemakaian resmi tanpa tagihan.",
    rinci: "Terbuka tanpa akun",
    // GET /api/publik/statistik (volumeDisalurkanM3, volumeTercatatM3,
    // nrwPct, per zona) dan /api/publik/neraca-air. Ketiga kelompoknya di
    // BE src/lib/neraca.ts:113-128. Seluruh rute publikRouter tanpa
    // autentikasi, dan /api/publik/unduh menyediakan datanya untuk diunduh.
  },
  {
    judul: "Pengaduan punya tenggat yang bisa diperiksa",
    teks: "Setiap aduan memperoleh nomor dan tenggat menurut kategorinya, dan dapat dilacak siapa pun. Rapor ketepatan penanganannya ikut diterbitkan, termasuk yang terlambat.",
    rinci: "Termasuk yang terlambat",
    // Tenggat: hitungSlaJatuhTempo() (BE src/rute/tiket.ts:29).
    // Lacak tanpa autentikasi: GET /api/publik/lacak/:nomor (publik.ts:214).
    // Rapor: GET /api/publik/kinerja (publik.ts:282) menghitung masuk,
    // selesai, dan tepat per kategori, sehingga yang terlambat ikut terbaca.
  },
] as const;

export function CaraKerja() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Muncul className="max-w-2xl">
        <p className="eyebrow text-muted">Cara kerja</p>
        <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
          Bagaimana angka meter sampai ke publik
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          Angka yang dibaca warga, petugas, dan publik berasal dari catatan yang
          sama. Empat tahap berikut yang membuatnya tetap satu angka sepanjang
          jalan.
        </p>
      </Muncul>

      {/*
        Empat kolom sejajar di layar lebar, satu kolom menumpuk di ponsel.

        Bentuknya sengaja BERBEDA dari kartu fitur di atasnya, dan bedanya
        bermakna: keenam fitur itu setara dan boleh dibaca acak, sedangkan
        keempat langkah ini BERURUT. Garis penghubung mendatar di layar lebar
        dan garis tegak di ponsel itulah yang menyatakan urutannya — tanpa
        garis, empat kartu sejajar terbaca sebagai empat pilihan, bukan satu
        jalur yang ditempuh dari kiri ke kanan.

        Jenjang 150ms per langkah, jauh lebih lambat daripada daftar fitur
        yang 70ms, dan angkanya ditentukan oleh rel yang menggambar dirinya
        sendiri: relnya butuh 560ms untuk memanjang penuh, jadi jenjang yang
        terlalu rapat membuat keempat rel tumbuh berbarengan dan urutannya
        hilang justru pada hal yang ingin disampaikan. Selebihnya: urutan
        memang hal yang ingin disampaikan di sini, jadi jenjangnya pantas
        cukup terasa untuk diikuti mata.
      */}
      <Muncul className="mt-14" pilih="li" langkah={150}>
        <ol className="grid grid-cols-1 gap-x-5 gap-y-8 lg:grid-cols-4">
          {LANGKAH.map(({ judul, teks, rinci }, i) => (
            <li
              key={judul}
              /*
               * Jenjang dipasang SENDIRI di sini, tidak menumpang `Muncul`.
               *
               * `Muncul` menjenjangkan dengan menulis `transition-delay` pada
               * elemen sasaran, dan `transition-delay` TIDAK diwariskan. Rel
               * dan nomor adalah anak dari <li>, jadi keduanya tidak pernah
               * menerima jeda itu: `Muncul` memasang `gulir-tampil` ke semua
               * <li> pada milidetik yang sama, sehingga keempat rel tumbuh
               * serentak. Terekam langsung di peramban sebagai skala
               * [0.41, 0.41, 0.41] yang identik, padahal urutan justru
               * satu-satunya hal yang ingin disampaikan seksi ini.
               */
              style={{ ["--jenjang" as string]: `${i * 150}ms` }}
              className="relative flex gap-5 lg:flex-col lg:gap-0"
            >
              {/*
                Rel penghubung. Di ponsel ia tegak di sebelah kiri nomor; di
                layar lebar ia mendatar di antara dua nomor. Langkah terakhir
                tidak punya rel — tidak ada lagi yang disambungkan, dan rel
                yang menggantung di ujung terbaca seperti langkah kelima yang
                hilang.
              */}
              {i < LANGKAH.length - 1 ? (
                <span
                  aria-hidden
                  data-rel-aliran
                  className="absolute top-12 left-[1.125rem] h-[calc(100%-1rem)] w-px bg-line lg:top-[1.125rem] lg:left-12 lg:h-px lg:w-[calc(100%-2rem)]"
                />
              ) : null}

              <span
                data-nomor-langkah
                className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[13px] font-bold text-brand-700 shadow-[var(--kilau-tepi),var(--kedalaman-1)] tabular-nums dark:text-accent"
              >
                {i + 1}
              </span>

              <div className="flex flex-col pb-2 lg:mt-5 lg:flex-1 lg:pb-0">
                <h3 className="font-display text-[17px] leading-snug font-semibold tracking-[-0.01em] text-ink">
                  {judul}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                  {teks}
                </p>
                {/* Keterangan teknis dipisah sebagai keping cekung: ia
                    jawaban atas "berapa persisnya", dan menempelkannya di
                    kalimat utama membuat kalimat itu berhenti bisa dibaca
                    sekilas.

                    Di layar lebar keping ini DIDORONG KE DASAR kolomnya
                    dengan `mt-auto`. Tanpa itu ia menempel tepat di bawah
                    kalimat masing-masing, dan karena panjang kalimat tiap
                    tahap berbeda, keempat keping berhenti di empat
                    ketinggian berbeda — terbaca seperti empat kolom yang
                    tidak saling berhubungan, padahal yang ingin disampaikan
                    justru satu jalur. `pt-4` menjaga jaraknya tetap ada
                    saat kolomnya kebetulan penuh dan tidak ada ruang
                    tersisa untuk didorong. */}
                <div className="mt-4 lg:mt-auto lg:pt-4">
                  <p className="cekung inline-block px-2.5 py-1 font-mono text-[11.5px] text-muted">
                    {rinci}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Muncul>
    </section>
  );
}
