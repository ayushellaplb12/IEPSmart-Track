import { Indicator, Student, Score } from './types';

export const IEP_TEMPLATES: Indicator[] = [
  // 1. Partisipasi Kegiatan Kelas
  { 
    id: 'pkk_1', 
    category: 'Partisipasi Kegiatan Kelas', 
    text: 'Mampu berpartisipasi sesuai aturan kelas dengan mengangkat tangan sebelum berbicara.',
    frequency: 'Setiap hari'
  },
  { 
    id: 'pkk_2', 
    category: 'Partisipasi Kegiatan Kelas', 
    text: 'Mampu meminta izin sebelum menggunakan barang milik orang lain di kelas secara konsisten.',
    frequency: 'Setiap hari'
  },
  
  // 2. Kebersihan Diri
  { 
    id: 'kbd_1', 
    category: 'Kebersihan Diri', 
    text: 'Mampu mencuci tangan dengan sabun setelah dari toilet dan setelah menggaruk area belakang tubuhnya.',
    frequency: 'Setiap hari'
  },
  { 
    id: 'kbd_2', 
    category: 'Kebersihan Diri', 
    text: 'Mampu menata baju atau celana agar rapi setelah dari toilet.',
    frequency: 'Setiap hari'
  },
  
  // 3. Praxis “Auditory–Visual Discrimination” (Sensory Integration)
  { 
    id: 'pra_1', 
    category: 'Praxis “Auditory–Visual Discrimination” (Sensory Integration)', 
    text: 'Mampu menghadapkan wajah ke arah lawan bicara saat disapa atau ditanya dengan bantuan prompt verbal langsung dari guru.',
    frequency: 'Setiap hari'
  },
  { 
    id: 'pra_2', 
    category: 'Praxis “Auditory–Visual Discrimination” (Sensory Integration)', 
    text: 'Mampu menghadapkan wajah ke arah lawan bicara saat menyapa atau menjawab dengan bantuan pengingat verbal ringan atau isyarat non-verbal (gestur guru).',
    frequency: 'Setiap hari'
  },
  
  // 4. Motorik Halus, Kasar & Praxis (OTPF-4)
  { 
    id: 'mot_1', 
    category: 'Motorik Halus, Kasar & Praxis (OTPF-4)', 
    text: 'Mampu menulis 3–4 kalimat sederhana dengan huruf terbaca jelas dan spasi antar kata rapi.',
    frequency: '2kali/ seminggu'
  },
  { 
    id: 'mot_2', 
    category: 'Motorik Halus, Kasar & Praxis (OTPF-4)', 
    text: 'Mampu meningkatkan kekuatan otot, daya tahan, keseimbangan, dan koordinasi postural.',
    frequency: 'Setiap hari'
  },
  
  // 5. Modulation (Sensory Integration)
  { 
    id: 'mod_1', 
    category: 'Modulation (Sensory Integration)', 
    text: 'Mampu memahami konsep jarak saat berbicara dengan lawan bicara.',
    frequency: 'Setiap hari'
  },
  { 
    id: 'mod_2', 
    category: 'Modulation (Sensory Integration)', 
    text: 'Mampu menjaga jarak dengan lawan bicara dengan bantuan sinyal nonverbal/ cue tangan.',
    frequency: 'Setiap hari'
  },
  { 
    id: 'mod_3', 
    category: 'Modulation (Sensory Integration)', 
    text: 'Mampu menjaga jarak satu lengan saat berbicara di situasi sosial nyata.',
    frequency: 'Setiap hari'
  },
  
  // 6. Two-Way Communication & Problem Solving
  { 
    id: 'twc_1', 
    category: 'Two-Way Communication & Problem Solving', 
    text: 'Mampu menyampaikan perasaan frustasi dengan kata sederhana ketika mengalami kesulitan dalam mengerjakan tugas.',
    frequency: 'Setiap hari'
  },
  { 
    id: 'twc_2', 
    category: 'Two-Way Communication & Problem Solving', 
    text: 'Mampu melakukan transaksi sederhana di kantin sekolah dengan 3–4 putaran komunikasi timbal balik (back-and-forth) bersama penjual.',
    frequency: 'Selasa & Kamis'
  },
  
  // 7. Education - Literasi
  { 
    id: 'lit_1', 
    category: 'Education - Literasi', 
    text: 'Mampu membaca teks cerita dalam Bahasa Indonesia dan menjawab pertanyaan pemahaman dari isi teks.',
    frequency: '3kali/ seminggu'
  },
  { 
    id: 'lit_2', 
    category: 'Education - Literasi', 
    text: 'Mampu membaca teks pendek Bahasa Inggris dengan kosakata dasar dan menjawab pertanyaan sederhana untuk melatih pemahaman bacaan.',
    frequency: '2kali/ seminggu'
  },
  
  // 8. Education - Numerasi
  { 
    id: 'num_1', 
    category: 'Education - Numerasi', 
    text: 'Mampu melakukan penjumlahan dan pengurangan bilangan 3 digit secara tepat.',
    frequency: '2 kali/ seminggu'
  },
  { 
    id: 'num_2', 
    category: 'Education - Numerasi', 
    text: 'Mampu menghitung total harga jajanan dan menghitung kembali uang kembalian.',
    frequency: '2 kali/ seminggu'
  }
];

export const STUDENTS: Student[] = [
  {
    id: 'ahmad_khawarizmi',
    name: 'Ahmad Alkhalifi Khawarizmi',
    class: '3 Saola',
    nisn: '3164057454',
    nis: '2311073',
    gender: 'Laki-laki',
    birthDate: '11 Januari 2016',
    chronologicalAge: '10 tahun',
    parentName: 'Andi Erlina',
    address: 'Jl. H Raisan. Komp. Villa Raisan No.47 A. Cipedak, Jagakarsa, Jakarta Selatan.',
    phone: '081399626439',
    schoolName: 'Lazuardi Global Compassionate School',
    indicators: IEP_TEMPLATES,
    createdAt: '2026-01-01T08:00:00Z'
  }
];

// Replicate the exact January 2026 school days monitoring sheet scores
const schoolDays = [
  '2026-01-01', '2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07',
  '2026-01-08', '2026-01-09', '2026-01-12', '2026-01-13', '2026-01-14',
  '2026-01-15', '2026-01-19', '2026-01-20', '2026-01-21', '2026-01-22',
  '2026-01-23', '2026-01-26', '2026-01-27', '2026-01-28', '2026-01-29',
  '2026-01-30'
];

interface MockTemplate {
  pattern: Score[];
  category: string;
}

// Generate scores matching exactly of PDF
const mockPatterns: Record<string, MockTemplate> = {
  pkk_1: { pattern: [4, 4, 4, 4, 4, 3, 4, 4, 4, 3, 4, 3, 3, 4, 4, 4, 4, 4, 4, 3, 3], category: 'Partisipasi Kegiatan Kelas' },
  pkk_2: { pattern: [4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 3, 3, 4, 4, 3, 3, 4, 3, 4, 4], category: 'Partisipasi Kegiatan Kelas' },
  
  kbd_1: { pattern: [4, 4, 4, 4, 3, 4, 4, 4, 4, 3, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4], category: 'Kebersihan Diri' },
  kbd_2: { pattern: [4, 4, 3, 3, 4, 3, 4, 4, 3, 3, 3, 4, 4, 3, 3, 4, 4, 4, 3, 3, 4], category: 'Kebersihan Diri' },
  
  pra_1: { pattern: [4, 4, 4, 3, 3, 4, 3, 4, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3], category: 'Praxis “Auditory–Visual Discrimination” (Sensory Integration)' },
  pra_2: { pattern: [2, 3, 3, 2, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 3, 3], category: 'Praxis “Auditory–Visual Discrimination” (Sensory Integration)' },
  
  mot_1: { pattern: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], category: 'Motorik Halus, Kasar & Praxis (OTPF-4)' }, // 2x seminggu but let's record it fully
  mot_2: { pattern: [4, 4, 4, 3, 3, 4, 3, 3, 4, 3, 3, 3, 4, 3, 4, 4, 4, 4, 4, 4, 3], category: 'Motorik Halus, Kasar & Praxis (OTPF-4)' },
  
  mod_1: { pattern: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3], category: 'Modulation (Sensory Integration)' },
  mod_2: { pattern: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3], category: 'Modulation (Sensory Integration)' },
  mod_3: { pattern: [2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2], category: 'Modulation (Sensory Integration)' },
  
  twc_1: { pattern: [4, 3, 4, 3, 4, 4, 3, 3, 4, 4, 3, 3, 4, 4, 4, 3, 4, 4, 3, 4, 4], category: 'Two-Way Communication & Problem Solving' },
  twc_2: { pattern: [4, 4, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 3, 3, 4, 4, 4, 3, 4], category: 'Two-Way Communication & Problem Solving' },
  
  lit_1: { pattern: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], category: 'Education - Literasi' },
  lit_2: { pattern: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], category: 'Education - Literasi' },
  
  num_1: { pattern: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], category: 'Education - Numerasi' },
  num_2: { pattern: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], category: 'Education - Numerasi' }
};

export const MOCK_RECORDS = schoolDays.map((dateStr, index) => {
  const scores: Record<string, Score> = {};
  
  Object.keys(mockPatterns).forEach(indicatorId => {
    const pattern = mockPatterns[indicatorId].pattern;
    scores[indicatorId] = (pattern[index % pattern.length]) as Score;
  });

  // Provide some variation in activities logs
  const activityLogs = [
    "Ananda Alif berpartisipasi mengangkat tangan sebelum bertanya di kelas, makan siang mandiri, dan menyelesaikan latihan bahasa indonesia dengan rapi.",
    "Alif berwudu tertib, menulis 3 kalimat terstruktur, dan mampu bermain peran di halaman sekolah.",
    "Alif sangat tenang saat berpindah kelas, mencuci tangan setelah ke toilet dengan sabun tanpa perlu diingatkan.",
    "Ananda menyelesaikan soal penjumlahan 3 digit dengan visual bantuan konkret bersama guru pendamping.",
    "Alif bisa menjaga jarak saat berdiskusi di situasi sosial, sempat frustasi dikit ketika menggambar namun cepat tenang kembali dengan teknik deep breathing."
  ];

  return {
    id: `rec_jan_${index}`,
    studentId: 'ahmad_khawarizmi',
    date: `${dateStr}T12:00:00Z`,
    scores,
    activityLog: activityLogs[index % activityLogs.length],
    summary: `Alif berkembang baik pada tanggal ${dateStr}, terutama dalam kemandirian ADL.`
  };
});

export const NARRATIVE_TEMPLATES: Record<number, string> = {
  1: 'Ananda menunjukkan kesulitan signifikan dan membutuhkan bantuan penuh dalam [program].',
  2: 'Ananda mampu melakukan [program] dengan bantuan maksimal dan bimbingan intensif.',
  3: 'Ananda mampu melakukan [program] dengan bantuan minimal atau sesekali diingatkan.',
  4: 'Ananda mampu melakukan [program] dengan baik dan konsisten dengan alat bantu minimal.',
  5: 'Ananda mampu melakukan [program] secara mandiri, penuh percaya diri, dan konsisten.',
};

export const GRADE_CATEGORY = (percentage: number) => {
  if (percentage >= 100) return { grade: 'A', category: 'Sangat Baik (Mandiri)' };
  if (percentage >= 75) return { grade: 'B', category: 'Baik (Konsisten)' };
  if (percentage >= 50) return { grade: 'C', category: 'Cukup (Dengan Bantuan)' };
  if (percentage >= 25) return { grade: 'D', category: 'Kurang (Bantuan Penuh)' };
  return { grade: 'E', category: 'Belum Terlihat' };
};
