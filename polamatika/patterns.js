/**
 * Master Patterns Data for PolaMatika
 */

const ADVENTURE_LEVELS = [
    {
        id: 1,
        title: 'Deret Penjumlahan Sederhana',
        category: 'Aritmatika Dasar',
        difficulty: 1,
        sequence: [2, 5, 8, 11, '?'],
        correct: 14,
        options: [13, 14, 15, 16],
        rule: 'Penjumlahan Konstan (+3)',
        formula: 'U_n = 3n - 1',
        explanation: 'Setiap suku bertambah 3 secara konstan: 2 (+3) -> 5 (+3) -> 8 (+3) -> 11 (+3) -> 14.',
        hint: 'Perhatikan selisih antara dua angka berurutan.'
    },
    {
        id: 2,
        title: 'Deret Pengurangan Bertahap',
        category: 'Aritmatika Dasar',
        difficulty: 1,
        sequence: [30, 26, 22, 18, '?'],
        correct: 14,
        options: [12, 14, 15, 16],
        rule: 'Pengurangan Konstan (-4)',
        formula: 'U_n = 34 - 4n',
        explanation: 'Setiap suku dikurangi 4 secara konstan: 30 (-4) -> 26 (-4) -> 22 (-4) -> 18 (-4) -> 14.',
        hint: 'Angka semakin mengecil dengan pengurangan tetap.'
    },
    {
        id: 3,
        title: 'Deret Perkalian Dua (Geometri)',
        category: 'Barisan Geometri',
        difficulty: 2,
        sequence: [3, 6, 12, 24, '?'],
        correct: 48,
        options: [36, 44, 48, 52],
        rule: 'Perkalian Rasio (x2)',
        formula: 'U_n = 3 * 2^(n-1)',
        explanation: 'Setiap angka dikalikan 2: 3 (x2) -> 6 (x2) -> 12 (x2) -> 24 (x2) -> 48.',
        hint: 'Bandingkan rasio pembagian suku setelahnya dengan sebelumnya.'
    },
    {
        id: 4,
        title: 'Barisan Bilangan Fibonacci',
        category: 'Pola Fibonacci',
        difficulty: 2,
        sequence: [1, 1, 2, 3, 5, 8, '?'],
        correct: 13,
        options: [11, 12, 13, 15],
        rule: 'Penjumlahan Dua Suku Sebelumnya',
        formula: 'F_n = F_(n-1) + F_(n-2)',
        explanation: 'Setiap suku adalah jumlah dari dua suku di depannya: 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13.',
        hint: 'Jumlahkan dua angka yang berdampingan di sebelah kiri.'
    },
    {
        id: 5,
        title: 'Deret Kuadrat Bilangan Asli',
        category: 'Pola Kuadrat (Pangkat Dua)',
        difficulty: 3,
        sequence: [1, 4, 9, 16, 25, '?'],
        correct: 36,
        options: [30, 32, 36, 49],
        rule: 'Kuadrat Bilangan Bulat (n^2)',
        formula: 'U_n = n^2',
        explanation: '1^2 = 1, 2^2 = 4, 3^2 = 9, 4^2 = 16, 5^2 = 25, maka 6^2 = 36.',
        hint: 'Perhatikan pola bilangan kuadrat sempurna (1x1, 2x2, 3x3, 4x4...).'
    },
    {
        id: 6,
        title: 'Deret Selisih Bertingkat (Aritmatika Bertingkat)',
        category: 'Aritmatika Bertingkat',
        difficulty: 3,
        sequence: [2, 3, 6, 11, 18, '?'],
        correct: 27,
        options: [24, 25, 27, 29],
        rule: 'Selisih Bertambah Ganjil (+1, +3, +5, +7, +9)',
        formula: 'U_n = n^2 - 2n + 3',
        explanation: 'Selisihnya adalah bilangan ganjil: 2 (+1) -> 3 (+3) -> 6 (+5) -> 11 (+7) -> 18 (+9) -> 27.',
        hint: 'Cari selisih antar angka terlebih dahulu, lalu cari pola dari selisih tersebut.'
    },
    {
        id: 7,
        title: 'Pola Matriks IQ 3x3',
        category: 'Matriks Logika IQ',
        difficulty: 4,
        isMatrix: true,
        matrix: [
            [2, 3, 5],
            [4, 5, 9],
            [6, 7, '?']
        ],
        correct: 13,
        options: [11, 12, 13, 14],
        rule: 'Penjumlahan Baris Horisontal (Kolom 1 + Kolom 2 = Kolom 3)',
        formula: 'K_3 = K_1 + K_2',
        explanation: '2 + 3 = 5 (baris 1), 4 + 5 = 9 (baris 2), maka 6 + 7 = 13 (baris 3).',
        hint: 'Perhatikan hubungan matematika pada setiap baris dari kiri ke kanan.'
    },
    {
        id: 8,
        title: 'Pola Selang-Seling (+4 dan -1)',
        category: 'Pola Campuran',
        difficulty: 3,
        sequence: [5, 9, 8, 12, 11, 15, '?'],
        correct: 14,
        options: [13, 14, 16, 18],
        rule: 'Operasi Bergantian (+4, -1, +4, -1, +4, -1)',
        formula: 'Pola Operasi Bergantian',
        explanation: '5 (+4) = 9, 9 (-1) = 8, 8 (+4) = 12, 12 (-1) = 11, 11 (+4) = 15, 15 (-1) = 14.',
        hint: 'Perhatikan dua operasi matematika yang bergantian secara berulang.'
    }
];

const BADGES_DATA = [
    { id: 'b1', title: 'Pemula Logika', desc: 'Selesaikan 3 level pertama petualangan', icon: '🌱', reqSolved: 3 },
    { id: 'b2', title: 'Ahli Deret Angka', desc: 'Selesaikan 6 level petualangan', icon: '🔢', reqSolved: 6 },
    { id: 'b3', title: 'Master Pola Matematika', desc: 'Selesaikan seluruh level yang tersedia', icon: '👑', reqSolved: 8 }
];
