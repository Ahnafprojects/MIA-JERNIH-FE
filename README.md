# Jernih — Frontend

Platform transparansi layanan air PDAM: warga memantau pemakaian, saldo, dan
pengaduannya secara real-time, sementara data layanan dan kinerja instansi
terbuka untuk publik tanpa perlu login.

Dibuat untuk **Web In Action — Multimedia In Action (MIA) 2026**, subtema
**Public Service Tracking**.

## Tech stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS v4 (token di `src/app/globals.css`) |
| Peta | MapLibre GL + react-map-gl, basemap CARTO vector (tanpa API key) |
| Grafik | Recharts |
| Validasi | Zod |
| Ikon | lucide-react |

Backend terpisah: [MIA-JERNIH-BE](https://github.com/Ahnafprojects/MIA-JERNIH-BE)
(Express + Prisma + PostgreSQL).

## Cara menjalankan

```bash
# 1. clone
git clone https://github.com/Ahnafprojects/MIA-JERNIH-FE.git
cd MIA-JERNIH-FE

# 2. install
npm install

# 3. konfigurasi
cp .env.example .env.local
# isi NEXT_PUBLIC_API_URL dengan alamat backend yang sedang berjalan

# 4. run
npm run dev
```

Buka http://localhost:3000.

Perintah lain:

```bash
npm run build      # build produksi
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Struktur

```
src/
├── app/
│   ├── page.tsx           landing publik
│   ├── (publik)/          tanpa login — status, lacak, kinerja, statistik
│   ├── (auth)/            masuk, daftar, verifikasi, hubungkan meter
│   ├── (portal)/          warga — beranda, token, beli, pemakaian, meter, …
│   └── (konsol)/konsol/   petugas PDAM — dashboard, pelanggan, insiden, …
├── components/
│   ├── ui/                komponen dasar lintas halaman
│   └── peta/              pembungkus MapLibre
├── lib/                   api.ts · format.ts · cn.ts
└── types/
```

Satu aplikasi melayani tiga peran. Tampilan menyesuaikan siapa yang masuk —
bukan tiga website terpisah.

## Progres saat ini

- [x] Fondasi proyek: Next.js 16 + TypeScript + Tailwind v4
- [x] Token desain (terang & gelap), format angka Indonesia, pembungkus API
- [x] Kerangka rute: 32 halaman dengan placeholder
- [x] Sistem desain + komponen dasar dan komponen domain
- [x] Layout publik dan navigasi
- [x] Landing page dengan peraga meter interaktif
- [x] Halaman publik: status layanan, lacak pengaduan, rapor kinerja, statistik
- [ ] Autentikasi & onboarding
- [ ] Portal warga
- [ ] Konsol petugas

> Backend (`MIA-JERNIH-BE`) masih dikerjakan. Sementara ini halaman publik
> dilayani rute `src/app/api/publik/*` di dalam aplikasi ini, dengan bentuk
> jawaban yang sama persis dengan kontrak BE#2. Begitu backend siap: arahkan
> `NEXT_PUBLIC_API_URL` ke sana dan hapus folder tersebut — tidak ada
> perubahan lain yang diperlukan.

Rincian tiap halaman ada di **Issues** repo ini.

## Konvensi

- **Seluruh teks UI Bahasa Indonesia.** Sapa pengguna dengan "Anda".
- **Tanpa hex di komponen.** Warna hanya lewat token Tailwind di `globals.css`.
- **Satuan liter** untuk saldo, token, dan pemakaian; `L/mnt` untuk debit.
  Agregat jaringan di konsol boleh m³.
- **Warna status selalu didampingi kata** ("Aktif", "Offline"), tidak pernah
  warna saja — sebagian pengguna tidak bisa membedakannya.
- **Tema terang dan gelap dua-duanya wajib jalan.**
