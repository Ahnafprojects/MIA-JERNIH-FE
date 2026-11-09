import { Droplet, Power, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KontrolAliran({
  saklarOn,
  relayAktif,
  isDaring,
  saldo,
  onBuka,
  onTutup,
}: {
  saklarOn: boolean;
  relayAktif: boolean;
  isDaring: boolean;
  saldo: number;
  onBuka: () => void;
  onTutup: () => void;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h2 className="font-display text-base font-bold text-ink">
            Kontrol Aliran Air
          </h2>
          <p className="text-xs text-muted">
            Status saklar mekanik dan katup relay elektronik dipisahkan dengan jelas.
          </p>
        </div>
        <Sliders size={20} className="text-muted" />
      </div>

      <div className="my-5 grid grid-cols-2 gap-4">
        <div className="rounded-[3px] border border-line bg-soft p-3">
          <span className="eyebrow text-muted">Saklar Fisik</span>
          <div className="mt-1 flex items-center gap-2">
            <Power size={18} className={saklarOn ? "text-success" : "text-muted"} />
            <span className="font-mono text-sm font-bold text-ink">
              {saklarOn ? "Posisi ON" : "Posisi OFF"}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-muted">Saklar manual pada perangkat meter</p>
        </div>

        <div className="rounded-[3px] border border-line bg-soft p-3">
          <span className="eyebrow text-muted">Katup Relay</span>
          <div className="mt-1 flex items-center gap-2">
            <Droplet size={18} className={relayAktif ? "text-brand-600 dark:text-accent" : "text-danger"} />
            <span className="font-mono text-sm font-bold text-ink">
              {relayAktif ? "Aktif (Terbuka)" : "Nonaktif (Tutup)"}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-muted">Dikontrol sistem atau jarak jauh</p>
        </div>
      </div>

      <div className="rounded-[3px] border border-line bg-surface p-3 text-xs leading-relaxed text-muted">
        <p>
          <strong>Aturan Katup:</strong> Katup relay hanya mengalirkan air apabila <strong className="text-ink">Saldo Air &gt; 0 L</strong> dan <strong className="text-ink">Saklar Fisik dalam posisi ON</strong>.
        </p>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        {!isDaring ? (
          <div className="rounded-[3px] border border-warn/30 bg-warn/10 p-3 text-xs text-ink">
            <p className="font-semibold text-warn">Perangkat Tidak Terhubung</p>
            <p className="mt-0.5 text-muted">
              Kontrol katup relay dinonaktifkan sementara karena perangkat meter sedang luring.
            </p>
          </div>
        ) : relayAktif ? (
          <Button varian="bahaya" blok onClick={onTutup}>
            Tutup Katup Relay (Hentikan Aliran)
          </Button>
        ) : (
          <Button varian="utama" blok disabled={saldo <= 0 || !saklarOn} onClick={onBuka}>
            Buka Katup Relay (Nyalakan Aliran)
          </Button>
        )}
      </div>
    </div>
  );
}
