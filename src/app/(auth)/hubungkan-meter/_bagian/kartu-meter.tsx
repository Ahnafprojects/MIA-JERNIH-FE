import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LcdDisplay } from "@/components/domain/lcd";
import type { DataMeterDitemukan } from "../_tipe";

export function KartuMeter({
  meterDitemukan,
  memuatHubung,
  onHubungkan,
}: {
  meterDitemukan: DataMeterDitemukan;
  memuatHubung: boolean;
  onHubungkan: () => void;
}) {
  return (
    <div className="mt-6 space-y-4 rounded-[4px] border border-brand-500/30 bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <span className="font-mono text-[11px] font-bold text-brand-600 uppercase tracking-wider dark:text-accent">
            Meter Ditemukan
          </span>
          <h3 className="font-mono text-base font-bold text-ink">
            {meterDitemukan.serial} ({meterDitemukan.id})
          </h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-[2px] bg-success/10 px-2 py-1 font-mono text-xs font-semibold text-success">
          <CheckCircle2 size={13} />
          <span>Daring</span>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted">
        <p>
          <strong className="text-ink">Alamat:</strong> {meterDitemukan.alamat || "—"}
        </p>
        <p>
          <strong className="text-ink">Zona Distribusi:</strong> {meterDitemukan.zona || "—"}
        </p>
      </div>

      <div>
        <p className="mb-1 text-[11px] font-semibold text-ink">
          Layar LCD Fisik Saat Ini (Cocokkan dengan Layar Meter):
        </p>
        <LcdDisplay
          baris1={`S=${meterDitemukan.saldoL.toFixed(2)}L  ${meterDitemukan.saklarOn ? "ON" : "OFF"}`}
          baris2={`D=${meterDitemukan.debitLpm.toFixed(1)}   V=${meterDitemukan.volumeTotalL.toFixed(1)}`}
        />
      </div>

      <Button type="button" varian="utama" blok memuat={memuatHubung} onClick={onHubungkan}>
        Ini Meter Saya, Hubungkan Sekarang
        {!memuatHubung ? <ArrowRight size={16} /> : null}
      </Button>
    </div>
  );
}
