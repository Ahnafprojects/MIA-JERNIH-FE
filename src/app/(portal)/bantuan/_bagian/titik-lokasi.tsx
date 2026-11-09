"use client";

import { Crosshair, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PetaTitikDinamis } from "./peta-titik-dinamis";
import type { SumberLokasi } from "../_tipe";

/**
 * Penentu titik lokasi gangguan.
 *
 * ── Apa yang digantikan ───────────────────────────────────────────────
 *
 * Sebelumnya di sini ada kotak abu berisi ikon pin memantul dengan tulisan
 * "Lokasi Terdeteksi di Sekitar Meter Anda" dan "Koordinat tersemat otomatis
 * berdasarkan zona meter air terdaftar". Keduanya tidak benar: koordinatnya
 * konstanta yang ditulis mati di hook halaman ini, nilainya sama persis untuk
 * setiap laporan dari warga mana pun, dan tidak pernah dibaca dari meter.
 *
 * Itu lebih buruk daripada tidak menampilkan apa-apa. Kotak yang menyatakan
 * "terdeteksi" membuat warga berhenti memeriksa, lalu petugas menerima satu
 * titik yang sama berulang kali — dan koordinat yang salah tetap terbaca
 * sebagai koordinat.
 *
 * ── Tiga sumber, tiga tingkat keyakinan ───────────────────────────────
 *
 * Urutannya dari yang paling kuat buktinya: GPS perangkat, pin yang digeser
 * warga, lalu koordinat meter terdaftar sebagai cadangan. Sumbernya
 * DITAMPILKAN, bukan disembunyikan, karena warga adalah satu-satunya pihak
 * yang tahu apakah titik itu benar — dan karena cadangan yang menyamar
 * sebagai pengukuran persis kesalahan yang dibuat versi sebelumnya.
 */

const LABEL_SUMBER: Record<SumberLokasi, string> = {
  GPS_PERANGKAT: "GPS perangkat Anda",
  DIPILIH_MANUAL: "Titik yang Anda tentukan",
  METER_TERDAFTAR: "Perkiraan dari meter terdaftar",
  TIDAK_ADA: "Belum ditentukan",
};

export function TitikLokasi({
  titikKoordinat,
  sumberLokasi,
  nonceLokasi,
  memuatGps,
  galatGps,
  gagalAmbilLokasiAwal,
  nonaktif,
  onUbahTitik,
  onPakaiGps,
}: {
  titikKoordinat: { lat: number; lng: number } | null;
  sumberLokasi: SumberLokasi;
  nonceLokasi: number;
  memuatGps: boolean;
  galatGps: string | null;
  gagalAmbilLokasiAwal?: boolean;
  nonaktif?: boolean;
  onUbahTitik: (t: { lat: number; lng: number }) => void;
  onPakaiGps: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-ink">Titik Lokasi Gangguan</label>
        <span className="tabular font-mono text-[10px] text-muted">
          {titikKoordinat
            ? `Lat ${titikKoordinat.lat.toFixed(5)}, Lng ${titikKoordinat.lng.toFixed(5)}`
            : "Koordinat belum ada"}
        </span>
      </div>

      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        Geser pin ke titik gangguan yang sebenarnya. Pipa bocor sering berada
        puluhan meter dari meter Anda, dan titik yang tepat menentukan berapa
        lama petugas mencari.
      </p>

      <div className="mt-2">
        {titikKoordinat ? (
          <PetaTitikDinamis
            titik={titikKoordinat}
            onUbah={onUbahTitik}
            nonce={nonceLokasi}
            nonaktif={nonaktif}
          />
        ) : (
          /*
           * Tanpa koordinat awal, petanya tidak digambar sama sekali. Peta
           * yang dipusatkan di titik karangan akan membuat warga menggeser
           * pin dari tempat yang salah, dan hasilnya terbaca seperti lokasi
           * yang dipilih sadar padahal tidak.
           */
          <div className="cekung grid h-64 place-items-center p-4 text-center sm:h-72">
            <div>
              <MapPin size={22} className="mx-auto text-muted" aria-hidden />
              <p className="mt-2 text-[13px] text-ink">
                {gagalAmbilLokasiAwal
                  ? "Titik awal dari meter Anda belum bisa diambil."
                  : "Meter Anda belum memiliki koordinat terdaftar."}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Tekan Gunakan lokasi saya untuk menandai titik gangguan, atau
                jelaskan lokasinya pada kolom deskripsi.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted">
          Sumber koordinat:{" "}
          <span className="font-semibold text-ink">{LABEL_SUMBER[sumberLokasi]}</span>
        </p>

        <Button
          type="button"
          varian="sekunder"
          ukuran="sm"
          onClick={onPakaiGps}
          disabled={memuatGps || nonaktif}
        >
          {memuatGps ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <Crosshair size={14} aria-hidden />
          )}
          {memuatGps ? "Mencari lokasi" : "Gunakan lokasi saya"}
        </Button>
      </div>

      {galatGps ? (
        <p className="mt-2 text-[11px] text-warn">{galatGps}</p>
      ) : null}
    </div>
  );
}
