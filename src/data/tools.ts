export interface ToolItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
  status: 'active' | 'coming_soon';
  path: string;
}

export const OTHER_TOOLS: ToolItem[] = [
  {
    id: 'word-counter',
    name: 'Word Counter Indonesia',
    description: 'Hitung kata, karakter, kalimat, waktu baca, dan kepadatan kata kunci secara realtime.',
    iconName: 'FileText',
    status: 'active',
    path: '/word-counter/',
  },
  {
    id: 'keyword-density',
    name: 'Keyword Density Checker',
    description: 'Analisis mendalam distribusi dan frekuensi kata kunci untuk optimasi konten SEO.',
    iconName: 'Search',
    status: 'coming_soon',
    path: '#tools',
  },
  {
    id: 'meta-title',
    name: 'Meta Title Checker',
    description: 'Cek batas karakter dan pixel width meta title serta meta description artikel Google SERP.',
    iconName: 'Eye',
    status: 'coming_soon',
    path: '#tools',
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'Ubah judul artikel menjadi URL slug yang ramah SEO dan bersih dari karakter aneh.',
    iconName: 'Link2',
    status: 'coming_soon',
    path: '#tools',
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    description: 'Bersihkan spasi ganda, newline berlebih, tag tersembunyi, dan formatting rusak.',
    iconName: 'Eraser',
    status: 'coming_soon',
    path: '#tools',
  },
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    description: 'Rapikan kode HTML artikel blog dan format tag penulisan dengan rapi.',
    iconName: 'Code',
    status: 'coming_soon',
    path: '#tools',
  },
];
