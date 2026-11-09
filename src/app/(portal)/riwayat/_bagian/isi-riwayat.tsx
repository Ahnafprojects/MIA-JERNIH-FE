import type { useRiwayat } from "../_hooks/use-riwayat";
import { FilterRiwayat } from "./filter-riwayat";
import { TabelRiwayat } from "./tabel-riwayat";
import { PaginasiRiwayat } from "./paginasi-riwayat";
import { PanelStruk } from "./panel-struk";
import { SheetStruk } from "./sheet-struk";

export function IsiRiwayat({ riwayat }: { riwayat: ReturnType<typeof useRiwayat> }) {
  return (
    <>
      <FilterRiwayat
        filterStatus={riwayat.filterStatus}
        setFilterStatus={riwayat.setFilterStatus}
        setHalaman={riwayat.setHalaman}
        kataKunci={riwayat.kataKunci}
        setKataKunci={riwayat.setKataKunci}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TabelRiwayat
            memuat={riwayat.memuat}
            dataTersaring={riwayat.dataTersaring}
            transaksiTerpilihId={riwayat.transaksiTerpilih?.id}
            onKlikBaris={riwayat.handlePilihBaris}
          />

          <PaginasiRiwayat
            halaman={riwayat.halaman}
            totalData={riwayat.totalData}
            setHalaman={riwayat.setHalaman}
          />
        </div>

        {/* `print:block`: lihat catatan di `panel-struk.tsx` — lebar kertas
            A4 berada di bawah ambang `lg`, jadi tanpa ini panel justru
            tersembunyi tepat saat dicetak. */}
        <div className="hidden lg:block print:block">
          <PanelStruk
            transaksiTerpilih={riwayat.transaksiTerpilih}
            pesanEmail={riwayat.pesanEmail}
            sheetBuka={riwayat.sheetBuka}
            onUnduhStrukPdf={riwayat.handleUnduhStrukPdf}
            onKirimEmailStruk={riwayat.handleKirimEmailStruk}
          />
        </div>
      </div>

      {riwayat.sheetBuka && riwayat.transaksiTerpilih ? (
        <SheetStruk
          transaksiTerpilih={riwayat.transaksiTerpilih}
          onTutup={() => riwayat.setSheetBuka(false)}
          onUnduhStrukPdf={riwayat.handleUnduhStrukPdf}
        />
      ) : null}
    </>
  );
}
