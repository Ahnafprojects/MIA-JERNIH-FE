import { liter } from "@/lib/format";

/**
 * Angka meter: volume total yang pernah tercatat.
 *
 * ── Kenapa tinggal satu angka ─────────────────────────────────────────
 *
 * Kartu ini dulu memuat empat baris: versi firmware, volume, kalibrasi
 * sensor, dan kekuatan sinyal. Tiga di antaranya dibuang, dan alasannya
 * bukan kerapian.
 *
 * Jernih adalah karya bertema TRANSPARANSI LAYANAN AIR, dan yang
 * dipertanggungjawabkannya kepada warga adalah air dan uang — bukan
 * perangkat kerasnya. Versi firmware, kalibrasi pulsa, dan RSSI tidak
 * pernah menjawab satu pun pertanyaan yang dibawa warga ke halaman ini:
 * berapa sisa air saya, kenapa tidak mengalir, ke mana perginya. Ketiganya
 * urusan teknisi, dan menaruhnya di layar warga hanya menambah angka yang
 * terlihat penting tanpa bisa ditindaklanjuti siapa pun yang membacanya.
 *
 * Volume total bertahan karena ia justru paling bisa diperiksa: angka yang
 * sama tertera di badan meter fisik, jadi warga bisa mencocokkannya sendiri.
 * Itulah bentuk transparansi yang dijanjikan nama produk ini.
 *
 * Layar LCD dan simulasi keypad TETAP ADA dan itu disengaja — keduanya yang
 * benar-benar disentuh warga saat mengisi token, jadi menampilkannya
 * membantu orang mengenali alat di rumahnya. Batasnya di situ: yang dipakai
 * warga ditampilkan, yang hanya dipakai teknisi tidak.
 */
export function SpesifikasiMeter({ volumeTotalL }: { volumeTotalL?: number }) {
  return (
    <div className="border-t border-line pt-4 font-mono text-xs text-muted">
      <span>Volume total terukur:</span>
      <p className="font-bold text-ink">
        {typeof volumeTotalL === "number" ? liter(volumeTotalL, 1) : "—"}
      </p>
      <p className="mt-1 font-sans text-[11px] text-muted">
        Angka ini sama dengan yang tertera di badan meter Anda.
      </p>
    </div>
  );
}
