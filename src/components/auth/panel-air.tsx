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
export function PanelAir() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Cahaya dari atas — memberi arah, supaya panel tidak terbaca rata. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,var(--color-brand-500)_0%,transparent_58%)] opacity-[0.14]" />

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
