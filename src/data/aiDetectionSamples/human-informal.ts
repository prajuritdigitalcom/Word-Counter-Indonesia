import { DetectionSample } from './human-formal';

export const HUMAN_INFORMAL_SAMPLES: DetectionSample[] = [
  {
    id: 'hi-1',
    title: 'Review Pengalaman Menginap di Villa Lembang',
    category: 'human-informal',
    label: 'human',
    split: 'train',
    text: `Kemarin pas liburan panjang bulan lalu, saya sempat nginep dua malam bareng keluarga besar di salah satu villa daerah Lembang Bandung. Tempatnya sih asyik banget dan suasananya tenang, udaranya sejuk khas pegunungan dan pemandangan kebun teh langsung kelihatan pas kita buka jendela kamar tidur di lantai dua. Tapi ya gitu deh, pas malam pertama air panas di kamar mandi utama sempat mendadak mati sekitar jam 9 malam pas anak-anak mau mandi sebelum tidur.

Untung pemilik dan pengelolanya responsif banget pas saya hubungi lewat chat WhatsApp. Sekitar 15 menit kemudian staf teknisnya langsung datang ke villa buat ngecek dan benerin tabung pemanas gasnya yang ternyata regulatornya agak longgar. Menurut pengalaman saya pribadi, kalau kalian ada rencana mau liburan keluarga ke daerah Lembang saat musim hujan begini, mendingan selalu bawa jaket tebal atau sweater cadangan deh. Soalnya pas jam 4 pagi suhunya beneran bisa drop sampai 14 derajat celcius, dingin banget sampai menusuk tulang.

Untuk urusan makanan, kafe kecil di dekat resepsionis villa makanannya lumayan enak dan harganya masuk akal. Kami sempat pesan nasi goreng kampung, tempe mendoan hangat, dan pisang goreng keju yang harganya cuma 25 ribu rupiah per porsi. Rasanya pas di lidah dan porsinya cukup mengenyangkan setelah seharian jalan-jalan keliling tempat wisata sekitar Tangkuban Perahu.`,
  },
  {
    id: 'hn-1',
    title: 'Cerita Naratif Personal: Belajar Menulis Lepas dan Kopi Sore',
    category: 'human-narrative',
    label: 'human',
    split: 'train',
    text: `Kemarin sore saya duduk di warung kopi langganan dekat perempatan lampu merah. Hujan rintik-rintik baru saja reda, menyisakan genangan air di pinggir aspal jalanan yang memantulkan lampu kendaraan yang mulai ramai. Saya membuka laptop tua yang stiker belakangnya sudah mulai mengelupas di bagian sudut, lalu membaca ulang catatan draft tulisan yang saya buat tadi pagi di sela-sela jam istirahat kantor.

Jujur saja, belakangan ini saya merasa ritme kerja saya agak berantakan. Terlalu banyak tenggat waktu yang menumpuk di meja kerja membuat saya sering kehilangan fokus saat ingin menyelesaikan proyek pribadi. Dulu saya paling malas kalau harus bangun sebelum jam enam pagi, tapi seminggu terakhir ini saya paksa diri sendiri jalan kaki keliling komplek rumah setidaknya setengah jam sebelum mandi. Hasilnya lumayan terasa, kepala jadi lebih enteng dan ide-ide yang mampet rasanya mulai mengalir lagi sedikit demi sedikit.

Saya sendiri percaya bahwa konsistensi kecil jauh lebih berharga daripada ledakan semangat sesaat yang cepat padam. Waktu saya ngobrol santai sama Mas Hendra penjaga warung, dia cerita kalau warungnya sudah bertahan lebih dari delapan tahun hanya dengan modal ketekunan dan keramahan melayani pelanggan. Mendengar cerita sederhana itu bikin saya sadar kalau perjuangan hidup memang butuh napas panjang, bukan sekadar adu cepat lari sprint.`,
  },
  {
    id: 'hn-2',
    title: 'Catatan Pengalaman Memperbaiki Motor Tua Sendiri di Garasi',
    category: 'human-narrative',
    label: 'human',
    split: 'test',
    text: `Minggu pagi kemarin saya putuskan membongkar karburator motor bebek tua peninggalan almarhum paman. Tarikan gasnya sudah dua minggu terasa tersendat-sendat, apalagi kalau dibawa nanjak di jalan layang pas jam pulang kerja sore hari. Berbekal kunci pas nomor 10 dan obeng kembang pinjaman tetangga sebelah rumah, saya gelar kardus bekas di lantai garasi samping yang agak teduh dari terik matahari pagi.

Ternyata spuyer utamanya sudah dipenuhi kerak bensin hitam pekat yang mengering. Saya bersihkan lubang kecil itu pelan-pelan pakai kawat tembaga halus dan semprotan bensin sisa di botol air mineral bekas. Waktu saya pasang kembali semua bautnya dan menyalakan kick starter, ada rasa puas tersendiri waktu mendengar suara stasioner mesinnya kembali berputar halus tanpa ada bunyi brebet lagi.

Pengalaman begini bikin saya makin yakin kalau merawat barang lama itu bukan cuma soal hemat uang belanja, tapi ada nilai kepuasan batin tersendiri yang susah dibeli di bengkel modern mana pun. Sore harinya saya langsung jajal motor keliling komplek sambil beli martabak telur buat cemilan keluarga di rumah.`,
  },
];

export const HUMAN_CODESWITCH_SAMPLES: DetectionSample[] = [
  {
    id: 'hc-1',
    title: 'Catatan Sprint Retrospective Tim Product Tech',
    category: 'human-codeswitch',
    label: 'human',
    split: 'train',
    text: `Dalam sprint retrospective kuartal pertama kemarin bersama tim engineering dan UI/UX design di kantor Jakarta Selatan, kami membahas secara mendalam bottleneck utama pada alur user onboarding aplikasi mobile kami. Berdasarkan data analytics mingguan yang dirilis oleh tim growth marketing, angka drop-off rate pada tahapan verifikasi OTP SMS masih berada di kisaran 18,5%, yang mana angka ini masih jauh di atas target KPI kami sebesar 5%.

Oleh karena itu, seluruh tim sepakat untuk melakukan shifting mindset dan menyelaraskan framework kerja antar stakeholder lintas divisi. Product manager kami akan memfinalisasi dokumen PRD revisi sebelum hari Jumat depan, sementara rekan-rekan tech lead dan backend engineer sudah mulai menyiapkan integrasi fallback provider SMS otomatis serta opsi verifikasi WhatsApp guna meminimalkan delivery latency.

Insight berharga yang kami dapatkan dari sesi customer interview dengan 12 pengguna aktif minggu lalu menunjukkan bahwa mayoritas user lebih menyukai opsi single sign-on (SSO) satu klik menggunakan akun Google daripada harus mengisi formulir profil manual yang panjang. Kami berencana merilis fitur SSO ini pada sprint rilis versi 2.4 di akhir bulan April.`,
  },
  {
    id: 'hc-2',
    title: 'Sharing Session Bug Triaging dan Monitoring Pipeline',
    category: 'human-codeswitch',
    label: 'human',
    split: 'test',
    text: `Tadi sore tim DevOps mengadakan internal sync membahas reliability service backend selama promo payday flash sale akhir bulan. Dari hasil alert di dashboard Grafana, kita mendapati spike error 502 pada microservice payment gateway sekitar jam 12 siang pas traffic transaksi lagi padat-padatnya. Problem utamanya ternyata ada di connection pool database Postgres yang maxed out karena query history transaksi tidak memakai index komposit yang optimal pada field user_id dan created_at.

Kita langsung apply hotfix berupa query caching di Redis layer dengan TTL 60 detik buat ngurangin load ke primary DB instance. Setelah deployment selesai dalam waktu 15 menit, latency p99 langsung turun drastis dari 1.8 detik ke bawah 250ms dan error rate kembali normal di angka 0.02%.

Rencana minggu depan kita bakal migrate service payment ini ke cluster Kubernetes baru biar auto-scaling pods bisa lebih responsif waktu ada sudden traffic spike lagi tanpa perlu manual intervensi dari on-call engineer yang bertugas. Dokumentasi post-mortem insiden ini sudah diunggah ke Notion internal tim untuk bahan evaluasi bersama.`,
  },
];

export const HUMAN_SEO_BUSINESS_SAMPLES: DetectionSample[] = [
  {
    id: 'hs-1',
    title: 'Artikel SEO Lokal Jasa Service AC Surabaya',
    category: 'human-seo',
    label: 'human',
    split: 'train',
    text: `Mencari jasa service AC Surabaya yang jujur, cepat, dan bergaransi resmi sering kali membingungkan bagi warga Surabaya Barat maupun Surabaya Timur. Kami hadir menyediakan layanan jasa service AC Surabaya profesional untuk rumah tinggal, kantor, ruko, maupun apartemen dengan teknisi bersertifikat dan berpengalaman lebih dari 7 tahun menangani berbagai merk AC terkemuka.

Keunggulan memilih jasa service AC Surabaya bersama tim kami meliputi transparansi harga cuci AC mulai Rp65.000, pengecekan tekanan freon R32 dan R410A secara akurat, serta garansi dingin selama 30 hari penuh setelah pengerjaan. Jika AC Anda mengeluarkan bau tak sedap atau bocor air di pipa indoor, teknisi kami siap datang langsung ke lokasi dalam waktu maksimal 2 jam setelah pemesanan.

Untuk mendapatkan promo diskon cuci paket 3 unit sekaligus, segera hubungi kontak WhatsApp customer service kami. Percayakan kebutuhan perawatan pendingin ruangan Anda hanya pada jasa service AC Surabaya terpercaya untuk menjaga udara ruangan tetap bersih, segar, dan hemat konsumsi daya listrik harian.`,
  },
  {
    id: 'hs-2',
    title: 'Panduan Memilih Meja Belajar Kayu Jati Jepara',
    category: 'human-seo',
    label: 'human',
    split: 'test',
    text: `Meja belajar kayu jati tetap menjadi pilihan favorit banyak orang tua yang menginginkan perabot ruang belajar kokoh dan tahan lama hingga puluhan tahun. Di workshop pengrajin Jepara kami, setiap meja belajar kayu jati dikerjakan secara teliti oleh tukang kayu berpengalaman menggunakan bahan baku kayu jati solid oven dengan kadar air di bawah 12 persen agar tidak mudah melengkung atau retak saat perubahan cuaca.

Desain meja belajar kayu jati saat ini tidak lagi terkesan kaku atau kuno. Kami menyediakan berbagai model minimalis modern dengan laci penyimpanan dokumen luas, rak buku bertingkat, serta lubang kabel tersembunyi yang rapi untuk meletakkan monitor komputer anak. Lapisan finishing melamine natural doff memberikan sentuhan elegan pada serat kayu alami tanpa bau zat kimia menyengat.

Bagi Anda yang berdomisili di wilayah Jabodetabek, kami melayani pengiriman langsung beserta perakitan di tempat dengan sistem pembayaran transfer bank atau COD setelah barang dicek. Pastikan investasi kenyamanan belajar putra-putri Anda menggunakan meja belajar kayu jati asli berkualitas tinggi langsung dari produsen pertama untuk menciptakan suasana belajar yang tenang dan menyenangkan di rumah.`,
  },
];
