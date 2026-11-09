"use client";

import { useToken } from "./_hooks/use-token";
import { PemilihMeter } from "./_bagian/pemilih-meter";
import { BannerLockout } from "./_bagian/banner-lockout";
import { FormToken } from "./_bagian/form-token";
import { TokenBertopeng } from "./_bagian/token-bertopeng";
import { KeypadMeter } from "./_bagian/keypad-meter";
import { KepalaToken } from "./_bagian/kepala-token";

export default function HalamanToken() {
  const token = useToken();
  const terkunci = Boolean(token.terkunciSampai);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <KepalaToken />

      <PemilihMeter
        meter={token.meter}
        pilihMeter={token.pilihMeter}
        meterAktifId={token.meterAktif?.id}
      />

      {token.terkunciSampai ? (
        <BannerLockout sisaWaktuKunci={token.sisaWaktuKunci} />
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <FormToken
            kodeToken={token.kodeToken}
            setKodeToken={token.setKodeToken}
            memuat={token.memuat}
            terkunci={terkunci}
            hasilSukses={token.hasilSukses}
            hasilGalat={token.hasilGalat}
            nomorSeri={token.meterAktif?.nomorSeri}
            onTukar={token.handleTukarToken}
          />

          <TokenBertopeng
            daftarToken={token.daftarToken}
            memuatTokenList={token.memuatTokenList}
          />
        </div>

        <div className="space-y-6">
          <KeypadMeter
            kodeToken={token.kodeToken}
            saldoLiter={token.meterAktif?.saldoLiter ?? 0}
            onTombol={token.handleTekanKeypad}
          />
        </div>
      </div>
    </div>
  );
}
