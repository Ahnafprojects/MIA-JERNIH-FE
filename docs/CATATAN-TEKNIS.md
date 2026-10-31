# Catatan teknis

Berkas ini untuk orang yang menyentuh kodenya, bukan untuk pembaca umum.
Isinya tiga hal: cara kerja animasi, jebakan yang pernah memakan waktu
berhari-hari, dan pemecahan masalah yang sering muncul saat pengembangan.

Dipisahkan dari README supaya halaman depan repositori menjawab pertanyaan
yang dibawa pembaca baru — apa ini, bagaimana menjalankannya, sudah sampai
mana — tanpa tertimbun catatan kerja.

## Animasi

Seluruh gerakan tunduk pada satu aturan: `prefers-reduced-motion: reduce` mematikan semuanya. Aturan itu dijaga menyeluruh di `globals.css`, sehingga tidak perlu diulang di tiap komponen.

| Keyframe | Dipakai di |
| --- | --- |
| `masuk-naik` | Isi halaman autentikasi, muncul berjenjang saat dimuat |
| `geser-air`, `geser-air-balik` | Dua lapis gelombang di panel merek |
| `gelembung` | Gelembung yang naik di dalam air |
| `tetes` | Tetes jatuh dari tepi atas sampai permukaan air |
| `riak` | Lingkaran memuai di titik jatuhnya tetes |
| `kabut` | Dua bentuk kabur yang mengambang di paruh atas |
| `hanyut` | Kisi ukur yang bergeser pelan |
| `naik` | Permukaan air naik saat halaman pertama dibuka |

Tiga hal yang mudah salah, dan pernah salah di sini.

**Animasi bertunda tidak menyembunyikan elemennya.** Selama menunggu gilirannya, yang tampil adalah keadaan statis elemen tersebut. Enam tetes dengan `animation-delay` berbeda berdiam sebagai titik terang berjejer di tepi atas sampai tundanya habis. Solusinya memberi `opacity-0` sebagai keadaan dasar, lalu keyframe menimpanya begitu animasi mulai.

**Satu elemen tidak bisa dipusatkan dan dianimasikan sekaligus.** Properti `transform` dari keyframe menimpa kelas `-translate-x-1/2`, sehingga riak memuai dari tepi kiri alih-alih dari titik jatuh tetesnya. Pemusatan diletakkan di pembungkus, pemuaian di anaknya.

**Gerakan berulang perlu jarak yang tepat.** Keyframe `hanyut` menggeser tepat satu petak kisi, yaitu 72 piksel, supaya bingkai terakhir jatuh persis di atas bingkai pertama. Angka itu terikat pada `bg-[size:72px_72px]` di komponennya. Mengubah salah satunya saja memunculkan lompatan di tiap putaran.

## Empat jebakan yang memakan waktu

Keempatnya lolos `build`, `lint`, dan `typecheck`, tetapi tetap salah di layar. Kalau menyentuh area ini, periksa di peramban dan jangan percaya hasil build.

**1. Huruf tidak terpakai sama sekali.** `next/font` menaruh variabel `--font-*-src` pada elemen yang diberi kelasnya, sedangkan token yang memakainya diterbitkan Tailwind di `:root`. Kalau kelas font dipasang di `<body>`, token di `:root` menunjuk ke variabel yang belum ada di sana, nilainya menjadi tidak sah, dan seluruh situs diam-diam memakai huruf bawaan sistem. Kelas font harus dipasang di `<html>`. Periksa dengan `getComputedStyle(document.body).fontFamily`.

**2. Varian `dark:` tidak mengikuti tombol tema.** Di Tailwind v4, `dark:` berarti `prefers-color-scheme`, bukan kelas `.dark`. Tanpa `@custom-variant dark (&:where(.dark, .dark *))` di `globals.css`, 74 pemakaian `dark:` mengikuti setelan sistem operasi pengunjung alih-alih tombol temanya.

**3. Warna status gagal memenuhi kontras sebagai teks.** Token `warn`, `success`, `info`, dan `brand-600` semula dipilih agar bagus di atas latar putih, padahal semuanya lebih sering dipakai sebagai teks. Rasio terburuk mencapai 2,94:1, tepat pada angka yang paling penting dibaca, yaitu yang sedang berada di luar ambang. Ukur kontras dari piksel tangkapan layar, bukan dari nilai token.

**4. Peta menuduh WebGL untuk kegagalan apa pun.** Halaman `/status` di produksi menampilkan "Peramban ini tidak mendukung WebGL" pada peramban yang WebGL-nya sehat. Dua cacat bertumpuk. Pertama, penjaga `zona.filter((z) => z.batas !== null && z.batas.length >= 4)` hanya menutup satu dari dua kemungkinan: saat server tidak mengirim medan `batas` sama sekali, nilainya `undefined`, dan `undefined !== null` bernilai benar sehingga `.length` melempar. Karena lemparannya terjadi saat render, yang hilang bukan satu zona melainkan seluruh peta. Gunakan `Array.isArray`. Kedua, batas galat menangkap lemparan apa pun lalu menampilkan kalimat yang memastikan sebabnya, sehingga orang memeriksa kartu grafisnya padahal yang rusak ada di server. Komponen `PesanPetaGagal` kini benar-benar memeriksa WebGL sebelum menyebutnya.

Cara menemukan jebakan keempat: buka halaman produksinya di Chrome lewat DevTools Protocol dan baca `Runtime.exceptionThrown`. Tidak ada yang terlihat dari membaca kode frontend, karena kodenya memang sah. Yang berubah bentuknya ada di jawaban API.

## Pemecahan masalah

**Semua angka tampil sebagai tanda hubung, atau rangka pemuatan tidak pernah selesai.** Penyebabnya CORS. Asal yang dipakai peramban tidak terdaftar di backend. Perlu diingat `localhost:3000` dan `127.0.0.1:3000` adalah asal yang berbeda, dan hanya yang pertama terdaftar. Buka tab Network, cari jawaban yang kehilangan header `Access-Control-Allow-Origin`.

**Mengubah `NEXT_PUBLIC_API_URL` di Vercel tidak berpengaruh.** Variabel berawalan `NEXT_PUBLIC_` disisipkan saat build. Perlu build ulang.

**Perubahan `globals.css` tampak tidak berlaku saat pengembangan.** Cache CSS Turbopack basi. Hentikan dev server, jalankan `rm -rf .next/dev`, lalu nyalakan lagi. Jangan menyimpulkan kodenya salah lebih dulu.

**Peta kosong atau setinggi nol.** Komponen `<Map>` mengisi induknya, dan induk tanpa tinggi menghasilkan kanvas setinggi nol. Petanya tampak hilang padahal sudah berjalan. Tinggi wajib ditentukan di pembungkus.

**Peta menyatakan WebGL tidak didukung.** Belum tentu benar. Lihat jebakan keempat di atas, dan periksa `Runtime.exceptionThrown` sebelum mempercayai pesannya.

**Tangkapan layar otomatis memperlihatkan grafik tanpa garis.** Itu artefak alat, bukan cacat aplikasi. Opsi `captureBeyondViewport` mengubah ukuran viewport saat memotret, Recharts merender ulang, dan animasi garisnya mulai dari nol. Ambil gambar pada viewport biasa setelah menggulir ke grafiknya.
