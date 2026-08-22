import { DetectionSample } from './human-formal';

export const HUMAN_INFORMAL_SAMPLES: DetectionSample[] = [
  {
    id: 'hi-1',
    title: 'Review Pengalaman Menginap di Villa Lembang',
    category: 'human-informal',
    label: 'human',
    text: `Kemarin pas liburan panjang bulan lalu, saya sempat nginep dua malam bareng keluarga besar di salah satu villa daerah Lembang Bandung. Tempatnya sih asyik banget dan suasananya tenang, udaranya sejuk khas pegunungan dan pemandangan kebun teh langsung kelihatan pas kita buka jendela kamar tidur di lantai dua. Tapi ya gitu deh, pas malam pertama air panas di kamar mandi utama sempat mendadak mati sekitar jam 9 malam pas anak-anak mau mandi sebelum tidur.

Untung pemilik dan pengelolanya responsif banget pas saya hubungi lewat chat WhatsApp. Sekitar 15 menit kemudian staf teknisnya langsung datang ke villa buat ngecek dan benerin tabung pemanas gasnya yang ternyata regulatornya agak longgar. Menurut pengalaman saya pribadi, kalau kalian ada rencana mau liburan keluarga ke daerah Lembang saat musim hujan begini, mendingan selalu bawa jaket tebal atau sweater cadangan deh. Soalnya pas jam 4 pagi suhunya beneran bisa drop sampai 14 derajat celcius, dingin banget sampai menusuk tulang.

Untuk urusan makanan, kafe kecil di dekat resepsionis villa makanannya lumayan enak dan harganya masuk akal. Kami sempat pesan nasi goreng kampung, tempe mendoan hangat, dan pisang goreng keju yang harganya cuma 25 ribu rupiah per porsi. Rasanya pas di lidah dan porsinya cukup mengenyangkan setelah seharian jalan-jalan keliling tempat wisata sekitar Tangkuban Perahu.`,
  },
];

export const HUMAN_CODESWITCH_SAMPLES: DetectionSample[] = [
  {
    id: 'hc-1',
    title: 'Catatan Sprint Retrospective Tim Product Tech',
    category: 'human-codeswitch',
    label: 'human',
    text: `Dalam sprint retrospective kuartal pertama kemarin bersama tim engineering dan UI/UX design di kantor Jakarta Selatan, kami membahas secara mendalam bottleneck utama pada alur user onboarding aplikasi mobile kami. Berdasarkan data analytics mingguan yang dirilis oleh tim growth marketing, angka drop-off rate pada tahapan verifikasi OTP SMS masih berada di kisaran 18,5%, yang mana angka ini masih jauh di atas target KPI kami sebesar 5%.

Oleh karena itu, seluruh tim sepakat untuk melakukan shifting mindset dan menyelaraskan framework kerja antar stakeholder lintas divisi. Product manager kami akan memfinalisasi dokumen PRD revisi sebelum hari Jumat depan, sementara rekan-rekan tech lead dan backend engineer sudah mulai menyiapkan integrasi fallback provider SMS otomatis serta opsi verifikasi WhatsApp guna meminimalkan delivery latency.

Insight berharga yang kami dapatkan dari sesi customer interview dengan 12 pengguna aktif minggu lalu menunjukkan bahwa mayoritas user lebih menyukai opsi single sign-on (SSO) satu klik menggunakan akun Google daripada harus mengisi formulir profil manual yang panjang. Kami berencana merilis fitur SSO ini pada sprint rilis versi 2.4 di akhir bulan April.`,
  },
];
