export interface DetectionSample {
  id: string;
  title: string;
  category: string;
  label: 'human' | 'ai';
  split: 'train' | 'test';
  text: string;
}

export const HUMAN_FORMAL_SAMPLES: DetectionSample[] = [
  {
    id: 'hf-1',
    title: 'Laporan Evaluasi Kebijakan Publik Kota Bandung',
    category: 'human-formal',
    label: 'human',
    split: 'train',
    text: `Pemerintah Kota Bandung pada tanggal 14 Maret 2025 merilis laporan audit terkait efektivitas sistem transportasi terpadu. Berdasarkan data dari Dinas Perhubungan, tercatat sebanyak 42.500 penumpang harian memanfaatkan koridor utama Trans Metro Bandung sepanjang semester kedua. Oleh karena itu, pengalokasian anggaran subsidi sebesar Rp18,5 miliar dinilai tepat sasaran oleh Badan Pemeriksa Keuangan Daerah.

Namun demikian, sejumlah kendala teknis masih ditemukan di lapangan, terutama menyangkut waktu tunggu di halte perintis yang mencapai 35 menit pada jam sibuk pukul 07.00 hingga 08.30 WIB. Kepala Dinas Perhubungan Kota Bandung, Ir. Bambang Suhendra, menyatakan bahwa penambahan 15 armada bus listrik baru akan direalisasikan pada triwulan ketiga tahun ini guna memangkas antrean.

Selain itu, integrasi tarif antara bus kota dan angkutan pengumpan (feeder) masih menunggu persetujuan regulasi dari DPRD Provinsi Jawa Barat. Dengan demikian, sinkronisasi tiket elektronik baru mencakup 68% dari total 12 rute aktif yang direncanakan. Evaluasi menyeluruh dijadwalkan selesai sebelum peresmian stasiun integrasi Cicaheum pada bulan November mendatang.`,
  },
  {
    id: 'hf-2',
    title: 'Analisis Finansial Kuartal IV PT Sumber Makmur',
    category: 'human-formal',
    label: 'human',
    split: 'train',
    text: `PT Sumber Makmur Tbk membukukan pendapatan bersih sebesar Rp4,2 triliun pada tahun buku 2024, mengalami kenaikan sebesar 12,4% dibandingkan periode yang sama tahun sebelumnya. Pertumbuhan ini didorong oleh ekspansi jaringan distribusi di Jawa Timur dan Sulawesi Selatan yang menyumbang 41% dari total volume penjualan produk makanan olahan perseroan di pasar domestik.

Sehubungan dengan peningkatan beban pokok penjualan akibat kenaikan harga bahan baku gandum impor sebesar 8,5%, manajemen menerapkan program efisiensi operasional di pabrik Cikarang. Langkah strategis tersebut berhasil menekan margin operasional tetap stabil di level 14,2% hingga penutupan kuartal keempat tahun buku 2024.

Oleh karena itu, Dewan Direksi merekomendasikan pembagian dividen tunai sebesar Rp120 per lembar saham dalam Rapat Umum Pemegang Saham Tahunan yang akan diselenggarakan pada 28 Mei 2025 di Hotel Mulia Jakarta. Keputusan ini mempertimbangkan kecukupan arus kas bebas perseroan yang mencapai Rp650 miliar pada akhir Desember tahun lalu untuk mendukung rencana ekspansi gudang pendingin baru di Surabaya.`,
  },
  {
    id: 'hf-3',
    title: 'Kajian Akademis Dampak Perubahan Iklim Pertanian Padi Jawa Tengah',
    category: 'human-formal',
    label: 'human',
    split: 'test',
    text: `Penelitian lapangan yang dilakukan oleh tim agroklimatologi Universitas Diponegoro di 18 desa sentra padi Kabupaten Demak menunjukkan pergeseran awal musim tanam sebesar 22 hari selama kurun waktu 2018-2024. Variabilitas curah hujan ekstrem yang tercatat di Stasiun Klimatologi Semarang mencapai 340 mm per dasarian pada Februari 2024, menyebabkan luapan Sungai Wulan merendam 4.200 hektare sawah siap panen di kawasan pesisir utara.

Berdasarkan analisis regresi spasial yang kami olah dari data satelit Sentinel-2, penurunan produktivitas gabah kering panen berkorelasi kuat dengan anomali suhu malam hari (r = -0.68, p < 0.01). Petani setempat merespons kondisi ini dengan mempercepat jadwal tabur benih varietas Ciherang dan Inpari 32, meski ketersediaan pupuk urea bersubsidi sering kali terlambat tiba di kios distributor resmi tingkat kecamatan.

Hasil wawancara mendalam dengan 45 ketua kelompok tani menegaskan perlunya revitalisasi tanggul primer di hilir serta kalibrasi ulang kalender tanam terpadu oleh Badan Meteorologi, Klimatologi, dan Geofisika sebelum musim rendeng berikutnya dimulai pada akhir Oktober mendatang guna mencegah kerugian finansial yang berulang bagi masyarakat petani.`,
  },
  {
    id: 'hf-4',
    title: 'Laporan Jurnalistik Kebijakan Tarif Listrik Industri',
    category: 'human-formal',
    label: 'human',
    split: 'test',
    text: `Kementerian Energi dan Sumber Daya Mineral memutuskan mempertahankan tarif tenaga listrik nonsubsidi untuk 13 golongan pelanggan sepanjang triwulan pertama 2025. Langkah ini diambil guna menjaga daya beli masyarakat dan daya saing sektor industri manufaktur di tengah volatilitas kurs rupiah yang bergerak di kisaran Rp15.800 per dolar AS.

Pelaksana Tugas Direktur Jenderal Ketenagalistrikan, Dadan Kusdiana, menyampaikan dalam konferensi pers di Jakarta bahwa formula penyesuaian tarif mempertimbangkan empat parameter makro ekonomi: kurs, harga minyak mentah Indonesia (ICP), inflasi bulanan, serta harga batu bara acuan. Dari penghitungan tersebut, realisasi ICP tercatat 78,5 dolar AS per barel, sedikit di bawah asumsi APBN sebesar 82 dolar AS.

Meski demikian, Asosiasi Pertekstilan Indonesia (API) meminta pemerintah mempertimbangkan insentif diskon tarif listrik pada jam beban puncak antara pukul 18.00 hingga 22.00 WIB untuk menopang utilitas pabrik tenun di Jawa Barat dan Jawa Tengah. Menanggapi aspirasi tersebut, PT PLN Persero menyatakan kesiapannya mengkaji skema tarif fleksibel demi menjaga kelangsungan operasional industri padat karya nasional.`,
  },
];
