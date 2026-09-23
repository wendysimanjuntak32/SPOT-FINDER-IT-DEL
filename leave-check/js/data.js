/**
 * LeaveCheck Master Data: Smart Item Catalog, Rules Engine, and Presets
 */

const ITEM_CATALOG = [
    {
        id: 'tumbler',
        name: 'Tumbler Air Minum',
        icon: '🍶',
        category: 'essential',
        desc: 'Bawa air minum sendiri untuk menghemat pengeluaran dan menjaga hidrasi.',
        importance: 'high',
        triggerRules: ['always', 'activity_study', 'activity_workout', 'activity_canteen']
    },
    {
        id: 'umbrella',
        name: 'Payung Lipat',
        icon: '☂️',
        category: 'weather',
        desc: 'Lindungi diri dari hujan deras atau panas terik saat menyeberang antar gedung.',
        importance: 'high',
        triggerRules: ['weather_rainy', 'weather_cloudy']
    },
    {
        id: 'thermos_night',
        name: 'Termos Air Hangat (Malam)',
        icon: '🫖',
        category: 'night',
        desc: 'Wajib diisi air hangat untuk menemani belajar saat udara malam Laguboti menusuk dingin.',
        importance: 'high',
        triggerRules: ['time_night', 'activity_night_study', 'weather_cold']
    },
    {
        id: 'jacket_worn',
        name: 'Jaket / Hoodie Dipakai (Malam)',
        icon: '🧥',
        category: 'night',
        desc: 'Pakai jaket tebal langsung sebelum melangkah keluar pintu asrama di malam hari.',
        importance: 'high',
        triggerRules: ['time_night', 'weather_cold', 'activity_night_study']
    },
    {
        id: 'spoon_canteen',
        name: 'Sendok & Garpu Pribadi (Kantin)',
        icon: '🥄',
        category: 'canteen',
        desc: 'Bawa peralatan makan higienis sendiri saat menuju kantin kampus atau asrama.',
        importance: 'high',
        triggerRules: ['activity_canteen', 'dest_canteen']
    },
    {
        id: 'ktm_del',
        name: 'KTM & Tali Lanyard Del',
        icon: '🪪',
        category: 'essential',
        desc: 'Kartu identitas resmi wajib untuk absensi kuliah, akses perpus, dan gerbang kampus.',
        importance: 'critical',
        triggerRules: ['always', 'dest_gd', 'dest_library', 'dest_lab']
    },
    {
        id: 'dorm_key',
        name: 'Kunci Kamar Asrama',
        icon: '🔑',
        category: 'essential',
        desc: 'Pastikan kamar terkunci dan kunci sudah aman di saku agar tidak terkunci di luar.',
        importance: 'critical',
        triggerRules: ['always']
    },
    {
        id: 'laptop_charger',
        name: 'Laptop & Charger Adaptor',
        icon: '💻',
        category: 'study',
        desc: 'Perangkat utama koding, praktikum lab, dan tugas proyek kuliah.',
        importance: 'high',
        triggerRules: ['dest_lab', 'dest_library', 'activity_study']
    },
    {
        id: 'phone_cable',
        name: 'Kabel Charger / Powerbank HP',
        icon: '🔋',
        category: 'study',
        desc: 'Jaga baterai ponsel tetap penuh untuk koordinasi kelompok dan presensi QR.',
        importance: 'medium',
        triggerRules: ['activity_study', 'time_night']
    },
    {
        id: 'notebook_pen',
        name: 'Buku Catatan & Pulpen',
        icon: '📓',
        category: 'study',
        desc: 'Mencatat materi penting dosen dan poin diskusi praktikum.',
        importance: 'medium',
        triggerRules: ['dest_gd', 'activity_study']
    },
    {
        id: 'tissue_pack',
        name: 'Tisu Kering / Basah Saku',
        icon: '🧻',
        category: 'canteen',
        desc: 'Membersihkan meja belajar atau sehabis makan di kantin.',
        importance: 'low',
        triggerRules: ['activity_canteen', 'dest_canteen']
    }
];

const PRESETS = [
    {
        id: 'preset-gd-morning',
        name: 'Kuliah Pagi di Gedung Kuliah (GD 5/7/9)',
        destination: 'gd',
        timeOfDay: 'morning',
        weather: 'cloudy',
        activity: 'study',
        icon: '🏫',
        desc: 'KTM, Tumbler, Kunci Kamar, Buku, Payung Sedia.'
    },
    {
        id: 'preset-night-library',
        name: 'Nugas Malam di Perpustakaan IT Del',
        destination: 'library',
        timeOfDay: 'night',
        weather: 'cold',
        activity: 'night_study',
        icon: '🌙',
        desc: 'Termos Air Hangat, Jaket Tebal Dipakai, Tumbler, Laptop, Charger.'
    },
    {
        id: 'preset-canteen-lunch',
        name: 'Makan Siang ke Kantin Utama Del',
        destination: 'canteen',
        timeOfDay: 'afternoon',
        weather: 'sunny',
        activity: 'canteen',
        icon: '🍱',
        desc: 'Sendok Pribadi, Tumbler, Kunci Kamar, Tisu, Dompet/KTM.'
    },
    {
        id: 'preset-lab-practicum',
        name: 'Praktikum di Lab Komputer Del',
        destination: 'lab',
        timeOfDay: 'afternoon',
        weather: 'cloudy',
        activity: 'study',
        icon: '🖥️',
        desc: 'Laptop + Charger, Flashdisk, KTM, Tumbler, Kunci Kamar.'
    }
];
