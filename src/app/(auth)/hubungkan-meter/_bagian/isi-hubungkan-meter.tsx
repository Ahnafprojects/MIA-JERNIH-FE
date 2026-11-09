import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { useHubungkanMeter } from "../_hooks/use-hubungkan-meter";
import { PemilihMetode } from "./pemilih-metode";
import { FormIdMeter } from "./form-id-meter";
import { PemindaiQr } from "./pemindai-qr";
import { KartuMeter } from "./kartu-meter";

export function IsiHubungkanMeter({
  hubungkan,
}: {
  hubungkan: ReturnType<typeof useHubungkanMeter>;
}) {
  return (
    <>
      {hubungkan.pesanGalat ? (
        <div
          role="alert"
          className="mb-6 rounded-[3px] border border-danger/40 bg-danger/10 p-3 text-xs leading-relaxed font-medium text-danger"
        >
          <div className="flex gap-2">
            <AlertCircle size={16} className="shrink-0 text-danger" />
            <span>{hubungkan.pesanGalat}</span>
          </div>
        </div>
      ) : null}

      <PemilihMetode
        metode={hubungkan.metode}
        onPilih={(m) => {
          hubungkan.setMetode(m);
          hubungkan.setPesanGalat(null);
        }}
      />

      {hubungkan.metode === "ketik" ? (
        <FormIdMeter
          targetId={hubungkan.targetId}
          setTargetId={hubungkan.setTargetId}
          memuatCari={hubungkan.memuatCari}
          memuatHubung={hubungkan.memuatHubung}
          onCari={hubungkan.cariMeter}
        />
      ) : (
        <PemindaiQr
          izinKamera={hubungkan.izinKamera}
          onMintaIzin={hubungkan.handleMintaIzinKamera}
          onSimulasi={() => {
            hubungkan.setTargetId("P0001");
            hubungkan.cariMeter("P0001");
          }}
        />
      )}

      {hubungkan.meterDitemukan ? (
        <KartuMeter
          meterDitemukan={hubungkan.meterDitemukan}
          memuatHubung={hubungkan.memuatHubung}
          onHubungkan={hubungkan.handleHubungkan}
        />
      ) : null}

      <div className="takar-kepala mt-8 pt-4 text-center text-xs text-muted">
        <Link href="/beranda" className="text-muted hover:text-ink hover:underline">
          Lewati untuk sementara (Buka Beranda)
        </Link>
      </div>
    </>
  );
}
