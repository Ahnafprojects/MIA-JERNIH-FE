import { HelpCircle } from "lucide-react";
import { liter } from "@/lib/format";
import type { JamBoros } from "../_tipe";

export function TipsHemat({
  jamPalingBoros,
}: {
  jamPalingBoros: JamBoros | null;
}) {
  return (
    <div className="permukaan p-5">
      <div className="flex items-center gap-2">
        <HelpCircle size={16} className="text-brand-600 dark:text-accent" />
        <h3 className="font-display text-sm font-bold text-ink">
          Tips Penghematan Berdasarkan Pola Anda
        </h3>
      </div>
      {/*
        Jamnya diambil dari `jamPalingBoros`, BUKAN ditulis mati.
        Versi sebelumnya mengumumkan "Puncak Pagi Terdeteksi (06:00–07:00)"
        untuk setiap warga — dan pada meter ini jam tersibuknya 13:00. Kartu
        tips membantah kartu "Jam Paling Boros" di layar yang sama, sambil
        memakai kata "Terdeteksi" yang menjanjikan pengukuran.
      */}
      <div className="mt-3 grid grid-cols-1 gap-3 text-xs leading-relaxed text-muted sm:grid-cols-2">
        {jamPalingBoros ? (
          <div className="cekung p-3">
            <strong className="text-ink">
              Puncak harian pukul{" "}
              {String(jamPalingBoros.jam).padStart(2, "0")}:00:
            </strong>{" "}
            rata-rata {liter(jamPalingBoros.rataL, 1)} pada jam itu. Menggeser
            sebagian pemakaian ke jam lain meratakan tekanan air di jaringan
            zona Anda.
          </div>
        ) : (
          <div className="cekung p-3">
            <strong className="text-ink">Pola harian belum terbaca:</strong>{" "}
            meter belum mengirim cukup rekaman per jam untuk menunjukkan jam
            tersibuk di rumah Anda.
          </div>
        )}

        <div className="cekung p-3">
          <strong className="text-ink">
            Periksa dini hari (00:00–05:00):
          </strong>{" "}
          saat semua keran tertutup, sel peta panas pada jam-jam itu seharusnya
          mendekati nol. Sel yang bertahan terisi malam demi malam menandakan
          rembesan — kloset atau sambungan yang longgar.
        </div>
      </div>
    </div>
  );
}
