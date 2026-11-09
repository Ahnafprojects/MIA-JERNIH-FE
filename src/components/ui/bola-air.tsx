"use client";

import { useId } from "react";

import { useHematGerak } from "@/lib/hemat-gerak";

/**
 * Saldo air sebagai bola kaca berisi air.
 *
 * ── Kenapa bulat, bukan tabung ────────────────────────────────────────
 *
 * Versi pertama benda ini adalah silinder, dan silinder tidak pernah
 * berhasil terbaca sebagai benda: permukaan tabung hanya melengkung pada
 * SATU sumbu, jadi seluruh bidang depannya punya kecerahan yang hampir
 * sama. Yang tersisa adalah persegi panjang biru dengan elips di atasnya —
 * bentuk yang sama persis dengan gambar gelas pada klipart, dan terbaca
 * begitu.
 *
 * Bola melengkung pada DUA sumbu. Kecerahannya karena itu berubah ke segala
 * arah dari satu titik sorot, dan perubahan itulah yang dibaca mata sebagai
 * volume. Bentuk yang sama, bayangan yang sama, hasil yang sama sekali
 * berbeda — bukan karena bayangannya lebih banyak, melainkan karena
 * permukaannya punya alasan untuk berubah.
 *
 * ── Tiga lapis yang harus ada bersamaan ───────────────────────────────
 *
 *   1. Sorot utama di atas-kiri — tajam, kecil, hampir putih. Ini pantulan
 *      langsung sumber cahaya, dan ini yang memberi tahu mata di mana
 *      cahayanya berada.
 *   2. Bayangan dalam di bawah-kanan — sisi yang membelakangi cahaya.
 *   3. Pantulan balik tipis di tepi bawah. Benda bening meneruskan cahaya
 *      yang memantul dari permukaan di bawahnya kembali ke dalam dirinya.
 *      Tanpa lapis ketiga, bolanya terbaca sebagai cakram buram.
 *
 * Nomor 3 yang hampir selalu dilewatkan, dan justru itu pembeda antara
 * "lingkaran dengan gradien" dan "bola kaca".
 *
 * ── Cincin di sekelilingnya ───────────────────────────────────────────
 *
 * Tinggi air menjawab "kira-kira berapa" dalam sepersekian detik, tapi mata
 * tidak bisa membaca tinggi di dalam bentuk bulat secara tepat — setengah
 * bola BUKAN setengah tinggi. Cincin di luarnya yang membawa angka tepatnya.
 * Keduanya mengukur hal yang sama dengan cara berbeda, untuk dua cara
 * membaca yang berbeda.
 */
export function BolaAir({
  isiL,
  kapasitasL,
  kritis = false,
  className,
}: {
  /** Saldo sekarang, dalam liter. */
  isiL: number;
  /** Tinggi penuh. Bukan batas fisik meter — hanya acuan baca. */
  kapasitasL: number;
  /** Saldo kritis: airnya yang berubah merah, bukan hanya labelnya. */
  kritis?: boolean;
  className?: string;
}) {
  /*
   * Gradien dan clip-path SVG dirujuk lewat id GLOBAL di seluruh dokumen.
   * Dua bola di satu halaman dengan id sama membuat yang kedua memakai
   * gradien milik yang pertama — termasuk warna kritisnya, yang berarti
   * peringatan merah bisa diam-diam tergambar biru.
   */
  const uid = useId().replace(/:/g, "");
  /*
   * Gelombangnya digerakkan `<animateTransform>` — animasi SMIL, bukan
   * animasi CSS — jadi `animation: none` pada kelas `motion-aware` tidak
   * menyentuhnya sama sekali. Setelannya harus dibaca di JavaScript dan
   * animasinya tidak dipasang sejak awal, bukan dipasang lalu dibungkam.
   */
  const diam = useHematGerak();

  const rasio = kapasitasL > 0 ? Math.min(1, Math.max(0, isiL / kapasitasL)) : 0;
  const persen = Math.round(rasio * 100);

  const CX = 120;
  const CY = 120;
  const R_BOLA = 86;
  const R_CINCIN = 104;

  /*
   * Permukaan air tidak pernah menyentuh puncak bola walaupun saldo penuh:
   * air yang rata dengan atap terbaca sebagai wadah yang MELUAP, dan itu
   * pembacaan yang salah untuk keadaan paling baik. Sisa 5px selalu udara.
   */
  const RUANG_UDARA = 5;
  const yPenuh = CY - R_BOLA + RUANG_UDARA;
  const yKosong = CY + R_BOLA;
  const yAir = yKosong - (yKosong - yPenuh) * rasio;

  /* Saldo nol tidak menggambar air sama sekali. Elips setinggi nol
     menyisakan garis tipis di dasar yang terbaca sebagai "masih ada". */
  const adaAir = rasio > 0.004;

  const warnaAir = kritis ? "var(--color-danger)" : "var(--color-brand-500)";
  const warnaDalam = kritis ? "var(--color-danger)" : "var(--color-brand-700)";

  /*
   * Cincin digambar dari atas, searah jarum jam. `strokeDasharray` memakai
   * keliling penuh sebagai satuan, jadi panjang busurnya langsung rasio —
   * tidak ada angka ajaib yang harus dihitung ulang kalau jarinya berubah.
   */
  const keliling = 2 * Math.PI * R_CINCIN;

  /*
   * Satu periode gelombang 68px, digambar sepanjang 12 periode supaya
   * menutupi lebar bola bahkan saat tergeser penuh. Pergeserannya tepat 2
   * periode (136px), jadi bingkai terakhir identik dengan bingkai pertama
   * dan pengulangannya tidak punya sambungan yang terlihat. Angka yang
   * bukan kelipatan periode akan berkedut tiap kali mengulang.
   *
   * Ekornya turun sampai y=420, jauh melewati dasar bola. Versi pertama
   * berhenti di y=150, dan karena gelombangnya digambar lebih terang
   * daripada air di bawahnya, batas bawah jalur itu muncul sebagai GARIS
   * MENDATAR TEGAS di tengah bola — terbaca seperti bola yang retak. Ekor
   * yang kelewat panjang tidak punya biaya apa pun: semuanya dipotong oleh
   * clip-path bolanya.
   */
  const ombak =
    "M -170 9 q 17 -9 34 0 t 34 0 t 34 0 t 34 0 t 34 0 t 34 0 t 34 0 t 34 0 " +
    "t 34 0 t 34 0 t 34 0 t 34 0 L 238 420 L -170 420 Z";

  return (
    <div className={className}>
      <svg
        viewBox="0 0 240 240"
        className="h-full w-full overflow-visible"
        role="img"
        aria-label={`Saldo air terisi ${persen} persen dari acuan`}
      >
        <defs>
          {/* Air: terang di permukaan, memekat ke dasar. Air sungguhan
              menyerap cahaya seiring kedalaman — tanpa ini isinya terbaca
              sebagai cat, bukan cairan. */}
          <linearGradient id={`air-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={warnaAir} stopOpacity="0.95" />
            <stop offset="100%" stopColor={warnaDalam} />
          </linearGradient>

          {/* Lapis 1 — sorot utama. Titiknya SEMPIT dan padam cepat; sorot
              yang melebar terbaca sebagai kabut, bukan pantulan. */}
          <radialGradient id={`sorot-${uid}`} cx="33%" cy="26%" r="42%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          {/*
           * Lapis 2 — sisi yang membelakangi cahaya.
           *
           * Pusatnya didorong KELUAR ke 82%/82%, hampir di tepi bola, dan
           * jarinya dipendekkan. Versi pertama memusatkannya di 68%/74%
           * dengan jari 62%, dan bayangnya merayap sampai ke tengah: yang
           * terlihat bukan sisi gelap bola melainkan bercak kelabu di dalam
           * airnya, seperti kotoran. Bayangan pada benda bulat hanya hidup
           * di pinggir — begitu ia masuk ke tengah, bolanya berhenti
           * terbaca sebagai bola dan mulai terbaca sebagai noda.
           */}
          <radialGradient id={`bayang-${uid}`} cx="82%" cy="82%" r="48%">
            <stop offset="0%" stopColor="#0a2230" stopOpacity="0.26" />
            <stop offset="60%" stopColor="#0a2230" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0a2230" stopOpacity="0" />
          </radialGradient>

          {/* Lapis 3 — pantulan balik dari permukaan di bawah bola. Inilah
              yang membedakan kaca dari cakram buram. Dipersempit dengan
              alasan yang sama: pantulan balik yang melebar memucatkan
              seluruh separuh bawah. */}
          <radialGradient id={`balik-${uid}`} cx="50%" cy="99%" r="34%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`cincin-${uid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={warnaDalam} />
            <stop offset="100%" stopColor={warnaAir} />
          </linearGradient>

          {/* Seluruh isi dipotong ke bentuk bola: tanpa ini gelombangnya
              menjulur keluar sebagai persegi. */}
          <clipPath id={`bola-${uid}`}>
            <circle cx={CX} cy={CY} r={R_BOLA} />
          </clipPath>
        </defs>

        {/* Bayangan kontak. Tanpa ini bolanya melayang tanpa tempat. */}
        <ellipse
          cx={CX}
          cy={CY + R_BOLA + 22}
          rx={R_BOLA * 0.72}
          ry="9"
          fill="hsl(var(--bayang-nada) / 0.18)"
          className="blur-[5px]"
        />

        {/* ── Cincin ukur ── */}
        <circle
          cx={CX}
          cy={CY}
          r={R_CINCIN}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth="7"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_CINCIN}
          fill="none"
          stroke={`url(#cincin-${uid})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${keliling * rasio} ${keliling}`}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{
            transition: diam ? "none" : "stroke-dasharray 700ms ease-out",
          }}
        />

        {/* ── Rongga bola sebelum diisi ── */}
        <circle cx={CX} cy={CY} r={R_BOLA} fill="var(--color-surface-2)" />

        {/* ── Air ── */}
        {adaAir ? (
          <g clipPath={`url(#bola-${uid})`}>
            <rect
              x={CX - R_BOLA - 4}
              y={yAir}
              width={R_BOLA * 2 + 8}
              height={R_BOLA * 2}
              fill={`url(#air-${uid})`}
            />

            {/*
             * Dua gelombang, arah BERLAWANAN. Dua gelombang searah dengan
             * laju berbeda akan saling menyusul secara berkala dan polanya
             * ketahuan mengulang; arah berlawanan tidak pernah mengulang
             * pola yang sama dan terbaca sebagai permukaan.
             */}
            <g transform={`translate(${CX - 68} ${yAir - 9})`}>
              <path d={ombak} fill={warnaAir} opacity="0.4">
                {!diam ? (
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="136 0"
                    dur="9s"
                    repeatCount="indefinite"
                  />
                ) : null}
              </path>
              <path d={ombak} fill={warnaAir} opacity="0.92">
                {!diam ? (
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    from="0 0"
                    to="-136 0"
                    dur="6s"
                    repeatCount="indefinite"
                  />
                ) : null}
              </path>
            </g>

            {/* Garis permukaan: tepi air yang menangkap cahaya. */}
            <rect
              x={CX - R_BOLA}
              y={yAir - 1}
              width={R_BOLA * 2}
              height="1.5"
              fill="#fff"
              opacity="0.5"
            />
          </g>
        ) : null}

        {/* ── Kaca: tiga lapis, selalu di atas isinya ── */}
        <g clipPath={`url(#bola-${uid})`}>
          <circle cx={CX} cy={CY} r={R_BOLA} fill={`url(#bayang-${uid})`} />
          <circle cx={CX} cy={CY} r={R_BOLA} fill={`url(#balik-${uid})`} />
          <circle cx={CX} cy={CY} r={R_BOLA} fill={`url(#sorot-${uid})`} />
        </g>

        {/* Kilau tepi: cincin tipis di dalam garis luar, lebih terang di
            atas-kiri. Ini tebal dinding kacanya. */}
        <circle
          cx={CX}
          cy={CY}
          r={R_BOLA - 1}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_BOLA}
          fill="none"
          stroke="var(--color-line-strong)"
          strokeOpacity="0.5"
          strokeWidth="1"
        />

        {/*
         * ── Angka di tengah ──
         *
         * Warnanya mengikuti APA YANG ADA DI BELAKANGNYA, bukan dipatok.
         * Putih benar saat airnya tinggi dan angkanya duduk di atas biru
         * pekat; begitu air turun melewati tengah, latarnya menjadi rongga
         * terang dan teks putih hilang sama sekali. Mematok satu warna di
         * sini berarti angka saldo tidak terbaca persis pada saat saldo
         * paling perlu dibaca.
         */}
        <text
          x={CX}
          y={CY + 2}
          textAnchor="middle"
          className="font-mono text-[34px] font-black"
          fill={yAir < CY - 4 ? "#fff" : "var(--color-ink)"}
          style={{ letterSpacing: "-0.02em" }}
        >
          {persen}
          <tspan className="text-[17px] font-bold" dy="-10">
            %
          </tspan>
        </text>
      </svg>
    </div>
  );
}
