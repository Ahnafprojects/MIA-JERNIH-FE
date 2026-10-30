"use client";

/**
 * Latar bergerak untuk panel merek di halaman masuk/daftar.
 *
 * Yang digambar bukan hiasan: sebuah kolom ukur yang terisi air, dengan garis
 * takar yang dilewati permukaannya. Itu persis gagasan produknya — pengukuran
 * yang bisa dilihat orang — jadi gerakannya menyandang arti, bukan sekadar
 * membuat halaman terasa hidup.
 *
 * Sengaja SVG + CSS, bukan canvas seperti `KolomAir` di beranda. Halaman ini
 * cuma perlu latar yang tenang; menyalakan gelung `requestAnimationFrame`
 * 619 baris di layar yang tugasnya mengetik kata sandi adalah beban yang
 * tidak dibayar oleh apa pun.
 *
 * Gerakannya memakai `transform` saja supaya ditangani compositor dan tidak
 * memicu layout ulang. `prefers-reduced-motion` sudah dijaga menyeluruh di
 * `globals.css`, jadi tidak perlu diulang per elemen di sini.
 */

/**
 * Tetes yang jatuh, dan riak yang ditinggalkannya.
 *
 * Satu daftar untuk dua elemen: titik yang jatuh dan lingkaran yang memuai di
 * tempat ia mendarat. Keduanya WAJIB berbagi `lama` dan selisih tunda yang
 * tepat satu kali jatuh — kalau tidak, keduanya saling menyusul sedikit demi
 * sedikit dan riaknya berakhir muncul di saat tidak ada tetes yang turun.
 *
 * Posisinya menghindari sepertiga kiri tempat kutipan dan paragraf berada.
 * Tetesnya memang digambar di belakang teks, tetapi titik terang yang lewat
 * tepat di antara baris tetap menarik mata menjauh dari kalimatnya.
 */
const TETES = [
  { kiri: "38%", tunda: 0, lama: 4.6, ukuran: 5 },
  { kiri: "54%", tunda: 1.9, lama: 5.8, ukuran: 4 },
  { kiri: "71%", tunda: 3.4, lama: 5.1, ukuran: 6 },
  { kiri: "86%", tunda: 2.3, lama: 6.4, ukuran: 4 },
  { kiri: "47%", tunda: 5.1, lama: 7.2, ukuran: 3 },
  { kiri: "63%", tunda: 6.3, lama: 6.7, ukuran: 4 },
];

export function PanelAir() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Cahaya dari atas — memberi arah, supaya panel tidak terbaca rata. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,var(--color-brand-500)_0%,transparent_58%)] opacity-[0.14]" />

      {/*
        Kisi ukur yang hanyut pelan.

        Petaknya 72px dan keyframe `hanyut` menggeser tepat 72px, jadi
        putarannya tidak punya sambungan yang terlihat. Elemennya dilebihkan
        ke luar bingkai (`-inset-[12%]`) supaya tepi kisinya tidak pernah
        masuk layar saat bergeser.
      */}
      <div className="absolute -inset-[12%] bg-[linear-gradient(to_right,var(--color-on-console)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-on-console)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.045] animate-[hanyut_24s_linear_infinite]" />

      {/* Dua kabut yang mengambang berlawanan arah di paruh atas. Lajunya
          sangat lambat — pada panel yang tugasnya menampung formulir, gerakan
          yang terbaca sebagai gerakan justru mengganggu. */}
      <div className="absolute -top-1/4 left-[18%] h-[62%] w-[62%] rounded-full bg-[radial-gradient(circle,var(--color-brand-500)_0%,transparent_68%)] opacity-[0.1] blur-3xl animate-[kabut_26s_ease-in-out_infinite]" />
      <div className="absolute top-[6%] left-[46%] h-[50%] w-[55%] rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] opacity-[0.07] blur-3xl animate-[kabut_34s_ease-in-out_-12s_infinite_reverse]" />

      {/*
        Garis takar vertikal di tepi kiri. Tiap tanda kelima dibuat lebih
        panjang, seperti pembacaan pada alat ukur sungguhan.
      */}
      <div className="absolute inset-y-0 left-0 w-10 opacity-[0.22]">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="absolute left-0 block h-px bg-on-console"
            style={{
              top: `${(i / 27) * 100}%`,
              width: i % 5 === 0 ? "1.4rem" : "0.7rem",
            }}
          />
        ))}
      </div>

      {/*
        Tetes yang jatuh dari atas panel ke permukaan air.

        Pembungkusnya berakhir TEPAT di permukaan air yang TERLIHAT — setinggi
        airnya, dikurangi separuh tinggi gelombang. Blok airnya mulai di 28%
        tetapi lengkung gelombangnya digambar di tengah pita 2,5rem, jadi
        garis air yang dilihat mata ada ~1,1rem di bawah tepi blok itu;
        tanpa koreksi ini tetesnya berhenti menggantung di atas air.
        Tiap tetes adalah kolom setinggi pembungkus itu dengan
        titik di ujung atasnya. Jadi `translateY(100%)` di keyframe membawa
        titiknya persis sampai permukaan, berapa pun tinggi panelnya — tidak
        ada angka tinggi yang ditulis tangan lalu meleset di layar lain.
      */}
      <div className="absolute inset-x-0 top-0 bottom-[calc(28%-1.1rem)]">
        {TETES.map((t, i) => (
          <span
            key={i}
            /*
              `opacity-0` sebagai keadaan dasar, bukan hiasan.

              Animasi bertunda TIDAK menyembunyikan elemennya selama menunggu
              giliran — yang tampil adalah keadaan statisnya. Tanpa baris ini
              keenam tetes berdiam sebagai titik terang berjejer di tepi atas
              panel sampai tundanya habis, dan yang terbaca justru kotoran di
              layar. Keyframe menimpanya begitu animasinya mulai.
            */
            className="absolute top-0 block h-full opacity-0 animate-[tetes_var(--lama)_cubic-bezier(0.55,0,0.85,0.4)_var(--tunda)_infinite]"
            style={
              {
                left: t.kiri,
                "--lama": `${t.lama}s`,
                "--tunda": `${t.tunda}s`,
              } as React.CSSProperties
            }
          >
            <span
              className="block rounded-full bg-accent/45"
              style={{ width: t.ukuran, height: t.ukuran * 1.5 }}
            />
          </span>
        ))}
      </div>

      {/*
        Riak di titik jatuhnya tiap tetes.

        Tundanya digeser tepat satu kali jatuh (`tunda + lama`) dan durasinya
        disamakan, jadi riaknya muncul saat tetesnya mendarat dan tetap
        seirama selamanya.
      */}
      <div className="absolute inset-x-0 bottom-[calc(28%-1.1rem)] h-0">
        {TETES.map((t, i) => (
          /*
            Dua elemen, bukan satu: pemusatan ada di pembungkus dan hanya
            pemuaian yang dianimasikan. Keduanya pada elemen yang sama akan
            saling meniadakan — `transform` dari keyframe menimpa kelas
            `-translate-x-1/2`, dan riaknya memuai dari tepi kiri, bukan dari
            titik jatuhnya tetes.
          */
          <span
            key={i}
            className="absolute block -translate-x-1/2 -translate-y-1/2"
            style={{
              left: t.kiri,
              width: `${5 + t.ukuran}rem`,
              height: `${0.7 + t.ukuran * 0.1}rem`,
            }}
          >
            <span
              // `opacity-0` sama alasannya dengan pada tetes: tanpa itu
              // keenam riak tampil diam di ukuran penuh sebelum gilirannya,
              // berjejer di garis air seperti rantai cincin.
              className="block h-full w-full rounded-[50%] border border-accent/40 opacity-0 animate-[riak_var(--lama)_ease-out_var(--tunda)_infinite]"
              style={
                {
                  "--lama": `${t.lama}s`,
                  "--tunda": `${t.tunda + t.lama}s`,
                } as React.CSSProperties
              }
            />
          </span>
        ))}
      </div>

      {/* Permukaan air: dua lapis gelombang dengan laju dan arah berbeda.
          Satu lapis saja terbaca sebagai pita yang digeser; dua lapis yang
          berselisih fase membuatnya terbaca sebagai air. */}
      {/* Tingginya 28%, bukan separuh panel.
          Pada 46% permukaan airnya naik sampai ke paragraf di bawah kutipan
          dan menenggelamkannya — teks putih tipis di atas pita biru muda
          praktis tidak terbaca. Latar tidak boleh memakan isinya sendiri. */}
      <div className="absolute inset-x-0 bottom-0 h-[28%] animate-[naik_2.4s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="absolute inset-x-0 top-6 bottom-0 bg-gradient-to-b from-brand-500/22 to-brand-500/[0.06]" />

        <svg
          className="absolute inset-x-0 top-0 h-10 w-[200%] animate-[geser-air_17s_linear_infinite]"
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C150,2 250,38 400,20 C550,2 650,38 800,20 C950,2 1050,38 1200,20 L1200,40 L0,40 Z"
            className="fill-brand-500/25"
          />
        </svg>
        <svg
          className="absolute inset-x-0 top-2 h-10 w-[200%] animate-[geser-air-balik_23s_linear_infinite]"
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
        >
          <path
            d="M0,22 C180,40 280,4 460,22 C640,40 740,4 920,22 C1060,36 1120,12 1200,22 L1200,40 L0,40 Z"
            className="fill-accent/15"
          />
        </svg>
      </div>

      {/* Gelembung. Jumlahnya sedikit dan lajunya berbeda-beda — deretan yang
          seragam langsung terbaca sebagai animasi, bukan sebagai air. */}
      {[
        { kiri: "18%", tunda: "0s", lama: "11s", ukuran: 6 },
        { kiri: "34%", tunda: "3.2s", lama: "14s", ukuran: 4 },
        { kiri: "61%", tunda: "1.6s", lama: "12.5s", ukuran: 5 },
        { kiri: "77%", tunda: "5.4s", lama: "16s", ukuran: 3 },
      ].map((b, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-accent/25 animate-[gelembung_var(--lama)_ease-in_var(--tunda)_infinite]"
          style={
            {
              left: b.kiri,
              width: b.ukuran,
              height: b.ukuran,
              "--tunda": b.tunda,
              "--lama": b.lama,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
