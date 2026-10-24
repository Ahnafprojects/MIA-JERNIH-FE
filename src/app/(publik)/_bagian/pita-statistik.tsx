"use client";

import { useEffect, useRef, useState } from "react";
import useApi from "@/lib/use-api";
import { angka } from "@/lib/format";
import { AngkaBergerak } from "@/components/domain/angka-bergerak";
import type { StatistikPublik } from "@/types/publik";

interface Item {
  label: string;
  nilai: number | null;
  satuan: string;
  desimal: number;
}

const kurangiGerak = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Satu angka yang berjalan naik sampai nilainya, lalu berhenti.
 *
 * Perjalanannya baru dimulai saat pitanya benar-benar terlihat: angka yang
 * sudah selesai berjalan sebelum ada yang melihatnya sama saja dengan tidak
 * bergerak. Perlambatan di ujung membuatnya terbaca seperti jarum alat ukur
 * yang mendarat, bukan penghitung yang merayakan dirinya.
 *
 * Nol di awal BUKAN nilai yang diklaim: komponen ini hanya dipasang setelah
 * angka sebenarnya diketahui. Selama angkanya belum ada, yang tampil rangka
 * pemuatan atau em dash — bukan nol.
 */
function AngkaMendarat({ nilai, desimal }: { nilai: number; desimal: number }) {
  const [tujuan, setTujuan] = useState(() => (kurangiGerak() ? nilai : 0));

  // Dijadwalkan ke bingkai berikutnya, bukan dipanggil langsung di badan
  // effect: titik berangkatnya harus sempat tergambar lebih dulu, kalau tidak
  // React menggabung kedua render dan angkanya sampai di tujuan tanpa pernah
  // berjalan.
  useEffect(() => {
    const bingkai = requestAnimationFrame(() => setTujuan(nilai));
    return () => cancelAnimationFrame(bingkai);
  }, [nilai]);

  return <AngkaBergerak nilai={tujuan} desimal={desimal} durasi={1100} />;
}

/**
 * Pita angka jaringan.
 *
 * Angkanya DIAMBIL DARI API, tidak ditulis di sini. Juri akan membandingkan
 * angka di landing dengan halaman /statistik; kalau ditulis tangan, keduanya
 * berbeda begitu data berubah dan seluruh klaim transparansi runtuh.
 * Saat API belum menjawab, yang tampil em dash — bukan angka karangan.
 */
export function PitaStatistik() {
  const { data, memuat } = useApi<StatistikPublik>("/api/publik/statistik");

  const ref = useRef<HTMLElement>(null);
  const [terlihat, setTerlihat] = useState(false);

  /*
   * Pemicu terpisah dari `Muncul`: yang dibutuhkan di sini bukan memunculkan
   * elemen, melainkan menahan perjalanan angka sampai pitanya dibaca.
   *
   * `rootMargin` sengaja dilebihkan seperempat layar: perjalanannya harus
   * SUDAH dimulai sebelum pitanya benar-benar terlihat, supaya tidak ada satu
   * bingkai pun yang menampilkan nol diam sebagai kalau-kalau itu nilainya.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Tanpa IntersectionObserver tidak ada perjalanan angka sama sekali —
    // yang tampil nilai sebenarnya, apa adanya. Gerakan boleh hilang, isi
    // tidak boleh.
    if (typeof IntersectionObserver === "undefined") return;

    const pengamat = new IntersectionObserver(
      (masukan) => {
        if (!masukan.some((m) => m.isIntersecting)) return;
        setTerlihat(true);
        pengamat.disconnect();
      },
      { threshold: 0, rootMargin: "25% 0px 25% 0px" },
    );
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);

  const item: Item[] = [
    {
      label: "Pelanggan terlayani",
      nilai: data?.pelangganTerlayani ?? null,
      satuan: "rumah",
      desimal: 0,
    },
    {
      label: "Air disalurkan 30 hari terakhir",
      nilai: data?.volumeDisalurkanM3 ?? null,
      satuan: "m³",
      desimal: 0,
    },
    {
      label: "Kehilangan air",
      nilai: data?.nrwPct ?? null,
      satuan: "%",
      desimal: 1,
    },
    {
      label: "Zona terpantau",
      nilai: data?.jumlahZona ?? null,
      satuan: "zona",
      desimal: 0,
    },
  ];

  return (
    <section ref={ref} className="lapis-permukaan border-b border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-2 px-5 lg:grid-cols-4">
        {item.map(({ label, nilai, satuan, desimal }, i) => (
          <div
            key={label}
            className={`py-9 ${i % 2 === 1 ? "pl-6" : "pr-6"} ${
              i < 2 ? "border-b border-line lg:border-b-0" : ""
            } ${i % 2 === 0 ? "border-r border-line" : ""} ${
              i === 2 ? "lg:border-r" : ""
            } lg:px-7 lg:first:pl-0 lg:last:border-r-0`}
          >
            <p className="tabular font-mono text-[clamp(1.6rem,3.4vw,2.2rem)] leading-none font-bold">
              {memuat ? (
                <span className="inline-block h-7 w-20 animate-pulse rounded bg-soft align-middle" />
              ) : nilai === null ? (
                "—"
              ) : (
                <>
                  {/* Sebelum pitanya dibaca, angkanya ditampilkan apa adanya.
                      Yang berjalan hanya yang sempat dilihat berjalan. */}
                  {terlihat ? (
                    <AngkaMendarat nilai={nilai} desimal={desimal} />
                  ) : (
                    angka(nilai, desimal)
                  )}
                  <span className="ml-1.5 text-[0.5em] font-medium text-muted">
                    {satuan}
                  </span>
                </>
              )}
            </p>
            <p className="eyebrow mt-3 text-muted">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
