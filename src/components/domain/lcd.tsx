import { cn } from "@/lib/cn";

/**
 * Celah antar sel karakter, dalam em.
 *
 * Modul 16×2 sungguhan punya jarak tetap antar sel — huruf tidak pernah
 * berimpit. Tanpa ini barisnya terbaca sebagai teks biasa yang kebetulan
 * monospace, bukan sebagai layar karakter.
 */
const SPASI_SEL = 0.05;

/** Lebar satu baris penuh: 16 sel × (lebar huruf JetBrains Mono + celahnya). */
const LEBAR_16 = 16 * (0.6 + SPASI_SEL);

/**
 * Kisi piksel LCD.
 *
 * Yang membuat layar HD44780 langsung dikenali bukan warnanya, melainkan
 * kisi titiknya: hurufnya tersusun dari titik, dan kisi yang TIDAK menyala
 * tetap samar terlihat di seluruh permukaan. Garisnya sengaja setebal
 * 0,012em — di bawah satu piksel, jadi mesin render menggambarnya sebagai
 * garis tipis beranti-alias, bukan jeruji hitam.
 *
 * Ukurannya ikut `font-size` lewat satuan em, sehingga kisinya tetap sejajar
 * dengan huruf pada ukuran layar berapa pun.
 */
const KISI_PIKSEL = {
  backgroundImage: [
    "repeating-linear-gradient(90deg, rgba(20,34,4,0.11) 0 0.012em, transparent 0.012em 0.1em)",
    "repeating-linear-gradient(0deg, rgba(20,34,4,0.11) 0 0.012em, transparent 0.012em 0.1em)",
  ].join(","),
} as const;

/**
 * Layar LCD 16×2 meter air.
 *
 * Teks di sini meniru layar perangkat, BUKAN teks aplikasi. Karena itu
 * angkanya memakai titik desimal (`S=4820.50L`) sementara seluruh UI lain
 * memakai koma. Jangan "diperbaiki" agar seragam — justru bedanya itu yang
 * membuat tampilannya terbaca sebagai layar mesin.
 *
 * Lebarnya MENGISI induknya, tidak mengecil mengikuti panjang teks. Versi
 * sebelumnya `inline-block` dengan ukuran huruf tetap, sehingga layarnya
 * berakhir jauh lebih sempit daripada keypad di bawahnya dan perangkatnya
 * terlihat timpang. Layar LCD sungguhan punya lebar tetap — yang berubah
 * hanya isinya. Ukuran hurufnya kini dihitung dari lebar wadah (`cqw`)
 * supaya 16 karakter persis memenuhi jendela pada ukuran berapa pun.
 *
 * Warna di berkas ini ditulis sebagai hex, menyalahi aturan "warna hanya dari
 * token". Itu disengaja: ini warna BENDA, bukan warna tema. Layar LCD hijau
 * tetap hijau baik di tema terang maupun gelap — menukarnya mengikuti tema
 * justru membuatnya berhenti terbaca sebagai perangkat keras.
 */
export function LcdDisplay({
  baris1,
  baris2,
  label,
  className,
}: {
  baris1: string;
  baris2?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("@container w-full", className)}>
      {/*
        Bingkai modul — bukan sekadar garis tepi.
        Modul 16×2 adalah papan dengan jendela yang MENJOROK KE DALAM. Bingkai
        berpadding plus bayangan di dalam layar memberi kedalaman itu; `border`
        saja membuatnya terbaca sebagai kotak dengan garis, bukan jendela.
      */}
      <div
        className="rounded-[2.4cqw] p-[2.6cqw] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
        style={{ background: "linear-gradient(#4a4e45, #2e322b)" }}
      >
        <div
          className={cn(
            "lcd-screen relative overflow-hidden rounded-[1.2cqw]",
            "px-[5cqw] py-[4.2cqw] font-mono leading-[1.62]",
          )}
          style={{
            /*
             * Lebar yang benar-benar tersisa untuk 16 sel, dalam cqw:
             *   100  − 5,2 (padding bingkai modul)  − 10 (padding jendela)
             *       = 84,8  → dipakai 84 supaya ada sisa sedikit.
             * Angka ini TERIKAT pada `p-[2.6cqw]` dan `px-[5cqw]` di atas.
             * Kalau salah satunya diubah, hitung ulang — kalau tidak, baris
             * 16 karakternya meluap diam-diam dan ujungnya terpotong.
             */
            fontSize: `clamp(0.58rem, calc(84cqw / ${LEBAR_16}), 1.6rem)`,
            letterSpacing: `${SPASI_SEL}em`,
          }}
        >
          {/* 16 karakter per baris, persis seperti layar aslinya. */}
          <div className="whitespace-pre">{baris1.padEnd(16).slice(0, 16)}</div>
          <div className="whitespace-pre">
            {(baris2 ?? "").padEnd(16).slice(0, 16)}
          </div>

          {/*
            Kisi piksel digambar DI ATAS hurufnya, bukan di bawah. Pada layar
            sungguhan batas antar titik memotong hurufnya juga — kalau kisinya
            ditaruh di belakang, hurufnya tampak mulus dan efeknya hilang.
          */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={KISI_PIKSEL}
          />
        </div>
      </div>

      {label ? (
        <p className="mt-1.5 text-center text-[11px] text-muted">{label}</p>
      ) : null}
    </div>
  );
}
