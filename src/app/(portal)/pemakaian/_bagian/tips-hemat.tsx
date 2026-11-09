import { HelpCircle } from "lucide-react";

export function TipsHemat() {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <HelpCircle size={16} className="text-brand-600 dark:text-accent" />
        <h3 className="font-display text-sm font-bold text-ink">
          Tips Penghematan Berdasarkan Pola Anda
        </h3>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs leading-relaxed text-muted">
        <div className="rounded-[3px] border border-line bg-soft p-3">
          <strong className="text-ink">Puncak Pagi Terdeteksi (06:00–07:00):</strong>{" "}
          Gunakan shower bertekanan stabil daripada bak tampung untuk memangkas
          hingga 15 liter tiap sesi mandi.
        </div>
        <div className="rounded-[3px] border border-line bg-soft p-3">
          <strong className="text-ink">Periksa Saluran Malam (01:00–04:00):</strong>{" "}
          Pastikan debit pada peta panas selalu berada di sel 0 L pada dini hari
          agar terhindar dari kebocoran rembesan kloset.
        </div>
      </div>
    </div>
  );
}
