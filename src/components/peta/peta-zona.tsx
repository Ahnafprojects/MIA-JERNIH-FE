"use client";

/**
 * Peta zona layanan — lapisan di ATAS daftar zona, bukan penggantinya.
 *
 * Dimuat lewat `peta-zona-dinamis.tsx` (`next/dynamic`, `ssr: false`) supaya
 * MapLibre tidak ikut ke paket awal halaman dan tidak pernah dijalankan di
 * server. Jangan meng-import berkas ini langsung dari halaman.
 */

import { useEffect, useMemo } from "react";
import type { FeatureCollection, Polygon } from "geojson";
import { Map, MapControls, MapGeoJSON, useMap } from "@/components/ui/map";
import type { StatusZona, Titik, ZonaStatus } from "@/types/publik";
import { STATUS, URUTAN_STATUS } from "./status-zona";
import { useWarnaStatus } from "./token-warna";
import "./peta.css";

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
const PUSAT: Titik = [107.74, -6.87];
const ZOOM_AWAL = 9;

/** Alias tipe, bukan `interface`: `MapGeoJSON` menuntut tipe dengan index signature. */
type SifatZona = {
  id: string;
  nama: string;
  status: StatusZona;
  /** Warna jadi (bukan `var()`) — WebGL tidak bisa membaca token CSS. */
  warna: string;
  dipilih: boolean;
};

type Kotak = [[number, number], [number, number]];

function kotakBatas(cincin: Titik[][]): Kotak | null {
  let bBarat = Infinity;
  let bTimur = -Infinity;
  let lSelatan = Infinity;
  let lUtara = -Infinity;

  for (const titik of cincin) {
    for (const [bujur, lintang] of titik) {
      if (bujur < bBarat) bBarat = bujur;
      if (bujur > bTimur) bTimur = bujur;
      if (lintang < lSelatan) lSelatan = lintang;
      if (lintang > lUtara) lUtara = lintang;
    }
  }

  if (!Number.isFinite(bBarat) || !Number.isFinite(lSelatan)) return null;
  return [
    [bBarat, lSelatan],
    [bTimur, lUtara],
  ];
}

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

    // Pengguna yang mematikan animasi sistem tidak boleh dilempar melintasi
    // peta; untuk mereka perpindahannya langsung.
    const diam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Sisa ruang mengikuti ukuran kanvas. Nilai tetap yang nyaman di layar
    // lebar memakan sepertiga peta di ponsel, dan zonanya menyusut jadi
    // noktah.
    const kanvas = map.getCanvas();
    const sisa = Math.max(
      14,
      Math.min(
        44,
        Math.round(Math.min(kanvas.clientWidth, kanvas.clientHeight) * 0.08),
      ),
    );

    map.fitBounds(kotak, {
      padding: sisa,
      maxZoom: 11,
      duration: diam ? 0 : 650,
    });
  }, [map, isLoaded, kotak]);

  return null;
}

export interface PetaZonaProps {
  zona: ZonaStatus[];
  dipilih: string | null;
  onPilih: (id: string) => void;
}

export default function PetaZona({ zona, dipilih, onPilih }: PetaZonaProps) {
  const warna = useWarnaStatus();

  // Zona tanpa batas wilayah tetap muncul di daftar teks, hanya tidak
  // digambar. Backend yang belum mengirim GeoJSON bukan alasan halaman kosong.
  const berbatas = useMemo(
    () => zona.filter((z) => z.batas !== null && z.batas.length >= 4),
    [zona],
  );

  const data = useMemo<FeatureCollection<Polygon, SifatZona> | null>(() => {
    if (!warna || berbatas.length === 0) return null;
    return {
      type: "FeatureCollection",
      features: berbatas.map((z) => ({
        type: "Feature",
        properties: {
          id: z.id,
          nama: z.nama,
          status: z.status,
          warna: warna[z.status],
          dipilih: z.id === dipilih,
        },
        geometry: {
          type: "Polygon",
          // Cincin luar dibungkus satu lapis array lagi — itu bentuk Polygon.
          coordinates: [cincinZona(z)],
        },
      })),
    };
  }, [berbatas, warna, dipilih]);

  const kotak = useMemo(() => {
    const sasaran = dipilih
      ? berbatas.filter((z) => z.id === dipilih)
      : berbatas;
    const cincin = (sasaran.length > 0 ? sasaran : berbatas).map(cincinZona);
    return kotakBatas(cincin);
  }, [berbatas, dipilih]);

  return (
    <div className="flex flex-col">
      {/* Tinggi WAJIB ditentukan di pembungkus: <Map> mengisi induknya, dan
          induk tanpa tinggi menghasilkan kanvas setinggi nol — peta "hilang"
          padahal sudah jalan. */}
      <div className="relative h-[280px] w-full sm:h-[360px] lg:h-[440px]">
        <Map
          center={PUSAT}
          zoom={ZOOM_AWAL}
          styles={GAYA}
          // Peta bukan satu-satunya jalan ke data ini, jadi ia tidak boleh
          // menyandera gulir halaman di ponsel. Zoom tetap bisa lewat tombol
          // dan cubit dua jari.
          scrollZoom={false}
        >
          <MapControls position="top-right" />
          <SorotKotak kotak={kotak} />
          {data ? (
            <MapGeoJSON<SifatZona>
              data={data}
              promoteId="id"
              interactive
              fillPaint={{
                "fill-color": ["get", "warna"],
                "fill-opacity": [
                  "case",
                  ["boolean", ["get", "dipilih"], false],
                  0.62,
                  0.3,
                ],
              }}
              fillHoverPaint={{ "fill-opacity": 0.5 }}
              linePaint={{
                "line-color": ["get", "warna"],
                "line-width": [
                  "case",
                  ["boolean", ["get", "dipilih"], false],
                  3,
                  1.4,
                ],
              }}
              onClick={(e) => onPilih(e.feature.properties.id)}
            />
          ) : null}
        </Map>
      </div>

      <LegendaPeta />
    </div>
  );
}

/** Cincin sudah dijamin ada oleh saringan `berbatas`. */
function cincinZona(z: ZonaStatus): Titik[] {
  return z.batas ?? [];
}

/**
 * Legenda.
 *
 * Setiap warna didampingi KATA dan satu kalimat artinya. Legenda yang hanya
 * memasang kotak warna memindahkan pekerjaan menebak ke pembacanya, dan tidak
 * sampai sama sekali ke pembaca layar.
 */
function LegendaPeta() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-4 py-3 sm:px-5">
      {URUTAN_STATUS.map((s) => (
        <li key={s} className="flex items-center gap-2 text-[12.5px]">
          <span
            aria-hidden
            className={`size-2.5 shrink-0 rounded-[3px] ${STATUS[s].titik}`}
          />
          <span className="font-semibold">{STATUS[s].label}</span>
          <span className="text-muted">— {STATUS[s].arti}</span>
        </li>
      ))}
    </ul>
  );
}
