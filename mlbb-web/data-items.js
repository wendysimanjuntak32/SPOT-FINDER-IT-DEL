/**
 * MLBB WEB - In-Game Item Shop Database
 * Complete items with attributes, prices, categories, and passive effects
 */

const MLBB_ITEMS = [
    // --- ATTACK ITEMS ---
    {
        id: 'bod',
        name: 'Blade of Despair',
        category: 'ATTACK',
        price: 3010,
        icon: '🗡️',
        desc: '+160 Physical ATK, +5% Movement Speed. Pasif: Menyerang musuh dengan HP < 50% meningkatkan Physical Attack sebesar +25%!',
        stats: { attack: 160, speed: 0.25 }
    },
    {
        id: 'berserker',
        name: 'Berserker\'s Fury',
        category: 'ATTACK',
        price: 2250,
        icon: '🪓',
        desc: '+65 Physical ATK, +25% Crit Chance, +40% Crit Damage. Serangan critical meningkatkan Physical Attack sebesar +5%.',
        stats: { attack: 65, crit: 0.25 }
    },
    {
        id: 'endless',
        name: 'Endless Battle',
        category: 'ATTACK',
        price: 2470,
        icon: '⚔️',
        desc: '+65 Physical ATK, +250 HP, +10% Cooldown Reduction, +10% Lifesteal. Pasif: Setelah menggunakan skill, basic attack berikutnya menghasilkan True Damage!',
        stats: { attack: 65, hp: 250, cdr: 0.10, lifesteal: 0.10 }
    },
    {
        id: 'haas',
        name: 'Haas\'s Claws',
        category: 'ATTACK',
        price: 1810,
        icon: '🩸',
        desc: '+70 Physical ATK, +20% Physical Lifesteal. Saat HP di bawah 40%, memperoleh tambahan +10% Lifesteal.',
        stats: { attack: 70, lifesteal: 0.20 }
    },
    {
        id: 'malefic',
        name: 'Malefic Roar',
        category: 'ATTACK',
        price: 2060,
        icon: '🔫',
        desc: '+60 Physical ATK, +35% Physical Penetration. Menembus armor turret dan hero tank tebal secara drastis.',
        stats: { attack: 60, pen: 0.35 }
    },

    // --- MAGIC ITEMS ---
    {
        id: 'holy_crystal',
        name: 'Holy Crystal',
        category: 'MAGIC',
        price: 2180,
        icon: '🔮',
        desc: '+100 Magic Power. Pasif Unik: Meningkatkan Magic Attack sebesar +25% s/d +35% (skala dengan level hero).',
        stats: { magic: 100 }
    },
    {
        id: 'lightning',
        name: 'Lightning Truncheon',
        category: 'MAGIC',
        price: 2250,
        icon: '⚡',
        desc: '+75 Magic Power, +300 Mana, +10% Cooldown Reduction. Pasif: Setiap 6 detik, skill memantul menyetrum hingga 3 musuh!',
        stats: { magic: 75, mana: 300, cdr: 0.10 }
    },
    {
        id: 'glowing_wand',
        name: 'Glowing Wand',
        category: 'MAGIC',
        price: 2200,
        icon: '🔥',
        desc: '+75 Magic Power, +400 HP, +5% Movement Speed. Pasif: Serangan sihir membakar target sebesar 1% HP maks per detik selama 3 detik.',
        stats: { magic: 75, hp: 400, speed: 0.2 }
    },
    {
        id: 'concentrated',
        name: 'Concentrated Energy',
        category: 'MAGIC',
        price: 2020,
        icon: '🧪',
        desc: '+70 Magic Power, +700 HP, +25% Magic Lifesteal. Memulihkan 10% HP saat berhasil mengeliminasi hero musuh.',
        stats: { magic: 70, hp: 700, lifesteal: 0.25 }
    },

    // --- DEFENSE ITEMS ---
    {
        id: 'immortality',
        name: 'Immortality',
        category: 'DEFENSE',
        price: 2120,
        icon: '🛡️',
        desc: '+800 HP, +40 Physical Defense. Pasif Unik: Hidup kembali (Revive) 2 detik setelah terbunuh dengan 16% HP dan 300 Shield!',
        stats: { hp: 800, armor: 40, revive: true }
    },
    {
        id: 'athena',
        name: 'Athena\'s Shield',
        category: 'DEFENSE',
        price: 2150,
        icon: '💠',
        desc: '+900 HP, +62 Magic Defense, +2 HP Regen. Pasif: Menyerap 25% Magic Damage yang masuk selama 5 detik pertama pertarungan.',
        stats: { hp: 900, magicRes: 62 }
    },
    {
        id: 'blade_armor',
        name: 'Blade Armor',
        category: 'DEFENSE',
        price: 1960,
        icon: '🥋',
        desc: '+90 Physical Defense, -20% Crit Damage Reduction. Pasif: Memantulkan 25% Physical Damage kembali ke penyerang!',
        stats: { armor: 90 }
    },
    {
        id: 'guardian',
        name: 'Guardian Helmet',
        category: 'DEFENSE',
        price: 2200,
        icon: '🪖',
        desc: '+1550 HP, +20 HP Regen. Pasif: Memulihkan 2.5% HP maks per detik saat tidak dalam pertempuran selama 5 detik.',
        stats: { hp: 1550, regen: 25 }
    },

    // --- MOVEMENT BOOTS ---
    {
        id: 'warrior_boots',
        name: 'Warrior Boots',
        category: 'MOVEMENT',
        price: 720,
        icon: '🥾',
        desc: '+40 Movement Speed, +22 Physical Defense. Pasif: Menambah Physical Defense saat menerima basic attack.',
        stats: { speed: 0.5, armor: 22 }
    },
    {
        id: 'swift_boots',
        name: 'Swift Boots',
        category: 'MOVEMENT',
        price: 710,
        icon: '👟',
        desc: '+40 Movement Speed, +15% Attack Speed. Sangat cocok untuk Marksman dan petarung lincah.',
        stats: { speed: 0.5, atkSpeed: 0.15 }
    },
    {
        id: 'magic_shoes',
        name: 'Magic Shoes',
        category: 'MOVEMENT',
        price: 710,
        icon: '👢',
        desc: '+40 Movement Speed, +10% Cooldown Reduction. Mempercepat penggunaan skill hero Mage dan Support.',
        stats: { speed: 0.5, cdr: 0.10 }
    }
];

window.MLBB_ITEMS = MLBB_ITEMS;
