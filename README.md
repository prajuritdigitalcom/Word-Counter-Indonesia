# Word Counter Indonesia

Free online Word Counter Indonesia by **Prajurit Digital**.

Aplikasi web gratis, realtime, dan privacy-friendly untuk menghitung jumlah kata, karakter (dengan/tanpa spasi), kalimat, paragraf, estimasi waktu baca, kepadatan kata kunci (*keyword density*), kata yang sering digunakan (*top words*), dan rata-rata keterbacaan teks Bahasa Indonesia.

---

## 🚀 Fitur Utama

- **Word Count Realtime**: Hitung kata secara presisi dengan normalisasi whitespace.
- **Character Count**: Perhitungan karakter Unicode grapheme-aware (termasuk/tanpa spasi, emoji dihitung 1 karakter).
- **Sentence Counter**: Deteksi kalimat cerdas yang menangani format angka Indonesia (misal `Rp2.500.000` tidak dipecah menjadi 3 kalimat).
- **Paragraph Counter**: Penghitungan paragraf berdasarkan pemisah blok baris kosong.
- **Reading Time**: Estimasi waktu baca berdasarkan rata-rata 200 kata/menit.
- **Keyword Density**: Kepadatan kata kunci tunggal maupun multi-frasa dengan pencocokan case-insensitive.
- **Top Words**: Daftar kata teratas dengan filter *Indonesian Stopwords*.
- **Analisis Teks & Keterbacaan**: Rata-rata kata per kalimat, kata per paragraf, dan karakter per kata.
- **SEO Content Check**: Indikator ramah tanpa klaim manipulatif peringkat.
- **Salin Statistik**: Salin ringkasan lengkap ke clipboard dengan 1 klik.
- **100% Client-Side & Privasi**: Teks diproses langsung di browser tanpa dikirim ke server.
- **Aksesibilitas & SEO**: Mendukung screen reader dengan `aria-live="polite"`, semantic HTML, Open Graph, dan JSON-LD Structured Data.

---

## 🛠️ Teknologi

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Lucide Icons**
- **No Backend & No External AI required** (100% Deterministic & Fast)

---

## 📦 Menjalankan Secara Lokal

1. Clone repository:
   ```bash
   git clone https://github.com/prajuritdigital/word-counter-indonesia.git
   cd word-counter-indonesia
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Jalankan development server:
   ```bash
   npm run dev
   ```

4. Buka di peramban: `http://localhost:3000`

---

## 🏗️ Build Production

```bash
npm run build
```

---

## ☁️ Deployment ke Vercel

Proyek ini telah dikonfigurasi untuk langsung dideploy ke Vercel tanpa perlu konfigurasi environment variable tambahan. File `vercel.json` sudah disediakan untuk memastikan SPA client-side rewrite bekerja sempurna.

---

## 📄 Lisensi & Hak Cipta

© 2026 **Prajurit Digital**. Semua hak dilindungi.
