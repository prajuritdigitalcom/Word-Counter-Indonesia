import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export const SeoArticleSection: React.FC = () => {
  return (
    <section
      id="panduan"
      className="w-full pt-8 pb-4 border-t border-slate-200 space-y-8 text-slate-700"
      aria-label="Panduan Lengkap Word Counter dan Analisis Konten"
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-[#fe4c6f] text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Panduan Penulisan & SEO</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Panduan Analisis Teks & Penghitung Kata Online
        </h2>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          Pelajari bagaimana statistik teks, kepadatan kata kunci, dan estimasi waktu baca membantu meningkatkan mutu artikel, tugas kuliah, maupun copywriting digital Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
        {/* Section 1: Apa Itu Word Counter? */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            Apa Itu Word Counter?
          </h3>
          <p className="text-slate-600">
            <strong>Word Counter</strong> adalah alat bantu digital yang dirancang untuk menghitung total kata, karakter, kalimat, dan paragraf dalam suatu naskah secara instan. Di era modern, penghitung kata bukan sekadar alat kalkulasi angka mentah, melainkan instrumen penting bagi penulis naskah, blogger, mahasiswa, hingga editor profesional untuk memantau ritme tulisan dan kepatuhan terhadap pedoman format tertentu.
          </p>
          <p className="text-slate-600">
            Aplikasi <em>Word Counter Indonesia</em> dari Prajurit Digital bekerja sepenuhnya di sisi peramban (client-side), sehingga teks Anda dijamin aman tanpa risiko tersimpan di server pihak ketiga.
          </p>
        </div>

        {/* Section 2: Mengapa Menghitung Jumlah Kata Penting? */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            Mengapa Menghitung Jumlah Kata Penting?
          </h3>
          <p className="text-slate-600">
            Setiap medium penulisan memiliki batas dan ekspektasi panjang yang berbeda:
          </p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-[#fe4c6f] font-bold">•</span>
              <span><strong>Artikel Blog & SEO:</strong> Membutuhkan kedalaman topik (umumnya 800–2.000 kata) agar pembahasan tuntas.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#fe4c6f] font-bold">•</span>
              <span><strong>Tugas Akademik:</strong> Sering membatasi abstrak antara 200–250 kata dan essay dalam kuota tertentu.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#fe4c6f] font-bold">•</span>
              <span><strong>Copywriting & Medsos:</strong> Karakter terbatas pada Twitter/X (280 karakter), Meta Title (50–60 karakter), dan Instagram caption.</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Cara Menghitung Kata dalam Artikel */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            Cara Menggunakan Tool
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
            <li><strong>Salin teks</strong> naskah tulisan Anda dari Word, Google Docs, atau catatan.</li>
            <li><strong>Tempel (paste)</strong> langsung ke dalam kotak penulisan di atas.</li>
            <li><strong>Lihat hasil statistik</strong> yang langsung diperbarui secara realtime.</li>
            <li><strong>Masukkan kata kunci</strong> untuk mengecek frekuensi kemunculan dan persentasenya.</li>
            <li>Klik tombol <strong>Salin Statistik</strong> untuk membagikan ringkasan laporan.</li>
          </ol>
        </div>

        {/* Section 4: Word Counter untuk Artikel SEO */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            Word Counter untuk Artikel SEO
          </h3>
          <p className="text-slate-600">
            Dalam Search Engine Optimization (SEO), jumlah kata sering dijadikan patokan untuk mengukur komprehensivitas konten. Namun, <em>panjang artikel bukanlah jaminan otomatis peringkat 1 di Google</em>. Algoritma mesin pencari mengutamakan kepuasan pengguna (user intent) dan relevansi.
          </p>
          <p className="text-slate-600">
            Gunakan fitur <strong>Keyword Density</strong> untuk memastikan kata kunci utama tersebar secara alami (ideal 1%–2,5%) tanpa terjebak praktik <em>keyword stuffing</em>.
          </p>
        </div>
      </div>

      {/* Section 5: Word Count, Character Count, dan Reading Time */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Word Count, Character Count, dan Reading Time
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <strong className="block text-slate-800 text-sm mb-1 font-semibold">Jumlah Kata (Word Count)</strong>
            <span>Dihitung berdasarkan token yang dipisahkan oleh spasi. Menggambarkan kuantitas keseluruhan gagasan naskah.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <strong className="block text-slate-800 text-sm mb-1 font-semibold">Jumlah Karakter (Char Count)</strong>
            <span>Mencakup setiap huruf, angka, tanda baca, dan emoji. Sangat krusial untuk SMS marketing dan batasan karakter platform.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
            <strong className="block text-slate-800 text-sm mb-1 font-semibold">Waktu Baca (Reading Time)</strong>
            <span>Dihitung dengan kecepatan rata-rata 200 kata/menit untuk memperkirakan durasi membaca audiens.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
