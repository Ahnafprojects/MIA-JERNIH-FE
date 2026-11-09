import { LcdDisplay } from "@/components/domain/lcd";

/**
 * Panel meter: perangkat yang MEMEGANG sebuah layar, bukan gambar layar.
 *
 * Kartu "Koneksi Telemetri" yang dulu berdiri sendiri dilebur ke sini
 * sebagai ubin "Sinkron". Kartu itu hanya memuat satu baris waktu dan selalu
 * menulis "Daring" tanpa pernah memeriksanya — dua cacat yang hilang begitu
 * waktunya duduk bersama saklar dan relay, di bawah lencana yang memang
 * membaca keadaan sambungannya.
 */
export function LcdLive({
  saldo,
  debitLpm,
  volumeTotalL,
  saklarOn,
  relay,
  ts,
  labelMeter,
  serialMeter,
  luring,
}: {
  saldo: number;
  debitLpm: number;
  volumeTotalL: number | undefined;
  saklarOn: boolean | undefined;
  relay: string | undefined;
  ts: string | undefined;
  labelMeter: string | null;
  serialMeter: string;
  luring: boolean;
}) {
  return (
    <div className="permukaan p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">
            {labelMeter ?? "Meter air Anda"}
          </p>
          {/* Versi firmware sengaja TIDAK ditampilkan: ia tidak menjawab satu
              pun pertanyaan yang dibawa warga ke halaman ini, dan nomor
              seri sudah cukup untuk menyebut meter yang mana. */}
          <p className="truncate font-mono text-[10px] text-muted">
            {serialMeter}
          </p>
        </div>
        {luring ? (
          <span className="shrink-0 rounded-[7px] border border-warn/40 bg-warn-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-warn uppercase">
            Luring
          </span>
        ) : (
          <span className="shrink-0 rounded-[7px] border border-success/40 bg-success-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-success uppercase">
            Daring
          </span>
        )}
      </div>

      <span className="eyebrow text-muted">
        {luring ? "Layar meter · data terakhir" : "Layar LCD fisik meter"}
      </span>

      <div className="mt-2">
        {/*
          `volumeTotalL ?? 0`, bukan `?? 8420.4`. Nilai cadangan lama itu
          angka karangan yang tergambar di layar LCD tiruan seolah dibaca
          dari perangkat — padahal muncul justru saat servernya belum
          menjawab apa pun.
        */}
        <LcdDisplay
          baris1={`S=${saldo.toFixed(2)}L  ${saklarOn !== false ? "ON" : "OFF"}`}
          baris2={`D=${debitLpm.toFixed(1)}   V=${(volumeTotalL ?? 0).toFixed(1)}`}
        />
      </div>

      {/*
        Tiga keadaan perangkat yang paling sering ditanyakan saat air tidak
        keluar: saklarnya, katupnya, dan kapan terakhir meternya melapor.
        Sebelumnya ketiganya tidak ada di halaman mana pun, jadi satu-satunya
        cara mengetahuinya adalah mendatangi meternya.
      */}
      <div className="berjenjang mt-4 grid grid-cols-3 gap-2">
        <div className="cekung p-2.5 text-center">
          <p className="font-mono text-[9px] tracking-wider text-muted uppercase">
            Saklar
          </p>
          <p className="mt-1 font-mono text-xs font-black text-ink">
            {saklarOn !== false ? "ON" : "OFF"}
          </p>
        </div>
        <div className="cekung p-2.5 text-center">
          <p className="font-mono text-[9px] tracking-wider text-muted uppercase">
            Relay
          </p>
          <p className="mt-1 font-mono text-xs font-black text-ink">
            {relay === "AKTIF" ? "Buka" : "Tutup"}
          </p>
        </div>
        <div className="cekung p-2.5 text-center">
          <p className="font-mono text-[9px] tracking-wider text-muted uppercase">
            Sinkron
          </p>
          <p className="mt-1 font-mono text-xs font-black text-ink">
            {ts
              ? new Date(ts).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
