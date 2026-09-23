/**
 * RoomCheck IT Del - Database Laporan Masalah Asrama Kampus
 */

const INITIAL_REPORTS = [
    {
        id: "TICK-101",
        category: "water",
        categoryName: "Air Mati / Saluran Air",
        icon: "💧",
        dormName: "Asrama Silo",
        roomNumber: "Kamar 204 (Lantai 2)",
        reporter: {
            name: "Bona Sitompul",
            nim: "11S22015",
            prodi: "S1 Informatika '22",
            phone: "+6281299887766"
        },
        urgency: "high", // 'high' | 'medium' | 'low'
        urgencyLabel: "Mendesak / Darurat",
        title: "Kran Air Kamar Mandi Mati Total Sejak Pagi",
        description: "Air di kamar mandi kamar 204 dan 205 tidak mengalir sama sekali sejak jam 06:00 WIB. Sudah dicek valve utama lorong tetap tidak keluar air. Butuh penanganan cepat untuk mandi sebelum jam kuliah.",
        reportedAt: "Hari Ini, 07:15 WIB",
        status: "in-progress", // 'pending' | 'in-progress' | 'resolved'
        statusLabel: "Teknisi Sedang Menuju Lokasi",
        technician: "Pak Hotman (Divisi Sarpras IT Del)",
        techPhone: "+6281377889900",
        notes: "Teknisi sedang mengecek pompa sentral pipa blok timur asrama.",
        photoUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80"
    },
    {
        id: "TICK-102",
        category: "electricity",
        categoryName: "Listrik & Stopkontak",
        icon: "⚡",
        dormName: "Asrama Anthiokia",
        roomNumber: "Kamar 312 (Lantai 3)",
        reporter: {
            name: "Grace Nainggolan",
            nim: "12S23042",
            prodi: "S1 Sistem Informasi '23",
            phone: "+6281355667788"
        },
        urgency: "high",
        urgencyLabel: "Mendesak / Darurat",
        title: "MCB Listrik Sering Trip / Jeglek Saat Cas Laptop",
        description: "Stopkontak meja belajar nomor 2 mengeluarkan suara percikan kecil saat mencolokkan adaptor charger laptop. Lampu utama kamar ikut berkedip.",
        reportedAt: "Hari Ini, 14:20 WIB",
        status: "pending",
        statusLabel: "Menunggu Verifikasi Pembina",
        technician: "-",
        techPhone: "-",
        notes: "Harap segera diperiksa untuk menghindari potensi korsleting listrik.",
        photoUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&q=80"
    },
    {
        id: "TICK-103",
        category: "facility",
        categoryName: "Fasilitas & Kamar",
        icon: "🚪",
        dormName: "Asrama Kapernaum",
        roomNumber: "Kamar 108 (Lantai 1)",
        reporter: {
            name: "Samuel Harianja",
            nim: "13323008",
            prodi: "D3 Teknologi Komputer '23",
            phone: "+6281311223344"
        },
        urgency: "medium",
        urgencyLabel: "Sedang",
        title: "Kunci Grendel Pintu Rusak / Macet",
        description: "Engsel pintu kamar bagian bawah kendur dan grendel kunci pintu luar tidak bisa dikunci rapat dari dalam. Khawatir saat kamar ditinggal kuliah.",
        reportedAt: "Kemarin, 19:30 WIB",
        status: "resolved",
        statusLabel: "Selesai Diperbaiki",
        technician: "Pak Manurung (Teknisi Kayu & Kunci)",
        techPhone: "+6282144556677",
        notes: "Engsel pintu sudah diganti baru dan kunci grendel sudah diperbaiki. Kamar aman terkunci.",
        photoUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=400&q=80"
    },
    {
        id: "TICK-104",
        category: "cleanliness",
        categoryName: "Kebersihan & Sanitasi",
        icon: "🧹",
        dormName: "Asrama Danau Toba",
        roomNumber: "Lorong Lantai 2",
        reporter: {
            name: "Putri Hutapea",
            nim: "12S22018",
            prodi: "S1 Sistem Informasi '22",
            phone: "+6281398765432"
        },
        urgency: "low",
        urgencyLabel: "Ringan",
        title: "Tempat Sampah Lorong Penuh & Perlu Pengangkutan",
        description: "Tong sampah ujung lorong lantai 2 dekat tangga sudah penuh dan perlu pengangkutan serta penggantian kantong plastik sampah baru.",
        reportedAt: "Hari Ini, 09:10 WIB",
        status: "resolved",
        statusLabel: "Selesai Dibersihkan",
        technician: "Ibu Kebersihan Asrama Putri",
        techPhone: "-",
        notes: "Sampah sudah diangkut dan lorong sudah dipel bersih.",
        photoUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80"
    }
];

const ASRAMA_OPTIONS = [
    "Asrama Silo (Putra)",
    "Asrama Kapernaum (Putra)",
    "Asrama Anthiokia (Putri)",
    "Asrama Danau Toba (Putri)",
    "Asrama Mamre (Putra)",
    "Asrama Pniel (Putra)",
    "Asrama Sion (Putri)",
    "Asrama Rusunawa Del"
];

const CATEGORY_LIST = [
    { id: "water", name: "Air Mati / Masalah Saluran Air", icon: "💧", desc: "Kran mati, air keruh, pompa macet, pipa bocor" },
    { id: "electricity", name: "Listrik & Stopkontak", icon: "⚡", desc: "Lampu padam, MCB jeglek, saklar korsleting, stopkontak mati" },
    { id: "room", name: "Kamar Bermasalah & Kunci", icon: "🚪", desc: "Pintu macet, jendela bocor, kunci rusak, plafon rembes" },
    { id: "facility", name: "Fasilitas Rusak", icon: "🛠️", desc: "Kipas angin mati, meja/kursi belajar patah, jemuran rusak" },
    { id: "cleanliness", name: "Kebersihan & Sanitasi", icon: "🧹", desc: "Sampah menumpuk, kamar mandi kotor, saluran tersumbat" }
];
