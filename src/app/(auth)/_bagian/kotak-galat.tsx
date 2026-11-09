/**
 * Tempat pesan galat pada formulir auth.
 *
 * ── Kenapa ruangnya disisihkan permanen ───────────────────────────────
 *
 * Versi sebelumnya merender kotak galat hanya ketika ada galat, di atas
 * formulir. Akibatnya begitu pesannya muncul, seluruh isi di bawahnya —
 * termasuk tombol kirim — terdorong ke bawah beberapa puluh piksel. Orang
 * yang baru saja menekan tombol lalu menekannya lagi akan menekan tempat
 * yang sudah bukan tombol, dan pada formulir masuk itu berarti mencoba
 * lagi dengan kata sandi yang sama tanpa sadar.
 *
 * Jadi tingginya disisihkan sejak awal, kosong atau tidak. Harganya satu
 * baris ruang kosong di keadaan normal; imbalannya tidak ada apa pun yang
 * bergerak tepat pada saat orang sedang menargetkan sesuatu.
 *
 * Tingginya 2,75rem — DIUKUR, bukan dikira-kira. Galat satu baris pada
 * ukuran teks ini menempati 43px; 44px cukup menampungnya tanpa menyisakan
 * rongga lebih dari yang perlu. Angka pertama yang dipakai, 3,5rem,
 * menyisihkan 56px dan rongganya terlihat jelas sebagai lubang kosong di
 * atas kolom email.
 *
 * Jujur soal batasnya: pesan yang lebih panjang dari satu baris tetap
 * menambah tinggi. Yang dijamin di sini keadaan yang paling sering terjadi
 * — "Email atau kata sandi salah" dan sejenisnya — bukan semua kemungkinan.
 */
export function KotakGalat({ pesan }: { pesan: string | null }) {
  return (
    <div className="min-h-[2.75rem]" aria-live="polite">
      {pesan ? (
        <div
          role="alert"
          className="rounded-[10px] border border-danger/40 bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed font-medium text-danger shadow-[var(--kedalaman-1)]"
        >
          {pesan}
        </div>
      ) : null}
    </div>
  );
}
