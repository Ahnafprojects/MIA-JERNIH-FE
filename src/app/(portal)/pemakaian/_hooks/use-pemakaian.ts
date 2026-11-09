"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { HARI_LABEL } from "../_bagian/_skala-warna";
import type { RentangGrafik, RingkasanKpi, TitikEmber } from "../_tipe";

export function usePemakaian() {
  const { meterAktif } = useAuth();
  const [rentangGrafik, setRentangGrafik] = useState<RentangGrafik>("7hari");
  const [dataEmber, setDataEmber] = useState<TitikEmber[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      setMemuat(true);
      try {
        const res = await api<{ deret: TitikEmber[] }>(
          `/api/meter/${meterAktif.id}/pemakaian?rentang=minggu`,
        );
        if (aktif) setDataEmber(res.deret || []);
      } catch {
        if (aktif) setDataEmber([]);
      } finally {
        if (aktif) setMemuat(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, [meterAktif]);

  const kpi = useMemo<RingkasanKpi>(() => {
    if (dataEmber.length === 0) {
      return {
        hariIniL: 0,
        mingguIniL: 0,
        bulanIniL: 0,
        rataRataHarianL: 0,
        rasioZonaPersen: -14,
      };
    }

    const kini = new Date();
    const kiniStr = kini.toDateString();

    const tujuhHariLalu = new Date(kini.getTime() - 7 * 24 * 60 * 60 * 1000);

    let hIni = 0;
    let mIni = 0;

    dataEmber.forEach((d) => {
      const tgl = new Date(d.waktu);
      if (tgl.toDateString() === kiniStr) {
        hIni += d.volumeL;
      }
      if (tgl >= tujuhHariLalu) {
        mIni += d.volumeL;
      }
    });

    const avgHarian = mIni > 0 ? Math.round((mIni / 7) * 10) / 10 : 0;
    const estimasiBulan = Math.round(avgHarian * 30);

    return {
      hariIniL: Math.round(hIni * 10) / 10,
      mingguIniL: Math.round(mIni),
      bulanIniL: estimasiBulan,
      rataRataHarianL: avgHarian,
      rasioZonaPersen: -18,
    };
  }, [dataEmber]);

  const sisaHariProyeksi = useMemo(() => {
    const saldoSekarang = meterAktif?.saldoLiter ?? 0;
    if (saldoSekarang <= 0 || kpi.rataRataHarianL <= 0) return null;
    return Math.max(1, Math.round(saldoSekarang / kpi.rataRataHarianL));
  }, [meterAktif?.saldoLiter, kpi.rataRataHarianL]);

  const gridPetaPanas = useMemo(() => {
    const grid: (number | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => null),
    );

    if (dataEmber.length === 0) return grid;

    dataEmber.forEach((item) => {
      const t = new Date(item.waktu);
      const hariJs = t.getDay();
      const barisHari = hariJs === 0 ? 6 : hariJs - 1;
      const kolomJam = t.getHours();

      const nilaiLama = grid[barisHari]?.[kolomJam] ?? 0;
      if (grid[barisHari]) {
        grid[barisHari][kolomJam] =
          Math.round((nilaiLama + item.volumeL) * 10) / 10;
      }
    });

    return grid;
  }, [dataEmber]);

  const dataGrafik = useMemo(() => {
    if (rentangGrafik === "7hari") {
      const mapHari = new Map<string, number>();
      dataEmber.forEach((d) => {
        const tgl = new Date(d.waktu).toLocaleDateString("id-ID", {
          weekday: "short",
        });
        mapHari.set(tgl, (mapHari.get(tgl) ?? 0) + d.volumeL);
      });

      const labels = Array.from(mapHari.keys()).slice(-7);
      const points = labels.map((l) => Math.round(mapHari.get(l) ?? 0));

      return {
        labels: labels.length > 0 ? labels : HARI_LABEL,
        deret: [
          {
            name: "Pemakaian Air",
            unit: "L",
            points:
              points.length > 0 ? points : [120, 145, 95, 180, 110, 210, 130],
          },
        ],
      };
    }

    return {
      labels: ["Mei", "Jun", "Jul", "Agu", "Sep", "Okt"],
      deret: [
        {
          name: "Volume Bulanan",
          unit: "L",
          points: [4200, 3900, 4800, 4100, 3600, 3850],
        },
      ],
    };
  }, [dataEmber, rentangGrafik]);

  return {
    meterAktif,
    memuat,
    rentangGrafik,
    setRentangGrafik,
    kpi,
    sisaHariProyeksi,
    gridPetaPanas,
    dataGrafik,
  };
}
