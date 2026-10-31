# Jernih — Frontend

Antarmuka platform transparansi layanan air PDAM. Warga memantau pemakaian, saldo, dan pengaduannya secara langsung, sementara data layanan dan kinerja instansi terbuka untuk publik tanpa perlu akun.

Dibuat untuk **Web In Action — Multimedia In Action (MIA) 2026**.

Tiga sub-tema yang dipilih, beserta halaman yang mewujudkannya:

| Sub-tema | Halamannya |
| --- | --- |
| **Public Service Tracking** | `/lacak` melacak pengaduan dengan nomor tiket tanpa login, lengkap dengan janji waktu, kronologi penanganan, dan tanda tepat atau terlambat. `/status` memantau kondisi tiap zona lewat peta dan riwayat gangguan. |
| **Open Government Data** | `/statistik` menyajikan neraca air, tolok ukur, dan tren 12 bulan, dengan data mentah yang bisa diunduh sebagai CSV atau JSON berlisensi CC BY 4.0. Alamat API-nya ditampilkan di halaman supaya bisa dipanggil langsung. |
| **Civic Reporting & Accountability** | Alur pengaduan warga dari laporan sampai penugasan teknisi, dan `/kinerja` yang melaporkan ketepatan penanganan termasuk yang terlambat, bukan hanya yang berhasil. |

| | |
| --- | --- |
| Situs produksi | <https://jernih.biz.id> |
| API | <https://api.jernih.biz.id> ([repositori backend](https://github.com/Ahnafprojects/MIA-JERNIH-BE)) |
| Halaman | 33 halaman dalam empat kelompok peran |

Gagasan yang menyatukan seluruh halaman: melacak layanan publik berarti melihatnya sepanjang waktu, bukan satu jepretan. Janji, lalu kenyataan, termasuk ketika kenyataannya meleset.

## Daftar isi

1. [Tech stack](#tech-stack)
2. [Menjalankan proyek](#menjalankan-proyek)
3. [Progres saat ini](#progres-saat-ini)
4. [Peta rute](#peta-rute)
5. [Struktur direktori](#struktur-direktori)
6. [Pengambilan data](#pengambilan-data)
7. [Sistem desain](#sistem-desain)
8. [Penyebaran](#penyebaran)
9. [Yang diukur, bukan dikira](#yang-diukur-bukan-dikira)

Catatan teknis yang lebih dalam — animasi, jebakan yang pernah memakan waktu,
dan pemecahan masalah — ada di [`docs/CATATAN-TEKNIS.md`](docs/CATATAN-TEKNIS.md).

## Tech stack

| Lapisan | Pilihan | Catatan |
| --- | --- | --- |
| Framework | Next.js 16.4 | App Router, Turbopack, Partial Prerendering |
| UI | React 19.3 | Server dan client component |
| Bahasa | TypeScript 5 | Mode ketat |
| Styling | Tailwind CSS v4 | Token warna di `src/app/globals.css`, tanpa berkas config |
| Huruf | Fraunces, Public Sans, JetBrains Mono | Dimuat lewat `next/font` |
| Peta | MapLibre GL 6 dan react-map-gl | Basemap vektor CARTO, tanpa API key |
| Grafik | Recharts 3 | Deret waktu dan perbandingan |
| Validasi | Zod 4 | Validasi formulir |
| Ikon | lucide-react | |

Backend terpisah: [MIA-JERNIH-BE](https://github.com/Ahnafprojects/MIA-JERNIH-BE), dibangun dengan Express 5, Prisma 7, dan PostgreSQL.

## Menjalankan proyek

### Prasyarat

- Node.js 22 atau lebih baru
- npm 10 atau lebih baru

### Langkah

```bash
git clone https://github.com/Ahnafprojects/MIA-JERNIH-FE.git
cd MIA-JERNIH-FE
npm install
cp .env.example .env.local
npm run dev
```

Buka <http://localhost:3000>.

### Konfigurasi

Hanya satu variabel yang wajib diisi di `.env.local`:

```ini
NEXT_PUBLIC_API_URL=https://api.jernih.biz.id
```

Backend produksi sudah berjalan, jadi tidak ada yang perlu dinyalakan selain perintah di atas. Untuk menunjuk backend lokal, ganti nilainya menjadi `http://localhost:4000` dan pastikan asal yang dipakai terdaftar di konfigurasi CORS backend. Perlu diperhatikan bahwa `http://localhost:3000` terdaftar sedangkan `http://127.0.0.1:3000` tidak, dan keduanya adalah asal yang berbeda bagi peramban.

### Perintah lain

```bash
npm run build      # build produksi
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm start          # menjalankan hasil build
```

## Progres saat ini

Seluruh halaman publik, autentikasi, portal warga, dan konsol petugas sudah terhubung ke backend sungguhan di produksi.

| Status | Bagian |
| --- | --- |
| Selesai | Sistem desain, token tema terang dan gelap, komponen dasar dan domain |
| Selesai | Layout publik dan konsol, navigasi responsif dengan laci di ponsel |
| Selesai | Landing page: video hero, peraga meter interaktif, video penjelasan 90 detik bertakarir |
| Selesai | Halaman publik: status layanan, lacak pengaduan, rapor kinerja, statistik |
| Selesai | Halaman statistik: neraca air, tolok ukur, tren 12 bulan, unduhan CSV dan JSON |
| Selesai | Autentikasi: masuk, daftar, verifikasi, lupa sandi, atur ulang, hubungkan meter |
| Selesai | Panel merek beranimasi di halaman autentikasi: air, tetes, riak, kisi ukur |
| Selesai | Portal warga dan konsol petugas dengan penjaga rute berbasis peran |
| Selesai | Terhubung ke `api.jernih.biz.id` di produksi, tanpa data tiruan |
| Selesai | Responsif 320–1920 px, aksesibilitas, tema gelap |
| Berjalan | Penyempurnaan halaman konsol bersama anggota tim lain |
| Belum | Notifikasi push dan mode luring |

Rincian tiap halaman ada di **Issues** repositori ini.

## Peta rute

33 halaman dalam empat kelompok. Satu aplikasi melayani tiga peran, dan tampilannya menyesuaikan siapa yang masuk, bukan tiga situs terpisah.

### `(publik)` — tanpa akun

| Rute | Isi |
| --- | --- |
| `/` | Landing: hero video, peraga meter interaktif, pita angka jaringan |
| `/status` | Status tiap zona: peta, keandalan 30 hari, kualitas air, riwayat gangguan |
| `/lacak` | Lacak pengaduan dengan nomor tiket, janji waktu, alur penanganan, kanal lapor |
| `/kinerja` | Rapor kinerja SLA: ketepatan, waktu tanggap, rincian per kategori |
| `/statistik` | Neraca air, tolok ukur, tren 12 bulan, pemakaian per orang, unduhan data |

### `(auth)` — pintu masuk

`/masuk`, `/daftar`, `/verifikasi`, `/lupa-sandi`, `/atur-ulang`, `/hubungkan-meter`

Seluruhnya berbagi `AuthShell`: panel merek beranimasi di kiri, formulir di kanan.

### `(portal)` — warga

`/beranda`, `/meter`, `/token`, `/beli`, `/bayar/[invoice]`, `/pemakaian`, `/riwayat`, `/notifikasi`, `/akun`, `/bantuan`

### `(konsol)` — petugas PDAM

`/konsol`, `/pelanggan`, `/pelanggan/[id]`, `/perangkat`, `/peta`, `/insiden`, `/token`, `/analitik`, `/laporan`, `/audit`, `/broadcast`, `/pengaturan`

## Struktur direktori

```text
src/
├── app/
│   ├── (publik)/          Tanpa login: landing, status, lacak, kinerja, statistik
│   ├── (auth)/            Masuk, daftar, verifikasi, hubungkan meter
│   ├── (portal)/          Warga: beranda, token, beli, pemakaian, meter
│   ├── (konsol)/konsol/   Petugas: dasbor, pelanggan, peta, insiden
│   ├── api/               Rute tiruan, cadangan peragaan luring
│   └── globals.css        Token warna, utilitas, keyframe animasi
├── components/
│   ├── ui/                Komponen dasar lintas halaman
│   ├── domain/            LCD, peraga meter, grafik, kolom air, angka berjalan
│   ├── auth/              AuthShell dan panel air beranimasi
│   ├── peta/              Pembungkus MapLibre dan penanganan kegagalannya
│   └── layout/            Logo, bilah atas, navigasi
├── lib/                   api, use-api, auth-context, penjaga-rute, format, cn
└── types/                 Kontrak data dari backend
```

## Pengambilan data

```text
src/lib/
├── api.ts            Pembungkus fetch, ApiError, refresh otomatis saat 401
├── use-api.ts        Hook pengambilan untuk komponen klien
├── auth-context.tsx  Keadaan sesi
├── penjaga-rute.tsx  Penjaga halaman menurut peran
├── format.ts         Angka, tanggal, satuan. Seluruh pemformatan lewat sini
├── cn.ts             Penggabung kelas
└── hemat-gerak.ts    Pembacaan prefers-reduced-motion
```

Tiga keputusan yang tidak terbaca dari komponen.

**Access token disimpan di memori, bukan `localStorage`.** Refresh token berada di cookie `httpOnly` yang tidak dapat dibaca JavaScript. Token yang tersimpan di `localStorage` bisa diambil skrip pihak ketiga mana pun yang berhasil masuk ke halaman.

**Permintaan memakai `credentials: "include"`.** Cookie refresh ikut terkirim lintas situs. Saat jawaban `401` muncul di luar jalur kredensial, `api.ts` menyegarkan sesi sekali lalu mengulang permintaannya. Tanpa itu, pengguna terlempar ke halaman masuk setiap 15 menit.

**`useApi` tidak punya cadangan data tiruan.** Versi awal proyek ini memilikinya, dan akibatnya halaman tampak baik-baik saja sambil menampilkan angka karangan. Tidak ada yang menyadari servernya mati sampai angkanya dicocokkan dengan basis data. Sekarang, kalau permintaan gagal, `data` tetap `null` dan `galat` berisi pesan dari server, lalu halaman menampilkan keadaan itu apa adanya.

Rute tiruan di `src/app/api/` tidak tersentuh saat aplikasi berjalan normal, karena `NEXT_PUBLIC_API_URL` menunjuk ke backend sungguhan. Keduanya ditahan sebagai cadangan peragaan luring dan sebagai catatan kontrak data.

## Sistem desain

Arah visual lengkap ada di [`docs/ARAH-VISUAL.md`](docs/ARAH-VISUAL.md): palet, pasangan huruf, perangkat struktural, dan daftar tampilan yang dilarang. Baca berkas itu sebelum menulis komponen baru.

Konvensi yang berlaku di seluruh berkas:

- **Seluruh teks antarmuka berbahasa Indonesia.** Pengguna disapa dengan "Anda".
- **Tanpa nilai hex di komponen.** Warna hanya lewat token di `globals.css`. Satu-satunya pengecualian adalah warna benda, seperti hijau layar LCD, karena itu warna perangkat keras dan tidak ikut berganti saat tema berubah.
- **Satuan liter** untuk saldo, token, dan pemakaian. `L/mnt` untuk debit. Agregat jaringan di konsol boleh memakai m³.
- **Angka selalu monospace** dengan kelas `font-mono` dan `tabular`, supaya digitnya tidak bergoyang saat berubah.
- **Warna status selalu didampingi kata.** Sebagian pengguna tidak dapat membedakan warnanya, dan warna kehilangan maknanya saat dicetak hitam putih.
- **Lencana berbentuk persegi dengan garis takar**, bukan kapsul dengan titik bulat.
- **Tema terang dan gelap sama-sama wajib berfungsi.** Bawaannya terang.
- **`prefers-reduced-motion: reduce` wajib mematikan seluruh animasi.**

## Penyebaran

Produksi berjalan di Vercel, terhubung ke cabang `main`. Setiap merge memicu build dan rilis otomatis.

Variabel lingkungan yang harus ada di Vercel:

| Nama | Nilai |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.jernih.biz.id` |

Variabel berawalan `NEXT_PUBLIC_` disisipkan saat build, bukan dibaca saat jalan. Mengubah nilainya di dasbor Vercel tidak berpengaruh sampai ada build baru.

Dua hal tentang domain yang pernah memakan waktu:

- **Apex dan `www` adalah asal yang berbeda bagi peramban.** Alamat `jernih.biz.id` dialihkan dengan status 308 ke `www.jernih.biz.id`, dan pengalihan itu mengubah header `Origin` yang sampai ke backend. Kalau hanya salah satu yang terdaftar di CORS backend, seluruh halaman tampil sebagai rangka pemuatan tanpa satu pun pesan galat yang menjelaskan sebabnya.
- **Catatan DNS diproksikan Cloudflare.** Untuk subdomain `api.`, proksi itulah yang menutup Cloudflare Tunnel ke server, sehingga jangan diubah menjadi DNS-only.

## Yang diukur, bukan dikira

| Aspek | Hasil |
| --- | --- |
| Kontras teks | 0 gagal dari 1.614 teks, diukur dari piksel pada 5 halaman x 2 tema |
| Responsif | 320–1920 px: 0 gulir mendatar, 0 teks terpotong |
| Sasaran sentuh | 0 di bawah 44x44 px, kecuali atribusi peta yang ukurannya diatur penyedianya |
| Konsistensi data | Legenda peta sama dengan jumlah pin; neraca air sama dengan total kehilangan di tiga rentang |
| Build | 45 entri rute (33 halaman dan 12 rute tiruan), `tsc` dan `eslint` bersih |

## Tim

**EZ WIN INI MAH** — Web In Action, Multimedia In Action 2026.
