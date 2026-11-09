"use client";

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import { angka } from "@/lib/format";

/**
 * Lapisan sebaran kebocoran pipa di atas peta zona.
 *
 * ── Kenapa PETAK, bukan titik ─────────────────────────────────────────
 *
 * Server tidak mengirim koordinat aduan yang sebenarnya. Ia membulatkannya ke
 * petak ~110 m lalu mengirim titik TENGAH petak itu, karena pin yang digeser
 * warga bisa saja berhenti tepat di pagar rumahnya sendiri. Lihat komentar
 * kepala `src/lib/titik-kebocoran.ts` di backend untuk alasan lengkapnya.
 *
 * Konsekuensinya mengikat bentuk di berkas ini: penandanya digambar sebagai
 * LINGKARAN BERKABUT, bukan pin berujung lancip. Pin menunjuk ke satu titik
 * dan menjanjikan presisi yang memang tidak ada — orang akan membaca "pipa
 * bocor di rumah itu" padahal datanya cuma "ada kebocoran di sekitar sini".
 * Lingkaran berkabut menyatakan ketidakpastian itu secara jujur.
 *
 * ── Kenapa angkanya ditulis di dalam penanda ──────────────────────────
 *
 * Satu petak bisa memuat belasan aduan untuk satu ruas pipa yang sama. Tanpa
 * angka, lima belas aduan dan satu aduan terbaca identik, dan peta justru
 * menyembunyikan hal yang paling ingin diketahui warga: di mana yang paling
 * parah.
 */

export interface PetakKebocoran {
  lat: number;
  lng: number;
  jumlah: number;
  berjalan: number;
  selesai: number;
  terlambat: number;
  rataJamPerbaikan: number | null;
  terbaruPada: string;
}

/** Bentuk balasan `GET /api/publik/titik-kebocoran`. */
export interface SebaranKebocoran {
  rentangHari: number;
  sisiPetakDerajat: number;
  kategori: string;
  jumlahPetak: number;
  jumlahAduan: number;
  petak: PetakKebocoran[];
}

type Nada = "terlambat" | "berjalan" | "selesai";

/**
 * Nada ditentukan oleh yang PALING MENDESAK di petak itu, bukan oleh
 * mayoritas. Satu kebocoran yang lewat tenggat di antara sembilan yang sudah
 * selesai tetap kebocoran yang lewat tenggat, dan merata-ratakannya jadi
 * "hijau" persis jenis pembulatan yang membuat orang berhenti bertanya.
 */
function nadaPetak(p: PetakKebocoran): Nada {
  if (p.terlambat > 0) return "terlambat";
  if (p.berjalan > 0) return "berjalan";
  return "selesai";
}

/*
 * Teks di dalam penanda: PUTIH di tema terang, TINTA GELAP di tema gelap.
 *
 * Ini bukan kerapian, dan sempat salah. Warna status di tema gelap sengaja
 * dibuat LEBIH TERANG daripada versi terangnya — di sana ia dipakai sebagai
 * warna teks di atas latar nyaris hitam, bukan sebagai isian. Memakai
 * `text-white` untuk kedua tema membuat angka di dalam lingkaran nyaris
 * tidak terbaca begitu temanya berganti. Terukur di peramban:
 *
 *   putih di atas success gelap  #3dba87 → 2,45:1   GAGAL
 *   putih di atas danger  gelap  #e0695f → 3,30:1   GAGAL
 *   putih di atas warn    gelap  #d99c45 → 2,39:1   GAGAL
 *
 * Dengan `dark:text-canvas` (#05161c) ketiganya menjadi 5,58–7,73:1. Angka
 * di penanda berukuran 11px, jadi ambangnya 4,5:1, bukan 3:1.
 */
const GAYA: Record<
  Nada,
  { kabut: string; inti: string; teks: string; label: string }
> = {
  terlambat: {
    kabut: "bg-danger/25",
    inti: "bg-danger text-white ring-danger/40 dark:text-canvas",
    teks: "text-danger",
    label: "Lewat tenggat",
  },
  berjalan: {
    kabut: "bg-warn/25",
    inti: "bg-warn text-white ring-warn/40 dark:text-canvas",
    teks: "text-warn",
    label: "Sedang ditangani",
  },
  selesai: {
    kabut: "bg-success/20",
    inti: "bg-success text-white ring-success/35 dark:text-canvas",
    teks: "text-success",
    label: "Sudah diperbaiki",
  },
};

export function LapisanKebocoran({ petak }: { petak: PetakKebocoran[] }) {
  return (
    <>
      {petak.map((p) => {
        const nada = nadaPetak(p);
        const gaya = GAYA[nada];

        return (
          <MapMarker
            /* Kunci dari koordinat petak, bukan indeks: urutan dari server
               bisa berubah saat rentang harinya diganti, dan kunci berbasis
               indeks membuat React memakai ulang penanda untuk petak yang
               berbeda — tooltipnya ikut tertukar. */
            key={`${p.lat},${p.lng}`}
            longitude={p.lng}
            latitude={p.lat}
            anchor="center"
          >
            <MarkerContent>
              <span className="relative grid size-11 place-items-center">
                {/* Kabut seukuran ketidakpastian. `motion-aware` supaya
                    denyutnya ikut mati saat gerakan dikurangi — yang hilang
                    gerakannya, bentuknya tetap. */}
                <span
                  aria-hidden
                  className={`motion-aware absolute inset-0 rounded-full blur-[6px] ${gaya.kabut}`}
                />
                <span
                  className={`relative grid size-7 place-items-center rounded-full font-mono text-[11px] font-bold tabular-nums ring-2 ${gaya.inti}`}
                >
                  {p.jumlah}
                </span>
              </span>

              <MarkerTooltip>
                <p className={`font-semibold ${gaya.teks}`}>{gaya.label}</p>
                <p className="mt-1 text-[12.5px]">
                  <strong className="font-mono tabular-nums">
                    {angka(p.jumlah)}
                  </strong>{" "}
                  aduan kebocoran di sekitar sini
                </p>
                <ul className="mt-1.5 space-y-0.5 text-[11.5px] text-muted">
                  <li>
                    Sedang ditangani:{" "}
                    <span className="font-mono tabular-nums">{p.berjalan}</span>
                    {p.terlambat > 0 ? (
                      <>
                        {" "}
                        (
                        <span className="font-mono tabular-nums">
                          {p.terlambat}
                        </span>{" "}
                        lewat tenggat)
                      </>
                    ) : null}
                  </li>
                  <li>
                    Sudah diperbaiki:{" "}
                    <span className="font-mono tabular-nums">{p.selesai}</span>
                  </li>
                  <li>
                    Rata-rata perbaikan:{" "}
                    {/* `null` berarti belum ada satu pun yang selesai.
                        Ditulis em dash, BUKAN 0 — nol berarti "selesai
                        seketika", klaim yang sama sekali berbeda. */}
                    <span className="font-mono tabular-nums">
                      {p.rataJamPerbaikan === null
                        ? "—"
                        : `${angka(p.rataJamPerbaikan, 1)} jam`}
                    </span>
                  </li>
                  <li>Aduan terbaru: {p.terbaruPada}</li>
                </ul>
                <p className="mt-2 text-[11px] text-muted italic">
                  Titik dibulatkan ke petak sekitar 110 m untuk melindungi
                  privasi pelapor.
                </p>
              </MarkerTooltip>
            </MarkerContent>
          </MapMarker>
        );
      })}
    </>
  );
}

/** Keterangan lapisan kebocoran, dipasang di bawah legenda zona. */
export function LegendaKebocoran() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-4 py-3 sm:px-5">
      {(["terlambat", "berjalan", "selesai"] as const).map((n) => (
        <li key={n} className="flex items-center gap-2 text-[12.5px]">
          <span
            aria-hidden
            className={`size-2.5 shrink-0 rounded-full ${GAYA[n].inti.split(" ")[0]}`}
          />
          <span className="font-semibold">{GAYA[n].label}</span>
        </li>
      ))}
      <li className="text-[12px] text-muted">
        Angka di dalam lingkaran = jumlah aduan kebocoran di petak itu.
      </li>
    </ul>
  );
}
