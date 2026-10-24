# Jernih — Frontend

Platform transparansi layanan air PDAM: warga memantau pemakaian, saldo, dan
pengaduannya seketika, sementara data layanan dan kinerja instansi terbuka
untuk publik tanpa perlu akun.

Dibuat untuk **Web In Action — Multimedia In Action (MIA) 2026**, subtema
**Public Service Tracking**.

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

**Backend belum wajib jalan.** Halaman publik dan konsol dilayani rute tiruan
di dalam aplikasi ini — lihat [Data sementara](#data-sementara).

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

32 halaman. Satu aplikasi melayani tiga peran — tampilan menyesuaikan siapa
yang masuk, bukan tiga website terpisah.

## Progres

| | |
| --- | --- |
| ✅ | Sistem desain, token terang & gelap, komponen dasar dan domain |
| ✅ | Layout publik + konsol, navigasi responsif dengan laci di ponsel |
| ✅ | Landing page: video hero, peraga meter interaktif, video penjelasan 90 detik bertakarir |
| ✅ | Publik: status layanan (peta + keandalan 30 hari + kualitas air), lacak pengaduan, rapor kinerja, statistik |
| ✅ | Konsol: dashboard live, pelanggan (8.219 baris, paginasi server), peta jaringan (8.055 pin) |
| ✅ | Responsif 320–1920, aksesibilitas, tema gelap |
| ⏳ | Layout portal warga, penjaga rute, refresh sesi — menunggu autentikasi backend (BE#1) |
| ⏳ | Autentikasi, portal warga, sisa halaman konsol — dikerjakan anggota tim lain |

Rincian tiap halaman ada di **Issues** repo ini.

## Data sementara

Backend masih dikerjakan. Sementara ini `src/app/api/publik/*` dan
`src/app/api/admin/*` menyajikan bentuk jawaban yang **sama persis** dengan
kontrak BE#2 dan BE#8.

```
/api/publik   status-layanan · riwayat-zona · kinerja · statistik
              neraca-air · lacak/[nomor] · panduan-lacak · unduh
/api/admin    dashboard · pelanggan · pelanggan/[id] · peta
```

Mematikannya nanti: arahkan `NEXT_PUBLIC_API_URL` ke backend sungguhan, lalu
hapus kedua folder itu. Tidak ada perubahan lain yang diperlukan — halaman
tidak tahu dari mana datanya datang, dan memang harus begitu.

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

Prompt video ada di `docs/PROMPT-VIDEO-PENJELASAN.md`; versi siap salin ke
Claude ada di `docs/VIDEO-PROMPT-SALIN.md`.

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

## Tiga jebakan yang pernah memakan waktu berhari-hari

Ketiganya **lolos `build`, lolos `lint`, lolos `typecheck`** — dan tetap salah
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

Satu lagi, bukan bug tapi memakan waktu: **cache CSS Turbopack di dev server
sering basi.** Kalau perubahan `globals.css` tampak tidak berlaku, jangan
simpulkan kodenya salah — hentikan dev server, `rm -rf .next/dev`, jalankan
lagi.

## Yang diukur, bukan dikira

| | |
| --- | --- |
| Kontras teks | 0 gagal dari 1.614 teks (5 halaman × 2 tema, diukur dari piksel) |
| Responsif | 320–1920px: 0 gulir mendatar, 0 teks terpotong |
| Sasaran sentuh | 0 di bawah 44×44px, kecuali atribusi peta yang ukurannya diatur penyedianya |
| Konsistensi data | legenda peta == jumlah pin; neraca air == total kehilangan di tiga rentang |
| Build | 45 halaman, `tsc` dan `eslint` bersih |
