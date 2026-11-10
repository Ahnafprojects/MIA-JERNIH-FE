# Arah visual Jernih

> Acuan desain untuk seluruh repo ini. Bobot **Desain 20%** +
> **Orisinalitas 20%** = 40% nilai lomba. Spesifikasi fungsional saja
> menghasilkan tampilan bawaan yang dibuat siapa pun untuk halaman apa pun.

### Konsep: "membaca air"

Nama produknya berarti **tembus pandang**. Halaman harus terasa seperti
melihat *menembus* sesuatu yang bening ke arah angka — bukan layar gelap
berisi kartu.

### Palet (sudah ada di `globals.css` — pakai token, jangan tulis hex)

| Token | Peran |
| --- | --- |
| `canvas` `#F4F8F9` | dasar, air jernih di bawah cahaya |
| `surface` `#FFFFFF` | permukaan terangkat |
| `silt` `#DFEBEE` | netral untuk pita seksi berselang |
| `brand-500` `#00A6C8` | satu-satunya aksen |
| `brand-600` `#0A6B85` | **satu-satunya** nada merek untuk teks kecil |
| `ink` `#08222C` | tinta, bukan hitam |
| `accent` `#00D1D1` | **hanya** data hidup dan momen interaksi |

`silt` semula netral hangat (`#E8E3D8`), lalu diganti nada biru pucat yang
sekeluarga dengan `canvas`: pita seksi berselang cukup dibedakan oleh
kedalamannya, tanpa warna kedua yang bersaing dengan aksen. Nilai lengkap
kedua tema ada di `src/app/globals.css`. Warna status
(`success`/`warn`/`danger`) **terpisah dari aksen** dan tidak dihitung
sebagai aksen.

### Huruf

- **Bricolage Grotesque** — judul. Grotesk editorial yang tidak mungkin
  tertukar dengan huruf bawaan.
- **Plus Jakarta Sans** — teks badan.
- **IBM Plex Mono** — semua angka, dengan `.tabular`. Wataknya kelembagaan,
  bukan terminal.

Susunan pertama (Fraunces, Public Sans, JetBrains Mono) sudah ditinggalkan.
JetBrains Mono paling lekat dengan perkakas pengembang, sehingga setiap angka
terbaca "dibuat mesin".

Judul pakai `tracking-[-0.02em]` dan `text-wrap: balance`. Baris teks jangan
lebih dari ±65 karakter.

### Perangkat struktural: garis takar

Kelas `.takar` dan `.takar-tegak` meniru garis ukur pada gelas takar. Dipakai
sebagai pembatas seksi dan sisi tabung. Diambil dari dunia subjeknya sendiri —
mengukur air — **bukan hiasan yang bisa ditempel di halaman mana pun.**

### Yang DILARANG

Ini daftar tampilan yang paling sering dihasilkan dan paling cepat terlupa:

- ❌ Grid kartu membulat seragam untuk segala hal. Pertimbangkan **daftar
  bergaris** atau **tabel** dulu — keduanya terbaca sebagai catatan publik,
  dan harga memang untuk dibandingkan.
- ❌ `rounded-lg` di mana-mana, bayangan di setiap kotak. Kartu dipisah
  **garis**; bayangan hanya untuk yang benar-benar melayang (dialog, sheet,
  toast).
- ❌ Emoji sebagai penanda seksi.
- ❌ Semua rata tengah.
- ❌ Hero raksasa berisi teks besar saja. Buka dengan hal paling khas dari
  dunia subjeknya.
- ❌ Gradien ungu-biru, krem hangat + serif + terakota, near-black dengan satu
  aksen neon.
- ❌ Penanda bernomor `01 / 02 / 03` kecuali isinya **memang urutan**.

### Yang DIHARAPKAN

- **Tunjukkan, jangan jelaskan.** Kolom air di landing menyusut tiap detik
  sebesar debitnya. Itu menjelaskan produk lebih cepat dari paragraf mana pun.
- **Satu keberanian, sisanya tenang.** Kalau sebuah halaman punya momen
  mencolok, bagian lain justru harus sunyi.
- **Dua tema digarap setara.** Jangan membalik nilai; `silt` di tema gelap
  jadi lumpur gelap, bukan abu terang yang dibalik.
- **Angka diberi label dan satuan.** Tidak ada angka telanjang.
- **Nilai hilang tampil "—", bukan 0.** Nol terbaca sebagai hasil pengukuran.
- **Responsif bukan pekerjaan akhir.** Periksa 390px sambil menulis.

### Sebelum menutup issue, tanyakan ini

> *Kalau nama dan warnanya diganti, apakah halaman ini masih bisa dipakai
> produk lain mana pun?*

Kalau jawabannya ya, desainnya belum selesai.
