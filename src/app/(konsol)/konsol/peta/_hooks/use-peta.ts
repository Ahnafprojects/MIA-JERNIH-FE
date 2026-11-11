"use client";

import { useCallback, useMemo, useState } from "react";
import useApi from "@/lib/use-api";
import type { StatusLayanan } from "@/types/publik";
import type { FokusPeta, PilihPin, PosisiKartu } from "../_bagian/peta-meter";
import { urutkanPin } from "../_bagian/daftar-meter";
import type { RingkasZona } from "../_bagian/daftar-zona";
import { URUTAN_METER } from "../_bagian/status-meter";
import type { BatasZona, PetaKonsol, PinMeter, StatusMeter } from "../_bagian/tipe";

const SEMUA_STATUS: StatusMeter[] = URUTAN_METER;

/**
 * Semua state, turunan, dan penangan halaman peta.
 *
 * Peta, takaran status, dan daftar teks membaca array `pin` yang SAMA lalu
 * menyaringnya dengan predikat yang sama. Tidak ada satu pun angka yang
 * dihitung dengan rumus kedua; `jumlahStatus` dari API sengaja tidak dipakai.
 */
export function usePeta() {
  const { data, memuat, menyegarkan, galat, muatUlang } =
    useApi<PetaKonsol>("/api/admin/peta");

  const [statusAktif, setStatusAktif] = useState<StatusMeter[]>(SEMUA_STATUS);
  const [zonaAktif, setZonaAktif] = useState<string | null>(null);
  const [batasZona, setBatasZona] = useState(false);
  const [dipilih, setDipilih] = useState<string | null>(null);
  const [fokus, setFokus] = useState<FokusPeta | null>(null);
  const [posisiKartu, setPosisiKartu] = useState<PosisiKartu>("kiri-bawah");
  const [halaman, setHalaman] = useState(1);

  /*
   * Batas wilayah diambil hanya saat lapisannya dinyalakan.
   *
   * Jalur `null` membuat `useApi` tidak mengambil apa pun, dan isi yang
   * sudah pernah tiba tetap disimpan — mematikan lalu menyalakan kembali
   * kotak centangnya tidak memicu permintaan kedua.
   *
   * Sumbernya endpoint publik: poligon zona memang data terbuka yang sama,
   * dan menyalinnya ke konsol berarti dua daftar koordinat yang harus
   * dijaga tetap sama. Kalau gagal, hanya lapisan ini yang hilang; peta,
   * pin, dan seluruh angka di halaman tetap utuh.
   */
  const batasApi = useApi<StatusLayanan>(
    batasZona ? "/api/publik/status-layanan" : null,
  );

  const pin = useMemo(() => data?.pin ?? [], [data]);

  /** Jumlah per status — dari array yang sama dengan yang digambar peta. */
  const jumlah = useMemo(() => {
    const h: Record<StatusMeter, number> = {
      normal: 0,
      alarm: 0,
      insiden: 0,
      offline: 0,
    };
    for (const p of pin) h[p.status] += 1;
    return h;
  }, [pin]);

  const zonaRingkas = useMemo<RingkasZona[]>(() => {
    const daftar = data?.zona ?? [];
    const kosong = (): Record<StatusMeter, number> => ({
      normal: 0,
      alarm: 0,
      insiden: 0,
      offline: 0,
    });
    const per = new Map(daftar.map((z) => [z.id, kosong()]));
    const total = new Map(daftar.map((z) => [z.id, 0]));
    for (const p of pin) {
      const isi = per.get(p.zonaId);
      if (!isi) continue;
      isi[p.status] += 1;
      total.set(p.zonaId, (total.get(p.zonaId) ?? 0) + 1);
    }
    return daftar.map((z) => ({
      id: z.id,
      nama: z.nama,
      meter: total.get(z.id) ?? 0,
      per: per.get(z.id) ?? kosong(),
    }));
  }, [data, pin]);

  const batas = useMemo<BatasZona[]>(() => {
    const zona = batasApi.data?.zona ?? [];
    return zona
      .filter((z) => z.batas !== null && z.batas.length >= 4)
      .map((z) => ({ id: z.id, nama: z.nama, cincin: z.batas ?? [] }));
  }, [batasApi.data]);

  /** Predikat tunggal. Peta menerjemahkannya jadi ekspresi MapLibre. */
  const pinSaring = useMemo(
    () =>
      pin.filter(
        (p) =>
          statusAktif.includes(p.status) &&
          (zonaAktif === null || p.zonaId === zonaAktif),
      ),
    [pin, statusAktif, zonaAktif],
  );

  const pinUrut = useMemo(() => urutkanPin(pinSaring), [pinSaring]);

  const pinDipilih = useMemo(
    () => pin.find((p) => p.id === dipilih) ?? null,
    [pin, dipilih],
  );

  const disaring = statusAktif.length < SEMUA_STATUS.length || zonaAktif !== null;

  /*
   * Nomor halaman dikembalikan ke 1 DI DALAM penangan, bukan lewat effect
   * yang mengamati saringan. Keduanya terlihat sama di layar, tapi effect
   * berarti memanggil setState sebagai reaksi terhadap render: satu render
   * tambahan tiap penyaringan, dan tabel sempat tergambar pada halaman yang
   * sudah tidak ada.
   */
  const ubahStatus = useCallback((s: StatusMeter) => {
    setHalaman(1);
    setStatusAktif((lama) =>
      lama.includes(s) ? lama.filter((x) => x !== s) : [...lama, s],
    );
  }, []);

  const semuaStatus = useCallback(() => {
    setHalaman(1);
    setStatusAktif(SEMUA_STATUS);
  }, []);

  const pilihZona = useCallback((id: string | null) => {
    setHalaman(1);
    setZonaAktif(id);
  }, []);

  const lepasSaring = useCallback(() => {
    setHalaman(1);
    setStatusAktif(SEMUA_STATUS);
    setZonaAktif(null);
  }, []);

  // Dipilih dari peta: pandangan JANGAN digeser — titiknya sudah di bawah
  // kursor, dan memindahkan peta saat diklik membuat klik berikutnya meleset.
  // Yang berpindah justru kartunya, ke sudut yang tidak sedang ditunjuk.
  const pilihDariPeta = useCallback<PilihPin>((id, opsi) => {
    setDipilih(id);
    if (opsi) setPosisiKartu(opsi.posisi);
  }, []);

  // Dipilih dari daftar: pandangan harus menyusul, kalau tidak kartunya
  // terbuka untuk titik yang tidak terlihat di mana pun.
  const pilihDariDaftar = useCallback((p: PinMeter) => {
    setDipilih(p.id);
    // Pin dibawa ke tengah peta, jadi sudut kiri bawah pasti bebas.
    setPosisiKartu("kiri-bawah");
    setFokus((lama) => ({ titik: p.koordinat, nonce: (lama?.nonce ?? 0) + 1 }));
  }, []);

  const tutupKartu = useCallback(() => setDipilih(null), []);

  return {
    data,
    memuat,
    menyegarkan,
    galat,
    muatUlang,
    pin,
    jumlah,
    zonaRingkas,
    batas,
    batasApiGalat: batasApi.galat,
    pinSaring,
    pinUrut,
    pinDipilih,
    disaring,
    statusAktif,
    zonaAktif,
    batasZona,
    setBatasZona,
    dipilih,
    fokus,
    posisiKartu,
    halaman,
    setHalaman,
    ubahStatus,
    semuaStatus,
    pilihZona,
    lepasSaring,
    pilihDariPeta,
    pilihDariDaftar,
    tutupKartu,
  };
}
