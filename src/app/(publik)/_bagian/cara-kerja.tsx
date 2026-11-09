import { Muncul } from "@/components/ui/muncul";

/**
 * Empat langkah dari mendaftar sampai air mengalir.
 *
 * Seperti seksi fitur, tiap langkah diverifikasi ke kode yang
 * menegakkannya. Yang paling penting langkah kedua: warga baru TIDAK perlu
 * memasukkan nomor meter. Portal sempat menuntut itu, dan hasilnya
 * pendaftaran berhasil tetapi tidak membawa ke mana-mana — nomornya harus
 * sudah ada di basis data dan belum dimiliki siapa pun, sesuatu yang tidak
 * dipunyai orang yang baru membuka aplikasi. Sejak diperbaiki, meter
 * diberikan sendiri saat verifikasi email selesai.
 */
const LANGKAH = [
  {
    judul: "Daftar dengan email",
    teks: "Isi nama, email, dan kata sandi minimal delapan karakter. Kode verifikasi enam digit dikirim ke email tersebut.",
    rinci: "Berlaku 10 menit",
    // Aturan: skemaDaftar (BE src/rute/auth.ts:95-100): nama min 2,
    // kataSandi min 8, hp opsional. Kode 10 menit (auth.ts:218).
  },
  {
    judul: "Meter terhubung otomatis",
    teks: "Satu meter melekat pada akun Anda segera setelah email terverifikasi.",
    rinci: "Saldo awal 0 liter",
    // pastikanMeterDemo() dipanggil saat verifikasi selesai; meter dibuat
    // dengan saldoL: 0 dan relay "NONAKTIF" (BE src/lib/meter-demo.ts:79,88).
  },
  {
    judul: "Beli token",
    teks: "Pilih paket liter yang tersedia atau tentukan nominal sendiri. Kode token terbit setelah pembayaran lunas.",
    rinci: "Paket atau nominal bebas",
    // Dua mode: ModePilihan = "paket" | "bebas"
    // (FE src/app/(portal)/beli/_tipe.ts:23).
  },
  {
    judul: "Masukkan token",
    teks: "Masukkan kode di halaman Isi Token atau pada keypad meter. Katup terbuka bila saldo tersedia dan saklar meter berada di posisi ON.",
    rinci: "Keypad: ∗ → kode → A",
    // Urutan keypad: FE token/_bagian/keypad-meter.tsx:19 dan
    // use-token.ts:130. Syarat katup: BE src/rute/meter.ts:269-283.
  },
] as const;

export function CaraKerja() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Muncul className="max-w-2xl">
        <p className="eyebrow text-muted">Cara kerja</p>
        <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight font-semibold tracking-[-0.02em]">
          Mulai dalam empat langkah
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          Seluruh proses dikerjakan dari ponsel atau peramban, tanpa perlu
          datang ke loket.
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

        Jenjang 90ms per langkah lebih lambat daripada daftar fitur: urutan
        memang hal yang ingin disampaikan di sini, jadi jenjangnya pantas
        cukup terasa untuk diikuti mata.
      */}
      <Muncul className="mt-14" pilih="li" langkah={90}>
        <ol className="grid grid-cols-1 gap-x-5 gap-y-8 lg:grid-cols-4">
          {LANGKAH.map(({ judul, teks, rinci }, i) => (
            <li key={judul} className="relative flex gap-5 lg:block">
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
                  className="absolute top-12 left-[1.125rem] h-[calc(100%-1rem)] w-px bg-line lg:top-[1.125rem] lg:left-12 lg:h-px lg:w-[calc(100%-2rem)]"
                />
              ) : null}

              <span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[13px] font-bold text-brand-700 shadow-[var(--kilau-tepi),var(--kedalaman-1)] tabular-nums dark:text-accent">
                {i + 1}
              </span>

              <div className="pb-2 lg:mt-5 lg:pb-0">
                <h3 className="font-display text-[17px] leading-snug font-semibold tracking-[-0.01em] text-ink">
                  {judul}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                  {teks}
                </p>
                {/* Keterangan teknis dipisah sebagai keping cekung: ia
                    jawaban atas "berapa persisnya", dan menempelkannya di
                    kalimat utama membuat kalimat itu berhenti bisa dibaca
                    sekilas. */}
                <p className="cekung mt-4 inline-block px-2.5 py-1 font-mono text-[11.5px] text-muted">
                  {rinci}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Muncul>
    </section>
  );
}
