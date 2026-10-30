"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, aturPenanganRefresh, aturTokenAkses } from "./api";
import type { MeterSingkat, Pengguna, SesiState } from "./auth-tipe";

interface AuthContextValue extends SesiState {
  masukDenganAkses: (accessToken: string, pengguna: Pengguna, meter?: MeterSingkat[]) => Promise<MeterSingkat[]>;
  keluar: () => Promise<void>;
  pilihMeter: (meterId: string) => void;
  segarkanSesi: () => Promise<string | null>;
  muatUlangData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pengguna, setPengguna] = useState<Pengguna | null>(null);
  const [meter, setMeter] = useState<MeterSingkat[]>([]);
  const [meterAktifId, setMeterAktifId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);

  const sedangRefreshRef = useRef<Promise<string | null> | null>(null);

  const bersihkanSesi = useCallback(() => {
    setPengguna(null);
    setMeter([]);
    setMeterAktifId(null);
    setAccessToken(null);
    aturTokenAkses(null);
    try {
      localStorage.removeItem("jernih_meter_aktif");
    } catch {
      // Abaikan jika storage tidak tersedia
    }
  }, []);

  const segarkanSesi = useCallback(async (): Promise<string | null> => {
    if (sedangRefreshRef.current) {
      return sedangRefreshRef.current;
    }

    const janjiRefresh = (async () => {
      try {
        const data = await api<{ accessToken: string; pengguna: Pengguna }>(
          "/api/auth/refresh",
          { method: "POST" },
        );
        aturTokenAkses(data.accessToken);
        setAccessToken(data.accessToken);
        setPengguna(data.pengguna);

        // Ambil profil meter bila peran warga
        if (data.pengguna.peran === "WARGA") {
          try {
            const dataMe = await api<{ meter: MeterSingkat[] }>("/api/me", {
              headers: { Authorization: `Bearer ${data.accessToken}` },
            });
            if (dataMe.meter) {
              setMeter(dataMe.meter);
              setMeterAktifId((prev) => {
                const tersimpan = localStorage.getItem("jernih_meter_aktif");
                if (tersimpan && dataMe.meter.some((m) => m.id === tersimpan)) {
                  return tersimpan;
                }
                return prev ?? dataMe.meter[0]?.id ?? null;
              });
            }
          } catch {
            // Profil meter opsional jika gagal
          }
        }

        return data.accessToken;
      } catch {
        bersihkanSesi();
        return null;
      } finally {
        sedangRefreshRef.current = null;
      }
    })();

    sedangRefreshRef.current = janjiRefresh;
    return janjiRefresh;
  }, [bersihkanSesi]);

  const muatUlangData = useCallback(async () => {
    try {
      const dataMe = await api<{ pengguna: Pengguna; meter?: MeterSingkat[] }>("/api/me");
      setPengguna(dataMe.pengguna);
      if (dataMe.meter) {
        setMeter(dataMe.meter);
        setMeterAktifId((prev) => {
          const tersimpan = typeof window !== "undefined" ? localStorage.getItem("jernih_meter_aktif") : null;
          if (tersimpan && dataMe.meter?.some((m) => m.id === tersimpan)) {
            return tersimpan;
          }
          return prev ?? dataMe.meter?.[0]?.id ?? null;
        });
      }
    } catch {
      // Gagal ambil data profil
    }
  }, []);

  const masukDenganAkses = useCallback(
    async (token: string, dataPengguna: Pengguna, meterAwal?: MeterSingkat[]) => {
      aturTokenAkses(token);
      setAccessToken(token);
      setPengguna(dataPengguna);

      let meterList = meterAwal;
      if (!meterList && dataPengguna.peran === "WARGA") {
        try {
          const dataMe = await api<{ meter: MeterSingkat[] }>("/api/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          meterList = dataMe.meter || [];
        } catch {
          meterList = [];
        }
      }

      if (meterList && meterList.length > 0) {
        setMeter(meterList);
        setMeterAktifId(meterList[0].id);
        try {
          localStorage.setItem("jernih_meter_aktif", meterList[0].id);
        } catch {
          // Abaikan
        }
      } else {
        setMeter([]);
        setMeterAktifId(null);
      }
      return meterList || [];
    },
    [],
  );

  const keluar = useCallback(async () => {
    try {
      await api("/api/auth/keluar", { method: "POST" });
    } catch {
      // Tetap lanjutkan pembersihan lokal jika gagal
    }
    bersihkanSesi();
    router.push("/masuk");
  }, [bersihkanSesi, router]);

  const pilihMeter = useCallback((meterId: string) => {
    setMeterAktifId(meterId);
    try {
      localStorage.setItem("jernih_meter_aktif", meterId);
    } catch {
      // Abaikan
    }
  }, []);

  // Pasang penangan refresh untuk client fetch
  useEffect(() => {
    aturPenanganRefresh(segarkanSesi);
    return () => aturPenanganRefresh(null);
  }, [segarkanSesi]);

  // Muat sesi pertama kali saat aplikasi dibuka
  useEffect(() => {
    let hidup = true;
    (async () => {
      await segarkanSesi();
      if (hidup) {
        setMemuat(false);
      }
    })();
    return () => {
      hidup = false;
    };
  }, [segarkanSesi]);

  const meterAktif = meter.find((m) => m.id === meterAktifId) ?? meter[0] ?? null;

  const value: AuthContextValue = {
    pengguna,
    meter,
    meterAktif,
    accessToken,
    memuat,
    masukDenganAkses,
    keluar,
    pilihMeter,
    segarkanSesi,
    muatUlangData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}
