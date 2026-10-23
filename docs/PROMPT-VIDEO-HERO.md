# Prompt video motion — hero Jernih

Tempel prompt di bawah ke alat pembuat video. Tujuannya satu klip pendek yang
**menjelaskan masalahnya dulu, baru produknya** — bukan rekaman dekoratif.

Spesifikasi keluaran: **16:9, 1920×1080, 20 detik, 30 fps, loop mulus**
(bingkai terakhir menyambung ke bingkai pertama).

---

## Prompt utama — salin mulai dari sini

> **Gaya:** Sinematik, bersih, tenang. Penerangan lembut dari satu sumber di
> kiri atas. Palet terbatas: biru air `#00A6C8`, biru dalam `#0B4A5E`, tinta
> `#08222C`, putih-air `#F4F8F9`. Tidak ada warna lain. Latar polos tanpa
> tekstur ramai. Kesan bahan: kaca, air jernih, logam sikat, plastik meteran.
> Tidak ada orang berwajah jelas — hanya tangan bila perlu.
>
> **Adegan 1 — Masalahnya (0–5 detik).**
> Ruang sempit remang di belakang rumah. Sebuah meteran air tua menempel di
> dinding, kaca penutupnya berembun dan berdebu, angkanya **tidak terbaca**.
> Kamera mendekat perlahan (dolly in, sangat pelan). Cahaya redup kebiruan.
> Di sudut bingkai, lembaran kalender berguguran cepat — satu bulan lewat.
> Suasana: tidak tahu, menunggu, tidak bisa memeriksa.
>
> **Adegan 2 — Kejutannya (5–8 detik).**
> Selembar tagihan meluncur masuk ke bingkai di atas meja kayu gelap. Satu
> angka besar tercetak di tengahnya, tetapi fokus lensa membuatnya **buram
> dan tak terbaca**. Sebuah tangan masuk, jari menunjuk angka itu, lalu
> berhenti — tidak ada yang bisa dicocokkan. Diam sejenak.
>
> **Adegan 3 — Peralihan (8–11 detik).**
> Air jernih mengalir dari kiri bingkai dan **membasuh seluruh layar**,
> menyapu kegelapan. Saat air lewat, warna berubah dari biru redup menjadi
> putih-air terang. Gerakan air halus dan lambat, dengan pembiasan cahaya
> (caustics) bergerak di permukaannya. Transisi ini adalah titik balik klip:
> dari tidak terlihat menjadi jernih.
>
> **Adegan 4 — Jawabannya (11–17 detik).**
> Sebuah tabung kaca ukur tegak berdiri di tengah bingkai dengan latar
> putih-air bersih. Tabung terisi air biru jernih sampai sekitar 80%.
> Permukaan airnya melengkung seperti meniskus sungguhan dan bergoyang
> pelan. Gelembung kecil naik perlahan. Garis takar terukir di dinding
> tabung. Angka besar terbaca **menembus air**: `4.820,5` dengan kata kecil
> `LITER TERSISA` di bawahnya. Angka itu **berkurang perlahan di depan
> mata**, satu digit desimal bergerak terus. Kamera menahan diam.
>
> **Adegan 5 — Dua layar, satu angka (17–20 detik).**
> Tabung memudar. Dua persegi panjang muncul berdampingan: layar ponsel di
> kiri, layar komputer kantor di kanan. Keduanya menampilkan **angka yang
> sama persis**, berubah bersamaan. Sebuah garis tipis menghubungkan
> keduanya. Lalu seluruhnya memudar kembali ke adegan 1 agar loop menyambung.
>
> **Gerakan kamera:** sangat pelan sepanjang klip. Dolly in di adegan 1,
> diam di adegan 2 dan 4, pan lembut mengikuti air di adegan 3. Tidak ada
> guncangan, tidak ada zoom cepat, tidak ada putaran.
>
> **Ritme:** tenang dan percaya diri. Satu detik jeda sebelum adegan 4 dimulai.
>
> **Tanpa suara.** Klip akan dipasang sebagai latar halaman dan diputar bisu.

---

## Negative prompt — tempelkan di kolom "hindari"

```
teks berbahasa Inggris, tulisan acak, huruf cacat, watermark, logo merek lain,
wajah manusia, orang tersenyum ke kamera, stock footage korporat, orang
berjabat tangan di kantor, grafik batang melayang, antarmuka futuristik
hologram, warna ungu, magenta, oranye, kuning, krem, gradien pelangi,
lens flare berlebihan, partikel berkilau, bokeh emas, gerakan kamera cepat,
zoom mendadak, potongan cepat, efek glitch, teks 3D mengilap, air terjun,
laut, kolam renang, gelas minum, botol air kemasan
```

---

## Kalau alatnya hanya menerima prompt pendek

> Klip sinematik 20 detik, bisu, loop. Palet hanya biru air #00A6C8, biru
> dalam #0B4A5E, putih #F4F8F9. Mulai dari meteran air tua berdebu di ruang
> remang, angkanya tidak terbaca, kalender berguguran. Lalu tagihan kertas
> masuk dengan angka buram yang tak bisa diperiksa. Air jernih kemudian
> membasuh seluruh layar dari kiri ke kanan, mengubah suasana jadi terang.
> Muncul tabung kaca ukur berisi air biru jernih setinggi 80%, meniskus
> melengkung, gelembung naik pelan, garis takar di dinding tabung, dan angka
> besar terbaca menembus air sambil berkurang perlahan. Kamera sangat pelan,
> tidak ada orang, tidak ada teks Inggris.

---

## Setelah videonya jadi

**Olah dulu sebelum dipasang.** Video hero yang berat justru menurunkan nilai
Fungsionalitas — juri membuka situsnya di jaringan yang entah bagaimana.

```bash
# WebM — utama, paling kecil
ffmpeg -i mentah.mp4 -c:v libvpx-vp9 -crf 34 -b:v 0 -an \
  -vf "scale=1920:-2,fps=30" hero.webm

# MP4 — cadangan untuk Safari lama
ffmpeg -i mentah.mp4 -c:v libx264 -crf 26 -preset slow -an \
  -movflags +faststart -vf "scale=1920:-2,fps=30" hero.mp4

# Bingkai pertama sebagai poster, supaya tidak ada layar kosong saat memuat
ffmpeg -i mentah.mp4 -vframes 1 -q:v 2 hero-poster.jpg
```

Target: **WebM di bawah 2 MB.** Kalau masih besar, naikkan `-crf` ke 38 atau
turunkan ke 1280px — di belakang teks, perbedaannya tidak terlihat.

**Cara memasang di hero:**

```tsx
<video
  autoPlay
  muted
  loop
  playsInline          // wajib: tanpa ini iOS membuka video layar penuh
  poster="/hero-poster.jpg"
  aria-hidden          // hiasan, bukan konten — jangan dibacakan pembaca layar
  className="absolute inset-0 size-full object-cover"
>
  <source src="/hero.webm" type="video/webm" />
  <source src="/hero.mp4" type="video/mp4" />
</video>
```

**Tiga hal yang wajib dijaga:**

1. **Teks di atas video harus tetap terbaca.** Pasang lapisan gelap
   (`bg-ink/45`) atau gradien di antara video dan teks. Kontras minimal
   4,5:1 — ini masuk penilaian aksesibilitas.
2. **Hormati `prefers-reduced-motion`.** Pengguna yang mematikan animasi di
   sistemnya harus melihat `hero-poster.jpg` diam, bukan video berjalan.
3. **Sediakan jalur gagal.** Kalau video tidak dimuat, poster tetap tampil
   dan halaman tetap utuh.

---

## Catatan jujur sebelum kamu putuskan

Video ini **indah tapi diam** — ia menampilkan angka yang direkam, bukan angka
yang hidup. Kolom air Canvas yang sekarang ada di hero menampilkan angka yang
benar-benar bergerak dan bisa diklik.

Untuk lomba yang menilai **Fungsionalitas 25%**, sesuatu yang hidup biasanya
lebih kuat daripada rekaman — juri bisa melihat sendiri bahwa datanya nyata.

Saran saya: **pakai keduanya.** Video sebagai latar seksi "Di balik angkanya"
atau pembuka video pitching YouTube (yang memang wajib dikumpulkan), dan kolom
air tetap di hero sebagai bukti produknya hidup.
