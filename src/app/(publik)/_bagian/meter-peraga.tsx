"use client";

import { useEffect, useReducer } from "react";
import { MeterDevice } from "@/components/domain/meter-device";
import { LivePill } from "@/components/domain/live";
import { lcdUtama } from "@/lib/format";

type Mode = "normal" | "isi" | "valid" | "salah" | "habis";

interface Keadaan {
  mode: Mode;
  ketik: string;
}

type Aksi = { jenis: "tombol"; t: string } | { jenis: "reset" } | { jenis: "habis" };

const DEMO = "1111";

/*
 * Satu reducer, bukan beberapa useState.
 *
 * Penting karena keypad bisa ditekan beruntun lebih cepat daripada React
 * sempat render. Dengan useState terpisah, penanganan tombol kedua masih
 * membaca `mode` yang lama — tekan `*` lalu `1` dengan cepat, dan angkanya
 * hilang karena mode saat itu masih terbaca "normal". Reducer selalu bekerja
 * di atas keadaan terbaru, jadi urutan tekan secepat apa pun tetap benar.
 */
function reducer(s: Keadaan, a: Aksi): Keadaan {
  if (a.jenis === "reset") return { mode: "normal", ketik: "" };
  if (a.jenis === "habis")
    return { mode: s.mode === "habis" ? "normal" : "habis", ketik: "" };

  const t = a.t;
  if (t === "*") return { mode: "isi", ketik: "" };
  if (t === "D") return { ...s, ketik: s.ketik.slice(0, -1) };
  if (t === "A") {
    if (s.mode !== "isi") return s;
    return { mode: s.ketik === DEMO ? "valid" : "salah", ketik: "" };
  }
  if (/^\d$/.test(t) && s.mode === "isi") {
    return { ...s, ketik: (s.ketik + t).slice(0, 10) };
  }
  return s;
}

/**
 * Peraga meter interaktif di hero.
 *
 * Bagian yang paling diingat juri, karena memperlihatkan bahwa produknya
 * bicara tentang alat fisik — bukan sekadar halaman web. Pengunjung bisa
 * mengetik di keypad dan melihat layarnya menjawab, persis seperti meter
 * sungguhan: `*` masuk mode isi token, `A` enter, `D` hapus.
 */
export function MeterPeraga() {
  const [s, kirim] = useReducer(reducer, { mode: "normal", ketik: "" });

  // Layar meter kembali ke tampilan utama setelah pesan hasil, sama seperti
  // perilaku perangkatnya.
  useEffect(() => {
    if (s.mode !== "valid" && s.mode !== "salah") return;
    const jam = setTimeout(() => kirim({ jenis: "reset" }), 2600);
    return () => clearTimeout(jam);
  }, [s.mode]);

  const saldo = s.mode === "habis" ? 0 : s.mode === "valid" ? 4825.5 : 4820.5;
  const relayAktif = s.mode !== "habis";
  const buzzer = s.mode === "habis" ? "on" : saldo <= 5 ? "crit" : "off";

  let baris1: string;
  let baris2: string;

  if (s.mode === "isi") {
    baris1 = "ISI TOKEN";
    baris2 = s.ketik || "_";
  } else if (s.mode === "valid") {
    baris1 = "TOKEN VALID";
    baris2 = "+5 LITER";
  } else if (s.mode === "salah") {
    baris1 = "TOKEN SALAH";
    baris2 = "COBA LAGI";
  } else if (s.mode === "habis") {
    baris1 = "SALDO HABIS";
    baris2 = "ISI TOKEN";
  } else {
    [baris1, baris2] = lcdUtama(saldo, true, 2.4, 8420.4);
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <MeterDevice
        baris1={baris1}
        baris2={baris2}
        relayAktif={relayAktif}
        buzzer={buzzer}
        onTombol={(t) => kirim({ jenis: "tombol", t })}
      />

      <div className="flex flex-col items-center gap-2 text-center">
        <LivePill teks="Coba sendiri" />
        <p className="max-w-xs text-[13px] leading-relaxed text-muted">
          Tekan <b className="font-mono text-ink">*</b> untuk mode isi token,
          ketik <b className="font-mono text-ink">{DEMO}</b>, lalu tekan{" "}
          <b className="font-mono text-ink">A</b>.
        </p>
        <button
          type="button"
          onClick={() => kirim({ jenis: "habis" })}
          // `min-h-11`: sasaran ketuknya tadinya setinggi barisnya saja
          // (19px). Ini tombol yang justru paling ingin dicoba orang di
          // ponsel — memperagakan apa yang terjadi saat saldo habis.
          className="inline-flex min-h-11 items-center justify-center px-2 text-[12.5px] font-semibold text-brand-600 underline-offset-4 hover:underline"
        >
          {s.mode === "habis"
            ? "Kembalikan saldo"
            : "Lihat yang terjadi saat saldo habis"}
        </button>
      </div>
    </div>
  );
}
