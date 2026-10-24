/**
 * SUMBER DATA KONSOL SEMENTARA — HAPUS SETELAH BACKEND SIAP.
 *
 * Bentuk jawabannya mengikuti kontrak di issue BE#8 (konsol: dashboard,
 * pelanggan, perangkat) dan BE#10 (GeoJSON peta). Cara mematikannya nanti:
 * arahkan `NEXT_PUBLIC_API_URL` ke backend sungguhan lalu hapus seluruh
 * folder `src/app/api/admin`.
 *
 * ── Kenapa angkanya dibangkitkan, bukan ditulis tangan ────────────────
 *
 * Konsol menampilkan 8.219 pelanggan dengan paginasi, penyaringan, dan
 * pengurutan. Daftar yang ditulis tangan tidak mungkin sebanyak itu, dan
 * daftar pendek yang diulang-ulang langsung terlihat palsu begitu juri
 * menekan halaman 2.
 *
 * ── Kenapa acaknya berbenih (seeded) ──────────────────────────────────
 *
 * `Math.random()` membangkitkan isi baru di SETIAP permintaan. Akibatnya
 * halaman 2 berisi orang yang berbeda dari halaman 1, jumlah pada penyaring
 * tidak pernah cocok dengan jumlah baris, dan membuka detail pelanggan
 * menampilkan orang lain daripada yang diklik. Dengan benih tetap, pelanggan
 * ke-417 selalu orang yang sama — persis seperti basis data sungguhan.
 */

/** PRNG mulberry32 — kecil, cepat, dan hasilnya sama untuk benih yang sama. */
function acak(benih: number): () => number {
  let a = benih >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const ZONA_KONSOL = [
  { id: "z1", nama: "Bandung Timur", porsi: 0.382 },
  { id: "z2", nama: "Cileunyi", porsi: 0.245 },
  { id: "z3", nama: "Cimahi", porsi: 0.229 },
  { id: "z4", nama: "Sumedang", porsi: 0.144 },
] as const;

/** Pusat tiap zona, [bujur, lintang] — dipakai menyebar pin meter. */
const PUSAT: Record<string, [number, number]> = {
  z1: [107.682, -6.928],
  z2: [107.784, -6.936],
  z3: [107.527, -6.874],
  z4: [107.932, -6.838],
};

/*
 * Kolam namanya SENGAJA besar: 104 × 96 = 9.984 kombinasi untuk 8.219
 * pelanggan.
 *
 * Versi pertama hanya 28 × 18 = 504 kombinasi. Secara statistik itu
 * tampak cukup, tapi daftar pelanggan diurutkan A–Z secara bawaan — dan
 * dengan 504 kombinasi tiap nama muncul rata-rata enam belas kali, lalu
 * keenam belasnya berbaris berurutan di halaman pertama. Yang terlihat
 * juri: dua puluh tiga baris bernama "Agus Firdaus". Datanya tidak salah,
 * tapi tampak dikarang — dan untuk halaman ini itu sama buruknya.
 */
const DEPAN = [
  "Agus", "Siti", "Budi", "Dewi", "Rizky", "Nur", "Eko", "Ani", "Dian",
  "Yusuf", "Rina", "Hendra", "Lilis", "Asep", "Wati", "Iwan", "Tuti",
  "Bambang", "Sri", "Deni", "Mega", "Cahyo", "Indah", "Rudi", "Nia",
  "Fajar", "Lina", "Joko", "Ahmad", "Ratna", "Slamet", "Yuni", "Hasan",
  "Endang", "Teguh", "Fitri", "Surya", "Maya", "Imam", "Dedi", "Novi",
  "Arif", "Puji", "Gunawan", "Ika", "Sutrisno", "Reni", "Heri", "Umi",
  "Bayu", "Ella", "Dimas", "Tari", "Yanto", "Hesti", "Rohman", "Lia",
  "Didik", "Anis", "Priyo", "Vina", "Kusno", "Dina", "Sahrul", "Melati",
  "Ridwan", "Astri", "Zainal", "Wulan", "Burhan", "Ayu", "Mulyadi",
  "Retno", "Taufik", "Citra", "Sugeng", "Hana", "Darmawan", "Ira",
  "Nanang", "Sinta", "Kurnia", "Rosi", "Gatot", "Yeni", "Abdul", "Tika",
  "Sopian", "Laras", "Marwan", "Dewa", "Hadi", "Intan", "Rahmat",
  "Kartika", "Sulaiman", "Wahyu", "Dahlia", "Firman", "Rosmala", "Edi",
  "Prita", "Anwar", "Kasih",
];
const BELAKANG = [
  "Suryana", "Sukmana", "Wijaya", "Wiranata", "Pratama", "Atmaja",
  "Saputra", "Maulana", "Suwandi", "Setiawan", "Kurniawan", "Permana",
  "Hidayat", "Gunawan", "Sulistyo", "Padmanegara", "Firdaus", "Hartono",
  "Siregar", "Nugroho", "Haryono", "Santoso", "Wibowo", "Dirgantara",
  "Syahputra", "Kusnadi", "Prasetyo", "Sastra", "Mahendra", "Trisna",
  "Hakim", "Wardana", "Subagja", "Suharto", "Ramdani", "Kuncoro",
  "Kusuma", "Soemarno", "Herlambang", "Hadiwijaya", "Sanjaya", "Soetomo",
  "Baskoro", "Brotodiningrat", "Wiguna", "Sudarsono", "Juliansyah", "Widjojo",
  "Pangestu", "Notodihardjo", "Simatupang", "Sumarno", "Reksodiputro", "Kencana",
  "Sihombing", "Nasution", "Hutapea", "Panjaitan", "Tanjung", "Harahap",
  "Situmorang", "Lubis", "Ginting", "Sembiring", "Manurung", "Silaban",
  "Pasaribu", "Simanjuntak", "Napitupulu", "Sitorus", "Hutagalung",
  "Purba", "Barus", "Tarigan", "Sinaga", "Rajagukguk", "Aritonang",
  "Sagala", "Butarbutar", "Siagian", "Hasibuan", "Dalimunthe",
  "Pohan", "Rangkuti", "Batubara", "Daulay", "Matondang", "Siahaan",
  "Nainggolan", "Tampubolon", "Samosir", "Gultom", "Marpaung",
  "Situmeang", "Sidabutar", "Hombing", "Parhusip",
];

export interface PelangganKonsol {
  id: string;
  nama: string;
  zonaId: string;
  zona: string;
  saldoL: number;
  debitLpm: number;
  saklarOn: boolean;
  relayOn: boolean;
  online: boolean;
  adaInsiden: boolean;
  koordinat: [number, number] | null;
  terakhirLapor: string;
}

/** Status tunggal sebuah meter, DITURUNKAN — bukan medan tersendiri. */
export type StatusMeter = "normal" | "alarm" | "insiden" | "offline";

/*
 * Satu fungsi, satu sumber kebenaran.
 *
 * Urutannya disengaja dan tidak boleh diubah tanpa alasan: meter yang mati
 * tidak bisa dipercaya alarmnya, jadi `offline` mengalahkan segalanya;
 * insiden jaringan lebih genting daripada saldo satu rumah. Kalau peta dan
 * legenda memakai aturan yang sedikit berbeda, jumlah pin dan angka legenda
 * akan berselisih — dan itu hal pertama yang dihitung ulang orang.
 */
export function statusMeter(p: PelangganKonsol): StatusMeter {
  if (!p.online) return "offline";
  if (p.adaInsiden) return "insiden";
  if (p.saldoL <= 5) return "alarm";
  return "normal";
}

const JUMLAH = 8219;

/** Dibangkitkan sekali per proses, lalu dipakai ulang. */
let simpanan: PelangganKonsol[] | null = null;

export function semuaPelanggan(): PelangganKonsol[] {
  if (simpanan) return simpanan;

  const r = acak(20261024);
  const daftar: PelangganKonsol[] = [];

  // Batas kumulatif porsi zona, supaya sebarannya cocok dengan halaman publik.
  const batas: [string, string, number][] = [];
  let jalan = 0;
  for (const z of ZONA_KONSOL) {
    jalan += z.porsi;
    batas.push([z.id, z.nama, jalan]);
  }

  for (let i = 0; i < JUMLAH; i++) {
    const u = r();
    const zona = batas.find(([, , b]) => u <= b) ?? batas[batas.length - 1];
    const [zonaId, namaZona] = zona;

    const online = r() > 0.043;
    const saklarOn = r() > 0.06;

    /*
     * Saldo memakai sebaran yang berat di bawah, bukan rata.
     *
     * Dengan sebaran rata, hanya ~0,5% pelanggan akan punya saldo ≤ 5 L dan
     * penyaring "saldo menipis" nyaris selalu kosong — padahal justru layar
     * itu yang dipakai petugas tiap pagi. Pangkat tiga menumpuk hasilnya di
     * dekat nol, yang juga memang bentuk sebaran saldo prabayar sungguhan.
     */
    const v = r();
    const saldoL = Math.round(v * v * v * 9800 * 100) / 100;

    const relayOn = saklarOn && saldoL > 0 && online;

    /*
     * Debit 1,2–13,8 L/mnt, bukan 0–4,2.
     *
     * Batas lama 4,2 membuat seluruh dua belas baris "pelanggan live" di
     * dashboard menampilkan 4,2 — bukan karena tampilannya salah, tapi
     * karena endpoint mengurutkan dua belas teratas menurut debit dan
     * ratusan pelanggan mentok di nilai puncak yang sama. Tabel yang
     * seluruh kolomnya berisi angka identik terbaca sebagai data mati.
     *
     * Kisarannya juga lebih benar: keran rumah tangga mengalir sekitar
     * 6–12 L/mnt, dan 4,2 L/mnt adalah aliran yang nyaris tersendat.
     */
    const debitLpm =
      relayOn && r() > 0.45 ? Math.round((1.2 + r() * 12.6) * 10) / 10 : 0;
    const adaInsiden = r() < 0.012;

    /*
     * Sebaran MELINGKAR dengan kepadatan menurun ke tepi, bukan merata
     * dalam kotak.
     *
     * Versi pertama mengacak bujur dan lintang masing-masing di rentang
     * ±0,055°, dan hasilnya di peta adalah empat gerombolan PERSEGI dengan
     * tepi lurus dan sudut tajam. Permukiman tidak pernah berbentuk begitu;
     * begitu dilihat di peta, langsung terbaca sebagai titik yang ditabur
     * program.
     *
     * Koordinat kutub memperbaikinya: sudutnya merata, sedangkan jaraknya
     * dipangkatkan 1,6 sehingga titiknya menumpuk di dekat pusat dan menipis
     * ke pinggir — bentuk kota sungguhan, padat di tengah lalu meluruh.
     */
    const [bx, by] = PUSAT[zonaId];
    const punyaKoordinat = r() > 0.018;
    const sudut = r() * Math.PI * 2;
    const jarak = Math.pow(r(), 1.6) * 0.058;
    const koordinat: [number, number] | null = punyaKoordinat
      ? [
          Math.round((bx + Math.cos(sudut) * jarak) * 1e5) / 1e5,
          Math.round((by + Math.sin(sudut) * jarak * 0.78) * 1e5) / 1e5,
        ]
      : null;

    const nama = `${DEPAN[Math.floor(r() * DEPAN.length)]} ${
      BELAKANG[Math.floor(r() * BELAKANG.length)]
    }`;

    daftar.push({
      id: `JRN-${String(10000 + i)}`,
      nama,
      zonaId,
      zona: namaZona,
      saldoL,
      debitLpm,
      saklarOn,
      relayOn,
      online,
      adaInsiden,
      koordinat,
      terakhirLapor: new Date(
        Date.now() - Math.floor(r() * (online ? 180 : 86400)) * 1000,
      ).toISOString(),
    });
  }

  simpanan = daftar;
  return daftar;
}

/** Jumlah per status — dipakai legenda peta DAN keping penyaring. */
export function hitungStatus(daftar: PelangganKonsol[]) {
  const h: Record<StatusMeter, number> = {
    normal: 0,
    alarm: 0,
    insiden: 0,
    offline: 0,
  };
  for (const p of daftar) h[statusMeter(p)] += 1;
  return h;
}
