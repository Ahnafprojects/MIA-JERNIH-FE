# Prompt video penjelasan Jernih — 90 detik

Untuk digenerate di model video generatif. Salin **seluruh** isi blok di bawah sebagai satu
prompt. Bagian "Spesifikasi teknis" dan "Jangan" ikut disalin — keduanya yang
paling menentukan hasilnya tidak terlihat seperti template.

Video ini BUKAN video hero. Hero memakai `jernih-hero.mp4` (20 detik, tanpa
teks, diputar berulang sebagai latar). Yang ini video penjelasan
yang diputar atas permintaan pengguna di seksi tersendiri — bukan latar,
dan tidak pernah berjalan sendiri.

---

## PROMPT — salin dari sini

Buatkan video motion graphics penjelasan produk, durasi **90 detik**, rasio
**16:9**, **1920×1080**, 30 fps. Seluruh teks pada layar DAN seluruh narasi
suara dalam **Bahasa Indonesia**. Ada narasi suara yang menjelaskan — naskah
lengkapnya ada di bagian "Narasi" di bawah, sudah dihitung agar muat di tiap
adegan. Teks pada layar tetap ada dan BUKAN salinan narasi: teks menampilkan
angka dan label, narasi menjelaskan maknanya. Sediakan juga berkas takarir
(SRT) terpisah berisi narasinya.

### Produk

**Jernih** — platform transparansi layanan air PDAM. Warga memantau pemakaian,
saldo, dan pengaduannya secara langsung; sementara data layanan dan kinerja
instansi terbuka untuk siapa pun tanpa perlu akun. Perangkatnya meter air
prabayar: warga membeli air dalam satuan liter, memasukkan kode token di
keypad meter, dan keran menyala.

Dibuat untuk lomba **MIA 2026, subtema "Public Service Tracking"**. Gagasan
inti yang harus terasa di sepanjang video: **melacak layanan publik berarti
melihatnya sepanjang waktu — bukan satu jepretan.** Janji, lalu kenyataan.

### Sistem visual — WAJIB dipatuhi persis

Warna (ambil persis, jangan diganti senada):

| Peran | Hex |
| --- | --- |
| Biru merek utama | `#00a6c8` |
| Biru tua | `#0b4a5e` |
| Biru paling tua / latar gelap | `#08222c` |
| Aksen hidup (hanya untuk data yang bergerak) | `#00d1d1` |
| Latar terang | `#f4f8f9` |
| Putih permukaan | `#ffffff` |
| Teks utama | `#08222c` |
| Teks redup | `#46626c` |
| Hijau "baik" | `#0f6e4b` |
| Jingga tua "perlu perhatian" | `#96530a` |
| Merah bata "gangguan" | `#b23a32` |
| Hijau layar LCD | `#b8d94e` dengan teks `#1d2c08` |

Huruf:
- Judul besar: **Fraunces** (serif, tebal, agak padat). Ini wajah mereknya.
- Teks penjelas: **Public Sans** (sans-serif, netral, bersih).
- SEMUA angka: **JetBrains Mono**. Angka di produk ini selalu monospace —
  itu yang membuatnya terbaca sebagai hasil ukur, bukan hiasan.

Motif struktural yang harus muncul berulang: **garis takar** — garis-garis
pendek seperti pada sisi gelas ukur atau kertas milimeter. Dipakai sebagai
pembatas antar adegan, sumbu grafik, dan tekstur latar yang sangat samar.
Ini motif milik produk; jangan diganti garis dekoratif biasa.

Palet keseluruhan **biru-air pada latar terang**. Boleh ada satu-dua adegan
berlatar gelap `#08222c` untuk kontras, tapi tema pokoknya terang.

### Adegan

**1 — 0:00–0:08 · Masalahnya**
Layar putih. Satu lembar tagihan air jatuh perlahan dari atas dan mendarat.
Angka di tagihan kabur, tidak terbaca. Kamera mendekat; angkanya tetap kabur.
Teks muncul huruf demi huruf: *"Tiap akhir bulan, satu angka datang."*
Lalu di bawahnya, lebih kecil: *"Dari mana asalnya?"*

**2 — 0:08–0:17 · Pertanyaan yang tidak terjawab**
Tagihan itu menyusut jadi satu titik, lalu dari titik itu muncul tanda tanya
yang tersusun dari garis takar. Di sekelilingnya melayang potongan kalimat
pendek yang memudar satu per satu: *"Meterannya benar?"*, *"Kok naik?"*,
*"Lapor ke siapa?"*, *"Sudah diperbaiki belum?"*. Nadanya tenang, bukan
dramatis — ini keresahan sehari-hari, bukan bencana.

**3 — 0:17–0:28 · Jernih masuk**
Seluruh layar terisi air biru `#00a6c8` yang naik dari bawah, tembus pandang,
dengan gelembung halus. Saat air melewati tengah layar, logo **Jernih**
(dua tetes air) tersusun dari riak. Judul besar Fraunces muncul:
**"Airnya jernih. Layanannya juga."**
Di bawahnya, Public Sans: *"Angka yang sama untuk warga dan petugas."*
Air surut, meninggalkan latar terang.

**4 — 0:28–0:41 · Meternya nyata**
Sebuah meter air prabayar digambar ke layar garis demi garis — badan
perangkat, layar LCD 16×2 hijau, keypad 4×4, lalu sambungan pipa di kiri dan
kanan. Layar LCD menyala menampilkan teks monospace persis:
`S=4820.50L  ON` / `D=2.4   V=8420.4`
Angka saldonya lalu turun perlahan: 4820 → 120 → 12 → 5. Saat menyentuh 5,
muncul gelombang bunyi dari perangkat dan teks: *"≤ 5 liter — bunyi tiap 10
detik."* Turun ke 2: *"≤ 2 liter — bunyi tiap 2 detik."* Turun ke 0: suara
berhenti, LCD menulis `SALDO HABIS`, dan sebuah katup menutup.
Teks penutup adegan: *"Tidak ada yang tiba-tiba."*

**5 — 0:41–0:54 · Empat langkah**
Empat langkah berjalan bersambung dalam satu gerakan menerus (kamera
bergeser mendatar, bukan potong):
1. Ponsel memilih paket — *"Beli liter"* — `2.500 L · Rp 18.750`
2. Kode token terbit — angka monospace `48217 73015` tersusun dari angka acak
3. Jari mengetik di keypad meter — `*`, lalu `1111`, lalu `A`
4. LCD menulis `TOKEN VALID` / `+5 LITER`, katup membuka, air mengalir
Teks: *"Dari kode jadi air. Empat langkah."*

**6 — 0:54–1:08 · Yang biasanya tertutup**
Latar berubah jadi biru tua `#08222c`. Empat kartu meluncur masuk berjenjang,
masing-masing bernomor dengan angka monospace:
- `01` **Status layanan** — peta empat zona menyala, satu merah bata, satu
  jingga, dua hijau; lalu sebuah strip 30 petak harian muncul di bawahnya dan
  terisi satu per satu
- `02` **Lacak pengaduan** — nomor tiket diketik, linimasa penanganan terbuka
  tahap demi tahap
- `03` **Rapor kinerja** — angka `92,1%` berjalan naik dari nol
- `04` **Statistik terbuka** — dua garis grafik menggambar; celah di antaranya
  diarsir
Teks besar: *"Empat halaman. Tanpa akun."*

**7 — 1:08–1:19 · Termasuk yang buruk**
Ini adegan terpenting. Jangan dibuat manis.
Dari grafik adegan sebelumnya, celah di antara dua garis membesar dan diberi
label `19,0%` — *"air yang tidak pernah sampai"*. Di sebelahnya, dua baris
kategori layanan ditandai jingga `#96530a` dengan kata **"di bawah target"**,
dan satu kartu pengaduan ditandai **"melewati janji"**.
Teks: *"Yang meleset juga ditampilkan."*
Lalu, lebih kecil: *"Transparansi yang memilih-milih bukan transparansi."*

**8 — 1:19–1:25 · Datanya bisa dibawa pulang**
Sebuah berkas CSV dan JSON meluncur keluar dari layar grafik, lalu alamat
endpoint API muncul sebagai teks monospace. Beberapa baris data nyata
tergulir cepat. Teks: *"Unduh datanya. Periksa sendiri."*

**9 — 1:25–1:30 · Penutup**
Air naik sekali lagi menutupi layar, lalu surut meninggalkan logo **Jernih**
di tengah latar terang, dengan garis takar tipis di bawahnya dan satu baris:
**"Transparansi layanan air."**
Di bawahnya, kecil: *"MIA 2026 · Public Service Tracking"*.

### Gerakan

- Pelambatan di ujung tiap gerakan (ease-out), bukan linear. Air punya
  inersia; gerakan yang berhenti mendadak merusak seluruh bahasa visualnya.
- Semua **angka harus berjalan** dari nilai lama ke nilai baru, tidak pernah
  melompat. Ini aturan yang sama dipakai di situsnya.
- Peralihan antar adegan memakai **air atau garis takar**, bukan potong keras
  dan bukan efek bawaan editor (tanpa gliter, tanpa kilatan cahaya, tanpa
  zoom-blur).
- Grafik digambar dari kiri ke kanan, tidak muncul sekaligus.

### Narasi — WAJIB, Bahasa Indonesia

Satu suara, **perempuan atau laki-laki dewasa, nada tenang dan jelas, tempo
sedang**. Bukan gaya iklan, bukan gaya presenter berita, bukan gaya motivator.
Bayangkan petugas yang menjelaskan sesuatu dengan sabar kepada warga — percaya
diri tapi tidak menjual. Tanpa senyum yang terdengar, tanpa penekanan
berlebihan di akhir kalimat.

Naskahnya sudah dihitung agar muat di tiap adegan (±2,2 kata per detik, sudah
termasuk jeda). **Jangan dipercepat untuk mengejar waktu** — kalau kepanjangan,
potong kalimatnya, jangan naikkan tempo.

| Adegan | Waktu | Narasi |
| --- | --- | --- |
| 1 | 0:00–0:08 | "Tiap akhir bulan, satu angka datang ke rumah Anda. Dan hampir tidak ada cara untuk memeriksanya." |
| 2 | 0:08–0:17 | "Meterannya benar? Kenapa naik? Laporan kemarin sudah ditangani belum? Pertanyaan yang wajar — tapi jawabannya tidak pernah terbuka." |
| 3 | 0:17–0:28 | "Jernih membuka angkanya. Satu angka yang sama untuk warga dan untuk petugas, bergerak saat airnya mengalir, bukan menunggu akhir bulan." |
| 4 | 0:28–0:41 | "Di rumah ada meter prabayar. Saat saldo tinggal lima liter, ia berbunyi tiap sepuluh detik. Tinggal dua liter, tiap dua detik. Habis, aliran menutup sendiri. Tidak ada yang tiba-tiba." |
| 5 | 0:41–0:54 | "Membelinya empat langkah. Pilih jumlah liter. Kode token terbit saat itu juga. Ketik di keypad meter. Keran hidup kembali, dan saldonya langsung terlihat di layar." |
| 6 | 0:54–1:08 | "Empat halaman terbuka untuk siapa pun, tanpa akun. Zona mana yang sedang terganggu. Pengaduan Anda sudah sampai mana. Seberapa cepat ditangani. Dan berapa air yang benar-benar sampai ke rumah warga." |
| 7 | 1:08–1:19 | "Termasuk yang buruk. Sembilan belas persen air hilang di perjalanan. Dua kategori layanan masih di bawah target. Transparansi yang memilih-milih bukan transparansi." |
| 8 | 1:19–1:25 | "Datanya bisa diunduh dan diperiksa sendiri. Angka yang tidak bisa diperiksa hanyalah klaim." |
| 9 | 1:25–1:30 | "Jernih. Transparansi layanan air." |

Pelafalan yang harus benar: **"PDAM"** dieja per huruf (pe-de-a-em), **"NRW"**
jangan diucapkan sama sekali (di naskah sudah diganti "air hilang di
perjalanan"), **"m³"** dibaca "meter kubik", **"Rp"** dibaca "rupiah".

### Suara

Musik instrumental tenang, tempo sedang, berbasis piano dan dawai lembut
dengan satu lapis sintetis yang bersih. Naik sedikit pada adegan 3 dan 6,
tenang kembali pada adegan 7. Musik harus **jauh di bawah narasi** — ia
pengiring, bukan pesaing.

Efek suara yang hemat dan nyata: tetesan air, aliran air halus, bunyi bip
meter (dua nada pendek), dan satu bunyi klik keypad. Volume musik dan narasi
turun sesaat ketika bip meter berbunyi pada adegan 4, supaya bipnya benar-benar
terdengar — itu satu-satunya suara di video ini yang berasal dari perangkat
sungguhan.

### Spesifikasi teknis

- 1920×1080, 30 fps, H.264, sekitar 10–15 Mbps
- Durasi total 90 detik (±2 detik)
- Semua teks berada di dalam area aman 90%
- Kontras teks minimal 4,5:1 terhadap latarnya
- Sediakan berkas SRT terpisah berisi seluruh teks layar
- Sediakan juga satu bingkai poster (JPG 1920×1080) dari adegan 3

### Jangan

- Jangan memakai warna di luar daftar palet, terutama ungu, magenta, krem,
  atau kuning hangat.
- Jangan memakai gradasi ungu-ke-biru pada latar. Itu ciri paling khas
  tampilan buatan AI dan akan langsung dikenali.
- Jangan memakai lencana berbentuk kapsul dengan titik bulat di depan teks —
  ciri yang sama. Pakai persegi bersudut kecil dengan garis takar tegak.
- Jangan memakai ikon atau gaya 3D isometrik generik, orang-orangan tanpa
  wajah, atau ilustrasi "startup" bergaya Corporate Memphis.
- Jangan memakai emoji di mana pun.
- Jangan memakai stok video orang tersenyum di kantor.
- Jangan ada tanda seru.
- Jangan memakai istilah Inggris yang ada padanannya: tulis "seketika",
  bukan "real-time"; "data terbuka", bukan "open data"; "pengaduan", bukan
  "complaint".
- Jangan membuat angkanya terlihat sempurna. `19,0%` kehilangan air dan
  `92,1%` ketepatan itu angka yang masuk akal untuk PDAM; `100%` terbaca
  sebagai karangan.
- Jangan menyembunyikan angka yang buruk. Adegan 7 wajib ada.

### Angka yang dipakai — ambil persis, jangan dikarang

| Hal | Nilai |
| --- | --- |
| Pelanggan terlayani | 8.219 rumah |
| Air disalurkan 30 hari | 148.606 m³ |
| Kehilangan air (NRW) | 19,0% |
| Zona terpantau | 4 |
| Ketepatan penanganan 30 hari | 92,1% |
| Tarif | Rp 7,5 per liter |
| Token demo | 1111 |
| Teks LCD utama | `S=4820.50L  ON` / `D=2.4   V=8420.4` |

## — salin sampai sini

---

## Setelah videonya jadi

1. Simpan sebagai `public/jernih-penjelasan.mp4` dan posternya
   `public/jernih-penjelasan.jpg`.
2. Simpan takarirnya sebagai `public/jernih-penjelasan.id.vtt` (ubah dari SRT
   ke WebVTT: tambahkan baris `WEBVTT` di paling atas dan ganti koma pada
   penanda waktu menjadi titik).
3. Seksi pemutarnya sudah ada di landing — tidak perlu mengubah kode.

## Kenapa takarir wajib, bukan tambahan

Videonya bernarasi, dan justru karena itu takarir wajib: sebagian besar
orang menonton video tanpa suara lebih dulu, dan narasi tanpa takarir berarti
seluruh penjelasannya hilang bagi mereka — juga bagi penonton Tuli, bagi mesin
pencari, dan bagi juri yang membaca cepat. Video penjelasan tanpa takarir di
lomba bertema keterbukaan adalah kontradiksi yang akan terlihat.
