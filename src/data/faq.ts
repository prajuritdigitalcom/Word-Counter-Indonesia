export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: 'Apa itu Word Counter Indonesia?',
    answer:
      'Word Counter Indonesia adalah tool gratis berbasis web yang digunakan untuk menghitung jumlah kata, karakter, karakter tanpa spasi, kalimat, paragraf, estimasi waktu baca, serta kepadatan kata kunci (keyword density) teks Bahasa Indonesia secara realtime.',
  },
  {
    question: 'Apakah Word Counter Indonesia gratis?',
    answer:
      'Ya, 100% gratis tanpa batasan penggunaan, tanpa sistem kredit, dan tanpa biaya berlangganan apa pun.',
  },
  {
    question: 'Apakah teks saya disimpan di server?',
    answer:
      'Tidak. Semua analisis teks diproses langsung di dalam browser perangkat Anda (client-side) dan tidak pernah dikirim atau disimpan ke server mana pun untuk menjaga privasi Anda secara penuh.',
  },
  {
    question: 'Apakah bisa menghitung karakter tanpa spasi?',
    answer:
      'Ya. Tool secara otomatis menghitung total karakter keseluruhan (dengan spasi) dan total karakter murni tanpa spasi, newline, maupun tab.',
  },
  {
    question: 'Apakah bisa menghitung keyword density?',
    answer:
      'Ya. Anda cukup memasukkan kata kunci (keyword satu kata maupun frasa multi-kata) pada kolom Keyword Density, lalu sistem akan menghitung frekuensi kemunculan dan persentase kepadatannya secara akurat.',
  },
  {
    question: 'Apakah tool bisa digunakan di HP (smartphone)?',
    answer:
      'Ya. Desain Word Counter Indonesia sepenuhnya responsive dan sangat nyaman digunakan di berbagai perangkat baik smartphone Android, iPhone, tablet, laptop, maupun desktop.',
  },
  {
    question: 'Apakah perlu login atau registrasi?',
    answer:
      'Tidak. Anda tidak perlu mendaftar, memasukkan email, password, ataupun API key. Anda bisa langsung membuka halaman dan menempelkan teks.',
  },
  {
    question: 'Apakah Word Counter bisa digunakan untuk artikel SEO?',
    answer:
      'Ya. Tool ini sangat membantu blogger, copywriter, dan SEO specialist untuk mengontrol panjang konten, memeriksa distribusi kata, dan mencegah keyword stuffing. Namun perlu dicatat bahwa jumlah kata hanyalah salah satu metrik statistik konten dan bukan jaminan mutlak peringkat Google.',
  },
];
