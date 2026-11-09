"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { liter } from "@/lib/format";
import type { DataLiveMeter, DeretPemakaian, PesanTukar } from "../_tipe";

export function useBeranda() {
  const router = useRouter();
  const { pengguna, meter, meterAktif, memuat, muatUlangData } = useAuth();

  const [dataLive, setDataLive] = useState<DataLiveMeter | null>(null);
  const [deretPemakaian, setDeretPemakaian] = useState<DeretPemakaian[]>([]);
  const [memuatPemakaian, setMemuatPemakaian] = useState(false);

  const [tokenInput, setTokenInput] = useState("");
  const [memuatTukar, setMemuatTukar] = useState(false);
  const [pesanTukar, setPesanTukar] = useState<PesanTukar | null>(null);

  useEffect(() => {
    if (!memuat && pengguna && meter.length === 0) {
      router.replace("/hubungkan-meter");
    }
  }, [memuat, meter, pengguna, router]);

  const ambilDataLive = useCallback(async (meterId: string) => {
    try {
      const data = await api<DataLiveMeter>(`/api/meter/${meterId}/live`);
      setDataLive(data);
    } catch {
      void 0;
    }
  }, []);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      setMemuatPemakaian(true);
      try {
        const live = await api<DataLiveMeter>(
          `/api/meter/${meterAktif.id}/live`,
        );
        if (aktif) setDataLive(live);
      } catch {
        void 0;
      }

      try {
        const p = await api<{ deret: DeretPemakaian[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=minggu`,
        );
        if (aktif) setDeretPemakaian(p.deret || []);
      } catch {
        void 0;
      } finally {
        if (aktif) setMemuatPemakaian(false);
      }
    })();

    const interval = setInterval(() => {
      ambilDataLive(meterAktif.id);
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [meterAktif, ambilDataLive]);

  const handleTukarTokenCepat = async () => {
    if (!meterAktif || tokenInput.length < 4) return;

    setMemuatTukar(true);
    setPesanTukar(null);

    try {
      const res = await api<{
        status: string;
        nilaiL: number;
        saldoBaruL: number;
      }>("/api/token/tukar", {
        method: "POST",
        body: JSON.stringify({
          kode: tokenInput,
          meterId: meterAktif.id,
        }),
      });

      setPesanTukar({
        tipe: "sukses",
        teks: `Token valid! Saldo Anda bertambah +${liter(res.nilaiL, 0)}.`,
      });
      setTokenInput("");
      muatUlangData();
      ambilDataLive(meterAktif.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanTukar({ tipe: "galat", teks: err.message });
      } else {
        setPesanTukar({
          tipe: "galat",
          teks: "Token salah atau sudah dipakai. Periksa kode di struk atau email Anda.",
        });
      }
    } finally {
      setMemuatTukar(false);
    }
  };

  const totalHariIniL = useMemo(() => {
    if (deretPemakaian.length === 0) return 18.5;
    const kiniHari = new Date().toDateString();
    return deretPemakaian
      .filter((d) => new Date(d.waktu).toDateString() === kiniHari)
      .reduce((acc, curr) => acc + curr.volumeL, 0);
  }, [deretPemakaian]);

  const grafik7HariData = useMemo(() => {
    if (deretPemakaian.length === 0) {
      return {
        labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
        deret: [
          {
            name: "Pemakaian",
            unit: "L",
            points: [120, 145, 95, 180, 110, 210, 130],
          },
        ],
      };
    }

    const mapHari = new Map<string, number>();
    deretPemakaian.forEach((d) => {
      const tgl = new Date(d.waktu).toLocaleDateString("id-ID", {
        weekday: "short",
      });
      mapHari.set(tgl, (mapHari.get(tgl) ?? 0) + d.volumeL);
    });

    const labels = Array.from(mapHari.keys()).slice(-7);
    const points = labels.map((l) => Math.round(mapHari.get(l) ?? 0));

    return {
      labels,
      deret: [{ name: "Pemakaian Air", unit: "L", points }],
    };
  }, [deretPemakaian]);

  const saldoSekarang = dataLive?.saldoL ?? meterAktif?.saldoLiter ?? 0;
  const debitSekarang = dataLive?.debitLpm ?? 0;

  return {
    pengguna,
    meterAktif,
    memuat,
    dataLive,
    memuatPemakaian,
    tokenInput,
    setTokenInput,
    memuatTukar,
    pesanTukar,
    handleTukarTokenCepat,
    totalHariIniL,
    grafik7HariData,
    saldoSekarang,
    debitSekarang,
    saldoMenipis: saldoSekarang <= 5.0,
  };
}
