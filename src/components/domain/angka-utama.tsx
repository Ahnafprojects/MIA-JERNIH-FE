import { cn } from "@/lib/cn";

/**
 * Angka utama sebuah halaman.
 *
 * Satu halaman hanya boleh punya SATU angka sebesar ini. Kalau ketepatan SLA
 * dan kehilangan air adalah hal pertama yang ingin diketahui orang, ia tidak
 * boleh tampil sebagai satu kartu kecil di antara empat kartu seragam —
 * susunan seperti itu menyamaratakan yang penting dengan yang sekadar ada.
 *
 * `nilai` bertipe `string | null`. `null` berarti server TIDAK mengirim
 * angkanya dan yang tampil adalah "—". Menukarnya dengan 0 membuat nilai yang
 * belum ada terbaca sebagai hasil pengukuran.
 */
export function AngkaUtama({
  eyebrow,
  nilai,
  satuan,
  nada = "netral",
  keterangan,
  children,
}: {
  eyebrow: string;
  nilai: string | null;
  satuan?: string;
  nada?: "netral" | "brand" | "sukses" | "peringatan" | "bahaya";
  keterangan?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const warna = {
    netral: "text-ink",
    brand: "text-brand-600",
    sukses: "text-success",
    peringatan: "text-warn",
    bahaya: "text-danger",
  }[nada];

  return (
    <div>
      <p className="eyebrow text-muted">{eyebrow}</p>
      <p className="mt-4 flex items-baseline gap-1.5">
        <span
          className={cn(
            "tabular font-mono text-[clamp(3rem,11vw,4.5rem)] leading-[0.82] font-bold",
            nilai === null ? "text-muted" : warna,
          )}
        >
          {nilai ?? "—"}
        </span>
        {satuan && nilai !== null ? (
          <span className="font-mono text-[1.2rem] font-semibold text-muted">
            {satuan}
          </span>
        ) : null}
      </p>
      {keterangan ? (
        <p className="mt-4 max-w-[36ch] text-[13.5px] leading-relaxed text-muted">
          {keterangan}
        </p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
