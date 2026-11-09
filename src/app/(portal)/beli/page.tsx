"use client";

import { useBeli } from "./_hooks/use-beli";
import { PemilihMeter } from "./_bagian/pemilih-meter";
import { PilihanNominal } from "./_bagian/pilihan-nominal";
import { PilihanMetode } from "./_bagian/pilihan-metode";
import { Ringkasan } from "./_bagian/ringkasan";
import { KepalaBeli } from "./_bagian/kepala-beli";

export default function HalamanBeliToken() {
  const beli = useBeli();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <KepalaBeli pesanGalat={beli.pesanGalat} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PemilihMeter
            meter={beli.meter}
            meterAktifId={beli.meterAktif?.id}
            pilihMeter={beli.pilihMeter}
          />

          <PilihanNominal
            golonganNama={beli.golonganNama}
            tarifPerLiter={beli.tarifPerLiter}
            daftarPaket={beli.daftarPaket}
            modePilihan={beli.modePilihan}
            setModePilihan={beli.setModePilihan}
            literTerpilih={beli.literTerpilih}
            setLiterTerpilih={beli.setLiterTerpilih}
            inputLiterBebas={beli.inputLiterBebas}
            inputRupiahBebas={beli.inputRupiahBebas}
            handleUbahLiterBebas={beli.handleUbahLiterBebas}
            handleUbahRupiahBebas={beli.handleUbahRupiahBebas}
            totalHargaRp={beli.totalHargaRp}
          />

          <PilihanMetode metode={beli.metode} setMetode={beli.setMetode} />
        </div>

        <div>
          <Ringkasan
            nomorSeri={beli.meterAktif?.nomorSeri}
            volumeFinalL={beli.volumeFinalL}
            tarifPerLiter={beli.tarifPerLiter}
            metode={beli.metode}
            totalHargaRp={beli.totalHargaRp}
            memuatBayar={beli.memuatBayar}
            tahapBayar={beli.tahapBayar}
            onBayar={beli.handleBayar}
          />
        </div>
      </div>
    </div>
  );
}
