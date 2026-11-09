import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Download,
  Droplets,
  KeyRound,
  Mail,
  MapPinned,
  MessageCircle,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Ticket,
  type LucideIcon,
} from "lucide-react";

import { Muncul } from "@/components/ui/muncul";

interface ButirFitur {
  Ikon: LucideIcon;
  judul: string;
  teks: string;
  /**
   * Tampil di halaman depan.
   *
   * Opsional, dan karena itu lariknya TIDAK boleh `as const`: dengan `as
   * const` TypeScript menyimpulkan tipe berbeda untuk butir yang punya
   * benderanya dan yang tidak, lalu menolak `f.sorot` pada gabungan
   * keduanya.
   */
  sorot?: boolean;
}

/**
 * Dua belas kemampuan portal.
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
 *
 * ── Satu larik, dua tempat ────────────────────────────────────────────
 *
 * Daftar ini tampil di halaman depan (empat butir bertanda `sorot`) dan di
 * `/fitur` (kedua belasnya). Lariknya SENGAJA tidak digandakan: dua salinan
 * isi yang sama adalah cara paling cepat membuat kedua halaman menyebut hal
 * berbeda beberapa bulan lagi, dan yang satu basi tanpa ada yang tahu.
 *
 * `sorot` HARUS tepat empat butir. Grid landing empat kolom, jadi butir
 * kelima akan menggantung sendirian di baris kedua. Kalau mau mengganti
 * pilihan, tukar bendera `sorot`-nya, jangan menambah.
 */
const FITUR: readonly ButirFitur[] = [
  {
    Ikon: Activity,
    judul: "Pemantauan waktu nyata",
    // SOROT: Inti janji produknya: angka yang sama dibaca warga dan petugas.
    sorot: true,
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
    // SOROT: Menjawab subtema Public Service Tracking secara langsung.
    sorot: true,
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
  {
    Ikon: MessageCircle,
    judul: "Kabar ke WhatsApp dan Telegram",
    teks: "Perubahan status pengaduan, pembelian yang lunas, dan saldo yang menipis dikirim ke saluran yang Anda pilih sendiri. Dapat dimatikan kapan saja.",
    // Pengirimnya layanan terpisah di BE notifikasi/, hidup di produksi.
    // Titik sambungnya: rute/tiket.ts (status berubah), rute/bayar.ts
    // (pembelian lunas), lib/saldo-menipis.ts (ambang peringatan).
    // Persetujuan per warga: Pengguna.waOptIn dan Pengguna.telegramChatId;
    // pendaftarannya di halaman Akun.
  },
  {
    Ikon: MapPinned,
    judul: "Peta sebaran kebocoran",
    // SOROT: Satu-satunya presensi peta kebocoran di halaman depan; petanya
    //        sendiri tinggal di /status, jadi tanpa kartu ini ia tidak
    //        terlihat sama sekali oleh yang baru mendarat.
    sorot: true,
    teks: "Titik kebocoran pipa, status penanganannya, dan riwayat perbaikan tergambar di peta yang bisa dibuka siapa pun.",
    // GET /api/publik/titik-kebocoran (BE rute/publik.ts), logika petak di
    // BE lib/titik-kebocoran.ts. Koordinat sengaja dibulatkan ke petak
    // sekitar 110 m dan aduan sepetak digabung, supaya titiknya tidak
    // menunjuk rumah pelapor. Nomor tiket tidak pernah ikut keluar.
  },
  {
    Ikon: BadgeCheck,
    judul: "Laporan yang terverifikasi",
    teks: "Lokasi aduan diambil dari GPS perangkat atau koordinat meter terdaftar, dan setiap laporan terikat pada nomor pelanggan yang sudah diverifikasi.",
    // BE lib/validasi-laporan.ts: haversine, pembaca GPS EXIF, penilai
    // keyakinan lokasi, pendeteksi aduan ganda. Semuanya MENANDAI untuk
    // ditinjau petugas, tidak pernah menolak laporan — foto yang kehilangan
    // EXIF itu lazim karena aplikasi pesan menghapusnya.
  },
  {
    Ikon: Download,
    judul: "Data terbuka bisa diunduh",
    // SOROT: Menjawab subtema Open Government Data secara langsung.
    sorot: true,
    teks: "Statistik jaringan, neraca air, dan rapor kinerja tersedia sebagai CSV atau JSON, tanpa perlu akun.",
    // GET /api/publik/unduh?set=&format=csv|json&rentang=
    // (BE rute/publik.ts:670). Diuji ke produksi: membalas 200 dengan
    // content-type text/csv dan header attachment, jadi tombolnya benar-
    // benar mengunduh berkas.
  },
];

/**
 * Daftar fitur, dalam dua ukuran.
 *
 * `ringkas` menampilkan empat butir bertanda `sorot` beserta tautan ke
 * `/fitur`; tanpanya tampil kedua belasnya. Halaman depan memakai yang
 * ringkas karena dua belas kartu di sana terbaca terlalu panjang sebelum
 * pengunjung sampai ke bagian halaman lainnya.
 *
 * `judulUtama` menaikkan judulnya dari `h2` ke `h1`. Di halaman depan seksi
 * ini salah satu dari banyak seksi, jadi `h2` benar; di `/fitur` ia judul
 * halaman, dan halaman tanpa `h1` membuat pembaca layar kehilangan titik
 * masuknya.
 */
export function FiturJernih({
  ringkas = false,
  judulUtama = false,
}: {
  ringkas?: boolean;
  judulUtama?: boolean;
} = {}) {
  const butir = ringkas ? FITUR.filter((f) => f.sorot) : FITUR;
  const Judul = judulUtama ? "h1" : "h2";

  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Muncul className="max-w-2xl">
        <p className="eyebrow text-muted">Fitur</p>
        <Judul className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
          {ringkas
            ? "Kelola air rumah Anda dari satu portal"
            : "Dua belas hal yang bisa Anda lakukan"}
        </Judul>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          {ringkas
            ? "Pembelian, pemantauan, dan pengaduan berjalan di atas data meter yang sama dengan yang digunakan petugas PDAM."
            : "Setiap butir di bawah berjalan di produksi hari ini. Angka, ambang, dan batasannya diambil dari kode yang menegakkannya."}
        </p>
      </Muncul>

      {/*
        DAFTAR BERGARIS, bukan kartu berkotak.

        Bentuk sebelumnya memberi tiap butir kotaknya sendiri, dan itu
        melanggar aturan desain proyek ini sendiri: butir pertama daftar
        "Yang dilarang" di visual.md menyebut grid kartu membulat seragam
        sebagai pola yang paling sering dipakai dan paling cepat terlupa,
        serta menyuruh menimbang daftar bergaris atau tabel lebih dulu.

        Pembelaan lama untuk kartu adalah "butirnya SETARA jadi boleh dibaca
        acak". Alasan itu sah untuk menolak satu kolom BERURUT, tetapi tidak
        pernah menjawab kenapa tiap butir harus punya bingkai sendiri. Butir
        setara tetap bisa disajikan tanpa kotak per butir.

        Bentuknya sekarang SEJALAN dengan seksi "Yang biasanya tertutup" di
        halaman yang sama: garis atas pada daftar, garis bawah pada tiap
        baris, nomor urut mono `brand-600`, judul `font-display`, keterangan
        `muted`. Yang berbeda hanya dua hal, dan keduanya punya sebab:

        - ADA IKON. Seksi transparansi tidak punya ikon per butir; fitur
          punya, dan ikon itu yang membuat baris bisa dikenali sekilas tanpa
          membaca judulnya.
        - TIDAK ADA panah dan tidak ada `.sorot`. Barisnya bukan tautan.
          Memberi sorot dan panah pada baris yang tidak bisa diklik adalah
          janji palsu yang baru ketahuan setelah orang menekannya.

        Nomornya penanda urutan baca pada daftar yang sedang tergambar, sama
        seperti di seksi transparansi — bukan pengenal tetap. Karena itu
        halaman depan menomori keempat sorotannya 01 sampai 04 meskipun di
        `/fitur` butir yang sama berada di posisi lain.

        Lebarnya turun ke `max-w-6xl` mengikuti seksi transparansi. `max-w-7xl`
        dulu dipakai hanya karena empat kolom kartu menyempit sampai judulnya
        pecah tiga baris; tanpa kartu, alasan itu hilang.

        Yang berjenjang BARISNYA, bukan wadahnya: dua transform bertumpuk
        terbaca ramai.
      */}
      <Muncul className="mt-12" pilih="li" langkah={70}>
        <ul className="border-t border-line">
          {butir.map(({ Ikon, judul, teks }, i) => (
            <li
              key={judul}
              className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-1.5 border-b border-line py-7 sm:grid-cols-[3.5rem_17rem_1fr] sm:gap-x-8"
            >
              {/* Nomor urutnya isi, bukan hiasan, jadi ia harus terbaca.
                  `brand-600` satu-satunya nada merek yang lulus untuk teks
                  sekecil ini di atas latar terang; `brand-400` hanya 2,4:1. */}
              <span className="tabular font-mono text-[13px] text-brand-600">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="flex items-center gap-2.5 font-display text-[1.2rem] leading-snug font-semibold tracking-[-0.01em] text-ink">
                <Ikon
                  size={17}
                  aria-hidden
                  className="shrink-0 text-brand-600"
                />
                {judul}
              </span>

              <span className="col-start-2 text-[14.5px] leading-relaxed text-muted sm:col-start-3">
                {teks}
              </span>
            </li>
          ))}
        </ul>
      </Muncul>

      {/*
        Tautan ke daftar lengkap, hanya pada mode ringkas.

        Menyebut ANGKANYA, bukan "selengkapnya". Pengunjung yang tahu ada dua
        belas butir bisa memutuskan sendiri apakah mau membukanya; "lihat
        selengkapnya" tidak memberi tahu apa pun tentang apa yang menunggu di
        balik tautan.

        Panahnya bergeser 4px ke arah tujuannya saat disentuh, sama seperti
        daftar transparansi di bawahnya, supaya kedua tautan di halaman ini
        berperilaku sama.
      */}
      {ringkas ? (
        <Muncul className="mt-10">
          {/*
            Garis bawahnya ada di SPAN DI DALAM, bukan di tautannya.

            Tautannya sendiri diberi `min-h-11` supaya sasaran sentuhnya
            mencapai 44px; terukur hanya 30px sebelum ini, di bawah ambang
            dan justru pada ajakan yang paling sering ditekan dengan jempol.
            Kalau garisnya tetap di tautan, ia ikut turun ke dasar kotak
            44px itu dan terlepas dari hurufnya.
          */}
          <Link
            href="/fitur"
            className="cincin-fokus group inline-flex min-h-11 items-center gap-2 font-semibold text-ink"
          >
            <span className="border-b-2 border-brand-300 pb-1 transition-colors group-hover:border-brand-600 motion-reduce:transition-none">
              Lihat dua belas fitur selengkapnya
            </span>
            <ArrowRight
              size={17}
              aria-hidden
              className="text-brand-600 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </Muncul>
      ) : null}
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
