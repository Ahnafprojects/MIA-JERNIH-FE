"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { KeadaanKosong } from "@/components/ui/keadaan";
import { angka } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useHematGerak } from "@/lib/hemat-gerak";

/*
 * Grafik Jernih.
 *
 * Gaya bawaan Recharts terbaca sebagai "ada grafik di sini", bukan sebagai
 * halaman ini. Yang dikerjakan di berkas ini supaya grafiknya punya watak
 * sendiri dan tetap jujur:
 *
 * - Batang dan area diisi GRADIEN: pekat di garis dasar, memudar ke atas.
 *   Tinta paling tebal ada di tempat nilainya diukur, bukan di ujung yang
 *   mengambang.
 * - Nilai terbaru (dan nilai tertinggi, bila deretnya tunggal) ditegaskan
 *   dengan isian lebih kuat. Sisanya sengaja tenang.
 * - Sumbu tanpa garis tebal, kisi hanya mendatar dan setipis satu piksel.
 *   Kisi bukan data; ia tidak boleh berebut perhatian dengan data.
 * - Tooltip digarap sendiri: permukaan, garis tipis, angka mono bertabular,
 *   lengkap dengan satuan. Tooltip bawaan memakai putih dan abu yang tidak
 *   ikut berubah saat tema gelap.
 * - Nilai yang tidak dikirim server menjadi `null`, BUKAN 0 — garisnya
 *   putus di situ. Nol adalah hasil pengukuran, dan tidak boleh dikarang.
 *
 * Animasi gambar-ulang AKTIF, tetapi pendek (650 ms) dan hanya berguna pada
 * dua momen: saat grafiknya pertama kali MASUK LAYAR, dan saat rentang
 * waktunya diganti. Tanpa itu, 7 hari berganti menjadi 30 hari dalam satu
 * bingkai dan mata tidak sempat menyadari grafiknya sudah jadi grafik yang
 * lain.
 *
 * Durasinya sengaja pendek. Animasi Recharts menggambar garis lewat
 * `stroke-dasharray`, jadi selama animasi berjalan grafiknya belum utuh —
 * makin lama durasinya, makin besar peluang seseorang melihat grafik yang
 * masih kosong. `prefers-reduced-motion` mematikannya sepenuhnya.
 */

const WARNA = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

/*
 * Pasangan gelap tiap warna deret, untuk dasar kolom.
 *
 * DITULIS, bukan dihitung. Upaya pertama memakai `color-mix()` langsung di
 * `stop-color`, dan seluruh batang hilang dari grafik: Chrome tidak mengurai
 * `color-mix()` pada atribut penyajian SVG, jadi isiannya jatuh ke tanpa
 * warna. Tidak ada galat, tidak ada peringatan — grafiknya hanya menggambar
 * sumbu dan kisi di atas bidang kosong, dan geometri batangnya tetap ada di
 * DOM dengan ukuran yang benar.
 *
 * `var()` sendiri bekerja di tempat yang sama, jadi yang dipakai di sini
 * tetap token, bukan hex — hanya pencampurannya yang dipindahkan ke waktu
 * tulis.
 */
const WARNA_DALAM = [
  "var(--color-chart-1-dalam)",
  "var(--color-chart-2-dalam)",
  "var(--color-chart-3-dalam)",
  "var(--color-chart-4-dalam)",
];

/** Warna deret mengikuti URUTANNYA, tetap, tidak pernah diputar ulang. */
const warnaDeret = (i: number) =>
  WARNA[((i % WARNA.length) + WARNA.length) % WARNA.length];

const warnaDalam = (i: number) =>
  WARNA_DALAM[((i % WARNA_DALAM.length) + WARNA_DALAM.length) %
    WARNA_DALAM.length];

const WARNA_CELAH = "var(--color-warn)";

/*
 * Garis langit-langit pada grafik celah sengaja NETRAL, bukan warna deret
 * kedua.
 *
 * Alasannya diukur, bukan dirasa: di tema gelap `chart-1` dan `chart-2`
 * hanya terpisah ΔE 10,6 (OKLab ×100) untuk penglihatan normal — di bawah
 * lantai 15, jadi dua garis bersebelahan itu sulit dibedakan. Lagi pula
 * nilai di atas adalah JUMLAH dari dua yang di bawahnya, bukan deret
 * sederajat; garis netral justru menyampaikan itu. Yang tersisa membawa
 * warna hanyalah dua besaran yang memang dibandingkan.
 */
const WARNA_LANGIT = "var(--color-ink)";

const sumbu = {
  tickLine: false,
  axisLine: false,
  tickMargin: 9,
  tick: { fill: "var(--color-muted)", fontSize: 11 },
};

/** Bentuk deret dari API: dicari lewat NAMA, bukan indeks. */
export interface Deret {
  name: string;
  unit?: string;
  points: number[];
}

type NilaiBaris = string | number | null;

const sah = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

/** Berapa lama grafik menggambar ulang dirinya saat datanya berganti. */
const DURASI_GAMBAR = 650;


/**
 * `useLayoutEffect` di peramban, `useEffect` di server.
 *
 * Keputusan "grafik ini sudah di layar atau belum" harus diambil SEBELUM cat
 * pertama. Diambil sesudahnya, grafik yang memang terlihat sempat tampil utuh
 * satu bingkai lalu digambar ulang dari nol — kedipan yang justru lebih
 * mengganggu daripada tidak beranimasi sama sekali. Di server tidak ada tata
 * letak untuk diukur, dan `useLayoutEffect` di sana hanya menghasilkan
 * peringatan.
 */
const useEfekTataLetak =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Kapan sebuah grafik boleh MULAI menggambar dirinya.
 *
 * Animasi Recharts berjalan begitu komponennya dipasang. Untuk grafik yang
 * letaknya di bawah layar, animasinya sudah habis sebelum pembacanya sampai
 * ke sana: yang terlihat saat digulir hanya grafik diam, dan animasinya tidak
 * pernah mengerjakan tugasnya.
 *
 * Yang dikembalikan hook ini BUKAN "boleh tampil", melainkan "boleh
 * bergerak". Bedanya menentukan: sebelum masuk layar grafiknya tetap digambar
 * UTUH, hanya tanpa animasi. Jadi kalau `IntersectionObserver` tidak ada,
 * observernya tidak pernah berbunyi, atau elemennya tidak pernah terpasang,
 * yang tersisa adalah grafik yang lengkap — bukan kotak kosong yang menunggu
 * peristiwa yang tidak akan datang. Keadaan amannya "tampil", bukan
 * "tersembunyi".
 *
 * Sekali saja: setelah menggambar, observernya dilepas. Gambar-ulang saat
 * rentang waktu diganti tidak lewat sini — itu urusan Recharts sendiri, dan
 * tetap berjalan seperti biasa.
 */
function useGambarSaatTerlihat(aktif: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [gambar, setGambar] = useState(false);

  useEfekTataLetak(() => {
    // Gerakan diminta dikurangi: grafik tinggal di keadaan utuh-tanpa-animasi.
    if (!aktif) return;

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setGambar(true);
      return;
    }

    // Sudah di layar saat dipasang — mis. grafik di bagian atas halaman.
    // Mulai sekarang juga, tanpa menunggu observer, supaya tidak ada bingkai
    // yang sempat memperlihatkan grafik utuh sebelum animasinya mulai.
    const kotak = el.getBoundingClientRect();
    if (kotak.bottom > 0 && kotak.top < window.innerHeight) {
      setGambar(true);
      return;
    }

    const pengamat = new IntersectionObserver(
      (entri) => {
        if (!entri.some((e) => e.isIntersecting)) return;
        setGambar(true);
        pengamat.disconnect();
      },
      { threshold: 0 },
    );
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, [aktif]);

  return { ref, gambar };
}

function keRecharts(labels: string[], deret: Deret[]) {
  return labels.map((l, i) => {
    const baris: Record<string, NilaiBaris> = { label: l };
    // Titik yang tidak dikirim server menjadi `null` supaya garisnya PUTUS.
    // Versi sebelumnya menukarnya dengan 0, dan itu menggambar lembah palsu
    // yang terbaca sebagai "hari itu layanannya nol".
    for (const d of deret)
      baris[d.name] = sah(d.points[i]) ? d.points[i] : null;
    return baris;
  });
}

/** Grafik tanpa satu pun angka sah wajib bilang apa adanya. */
function kosong(labels: string[], deret: Deret[]) {
  return (
    labels.length === 0 ||
    deret.length === 0 ||
    !deret.some((d) => d.points.some(sah))
  );
}

function Kosong() {
  return (
    <KeadaanKosong
      judul="Belum ada data"
      pesan="Data untuk rentang ini belum tersedia. Angkanya tidak dikarang untuk mengisi grafik."
    />
  );
}

/** Indeks titik sah terakhir pada sebuah deret. */
function indeksAkhir(points: number[], panjang: number) {
  for (let i = Math.min(points.length, panjang) - 1; i >= 0; i -= 1) {
    if (sah(points[i])) return i;
  }
  return -1;
}

/* ── Gradien ────────────────────────────────────────────────────────── */

/*
 * `<defs>` dirender di SVG tersembunyi DI LUAR grafik, bukan sebagai anak
 * `<BarChart>`: Recharts menyaring anak-anaknya dan elemen SVG asing bisa
 * ikut terbuang. Rujukan `url(#id)` antar-SVG dalam satu dokumen sah dan
 * didukung semua peramban.
 */
function DefsGradien({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width={0}
      height={0}
      className="absolute"
    >
      <defs>{children}</defs>
    </svg>
  );
}

function Gradien({
  id,
  warna,
  atas,
  bawah,
}: {
  id: string;
  warna: string;
  /** Kepekatan di ujung atas (yang memudar). */
  atas: number;
  /** Kepekatan di garis dasar. */
  bawah: number;
}) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={warna} stopOpacity={atas} />
      <stop offset="100%" stopColor={warna} stopOpacity={bawah} />
    </linearGradient>
  );
}

/**
 * Isian batang yang punya tebal.
 *
 * Berbeda dari `Gradien`, yang memudarkan SATU warna ke arah atas. Memudar
 * ke atas membuat ujung batang hampir sewarna latar, dan batang yang
 * ujungnya larut terbaca sebagai noda, bukan sebagai kolom — persis yang
 * membuat grafik sebelumnya terlihat kotor pada layar terang.
 *
 * Di sini yang berubah bukan kepekatan melainkan WARNA: terang di puncak,
 * pekat di dasar, keduanya penuh. Itu pola pencahayaan pada benda tegak
 * yang disinari dari atas, dan membuat tiap batang terbaca sebagai kolom
 * padat yang berdiri di garis dasar.
 *
 * Miring 12° dari tegak lurus supaya sisi kirinya sedikit lebih terang
 * daripada sisi kanannya — searah dengan cahaya di seluruh situs.
 */
function GradienKolom({
  id,
  atas,
  bawah,
  pekat,
}: {
  id: string;
  atas: string;
  bawah: string;
  /**
   * Kepekatan kolom. Yang ditegaskan penuh, yang tenang sedikit mundur.
   *
   * Tidak pernah di bawah 0,8. Versi sebelumnya memudar sampai 0,3 di
   * puncak, dan pada kepekatan itu garis kisi terlihat MENEMBUS batangnya —
   * itu yang membuat grafiknya terbaca berbintik alih-alih bersih.
   */
  pekat: number;
}) {
  return (
    <linearGradient id={id} x1="0.12" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={atas} stopOpacity={pekat} />
      <stop offset="100%" stopColor={bawah} stopOpacity={pekat} />
    </linearGradient>
  );
}

/* ── Tooltip ────────────────────────────────────────────────────────── */

interface SpekDeret {
  kunci: string;
  nama: string;
  warna: string;
  satuan?: string;
}

interface BarisTooltip {
  nama: string;
  warna: string;
  teks: string;
}

function KotakTooltip({
  label,
  baris,
}: {
  label: React.ReactNode;
  baris: BarisTooltip[];
}) {
  return (
    // Tooltip memang melayang di atas halaman, jadi ia salah satu dari sedikit
    // tempat yang boleh berbayang.
    <div className="pointer-events-none min-w-[11rem] rounded-input border border-line bg-surface px-3 py-2.5 shadow-md">
      <p className="eyebrow text-muted">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {baris.map((b) => (
          <li
            key={b.nama}
            className="flex items-baseline gap-2.5 text-[12.5px]"
          >
            <span
              aria-hidden
              className="size-2 shrink-0 translate-y-[-1px] rounded-full"
              style={{ background: b.warna }}
            />
            <span className="text-muted">{b.nama}</span>
            <span className="tabular ml-auto font-mono font-semibold text-ink">
              {b.teks}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Isi tooltip dibangun dari `spek`, bukan dari urutan payload: urutan baris
 * jadi tetap, dan satu deret yang digambar dua kali (area + garis) tidak
 * muncul dobel.
 */
function buatTooltip(spek: SpekDeret[], format?: (n: number) => string) {
  return function Isi(p: TooltipContentProps) {
    if (!p.active || !p.payload || p.payload.length === 0) return null;

    const baris: BarisTooltip[] = [];
    for (const s of spek) {
      const item = p.payload.find(
        (x) =>
          String(x.name ?? "") === s.nama ||
          String(x.dataKey ?? "") === s.kunci,
      );
      const v = item?.value;
      if (!sah(v)) continue;
      baris.push({
        nama: s.nama,
        warna: s.warna,
        teks: format
          ? format(v)
          : `${angka(v)}${s.satuan ? ` ${s.satuan}` : ""}`,
      });
    }
    if (baris.length === 0) return null;
    return <KotakTooltip label={p.label} baris={baris} />;
  };
}

/* ── Legenda ────────────────────────────────────────────────────────── */

/**
 * Legenda digarap sebagai HTML biasa, bukan `<Legend>` bawaan: ia harus
 * memakai huruf dan warna teks halaman, bukan huruf bawaan SVG.
 *
 * Identitas deret TIDAK boleh bergantung warna saja — tiap entri selalu
 * bernama.
 */
function BarisLegenda({
  item,
  tanda,
}: {
  item: { nama: string; warna: string; blok?: boolean }[];
  /** Keterangan garis ambang, bila ada. */
  tanda?: string;
}) {
  if (item.length < 2 && !tanda) return null;
  return (
    <ul className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {item.map((d) => (
        <li
          key={d.nama}
          className="flex items-center gap-2 text-[12px] text-muted"
        >
          <span
            aria-hidden
            className={cn(
              "shrink-0 rounded-full",
              d.blok ? "h-2.5 w-2.5" : "h-[3px] w-4",
            )}
            style={{ background: d.warna }}
          />
          {d.nama}
        </li>
      ))}
      {tanda ? (
        <li className="flex items-center gap-2 text-[12px] text-muted">
          <span
            aria-hidden
            className="h-0 w-4 shrink-0 border-t border-dashed border-line-strong"
          />
          {tanda}
        </li>
      ) : null}
    </ul>
  );
}

/* ── Grafik batang ──────────────────────────────────────────────────── */

export function GrafikBatang({
  labels,
  deret,
  tinggi = 240,
  format,
  formatSumbu,
  target,
  labelTarget,
}: {
  labels: string[];
  deret: Deret[];
  tinggi?: number;
  format?: (n: number) => string;
  /**
   * Format khusus label sumbu Y. Isi bila `format` menyertakan satuan:
   * "1.200 m³" di tiap tombak sumbu membuat sumbunya setebal grafiknya.
   */
  formatSumbu?: (n: number) => string;
  /**
   * Garis acuan mendatar — ambang yang seharusnya tidak dilewati.
   *
   * Tanpa acuan, tinggi batang hanya bisa dibandingkan dengan batang lain:
   * grafik memberi tahu hari mana yang paling boros, tetapi tidak pernah
   * memberi tahu apakah salah satunya TERLALU boros. Satu garis mengubah
   * grafik dari perbandingan antarhari menjadi penilaian.
   */
  target?: number;
  /** Teks pada garis target. Tanpa ini, garisnya tidak bisa ditafsirkan. */
  labelTarget?: string;
}) {
  const sid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const hematGerak = useHematGerak();
  const { ref: wadah, gambar } = useGambarSaatTerlihat(!hematGerak);
  const animasi = !hematGerak && gambar;
  if (kosong(labels, deret)) return <Kosong />;

  const data = keRecharts(labels, deret);
  /* Dihitung sekali: dipakai oleh margin atas DAN oleh keputusan memasang
     `<LabelList>`. Dua syarat yang harus selalu sama — kalau berbeda,
     marginnya tersisa saat labelnya tidak ada, atau sebaliknya. */
  const labelNilai = deret.length === 1 && labels.length <= 12;

  const spek: SpekDeret[] = deret.map((d, i) => ({
    kunci: d.name,
    nama: d.name,
    warna: warnaDeret(i),
    satuan: d.unit,
  }));

  /*
   * Yang ditegaskan: kolom TERAKHIR — periode terbaru, yang biasanya jadi
   * alasan orang membuka halaman ini. Bila deretnya tunggal, nilai tertinggi
   * ikut ditegaskan. Penegasan ini emfasis, bukan skala warna: tinggi batang
   * sudah menyampaikan besarannya, warna tidak boleh mengulang hal yang sama.
   */
  const tegas = new Set<number>();
  deret.forEach((d) => {
    const akhir = indeksAkhir(d.points, labels.length);
    if (akhir >= 0) tegas.add(akhir);
  });
  if (deret.length === 1) {
    let puncak = -1;
    let nilaiPuncak = Number.NEGATIVE_INFINITY;
    deret[0].points.slice(0, labels.length).forEach((v, i) => {
      if (sah(v) && v > nilaiPuncak) {
        nilaiPuncak = v;
        puncak = i;
      }
    });
    if (puncak >= 0) tegas.add(puncak);
  }

  return (
    <div ref={wadah} className="relative">
      <DefsGradien>
        {deret.flatMap((d, i) => [
          /*
           * Dua tingkat, dan keduanya PENUH — yang membedakan kolom tenang
           * dari kolom yang ditegaskan adalah jarak warnanya, bukan
           * kepekatannya. Kolom tembus pandang memperlihatkan garis kisi
           * menembus data, dan itu yang membuat grafik lama terbaca berbintik.
           */
          <GradienKolom
            key={`b${i}`}
            id={`${sid}-b${i}`}
            atas={warnaDeret(i)}
            bawah={warnaDalam(i)}
            pekat={0.82}
          />,
          <GradienKolom
            key={`k${i}`}
            id={`${sid}-k${i}`}
            atas={warnaDeret(i)}
            bawah={warnaDalam(i)}
            pekat={1}
          />,
        ])}
      </DefsGradien>

      <BarisLegenda
        item={spek.map((s) => ({ nama: s.nama, warna: s.warna, blok: true }))}
      />

      <ResponsiveContainer width="100%" height={tinggi}>
        <BarChart
          // Grafik dipasang ulang saat izin menggambar datang, supaya
          // animasinya benar-benar mulai dari nol di depan pembacanya.
          key={animasi ? "gambar" : "diam"}
          data={data}
          /*
           * Ruang atas 24px saat label nilai dipasang.
           *
           * Dengan 6px, label di atas kolom TERTINGGI tergambar separuh di
           * luar bingkai dan terpotong — dan kolom tertinggi justru yang
           * paling sering ingin dibaca angkanya. Dibuktikan pada grafik
           * tujuh hari: "247 L" dan "251 L" terpenggal di tepi atas.
           */
          margin={{ left: 0, right: 6, top: labelNilai ? 24 : 6 }}
          barCategoryGap="18%"
          barGap={3}
        >
          {/* Kisi PUTUS-PUTUS, bukan utuh. Garis utuh di belakang kolom
              terbaca sebagai bagian dari gambarnya; garis putus terbaca
              sebagai alat ukur yang kebetulan ada di belakang. */}
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="2 5"
            vertical={false}
          />
          <XAxis dataKey="label" {...sumbu} interval="preserveStartEnd" />
          <YAxis
            {...sumbu}
            tickFormatter={formatSumbu ?? format}
            width="auto"
          />
          <Tooltip
            cursor={{ fill: "var(--color-soft)", opacity: 0.55 }}
            content={buatTooltip(spek, format)}
          />
          {/*
           * Digambar SEBELUM batangnya, jadi batang yang melewati target
           * menembus garisnya alih-alih tertutup. Garis yang menimpa data
           * membuat batang tertinggi tampak terpotong di ambang — persis
           * kebalikan dari yang sedang diberitahukan.
           */}
          {typeof target === "number" && target > 0 ? (
            <ReferenceLine
              y={target}
              stroke="var(--color-warn)"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={
                labelTarget
                  ? {
                      value: labelTarget,
                      position: "insideTopRight",
                      fill: "var(--color-warn)",
                      fontSize: 10,
                      fontWeight: 700,
                    }
                  : undefined
              }
            />
          ) : null}
          {deret.map((d, i) => (
            <Bar
              key={d.name}
              dataKey={d.name}
              name={d.name}
              /*
               * Lebih tebal dan puncaknya dibulatkan penuh. Batang 22px
               * dengan sudut 3px terbaca sebagai lidi: terlalu tipis untuk
               * menampung gradiennya sendiri, jadi volume apa pun yang
               * diberikan padanya hilang. Pembulatan 7px pada lebar 34px
               * memberi puncaknya bentuk tanpa membuatnya jadi kapsul.
               */
              maxBarSize={34}
              radius={[7, 7, 2, 2]}
              isAnimationActive={animasi}
              /*
               * Lebih lama dan melambat di akhir.
               *
               * 650 ms dengan pelonggaran bawaan berakhir sebelum mata
               * sempat mengikuti kolom mana yang tumbuh paling tinggi —
               * yang terlihat hanya grafik yang berkedip sekali lalu diam,
               * dan itu terbaca sebagai tidak ada animasi sama sekali.
               * `ease-out` membuat kolomnya melesat lalu mengendap, yang
               * meniru benda berhenti karena ditahan, bukan karena waktunya
               * habis.
               */
              animationDuration={DURASI_GAMBAR + 300}
              animationEasing="ease-out"
              /*
               * Kolom yang disentuh menyala penuh. Tanpa ini satu-satunya
               * tanggapan atas tetikus adalah tooltip yang muncul entah dari
               * mana; grafiknya sendiri tidak pernah mengakui disentuh.
               */
              activeBar={{
                fill: `url(#${sid}-k${i})`,
                stroke: warnaDeret(i),
                strokeWidth: 1.5,
              }}
            >
              {data.map((_, j) => (
                <Cell
                  key={j}
                  fill={`url(#${sid}-${tegas.has(j) ? "k" : "b"}${i})`}
                />
              ))}

              {/*
               * Angka di atas kolom — hanya bila deretnya TUNGGAL.
               *
               * Pada deret ganda, label akan saling menindih di tiap
               * kelompok dan grafiknya berubah menjadi kerumunan angka.
               * Pada deret tunggal, label menghapus satu langkah kerja yang
               * selama ini dibebankan ke pembaca: menebak tinggi kolom
               * terhadap sumbu, lalu membulatkannya sendiri.
               */}
              {labelNilai ? (
                <LabelList
                  dataKey={d.name}
                  position="top"
                  offset={8}
                  className="fill-muted font-mono text-[10px] font-bold"
                  /*
                   * Nilainya datang sebagai `RenderableText`, bukan `number`:
                   * Recharts meneruskan apa pun yang ada di data, termasuk
                   * `null` untuk periode yang tidak dikirim server. Diubah
                   * sendiri di sini, dan yang bukan angka sah menghasilkan
                   * teks kosong — label "NaN" di atas kolom lebih buruk
                   * daripada tidak ada label.
                   */
                  formatter={(v: unknown) => {
                    const n = typeof v === "number" ? v : Number(v);
                    if (!sah(n)) return "";
                    return (formatSumbu ?? format)?.(n) ?? String(n);
                  }}
                />
              ) : null}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Grafik garis ───────────────────────────────────────────────────── */

export function GrafikGaris({
  labels,
  deret,
  tinggi = 240,
  format,
  formatSumbu,
  domain,
  ambang,
  labelAmbang,
}: {
  labels: string[];
  deret: Deret[];
  tinggi?: number;
  format?: (n: number) => string;
  formatSumbu?: (n: number) => string;
  /**
   * Batas sumbu Y. Isi bila datanya bergerak di pita sempit.
   *
   * Contoh: ketepatan SLA berkisar 88–96%. Dengan sumbu 0–100 bawaan,
   * seluruh garis terjepit di 10% teratas dan terbaca sebagai garis datar
   * "selalu sempurna" — justru menyembunyikan naik-turun yang ingin
   * ditunjukkan. Sumbu tetap berlabel persen, jadi pembaca tahu ia tidak
   * dimulai dari nol.
   */
  domain?: [number, number];
  /** Garis ambang mendatar, mis. target SLA 90%. */
  ambang?: number;
  /** Nama ambang untuk legenda. Garis putus-putus tanpa nama tidak berarti. */
  labelAmbang?: string;
}) {
  const sid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const hematGerak = useHematGerak();
  const { ref: wadah, gambar } = useGambarSaatTerlihat(!hematGerak);
  const animasi = !hematGerak && gambar;
  if (kosong(labels, deret)) return <Kosong />;

  const data = keRecharts(labels, deret);
  const spek: SpekDeret[] = deret.map((d, i) => ({
    kunci: d.name,
    nama: d.name,
    warna: warnaDeret(i),
    satuan: d.unit,
  }));

  return (
    <div ref={wadah} className="relative">
      <DefsGradien>
        {deret.map((d, i) => (
          <Gradien
            key={i}
            id={`${sid}-a${i}`}
            warna={warnaDeret(i)}
            atas={0.26}
            bawah={0}
          />
        ))}
      </DefsGradien>

      <BarisLegenda
        item={spek.map((s) => ({ nama: s.nama, warna: s.warna }))}
        tanda={typeof ambang === "number" ? labelAmbang : undefined}
      />

      <ResponsiveContainer width="100%" height={tinggi}>
        <ComposedChart
          key={animasi ? "gambar" : "diam"}
          data={data}
          /*
           * `right: 14`, bukan 10.
           *
           * Titik penekan di ujung deret (`ReferenceDot r=8`) digambar
           * BERPUSAT pada nilai terakhir, jadi separuhnya — 8px — menjorok
           * ke kanan melewati batas area plot. Dengan sisa 10px titiknya
           * masih terpotong tepi kanan di semua lebar. Angka ini terikat
           * pada jari-jari titik itu: kalau `r` diubah, sisa ini ikut.
           */
          margin={{ left: 0, right: 14, top: 10 }}
        >
          <CartesianGrid stroke="var(--color-chart-grid)" vertical={false} />
          <XAxis dataKey="label" {...sumbu} interval="preserveStartEnd" />
          <YAxis
            {...sumbu}
            tickFormatter={formatSumbu ?? format}
            width="auto"
            domain={domain ?? ["auto", "auto"]}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-line-strong)", strokeWidth: 1 }}
            content={buatTooltip(spek, format)}
          />

          {/* Ambang digambar putus-putus — di sini putus-putus memang berarti
              "batas", bukan sekadar hiasan kisi. */}
          {typeof ambang === "number" ? (
            <ReferenceLine
              y={ambang}
              stroke="var(--color-line-strong)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          ) : null}

          {/* Isian area digambar lebih dulu, garisnya di atasnya. */}
          {deret.map((d, i) => (
            <Area
              key={`isi-${d.name}`}
              type="monotone"
              dataKey={d.name}
              name={d.name}
              stroke="none"
              fill={`url(#${sid}-a${i})`}
              connectNulls={false}
              isAnimationActive={animasi}
              animationDuration={DURASI_GAMBAR}
              activeDot={false}
            />
          ))}
          {deret.map((d, i) => (
            <Line
              key={`garis-${d.name}`}
              type="monotone"
              dataKey={d.name}
              name={d.name}
              stroke={warnaDeret(i)}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              connectNulls={false}
              isAnimationActive={animasi}
              animationDuration={DURASI_GAMBAR}
              activeDot={{
                r: 4,
                fill: warnaDeret(i),
                stroke: "var(--color-surface)",
                strokeWidth: 2,
              }}
            />
          ))}

          {/* Titik akhir: lingkaran berisi dengan halo dan cincin permukaan,
              supaya "di mana angkanya sekarang" terbaca tanpa hover. */}
          {deret.flatMap((d, i) => {
            const j = indeksAkhir(d.points, labels.length);
            if (j < 0) return [];
            return [
              <ReferenceDot
                key={`halo-${d.name}`}
                x={labels[j]}
                y={d.points[j]}
                r={8}
                fill={warnaDeret(i)}
                fillOpacity={0.18}
                stroke="none"
              />,
              <ReferenceDot
                key={`titik-${d.name}`}
                x={labels[j]}
                y={d.points[j]}
                r={4}
                fill={warnaDeret(i)}
                stroke="var(--color-surface)"
                strokeWidth={2}
              />,
            ];
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Grafik celah ───────────────────────────────────────────────────── */

/**
 * Dua deret yang satu selalu di atas yang lain, dengan JARAK di antaranya
 * diarsir sebagai pita tersendiri.
 *
 * Dibuat untuk kehilangan air: dua batang berdampingan memaksa pembaca
 * mengurangi sendiri di kepalanya. Di sini selisihnya digambar sebagai
 * luasan — yang hilang jadi benda yang bisa dilihat, bukan hasil hitungan.
 */
export function GrafikCelah({
  labels,
  atas,
  bawah,
  namaCelah,
  tinggi = 260,
  format,
  formatSumbu,
}: {
  labels: string[];
  /** Deret yang lebih besar — langit-langit, mis. air disalurkan. */
  atas: Deret | null;
  /** Deret yang lebih kecil — dasar, mis. air tercatat. */
  bawah: Deret | null;
  /** Nama pita selisih, mis. "Hilang di perjalanan". */
  namaCelah: string;
  tinggi?: number;
  format?: (n: number) => string;
  formatSumbu?: (n: number) => string;
}) {
  const sid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const hematGerak = useHematGerak();
  const { ref: wadah, gambar } = useGambarSaatTerlihat(!hematGerak);
  const animasi = !hematGerak && gambar;
  if (!atas || !bawah || kosong(labels, [atas, bawah])) return <Kosong />;

  const data = labels.map((l, i) => {
    const a = atas.points[i];
    const b = bawah.points[i];
    // Satu titik hilang membuat selisihnya tidak bisa dihitung. Yang benar
    // adalah mengosongkan keduanya, bukan menebak salah satunya.
    const lengkap = sah(a) && sah(b) && a >= b;
    return {
      label: l,
      dasar: lengkap ? b : null,
      celah: lengkap ? a - b : null,
      atasNilai: lengkap ? a : null,
    };
  });

  const spek: SpekDeret[] = [
    {
      kunci: "atasNilai",
      nama: atas.name,
      warna: WARNA_LANGIT,
      satuan: atas.unit,
    },
    { kunci: "celah", nama: namaCelah, warna: WARNA_CELAH, satuan: atas.unit },
    {
      kunci: "dasar",
      nama: bawah.name,
      warna: warnaDeret(0),
      satuan: bawah.unit,
    },
  ];

  return (
    <div ref={wadah} className="relative">
      <DefsGradien>
        {/* Dasar sengaja tenang dan celahnya pekat: yang jadi cerita adalah
            JARAKNYA, bukan tumpukan di bawahnya. */}
        <Gradien
          id={`${sid}-dasar`}
          warna={warnaDeret(0)}
          atas={0.16}
          bawah={0.4}
        />
        <Gradien
          id={`${sid}-celah`}
          warna={WARNA_CELAH}
          atas={0.8}
          bawah={0.42}
        />
      </DefsGradien>

      <BarisLegenda
        item={[
          { nama: atas.name, warna: WARNA_LANGIT },
          { nama: namaCelah, warna: WARNA_CELAH, blok: true },
          { nama: bawah.name, warna: warnaDeret(0) },
        ]}
      />

      <ResponsiveContainer width="100%" height={tinggi}>
        <ComposedChart
          key={animasi ? "gambar" : "diam"}
          data={data}
          /*
           * `right: 14`, bukan 10.
           *
           * Titik penekan di ujung deret (`ReferenceDot r=8`) digambar
           * BERPUSAT pada nilai terakhir, jadi separuhnya — 8px — menjorok
           * ke kanan melewati batas area plot. Dengan sisa 10px titiknya
           * masih terpotong tepi kanan di semua lebar. Angka ini terikat
           * pada jari-jari titik itu: kalau `r` diubah, sisa ini ikut.
           */
          margin={{ left: 0, right: 14, top: 10 }}
        >
          <CartesianGrid stroke="var(--color-chart-grid)" vertical={false} />
          <XAxis dataKey="label" {...sumbu} interval="preserveStartEnd" />
          <YAxis
            {...sumbu}
            tickFormatter={formatSumbu ?? format}
            width="auto"
          />
          <Tooltip
            cursor={{ stroke: "var(--color-line-strong)", strokeWidth: 1 }}
            content={buatTooltip(spek, format)}
          />

          <Area
            dataKey="dasar"
            name={bawah.name}
            stackId="celah"
            type="monotone"
            stroke="none"
            fill={`url(#${sid}-dasar)`}
            connectNulls={false}
            isAnimationActive={animasi}
            animationDuration={DURASI_GAMBAR}
            activeDot={false}
          />
          <Area
            dataKey="celah"
            name={namaCelah}
            stackId="celah"
            type="monotone"
            stroke="none"
            fill={`url(#${sid}-celah)`}
            connectNulls={false}
            isAnimationActive={animasi}
            animationDuration={DURASI_GAMBAR}
            activeDot={false}
          />
          {/* Kedua tepi pita digambar sebagai GARIS. Tanpa ini batas atas dan
              batas bawah celahnya cuma tepi isian yang samar, dan "jarak
              antara dua garis" tidak benar-benar punya dua garis. */}
          <Line
            dataKey="dasar"
            name={bawah.name}
            type="monotone"
            stroke={warnaDeret(0)}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            connectNulls={false}
            isAnimationActive={animasi}
            animationDuration={DURASI_GAMBAR}
            activeDot={{
              r: 4,
              fill: warnaDeret(0),
              stroke: "var(--color-surface)",
              strokeWidth: 2,
            }}
          />
          <Line
            dataKey="atasNilai"
            name={atas.name}
            type="monotone"
            stroke={WARNA_LANGIT}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            connectNulls={false}
            isAnimationActive={animasi}
            animationDuration={DURASI_GAMBAR}
            activeDot={{
              r: 4,
              fill: WARNA_LANGIT,
              stroke: "var(--color-surface)",
              strokeWidth: 2,
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Batang mini ────────────────────────────────────────────────────── */

const NADA_BAR = {
  brand: "bg-brand-500",
  sukses: "bg-success",
  peringatan: "bg-warn",
  bahaya: "bg-danger",
  netral: "bg-line-strong",
};

/**
 * Batang pembanding sebaris, untuk dipasang DI DALAM baris daftar atau
 * tabel.
 *
 * Mata membandingkan panjang jauh lebih cepat daripada membandingkan angka
 * bertumpuk. Batang ini `aria-hidden`: angkanya selalu ada di sebelahnya,
 * jadi pembaca layar tidak perlu mendengar hiasan yang sama dua kali.
 */
export function BarMini({
  nilai,
  maks = 100,
  nada = "brand",
  tanda,
  className,
}: {
  /** `null` berarti server tidak mengirim angkanya — jalurnya tampil kosong. */
  nilai: number | null;
  maks?: number;
  nada?: keyof typeof NADA_BAR;
  /** Penanda ambang, dalam satuan yang sama dengan `nilai`. */
  tanda?: number;
  className?: string;
}) {
  const persen =
    sah(nilai) && maks > 0
      ? Math.min(100, Math.max(0, (nilai / maks) * 100))
      : null;
  const persenTanda =
    sah(tanda) && maks > 0
      ? Math.min(100, Math.max(0, (tanda / maks) * 100))
      : null;

  return (
    <span
      aria-hidden
      className={cn(
        "relative block h-1.5 w-full overflow-hidden rounded-full bg-soft",
        className,
      )}
    >
      {persen === null ? null : (
        <span
          className={cn(
            "motion-aware absolute inset-y-0 left-0 rounded-full",
            "transition-[width] duration-700 ease-out",
            NADA_BAR[nada],
          )}
          style={{ width: `${persen}%` }}
        />
      )}
      {persenTanda === null ? null : (
        <span
          className="absolute inset-y-0 w-px bg-ink/45"
          style={{ left: `${persenTanda}%` }}
        />
      )}
    </span>
  );
}
