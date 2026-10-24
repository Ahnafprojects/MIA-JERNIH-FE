"use client";

/**
 * Peta sebaran meter — 8.055 titik di satu layar.
 *
 * Dimuat lewat `peta-dinamis.tsx` (`next/dynamic`, `ssr: false`) supaya
 * MapLibre tidak ikut ke paket awal halaman dan tidak pernah dijalankan di
 * server. Jangan meng-import berkas ini langsung dari halaman.
 *
 * ── Kenapa lapisan MapLibre, bukan penanda DOM ─────────────────────────
 *
 * Ini keputusan terpenting di halaman ini. `<MapMarker>` membuat satu elemen
 * DOM per titik; delapan ribu di antaranya harus diposisikan ulang oleh CPU
 * pada SETIAP bingkai saat peta digeser, dan hasilnya tersendat di laptop
 * mana pun. Satu lapisan `circle` di atas satu sumber GeoJSON digambar GPU
 * dalam satu panggilan, dan jumlah titiknya nyaris tidak berpengaruh.
 *
 * Konsekuensinya: penyaringan TIDAK boleh dikerjakan dengan membangun ulang
 * GeoJSON — itu mengunggah ulang delapan ribu titik ke GPU tiap kali kotak
 * centang ditekan. Dikerjakan dengan `setFilter`, yang hanya menukar satu
 * ekspresi.
 *
 * ── Kenapa gaya peta TIDAK pernah ditukar ──────────────────────────────
 *
 * Batas zona adalah lapisan TAMBAHAN di atas basemap, bukan mode pengganti.
 * Versi sebelumnya menyalakannya dengan menukar `<Map>` ke `blank`, dan
 * basemap-nya hilang: yang tersisa empat garis poligon di atas layar putih.
 * `styles` di bawah ini tetap sama apa pun keadaan kotak centangnya; satu-
 * satunya yang berubah adalah ada atau tidaknya `<LapisanBatas>`.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type * as MapLibreGL from "maplibre-gl";
import type { FeatureCollection, Point, Polygon } from "geojson";
import { Map, MapControls, useMap } from "@/components/ui/map";
import { STATUS_METER } from "./status-meter";
import { useWarnaPeta, type WarnaPeta } from "./warna-meter";
import type { BatasZona, PinMeter, StatusMeter, Titik } from "./tipe";
// Gaya atribusi dan cincin fokus MapLibre. Dipakai bersama peta zona publik
// supaya kedua peta di produk ini tidak pernah berbeda penampilannya.
import "@/components/peta/peta.css";

/**
 * Basemap vector CARTO — gratis dan tanpa kunci API.
 *
 * JANGAN menggantinya dengan tile raster CARTO (`.../{z}/{x}/{y}.png`): sejak
 * 2024 petak rasternya menuntut kunci API dan membalas gambar bertuliskan
 * "API KEY REQUIRED", yang baru kelihatan setelah halaman tayang.
 */
const GAYA = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

/** Cekungan Bandung. Urutannya [bujur, lintang]. */
const PUSAT: Titik = [107.72, -6.89];
const ZOOM_AWAL = 10;

/*
 * Id lapisan DITETAPKAN, bukan dari `useId()`.
 *
 * `LapisanBatas` perlu menyebut nama lapisan pin untuk menyisipkan dirinya DI
 * BAWAHnya; id yang dibangkitkan per komponen tidak bisa saling disebut, dan
 * batas zona akan menutupi pin begitu kotak centangnya dinyalakan setelah
 * peta jalan. Halaman ini hanya memasang satu peta, jadi nama tetap aman.
 */
const SUMBER_PIN = "jernih-pin-sumber";
const LAPIS_PIN = "jernih-pin";
const LAPIS_SOROT = "jernih-pin-sorot";
const SUMBER_ZONA = "jernih-zona-sumber";
const LAPIS_ZONA_ISI = "jernih-zona-isi";
const LAPIS_ZONA_GARIS = "jernih-zona-garis";

type Kotak = [[number, number], [number, number]];

/** Sudut peta yang ditempati kartu detail; dihitung dari letak pin yang diklik. */
export type PosisiKartu = "kanan-atas" | "kiri-bawah";

/** Pemilihan pin, lengkap dengan saran letak kartunya. */
export type PilihPin = (
  id: string | null,
  opsi?: { posisi: PosisiKartu },
) => void;

/** Permintaan memusatkan peta ke satu titik; `nonce` membuatnya bisa diulang. */
export interface FokusPeta {
  titik: Titik;
  nonce: number;
}

function kotakTitik(titik: Titik[]): Kotak | null {
  let bBarat = Infinity;
  let bTimur = -Infinity;
  let lSelatan = Infinity;
  let lUtara = -Infinity;

  for (const [bujur, lintang] of titik) {
    if (bujur < bBarat) bBarat = bujur;
    if (bujur > bTimur) bTimur = bujur;
    if (lintang < lSelatan) lSelatan = lintang;
    if (lintang > lUtara) lUtara = lintang;
  }

  if (!Number.isFinite(bBarat) || !Number.isFinite(lSelatan)) return null;
  return [
    [bBarat, lSelatan],
    [bTimur, lUtara],
  ];
}

/** Pengguna yang mematikan animasi sistem tidak boleh dilempar melintasi peta. */
function diam(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ── Lapisan pin ─────────────────────────────────────────────────────────

/** Cat lapisan lingkaran, tanpa `undefined` — supaya bisa ditelusuri kuncinya. */
type CatLingkaran = NonNullable<MapLibreGL.CircleLayerSpecification["paint"]>;

type SifatPin = {
  id: string;
  status: StatusMeter;
  zonaId: string;
};

/**
 * Cat lingkaran.
 *
 * `circle-radius` tumbuh bersama zoom, bukan tetap: pada zoom jauh delapan
 * ribu lingkaran berdiameter sama akan saling menimpa jadi satu bercak, dan
 * pada zoom dekat masing-masing jadi noktah yang sulit diklik.
 *
 * Meter normal sengaja lebih pudar. Bukan untuk cantik: 87% jaringan berstatus
 * normal, dan kalau semuanya dicat sepekat yang lain, 86 insiden yang justru
 * dicari petugas tenggelam di dalamnya. Jumlahnya tidak berubah sedikit pun —
 * legenda tetap menghitung keempat statusnya utuh.
 */
function catPin(warna: WarnaPeta): CatLingkaran {
  return {
    "circle-color": [
      "match",
      ["get", "status"],
      "normal",
      warna.status.normal,
      "alarm",
      warna.status.alarm,
      "insiden",
      warna.status.insiden,
      "offline",
      warna.status.offline,
      warna.status.normal,
    ],
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      8,
      1.8,
      10,
      2.6,
      12,
      4,
      14,
      6.5,
      17,
      11,
    ],
    "circle-opacity": [
      "case",
      ["==", ["get", "status"], "normal"],
      0.5,
      0.92,
    ],
    // Garis tepi baru muncul saat titiknya sudah cukup besar untuk punya tepi.
    "circle-stroke-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      11,
      0,
      13.5,
      0.8,
    ],
    "circle-stroke-color": warna.permukaan,
    "circle-stroke-opacity": 0.6,
  };
}

/** Cincin aksen pada pin terpilih. Satu-satunya pemakaian aksen di peta ini. */
function catSorot(warna: WarnaPeta): CatLingkaran {
  return {
    "circle-color": warna.aksen,
    "circle-opacity": 0.16,
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      8,
      7,
      12,
      10,
      16,
      17,
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": warna.aksen,
    "circle-stroke-opacity": 0.95,
  };
}

function LapisanPin({
  data,
  warna,
  saring,
  dipilih,
  onPilih,
}: {
  data: FeatureCollection<Point, SifatPin>;
  warna: WarnaPeta;
  /** Ekspresi saringan MapLibre, atau `null` saat semuanya tampil. */
  saring: unknown[] | null;
  dipilih: string | null;
  onPilih: PilihPin;
}) {
  const { map, isLoaded } = useMap();

  // Penangan peristiwa peta berjalan jauh setelah render, jadi callback
  // terbarunya disimpan lewat effect — menulis ref saat render dilarang
  // `react-hooks/refs`, dan alasannya benar.
  const terbaru = useRef({ onPilih });
  useEffect(() => {
    terbaru.current = { onPilih };
  });

  /*
   * Sumber dan lapisan dipasang sekali, dan DIPASANG ULANG saat gaya peta
   * berganti. `isLoaded` dari konteks sudah memperhitungkan itu: ia kembali
   * false selama `setStyle` berjalan, jadi effect ini membersihkan diri
   * sebelum gaya lama dibuang lalu memasang ulang di atas gaya baru. Tanpa
   * itu, menukar tema akan menghapus seluruh pin dan hanya menyisakan
   * basemap.
   */
  useEffect(() => {
    if (!map || !isLoaded) return;

    map.addSource(SUMBER_PIN, { type: "geojson", data });
    map.addLayer({
      id: LAPIS_PIN,
      type: "circle",
      source: SUMBER_PIN,
      layout: {
        /*
         * Urutan gambar, bukan urutan data.
         *
         * Titik digambar menurut urutannya di sumber; tanpa kunci ini, meter
         * normal yang kebetulan datang belakangan menutupi insiden di
         * bawahnya. Angka lebih besar digambar paling akhir, jadi paling
         * atas — dan yang paling genting selalu yang terlihat.
         */
        "circle-sort-key": [
          "match",
          ["get", "status"],
          "normal",
          0,
          "offline",
          1,
          "alarm",
          2,
          "insiden",
          3,
          0,
        ],
      },
      paint: catPin(warna),
    });
    map.addLayer({
      id: LAPIS_SOROT,
      type: "circle",
      source: SUMBER_PIN,
      paint: catSorot(warna),
      filter: ["==", ["get", "id"], ""],
    });

    return () => {
      try {
        if (map.getLayer(LAPIS_SOROT)) map.removeLayer(LAPIS_SOROT);
        if (map.getLayer(LAPIS_PIN)) map.removeLayer(LAPIS_PIN);
        if (map.getSource(SUMBER_PIN)) map.removeSource(SUMBER_PIN);
      } catch {
        // Gaya bisa sedang dimuat ulang; lapisannya ikut terbuang sendiri.
      }
    };
    // `data` dan `warna` SENGAJA di luar daftar: keduanya disinkronkan oleh
    // effect di bawah tanpa membongkar sumbernya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded]);

  // Isi sumber disetel ulang, bukan sumbernya dibuat ulang.
  useEffect(() => {
    if (!map || !isLoaded) return;
    const sumber = map.getSource(SUMBER_PIN) as
      | MapLibreGL.GeoJSONSource
      | undefined;
    sumber?.setData(data);
  }, [map, isLoaded, data]);

  // Warna tema berganti → cat diperbarui di tempat.
  useEffect(() => {
    if (!map || !isLoaded) return;
    if (!map.getLayer(LAPIS_PIN) || !map.getLayer(LAPIS_SOROT)) return;

    for (const [kunci, nilai] of Object.entries(catPin(warna))) {
      map.setPaintProperty(LAPIS_PIN, kunci as keyof CatLingkaran, nilai as never);
    }
    for (const [kunci, nilai] of Object.entries(catSorot(warna))) {
      map.setPaintProperty(
        LAPIS_SOROT,
        kunci as keyof CatLingkaran,
        nilai as never,
      );
    }
  }, [map, isLoaded, warna]);

  // Penyaringan: satu ekspresi, bukan delapan ribu titik yang dikirim ulang.
  useEffect(() => {
    if (!map || !isLoaded) return;
    if (!map.getLayer(LAPIS_PIN) || !map.getLayer(LAPIS_SOROT)) return;

    map.setFilter(LAPIS_PIN, (saring ?? null) as never);

    // Pin terpilih ikut tunduk pada saringan: menyorot titik yang sedang
    // disembunyikan akan menampilkan cincin yang mengelilingi ruang kosong.
    const sorot: unknown[] = ["==", ["get", "id"], dipilih ?? ""];
    map.setFilter(
      LAPIS_SOROT,
      (saring ? ["all", saring, sorot] : sorot) as never,
    );
  }, [map, isLoaded, saring, dipilih]);

  // Klik dan penunjuk.
  useEffect(() => {
    if (!map || !isLoaded) return;

    /*
     * Kartu detail dilempar ke sudut yang TIDAK sedang ditunjuk.
     *
     * Kartunya duduk di sisi kiri peta (sisi kanan sudah dipakai tombol zoom
     * dan pengaitan atribusi). Kalau pin yang baru diklik kebetulan ada di
     * kiri bawah, kartu yang selalu muncul di kiri bawah akan menutupi
     * persis titik yang sedang diperiksa — dan di peta sepadat ini itu
     * berarti menutupi seluruh gerombolan di sekitarnya.
     */
    const klikPin = (e: MapLibreGL.MapLayerMouseEvent) => {
      const fitur = e.features?.[0];
      if (!fitur) return;
      const diParuhKiri = e.point.x < map.getCanvas().clientWidth / 2;
      terbaru.current.onPilih(String(fitur.properties?.id ?? ""), {
        posisi: diParuhKiri ? "kanan-atas" : "kiri-bawah",
      });
    };

    // Klik di ruang kosong melepas pilihan. Tanpa ini satu-satunya cara
    // menutup kartu detail adalah menemukan tombol silangnya.
    const klikKosong = (e: MapLibreGL.MapMouseEvent) => {
      if (!map.getLayer(LAPIS_PIN)) return;
      const kena = map.queryRenderedFeatures(e.point, { layers: [LAPIS_PIN] });
      if (kena.length === 0) terbaru.current.onPilih(null);
    };

    const masuk = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const keluar = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", LAPIS_PIN, klikPin);
    map.on("click", klikKosong);
    map.on("mouseenter", LAPIS_PIN, masuk);
    map.on("mouseleave", LAPIS_PIN, keluar);

    return () => {
      map.off("click", LAPIS_PIN, klikPin);
      map.off("click", klikKosong);
      map.off("mouseenter", LAPIS_PIN, masuk);
      map.off("mouseleave", LAPIS_PIN, keluar);
      map.getCanvas().style.cursor = "";
    };
  }, [map, isLoaded]);

  return null;
}

// ── Lapisan batas zona (TAMBAHAN) ───────────────────────────────────────

type SifatZona = {
  id: string;
  nama: string;
  dipilih: boolean;
};

/**
 * Batas zona sebagai lapisan di ATAS basemap.
 *
 * Disisipkan dengan `beforeId` lapisan pin supaya pin tetap di atasnya: batas
 * wilayah adalah konteks, pin adalah isinya. Garisnya putus-putus — ini
 * pembagian administratif, bukan benda yang ada di lapangan.
 */
function LapisanBatas({
  batas,
  warna,
  zonaAktif,
}: {
  batas: BatasZona[];
  warna: WarnaPeta;
  zonaAktif: string | null;
}) {
  const { map, isLoaded } = useMap();

  const data = useMemo<FeatureCollection<Polygon, SifatZona>>(
    () => ({
      type: "FeatureCollection",
      features: batas.map((z) => ({
        type: "Feature",
        properties: { id: z.id, nama: z.nama, dipilih: z.id === zonaAktif },
        geometry: {
          type: "Polygon",
          // Cincin luar dibungkus satu lapis array lagi — itu bentuk Polygon.
          // Cincin GeoJSON wajib tertutup; API sudah mengirimnya tertutup.
          coordinates: [z.cincin],
        },
      })),
    }),
    [batas, zonaAktif],
  );

  useEffect(() => {
    if (!map || !isLoaded) return;

    /*
     * Isian DI BAWAH pin, garis DI ATASnya.
     *
     * Bukan selera: pin di sini tersebar sepadat permukiman sungguhan, dan
     * garis batas yang ditaruh di bawah delapan ribu lingkaran hanya terlihat
     * di sisi zona yang kebetulan kosong. Peta administratif memang menggambar
     * batas wilayah paling atas — itu garis yang harus bisa ditelusuri, bukan
     * latar. Isiannya tetap di bawah supaya warna statusnya tidak tercampur.
     *
     * `<LapisanPin>` sengaja ditulis LEBIH DULU di JSX supaya lapisannya
     * sudah ada saat baris ini mencarinya, termasuk sesudah gaya peta dimuat
     * ulang karena tema berganti.
     */
    const sebelumIsi = map.getLayer(LAPIS_PIN) ? LAPIS_PIN : undefined;
    const sebelumGaris = map.getLayer(LAPIS_SOROT) ? LAPIS_SOROT : undefined;

    map.addSource(SUMBER_ZONA, { type: "geojson", data });
    map.addLayer(
      {
        id: LAPIS_ZONA_ISI,
        type: "fill",
        source: SUMBER_ZONA,
        paint: {
          "fill-color": warna.merek,
          "fill-opacity": [
            "case",
            ["boolean", ["get", "dipilih"], false],
            0.16,
            0.05,
          ],
        },
      },
      sebelumIsi,
    );
    map.addLayer(
      {
        id: LAPIS_ZONA_GARIS,
        type: "line",
        source: SUMBER_ZONA,
        paint: {
          "line-color": warna.merek,
          "line-width": [
            "case",
            ["boolean", ["get", "dipilih"], false],
            2.8,
            1.8,
          ],
          // Putus-putus: ini pembagian administratif, bukan benda yang ada
          // di lapangan. Garis utuh di atas peta selalu dibaca sebagai pipa,
          // jalan, atau sungai.
          "line-dasharray": [3, 2],
          "line-opacity": 0.95,
        },
      },
      sebelumGaris,
    );

    return () => {
      try {
        if (map.getLayer(LAPIS_ZONA_GARIS)) map.removeLayer(LAPIS_ZONA_GARIS);
        if (map.getLayer(LAPIS_ZONA_ISI)) map.removeLayer(LAPIS_ZONA_ISI);
        if (map.getSource(SUMBER_ZONA)) map.removeSource(SUMBER_ZONA);
      } catch {
        // Gaya bisa sedang dimuat ulang.
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    const sumber = map.getSource(SUMBER_ZONA) as
      | MapLibreGL.GeoJSONSource
      | undefined;
    sumber?.setData(data);
  }, [map, isLoaded, data]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    if (!map.getLayer(LAPIS_ZONA_ISI) || !map.getLayer(LAPIS_ZONA_GARIS)) return;
    map.setPaintProperty(LAPIS_ZONA_ISI, "fill-color", warna.merek);
    map.setPaintProperty(LAPIS_ZONA_GARIS, "line-color", warna.merek);
  }, [map, isLoaded, warna]);

  return null;
}

// ── Gerak pandangan ─────────────────────────────────────────────────────

/**
 * Menggeser pandangan ke kotak yang diberikan.
 *
 * Dipasang sebagai anak `<Map>` supaya bisa memakai `useMap()`; `<Map>` baru
 * merender anaknya setelah instance peta ada, jadi tidak perlu menjaga ref
 * sendiri di luar.
 */
function SorotKotak({ kotak }: { kotak: Kotak | null }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !kotak) return;

    // Sisa ruang mengikuti ukuran kanvas. Nilai tetap yang nyaman di layar
    // lebar memakan sepertiga peta di ponsel.
    const kanvas = map.getCanvas();
    const sisa = Math.max(
      16,
      Math.min(
        56,
        Math.round(Math.min(kanvas.clientWidth, kanvas.clientHeight) * 0.08),
      ),
    );

    map.fitBounds(kotak, {
      padding: sisa,
      maxZoom: 13,
      duration: diam() ? 0 : 650,
    });
  }, [map, isLoaded, kotak]);

  return null;
}

/** Memusatkan peta ke satu meter — dipakai saat barisnya diklik di daftar teks. */
function PusatkanKe({ fokus }: { fokus: FokusPeta | null }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !fokus) return;
    map.easeTo({
      center: fokus.titik,
      zoom: Math.max(map.getZoom(), 14),
      duration: diam() ? 0 : 600,
    });
    // Hanya `nonce` yang menandai permintaan baru: memilih meter yang sama
    // dua kali dari daftar tetap harus mengembalikan pandangan ke sana.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded, fokus?.nonce]);

  return null;
}

// ── Komponen peta ───────────────────────────────────────────────────────

export interface PetaMeterProps {
  pin: PinMeter[];
  /** Status yang sedang ditampilkan. Kosong berarti tidak ada pin tergambar. */
  statusAktif: StatusMeter[];
  zonaAktif: string | null;
  /** Lapisan batas zona dinyalakan. Basemap TIDAK ikut berubah. */
  batasZona: boolean;
  batas: BatasZona[];
  dipilih: string | null;
  fokus: FokusPeta | null;
  onPilih: PilihPin;
}

export default function PetaMeter({
  pin,
  statusAktif,
  zonaAktif,
  batasZona,
  batas,
  dipilih,
  fokus,
  onPilih,
}: PetaMeterProps) {
  const warna = useWarnaPeta();

  /*
   * Zoom roda hanya di layar lebar.
   *
   * Di konsol, peta adalah alat utama dan petugas mengharapkan roda bekerja.
   * Di ponsel peta ini duduk di tengah halaman yang panjang, dan roda yang
   * menyandera gulir membuat halamannya tidak bisa dilewati. Dibaca sekali
   * saat pasang: MapLibre membaca opsi ini waktu peta dibuat.
   */
  const [rodaZoom] = useState(
    () =>
      typeof window === "undefined" ||
      window.matchMedia("(min-width: 1024px)").matches,
  );

  const data = useMemo<FeatureCollection<Point, SifatPin>>(
    () => ({
      type: "FeatureCollection",
      features: pin.map((p) => ({
        type: "Feature",
        properties: { id: p.id, status: p.status, zonaId: p.zonaId },
        geometry: { type: "Point", coordinates: p.koordinat },
      })),
    }),
    [pin],
  );

  /*
   * Saringan sebagai ekspresi, bukan sebagai data yang dibangun ulang.
   *
   * `null` saat seluruh status tampil dan tidak ada zona dipilih — MapLibre
   * melewati lapisan tanpa saringan lebih cepat daripada lapisan dengan
   * saringan yang selalu benar.
   */
  const saring = useMemo<unknown[] | null>(() => {
    const semuaStatus =
      statusAktif.length === Object.keys(STATUS_METER).length;
    const bagian: unknown[] = [];
    if (!semuaStatus) {
      bagian.push(["in", ["get", "status"], ["literal", statusAktif]]);
    }
    if (zonaAktif) {
      bagian.push(["==", ["get", "zonaId"], zonaAktif]);
    }
    if (bagian.length === 0) return null;
    if (bagian.length === 1) return bagian[0] as unknown[];
    return ["all", ...bagian];
  }, [statusAktif, zonaAktif]);

  /*
   * Kotak pandangan dihitung HANYA dari zona yang dipilih.
   *
   * Sengaja tidak ikut berubah saat status disaring: petugas yang sedang
   * mengamati satu sudut kota lalu mematikan satu status tidak boleh
   * dilempar ke pandangan lain. Memilih zona memang perpindahan tempat;
   * menyaring status tidak.
   */
  const kotak = useMemo(() => {
    const sasaran = zonaAktif ? pin.filter((p) => p.zonaId === zonaAktif) : pin;
    return kotakTitik(sasaran.map((p) => p.koordinat));
  }, [pin, zonaAktif]);

  return (
    <Map
      center={PUSAT}
      zoom={ZOOM_AWAL}
      minZoom={7}
      styles={GAYA}
      scrollZoom={rodaZoom}
      // Peta data tidak perlu diputar atau dimiringkan; keduanya hanya
      // membuat arah utara hilang tanpa menambah apa pun yang bisa dibaca.
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
    >
      {/* Kiri atas, bukan kanan atas: sudut kanan atas disediakan untuk
          kartu detail, dan sudut kanan bawah sudah dipakai atribusi. */}
      <MapControls position="top-left" />
      <SorotKotak kotak={kotak} />
      <PusatkanKe fokus={fokus} />
      {/* Pin LEBIH DULU: `<LapisanBatas>` menyisipkan dirinya relatif
          terhadap lapisan pin, jadi lapisan itu harus sudah ada saat
          effect-nya berjalan — termasuk setelah gaya dimuat ulang. */}
      {warna ? (
        <LapisanPin
          data={data}
          warna={warna}
          saring={saring}
          dipilih={dipilih}
          onPilih={onPilih}
        />
      ) : null}
      {warna && batasZona && batas.length > 0 ? (
        <LapisanBatas batas={batas} warna={warna} zonaAktif={zonaAktif} />
      ) : null}
    </Map>
  );
}
