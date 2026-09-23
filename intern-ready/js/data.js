/**
 * InternReady Master Data: Interview Banks, Skill Roadmaps, Simulation Scenarios & ATS Keywords
 */

const INTERVIEW_BANKS = {
    hr_star: {
        roleTitle: 'HR & Behavioral Interview (Metode STAR)',
        icon: '👔',
        desc: 'Pertanyaan perilaku untuk mengukur kerja sama tim, integritas, dan pemecahan masalah dengan metode Situation, Task, Action, Result.',
        questions: [
            {
                id: 'hr-1',
                question: 'Ceritakan tentang diri Anda, latar belakang studi Anda di IT Del, dan mengapa Anda tertarik mendaftar magang di posisi ini?',
                tips: 'Gunakan struktur 60 detik: perkenalkan diri singkat, keahlian teknis unggulan, proyek paling berkesan, dan alasan memilih perusahaan ini.',
                keywords: ['pendidikan', 'keahlian', 'proyek', 'motivasi', 'kontribusi']
            },
            {
                id: 'hr-2',
                question: 'Ceritakan situasi ketika Anda menghadapi konflik atau perbedaan pendapat dalam tim proyek kuliah. Bagaimana Anda menyelesaikannya?',
                tips: 'Gunakan metode STAR: Jelaskan situasinya (S), tugas Anda (T), tindakan komunikasi asertif yang Anda ambil (A), dan hasil kesepakatan positif yang dicapai (R).',
                keywords: ['situasi', 'tindakan', 'diskusi', 'solusi', 'hasil', 'komunikasi']
            },
            {
                id: 'hr-3',
                question: 'Bagaimana Anda mengatur prioritas ketika memiliki beberapa deadline tugas besar yang harus dikumpulkan dalam waktu bersamaan?',
                tips: 'Jelaskan teknik manajemen waktu Anda, seperti matriks prioritas Eisenhower, to-do list, atau pembagian jadwal terstruktur.',
                keywords: ['prioritas', 'manajemen waktu', 'jadwal', 'fokus', 'selesai tepat waktu']
            }
        ]
    },
    software_eng: {
        roleTitle: 'Software Engineering Intern',
        icon: '💻',
        desc: 'Pertanyaan teknis seputar algoritma, clean code, Git, RESTful API, dan arsitektur perangkat lunak.',
        questions: [
            {
                id: 'se-1',
                question: 'Jelaskan perbedaan mendasar antara pemrograman berorientasi objek (OOP) dan fungsional, serta sebutkan 4 pilar utama OOP!',
                tips: 'Sebutkan 4 pilar: Encapsulation, Abstraction, Inheritance, Polymorphism beserta contoh nyata penerapannya.',
                keywords: ['enkapsulasi', 'abstraksi', 'pewarisan', 'polimorfisme', 'class', 'object']
            },
            {
                id: 'se-2',
                question: 'Bagaimana alur kerja Git yang biasa Anda terapkan dalam proyek kolaborasi tim dari branch feature hingga merge ke main?',
                tips: 'Jelaskan konsep branch feature, pull request, code review, penyelesaian merge conflict, dan git commit convention yang rapi.',
                keywords: ['branch', 'pull request', 'merge', 'conflict', 'commit', 'code review']
            },
            {
                id: 'se-3',
                question: 'Apa perbedaan antara metode HTTP GET, POST, PUT, dan DELETE pada arsitektur REST API?',
                tips: 'Jelaskan karakteristik idempotensi, pengiriman payload data di body vs URL query parameter, serta status code HTTP yang sesuai (200, 201, 204, 400).',
                keywords: ['get', 'post', 'put', 'delete', 'payload', 'status code', 'rest api']
            }
        ]
    },
    ui_ux: {
        roleTitle: 'UI/UX Designer Intern',
        icon: '🎨',
        desc: 'Pertanyaan seputar Design Thinking, wireframing di Figma, usability testing, dan konsistensi Design System.',
        questions: [
            {
                id: 'ui-1',
                question: 'Jelaskan 5 tahapan proses Design Thinking dan bagaimana Anda menerapkannya dalam proyek desain antarmuka!',
                tips: 'Sebutkan: Empathize, Define, Ideate, Prototype, dan Test. Tekankan pentingnya riset kebutuhan pengguna di awal.',
                keywords: ['empathize', 'define', 'ideate', 'prototype', 'testing', 'user research']
            },
            {
                id: 'ui-2',
                question: 'Bagaimana cara Anda mengukur apakah rancangan desain UI yang Anda buat ramah pengguna dan intuitif?',
                tips: 'Jelaskan metode Usability Testing, System Usability Scale (SUS), time-on-task, serta feedback langsung dari calon pengguna.',
                keywords: ['usability testing', 'feedback', 'user testing', 'sus', 'kemudahan']
            }
        ]
    },
    data_analyst: {
        roleTitle: 'Data Analyst Intern',
        icon: '📊',
        desc: 'Pertanyaan teknis seputar query SQL, data cleaning, visualisasi data, dan penarikan wawasan bisnis.',
        questions: [
            {
                id: 'da-1',
                question: 'Jelaskan perbedaan antara INNER JOIN, LEFT JOIN, RIGHT JOIN, dan FULL OUTER JOIN dalam query database SQL!',
                tips: 'Gambarkan diagram Venn hubungan himpunan data antar tabel yang dihubungkan dengan foreign key.',
                keywords: ['inner join', 'left join', 'right join', 'outer join', 'null', 'foreign key']
            },
            {
                id: 'da-2',
                question: 'Bagaimana tahapan yang Anda lakukan saat menemukan dataset mentah yang memiliki banyak nilai kosong (missing values) dan data duplikat?',
                tips: 'Jelaskan teknik data cleaning: identifikasi missing value, imputasi rata-rata/median, drop baris jika tidak representatif, dan penghapusan duplikat.',
                keywords: ['data cleaning', 'imputasi', 'missing values', 'duplikat', 'handling']
            }
        ]
    }
};

const SKILL_ROADMAPS = [
    {
        id: 'se-roadmap',
        role: 'Software Engineer Intern',
        skills: [
            { id: 'sk-1', name: 'Git & GitHub Collaboration (Branch, PR, Conflict)', level: 'Fundamental', checked: false },
            { id: 'sk-2', name: 'Pemrograman Berorientasi Objek (OOP) & Clean Code', level: 'Fundamental', checked: false },
            { id: 'sk-3', name: 'Perancangan RESTful API & Integrasi Backend', level: 'Core', checked: false },
            { id: 'sk-4', name: 'Database Relasional (PostgreSQL / MySQL) & Query Optimization', level: 'Core', checked: false },
            { id: 'sk-5', name: 'Dasar Docker Containerization & Deployment Cloud', level: 'Advanced', checked: false },
            { id: 'sk-6', name: 'Unit Testing & Debugging Terstruktur', level: 'Core', checked: false }
        ]
    },
    {
        id: 'soft-roadmap',
        role: 'Kesiapan Sikap & Soft Skills Profesional',
        skills: [
            { id: 'sk-7', name: 'Komunikasi Asertif & Etika Berkirim Pesan Kerja (Email / Slack)', level: 'Wajib', checked: false },
            { id: 'sk-8', name: 'Inisiatif Bertanya dengan Metode 15-Minute Rule Sebelum Macet', level: 'Wajib', checked: false },
            { id: 'sk-9', name: 'Kemampuan Menerima Kritik Konstruktif & Feedback Mentor', level: 'Wajib', checked: false },
            { id: 'sk-10', name: 'Disiplin Waktu Daily Standup & Ketepatan Jadwal Kerja', level: 'Wajib', checked: false },
            { id: 'sk-11', name: 'Dokumentasi Catatan Kerja Harian (Work Log / Jurnal Magang)', level: 'Wajib', checked: false }
        ]
    }
];

const ONBOARDING_SIMULATION = [
    {
        id: 'step-1',
        title: 'Hari Pertama: Pengenalan Tim & Setup Lingkungan Kerja',
        scenario: 'Pukul 09.00 WIB, Anda tiba di kantor atau memasuki ruangan virtual onboarding. Mentor Anda memberikan dokumentasi setup proyek dan repository kode. Saat mencoba menjalankan aplikasi lokal, Anda menemui error dependensi versi environment yang tidak cocok. Apa tindakan terbaik yang Anda ambil?',
        options: [
            {
                text: 'A. Langsung memanggil mentor berkali-kali tanpa mencoba mencari tahu penyebab error sendiri.',
                score: 30,
                feedback: 'Kurang tepat. Di dunia kerja, tunjukkan inisiatif awal untuk membaca log error terlebih dahulu sebelum bertanya.'
            },
            {
                text: 'B. Diam saja seharian karena takut dianggap tidak bisa dan berharap error selesai sendiri.',
                score: 10,
                feedback: 'Sangat keliru. Menunda melaporkan hambatan akan memperlambat progres tim dan merugikan diri sendiri.'
            },
            {
                text: 'C. Terapkan 15-minute rule: baca log error, cek versi dependensi di dokumentasi, lalu tanyakan kepada mentor dengan menyertakan screenshot dan langkah yang sudah dicoba.',
                score: 100,
                feedback: 'Sangat luar biasa! Ini adalah standar profesional insinyur perangkat lunak: mandiri, terstruktur, dan komunikatif saat meminta bantuan.'
            }
        ]
    },
    {
        id: 'step-2',
        title: 'Hari Ke-3: Sesi Daily Standup Meeting Tim',
        scenario: 'Pukul 09.30 WIB adalah jadwal Daily Standup selama 15 menit. Giliran Anda berbicara di depan seluruh tim pengembang. Bagaimana format penyampaian laporan progres yang paling efektif?',
        options: [
            {
                text: 'A. Bicara berputar-putar menceritakan seluruh hal teknis yang rumit selama 10 menit.',
                score: 40,
                feedback: 'Kurang efektif. Daily standup harus padat dan menghargai waktu anggota tim lain.'
            },
            {
                text: 'B. Struktur 3 poin: Apa yang berhasil dikerjakan kemarin, apa yang akan dikerjakan hari ini, dan apakah ada blocker (hambatan) yang membutuhkan bantuan.',
                score: 100,
                feedback: 'Tepat sekali! Format 3 poin (Yesterday, Today, Blockers) adalah standar metodologi Agile/Scrum di industri modern.'
            },
            {
                text: 'C. Mengatakan "Tidak ada update" padahal Anda sedang mengerjakan modul autentikasi.',
                score: 20,
                feedback: 'Kurang transparan. Selalu sampaikan kemajuan kerja Anda agar mentor dapat memantau kontribusi Anda.'
            }
        ]
    }
];

const ATS_VERBS = [
    'Mengembangkan', 'Mengimplementasikan', 'Merancang', 'Mengoptimalkan', 'Membangun',
    'Mengintegrasikan', 'Menganalisis', 'Mempercepat', 'Meningkatkan', 'Menyelesaikan'
];
