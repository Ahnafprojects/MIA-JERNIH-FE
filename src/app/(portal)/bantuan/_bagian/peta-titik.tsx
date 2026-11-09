"use client";

/**
 * Peta penanda titik gangguan — peta sungguhan, bukan gambar peta.
 *
 * Dimuat lewat `peta-titik-dinamis.tsx` (`next/dynamic`, `ssr: false`) supaya
 * MapLibre tidak ikut ke paket awal halaman dan tidak pernah dijalankan di
 * server. Jangan meng-import berkas ini langsung dari halaman.
 *
 * ── Apa yang digantikan ────────────────────────────────────────────────
 *
 * Sebelumnya di tempat ini ada kotak abu-abu berisi ikon pin yang memantul
 * dan kalimat "Lokasi Terdeteksi di Sekitar Meter Anda". Tidak ada yang
 * terdeteksi: koordinatnya ditulis mati di berkas halaman dan dikirim apa
 * adanya ke server untuk SETIAP laporan, dari warga mana pun. Petugas yang
 * membuka tiket mendapat satu titik yang sama berulang kali — lebih buruk
 * daripada tidak ada koordinat sama sekali, karena koordinat yang salah
 * tetap terbaca sebagai koordinat.
 *
 * ── Kenapa pinnya bisa digeser ─────────────────────────────────────────
 *
 * Gangguan air jarang berada tepat di meter. Pipa bocor di ujung gang, keran
 * mati di rumah tetangga, genangan di tepi jalan — semuanya puluhan sampai
 * ratusan meter dari titik meter terdaftar. Pin yang dikunci di satu tempat
 * memaksa warga menjelaskan lokasinya lagi dengan kata-kata di kolom
 * deskripsi, dan petugas tetap harus menebak.
 *
 * Karena pinnya digeser warga sendiri, `lat`/`lng` yang dikirim ke
 * `POST /api/tiket` akhirnya menjadi data masukan, bukan hiasan.
 *
 * ── Kenapa komponen ini HANYA petanya ──────────────────────────────────
 *
 * Tombol "Gunakan lokasi saya" dan angka koordinatnya sengaja tinggal di
 * halaman, di luar berkas ini. Peta adalah satu-satunya bagian yang bisa
 * gagal sendiri — WebGL dimatikan, GPU masuk daftar blokir — dan kalau
 * kendali koordinatnya ikut di dalam sini, kegagalan itu membuat warga tidak
 * punya cara apa pun menandai lokasi. Dipisah begini, peta yang mati hanya
 * kehilangan cara MENGGESER; menekan tombol lokasi tetap bekerja.
 */

import { useEffect } from "react";
import { MapPin } from "lucide-react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  useMap,
} from "@/components/ui/map";
// Gaya atribusi dan cincin fokus MapLibre. Dipakai bersama peta zona dan peta
// konsol supaya ketiga peta di produk ini tidak pernah berbeda penampilannya.
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

const ZOOM_AWAL = 15;

export interface Titik {
  lat: number;
  lng: number;
}

export interface PetaTitikProps {
  titik: Titik;
  onUbah: (titik: Titik) => void;
  /**
   * Dinaikkan halaman ketika titiknya berubah dari LUAR peta — yaitu saat
   * tombol "Gunakan lokasi saya" ditekan. Nilainya sendiri tidak berarti
   * apa-apa; yang berarti adalah perubahannya, supaya permintaan yang sama
   * bisa diulang.
   */
  nonce?: number;
  /** Dimatikan selama laporan dikirim, supaya koordinatnya tidak berubah. */
  nonaktif?: boolean;
}

/**
 * Memusatkan peta ketika titiknya berpindah dari luar peta.
 *
 * Hanya untuk perpindahan dari luar: menggeser pin dengan tangan sudah
 * memindahkan pinnya sendiri, dan memusatkan ulang di tengah seretan membuat
 * peta berebut kendali dengan jari yang sedang menyeret.
 */
function PusatkanKe({ titik, nonce }: { titik: Titik; nonce: number }) {
  const { map } = useMap();

  useEffect(() => {
    if (!map || nonce === 0) return;
    const diam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.easeTo({
      center: [titik.lng, titik.lat],
      zoom: Math.max(map.getZoom(), ZOOM_AWAL),
      duration: diam ? 0 : 600,
    });
    // `nonce` sengaja ikut sebagai kebergantungan: permintaan yang sama boleh
    // diulang, dan tanpa ini penekanan kedua tidak menghasilkan apa-apa.
  }, [map, titik.lat, titik.lng, nonce]);

  return null;
}

export default function PetaTitik({
  titik,
  onUbah,
  nonce = 0,
  nonaktif,
}: PetaTitikProps) {
  return (
    <div className="relative h-64 overflow-hidden rounded-card border border-line shadow-[var(--cekung-dalam)] sm:h-72">
      <Map
        center={[titik.lng, titik.lat]}
        zoom={ZOOM_AWAL}
        minZoom={9}
        styles={GAYA}
        // Peta penanda titik tidak perlu diputar atau dimiringkan; keduanya
        // hanya membuat arah utara hilang tanpa menambah apa pun yang bisa
        // dibaca saat menentukan satu titik.
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        className="size-full"
      >
        <MapControls position="top-left" />
        <PusatkanKe titik={titik} nonce={nonce} />

        <MapMarker
          longitude={titik.lng}
          latitude={titik.lat}
          draggable={!nonaktif}
          anchor="bottom"
          onDragEnd={(lngLat) => onUbah({ lat: lngLat.lat, lng: lngLat.lng })}
        >
          <MarkerContent>
            {/*
              Pin digambar sendiri, bukan memakai penanda bawaan MapLibre:
              warnanya harus token produk ini supaya ikut berganti di tema
              gelap, dan bentuknya harus memberi tahu bahwa benda ini BISA
              DISERET — karena itu kursornya `grab` dan ada bayangan jatuh di
              bawahnya yang memisahkannya dari permukaan peta.
            */}
            <span
              className={
                nonaktif
                  ? "block cursor-default"
                  : "block cursor-grab active:cursor-grabbing"
              }
            >
              <MapPin
                size={32}
                strokeWidth={2.5}
                className="fill-danger text-white drop-shadow-[0_2px_3px_hsl(var(--bayang-nada)/0.45)]"
              />
            </span>
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  );
}
