/**
 * TemanSeperjalanan IT Del - Database Rute, Tebengan & Teman Jalan ke Asrama
 */

const INITIAL_RIDES = [
    // ==========================================
    // RUTE KHUSUS: PULANG BARENG KE ASRAMA IT DEL
    // ==========================================
    {
        id: "ride-asrama-1",
        driver: {
            name: "Bona Sitompul",
            nim: "11S220xx",
            prodi: "S1 Informatika '22",
            rating: 5.0,
            tripsCount: 15,
            avatar: "🚶‍♂️",
            phone: "+6281299887766",
            verifiedCampus: true
        },
        origin: "Perpustakaan IT Del (Lantai 2)",
        destination: "Asrama Silo & Kapernaum",
        date: "Malam Ini",
        time: "21:15 WIB (Setelah Tutup Perpus)",
        vehicleType: "walk", // 'walk' | 'motorcycle' | 'car'
        vehicleName: "Jalan Kaki Bareng 🚶‍♂️",
        totalSeats: 6,
        availableSeats: 3,
        costPerPerson: 0, // Gratis teman jalan
        totalEstimatedCost: 0,
        notes: "Selesai ngerjain tugas skripsi di perpus. Yuk jalan bareng ke asrama biar ramai dan gak sepi malam-malam!",
        passengers: ["Bona", "Togu (S1 SI)", "Josua (D3 TI)"],
        tags: ["Pulang Asrama", "Jalan Bareng", "Asrama Silo", "Gratis", "Malam Ini"],
        status: "available",
        isDormRoute: true
    },
    {
        id: "ride-asrama-2",
        driver: {
            name: "Grace Nainggolan",
            nim: "12S230xx",
            prodi: "S1 Sistem Informasi '23",
            rating: 5.0,
            tripsCount: 22,
            avatar: "🚶‍♀️",
            phone: "+6281355667788",
            verifiedCampus: true
        },
        origin: "Gedung 9 (Lab Komputer GD 921)",
        destination: "Asrama Putri (Anthiokia & Danau Toba)",
        date: "Malam Ini",
        time: "21:30 WIB",
        vehicleType: "walk",
        vehicleName: "Jalan Kaki Bareng (Khusus Mahasiswi) 🚶‍♀️",
        totalSeats: 5,
        availableSeats: 2,
        costPerPerson: 0,
        totalEstimatedCost: 0,
        notes: "Keluar dari lab koding jam setengah 10 malam. Cari teman mahasiswi yang searah pulang ke Asrama Anthiokia / Danau Toba.",
        passengers: ["Grace", "Mega (TRPL)", "Rina (Bioproses)"],
        tags: ["Pulang Asrama", "Khusus Mahasiswi", "Asrama Anthiokia", "Gratis", "Malam Ini"],
        status: "available",
        isDormRoute: true
    },
    {
        id: "ride-asrama-3",
        driver: {
            name: "Rian Panjaitan",
            nim: "14S220xx",
            prodi: "S1 Manajemen Rekayasa '22",
            rating: 4.9,
            tripsCount: 12,
            avatar: "🛵",
            phone: "+6282133445566",
            verifiedCampus: true
        },
        origin: "GD 7 (Ruang Belajar GD 712)",
        destination: "Asrama Mamre & Pniel",
        date: "Malam Ini",
        time: "21:00 WIB",
        vehicleType: "motorcycle",
        vehicleName: "Motor Vario Tebengan Singkat",
        totalSeats: 1,
        availableSeats: 1,
        costPerPerson: 0,
        totalEstimatedCost: 0,
        notes: "Ada 1 helm cadangan. Tebengan gratis langsung meluncur ke gerbang Asrama Mamre.",
        passengers: ["Rian"],
        tags: ["Pulang Asrama", "Motor Tebengan", "Asrama Mamre", "Gratis", "Malam Ini"],
        status: "available",
        isDormRoute: true
    },
    {
        id: "ride-asrama-4",
        driver: {
            name: "Samuel Harianja",
            nim: "133230xx",
            prodi: "D3 Teknologi Komputer '23",
            rating: 4.95,
            tripsCount: 8,
            avatar: "🚶‍♂️",
            phone: "+6281311223344",
            verifiedCampus: true
        },
        origin: "Kantin / Sopo Del",
        destination: "Asrama Mahasiswa (Semua Asrama)",
        date: "Malam Ini",
        time: "20:45 WIB",
        vehicleType: "walk",
        vehicleName: "Rombongan Jalan Kaki Selesai Makan 🚶‍♂️",
        totalSeats: 8,
        availableSeats: 4,
        costPerPerson: 0,
        totalEstimatedCost: 0,
        notes: "Selesai santap malam & ngopi di Sopo Del, jalan santai bareng balik ke lorong asrama.",
        passengers: ["Samuel", "Dodi", "Niko", "Ferry"],
        tags: ["Pulang Asrama", "Jalan Santai", "Sopo Del", "Gratis"],
        status: "available",
        isDormRoute: true
    },

    // Rute Luar Kampus (Silangit, Balige, Porsea, dll)
    {
        id: "ride-1",
        driver: {
            name: "Kevin Simanjuntak",
            nim: "11S210xx",
            prodi: "S1 Informatika '21",
            rating: 4.95,
            tripsCount: 24,
            avatar: "👨‍💻",
            phone: "+6281234567890",
            verifiedCampus: true
        },
        origin: "Kampus IT Del (Laguboti)",
        destination: "Bandara Internasional Silangit (DTB)",
        date: "Jumat Sore",
        time: "15:30 WIB",
        vehicleType: "car",
        vehicleName: "Toyota Avanza Hitam",
        totalSeats: 4,
        availableSeats: 2,
        costPerPerson: 35000,
        totalEstimatedCost: 140000,
        notes: "Mau balik liburan akhir pekan. Bagasi luas muat koper sedang. Titik kumpul di gerbang utama IT Del.",
        passengers: ["Kevin", "Andre (S1 SI)"],
        tags: ["Bandara Silangit", "Weekend", "Bagasi Luas"],
        status: "available",
        isDormRoute: false
    },
    {
        id: "ride-2",
        driver: {
            name: "Putri Hutapea",
            nim: "12S220xx",
            prodi: "S1 Sistem Informasi '22",
            rating: 5.0,
            tripsCount: 18,
            avatar: "👩‍🎓",
            phone: "+6281398765432",
            verifiedCampus: true
        },
        origin: "Balige Kota (Pasar Balige)",
        destination: "Kampus IT Del (Gedung 7)",
        date: "Besok Pagi",
        time: "07:15 WIB",
        vehicleType: "motorcycle",
        vehicleName: "Honda Scoopy Putih",
        totalSeats: 1,
        availableSeats: 1,
        costPerPerson: 8000,
        totalEstimatedCost: 16000,
        notes: "Berangkat pagi mengejar kuliah jam 08:00 WIB di GD 7. Helm cadangan bersih tersedia.",
        passengers: ["Putri"],
        tags: ["Khusus Mahasiswi", "Pagi Hari", "Kuliah GD 7"],
        status: "available",
        isDormRoute: false
    }
];

const IT_DEL_ASRAMA_LIST = [
    { name: "Asrama Silo", gender: "Putra", icon: "🏠", loc: "Sisi Timur Kampus" },
    { name: "Asrama Kapernaum", gender: "Putra", icon: "🏠", loc: "Sisi Timur Kampus" },
    { name: "Asrama Anthiokia", gender: "Putri", icon: "🏡", loc: "Sisi Barat Kampus" },
    { name: "Asrama Danau Toba", gender: "Putri", icon: "🏡", loc: "Tepi Danau Toba" },
    { name: "Asrama Mamre", gender: "Putra", icon: "🏠", loc: "Kompleks Atas" },
    { name: "Asrama Pniel", gender: "Putra", icon: "🏠", loc: "Kompleks Atas" },
    { name: "Asrama Sion", gender: "Putri", icon: "🏡", loc: "Sisi Barat" }
];
