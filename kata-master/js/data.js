/**
 * KataMaster - Data Soal & Kurikulum Pembelajaran
 * Format unit dengan berbagai tipe latihan:
 * - translate-to-en: Terjemahkan kalimat Bahasa Indonesia ke Bahasa Inggris dengan Word Bank
 * - translate-to-id: Terjemahkan kalimat Bahasa Inggris ke Bahasa Indonesia dengan Word Bank
 * - listening: Dengarkan audio dan susun kalimatnya
 * - scramble: Susun huruf/suku kata untuk mengeja kata target
 */

const GAME_UNITS = [
    {
        id: "unit-1",
        number: 1,
        title: "Perkenalan & Sapaan",
        subtitle: "Pelajari kata dasar, sapaan hangat, dan memperkenalkan diri",
        icon: "👋",
        color: "#58cc02", // Duolingo Green
        lessons: [
            {
                id: "u1-l1",
                title: "Sapaan Pagi & Dasar",
                xp: 20,
                questions: [
                    {
                        id: "q1",
                        type: "translate-to-en",
                        prompt: "Halo, selamat pagi!",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun terjemahan dalam Bahasa Inggris:",
                        correctWords: ["Hello", "good", "morning"],
                        distractors: ["night", "bye", "afternoon", "thanks"],
                        tip: "Gunakan 'good morning' untuk menyapa di pagi hari."
                    },
                    {
                        id: "q2",
                        type: "translate-to-id",
                        prompt: "Thank you very much!",
                        promptLang: "en-US",
                        targetLang: "id-ID",
                        instruction: "Susun terjemahan dalam Bahasa Indonesia:",
                        correctWords: ["Terima", "kasih", "banyak"],
                        distractors: ["sama-sama", "maaf", "halo", "tolong"],
                        tip: "'Thank you very much' berarti 'Terima kasih banyak'."
                    },
                    {
                        id: "q3",
                        type: "listening",
                        prompt: "How are you today?",
                        promptLang: "en-US",
                        targetLang: "en-US",
                        instruction: "Dengarkan audio dan susun kalimatnya:",
                        correctWords: ["How", "are", "you", "today"],
                        distractors: ["who", "is", "they", "yesterday"],
                        tip: "Dengarkan baik-baik kata tanya 'How' di awal kalimat."
                    },
                    {
                        id: "q4",
                        type: "scramble",
                        prompt: "Kucing (Bahasa Inggris)",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun huruf-huruf ini membentuk kata yang benar:",
                        targetWord: "CAT",
                        correctLetters: ["C", "A", "T"],
                        distractors: ["R", "O", "B"],
                        tip: "Kosakata bahasa inggris untuk 'kucing' adalah C-A-T."
                    },
                    {
                        id: "q5",
                        type: "translate-to-en",
                        prompt: "Nama saya adalah Budi.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat yang benar:",
                        correctWords: ["My", "name", "is", "Budi"],
                        distractors: ["His", "are", "friend", "your"],
                        tip: "'My name is...' adalah pola perkenalan nama sendiri."
                    }
                ]
            },
            {
                id: "u1-l2",
                title: "Saya & Teman Baru",
                xp: 25,
                questions: [
                    {
                        id: "q6",
                        type: "translate-to-en",
                        prompt: "Saya senang bertemu denganmu.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun terjemahan Bahasa Inggris:",
                        correctWords: ["Nice", "to", "meet", "you"],
                        distractors: ["Good", "see", "him", "bye"],
                        tip: "'Nice to meet you' digunakan saat pertama kali bertemu seseorang."
                    },
                    {
                        id: "q7",
                        type: "listening",
                        prompt: "I am a happy student.",
                        promptLang: "en-US",
                        targetLang: "en-US",
                        instruction: "Dengar dan susun kata yang kamu dengar:",
                        correctWords: ["I", "am", "a", "happy", "student"],
                        distractors: ["you", "are", "teacher", "sad"],
                        tip: "'Student' berarti murid atau siswa."
                    },
                    {
                        id: "q8",
                        type: "translate-to-id",
                        prompt: "Where do you live?",
                        promptLang: "en-US",
                        targetLang: "id-ID",
                        instruction: "Susun kalimat terjemahan:",
                        correctWords: ["Di", "mana", "kamu", "tinggal"],
                        distractors: ["ke", "kapan", "dia", "makan"],
                        tip: "'Where' menanyakan tempat (di mana)."
                    },
                    {
                        id: "q9",
                        type: "scramble",
                        prompt: "Teman / Kawan (Bahasa Inggris)",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun huruf-huruf menjadi kata yang tepat:",
                        targetWord: "FRIEND",
                        correctLetters: ["F", "R", "I", "E", "N", "D"],
                        distractors: ["T", "O", "P"],
                        tip: "Kunci: F-R-I-E-N-D (Friend)."
                    },
                    {
                        id: "q10",
                        type: "translate-to-en",
                        prompt: "Sampai jumpa besok pagi!",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat bahasa Inggris:",
                        correctWords: ["See", "you", "tomorrow", "morning"],
                        distractors: ["good", "yesterday", "tonight", "later"],
                        tip: "'See you tomorrow' berarti sampai jumpa besok."
                    }
                ]
            }
        ]
    },
    {
        id: "unit-2",
        number: 2,
        title: "Makanan & Minuman",
        subtitle: "Pesan makanan lezat di restoran dan sebutkan menu favoritmu",
        icon: "🍔",
        color: "#1cb0f6", // Whale Blue
        lessons: [
            {
                id: "u2-l1",
                title: "Menu Favorit",
                xp: 25,
                questions: [
                    {
                        id: "q11",
                        type: "translate-to-en",
                        prompt: "Saya ingin minum air dingin.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat dalam Bahasa Inggris:",
                        correctWords: ["I", "want", "to", "drink", "cold", "water"],
                        distractors: ["eat", "hot", "tea", "she"],
                        tip: "Cold water = air dingin, drink = minum."
                    },
                    {
                        id: "q12",
                        type: "listening",
                        prompt: "This delicious pizza is for dinner.",
                        promptLang: "en-US",
                        targetLang: "en-US",
                        instruction: "Dengarkan audio dan susun kata-katanya:",
                        correctWords: ["This", "delicious", "pizza", "is", "for", "dinner"],
                        distractors: ["lunch", "burger", "was", "breakfast"],
                        tip: "Delicious = lezat/enak, dinner = makan malam."
                    },
                    {
                        id: "q13",
                        type: "translate-to-id",
                        prompt: "Can I have a cup of coffee?",
                        promptLang: "en-US",
                        targetLang: "id-ID",
                        instruction: "Susun kalimat terjemahan:",
                        correctWords: ["Bolehkah", "saya", "minta", "secangkir", "kopi"],
                        distractors: ["segelas", "teh", "kamu", "memberi"],
                        tip: "A cup of coffee = secangkir kopi."
                    },
                    {
                        id: "q14",
                        type: "scramble",
                        prompt: "Roti (Bahasa Inggris)",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun huruf-huruf ini:",
                        targetWord: "BREAD",
                        correctLetters: ["B", "R", "E", "A", "D"],
                        distractors: ["K", "N", "U"],
                        tip: "Kosakata: B-R-E-A-D (Bread)."
                    },
                    {
                        id: "q15",
                        type: "translate-to-en",
                        prompt: "Mereka suka makan nasi goreng.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat bahasa Inggris:",
                        correctWords: ["They", "like", "to", "eat", "fried", "rice"],
                        distractors: ["We", "drinks", "cook", "noodle"],
                        tip: "Fried rice = nasi goreng."
                    }
                ]
            },
            {
                id: "u2-l2",
                title: "Di Meja Makan & Resto",
                xp: 30,
                questions: [
                    {
                        id: "q16",
                        type: "translate-to-en",
                        prompt: "Berapa harga makanan ini?",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat yang tepat:",
                        correctWords: ["How", "much", "is", "this", "food"],
                        distractors: ["many", "are", "that", "drink"],
                        tip: "'How much' digunakan untuk menanyakan harga benda."
                    },
                    {
                        id: "q17",
                        type: "listening",
                        prompt: "She eats fresh fruits every day.",
                        promptLang: "en-US",
                        targetLang: "en-US",
                        instruction: "Dengarkan dan susun kalimat:",
                        correctWords: ["She", "eats", "fresh", "fruits", "every", "day"],
                        distractors: ["he", "vegetables", "week", "cooks"],
                        tip: "Fresh fruits = buah-buahan segar."
                    },
                    {
                        id: "q18",
                        type: "scramble",
                        prompt: "Apel (Bahasa Inggris)",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun huruf membentuk buah apel:",
                        targetWord: "APPLE",
                        correctLetters: ["A", "P", "P", "L", "E"],
                        distractors: ["S", "Y", "Z"],
                        tip: "A-P-P-L-E = Apple."
                    },
                    {
                        id: "q19",
                        type: "translate-to-id",
                        prompt: "The ice cream is very sweet.",
                        promptLang: "en-US",
                        targetLang: "id-ID",
                        instruction: "Susun terjemahan Bahasa Indonesia:",
                        correctWords: ["Es", "krim", "itu", "sangat", "manis"],
                        distractors: ["pedas", "asin", "dingin", "ini"],
                        tip: "Sweet = manis."
                    },
                    {
                        id: "q20",
                        type: "translate-to-en",
                        prompt: "Tolong bawakan tagihannya.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat dalam Bahasa Inggris:",
                        correctWords: ["Please", "bring", "the", "bill"],
                        distractors: ["menu", "take", "food", "table"],
                        tip: "Bill = tagihan / nota pembayaran di resto."
                    }
                ]
            }
        ]
    },
    {
        id: "unit-3",
        number: 3,
        title: "Aktivitas Sehari-hari",
        subtitle: "Ceritakan kegiatan rutin, hobi, dan waktu luangmu",
        icon: "⏰",
        color: "#ffc800", // Canary Yellow
        lessons: [
            {
                id: "u3-l1",
                title: "Rutinitas Pagi & Sekolah",
                xp: 30,
                questions: [
                    {
                        id: "q21",
                        type: "translate-to-en",
                        prompt: "Saya bangun tidur jam enam pagi.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat bahasa Inggris:",
                        correctWords: ["I", "wake", "up", "at", "six", "am"],
                        distractors: ["sleep", "seven", "pm", "goes"],
                        tip: "Wake up = bangun tidur, at six am = jam enam pagi."
                    },
                    {
                        id: "q22",
                        type: "listening",
                        prompt: "We go to school together by bus.",
                        promptLang: "en-US",
                        targetLang: "en-US",
                        instruction: "Dengarkan audio dan susun kalimatnya:",
                        correctWords: ["We", "go", "to", "school", "together", "by", "bus"],
                        distractors: ["they", "home", "car", "walk"],
                        tip: "Together = bersama-sama, by bus = naik bus."
                    },
                    {
                        id: "q23",
                        type: "translate-to-id",
                        prompt: "He is reading an interesting book.",
                        promptLang: "en-US",
                        targetLang: "id-ID",
                        instruction: "Susun kalimat terjemahan:",
                        correctWords: ["Dia", "sedang", "membaca", "buku", "yang", "menarik"],
                        distractors: ["menulis", "koran", "mereka", "membeli"],
                        tip: "Interesting book = buku yang menarik."
                    },
                    {
                        id: "q24",
                        type: "scramble",
                        prompt: "Sekolah (Bahasa Inggris)",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun huruf-huruf ini:",
                        targetWord: "SCHOOL",
                        correctLetters: ["S", "C", "H", "O", "O", "L"],
                        distractors: ["T", "W", "K"],
                        tip: "S-C-H-O-O-L."
                    },
                    {
                        id: "q25",
                        type: "translate-to-en",
                        prompt: "Apakah kamu sudah mengerjakan tugasmu?",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun pertanyaan bahasa Inggris:",
                        correctWords: ["Did", "you", "do", "your", "homework"],
                        distractors: ["Does", "my", "game", "clean"],
                        tip: "Homework = pekerjaan rumah / tugas sekolah."
                    }
                ]
            },
            {
                id: "u3-l2",
                title: "Hobi & Olahraga",
                xp: 35,
                questions: [
                    {
                        id: "q26",
                        type: "translate-to-en",
                        prompt: "Kami bermain sepak bola di sore hari.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun terjemahan yang tepat:",
                        correctWords: ["We", "play", "football", "in", "the", "afternoon"],
                        distractors: ["They", "basketball", "morning", "night"],
                        tip: "Football = sepak bola, in the afternoon = di sore hari."
                    },
                    {
                        id: "q27",
                        type: "listening",
                        prompt: "Music makes me feel so relaxed.",
                        promptLang: "en-US",
                        targetLang: "en-US",
                        instruction: "Dengarkan dan susun kalimat:",
                        correctWords: ["Music", "makes", "me", "feel", "so", "relaxed"],
                        distractors: ["Movie", "happy", "us", "tired"],
                        tip: "Relaxed = santai/tenang."
                    },
                    {
                        id: "q28",
                        type: "scramble",
                        prompt: "Bermain (Bahasa Inggris)",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun huruf:",
                        targetWord: "PLAY",
                        correctLetters: ["P", "L", "A", "Y"],
                        distractors: ["N", "G", "X"],
                        tip: "P-L-A-Y = Play."
                    },
                    {
                        id: "q29",
                        type: "translate-to-id",
                        prompt: "She loves drawing pictures of animals.",
                        promptLang: "en-US",
                        targetLang: "id-ID",
                        instruction: "Susun kalimat:",
                        correctWords: ["Dia", "suka", "menggambar", "gambar", "hewan"],
                        distractors: ["memotret", "pohon", "mereka", "mewarnai"],
                        tip: "Drawing = menggambar, animals = hewan."
                    },
                    {
                        id: "q30",
                        type: "translate-to-en",
                        prompt: "Waktu luang saya sangat berharga.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat bahasa Inggris:",
                        correctWords: ["My", "free", "time", "is", "very", "valuable"],
                        distractors: ["busy", "money", "was", "good"],
                        tip: "Free time = waktu luang, valuable = berharga."
                    }
                ]
            }
        ]
    },
    {
        id: "unit-4",
        number: 4,
        title: "Petualangan & Bepergian",
        subtitle: "Jelajahi dunia, pesan tiket transportasi, dan tanyakan arah",
        icon: "✈️",
        color: "#ce82ff", // Purple
        lessons: [
            {
                id: "u4-l1",
                title: "Di Bandara & Stasiun",
                xp: 35,
                questions: [
                    {
                        id: "q31",
                        type: "translate-to-en",
                        prompt: "Di mana stasiun kereta terdekat?",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat pertanyaan:",
                        correctWords: ["Where", "is", "the", "nearest", "train", "station"],
                        distractors: ["airport", "far", "which", "bus"],
                        tip: "Nearest train station = stasiun kereta terdekat."
                    },
                    {
                        id: "q32",
                        type: "listening",
                        prompt: "The airplane is ready to take off.",
                        promptLang: "en-US",
                        targetLang: "en-US",
                        instruction: "Dengarkan audio dan susun kata-katanya:",
                        correctWords: ["The", "airplane", "is", "ready", "to", "take", "off"],
                        distractors: ["train", "was", "land", "fly"],
                        tip: "Take off = lepas landas."
                    },
                    {
                        id: "q33",
                        type: "translate-to-id",
                        prompt: "I need to buy two travel tickets.",
                        promptLang: "en-US",
                        targetLang: "id-ID",
                        instruction: "Susun terjemahan Bahasa Indonesia:",
                        correctWords: ["Saya", "perlu", "membeli", "dua", "tiket", "perjalanan"],
                        distractors: ["tiga", "menjual", "kartu", "makanan"],
                        tip: "Two travel tickets = dua tiket perjalanan."
                    },
                    {
                        id: "q34",
                        type: "scramble",
                        prompt: "Paspor / Dokumen (Bahasa Inggris)",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun huruf-huruf menjadi kata yang tepat:",
                        targetWord: "PASSPORT",
                        correctLetters: ["P", "A", "S", "S", "P", "O", "R", "T"],
                        distractors: ["E", "M"],
                        tip: "P-A-S-S-P-O-R-T."
                    },
                    {
                        id: "q35",
                        type: "translate-to-en",
                        prompt: "Liburan di pantai sangat menyenangkan!",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat bahasa Inggris:",
                        correctWords: ["Vacation", "at", "the", "beach", "is", "fun"],
                        distractors: ["mountain", "sad", "work", "hotel"],
                        tip: "Beach = pantai, vacation = liburan."
                    }
                ]
            }
        ]
    },
    {
        id: "unit-5",
        number: 5,
        title: "Tantangan Master Kosa Kata",
        subtitle: "Uji kecepatan, ketepatan, dan kuasai semua kata tingkat tinggi",
        icon: "👑",
        color: "#ff4b4b", // Coral Fox Red
        lessons: [
            {
                id: "u5-l1",
                title: "Ujian Kelulusan KataMaster",
                xp: 50,
                questions: [
                    {
                        id: "q36",
                        type: "translate-to-en",
                        prompt: "Latihan setiap hari membuat kita semakin pintar.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat master:",
                        correctWords: ["Daily", "practice", "makes", "us", "much", "smarter"],
                        distractors: ["study", "hard", "them", "foolish"],
                        tip: "Daily practice = latihan harian, smarter = lebih pintar."
                    },
                    {
                        id: "q37",
                        type: "listening",
                        prompt: "Congratulations on completing this language quest!",
                        promptLang: "en-US",
                        targetLang: "en-US",
                        instruction: "Dengarkan audio ucapan selamat dan susun kata-katanya:",
                        correctWords: ["Congratulations", "on", "completing", "this", "language", "quest"],
                        distractors: ["Welcome", "starting", "game", "journey"],
                        tip: "Congratulations = Selamat!"
                    },
                    {
                        id: "q38",
                        type: "scramble",
                        prompt: "Juara / Pemenang (Bahasa Inggris)",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun huruf:",
                        targetWord: "CHAMPION",
                        correctLetters: ["C", "H", "A", "M", "P", "I", "O", "N"],
                        distractors: ["E", "Z"],
                        tip: "C-H-A-M-P-I-O-N."
                    },
                    {
                        id: "q39",
                        type: "translate-to-id",
                        prompt: "Never stop learning because life never stops teaching.",
                        promptLang: "en-US",
                        targetLang: "id-ID",
                        instruction: "Susun kalimat bijak ini:",
                        correctWords: ["Jangan", "pernah", "berhenti", "belajar", "karena", "hidup", "tidak", "pernah", "berhenti", "mengajar"],
                        distractors: ["selalu", "sekolah", "tidur"],
                        tip: "Pesan motivasi untuk terus belajar!"
                    },
                    {
                        id: "q40",
                        type: "translate-to-en",
                        prompt: "Saya siap menaklukkan dunia dengan ilmu pengetahuan.",
                        promptLang: "id-ID",
                        targetLang: "en-US",
                        instruction: "Susun kalimat penutup:",
                        correctWords: ["I", "am", "ready", "to", "conquer", "the", "world"],
                        distractors: ["we", "was", "stop", "dream"],
                        tip: "Conquer the world = menaklukkan dunia."
                    }
                ]
            }
        ]
    }
];

// Mode Latihan Cepat / Endless Generator
const QUICK_PRACTICE_POOL = [
    {
        type: "translate-to-en",
        prompt: "Kopi ini terlalu manis untuk saya.",
        correctWords: ["This", "coffee", "is", "too", "sweet", "for", "me"],
        distractors: ["tea", "sour", "you", "hot"]
    },
    {
        type: "translate-to-en",
        prompt: "Burung itu bisa terbang sangat tinggi di langit.",
        correctWords: ["That", "bird", "can", "fly", "very", "high", "in", "the", "sky"],
        distractors: ["swim", "sea", "tree", "fast"]
    },
    {
        type: "translate-to-id",
        prompt: "My sister has three cute cats at home.",
        correctWords: ["Saudara", "perempuan", "saya", "punya", "tiga", "kucing", "lucu", "di", "rumah"],
        distractors: ["anjing", "dua", "dia"]
    },
    {
        type: "listening",
        prompt: "Learning new words is very exciting and fun.",
        promptLang: "en-US",
        correctWords: ["Learning", "new", "words", "is", "very", "exciting", "and", "fun"],
        distractors: ["Boring", "old", "hard"]
    },
    {
        type: "scramble",
        prompt: "Bintang di langit (Bahasa Inggris)",
        targetWord: "STAR",
        correctLetters: ["S", "T", "A", "R"],
        distractors: ["M", "O", "N"]
    }
];
