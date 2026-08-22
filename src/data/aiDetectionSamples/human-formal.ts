export interface DetectionSample {
  id: string;
  title: string;
  category: string;
  label: 'human' | 'ai';
  text: string;
}

export const HUMAN_FORMAL_SAMPLES: DetectionSample[] = [
  {
    id: 'hf-1',
    title: 'Laporan Evaluasi Kebijakan Publik Kota Bandung',
    category: 'human-formal',
    label: 'human',
    text: `Pemerintah Kota Bandung pada tanggal 14 Maret 2025 merilis laporan audit terkait efektivitas sistem transportasi terpadu. Berdasarkan data dari Dinas Perhubungan, tercatat sebanyak 42.500 penumpang harian memanfaatkan koridor utama Trans Metro Bandung sepanjang semester kedua. Oleh karena itu, pengalokasian anggaran subsidi sebesar Rp18,5 miliar dinilai tepat sasaran oleh Badan Pemeriksa Keuangan Daerah.

Namun demikian, sejumlah kendala teknis masih ditemukan di lapangan, terutama menyangkut waktu tunggu di halte perintis yang mencapai 35 menit pada jam sibuk pukul 07.00 hingga 08.30 WIB. Kepala Dinas Perhubungan Kota Bandung, Ir. Bambang Suhendra, menyatakan bahwa penambahan 15 armada bus listrik baru akan direalisasikan pada triwulan ketiga tahun ini guna memangkas antrean.

Selain itu, integrasi tarif antara bus kota dan angkutan pengumpan (feeder) masih menunggu persetujuan regulasi dari DPRD Provinsi Jawa Barat. Dengan demikian, sinkronisasi tiket elektronik baru mencakup 68% dari total 12 rute aktif yang direncanakan. Evaluasi menyeluruh dijadwalkan selesai sebelum peresmian stasiun integrasi Cicaheum pada bulan November mendatang.`,
  },
  {
    id: 'hf-2',
    title: 'Analisis Finansial Kuartal IV PT Sumber Makmur',
    category: 'human-formal',
    label: 'human',
    text: `PT Sumber Makmur Tbk membukukan pendapatan bersih sebesar Rp4,2 triliun pada tahun buku 2024, mengalami kenaikan sebesar 12,4% dibandingkan periode yang sama tahun sebelumnya. Pertumbuhan ini didorong oleh ekspansi jaringan distribusi di Jawa Timur dan Sulawesi Selatan yang menyumbang 41% dari total volume penjualan produk makanan olahan.

Sehubungan dengan peningkatan beban pokok penjualan akibat kenaikan harga bahan baku gandum impor sebesar 8,5%, manajemen menerapkan program efisiensi operasional di pabrik Cikarang. Langkah tersebut berhasil menekan margin operasional tetap stabil di level 14,2%.

Oleh karena itu, Dewan Direksi merekomendasikan pembagian dividen tunai sebesar Rp120 per lembar saham dalam Rapat Umum Pemegang Saham Tahunan yang akan diselenggarakan pada 28 Mei 2025 di Jakarta. Keputusan ini mempertimbangkan kecukupan arus kas bebas perseroan yang mencapai Rp650 miliar pada akhir Desember.`,
  },
];
