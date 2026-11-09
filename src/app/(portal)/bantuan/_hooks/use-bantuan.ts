"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { KATEGORI_GANGGUAN } from "../_bagian/pilih-kategori";
import type {
  SumberLokasi,
  TabAktif,
  TiketBerhasil,
  TiketItem,
  ValidasiLaporan,
} from "../_tipe";

interface Titik {
  lat: number;
  lng: number;
}

/** Batas tunggu GPS. Lebih lama dari ini, warga menyangka tombolnya rusak. */
const BATAS_GPS_MS = 12_000;

export function useBantuan() {
  const { meterAktif } = useAuth();

  const [tabAktif, setTabAktif] = useState<TabAktif>("lapor");

  const [kategori, setKategori] = useState(KATEGORI_GANGGUAN[0].id);
  const [deskripsi, setDeskripsi] = useState("");
  const [lampirkanSensor, setLampirkanSensor] = useState(true);
  const [daftarFoto, setDaftarFoto] = useState<string[]>([]);

  /*
   * Koordinat laporan.
   *
   * Sebelumnya dua baris konstanta yang ditulis mati di sini — titik pusat
   * Bandung — dan dikirim apa adanya ke server untuk SETIAP laporan dari
   * warga mana pun, sementara antarmukanya menulis "Lokasi Terdeteksi di
   * Sekitar Meter Anda". Tidak ada yang pernah dideteksi.
   *
   * Nilai awalnya sekarang `null`, bukan koordinat cadangan: sebelum
   * `/api/tiket/lokasi-awal` menjawab, yang benar adalah "belum tahu".
   * Mengisinya dengan tebakan membuat peta terpusat di tempat yang salah dan
   * warga menggeser pin dari titik awal yang keliru.
   */
  const [titikKoordinat, setTitikKoordinat] = useState<Titik | null>(null);
  const [sumberLokasi, setSumberLokasi] = useState<SumberLokasi>("TIDAK_ADA");
  /* Dinaikkan hanya saat titiknya berubah dari LUAR peta, supaya peta
     memusatkan ulang. Menggeser pin dengan tangan tidak menaikkannya. */
  const [nonceLokasi, setNonceLokasi] = useState(0);
  const [memuatGps, setMemuatGps] = useState(false);
  const [galatGps, setGalatGps] = useState<string | null>(null);
  /*
   * Dibedakan dari "meter memang belum berkoordinat".
   *
   * Keduanya sama-sama berakhir tanpa titik awal, tetapi artinya berlawanan:
   * yang satu berarti datanya tidak ada, yang satu lagi berarti kami tidak
   * berhasil menanyakannya. Kalau digabung, warga yang jaringannya sedang
   * putus diberi tahu meternya tidak terdaftar — keliru, dan membuatnya
   * mengurus hal yang salah.
   */
  const [gagalAmbilLokasiAwal, setGagalAmbilLokasiAwal] = useState(false);

  const [validasiTerakhir, setValidasiTerakhir] =
    useState<ValidasiLaporan | null>(null);

  const [memuatKirim, setMemuatKirim] = useState(false);
  const [pesanGalat, setPesanGalat] = useState<string | null>(null);

  const [tiketBerhasil, setTiketBerhasil] = useState<TiketBerhasil | null>(null);
  const [sudahSalin, setSudahSalin] = useState(false);

  const [daftarTiketSaya, setDaftarTiketSaya] = useState<TiketItem[]>([]);
  const [memuatTiket, setMemuatTiket] = useState(false);

  useEffect(() => {
    let aktif = true;
    (async () => {
      setMemuatTiket(true);
      try {
        const res = await api<{ tiket: TiketItem[] }>("/api/tiket");
        if (aktif) setDaftarTiketSaya(res.tiket || []);
      } catch {
        if (aktif) setDaftarTiketSaya([]);
      } finally {
        if (aktif) setMemuatTiket(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  /*
   * Titik awal diambil dari meter terdaftar, bukan dikarang.
   *
   * Server yang menentukan, karena server yang memegang `meter.lat/lng`.
   * Kalau meternya memang belum berkoordinat, jawabannya `null` dan petanya
   * tidak digambar — bukan digambar di titik tebakan.
   */
  useEffect(() => {
    let aktif = true;
    (async () => {
      try {
        const res = await api<{
          lat: number | null;
          lng: number | null;
        }>("/api/tiket/lokasi-awal");
        if (!aktif) return;
        if (res.lat != null && res.lng != null) {
          setTitikKoordinat({ lat: res.lat, lng: res.lng });
          setSumberLokasi("METER_TERDAFTAR");
        }
      } catch {
        // Gagal mengambil titik awal bukan alasan menghalangi laporan: warga
        // masih bisa memakai tombol GPS atau menjelaskan lokasinya. Yang
        // dicatat di sini hanya SEBABNYA, supaya pesan di layar tidak
        // menyalahkan data meter untuk kegagalan jaringan.
        if (aktif) setGagalAmbilLokasiAwal(true);
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  const handleUbahTitik = useCallback((t: Titik) => {
    setTitikKoordinat(t);
    // Begitu pinnya digeser, sumbernya naik dari cadangan menjadi pilihan
    // sadar. Server memverifikasi ulang klaim ini terhadap koordinat meter.
    setSumberLokasi("DIPILIH_MANUAL");
    setGalatGps(null);
  }, []);

  const handlePakaiGps = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGalatGps("Peramban ini tidak menyediakan akses lokasi. Geser pin di peta untuk menandai titiknya.");
      return;
    }

    setMemuatGps(true);
    setGalatGps(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTitikKoordinat({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSumberLokasi("GPS_PERANGKAT");
        setNonceLokasi((n) => n + 1);
        setMemuatGps(false);
      },
      (err) => {
        setMemuatGps(false);
        /*
         * Pesannya dibedakan per sebab, dan tiap pesan menyebut APA yang bisa
         * dilakukan warga. "Gagal mengambil lokasi" membuat orang menekan
         * tombol yang sama berulang kali tanpa tahu izinnya yang ditolak.
         */
        if (err.code === err.PERMISSION_DENIED) {
          setGalatGps("Izin lokasi ditolak. Geser pin di peta untuk menandai titiknya, atau aktifkan izin lokasi di pengaturan peramban.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGalatGps("Lokasi tidak terbaca di tempat ini, biasanya karena sinyal GPS terhalang. Geser pin di peta untuk menandai titiknya.");
        } else {
          setGalatGps("Pencarian lokasi melebihi batas waktu. Coba lagi, atau geser pin di peta.");
        }
      },
      { enableHighAccuracy: true, timeout: BATAS_GPS_MS, maximumAge: 0 },
    );
  }, []);

  const ambilTiketSaya = async () => {
    try {
      const res = await api<{ tiket: TiketItem[] }>("/api/tiket");
      setDaftarTiketSaya(res.tiket || []);
    } catch {
      // Abaikan
    }
  };

  const handleUnggahFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (daftarFoto.length + files.length > 3) {
      setPesanGalat("Maksimal 3 foto pendukung yang dapat diunggah.");
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setPesanGalat(`Foto ${file.name} melebihi ukuran maksimal 5 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setDaftarFoto((prev) => [...prev, reader.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleHapusFoto = (indeks: number) => {
    setDaftarFoto((prev) => prev.filter((_, i) => i !== indeks));
  };

  const handleKirimLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deskripsi.trim().length < 5) {
      setPesanGalat("Deskripsi pengaduan minimal 5 karakter.");
      return;
    }

    setPesanGalat(null);
    setMemuatKirim(true);

    try {
      const res = await api<{
        ok: boolean;
        tiket: { nomor: string; slaJatuhTempo: string };
        validasi?: ValidasiLaporan;
      }>("/api/tiket", {
        method: "POST",
        body: JSON.stringify({
          kategori,
          deskripsi: deskripsi.trim(),
          foto: daftarFoto,
          // Dikirim hanya bila benar-benar ada. Mengirim koordinat cadangan
          // dari klien membuat server tidak bisa membedakan titik yang
          // dipilih sadar dari titik yang tidak pernah ditentukan.
          lat: titikKoordinat?.lat,
          lng: titikKoordinat?.lng,
          sumberLokasi,
          meterId: meterAktif?.id,
        }),
      });

      setTiketBerhasil({
        nomor: res.tiket.nomor,
        sla: res.tiket.slaJatuhTempo,
        validasi: res.validasi ?? null,
      });
      setValidasiTerakhir(res.validasi ?? null);

      // Reset form. Titik lokasinya SENGAJA tidak direset: warga yang
      // melaporkan dua gangguan berurutan hampir selalu berada di tempat yang
      // sama, dan mengembalikannya ke cadangan membuang kerja yang sudah
      // dilakukan.
      setDeskripsi("");
      setDaftarFoto([]);
      ambilTiketSaya();
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanGalat(err.message);
      } else {
        setPesanGalat("Gagal mengirimkan laporan gangguan. Coba lagi beberapa saat.");
      }
    } finally {
      setMemuatKirim(false);
    }
  };

  const handleSalinNomorTiket = () => {
    if (!tiketBerhasil) return;
    navigator.clipboard.writeText(tiketBerhasil.nomor);
    setSudahSalin(true);
    setTimeout(() => setSudahSalin(false), 2000);
  };

  return {
    meterAktif,
    tabAktif,
    setTabAktif,
    kategori,
    setKategori,
    deskripsi,
    setDeskripsi,
    lampirkanSensor,
    setLampirkanSensor,
    daftarFoto,
    titikKoordinat,
    sumberLokasi,
    nonceLokasi,
    memuatGps,
    galatGps,
    gagalAmbilLokasiAwal,
    validasiTerakhir,
    memuatKirim,
    pesanGalat,
    tiketBerhasil,
    setTiketBerhasil,
    sudahSalin,
    daftarTiketSaya,
    memuatTiket,
    handleUnggahFoto,
    handleHapusFoto,
    handleUbahTitik,
    handlePakaiGps,
    handleKirimLaporan,
    handleSalinNomorTiket,
  };
}
