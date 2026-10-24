/**
 * Kepala seksi halaman statistik: garis takar, judul, lalu satu kalimat
 * pengantar.
 *
 * Garis takarnya bukan hiasan yang bisa ditempel di halaman mana pun — ia
 * meniru garis ukur pada gelas takar, dan halaman ini memang tentang
 * mengukur air. Dipisah ke sini supaya seksi yang ditambahkan belakangan
 * tidak pelan-pelan melenceng dari yang sudah ada.
 */
export function JudulSeksi({
  judul,
  children,
}: {
  judul: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div aria-hidden className="takar h-2.5 border-t border-line" />
      <h2 className="mt-7 font-display text-[1.5rem] leading-tight font-semibold tracking-[-0.02em]">
        {judul}
      </h2>
      {children ? (
        <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
          {children}
        </p>
      ) : null}
    </>
  );
}
