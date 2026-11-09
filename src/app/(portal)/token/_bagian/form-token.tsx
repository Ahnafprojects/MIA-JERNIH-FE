import { Button } from "@/components/ui/button";
import { TokenField } from "@/components/domain/token-field";
import type { HasilGalat as HasilGalatData, HasilSukses as HasilSuksesData } from "../_tipe";
import { HasilSukses } from "./hasil-sukses";
import { HasilGalat } from "./hasil-galat";

export function FormToken({
  kodeToken,
  setKodeToken,
  memuat,
  terkunci,
  hasilSukses,
  hasilGalat,
  nomorSeri,
  onTukar,
}: {
  kodeToken: string;
  setKodeToken: (v: string) => void;
  memuat: boolean;
  terkunci: boolean;
  hasilSukses: HasilSuksesData | null;
  hasilGalat: HasilGalatData | null;
  nomorSeri?: string;
  onTukar: (kodeOverride?: string) => void;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-6 shadow-xs">
      <h2 className="font-display text-base font-bold text-ink">
        Masukkan Kode Token
      </h2>
      <p className="mt-1 text-xs text-muted">
        Angka saja. Tempel otomatis membersihkan spasi. Tekan Enter untuk mengirim.
      </p>

      <div className="my-4 flex items-center gap-2">
        <span className="font-mono text-[11px] text-muted">Token Demo:</span>
        <button
          type="button"
          disabled={terkunci || memuat}
          onClick={() => {
            setKodeToken("1111");
            onTukar("1111");
          }}
          className="rounded-[2px] border border-line bg-soft px-2.5 py-1 font-mono text-xs font-bold text-brand-700 hover:bg-brand-500/10 dark:text-accent"
        >
          1111 (+5 L)
        </button>
        <button
          type="button"
          disabled={terkunci || memuat}
          onClick={() => {
            setKodeToken("2222");
            onTukar("2222");
          }}
          className="rounded-[2px] border border-line bg-soft px-2.5 py-1 font-mono text-xs font-bold text-brand-700 hover:bg-brand-500/10 dark:text-accent"
        >
          2222 (+10 L)
        </button>
      </div>

      <div className="space-y-4">
        <TokenField
          nilai={kodeToken}
          onChange={setKodeToken}
          onKirim={() => onTukar()}
          nonaktif={terkunci || memuat}
          galat={hasilGalat ? hasilGalat.pesan : null}
        />

        <Button
          type="button"
          varian="utama"
          blok
          memuat={memuat}
          disabled={terkunci || kodeToken.length < 4}
          onClick={() => onTukar()}
        >
          Tukarkan ke Meter
        </Button>
      </div>

      {hasilSukses ? (
        <HasilSukses hasilSukses={hasilSukses} nomorSeri={nomorSeri} />
      ) : null}

      {hasilGalat ? <HasilGalat hasilGalat={hasilGalat} /> : null}
    </div>
  );
}
