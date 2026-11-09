import {
  Activity,
  Droplets,
  KeyRound,
  Mail,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import { Muncul } from "@/components/ui/muncul";

/**
 * Delapan kemampuan portal.
 *
 * Aturan berkas ini: tiap angka, ambang, dan batasan diverifikasi ke kode
 * yang menegakkannya sebelum ditulis, dan acuannya dicatat per butir supaya
 * klaim yang basi ketahuan saat kodenya berubah.
 *
 * Soal GAYA BAHASA, karena sudah sekali salah: judul berupa frasa benda,
 * isinya satu sampai dua kalimat deklaratif. Tanpa em dash, tanpa metafora,
 * dan tanpa konstruksi "X, bukan Y". Versi sebelumnya memakai kontras itu
 * di enam dari delapan butir sekaligus, dan pengulangan pola itulah yang
 * membuat seluruh seksi terbaca seperti teks mesin, bukan halaman produk.
 */
const FITUR = [
  {
    Ikon: Activity,
    judul: "Pemantauan waktu nyata",
    teks: "Sisa saldo dan laju pemakaian diperbarui setiap lima detik selama air mengalir.",
    // `GET /api/meter/:id/live` (BE src/rute/meter.ts:142);
    // penyegaran 5 detik di FE (beranda/_hooks/use-beranda.ts:176).
  },
  {
    Ikon: KeyRound,
    judul: "Token sekali pakai",
    teks: "Kode 4 sampai 10 digit yang terikat pada satu meter dan hanya berlaku satu kali. Dapat dimasukkan lewat portal atau langsung di keypad meter.",
    // Panjang: regex /^\d{4,10}$/ (BE src/rute/token.ts:98).
    // Sekali pakai: status TERPAKAI ditolak (token.ts:209).
    // Terikat meter: token.meterId !== meterId ditolak (token.ts:200).
  },
  {
    Ikon: RefreshCw,
    judul: "Isi ulang otomatis",
    teks: "Paket pilihan Anda dibeli otomatis saat saldo turun di bawah ambang yang Anda tentukan, minimal 10 liter. Dapat dimatikan kapan saja.",
    // Ambang: ambangL .min(10).max(50_000) (BE src/rute/bayar.ts:482).
    // Jeda antar pembelian 6 jam (BE src/lib/isi-otomatis.ts:52).
  },
  {
    Ikon: ShieldCheck,
    judul: "Kontrol katup bervalidasi",
    teks: "Permintaan membuka katup divalidasi di server dan ditolak bila saldo habis atau saklar fisik meter berada di posisi OFF.",
    // POST /api/meter/:id/relay menolak dengan SALDO_HABIS bila saldo <= 0
    // dan SAKLAR_OFF bila !saklarOn (BE src/rute/meter.ts:269-283).
  },
  {
    Ikon: Ticket,
    judul: "Pelacakan pengaduan",
    teks: "Setiap pengaduan memperoleh nomor tiket dan tenggat penanganan sesuai kategorinya. Status penanganan dapat dilacak tanpa masuk akun.",
    // Tenggat per kategori: hitungSlaJatuhTempo() (BE src/rute/tiket.ts:29).
    // Lacak tanpa autentikasi: GET /api/publik/lacak/:nomor (publik.ts:202).
  },
  {
    Ikon: Mail,
    judul: "Verifikasi lewat email",
    teks: "Kode enam digit dikirim ke email terdaftar dan berlaku sepuluh menit. Nomor ponsel hanya digunakan petugas untuk menghubungi Anda.",
    // Masa berlaku 10 menit (BE src/rute/auth.ts:218 dan :504).
    // Tidak ada penyedia SMS mana pun di seluruh basis kode backend.
  },
  {
    Ikon: Droplets,
    judul: "Deteksi kebocoran",
    teks: "Pemakaian pada pukul 00.00 sampai 05.30 dianalisis selama 14 malam terakhir. Konsumsi yang tidak pernah berhenti pada jam tersebut ditandai sebagai dugaan kebocoran.",
    // Jendela malam 00.00–05.30 dan ambang 2 L/jam:
    // FE meter/_hooks/use-meter.ts:15-16,25. Datanya dari
    // `pemakaian?rentang=bulan` (use-meter.ts:55,80), 14 malam
    // terakhir (:206). Yang menuduh DASAR, bukan puncak.
  },
  {
    Ikon: Receipt,
    judul: "Struk dan arsip pembelian",
    teks: "Struk setiap pembelian dikirim ke email beserta kode token lengkap, dan dapat dibuka ulang atau dicetak dari riwayat transaksi.",
    // Email struk dengan kode token lengkap: BE src/rute/bayar.ts:93-96
    // (emailPembelianLunas, src/lib/email.ts).
    // Struk yang bisa dibuka ulang dan dicetak:
    // FE riwayat/_bagian/{struk,panel-struk,sheet-struk}.tsx, aturan
    // cetaknya di globals.css (@media print, data-struk).
  },
] as const;

export function FiturJernih() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Muncul className="max-w-2xl">
        <p className="eyebrow text-muted">Fitur</p>
        <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
          Kelola air rumah Anda dari satu portal
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          Pembelian, pemantauan, dan pengaduan berjalan di atas data meter yang
          sama dengan yang digunakan petugas PDAM.
        </p>
      </Muncul>

      {/*
        Tiga kolom di layar lebar, dua di tablet, satu di ponsel.

        Seksi lain di halaman ini sengaja memakai daftar bergaris — kartu
        seragam memang pola yang paling cepat terlupa. Di sini kartu tetap
        dipilih karena kedelapan butirnya SETARA: tidak ada urutan yang harus
        dibaca lebih dulu, jadi memaksanya jadi satu kolom panjang justru
        menyarankan hierarki yang tidak ada. Yang membedakannya dari petak
        generik adalah nomor besar dan ikonnya, bukan bingkainya.

        Grid tiga kolom juga yang membuat lebar halaman akhirnya terpakai.
        Satu kolom pada lebar 1152px menyisakan dua pita kosong di kiri dan
        kanan, dan itu yang membuat halaman terbaca melompong meski isinya
        sebenarnya cukup.

        JUMLAHNYA delapan, bukan tujuh, dan itu alasan tata letak. Dengan
        tiga kolom, tujuh kartu meninggalkan satu kartu berdiri sendirian di
        baris terakhir — terbaca seperti daftar yang terpotong di tengah,
        bukan daftar yang selesai. Delapan menutup baris terakhir dengan dua
        kartu berdampingan. Yang ditambahkan tetap harus benar-benar ada di
        kode; kalau suatu saat tinggal tujuh lagi, perbaiki kolomnya, jangan
        mengarang butir kedelapan.

        Yang berjenjang ARTIKELNYA, bukan wadahnya: dua transform bertumpuk
        terbaca ramai.
      */}
      <Muncul
        className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        pilih="article"
        langkah={70}
      >
        {FITUR.map(({ Ikon, judul, teks }, i) => (
          <article
            key={judul}
            className="permukaan angkat flex h-full flex-col p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-700 shadow-[var(--kedalaman-1)] ring-1 ring-white/60 ring-inset dark:bg-brand-100">
                <Ikon size={18} aria-hidden />
              </span>
              {/* Nomor sengaja besar dan tipis: ia penanda urutan baca,
                  bukan data — kalau setebal judulnya, keduanya berebut. */}
              <span
                aria-hidden
                className="font-mono text-2xl font-bold text-line-strong tabular-nums"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <h3 className="mt-5 font-display text-[17px] leading-snug font-semibold tracking-[-0.01em] text-ink">
              {judul}
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              {teks}
            </p>
          </article>
        ))}
      </Muncul>
    </section>
  );
}

/*
 * ── Riwayat butir "deteksi kebocoran" ─────────────────────────────────
 *
 * Butir ini sempat DITOLAK, dan alasannya layak disimpan karena ia menjaga
 * aturan berkas ini: yang boleh masuk daftar hanya yang benar-benar
 * dikerjakan kode.
 *
 * Saat daftar ini pertama disusun, kartu "Deteksi Kebocoran" di halaman
 * meter memang ada, tetapi datanya ditulis mati — `use-meter.ts`
 * mengembalikan `points: [0, 0, 0, 0, 0, 0, 0]` dengan label jam tetap di
 * dalam `useMemo(..., [])` tanpa satu pun kebergantungan, pada hook yang
 * tidak pernah memanggil endpoint pemakaian. Grafiknya menggambar garis nol
 * yang datar untuk setiap warga, selamanya, dan lencananya hijau permanen.
 * Mengiklankannya waktu itu berarti menjanjikan pemeriksaan yang tidak
 * pernah terjadi — dan yang memercayainya menyimpulkan rumahnya aman justru
 * ketika tidak ada yang diperiksa.
 *
 * Hook itu sudah disambungkan ke `pemakaian?rentang=bulan`, dan angkanya
 * kini dihitung dari rekaman per jam milik warga yang bersangkutan. Karena
 * itu butirnya masuk.
 *
 * Satu hal yang perlu diketahui pembaca berikutnya: ambang 2 L/jam itu
 * konstanta FRONTEND (`use-meter.ts:25`). Backend tidak punya ambang
 * kebocoran per-rumah sama sekali — yang ada di sana hanya kategori
 * "kebocoran pipa" pada tiket dan pos neraca air tingkat jaringan. Jadi
 * yang diiklankan di sini adalah analisis sisi klien atas data sungguhan,
 * bukan penilaian server. Kalau ambangnya pindah ke backend, perbarui
 * acuan di butirnya.
 */
