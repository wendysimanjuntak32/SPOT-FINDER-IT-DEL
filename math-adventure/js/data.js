/**
 * Math Quest - Game Data, Monsters, Stages, Items, and Achievements
 */

const GAME_DATA = {
    avatars: [
        {
            id: 'knight',
            name: 'Ksatria Aritmatika',
            title: 'Pejuang Angka Tangguh',
            desc: 'Memiliki HP dan Pertahanan tinggi. Sangat cocok untuk petualangan awal.',
            icon: '🛡️',
            baseHp: 120,
            baseAtk: 18,
            baseDef: 5,
            svg: `<svg viewBox="0 0 100 100" class="hero-svg">
                <circle cx="50" cy="50" r="45" fill="url(#heroGrad)" />
                <path d="M30 45 L50 25 L70 45 L50 85 Z" fill="#3b82f6" stroke="#60a5fa" stroke-width="3"/>
                <circle cx="50" cy="40" r="12" fill="#fde047"/>
                <path d="M45 40 L55 40 M50 35 L50 45" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
                <circle cx="42" cy="58" r="4" fill="#fff"/>
                <circle cx="58" cy="58" r="4" fill="#fff"/>
                <path d="M44 68 Q50 74 56 68" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <defs>
                    <radialGradient id="heroGrad" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stop-color="#1e3a8a"/>
                        <stop offset="100%" stop-color="#0f172a"/>
                    </radialGradient>
                </defs>
            </svg>`
        },
        {
            id: 'mage',
            name: 'Penyihir Aljabar',
            title: 'Pengendali Formula Misterius',
            desc: 'Memiliki Kekuatan Sihir dan Serangan Kritis sangat tinggi!',
            icon: '🔮',
            baseHp: 90,
            baseAtk: 25,
            baseDef: 2,
            svg: `<svg viewBox="0 0 100 100" class="hero-svg">
                <circle cx="50" cy="50" r="45" fill="url(#mageGrad)" />
                <polygon points="50,15 35,45 65,45" fill="#8b5cf6" stroke="#c084fc" stroke-width="2"/>
                <circle cx="50" cy="50" r="16" fill="#fbbf24"/>
                <circle cx="45" cy="48" r="3" fill="#1e1b4b"/>
                <circle cx="55" cy="48" r="3" fill="#1e1b4b"/>
                <path d="M46 58 Q50 63 54 58" stroke="#1e1b4b" stroke-width="2" fill="none"/>
                <circle cx="50" cy="50" r="28" stroke="#ec4899" stroke-width="2" stroke-dasharray="4,4" fill="none"/>
                <defs>
                    <radialGradient id="mageGrad" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stop-color="#4c1d95"/>
                        <stop offset="100%" stop-color="#111827"/>
                    </radialGradient>
                </defs>
            </svg>`
        },
        {
            id: 'ranger',
            name: 'Pemanah Geometri',
            title: 'Ahli Sudut Presisi',
            desc: 'Memiliki Kecepatan tinggi dan bonus combo damage berlipat.',
            icon: '🏹',
            baseHp: 100,
            baseAtk: 22,
            baseDef: 3,
            svg: `<svg viewBox="0 0 100 100" class="hero-svg">
                <circle cx="50" cy="50" r="45" fill="url(#rangerGrad)" />
                <circle cx="50" cy="48" r="18" fill="#10b981"/>
                <circle cx="44" cy="46" r="3.5" fill="#064e3b"/>
                <circle cx="56" cy="46" r="3.5" fill="#064e3b"/>
                <path d="M45 56 Q50 62 55 56" stroke="#064e3b" stroke-width="2.5" fill="none"/>
                <path d="M25 75 L75 25 M75 25 L60 25 M75 25 L75 40" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
                <defs>
                    <radialGradient id="rangerGrad" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stop-color="#065f46"/>
                        <stop offset="100%" stop-color="#0f172a"/>
                    </radialGradient>
                </defs>
            </svg>`
        }
    ],

    worlds: [
        {
            id: 'w1',
            name: 'Hutan Penjumlahan',
            subtitle: 'Forest of Addition (+)',
            themeColor: '#10b981',
            bgGradient: 'linear-gradient(135deg, #064e3b, #022c22)',
            operation: 'add',
            description: 'Kawasan hutan rimba yang dipenuhi roh angka positif. Kuasai penjumlahan untuk melanjutkan!',
            icon: '🌲',
            stages: [
                { id: '1-1', name: 'Tepi Hutan Slime', monsterId: 'slime_green', rewardGold: 30, rewardXp: 40, targetScore: 3, timePerTurn: 20 },
                { id: '1-2', name: 'Pohon Penjumlahan', monsterId: 'tree_treant', rewardGold: 50, rewardXp: 65, targetScore: 4, timePerTurn: 18 },
                { id: '1-3', name: 'Gua Goblin Plus [BOS]', monsterId: 'goblin_plus', rewardGold: 100, rewardXp: 120, targetScore: 5, isBoss: true, timePerTurn: 15 }
            ]
        },
        {
            id: 'w2',
            name: 'Lembah Pengurangan',
            subtitle: 'Valley of Subtraction (-)',
            themeColor: '#06b6d4',
            bgGradient: 'linear-gradient(135deg, #0e7490, #083344)',
            operation: 'sub',
            description: 'Lembah bersalju di mana angka-angka menyusut. Hati-hati jangan sampai hasilnya minus!',
            icon: '🏔️',
            stages: [
                { id: '2-1', name: 'Padang Es Beku', monsterId: 'ice_bat', rewardGold: 60, rewardXp: 80, targetScore: 4, timePerTurn: 18 },
                { id: '2-2', name: 'Jurang Selisih', monsterId: 'frost_wolf', rewardGold: 90, rewardXp: 110, targetScore: 5, timePerTurn: 16 },
                { id: '2-3', name: 'Raja Golem Minus [BOS]', monsterId: 'ice_golem', rewardGold: 160, rewardXp: 200, targetScore: 6, isBoss: true, timePerTurn: 14 }
            ]
        },
        {
            id: 'w3',
            name: 'Gunung Perkalian',
            subtitle: 'Volcano of Multiplication (×)',
            themeColor: '#f97316',
            bgGradient: 'linear-gradient(135deg, #9a3412, #431407)',
            operation: 'mul',
            description: 'Gunung berapi aktif dengan kekuatan perkalian berlipat ganda! Butuh ketepatan dan refleks kilat.',
            icon: '🌋',
            stages: [
                { id: '3-1', name: 'Lahar Lipat Ganda', monsterId: 'magma_imp', rewardGold: 110, rewardXp: 150, targetScore: 5, timePerTurn: 16 },
                { id: '3-2', name: 'Tebing Tabel Sembilan', monsterId: 'fire_elemental', rewardGold: 150, rewardXp: 210, targetScore: 6, timePerTurn: 14 },
                { id: '3-3', name: 'Naga Lipat Perkalian [BOS]', monsterId: 'pyro_dragon', rewardGold: 250, rewardXp: 350, targetScore: 7, isBoss: true, timePerTurn: 12 }
            ]
        },
        {
            id: 'w4',
            name: 'Kastil Pembagian & Pecahan',
            subtitle: 'Citadel of Division (÷)',
            themeColor: '#8b5cf6',
            bgGradient: 'linear-gradient(135deg, #5b21b6, #2e1065)',
            operation: 'div',
            description: 'Kastil terapung megah. Bagilah angka dengan sempurna tanpa menyisakan celah!',
            icon: '🏰',
            stages: [
                { id: '4-1', name: 'Menara Faktor Prima', monsterId: 'phantom_scholar', rewardGold: 180, rewardXp: 260, targetScore: 6, timePerTurn: 15 },
                { id: '4-2', name: 'Ruang Pecahan Murni', monsterId: 'dark_gargoyle', rewardGold: 230, rewardXp: 340, targetScore: 6, timePerTurn: 14 },
                { id: '4-3', name: 'Panglima Pembagi [BOS]', monsterId: 'archmage_div', rewardGold: 380, rewardXp: 500, targetScore: 8, isBoss: true, timePerTurn: 12 }
            ]
        },
        {
            id: 'w5',
            name: 'Benteng Aljabar & Tak Terhingga',
            subtitle: 'Realm of Dark Algebra (Mixed & x)',
            themeColor: '#ec4899',
            bgGradient: 'linear-gradient(135deg, #831843, #0f172a)',
            operation: 'mixed',
            description: 'Pusat kegelapan di mana persamaan tak diketahui bersemayam. Selamatkan Kristal Kebenaran!',
            icon: '👑',
            stages: [
                { id: '5-1', name: 'Pintu Gerbang Variabel X', monsterId: 'void_wraith', rewardGold: 260, rewardXp: 400, targetScore: 6, timePerTurn: 14 },
                { id: '5-2', name: 'Lorong Urutan Operasi (PEMDAS)', monsterId: 'chaos_knight', rewardGold: 340, rewardXp: 550, targetScore: 7, timePerTurn: 12 },
                { id: '5-3', name: 'Takhta Raja Kegelapan [FINAL BOSS]', monsterId: 'dark_overlord', rewardGold: 800, rewardXp: 1200, targetScore: 10, isBoss: true, isFinalBoss: true, timePerTurn: 11 }
            ]
        }
    ],

    monsters: {
        slime_green: {
            name: 'Slime Tambah',
            hp: 60,
            atk: 10,
            color: '#22c55e',
            quote: 'Blub! Tambahkan aku jika kamu bisa!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <path d="M20 70 Q15 45 50 25 Q85 45 80 70 Q70 85 50 82 Q30 85 20 70 Z" fill="#22c55e" stroke="#15803d" stroke-width="4"/>
                <circle cx="38" cy="50" r="7" fill="#fff"/>
                <circle cx="38" cy="50" r="3.5" fill="#0f172a"/>
                <circle cx="62" cy="50" r="7" fill="#fff"/>
                <circle cx="62" cy="50" r="3.5" fill="#0f172a"/>
                <path d="M43 65 Q50 72 57 65" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round"/>
                <circle cx="70" cy="35" r="4" fill="#86efac"/>
            </svg>`
        },
        tree_treant: {
            name: 'Treant Akar Plus',
            hp: 95,
            atk: 14,
            color: '#15803d',
            quote: 'Akarku bertumbuh sebanyak hasil penjumlahanmu!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <path d="M30 85 L35 40 L25 25 L40 32 L50 15 L60 32 L75 25 L65 40 L70 85 Z" fill="#78350f" stroke="#451a03" stroke-width="4"/>
                <circle cx="50" cy="40" r="28" fill="#15803d"/>
                <circle cx="40" cy="38" r="5" fill="#fef08a"/>
                <circle cx="60" cy="38" r="5" fill="#fef08a"/>
                <circle cx="40" cy="38" r="2.5" fill="#000"/>
                <circle cx="60" cy="38" r="2.5" fill="#000"/>
                <path d="M40 54 L60 54" stroke="#451a03" stroke-width="3.5"/>
            </svg>`
        },
        goblin_plus: {
            name: 'Raja Goblin Aritma',
            hp: 140,
            atk: 18,
            color: '#16a34a',
            quote: 'Ksatria kecil, hadapi kombo penjumlahanku!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <circle cx="50" cy="50" r="35" fill="#16a34a" stroke="#14532d" stroke-width="4"/>
                <polygon points="18,40 2,25 22,25" fill="#14532d"/>
                <polygon points="82,40 98,25 78,25" fill="#14532d"/>
                <polygon points="35,18 50,5 65,18" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
                <circle cx="40" cy="45" r="7" fill="#ef4444"/>
                <circle cx="60" cy="45" r="7" fill="#ef4444"/>
                <circle cx="40" cy="45" r="3" fill="#000"/>
                <circle cx="60" cy="45" r="3" fill="#000"/>
                <path d="M35 65 Q50 78 65 65" stroke="#14532d" stroke-width="4" fill="#7f1d1d"/>
            </svg>`
        },
        ice_bat: {
            name: 'Kelelawar Es Minus',
            hp: 110,
            atk: 16,
            color: '#38bdf8',
            quote: 'Suhu ruangan berkurang... begitu juga nyawamu!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <path d="M10 40 Q30 20 50 45 Q70 20 90 40 Q75 70 50 60 Q25 70 10 40 Z" fill="#0284c7" stroke="#0369a1" stroke-width="3"/>
                <circle cx="50" cy="50" r="18" fill="#38bdf8"/>
                <circle cx="44" cy="48" r="4" fill="#ffffff"/>
                <circle cx="56" cy="48" r="4" fill="#ffffff"/>
                <circle cx="44" cy="48" r="2" fill="#0369a1"/>
                <circle cx="56" cy="48" r="2" fill="#0369a1"/>
                <polygon points="45,56 50,62 55,56" fill="#fff"/>
            </svg>`
        },
        frost_wolf: {
            name: 'Serigala Selisih',
            hp: 150,
            atk: 22,
            color: '#06b6d4',
            quote: 'Auuu! Aku akan mengurangi poin kesehatanmu!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <polygon points="50,20 25,75 75,75" fill="#0891b2" stroke="#164e63" stroke-width="4"/>
                <polygon points="30,35 15,10 40,25" fill="#06b6d4"/>
                <polygon points="70,35 85,10 60,25" fill="#06b6d4"/>
                <circle cx="42" cy="50" r="5" fill="#a5f3fc"/>
                <circle cx="58" cy="50" r="5" fill="#a5f3fc"/>
                <polygon points="50,60 45,67 55,67" fill="#0f172a"/>
            </svg>`
        },
        ice_golem: {
            name: 'Raja Golem Es Raksasa',
            hp: 220,
            atk: 28,
            color: '#0284c7',
            quote: 'Dinding esku mustahil ditembus tanpa pengurangan cepat!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <rect x="25" y="20" width="50" height="60" rx="10" fill="#0284c7" stroke="#bae6fd" stroke-width="4"/>
                <rect x="10" y="35" width="15" height="30" rx="5" fill="#0369a1"/>
                <rect x="75" y="35" width="15" height="30" rx="5" fill="#0369a1"/>
                <rect x="35" y="35" width="10" height="6" fill="#f0f9ff"/>
                <rect x="55" y="35" width="10" height="6" fill="#f0f9ff"/>
                <path d="M38 58 L62 58" stroke="#0c4a6e" stroke-width="4"/>
            </svg>`
        },
        magma_imp: {
            name: 'Imp Api Kelipatan',
            hp: 170,
            atk: 26,
            color: '#ea580c',
            quote: 'Dua kali lipat? Tiga kali lipat? Bakaran api!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <circle cx="50" cy="55" r="30" fill="#ea580c" stroke="#9a3412" stroke-width="4"/>
                <path d="M30 35 L20 15 L40 28" fill="#9a3412"/>
                <path d="M70 35 L80 15 L60 28" fill="#9a3412"/>
                <circle cx="40" cy="50" r="6" fill="#fef08a"/>
                <circle cx="60" cy="50" r="6" fill="#fef08a"/>
                <circle cx="40" cy="50" r="3" fill="#7c2d12"/>
                <circle cx="60" cy="50" r="3" fill="#7c2d12"/>
                <path d="M38 68 Q50 78 62 68" stroke="#7c2d12" stroke-width="4" fill="none"/>
            </svg>`
        },
        fire_elemental: {
            name: 'Elemental Perkalian Murni',
            hp: 230,
            atk: 32,
            color: '#dc2626',
            quote: 'Satu salah jawab, seranganku mengalikan rasa sakit!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <path d="M50 10 Q75 35 75 60 Q75 85 50 90 Q25 85 25 60 Q25 35 50 10 Z" fill="#ef4444" stroke="#fde047" stroke-width="4"/>
                <path d="M50 30 Q65 50 65 65 Q65 80 50 82 Q35 80 35 65 Q35 50 50 30 Z" fill="#f59e0b"/>
                <circle cx="43" cy="55" r="4" fill="#fff"/>
                <circle cx="57" cy="55" r="4" fill="#fff"/>
            </svg>`
        },
        pyro_dragon: {
            name: 'Naga Pyro Matriks',
            hp: 340,
            atk: 40,
            color: '#b91c1c',
            quote: 'GRAAWR! Tunjukkan ketangkasan tabel perkalianmu!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <path d="M20 70 Q10 30 50 15 Q90 30 80 70 Q50 95 20 70 Z" fill="#991b1b" stroke="#fca5a5" stroke-width="3"/>
                <polygon points="30,20 10,5 35,12" fill="#7f1d1d"/>
                <polygon points="70,20 90,5 65,12" fill="#7f1d1d"/>
                <circle cx="38" cy="45" r="7" fill="#fef08a"/>
                <circle cx="62" cy="45" r="7" fill="#fef08a"/>
                <line x1="38" y1="40" x2="38" y2="50" stroke="#000" stroke-width="3"/>
                <line x1="62" y1="40" x2="62" y2="50" stroke="#000" stroke-width="3"/>
                <path d="M35 70 Q50 85 65 70" stroke="#f97316" stroke-width="5" fill="#450a0a"/>
            </svg>`
        },
        phantom_scholar: {
            name: 'Roh Cendekiawan Pecahan',
            hp: 270,
            atk: 36,
            color: '#8b5cf6',
            quote: 'Bagi dengan presisi... tanpa koma desimal!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <path d="M30 80 Q20 40 50 20 Q80 40 70 80 Q60 70 50 80 Q40 70 30 80 Z" fill="#7c3aed" stroke="#c4b5fd" stroke-width="3"/>
                <circle cx="42" cy="42" r="5" fill="#e9d5ff"/>
                <circle cx="58" cy="42" r="5" fill="#e9d5ff"/>
                <circle cx="50" cy="60" r="6" fill="#a855f7"/>
            </svg>`
        },
        dark_gargoyle: {
            name: 'Gargoyle Pembagi Adil',
            hp: 330,
            atk: 42,
            color: '#6d28d9',
            quote: 'Keseimbangan adalah membagi sama rata!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <polygon points="50,15 15,50 30,85 70,85 85,50" fill="#4c1d95" stroke="#a78bfa" stroke-width="4"/>
                <circle cx="40" cy="48" r="6" fill="#f43f5e"/>
                <circle cx="60" cy="48" r="6" fill="#f43f5e"/>
                <path d="M40 68 L60 68" stroke="#ddd6fe" stroke-width="3"/>
            </svg>`
        },
        archmage_div: {
            name: 'Archmage Pembagi Tak Hingga',
            hp: 450,
            atk: 48,
            color: '#4c1d95',
            quote: 'Tidak ada sisa dalam kalkulasi mutlakku!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <circle cx="50" cy="50" r="38" fill="#3b0764" stroke="#d8b4fe" stroke-width="4"/>
                <polygon points="50,5 30,30 70,30" fill="#8b5cf6"/>
                <circle cx="38" cy="48" r="8" fill="#c084fc"/>
                <circle cx="62" cy="48" r="8" fill="#c084fc"/>
                <circle cx="38" cy="48" r="3" fill="#fff"/>
                <circle cx="62" cy="48" r="3" fill="#fff"/>
                <circle cx="50" cy="72" r="8" fill="#a855f7"/>
            </svg>`
        },
        void_wraith: {
            name: 'Hantu Persamaan X',
            hp: 380,
            atk: 45,
            color: '#be185d',
            quote: 'Carilah nilai X... sebelum waktu habis!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <path d="M50 15 Q80 30 75 75 Q50 95 25 75 Q20 30 50 15 Z" fill="#831843" stroke="#f472b6" stroke-width="4"/>
                <text x="50" y="58" font-family="'Outfit', sans-serif" font-size="28" font-weight="bold" fill="#fbcfe8" text-anchor="middle">X</text>
                <circle cx="38" cy="38" r="4" fill="#f43f5e"/>
                <circle cx="62" cy="38" r="4" fill="#f43f5e"/>
            </svg>`
        },
        chaos_knight: {
            name: 'Ksatria Kabataku Chaos',
            hp: 460,
            atk: 52,
            color: '#9d174d',
            quote: 'Kurung, Kali, Bagi, Tambah, Kurang! Urutan adalah kunci!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg">
                <rect x="25" y="20" width="50" height="60" rx="8" fill="#500724" stroke="#fb7185" stroke-width="4"/>
                <line x1="50" y1="20" x2="50" y2="80" stroke="#fb7185" stroke-width="3"/>
                <circle cx="38" cy="45" r="5" fill="#fb7185"/>
                <circle cx="62" cy="45" r="5" fill="#fb7185"/>
                <polygon points="50,5 38,20 62,20" fill="#f43f5e"/>
            </svg>`
        },
        dark_overlord: {
            name: 'Raja Kegelapan Numerik [BOS AKHIR]',
            hp: 650,
            atk: 60,
            color: '#4c0519',
            quote: 'Akulah penguasa seluruh rumus gelap! Dunia Numeria akan lenyap!',
            svg: `<svg viewBox="0 0 100 100" class="monster-svg boss-final-glow">
                <circle cx="50" cy="50" r="42" fill="#1e1b4b" stroke="#f43f5e" stroke-width="5"/>
                <polygon points="20,25 35,5 50,20 65,5 80,25" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
                <circle cx="36" cy="45" r="9" fill="#ef4444"/>
                <circle cx="64" cy="45" r="9" fill="#ef4444"/>
                <circle cx="36" cy="45" r="4" fill="#000"/>
                <circle cx="64" cy="45" r="4" fill="#000"/>
                <path d="M30 68 Q50 90 70 68" stroke="#f43f5e" stroke-width="5" fill="#881337"/>
                <path d="M40 74 L44 80 M50 76 L50 82 M60 74 L56 80" stroke="#fff" stroke-width="2"/>
            </svg>`
        }
    },

    spells: [
        {
            id: 'lightning',
            name: 'Sambaran Kilat',
            desc: 'Menembakkan petir yang menghasilkan 1.8x damage instan.',
            manaCost: 20,
            icon: '⚡',
            type: 'lightning',
            cooldownTurns: 2,
            damageMultiplier: 1.8
        },
        {
            id: 'heal',
            name: 'Embun Penyembuh',
            desc: 'Memulihkan 45% HP maksimal pahlawan seketika.',
            manaCost: 25,
            icon: '🧪',
            type: 'heal',
            cooldownTurns: 3,
            healPercent: 0.45
        },
        {
            id: 'shield',
            name: 'Perisai Logika',
            desc: 'Menciptakan perisai yang menahan 75% damage serangan musuh berikutnya.',
            manaCost: 20,
            icon: '🛡️',
            type: 'shield',
            cooldownTurns: 3,
            defenseBoost: 0.75
        },
        {
            id: 'meteor',
            name: 'Meteor Aritmatika',
            desc: 'Mantra terlarang yang menghancurkan musuh dengan 3.2x damage dahsyat!',
            manaCost: 50,
            icon: '💥',
            type: 'meteor',
            cooldownTurns: 4,
            damageMultiplier: 3.2
        }
    ],

    shopItems: [
        {
            id: 'weapon_1',
            type: 'weapon',
            name: 'Pedang Tambah Kilat',
            desc: '+15 Kekuatan Serangan',
            cost: 80,
            atkBonus: 15,
            hpBonus: 0,
            icon: '🗡️'
        },
        {
            id: 'weapon_2',
            type: 'weapon',
            name: 'Tongkat Sihir Matriks',
            desc: '+35 Kekuatan Serangan',
            cost: 250,
            atkBonus: 35,
            hpBonus: 0,
            icon: '🪄'
        },
        {
            id: 'weapon_3',
            type: 'weapon',
            name: 'Pedang Cahaya Kebenaran',
            desc: '+70 Kekuatan Serangan Dahsyat',
            cost: 600,
            atkBonus: 70,
            hpBonus: 0,
            icon: '⚔️'
        },
        {
            id: 'armor_1',
            type: 'armor',
            name: 'Baju Zirah Besi Penjumlahan',
            desc: '+40 Maksimal HP',
            cost: 90,
            atkBonus: 0,
            hpBonus: 40,
            icon: '🦺'
        },
        {
            id: 'armor_2',
            type: 'armor',
            name: 'Jubah Kristal Logika',
            desc: '+100 Maksimal HP',
            cost: 280,
            atkBonus: 0,
            hpBonus: 100,
            icon: '🥋'
        },
        {
            id: 'armor_3',
            type: 'armor',
            name: 'Mahkota Kebijaksanaan Abadi',
            desc: '+200 Maksimal HP & +20 ATK',
            cost: 750,
            atkBonus: 20,
            hpBonus: 200,
            icon: '👑'
        },
        {
            id: 'potion_hp',
            type: 'consumable',
            name: 'Ramuan HP Instan',
            desc: 'Menyembuhkan 50 HP saat pertarungan (Dapat disimpan di inventori)',
            cost: 30,
            icon: '🍷',
            isConsumable: true
        }
    ],

    achievements: [
        { id: 'first_win', name: 'Langkah Pertama', desc: 'Selesaikan pertarungan matematika pertamamu', icon: '🌱' },
        { id: 'combo_5', name: 'Fokus Tajam', desc: 'Capai 5x Combo berturut-turut tanpa salah', icon: '🔥' },
        { id: 'combo_10', name: 'Pikiran Jenius', desc: 'Capai 10x Combo berturut-turut tanpa salah', icon: '⚡' },
        { id: 'world_1', name: 'Penebang Hutan Plus', desc: 'Kalahkan Bos di Hutan Penjumlahan', icon: '🌲' },
        { id: 'world_2', name: 'Penakluk Lembah Beku', desc: 'Kalahkan Bos di Lembah Pengurangan', icon: '🏔️' },
        { id: 'world_3', name: 'Master Perkalian Magma', desc: 'Kalahkan Bos di Gunung Perkalian', icon: '🌋' },
        { id: 'rich', name: 'Saudagar Angka', desc: 'Kumpulkan total 500 Koin Emas', icon: '💰' },
        { id: 'all_boss', name: 'Penyelamat Numeria', desc: 'Kalahkan Raja Kegelapan dan tamatkan petualangan!', icon: '🏆' }
    ]
};
