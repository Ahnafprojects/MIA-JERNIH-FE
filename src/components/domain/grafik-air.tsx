"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useHematGerak } from "@/lib/hemat-gerak";
import { cn } from "@/lib/cn";

/**
 * Grafik pemakaian sebagai KOLOM AIR, bukan batang.
 *
 * ── Kenapa dibangun sendiri, bukan Recharts yang didandani ────────────
 *
 * Grafik batang bawaan sudah dicoba dan tetap gagal: ia menggambar
 * persegi panjang berwarna, dan sebanyak apa pun gradien ditumpuk di
 * atasnya, yang terlihat tetap persegi panjang berwarna. Masalahnya bukan
 * kurang hiasan — melainkan bentuknya tidak ada hubungannya dengan apa pun
 * yang sedang diukur. Halaman ini mengukur AIR, dan air punya bentuk yang
 * sudah dikenali semua orang tanpa perlu dijelaskan: permukaan yang rata,
 * dinding yang menahannya, dan tinggi yang berarti banyak.
 *
 * Jadi tiap hari digambar sebagai tabung kaca yang terisi. Tabungnya
 * CEKUNG — ia wadah, bukan benda. Airnya punya permukaan bergelombang yang
 * bergerak pelan, lebih terang di bibir dan memekat ke dasar, persis
 * seperti bola saldo di beranda. Satu bahasa visual untuk satu zat.
 *
 * ── Animasinya ────────────────────────────────────────────────────────
 *
 * Air NAIK dari dasar, satu kolom demi satu kolom, dengan jeda 70 ms di
 * antaranya. Urutannya kiri ke kanan — searah membaca, dan searah waktu.
 * Itu sebabnya jenjangnya terasa seperti minggu yang sedang berjalan, bukan
 * seperti efek yang ditempelkan.
 *
 * Mulai HANYA saat grafiknya benar-benar masuk layar. Animasi yang sudah
 * selesai sebelum pembacanya menggulir ke sana adalah animasi yang tidak
 * pernah dilihat siapa pun — dan di halaman sepanjang ini, itu nasib
 * hampir semua grafik yang beranimasi saat dipasang.
 *
 * `prefers-reduced-motion` mematikan kenaikan DAN gelombangnya; kolomnya
 * langsung berada di tinggi akhir. Yang dimatikan gerakannya, bukan datanya.
 */

/** Jeda antar kolom, milidetik. */
const JENJANG_MS = 70;

/** Lama satu kolom naik dari dasar ke tinggi akhirnya. */
const DURASI_NAIK_MS = 900;

export interface KolomAir {
  label: string;
  nilai: number;
}

export function GrafikAir({
  data,
  target,
  labelTarget,
  format,
  tinggi = 240,
  className,
}: {
  data: KolomAir[];
  /** Garis acuan mendatar — mis. rata-rata harian warga sendiri. */
  target?: number;
  labelTarget?: string;
  format?: (n: number) => string;
  tinggi?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const diam = useHematGerak();
  const wadah = useRef<HTMLDivElement>(null);
  const [tampil, setTampil] = useState(false);
  const [sorot, setSorot] = useState<number | null>(null);

  /*
   * `useSyncExternalStore` tidak cocok di sini: yang diamati bukan nilai
   * yang bisa dibaca kapan saja, melainkan satu PERISTIWA sekali seumur
   * hidup komponen — saat grafiknya masuk layar. Setelah itu observernya
   * dilepas dan tidak ada apa pun lagi untuk disinkronkan.
   */
  useEffect(() => {
    /*
     * Saat gerakan diminta dikurangi, `tampil` SENGAJA dibiarkan false.
     * Keadaan akhir kolom tidak bergantung padanya — ia dipasang langsung
     * sebagai tinggi sebaris (lihat `diam` di bawah). Menyetel state di
     * sini justru melanggar aturan lint proyek (setState serentak di dalam
     * effect) tanpa menghasilkan apa pun yang tidak sudah benar.
     */
    if (diam) return;

    let rafA = 0;
    let rafB = 0;

    /*
     * Dua `requestAnimationFrame` sebelum menyalakan animasinya — dan ini
     * BUKAN kehati-hatian berlebihan.
     *
     * Menyetel keadaan langsung di dalam effect membuat tinggi kolom
     * berubah dari 0% ke nilai akhirnya di dalam tugas yang sama dengan
     * pemasangannya. Peramban belum pernah MENGGAMBAR keadaan nol, jadi
     * tidak ada "sebelum" untuk ditransisikan: kolomnya muncul langsung di
     * tinggi akhir dan transisinya dilewati diam-diam.
     *
     * Dibuktikan dengan mengukur tinggi tiap 180 ms setelah halaman
     * berpindah: pengukuran pertama yang berhasil sudah menunjukkan nilai
     * akhir (178, 168, 162, …), tanpa satu pun bingkai di antaranya.
     *
     * Bingkai pertama memastikan keadaan nol tercatat, bingkai kedua
     * memastikan ia benar-benar tercat sebelum nilainya diganti.
     */
    const nyalakan = () => {
      rafA = requestAnimationFrame(() => {
        rafB = requestAnimationFrame(() => setTampil(true));
      });
    };

    const el = wadah.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      nyalakan();
      return () => {
        cancelAnimationFrame(rafA);
        cancelAnimationFrame(rafB);
      };
    }

    const kotak = el.getBoundingClientRect();
    if (kotak.bottom > 0 && kotak.top < window.innerHeight) {
      nyalakan();
      return () => {
        cancelAnimationFrame(rafA);
        cancelAnimationFrame(rafB);
      };
    }

    const pengamat = new IntersectionObserver(
      (masukan) => {
        if (!masukan.some((m) => m.isIntersecting)) return;
        nyalakan();
        pengamat.disconnect();
      },
      { threshold: 0.15 },
    );
    pengamat.observe(el);
    return () => {
      pengamat.disconnect();
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
  }, [diam]);

  if (data.length === 0) {
    return (
      <div
        className={cn("cekung grid place-items-center p-6 text-center", className)}
        style={{ height: tinggi }}
      >
        <p className="text-sm text-muted">Belum ada data pemakaian.</p>
      </div>
    );
  }

  const nilaiMaks = Math.max(...data.map((d) => d.nilai), target ?? 0);

  /*
   * Puncak sumbu diberi kelonggaran 18%.
   *
   * Tanpa itu kolom tertinggi menyentuh bibir tabungnya, dan tabung yang
   * terisi penuh sampai bibir terbaca sebagai "sudah mentok" — padahal
   * yang dimaksud cuma "paling tinggi minggu ini". Kelonggaran juga
   * menyediakan ruang untuk angka di atas kolom.
   */
  const puncak = nilaiMaks > 0 ? nilaiMaks * 1.18 : 1;

  const persen = (n: number) => Math.max(0, Math.min(100, (n / puncak) * 100));

  /* Tiga garis kisi, selalu. Jumlah yang berubah-ubah mengikuti data membuat
     grafik terasa bergeser tiap kali rentangnya diganti. */
  const kisi = [0.25, 0.5, 0.75].map((f) => ({
    f,
    nilai: puncak * f,
  }));

  /*
   * Lebar yang DISISIHKAN di kanan untuk chip label target.
   *
   * Tanpa ruang ini chip-nya menindih kolom terakhir — dibuktikan di
   * layar: "Rata-rata 121 L" duduk persis di atas kolom Jumat dan menutupi
   * angkanya. Menggesernya saja tidak cukup; selama ia berada di dalam
   * bidang yang sama dengan kolom, selalu ada data di belakangnya. Yang
   * benar adalah mengecilkan bidang kolomnya.
   */
  const ruangLabel = labelTarget ? 92 : 0;

  const tertinggi = data.reduce(
    (a, d, i) => (d.nilai > (data[a]?.nilai ?? -1) ? i : a),
    0,
  );

  return (
    <div ref={wadah} className={cn("relative", className)}>
      {/* Area gambar */}
      <div className="relative" style={{ height: tinggi }}>
        {/* ── Kisi ukur. Di BELAKANG tabung, tidak pernah menimpa air. ── */}
        <div aria-hidden className="absolute inset-0">
          {kisi.map(({ f, nilai }) => (
            <div
              key={f}
              className="absolute right-0 left-0 flex items-center gap-2"
              style={{ bottom: `${f * 100}%` }}
            >
              <span className="w-10 shrink-0 text-right font-mono text-[10px] text-muted">
                {format ? format(nilai) : Math.round(nilai)}
              </span>
              <span className="h-px flex-1 border-t border-dashed border-line" />
            </div>
          ))}
        </div>

        {/* ── Garis target ── */}
        {typeof target === "number" && target > 0 && target <= puncak ? (
          <div
            aria-hidden
            className="absolute right-0 left-0 z-20 flex items-center gap-2"
            style={{ bottom: `${persen(target)}%` }}
          >
            <span className="w-10 shrink-0" />
            <span className="h-0 flex-1 border-t-[1.5px] border-dashed border-warn" />
            {labelTarget ? (
              /*
               * Label target duduk DI ATAS garisnya dan rata kanan, bukan
               * di dalam area gambar. Versi sebelumnya meletakkannya di
               * dalam, dan ia bertabrakan dengan angka di atas kolom
               * terakhir — dua teks berbeda warna saling menindih persis di
               * tempat mata berhenti membaca.
               */
              <span
                className="shrink-0 rounded-[6px] bg-warn-soft px-1.5 py-0.5 text-center font-mono text-[10px] leading-tight font-bold text-warn"
                style={{ width: ruangLabel - 8 }}
              >
                {labelTarget}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* ── Tabung ── */}
        <div
          className="absolute inset-0 flex items-end gap-1.5 pl-12 sm:gap-2.5"
          style={{ paddingRight: ruangLabel }}
        >
          {data.map((d, i) => {
            const tinggiAir = persen(d.nilai);
            /*
             * `bergerak` menggabungkan dua syarat yang harus dipenuhi
             * BERSAMAAN: gerakan diizinkan, DAN grafiknya sudah masuk
             * layar. Kalau salah satu tidak terpenuhi, kolomnya langsung
             * digambar di tinggi akhir — bukan disembunyikan. Gerakan yang
             * dikurangi tidak boleh berarti data yang hilang.
             */
            const bergerak = !diam && tampil;
            const aktif = sorot === i;
            const ditegaskan = i === tertinggi;

            return (
              <div
                key={`${d.label}-${i}`}
                className="group relative flex h-full flex-1 flex-col justify-end"
                onMouseEnter={() => setSorot(i)}
                onMouseLeave={() => setSorot(null)}
                onFocus={() => setSorot(i)}
                onBlur={() => setSorot(null)}
                tabIndex={0}
                role="img"
                aria-label={`${d.label}: ${format ? format(d.nilai) : d.nilai}`}
              >
                {/* Angka di atas kolom. Naik bersama airnya, jadi ia terbaca
                    MILIK kolom itu, bukan teks yang kebetulan di dekatnya. */}
                <span
                  /*
                   * `z-30` DAN latar sendiri, keduanya diperlukan.
                   *
                   * Angka kolom yang nilainya dekat dengan target duduk
                   * tepat di garis putus-putusnya, dan garis itu lewat
                   * menembus angkanya — "122 L" tergambar seperti tercoret.
                   * Menaikkan lapisan saja tidak cukup karena garisnya tetap
                   * terlihat di sela-sela huruf; latar kecil yang sewarna
                   * kartu memberi angkanya ruang bersih untuk berdiri.
                   */
                  className={cn(
                    "naik-angka pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 rounded-[5px] bg-surface/90 px-1 text-center font-mono text-[10.5px] font-bold whitespace-nowrap",
                    aktif || ditegaskan ? "text-ink" : "text-muted",
                  )}
                  style={{
                    ["--tinggi-air" as string]: `${tinggiAir}%`,
                    opacity: bergerak ? undefined : 1,
                    bottom: bergerak ? undefined : `calc(${tinggiAir}% + 6px)`,
                    animationName: bergerak ? "naik-angka" : "none",
                    animationDuration: `${DURASI_NAIK_MS}ms`,
                    animationTimingFunction: "cubic-bezier(0.16, 0.84, 0.24, 1)",
                    animationDelay: `${i * JENJANG_MS}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {format ? format(d.nilai) : d.nilai}
                </span>

                {/* Tabung kaca: wadah, jadi CEKUNG. */}
                {/*
                  Tabungnya punya BATAS LEBAR, kolomnya tidak.
                 *
                 * Kolom tetap `flex-1` supaya ketujuhnya menyebar rata
                 * sampai tepi kartu — tanpa itu grafiknya menggerombol di
                 * tengah dan menyisakan pita kosong di samping. Tapi tabung
                 * yang ikut melar mengikuti kolom berhenti terbaca sebagai
                 * tabung: pada kartu selebar layar, tujuh kolom berarti
                 * tujuh balok selebar 200px, dan seluruh kaca, gelombang,
                 * serta pantulan dindingnya tenggelam di bidang sebesar itu.
                 *
                 * Jadi yang dibatasi isinya, bukan wadahnya. Sisa ruang
                 * menjadi jarak antar tabung yang merata, bukan satu
                 * gumpalan kosong di satu sisi.
                 */}
                <div
                  className={cn(
                    "relative mx-auto w-full max-w-[4.5rem] overflow-hidden rounded-t-[10px] rounded-b-[4px] transition-colors",
                    aktif ? "bg-brand-100/60" : "bg-surface-2/70",
                  )}
                  style={{
                    height: "100%",
                    boxShadow: "var(--cekung-dalam)",
                  }}
                >
                  {/* Air */}
                  <div
                    className="naik-air absolute inset-x-0 bottom-0 origin-bottom"
                    style={{
                      ["--tinggi-air" as string]: `${tinggiAir}%`,
                      /*
                       * Nama animasi dipasang BELAKANGAN, saat grafiknya
                       * masuk layar. Keyframes selalu mulai dari `from`
                       * begitu namanya berubah dari `none`, jadi gerbang
                       * ini aman — tidak seperti `transition`, yang butuh
                       * keadaan awal yang sudah tercat lebih dulu.
                       */
                      height: bergerak ? undefined : `${tinggiAir}%`,
                      animationName: bergerak ? "naik-air" : "none",
                      animationDuration: `${DURASI_NAIK_MS}ms`,
                      animationTimingFunction: "cubic-bezier(0.16, 0.84, 0.24, 1)",
                      animationDelay: `${i * JENJANG_MS}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    {/* Badan air: terang di permukaan, memekat ke dasar —
                        air menyerap cahaya seiring kedalaman. */}
                    <div
                      className="absolute inset-0 rounded-t-[8px]"
                      style={{
                        backgroundImage: ditegaskan
                          ? "linear-gradient(to bottom, var(--color-brand-400), var(--color-chart-1-dalam))"
                          : "linear-gradient(to bottom, var(--color-brand-300), var(--color-brand-700))",
                        opacity: aktif || ditegaskan ? 1 : 0.88,
                      }}
                    />

                    {/* Permukaan bergelombang. Dua gelombang berlawanan arah
                        dengan laju berbeda: searah akan saling menyusul
                        berkala dan polanya ketahuan mengulang. */}
                    {!diam && tinggiAir > 2 ? (
                      <svg
                        aria-hidden
                        viewBox="0 0 120 14"
                        preserveAspectRatio="none"
                        className="absolute -top-[6px] left-0 h-3 w-full overflow-visible"
                      >
                        <path
                          d={`M -120 8 q 15 -7 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 L 240 20 L -120 20 Z`}
                          fill="var(--color-brand-300)"
                          opacity="0.5"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to="120 0"
                            dur="7s"
                            repeatCount="indefinite"
                          />
                        </path>
                        <path
                          d={`M -120 8 q 15 -7 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 L 240 20 L -120 20 Z`}
                          fill={
                            ditegaskan
                              ? "var(--color-brand-400)"
                              : "var(--color-brand-300)"
                          }
                        >
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            from="0 0"
                            to="-120 0"
                            dur="4.5s"
                            repeatCount="indefinite"
                          />
                        </path>
                      </svg>
                    ) : null}

                    {/* Kilau tepi atas: tebal permukaan air. */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-px bg-white/55"
                    />
                    {/* Pantulan di dinding kiri — satu-satunya hal yang
                        membuat tabung terbaca melengkung, bukan datar. */}
                    <span
                      aria-hidden
                      className="absolute top-0 bottom-0 left-[14%] w-[9%] rounded-full bg-white/22"
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/*
        Label hari tinggal DI LUAR area gambar, pada baris sendiri yang
        meniru tata letak kolomnya (`pl-12`, jarak sama, `flex-1` sama).
        Ditaruh di dalam kolom, ia ikut terhitung dalam tinggi tabung: air
        100% akan berhenti di atas labelnya sendiri, dan tiap tabung jadi
        lebih pendek daripada area yang dijanjikan sumbu.
      */}
      <div
        className="mt-2 flex gap-1.5 pl-12 sm:gap-2.5"
        style={{ paddingRight: ruangLabel }}
      >
        {data.map((d, i) => (
          <span
            key={`l-${d.label}-${i}`}
            className={cn(
              "flex-1 text-center text-[11px] transition-colors",
              sorot === i || i === tertinggi
                ? "font-semibold text-ink"
                : "text-muted",
            )}
          >
            {d.label}
          </span>
        ))}
      </div>

      <span className="sr-only" id={`ringkas-${uid}`}>
        Grafik pemakaian air per hari. Tertinggi {data[tertinggi]?.label} dengan{" "}
        {format ? format(data[tertinggi]?.nilai ?? 0) : data[tertinggi]?.nilai}.
      </span>
    </div>
  );
}
