# Panduan untuk agen — Jernih Frontend

Dibaca otomatis oleh Claude Code, Cursor, dan agen sejenis.
Berlaku untuk manusia maupun agen.

> Simpan berkas ini di folder repo, TAPI jangan di-commit. Kedua repo
> sudah memasukkan `AGENTS.md` ke `.gitignore`, jadi git akan
> mengabaikannya dengan sendirinya.

## Konteks

Jernih adalah platform transparansi layanan air PDAM untuk lomba **Web In
Action MIA 2026**, subtema **Public Service Tracking**. Satu aplikasi, tiga
peran: publik (tanpa login), warga, dan petugas PDAM.

Backend terpisah di repo `MIA-JERNIH-BE` (Express + Prisma + PostgreSQL).

## Yang dinilai juri — pengaruhnya ke keputusan teknis

| Kriteria | Bobot | Artinya saat menulis kode |
| --- | --- | --- |
| Fungsionalitas | 25% | Fitur setengah jadi lebih merugikan daripada fitur tidak ada. Jangan tinggalkan tombol mati. |
| Orisinalitas & konsep | 20% | Jangan menyalin tata letak template populer mentah-mentah. |
| Desain & estetika | 20% | Konsisten di semua halaman. Satu sistem, bukan 30 gaya. |
| Konten & informasi | 20% | Setiap angka diberi label dan konteks. Jangan ada angka telanjang. |
| Kesesuaian tema | 15% | Transparansi adalah intinya — utamakan halaman publik. |

Responsif disebut eksplisit di rubrik. Tampilan ponsel bukan bonus.

## Aturan yang tidak boleh dilanggar

1. **Bahasa Indonesia untuk seluruh teks UI.** Sapa pengguna dengan "Anda",
   bukan "kamu". Tanpa emoji.
2. **Tanpa hex di komponen.** Warna hanya dari token di `src/app/globals.css`
   (`bg-canvas`, `text-ink`, `border-line`, `text-brand-600`). Tema gelap
   dikerjakan dengan menukar token; hex yang berserak tidak ikut berubah.
3. **Satuan liter** untuk saldo, token, paket, pemakaian. Debit `L/mnt`.
   Agregat jaringan di konsol boleh m³ (1 m³ = 1.000 L).
4. **Angka lewat `src/lib/format.ts`.** Jangan `toLocaleString` langsung —
   format Indonesia (titik ribuan, koma desimal) harus seragam.
5. **Warna status selalu berpasangan dengan kata.** Badge hijau wajib
   bertuliskan "Aktif". Warna saja tidak terbaca oleh sebagian pengguna.
6. **Aksi berisiko minta konfirmasi.** Tutup relay, kirim broadcast, ubah
   tarif: minta alasan dulu, lalu konfirmasi geser.
7. **Token = angka saja, 4–10 digit, sekali pakai, terikat satu meter.**
   Tampilkan per lima digit (`48217 73015`), kirim ke server tanpa spasi.
8. **Jangan menampilkan kode token lengkap** selain tepat setelah pembelian
   berhasil. Server hanya mengirimnya sekali.

## Cara kerja

- Satu issue = satu PR. Jangan menggabung beberapa halaman dalam satu PR.
- Sebelum menulis halaman baru, **baca dulu komponen yang sudah ada** di
  `src/components/ui`. Jangan membuat tombol versi kelima.
- Jalankan `npm run typecheck && npm run lint` sebelum push. Keduanya harus
  bersih — jangan mematikan aturan lint untuk membuatnya lolos.
- Setiap halaman wajib dicoba di lebar **390px dan 1440px** sebelum ditutup.
- Keadaan kosong, memuat, dan galat ikut dikerjakan — bukan hanya jalur mulus.
  Juri akan membuka halaman tanpa data.

## Jebakan yang sudah pernah menjatuhkan proyek ini

Dicatat supaya tidak terulang:

- **401 dari `/auth/*` bukan "sesi berakhir".** Itu artinya kata sandi salah.
  Sudah ditangani di `src/lib/api.ts` — jangan dibalik lagi.
- **`kpi` dari backend berbentuk array**, bukan objek. Cari lewat `key`,
  jangan lewat indeks, dan jangan pernah mencocokkan `label`.
- **Tile raster CARTO menuntut API key** dan membalas petak bertuliskan
  "API KEY REQUIRED". Pakai gaya **vector** (`.../style.json`) yang gratis.
- **Pembelian token tidak menambah saldo meter.** Server menerbitkan token dan
  mengirimkannya ke meter; yang menambah saldo adalah METER. Jangan menulis
  "saldo bertambah" di layar pembelian.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
