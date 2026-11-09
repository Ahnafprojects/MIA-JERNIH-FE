import { Info } from "lucide-react";
import { liter, tanggal } from "@/lib/format";
import type { TokenBelumDipakai } from "../_tipe";

export function TokenBertopeng({
  daftarToken,
  memuatTokenList,
}: {
  daftarToken: TokenBelumDipakai[];
  memuatTokenList: boolean;
}) {
  return (
    <div className="rounded-[4px] border border-line bg-surface p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h3 className="font-display text-sm font-bold text-ink">
            Token Belum Digunakan
          </h3>
          <p className="text-[11px] text-muted">
            Tampil bertopeng sebagai pengingat. Kode utuh ada pada email struk Anda.
          </p>
        </div>
        <span className="font-mono text-xs font-bold text-muted">
          {daftarToken.length} Token
        </span>
      </div>

      {memuatTokenList ? (
        <div className="py-4 text-center font-mono text-xs text-muted">
          Memuat daftar token...
        </div>
      ) : daftarToken.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted">
          Tidak ada token aktif yang belum digunakan.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {daftarToken.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2.5 text-xs">
              <div>
                <span className="font-mono font-semibold tracking-wider text-ink select-none">
                  {t.kodeBertopeng}
                </span>
                <p className="text-[10px] text-muted">
                  Diterbitkan: {tanggal(t.dibuatPada)}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-brand-700 dark:text-accent">
                  +{liter(t.nilaiL, 0)}
                </span>
                <p className="text-[10px] text-muted">
                  Batas: {tanggal(t.kedaluwarsaPada)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-start gap-1.5 rounded-[2px] bg-soft p-2.5 text-[11px] text-muted">
        <Info size={14} className="shrink-0 text-brand-600 dark:text-accent" />
        <span>
          Server tidak pernah menyimpan kode utuh demi keamanan. Kode token lengkap hanya dikirim sekali pada email konfirmasi pembelian.
        </span>
      </div>
    </div>
  );
}
