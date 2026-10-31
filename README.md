# Jernih — Frontend

Platform transparansi layanan air PDAM: warga memantau pemakaian, saldo, dan
pengaduannya seketika, sementara data layanan dan kinerja instansi terbuka
untuk publik tanpa perlu akun.

Dibuat untuk **Web In Action — Multimedia In Action (MIA) 2026**, subtema
**Public Service Tracking**.

- **Live:** <https://jernih.biz.id> (Vercel)
- **API:** <https://api.jernih.biz.id> ([repo backend](https://github.com/Ahnafprojects/MIA-JERNIH-BE))

> Gagasan yang menyatukan seluruh halaman: **melacak layanan publik berarti
> melihatnya sepanjang waktu, bukan satu jepretan.** Janji, lalu kenyataan —
> termasuk ketika kenyataannya meleset.

## Tech stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack) |
| Bahasa | TypeScript 5 (mode ketat) |
| Styling | Tailwind CSS v4 (token di `src/app/globals.css`) |
| Huruf | Fraunces · Public Sans · JetBrains Mono (next/font) |
| Peta | MapLibre GL + react-map-gl, basemap CARTO vector (tanpa API key) |
| Grafik | Recharts |
| Validasi | Zod |
| Ikon | lucide-react |

Backend terpisah: [MIA-JERNIH-BE](https://github.com/Ahnafprojects/MIA-JERNIH-BE)
(Express 5 + Prisma 7 + PostgreSQL).

## Cara menjalankan

```bash
git clone https://github.com/Ahnafprojects/MIA-JERNIH-FE.git
cd MIA-JERNIH-FE
npm install
cp .env.example .env.local
npm run dev
```

Buka <http://localhost:3000>.

Satu-satunya variabel yang wajib diisi di `.env.local`:

```ini
NEXT_PUBLIC_API_URL=https://api.jernih.biz.id   # atau http://localhost:4000
```

**Backend sudah hidup**, jadi tidak ada yang perlu dijalankan selain ini.
Kalau menunjuk backend lokal, pastikan asalnya terdaftar di CORS backend —
`http://localhost:3000` terdaftar, `http://127.0.0.1:3000` **tidak**, dan
keduanya adalah asal yang berbeda bagi peramban.

```bash
npm run build      # build produksi
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Struktur

```
src/
├── app/
│   ├── (publik)/          tanpa login — landing, status, lacak, kinerja, statistik
│   ├── (auth)/            masuk, daftar, verifikasi, hubungkan meter
│   ├── (portal)/          warga — beranda, token, beli, pemakaian, meter, …
│   ├── (konsol)/konsol/   petugas PDAM — dashboard, pelanggan, peta, insiden, …
│   └── api/               rute tiruan sementara (publik + admin)
├── components/
│   ├── ui/                komponen dasar lintas halaman
│   ├── domain/            LCD, MeterDevice, grafik, kolom air, angka berjalan
│   └── peta/              pembungkus MapLibre
├── lib/                   api.ts · use-api.ts · format.ts · cn.ts
└── types/
```

Rincian tiap rute ada di [Peta rute](#peta-rute).

## Peta rute

33 halaman dalam empat kelompok. Satu aplikasi melayani tiga peran — tampilan
menyesuaikan siapa yang masuk, bukan tiga situs terpisah.

### `(publik)` — tanpa akun

| Rute | Isi |
| --- | --- |
| `/` | Landing: hero video, peraga meter interaktif, pita angka jaringan |
| `/status` | Status tiap zona: peta, keandalan 30 hari, kualitas air, riwayat gangguan |
| `/lacak` | Lacak pengaduan dengan nomor tiket + janji waktu, alur penanganan, kanal lapor |
| `/kinerja` | Rapor kinerja SLA: ketepatan, waktu tanggap, rincian per kategori |
| `/statistik` | Neraca air, tolok ukur, tren 12 bulan, pemakaian per orang, unduhan data |

### `(auth)` — pintu masuk

`/masuk` · `/daftar` · `/verifikasi` · `/lupa-sandi` · `/atur-ulang` ·
`/hubungkan-meter`

Seluruhnya berbagi `AuthShell`: panel merek beranimasi di kiri (air,
tetes, riak, kisi ukur) dan formulir di kanan.

### `(portal)` — warga

`/beranda` · `/meter` · `/token` · `/beli` · `/bayar/[invoice]` ·
`/pemakaian` · `/riwayat` · `/notifikasi` · `/akun` · `/bantuan`

### `(konsol)` — petugas PDAM

`/konsol` · `/pelanggan` · `/pelanggan/[id]` · `/perangkat` · `/peta` ·
`/insiden` · `/token` · `/analitik` · `/laporan` · `/audit` · `/broadcast` ·
`/pengaturan`

---

## Pengambilan data

```
src/lib/
├── api.ts            pembungkus fetch + ApiError + refresh otomatis saat 401
├── use-api.ts        hook pengambilan untuk komponen klien
├── auth-context.tsx  keadaan sesi
├── penjaga-rute.tsx  penjaga halaman menurut peran
├── format.ts         angka, tanggal, satuan — SEMUA pemformatan lewat sini
├── cn.ts             penggabung kelas
└── hemat-gerak.ts    pembacaan prefers-reduced-motion
```

**Access token disimpan di memori, bukan `localStorage`.** Refresh token ada
di cookie `httpOnly` yang tidak bisa dibaca JavaScript. Token yang tersimpan
di `localStorage` bisa diambil oleh skrip pihak ketiga mana pun yang berhasil
masuk ke halaman.

Permintaan memakai `credentials: "include"` supaya cookie refresh ikut
terkirim lintas situs. Saat jawaban `401` di luar jalur kredensial, `api.ts`
menyegarkan sesi sekali lalu mengulang permintaannya — tanpa itu pengguna
terlempar ke halaman masuk setiap 15 menit.

**`useApi` tidak punya cadangan data tiruan.** Versi awal proyek ini
memilikinya, dan akibatnya halaman tampak baik-baik saja sambil menampilkan
angka karangan — tidak ada yang sadar servernya mati sampai angkanya
dicocokkan dengan basis data. Sekarang kalau gagal, `data` tetap `null` dan
`galat` berisi pesan dari server; halaman wajib menampilkan keadaan itu apa
adanya.

---

## Progres

| | |
| --- | --- |
| ✅ | Sistem desain, token terang & gelap, komponen dasar dan domain |
| ✅ | Layout publik + konsol, navigasi responsif dengan laci di ponsel |
| ✅ | Landing page: video hero, peraga meter interaktif, video penjelasan 90 detik bertakarir |
| ✅ | Publik: status layanan (peta + keandalan 30 hari + kualitas air), lacak pengaduan, rapor kinerja, statistik |
| ✅ | Konsol: dashboard live, pelanggan (8.219 baris, paginasi server), peta jaringan (8.055 pin) |
| ✅ | Responsif 320–1920, aksesibilitas, tema gelap |
| ✅ | Halaman masuk, daftar, lupa sandi, atur ulang, hubungkan meter — panel merek beranimasi (air, tetes, riak, kisi ukur) |
| ✅ | Terhubung ke backend sungguhan di produksi (`api.jernih.biz.id`) |
| ⏳ | Layout portal warga, penjaga rute, refresh sesi — menunggu autentikasi backend (BE#1) |
| ⏳ | Sisa halaman konsol — dikerjakan anggota tim lain |

Rincian tiap halaman ada di **Issues** repo ini.

## Data sementara

Backend **sudah hidup dan dipakai di produksi** — `NEXT_PUBLIC_API_URL`
menunjuk ke sana, dan rute tiruan di bawah ini tidak lagi tersentuh saat
aplikasi berjalan normal. Keduanya ditahan sebagai cadangan peragaan offline
dan sebagai catatan kontrak.

`src/app/api/publik/*` dan `src/app/api/admin/*` menyajikan bentuk jawaban
yang sama persis dengan kontrak BE#2 dan BE#8.

```
/api/publik   status-layanan · riwayat-zona · kinerja · statistik
              neraca-air · lacak/[nomor] · panduan-lacak · unduh
/api/admin    dashboard · pelanggan · pelanggan/[id] · peta
```

Menghapusnya: cukup buang kedua folder itu. Tidak ada perubahan lain yang
diperlukan — halaman tidak tahu dari mana datanya datang, dan memang harus
begitu.

Angkanya **diturunkan, bukan ditulis**: KPI dihitung dari deret trennya, dan
rincian per zona berjumlah persis sama dengan totalnya di setiap rentang.
Angka ringkasan yang tidak bisa dicocokkan dengan rinciannya adalah hal
pertama yang ketahuan.

## Desain

Arah visualnya ada di **[`docs/ARAH-VISUAL.md`](docs/ARAH-VISUAL.md)** —
palet, pasangan huruf, perangkat struktural, dan daftar tampilan yang
**dilarang**. Baca itu sebelum menulis komponen apa pun. Bobot Desain (20%) +
Orisinalitas (20%) = 40% nilai lomba; spesifikasi fungsional saja menghasilkan
tampilan yang bisa dipakai produk mana pun.

Prompt video ada di `docs/PROMPT-VIDEO-PENJELASAN.md`; versi siap salin ada
di `docs/VIDEO-PROMPT-SALIN.md`.

## Konvensi

- **Seluruh teks UI Bahasa Indonesia.** Sapa pengguna dengan "Anda".
- **Tanpa hex di komponen.** Warna hanya lewat token di `globals.css`.
  Satu-satunya pengecualian: warna BENDA, seperti hijau layar LCD — itu
  warna perangkat keras, bukan warna tema, dan tidak ikut berganti.
- **Satuan liter** untuk saldo, token, dan pemakaian; `L/mnt` untuk debit.
  Agregat jaringan di konsol boleh m³.
- **Angka selalu monospace** (`font-mono` + kelas `tabular`) supaya digitnya
  tidak bergoyang saat berubah.
- **Warna status selalu didampingi kata.** Sebagian pengguna tidak bisa
  membedakan warnanya, dan warna hilang maknanya saat dicetak hitam-putih.
- **Lencana berbentuk persegi dengan garis takar**, bukan kapsul dengan titik
  bulat. Kapsul + isi pastel + titik adalah tiga ciri paling khas tampilan
  buatan AI; ketiganya sudah dibuang dari seluruh situs. Jangan dikembalikan.
- **Tema terang dan gelap dua-duanya wajib jalan.**
- `prefers-reduced-motion: reduce` wajib mematikan seluruh animasi.

## Empat jebakan yang pernah memakan waktu berhari-hari

Keempatnya **lolos `build`, lolos `lint`, lolos `typecheck`** — dan tetap salah
di layar. Kalau menyentuh area ini, periksa di browser, jangan percaya build.

**1. Huruf tidak terpakai sama sekali.** `next/font` menaruh `--font-*-src` di
elemen yang diberi kelasnya; token yang memakainya diterbitkan Tailwind di
`:root`. Kalau kelasnya dipasang di `<body>`, token di `:root` menunjuk ke
variabel yang belum ada di sana, nilainya tidak sah, dan seluruh situs diam-diam
memakai huruf bawaan sistem. **Kelas font harus di `<html>`.**
Periksa: `getComputedStyle(document.body).fontFamily`.

**2. `dark:` tidak mengikuti tombol tema.** Di Tailwind v4 varian `dark:`
berarti `prefers-color-scheme`, bukan kelas `.dark`. Tanpa
`@custom-variant dark (&:where(.dark, .dark *))` di `globals.css`, 74 pemakaian
`dark:` mengikuti setelan OS pengunjung, bukan tombol temanya.

**3. Warna status gagal kontras sebagai teks.** `warn`, `success`, `info`, dan
`brand-600` semula dipilih agar bagus di atas latar putih, padahal semuanya
lebih sering dipakai sebagai **teks**. Terburuk 2,94:1 — tepat pada angka yang
paling penting dibaca, yaitu yang sedang di luar ambang. Ukur kontras dari
**piksel tangkapan layar**, bukan dari nilai token.

**4. Peta menuduh WebGL untuk kegagalan apa pun.** Halaman `/status`
produksi menulis "Peramban ini tidak mendukung WebGL" pada peramban yang
WebGL-nya sehat. Dua cacat bertumpuk:

`zona.filter((z) => z.batas !== null && z.batas.length >= 4)` hanya menutup
satu dari dua kemungkinan. Saat server tidak mengirim medan `batas` sama
sekali, nilainya `undefined` — dan `undefined !== null` **bernilai benar**,
sehingga `.length` di baris yang sama melempar. Karena lemparannya terjadi
saat render, yang hilang bukan satu zona melainkan seluruh peta. Pakai
`Array.isArray`, jangan `!== null`.

Lalu batas galat menangkap lemparan **apa pun** dan menampilkan kalimat yang
memastikan sebabnya. Pesan yang menuding hal yang salah mengirim orang
memeriksa kartu grafisnya selama berjam-jam, sementara yang rusak ada di
server. `PesanPetaGagal` sekarang benar-benar memeriksa WebGL sebelum
menyebutnya.

Cara menemukannya: buka halaman produksinya di Chrome lewat DevTools Protocol
dan baca `Runtime.exceptionThrown`. Tidak ada yang terlihat dari membaca kode,
karena kode frontendnya memang sah — yang berubah bentuknya ada di jawaban API.

Satu lagi, bukan bug tapi memakan waktu: **cache CSS Turbopack di dev server
sering basi.** Kalau perubahan `globals.css` tampak tidak berlaku, jangan
simpulkan kodenya salah — hentikan dev server, `rm -rf .next/dev`, jalankan
lagi.

## Animasi

Seluruh gerakan tunduk pada satu aturan: **`prefers-reduced-motion: reduce`
mematikan semuanya**, dijaga menyeluruh di `globals.css` sehingga tidak perlu
diulang per komponen.

| Keyframe | Dipakai di |
| --- | --- |
| `masuk-naik` | Isi halaman masuk berjenjang saat dimuat |
| `geser-air`, `geser-air-balik` | Dua lapis gelombang di panel merek |
| `gelembung` | Gelembung yang naik di dalam air |
| `tetes` | Tetes jatuh dari tepi atas sampai permukaan air |
| `riak` | Lingkaran memuai di titik jatuhnya tetes |
| `kabut` | Dua bentuk kabur yang mengambang di paruh atas |
| `hanyut` | Kisi ukur yang bergeser pelan |
| `naik` | Permukaan air naik saat halaman pertama dibuka |

Tiga hal yang mudah salah dan sudah pernah salah di sini:

**Animasi bertunda tidak menyembunyikan elemennya.** Selama menunggu
gilirannya, yang tampil adalah keadaan statis elemen itu. Enam tetes dengan
`animation-delay` berbeda berdiam sebagai titik terang berjejer di tepi atas
sampai tundanya habis. Beri `opacity-0` sebagai keadaan dasar; keyframe
menimpanya begitu animasi mulai.

**Satu elemen tidak bisa dipusatkan dan dianimasikan sekaligus.**
`transform` dari keyframe menimpa kelas `-translate-x-1/2`, jadi riaknya
memuai dari tepi kiri, bukan dari titik jatuh tetesnya. Pisahkan: pemusatan
di pembungkus, pemuaian di anaknya.

**Gerakan berulang perlu jarak yang pas.** `hanyut` menggeser **tepat satu
petak** kisi (72px) supaya bingkai terakhir jatuh persis di atas bingkai
pertama. Angka itu terikat pada `bg-[size:72px_72px]` di komponennya;
mengubah salah satunya saja memunculkan lompatan tiap putaran.

---

## Pemecahan masalah

**Semua angka tampil "—" atau rangka pemuatan tidak pernah selesai.**
CORS. Asal yang dipakai peramban tidak terdaftar di backend. `localhost:3000`
dan `127.0.0.1:3000` adalah asal yang **berbeda**; hanya yang pertama
terdaftar. Buka tab Network, cari jawaban yang kehilangan header
`Access-Control-Allow-Origin`.

**Mengubah `NEXT_PUBLIC_API_URL` di Vercel tidak berpengaruh.**
`NEXT_PUBLIC_*` disisipkan saat **build**, bukan dibaca saat jalan. Perlu
build ulang.

**Perubahan `globals.css` tampak tidak berlaku di dev.**
Cache CSS Turbopack basi. Hentikan dev server, `rm -rf .next/dev`, jalankan
lagi. Jangan simpulkan kodenya salah lebih dulu.

**Peta kosong atau setinggi nol.**
`<Map>` mengisi induknya; induk tanpa tinggi menghasilkan kanvas setinggi nol
— petanya "hilang" padahal sudah jalan. Tinggi wajib ditentukan di pembungkus.

**Peta bilang WebGL tidak didukung.**
Belum tentu benar. Lihat [jebakan keempat](#empat-jebakan-yang-pernah-memakan-waktu-berhari-hari);
periksa `Runtime.exceptionThrown` sebelum mempercayai pesannya.

**Tangkapan layar otomatis memperlihatkan grafik tanpa garis.**
Artefak alat, bukan aplikasi. `captureBeyondViewport` mengubah ukuran
viewport saat memotret, Recharts merender ulang, dan animasi garisnya mulai
dari nol. Potret di viewport biasa setelah menggulir ke grafiknya.

---

## Penyebaran

Produksi berjalan di **Vercel**, terhubung ke cabang `main` — setiap merge
memicu build dan rilis otomatis.

Variabel lingkungan yang harus ada di Vercel:

| Nama | Nilai |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.jernih.biz.id` |

`NEXT_PUBLIC_*` **disisipkan saat build**, bukan dibaca saat jalan. Mengubah
nilainya di dasbor Vercel tidak berpengaruh apa pun sampai ada build baru.

Dua hal soal domain yang pernah memakan waktu:

- **Apex dan `www` adalah asal yang berbeda bagi peramban.** `jernih.biz.id`
  dialihkan 308 ke `www.jernih.biz.id`, dan pengalihan itu MENGUBAH header
  `Origin` yang sampai ke backend. Kalau hanya salah satu yang terdaftar di
  CORS backend, seluruh halaman tampil sebagai rangka pemuatan tanpa satu pun
  pesan galat yang menjelaskan kenapa.
- **Catatan DNS-nya diproksikan Cloudflare (awan oranye).** Untuk `api.`
  proksi itu yang menutup Cloudflare Tunnel ke server; jangan diubah ke
  DNS-only.

---

## Yang diukur, bukan dikira

| | |
| --- | --- |
| Kontras teks | 0 gagal dari 1.614 teks (5 halaman × 2 tema, diukur dari piksel) |
| Responsif | 320–1920px: 0 gulir mendatar, 0 teks terpotong |
| Sasaran sentuh | 0 di bawah 44×44px, kecuali atribusi peta yang ukurannya diatur penyedianya |
| Konsistensi data | legenda peta == jumlah pin; neraca air == total kehilangan di tiga rentang |
| Build | 45 entri rute (33 halaman + 12 rute API tiruan), `tsc` dan `eslint` bersih |
