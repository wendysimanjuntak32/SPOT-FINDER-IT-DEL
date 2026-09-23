/**
 * LifeQuest Master Data: Avatars, Quests, Categories, Bosses, Achievements, and Shop
 */

const AVATARS = [
    {
        id: 'scholar',
        name: 'Scholar of Informatics',
        title: 'Cendekiawan Logika',
        icon: '🧙‍♂️',
        desc: 'Spesialis kecerdasan, koding, dan penuntasan tugas akademik.',
        statBonus: { int: 5, vit: 1, fin: 2, soc: 2 }
    },
    {
        id: 'warrior',
        name: 'Paladin of Discipline',
        title: 'Ksatria Disiplin',
        icon: '⚔️',
        desc: 'Fokus pada kebugaran fisik, rutinitas pagi, dan stamina tinggi.',
        statBonus: { int: 2, vit: 5, fin: 1, soc: 2 }
    },
    {
        id: 'alchemist',
        name: 'Merchant Alchemist',
        title: 'Ahli Keuangan & Investasi',
        icon: '💰',
        desc: 'Pakar mengelola anggaran, menabung, dan efisiensi pengeluaran.',
        statBonus: { int: 2, vit: 1, fin: 5, soc: 2 }
    },
    {
        id: 'ranger',
        name: 'Shadow Ranger',
        title: 'Penjelajah Rutinitas',
        icon: '🏹',
        desc: 'Fokus pada konsistensi membaca, eksplorasi kebiasaan baru, dan produktivitas.',
        statBonus: { int: 3, vit: 3, fin: 2, soc: 2 }
    },
    {
        id: 'monk',
        name: 'Zen Master',
        title: 'Petapa Ketenangan Jiwa',
        icon: '🧘‍♂️',
        desc: 'Menjaga kesehatan mental, meditasi, interaksi sosial positif, dan istirahat teratur.',
        statBonus: { int: 2, vit: 3, fin: 1, soc: 4 }
    }
];

const CATEGORIES = {
    int: {
        id: 'int',
        name: 'Intelligence (Kecerdasan)',
        icon: '🧠',
        color: '#6366f1',
        desc: 'Belajar, membaca, koding, riset, dan tugas kuliah'
    },
    vit: {
        id: 'vit',
        name: 'Vitality (Kesehatan & Fisik)',
        icon: '❤️',
        color: '#ef4444',
        desc: 'Olahraga, hidrasi, nutrisi sehat, dan tidur berkualitas'
    },
    fin: {
        id: 'fin',
        name: 'Finance (Manajemen Keuangan)',
        icon: '🪙',
        color: '#f59e0b',
        desc: 'Catat pengeluaran, menabung, budget hemat, dan anti-foya'
    },
    soc: {
        id: 'soc',
        name: 'Social & Habit (Rutinitas & Disiplin)',
        icon: '✨',
        color: '#10b981',
        desc: 'Bangun pagi, bersih asrama, ibadah, dan gotong royong'
    }
};

const DEFAULT_DAILY_QUESTS = [
    {
        id: 'dq-1',
        title: 'Sesi Fokus Belajar / Koding 45 Menit',
        description: 'Tuntaskan satu materi kuliah, koding modul lab, atau kerjakan tugas tanpa distraksi media sosial.',
        category: 'int',
        xp: 45,
        gold: 25,
        statGains: { int: 2 },
        difficulty: 'medium',
        completed: false
    },
    {
        id: 'dq-2',
        title: 'Membaca Buku / Jurnal Ilmiah 15 Halaman',
        description: 'Buka buku literatur atau baca dokumentasi teknologi untuk memperluas wawasan berpikir.',
        category: 'int',
        xp: 30,
        gold: 15,
        statGains: { int: 1 },
        difficulty: 'easy',
        completed: false
    },
    {
        id: 'dq-3',
        title: 'Minum Air Mineral 2 Liter (8 Gelas)',
        description: 'Jaga metabolisme tubuh dan fokus otak dengan hidrasi cukup sepanjang hari.',
        category: 'vit',
        xp: 25,
        gold: 10,
        statGains: { vit: 2 },
        difficulty: 'easy',
        completed: false
    },
    {
        id: 'dq-4',
        title: 'Workout / Jalan Kaki 20 Menit di Kampus',
        description: 'Lakukan peregangan, push up, jogging, atau jalan kaki aktif di area kampus IT Del.',
        category: 'vit',
        xp: 40,
        gold: 20,
        statGains: { vit: 3 },
        difficulty: 'medium',
        completed: false
    },
    {
        id: 'dq-5',
        title: 'Catat Seluruh Pengeluaran Hari Ini di Buku Kas',
        description: 'Disiplin mencatat setiap rupiah yang dibelanjakan (makan, jajan, fotokopi) agar tidak boncos.',
        category: 'fin',
        xp: 35,
        gold: 30,
        statGains: { fin: 3 },
        difficulty: 'easy',
        completed: false
    },
    {
        id: 'dq-6',
        title: 'Tabung Minimal Rp 10.000 ke Rekening Simpanan',
        description: 'Alokasikan uang saku hari ini langsung ke tabungan masa depan sebelum terpakai konsumtif.',
        category: 'fin',
        xp: 50,
        gold: 35,
        statGains: { fin: 4 },
        difficulty: 'hard',
        completed: false
    },
    {
        id: 'dq-7',
        title: 'Rapikan Tempat Tidur & Meja Kamar Asrama',
        description: 'Mulai pagi hari dengan lingkungan kamar yang rapi dan bersih untuk ketenangan pikiran.',
        category: 'soc',
        xp: 25,
        gold: 15,
        statGains: { soc: 2 },
        difficulty: 'easy',
        completed: false
    },
    {
        id: 'dq-8',
        title: 'Tidur Malam Sebelum Pukul 23.30 (Reset Energi)',
        description: 'Hindari begadang yang tidak perlu untuk memulihkan stamina menghadapi kuliah esok hari.',
        category: 'soc',
        xp: 40,
        gold: 20,
        statGains: { soc: 2, vit: 1 },
        difficulty: 'medium',
        completed: false
    }
];

const EPIC_BOSSES = [
    {
        id: 'boss-uts',
        name: 'The Exam Titan (Ujian Tengah Semester)',
        title: 'Monster Penundaan & Materi Ujian Menumpuk',
        icon: '👹',
        totalHp: 500,
        currentHp: 500,
        desc: 'Kalahkan monster ujian dengan menyelesaikan 5 modul persiapan akademik intensif!',
        reward: { xp: 350, gold: 200, badge: 'UTS Champion' },
        tasks: [
            { id: 'bt-1', text: 'Selesaikan ringkasan materi Kuliah 1-4', damage: 100, done: false },
            { id: 'bt-2', text: 'Kerjakan 3 latihan soal ujian tahun lalu', damage: 100, done: false },
            { id: 'bt-3', text: 'Diskusi kelompok / bedah modul 2 jam', damage: 100, done: false },
            { id: 'bt-4', text: 'Tuntaskan tugas besar / proyek lab kampus', damage: 100, done: false },
            { id: 'bt-5', text: 'Review final materi H-1 sebelum masuk kelas', damage: 100, done: false }
        ]
    },
    {
        id: 'boss-finance',
        name: 'The Inflation Chimera (Monster Pemborosan)',
        title: 'Penjaga Godaan Diskon & Jajan Berlebih',
        icon: '🐉',
        totalHp: 400,
        currentHp: 400,
        desc: 'Tundukkan chimera pemborosan dengan menerapkan disiplin keuangan ketat minggu ini!',
        reward: { xp: 300, gold: 250, badge: 'Frugal Legend' },
        tasks: [
            { id: 'ft-1', text: 'Masak sendiri / makan kantin hemat 3 hari beruntun', damage: 100, done: false },
            { id: 'ft-2', text: 'Tolak godaan belanja online tidak terencana', damage: 100, done: false },
            { id: 'ft-3', text: 'Sisihkan tabungan darurat Rp 50.000', damage: 100, done: false },
            { id: 'ft-4', text: 'Evaluasi pengeluaran mingguan dengan rapi', damage: 100, done: false }
        ]
    }
];

const SHOP_ITEMS = [
    // Real Life Rewards (Gunakan Gold untuk Membeli Hadiah Nyata)
    {
        id: 'reward-game',
        name: 'Voucher Main Game Favorit 1 Jam',
        category: 'real',
        price: 50,
        icon: '🎮',
        desc: 'Hadiah bebas rasa bersalah untuk bermain game 1 jam setelah tugas tuntas.'
    },
    {
        id: 'reward-coffee',
        name: 'Voucher Beli Minuman / Kopi Favorit',
        category: 'real',
        price: 80,
        icon: '☕',
        desc: 'Nikmati kopi susu atau boba di kantin sebagai apresiasi kerja kerasmu.'
    },
    {
        id: 'reward-movie',
        name: 'Tiket Nonton Film / Streaming Akhir Pekan',
        category: 'real',
        price: 150,
        icon: '🎬',
        desc: 'Hadiahi dirimu maraton 1 film favorit di akhir pekan tanpa beban tugas.'
    },
    {
        id: 'reward-snack',
        name: 'Camilan Enak Bebas Kalori Khawatir',
        category: 'real',
        price: 40,
        icon: '🍰',
        desc: 'Beli camilan lezat yang kamu idam-idamkan sepanjang minggu ini.'
    },

    // In-Game Power-Ups & Relics
    {
        id: 'item-xp-potion',
        name: 'Elixir of Enlightenment',
        category: 'game',
        price: 120,
        icon: '🧪',
        desc: 'Memberikan +50 XP instan dan mempercepat kenaikan level karaktermu.'
    },
    {
        id: 'item-streak-shield',
        name: 'Shield of Consistency',
        category: 'game',
        price: 180,
        icon: '🛡️',
        desc: 'Melindungi streak harian jika suatu saat Anda berhalangan login 1 hari.'
    },
    {
        id: 'item-stat-tome',
        name: 'Ancient Tome of Focus',
        category: 'game',
        price: 220,
        icon: '📜',
        desc: 'Menambahkan +5 poin atribut Intelligence (INT) secara permanen.'
    }
];

const ACHIEVEMENTS = [
    {
        id: 'ach-first-step',
        title: 'Langkah Pertama Ksatria',
        desc: 'Selesaikan misi harian pertamamu dalam LifeQuest.',
        icon: '🌱',
        reqType: 'quests_completed',
        reqVal: 1,
        rewardXP: 50,
        rewardGold: 30,
        unlocked: false
    },
    {
        id: 'ach-five-quests',
        title: 'Pejuang Produktif',
        desc: 'Tuntaskan total 5 misi harian.',
        icon: '⚔️',
        reqType: 'quests_completed',
        reqVal: 5,
        rewardXP: 100,
        rewardGold: 60,
        unlocked: false
    },
    {
        id: 'ach-ten-quests',
        title: 'Master Rutinitas',
        desc: 'Tuntaskan total 10 misi harian.',
        icon: '🏅',
        reqType: 'quests_completed',
        reqVal: 10,
        rewardXP: 200,
        rewardGold: 120,
        unlocked: false
    },
    {
        id: 'ach-level-3',
        title: 'Peningkatan Kemampuan (Level 3)',
        desc: 'Tingkatkan level karaktermu hingga mencapai Level 3.',
        icon: '⭐',
        reqType: 'level',
        reqVal: 3,
        rewardXP: 150,
        rewardGold: 80,
        unlocked: false
    },
    {
        id: 'ach-level-5',
        title: 'Veteran Disiplin (Level 5)',
        desc: 'Capai Level 5 dalam perjalanan LifeQuest.',
        icon: '👑',
        reqType: 'level',
        reqVal: 5,
        rewardXP: 300,
        rewardGold: 200,
        unlocked: false
    },
    {
        id: 'ach-rich',
        title: 'Kolektor Koin Emas',
        desc: 'Kumpulkan total saldo 250 Gold.',
        icon: '💰',
        reqType: 'gold_held',
        reqVal: 250,
        rewardXP: 120,
        rewardGold: 50,
        unlocked: false
    },
    {
        id: 'ach-int-master',
        title: 'Otak Cemerlang (INT 20)',
        desc: 'Kembangkan atribut Intelligence hingga poin 20.',
        icon: '🧠',
        reqType: 'stat_int',
        reqVal: 20,
        rewardXP: 150,
        rewardGold: 75,
        unlocked: false
    },
    {
        id: 'ach-pomodoro-focus',
        title: 'Fokus Tanpa Batas',
        desc: 'Selesaikan 3 sesi Pomodoro belajar mendalam.',
        icon: '⏱️',
        reqType: 'pomodoro_done',
        reqVal: 3,
        rewardXP: 100,
        rewardGold: 50,
        unlocked: false
    },
    {
        id: 'ach-boss-slayer',
        title: 'Penakluk Raksasa',
        desc: 'Tumbangkan salah satu Epic Boss dalam tantangan besar.',
        icon: '🏆',
        reqType: 'bosses_defeated',
        reqVal: 1,
        rewardXP: 350,
        rewardGold: 200,
        unlocked: false
    }
];

// Leveling formula: XP for Level L = 100 * (L ^ 1.25)
function getXpForNextLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.25));
}
