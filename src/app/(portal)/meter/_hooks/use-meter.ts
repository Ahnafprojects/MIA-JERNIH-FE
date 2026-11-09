"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { DataMeterDetail, LogMeter, ModalRelay, PesanAksi } from "../_tipe";

export function useMeter() {
  const { meterAktif, muatUlangData } = useAuth();

  const [meterDetail, setMeterDetail] = useState<DataMeterDetail | null>(null);
  const [logList, setLogList] = useState<LogMeter[]>([]);

  const [modalRelay, setModalRelay] = useState<ModalRelay>(null);
  const [alasanRelay, setAlasanRelay] = useState("");
  const [memuatAksi, setMemuatAksi] = useState(false);
  const [pesanAksi, setPesanAksi] = useState<PesanAksi | null>(null);

  const ambilDetailMeter = useCallback(async (meterId: string) => {
    try {
      const [resMeter, resLog] = await Promise.all([
        api<{ meter: DataMeterDetail; lcd: { baris1: string; baris2: string } }>(
          `/api/meter/${meterId}`,
        ),
        api<{ log: LogMeter[] }>(`/api/meter/${meterId}/log`).catch(() => ({ log: [] })),
      ]);

      setMeterDetail(resMeter.meter);
      setLogList(resLog.log || []);
    } catch {
      // Abaikan bila ada kendala fetch
    }
  }, []);

  useEffect(() => {
    if (!meterAktif) return;
    let aktif = true;

    (async () => {
      try {
        const [resMeter, resLog] = await Promise.all([
          api<{ meter: DataMeterDetail; lcd: { baris1: string; baris2: string } }>(
            `/api/meter/${meterAktif.id}`,
          ),
          api<{ log: LogMeter[] }>(`/api/meter/${meterAktif.id}/log`).catch(() => ({ log: [] })),
        ]);
        if (aktif) {
          setMeterDetail(resMeter.meter);
          setLogList(resLog.log || []);
        }
      } catch {
        // Abaikan
      }
    })();

    // Polling live 5 detik
    const interval = setInterval(() => {
      ambilDetailMeter(meterAktif.id);
    }, 5000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, [meterAktif, ambilDetailMeter]);

  const handleEksekusiRelay = async () => {
    if (!meterDetail || !modalRelay || alasanRelay.trim().length < 3) return;

    setMemuatAksi(true);
    setPesanAksi(null);

    try {
      await api(`/api/meter/${meterDetail.id}/relay`, {
        method: "POST",
        body: JSON.stringify({
          aksi: modalRelay,
          alasan: alasanRelay.trim(),
        }),
      });

      setPesanAksi({
        tipe: "sukses",
        teks: `Katup relay berhasil diubah menjadi ${modalRelay === "buka" ? "AKTIF" : "NONAKTIF"}. Perintah tercatat di audit log.`,
      });
      setModalRelay(null);
      setAlasanRelay("");
      await muatUlangData();
      ambilDetailMeter(meterDetail.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setPesanAksi({ tipe: "galat", teks: err.message });
      } else {
        setPesanAksi({ tipe: "galat", teks: "Gagal mengubah status relay meter." });
      }
    } finally {
      setMemuatAksi(false);
    }
  };

  const statusAlarm = useMemo(() => {
    const s = meterDetail?.saldoL ?? 0;
    if (s <= 0) {
      return {
        level: "Kritis (0 L)",
        nada: "bahaya" as const,
        keterangan: "Bunyi terus dan aliran tertutup otomatis.",
      };
    }
    if (s <= 2.0) {
      return {
        level: "Genting (≤ 2 L)",
        nada: "bahaya" as const,
        keterangan: "Bip tiap 2 detik — segera isi token.",
      };
    }
    if (s <= 5.0) {
      return {
        level: "Peringatan (≤ 5 L)",
        nada: "peringatan" as const,
        keterangan: "Bip tiap 10 detik.",
      };
    }
    return {
      level: "Normal",
      nada: "sukses" as const,
      keterangan: "Senyap — pasokan saldo aman.",
    };
  }, [meterDetail?.saldoL]);

  const dataDeteksiKebocoran = useMemo(() => {
    return {
      labels: ["01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00"],
      deret: [
        {
          name: "Debit Malam",
          unit: "L/mnt",
          points: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        },
      ],
      ambangBocor: 0.2, // Ambang deteksi kebocoran
    };
  }, []);

  return {
    meterAktif,
    meterDetail,
    logList,
    modalRelay,
    setModalRelay,
    alasanRelay,
    setAlasanRelay,
    memuatAksi,
    pesanAksi,
    statusAlarm,
    dataDeteksiKebocoran,
    handleEksekusiRelay,
  };
}
