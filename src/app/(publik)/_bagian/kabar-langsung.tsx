import { Send } from "lucide-react";

import { LogoJernih } from "@/components/layout/logo";
import { Muncul } from "@/components/ui/muncul";

import "./kabar-langsung.css";

/**
 * Kabar langsung ke WhatsApp dan Telegram, diperagakan sebagai layar ponsel.
 *
 * ── Yang diperagakan di sini SUNGGUHAN ────────────────────────────────
 *
 * Layanan pengirimnya berjalan di produksi: WhatsApp tersambung pada nomor
 * bisnis tim, bot `@Jernih_bot` hidup, dan channel `@JernihInfo` sudah bisa
 * diposting. Ketiga kejadiannya sudah tersambung ke kode: status tiket
 * berubah, pembelian lunas, dan saldo menipis.
 *
 * Karena itu teks gelembung di bawah DISALIN dari pembangun pesan yang
 * sebenarnya dipakai server, yaitu `src/lib/pesan-notifikasi.ts` di
 * MIA-JERNIH-BE: `pesanTiketDiperbarui`, `pesanPembelianLunas`, dan
 * `pesanSaldoMenipis`. Bentuk barisnya, urutan barisnya, dan baris kosong
 * pemisahnya sama persis. Yang diganti hanya nomor tiket, invoice, dan
 * serial meternya.
 *
 * Kalau pembangun pesan itu diubah, PERBARUI teks di sini. Halaman depan
 * yang memperagakan bentuk pesan yang sudah tidak dikirim lagi adalah
 * kebohongan kecil yang tidak ada gunanya.
 *
 * ── Kenapa bentuknya ponsel ───────────────────────────────────────────
 *
 * Versi pertama menggambarkannya sebagai kartu berlabel "WHATSAPP" dan
 * "TELEGRAM". Isinya benar, tetapi tidak ada yang mengenalinya sebagai
 * pesan: label teks menyuruh orang MEMBAYANGKAN aplikasi pesan, sedangkan
 * bingkai ponsel langsung menunjukkannya. Pada seksi yang seluruh maksudnya
 * "kabar ini datang ke ponsel Anda", bentuknya ikut memikul pesan.
 *
 * ── Kenapa semua ukuran dalam `cqw` ───────────────────────────────────
 *
 * Mengikuti `components/domain/meter-device.tsx`. Bingkai ponsel berukuran
 * tetap adalah cara tercepat membuat halaman menggulir mendatar di layar
 * 390px, sebab ia ponsel di dalam ponsel. Dengan `@container` dan `cqw`,
 * seluruh isinya — bezel, takik, huruf, gelembung — menyusut sebanding
 * mengikuti lebar wadahnya, jadi tidak ada satu pun ukuran yang bisa
 * menembus layar. Jangan menambahkan ukuran `px` di dalam bingkai ini.
 *
 * ── Kenapa tidak ada gelembung hijau di kanan ─────────────────────────
 *
 * Semua gelembung di sini pesan MASUK. Warga tidak pernah membalas bot ini,
 * jadi gelembung keluar akan menggambarkan percakapan yang tidak pernah
 * terjadi.
 *
 * ── KENAPA PENGUMUMAN TIDAK LEWAT WHATSAPP ────────────────────────────
 *
 * Ini catatan untuk pembaca kode, BUKAN untuk halaman. Alasannya pernah
 * tertulis sebagai paragraf penutup di seksi ini dan dibuang: pengunjung
 * tidak pernah bertanya kenapa pengumuman tidak lewat WhatsApp, jadi
 * menjawabnya di halaman depan justru memunculkan keraguan yang tadinya
 * tidak ada. Di halaman produk, membela keputusan yang tidak digugat siapa
 * pun terbaca seperti meminta maaf.
 *
 * Pertimbangannya sendiri tetap mengikat. Pengirim WhatsApp menahan laju
 * 2,5 detik per pesan (`JEDA_KIRIM_MS` di layanan notifikasi) supaya tidak
 * terbaca sebagai robot. Untuk 424 pelanggan itu sekitar 18 menit
 * pengiriman beruntun dari satu nomor bisnis sungguhan — pola yang paling
 * cepat membuat nomor itu diblokir WhatsApp. Channel Telegram menyampaikan
 * hal yang sama dalam SATU kiriman, tanpa membebani nomor siapa pun.
 *
 * Karena itu `src/rute/konsol.ts` di MIA-JERNIH-BE sengaja hanya menyediakan
 * kanal `email` dan `telegram` untuk broadcast. Kalau suatu saat ada yang
 * hendak menambahkan WhatsApp ke sana dengan niat baik, baca ini dulu: yang
 * dipertaruhkan nomor yang juga memegang seluruh kabar pribadi warga, dan
 * kalau ia diblokir, yang hilang keduanya sekaligus.
 */

/** Alamat yang dipakai contoh pesan, sama dengan `APP_URL` di produksi. */
const ALAMAT = "https://jernih.biz.id";

interface Pesan {
  waktu: string;
  /**
   * Baris pesan apa adanya.
   *
   * Disimpan sebagai larik, bukan satu string ber-`\n`, supaya bentuknya
   * sejajar dengan `[...].join("\n")` di pembangun pesan server dan mudah
   * dibandingkan baris demi baris saat ada yang berubah di sana.
   */
  baris: string[];
}

/** Pesan yang dikirim lewat WhatsApp. */
const PESAN_WA: Pesan[] = [
  {
    waktu: "09.14",
    baris: [
      "Jernih: pengaduan LP-2026-11-0027",
      "",
      "Status berubah dari Baru menjadi Sedang diproses.",
      "Catatan petugas: Teknisi sedang menuju lokasi.",
      "",
      `Lacak: ${ALAMAT}/lacak?nomor=LP-2026-11-0027`,
    ],
  },
  {
    waktu: "11.02",
    baris: [
      "Jernih: pembelian INV-03870855 lunas",
      "",
      "Volume: 2.000 liter",
      "Total: Rp 15.000",
      "",
      "Kode token: 4821773015",
      "",
      "Masukkan kode di halaman Isi Token, atau langsung di keypad meter.",
      `Struk: ${ALAMAT}/riwayat`,
    ],
  },
];

/** Pesan yang dikirim lewat Telegram, ke chat pribadi dengan bot. */
const PESAN_TG: Pesan[] = [
  {
    waktu: "20.47",
    baris: [
      "Jernih: saldo meter JRN-10000 menipis",
      "",
      "Sisa saldo: 40 liter",
      "Batas peringatan Anda: 100 liter",
      "",
      "Isi token sebelum saldo habis agar air tidak berhenti.",
      `Beli token: ${ALAMAT}/beli`,
    ],
  },
];

/**
 * Pengumuman channel.
 *
 * Bentuknya `${judul}\n\n${pesan}`, sama dengan yang disusun
 * `src/rute/konsol.ts` saat operator menekan kirim siaran.
 */
const PENGUMUMAN = {
  judul: "Perbaikan pipa Zona Bandung Timur",
  isi: "Air berhenti mengalir pukul 09.00 sampai 16.00 untuk penggantian pipa dinas di Jalan Cikutra. Perkiraan pulih pukul 16.00.",
  waktu: "07.30",
  penayangan: "1.204",
};

/* ── Lambang saluran ───────────────────────────────────────────────────── */

/*
 * DUA HEX DI BAWAH SENGAJA DI LUAR TOKEN, dan itu bukan kelalaian.
 *
 * `#25D366` dan `#2AABEE` adalah warna resmi WhatsApp dan Telegram. Keduanya
 * identitas pihak ketiga, bukan warna merek Jernih, jadi memasukkannya ke
 * `globals.css` justru salah tempat: token di sana ikut berganti mengikuti
 * tema, sedangkan lambang WhatsApp tidak pernah berubah warna di tema mana
 * pun. Menggantinya dengan `brand-500` juga menghapus satu-satunya hal yang
 * membuat lambang itu dikenali.
 *
 * Lambangnya digambar sebagai SVG inline, bukan berkas gambar. Proyek ini
 * tidak punya asetnya, dan menambah unduhan dari luar hanya demi dua ikon
 * seukuran 5cqw tidak sebanding — apalagi pada halaman yang seluruh angkanya
 * soal keterbukaan dan kecepatan.
 */
const HIJAU_WHATSAPP = "#25D366";
const BIRU_TELEGRAM = "#2AABEE";

function LambangWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill={HIJAU_WHATSAPP}
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"
      />
    </svg>
  );
}

function LambangTelegram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill={BIRU_TELEGRAM}
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
      />
    </svg>
  );
}

/* ── Bagian-bagian bingkai ponsel ──────────────────────────────────────── */

/**
 * Ikon bilah status: sinyal, wifi, baterai.
 *
 * Digambar tangan, bukan dari pustaka ikon. Ikon bilah status punya bentuk
 * yang sangat khas dan ukurannya di sini hanya beberapa piksel; ikon pustaka
 * pada ukuran itu terbaca sebagai noda. Dan tanpa ketiganya, bilah atas
 * hanya berisi jam dan tidak pernah terbaca sebagai ponsel.
 */
function IkonStatus() {
  return (
    <span aria-hidden className="flex items-center gap-[1.6cqw]">
      {/* Sinyal: empat batang menaik. */}
      <span className="flex items-end gap-[0.5cqw]">
        {[1.2, 1.9, 2.6, 3.3].map((t) => (
          <span
            key={t}
            className="w-[0.8cqw] rounded-[0.3cqw] bg-on-console"
            style={{ height: `${t}cqw` }}
          />
        ))}
      </span>

      {/* Wifi: tiga busur menaik, disusun dari kotak berjari-jari atas saja.
          Busur sungguhan butuh SVG; pada ukuran ini bentuknya tidak bisa
          dibedakan, dan tumpukan ini jauh lebih murah. */}
      <span className="relative flex h-[3.3cqw] w-[4.2cqw] items-end justify-center">
        <span className="absolute bottom-0 size-[1.1cqw] rounded-full bg-on-console" />
        <span className="absolute bottom-[1.5cqw] h-[1.1cqw] w-[2.6cqw] rounded-t-full border-[0.45cqw] border-b-0 border-on-console" />
        <span className="absolute bottom-[2.6cqw] h-[1.1cqw] w-[4.2cqw] rounded-t-full border-[0.45cqw] border-b-0 border-on-console" />
      </span>

      {/* Baterai: badan, nub, dan isi. Isinya tidak penuh — baterai penuh
          pada pukul sembilan pagi justru terbaca seperti gambar contoh. */}
      <span className="flex items-center gap-[0.4cqw]">
        <span className="relative h-[3cqw] w-[6cqw] rounded-[0.9cqw] border-[0.4cqw] border-on-console/60 p-[0.4cqw]">
          <span className="block h-full w-[68%] rounded-[0.3cqw] bg-on-console" />
        </span>
        <span className="h-[1.1cqw] w-[0.5cqw] rounded-r-[0.3cqw] bg-on-console/60" />
      </span>
    </span>
  );
}

/**
 * Bingkai ponsel.
 *
 * Yang membuatnya terbaca sebagai ponsel, berurutan dari yang paling
 * menentukan: bodi gelap berjari-jari besar, bezel tipis yang MENGELILINGI
 * layar di keempat sisi, pulau kamera di atas, bilah status, dan bilah
 * penunjuk di bawah. Menghilangkan salah satu saja membuatnya kembali
 * terbaca sebagai kartu membulat.
 */
function Ponsel({
  jam,
  kepala,
  children,
}: {
  jam: string;
  kepala: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div data-ponsel className="@container mx-auto w-full max-w-[20.5rem]">
      {/*
        Bodi. `bg-console` dipakai di kedua tema dan itu memang benar: ponsel
        tidak berubah warna mengikuti tema situs. Token ini pun tidak punya
        penimpaan gelap, jadi nilainya sama di mana pun.

        ── Tingginya DIKUNCI `aspect-ratio`, bukan ditentukan isinya ──────

        Versi sebelumnya membiarkan tinggi bingkai mengikuti panjang
        percakapan di dalamnya. Akibatnya terukur: ponsel kiri 718px, ponsel
        kanan 564px — selisih 154px pada dua benda sejenis yang berdiri
        bersebelahan. Mata membaca selisih itu sebagai salah satunya rusak,
        dan ponsel kanan ikut terbaca gepeng karena rasionya jatuh ke 9:15,5.

        9:19,5 adalah perbandingan ponsel masa kini. Dikunci dengan
        `aspect-[9/19.5]` supaya tinggi diturunkan DARI lebar, bukan dari
        isi — dengan begitu kedua bingkai identik berapa pun panjang
        percakapannya, dan tetap identik di setiap lebar layar.
      */}
      <div className="flex aspect-[9/19.5] flex-col rounded-[13cqw] bg-console p-[1.8cqw] shadow-[var(--kilau-tepi),var(--kedalaman-4)]">
        {/* Layar. `overflow-hidden` menahan isinya tetap di dalam lengkung
            bezel; tanpa itu sudut gelembung menembus keluar. `min-h-0`
            wajib pada anak flex yang menggulir, kalau tidak ia menolak
            menyusut dan justru mendorong bodinya melar. */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[11.2cqw] bg-surface-2">
          {/* Pulau kamera. Melayang di atas bilah status, seperti aslinya. */}
          <span
            aria-hidden
            className="absolute top-[2.2cqw] left-1/2 z-10 flex h-[5.2cqw] w-[24cqw] -translate-x-1/2 items-center justify-end rounded-full bg-console pr-[1.6cqw]"
          >
            {/* Lensa: lingkaran dengan tepi lebih terang di dalamnya. Itu
                yang membedakannya dari titik hitam polos. */}
            <span className="size-[2.6cqw] rounded-full bg-console-2 ring-[0.3cqw] ring-on-console/20 ring-inset" />
          </span>

          {/* Bilah status. Tinggi atasnya memberi ruang untuk pulau kamera. */}
          <div className="flex shrink-0 items-center justify-between bg-console px-[5cqw] pt-[2.6cqw] pb-[2cqw] text-on-console">
            <span className="tabular font-mono text-[3.4cqw] font-semibold">
              {jam}
            </span>
            <IkonStatus />
          </div>

          <div className="shrink-0">{kepala}</div>

          {/*
            Ruang percakapan. `flex-1` mengisi sisa tinggi yang ditentukan
            bingkainya, dan `justify-end` menempelkan pesan ke BAWAH — itu
            yang dilakukan aplikasi pesan sungguhan, yang terbaru selalu di
            dasar layar. Isi yang melebihi ruangnya terpotong oleh
            `overflow-hidden`, persis seperti percakapan panjang di ponsel
            yang harus digulir untuk dilihat seluruhnya.

            Teks pesannya sendiri TIDAK dipangkas. Yang diperagakan di sini
            pesan yang sungguhan dikirim server, jadi memotong kalimatnya
            demi kerapian berarti memperagakan pesan yang tidak pernah ada.
          */}
          <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden bg-surface-2">
            {children}
          </div>

          {/* Bilah penunjuk. Satu-satunya bagian yang boleh terbaca sebagai
              hiasan, dan justru ketiadaannya yang paling cepat disadari. */}
          <div className="flex shrink-0 justify-center bg-surface-2 pt-[2cqw] pb-[2.4cqw]">
            <span
              aria-hidden
              className="h-[1cqw] w-[30cqw] rounded-full bg-ink/25"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Kepala percakapan.
 *
 * Bentuknya mengikuti aplikasi pesan pada umumnya: foto profil bulat, nama,
 * keterangan di bawah nama.
 *
 * ── Siapa pengirim, lewat saluran apa ─────────────────────────────────
 *
 * Dua hal berbeda, dan keduanya perlu terbaca sekaligus. Foto profilnya
 * tanda JERNIH, sebab Jernih yang mengirim. Lambang WhatsApp atau Telegram
 * menempel sebagai lencana di sudut foto itu, menandai SALURAN yang dipakai.
 *
 * Susunan itu disengaja: kalau lambang salurannya yang dijadikan foto
 * profil, pesannya seolah datang dari WhatsApp, padahal WhatsApp cuma
 * jalannya. Sebagai lencana sudut, ia menjawab "lewat mana" tanpa mengambil
 * alih "dari siapa" — pola yang sama dipakai aplikasi mana pun yang
 * menggabungkan beberapa kotak masuk.
 */
function KepalaPercakapan({
  nama,
  keterangan,
  saluran,
}: {
  nama: string;
  keterangan: string;
  saluran: "whatsapp" | "telegram";
}) {
  const Lambang =
    saluran === "whatsapp" ? LambangWhatsApp : LambangTelegram;

  return (
    <div className="flex items-center gap-[3cqw] border-b border-line bg-surface px-[4cqw] py-[3cqw]">
      {/* Foto profil. `size-[9cqw]` menimpa atribut width/height bawaan
          SVG-nya, supaya ikut menyusut bersama bingkainya. */}
      <span className="relative shrink-0">
        <span className="grid size-[9cqw] place-items-center rounded-full bg-brand-50 ring-[0.3cqw] ring-brand-500/20 dark:bg-brand-100">
          <LogoJernih className="size-[5.4cqw] text-brand-500" />
        </span>

        {/* Lencana saluran. Cincin sewarna layar memisahkannya dari foto di
            belakangnya; tanpa cincin itu kedua lingkaran menyatu jadi satu
            bentuk yang tidak terbaca. */}
        <span className="absolute -right-[0.8cqw] -bottom-[0.6cqw] grid size-[4.4cqw] place-items-center rounded-full bg-surface ring-[0.4cqw] ring-surface">
          <Lambang className="size-[4.4cqw]" />
        </span>
      </span>

      <span className="min-w-0 leading-tight">
        <span className="block truncate font-display text-[4.7cqw] font-semibold tracking-[-0.01em] text-ink">
          {nama}
        </span>
        <span className="block truncate text-[3.6cqw] text-muted">
          {keterangan}
        </span>
      </span>
    </div>
  );
}

/**
 * Pemisah tanggal.
 *
 * Setiap aplikasi pesan menaruh keping tanggal di atas percakapan hari itu,
 * dan ketiadaannya termasuk hal yang paling cepat membuat tiruan terasa
 * kosong.
 *
 * Di sini ia juga mengerjakan satu hal lagi. Tinggi bingkai sekarang dikunci
 * `aspect-ratio`, sementara ponsel kanan hanya memuat satu pesan, jadi ada
 * ruang kosong di atasnya. Ruang itu memang seperti itulah rupanya pada chat
 * sungguhan yang baru berisi satu pesan — tetapi keping tanggal memberinya
 * titik awal yang terbaca sebagai permulaan percakapan, bukan sebagai isi
 * yang gagal dimuat.
 */
function PemisahTanggal() {
  return (
    <li className="flex justify-center pb-[1.4cqw]">
      <span className="rounded-full bg-ink/8 px-[3cqw] py-[1cqw] text-[2.9cqw] font-semibold text-muted">
        Hari ini
      </span>
    </li>
  );
}

/**
 * Gelembung pesan masuk.
 *
 * Ekornya di KIRI ATAS, menempel pada sisi gelembung yang menghadap foto
 * profil. Itu arah yang dipakai setiap aplikasi pesan, dan membaliknya
 * membuat gelembung terbaca sebagai pesan keluar walaupun letaknya di kiri.
 */
function Gelembung({ pesan, urutan }: { pesan: Pesan; urutan: number }) {
  return (
    <li
      /*
       * Jenjang dipasang SENDIRI di sini, tidak menumpang `Muncul`. `Muncul`
       * menjenjangkan dengan menulis `transition-delay` pada elemen sasaran,
       * dan sifat itu tidak diwariskan ke anak. Gelembung dan tanda
       * terbacanya adalah anak dari <li>, jadi tanpa properti kustom ini
       * keduanya mendarat pada milidetik yang sama dan kesan "datang satu
       * per satu" hilang.
       */
      style={{ ["--jenjang" as string]: `${urutan * 150}ms` }}
      className="flex"
    >
      <div
        data-gelembung
        className="relative max-w-[86%] rounded-[3cqw] rounded-tl-[0.8cqw] bg-surface px-[3.4cqw] py-[2.6cqw] shadow-[var(--kedalaman-1)]"
      >
        {/*
          `whitespace-pre-line` supaya baris kosong pemisah ikut tergambar.
          Teksnya memang dikirim apa adanya seperti ini, jadi memadatkannya
          membuat peragaan ini berhenti menggambarkan pesan yang sungguhan
          diterima warga.

          `break-words` bukan kehati-hatian berlebihan: baris `Lacak: …`
          memuat URL panjang tanpa spasi, dan ia kebetulan muat hanya karena
          `/` dan `?` menyediakan titik putus. Nomor tiket yang lebih panjang
          akan menembus gelembungnya tanpa gejala.
        */}
        <p className="text-[4.2cqw] leading-relaxed break-words whitespace-pre-line text-ink">
          {pesan.baris.join("\n")}
        </p>

        {/* Jam dan tanda terbaca duduk DI DALAM gelembung, rata kanan bawah.
            Itu konvensi yang dipakai semua aplikasi pesan. */}
        <span className="mt-[1.4cqw] flex items-center justify-end gap-[1.2cqw]">
          <span className="tabular font-mono text-[3.2cqw] text-muted">
            {pesan.waktu}
          </span>
          {/* Centang ganda digambar tangan: dua goresan bersilang arah.
              Ikon pustaka pada ukuran 3cqw tidak terbaca sebagai centang. */}
          <span
            data-tanda-terbaca
            aria-hidden
            className="relative block h-[2.4cqw] w-[3.6cqw] text-brand-600"
          >
            <span className="absolute top-[0.2cqw] left-0 h-[1.4cqw] w-[2.2cqw] rotate-[-45deg] border-b-[0.45cqw] border-l-[0.45cqw] border-current" />
            <span className="absolute top-[0.2cqw] left-[1.3cqw] h-[1.4cqw] w-[2.2cqw] rotate-[-45deg] border-b-[0.45cqw] border-l-[0.45cqw] border-current" />
          </span>
        </span>
      </div>
    </li>
  );
}

export function KabarLangsung() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Muncul className="max-w-2xl">
        <p className="eyebrow text-muted">Kabar langsung</p>
        <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
          Kabar yang datang sendiri
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          Perubahan status pengaduan, pembelian yang lunas, dan saldo yang
          menipis dikirim ke WhatsApp atau Telegram Anda tanpa perlu membuka
          portal. Pengumuman untuk umum berjalan di channel terpisah.
        </p>
      </Muncul>

      {/*
        `items-start` penting, bukan selera. Kolom kiri memuat dua pesan
        sungguhan yang panjang, kolom kanan satu pesan dan satu pengumuman.
        Tanpa ini keduanya diregangkan sama tinggi dan ponsel yang lebih
        pendek tergambar dengan rongga kosong di dalam bingkainya.
      */}
      <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-8">
        {/* ── Kiri: pesan pribadi lewat WhatsApp ──────────────────────── */}
        <Muncul pilih="li" langkah={150}>
          <div>
            <Ponsel
              jam="11.02"
              kepala={
                <KepalaPercakapan
                  saluran="whatsapp"
                  nama="Jernih"
                  keterangan="pesan otomatis · tidak dibalas"
                />
              }
            >
              {/* Layar percakapan. Gelembung menonjol di atasnya, bukan
                  sebaliknya: itu bahasa bentuk proyek ini, cekung adalah
                  wadah dan menonjol adalah benda yang ditaruh di dalamnya. */}
              <ol className="flex flex-col gap-[2.6cqw] px-[3.4cqw] pb-[4cqw]">
                <PemisahTanggal />
                {PESAN_WA.map((pesan, i) => (
                  <Gelembung key={pesan.baris[0]} pesan={pesan} urutan={i} />
                ))}
              </ol>
            </Ponsel>

            <div className="mx-auto mt-6 max-w-[20.5rem]">
              <h3 className="font-display text-[17px] leading-snug font-semibold tracking-[-0.01em] text-ink">
                Pesan pribadi
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                Isinya menyangkut satu sambungan saja, jadi hanya pemiliknya
                yang menerima. Nomor didaftarkan sendiri oleh warga di halaman
                Akun dan bisa dihentikan kapan saja.
              </p>
            </div>
          </div>
        </Muncul>

        {/* ── Kanan: Telegram, pesan pribadi dan channel pengumuman ───── */}
        <Muncul pilih="li" langkah={150}>
          <div>
            <Ponsel
              jam="20.47"
              kepala={
                <KepalaPercakapan
                  saluran="telegram"
                  nama="Jernih"
                  keterangan="bot · @Jernih_bot"
                />
              }
            >
              <ol className="flex flex-col gap-[2.6cqw] px-[3.4cqw] pb-[2cqw]">
                <PemisahTanggal />
                {PESAN_TG.map((pesan, i) => (
                  <Gelembung key={pesan.baris[0]} pesan={pesan} urutan={i} />
                ))}
              </ol>

              {/*
                Pengumuman channel, dan bentuknya SENGAJA berbeda.

                Channel bukan percakapan: tidak ada gelembung, tidak ada ekor,
                dan tidak ada tanda terbaca — yang ada kiriman selebar layar
                dengan nama channel, jumlah penayangan, dan jam. Perbedaan
                bentuk itulah yang membuat orang mengenalinya sebagai channel
                tanpa perlu diberi label, dan sekaligus menunjukkan bahwa
                pengumuman memang tidak dikirim sebagai pesan pribadi.
              */}
              <div className="px-[3.4cqw] pb-[4cqw]">
                <div className="flex items-center gap-[2cqw] px-[1cqw] pb-[2cqw]">
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-line-strong/50"
                  />
                  <span className="eyebrow text-[2.7cqw] text-muted">
                    Channel
                  </span>
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-line-strong/50"
                  />
                </div>

                <div
                  data-kiriman
                  className="rounded-[3cqw] bg-surface px-[3.4cqw] py-[3cqw] shadow-[var(--kedalaman-1)]"
                >
                  <span className="flex items-center gap-[1.6cqw]">
                    {/* Lambang Telegram pada kiriman channel: penanda bahwa
                        pengumuman ini berjalan di jalur yang berbeda dari
                        pesan pribadi di atasnya. */}
                    <LambangTelegram className="size-[3.6cqw] shrink-0" />
                    <span className="font-display text-[3.7cqw] font-semibold tracking-[-0.01em] text-brand-700">
                      Info Jernih
                    </span>
                  </span>

                  <p className="mt-[2cqw] font-display text-[4.4cqw] leading-snug font-semibold text-ink">
                    {PENGUMUMAN.judul}
                  </p>
                  <p className="mt-[1.4cqw] text-[3.8cqw] leading-relaxed text-muted">
                    {PENGUMUMAN.isi}
                  </p>

                  {/* Jumlah penayangan: penanda paling khas kiriman channel,
                      dan tidak pernah ada pada pesan pribadi. */}
                  <span className="mt-[2.4cqw] flex items-center justify-end gap-[1.4cqw] text-[3.2cqw] text-muted">
                    <span aria-hidden className="flex items-center gap-[0.8cqw]">
                      {/* Mata: lingkaran luar pipih dengan pupil di tengah. */}
                      <span className="relative flex h-[2.2cqw] w-[3.4cqw] items-center justify-center rounded-[50%] border-[0.35cqw] border-current">
                        <span className="size-[0.9cqw] rounded-full bg-current" />
                      </span>
                      <span className="tabular font-mono">
                        {PENGUMUMAN.penayangan}
                      </span>
                    </span>
                    <span className="tabular font-mono">
                      {PENGUMUMAN.waktu}
                    </span>
                  </span>
                </div>
              </div>
            </Ponsel>

            <div className="mx-auto mt-6 max-w-[20.5rem]">
              <h3 className="font-display text-[17px] leading-snug font-semibold tracking-[-0.01em] text-ink">
                Pengumuman umum
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                Gangguan dan jadwal pemeliharaan diumumkan di channel yang bisa
                diikuti siapa pun, tanpa menyerahkan nomor telepon.
              </p>

              {/*
                Tautan sungguhan, bukan hiasan. Channel-nya sudah ada dan
                botnya sudah bisa memposting ke sana, jadi siapa pun yang
                membuka halaman ini bisa langsung memeriksanya.
              */}
              <a
                href="https://t.me/JernihInfo"
                target="_blank"
                rel="noreferrer"
                className="cincin-fokus angkat mt-4 inline-flex items-center justify-center gap-2 rounded-input border border-line-strong bg-surface px-4 py-2.5 text-[14px] font-semibold text-ink hover:border-brand-500/60 hover:bg-soft"
              >
                <Send size={15} aria-hidden />
                Ikuti channel pengumuman
              </a>
            </div>
          </div>
        </Muncul>
      </div>

    </section>
  );
}
