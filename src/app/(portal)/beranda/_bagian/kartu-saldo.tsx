import { WifiOff } from "lucide-react";
import { FlowVis, LivePill } from "@/components/domain/live";
import { BolaAir } from "@/components/ui/bola-air";
import { debit, liter, meterKubik } from "@/lib/format";
import { PemilihMeter } from "../../_nav-portal";

/**
 * Saldo: satu benda, bukan satu angka.
 *
 * Diberi lebar penuh dan dipisahkan dari grid. Sebelumnya saldo adalah kartu
 * PERTAMA dari tujuh kartu yang semuanya seukuran dan setingkat, jadi tidak
 * ada yang memberi tahu mata bahwa yang satu ini berbeda — padahal ini
 * satu-satunya angka yang membuat orang membuka halaman.
 */
export function KartuSaldo({
  saldo,
  debitLpm,
  acuanBolaL,
  targetBulanL,
  targetHarianL,
  saldoMenipis,
  luring,
}: {
  saldo: number;
  debitLpm: number;
  acuanBolaL: number;
  targetBulanL: number;
  targetHarianL: number;
  saldoMenipis: boolean;
  luring: boolean;
}) {
  return (
    <section className="permukaan-naik relative overflow-hidden p-6 sm:p-8">
      {/* Cahaya yang masuk dari atas-kiri, searah dengan seluruh situs.
          `pointer-events-none` wajib: lapisan ini menutupi tombol di
          bawahnya dan akan menelan kliknya. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--cahaya-permukaan)" }}
      />

      <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-stretch sm:gap-10">
        <div className="flex shrink-0 flex-col items-center">
          <BolaAir
            isiL={saldo}
            kapasitasL={acuanBolaL}
            kritis={saldoMenipis}
            className="h-[208px] w-[208px]"
          />
          <p className="mt-3 text-center font-mono text-[10px] leading-relaxed tracking-wider text-muted uppercase">
            Penuh = {liter(acuanBolaL, 0)}
            <br />
            {targetBulanL > 0 ? "Sebulan pakai Anda" : "Acuan sementara"}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="eyebrow text-muted">Saldo Air Tersedia</span>
                {/*
                  Pemilih meter pindah KE SINI dari bilah atas. Di bilah ia
                  melayang tanpa konteks; di sini ia menempel pada angka yang
                  diterangkannya. Warga bermeter tunggal hanya melihat nomor
                  serinya — tidak ada tombol, karena tidak ada yang bisa
                  dipilih.
                */}
                <PemilihMeter />
              </div>
              {/*
                Penanda "Live" hanya dipasang kalau datanya MEMANG hidup.
                Meter yang terputus tetap mengirim angka terakhir yang
                diketahui server, dan menandainya live membuat angka basi
                tampak baru — kesalahan yang paling mahal di halaman ini,
                karena saldo basi membuat orang mengira airnya masih ada.
              */}
              {luring ? (
                <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-warn/40 bg-warn-soft px-2 py-0.5 text-[11px] font-bold tracking-wider text-warn uppercase">
                  <WifiOff size={11} />
                  Luring
                </span>
              ) : (
                <LivePill teks="Sensor Live" />
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="tabular font-mono text-5xl leading-none font-black tracking-tight text-ink sm:text-6xl">
                {liter(saldo, 2)}
              </span>
              {/*
                `meterKubik()`, BUKAN `(n/1000).toFixed(3)`.

                `toFixed` memakai titik sebagai pemisah DESIMAL, sementara di
                Indonesia titik adalah pemisah RIBUAN: saldo 33.377 L
                tergambar "33.377 m³" dan terbaca tiga puluh tiga ribu meter
                kubik — seribu kali lipat dari yang dimaksud, tepat di sebelah
                angka liter yang benar.
              */}
              <span className="font-mono text-xs text-muted">
                ({meterKubik(saldo, 2)})
              </span>
            </div>

            {/*
              Perkiraan sisa hari dihitung dari RATA-RATA tujuh hari, bukan
              dari pemakaian hari ini. Membaginya dengan angka hari ini
              membuat perkiraannya melompat sepanjang hari — pukul enam pagi
              pemakaiannya masih nol dan sisanya terbaca ratusan hari, lalu
              menyusut tiap kali keran dibuka. Rata-rata tidak punya cacat
              itu, dan tetap angka warga sendiri.
            */}
            <p className="mt-3 max-w-prose text-sm text-muted">
              {saldoMenipis
                ? "Hampir habis. Katup menutup sendiri begitu menyentuh nol liter."
                : targetHarianL > 0
                  ? `Cukup kira-kira ${Math.max(1, Math.round(saldo / targetHarianL))} hari lagi pada pemakaian rata-rata Anda.`
                  : "Belum ada cukup riwayat untuk memperkirakan sisa hari."}
            </p>
          </div>

          {/* Alur air. Dibuat CEKUNG: ini saluran yang dilewati air, bukan
              benda yang menumpang di atas kartu. */}
          <div className="cekung mt-6 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">
                {luring ? "Debit Terakhir Diterima" : "Debit Aliran Saat Ini"}
              </span>
              <span className="tabular font-mono font-bold text-ink">
                {debit(debitLpm)}
              </span>
            </div>
            <div className="mt-2">
              <FlowVis lpm={debitLpm} />
            </div>
            <p className="mt-2 text-[11px] text-muted">
              {luring
                ? "Meter belum mengirim data baru. Angka ini laporan terakhir yang diterima."
                : debitLpm > 0
                  ? "Kran terbuka, air sedang dialirkan ke instalasi rumah Anda."
                  : "Kran tertutup, tidak terdeteksi aliran air."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
