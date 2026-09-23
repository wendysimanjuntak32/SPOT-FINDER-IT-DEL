/**
 * CYBER SURVIVOR: PROTOCOL ZERO
 * Database of Heroes, Weapons, Synergy Evolutions, and Cyberware Passives
 */

const CYBER_HEROES = [
    {
        id: 'samurai',
        name: 'Ren "Shadow" Kusanagi',
        title: 'Cyber Blade Assassin',
        icon: '⚔️',
        avatarBg: 'linear-gradient(135deg, #ff007f, #7928ca)',
        color: '#ff007f',
        hp: 120,
        speed: 4.2,
        armor: 10,
        critChance: 0.15,
        startingWeapon: 'katana',
        desc: 'Pendekar pedang cyborg dengan kecepatan tinggi, tebasan pisau berfrekuensi tinggi, dan critical chance mematikan.',
        passiveDesc: 'Kecepatan gerak +15% dan tebasan memiliki area serangan mematikan.'
    },
    {
        id: 'hacker',
        name: 'Aria "Glitch" Vance',
        title: 'Quantum Overclock Hacker',
        icon: '💻',
        avatarBg: 'linear-gradient(135deg, #00f0ff, #0070f3)',
        color: '#00f0ff',
        hp: 100,
        speed: 3.8,
        armor: 5,
        critChance: 0.08,
        startingWeapon: 'drone',
        desc: 'Hacker kuantum yang mengendalikan drone serang bersinergi dan memiliki cooldown skill tercepat.',
        passiveDesc: 'Pengurangan Cooldown senjata -20% dan jangkauan magnet XP +40%.'
    },
    {
        id: 'mecha',
        name: 'Goliath-7',
        title: 'Heavy Vanguard Mech',
        icon: '🤖',
        avatarBg: 'linear-gradient(135deg, #f59e0b, #b45309)',
        color: '#f59e0b',
        hp: 200,
        speed: 3.2,
        armor: 25,
        critChance: 0.05,
        startingWeapon: 'gatling',
        desc: 'Unit mecha lapis baja berat dengan daya tahan ekstrem dan senjata senjata balistik kaliber besar.',
        passiveDesc: 'Maksimum HP +80, Armor +15, dan ledakan proyektil lebih besar.'
    },
    {
        id: 'psionic',
        name: 'Nyx Voidwalker',
        title: 'Psionic Singularity Master',
        icon: '🔮',
        avatarBg: 'linear-gradient(135deg, #a855f7, #6b21a8)',
        color: '#a855f7',
        hp: 110,
        speed: 3.6,
        armor: 8,
        critChance: 0.10,
        startingWeapon: 'singularity',
        desc: 'Manipulator gravitasi kosmik yang menciptakan lubang hitam mikro dan menghisap gelombang musuh.',
        passiveDesc: 'Damage area senjata (AoE) +35% dan efek slow pada musuh.'
    }
];

const CYBER_WEAPONS = [
    {
        id: 'katana',
        name: 'Neon Katana',
        icon: '⚔️',
        desc: 'Tebasan pisau energi horizontal yang membelah musuh di dekat pemain.',
        type: 'melee_slash',
        baseDamage: 38,
        cooldown: 1.1,
        range: 120,
        pierce: 999,
        level: 1,
        maxLevel: 5,
        evolutionPair: 'reactor',
        evolutionName: 'Hyper Void Katana',
        evolutionDesc: 'Tebasan menghasilkan gelombang bilah 360 derajat yang merobek seluruh musuh di layar!',
        upgrades: [
            { desc: 'Membuka Neon Katana' },
            { damage: 15, range: 20, desc: 'Damage +15, Jangkauan +20' },
            { cooldown: -0.2, desc: 'Kecepatan Serang +20%' },
            { damage: 25, range: 30, desc: 'Damage +25, Tebasan ganda' },
            { damage: 40, cooldown: -0.2, desc: 'Damage +40, Cooldown -0.2s' }
        ]
    },
    {
        id: 'gatling',
        name: 'Plasma Gatling',
        icon: '🔫',
        desc: 'Menembakkan peluru plasma bertubi-tubi ke arah musuh terdekat.',
        type: 'rapid_projectile',
        baseDamage: 18,
        cooldown: 0.22,
        range: 350,
        speed: 16,
        level: 1,
        maxLevel: 5,
        evolutionPair: 'overclock',
        evolutionName: 'Hyperion Death Laser',
        evolutionDesc: 'Menembakkan sinar laser plasma berkelanjutan yang membakar seluruh barisan musuh!',
        upgrades: [
            { desc: 'Membuka Plasma Gatling' },
            { damage: 6, desc: 'Damage +6 per peluru' },
            { cooldown: -0.05, desc: 'Fire Rate +25%' },
            { damage: 10, desc: 'Damage +10, Peluru menembus 1 musuh' },
            { damage: 15, cooldown: -0.04, desc: 'Damage +15, Peluru Plasma Ganda' }
        ]
    },
    {
        id: 'missiles',
        name: 'Homing Micro-Missiles',
        icon: '🚀',
        desc: 'Meluncurkan roket pintar yang otomatis mengejar dan meledakkan musuh.',
        type: 'homing_missile',
        baseDamage: 55,
        cooldown: 2.0,
        range: 450,
        speed: 12,
        count: 2,
        level: 1,
        maxLevel: 5,
        evolutionPair: 'exoskeleton',
        evolutionName: 'Nuclear Storm Swarm',
        evolutionDesc: 'Meluncurkan 8 roket hulu ledak nuklir yang memicu ledakan masif berantai!',
        upgrades: [
            { desc: 'Membuka Homing Micro-Missiles' },
            { count: 1, damage: 15, desc: '+1 Roket Tambahan, Damage +15' },
            { cooldown: -0.4, desc: 'Cooldown -0.4s' },
            { count: 1, damage: 25, desc: '+1 Roket, Ledakan Area +30%' },
            { count: 2, damage: 35, desc: '+2 Roket, Super Blast Radius' }
        ]
    },
    {
        id: 'drone',
        name: 'Quantum EMP Drone',
        icon: '🛸',
        desc: 'Drone pengawal yang berputar di sekitar pemain, menembakkan sengatan listrik.',
        type: 'orbital_drone',
        baseDamage: 28,
        cooldown: 1.4,
        range: 160,
        count: 1,
        level: 1,
        maxLevel: 5,
        evolutionPair: 'magnet',
        evolutionName: 'Overclocked Matrix Drone',
        evolutionDesc: '4 Drone tempur otonom dengan tembakan laser terkoordinasi dan perisai energi!',
        upgrades: [
            { desc: 'Membuka Quantum EMP Drone' },
            { count: 1, desc: '+1 Drone Tambahan' },
            { damage: 12, cooldown: -0.25, desc: 'Damage +12, Cooldown -0.25s' },
            { count: 1, damage: 18, desc: '+1 Drone, Stun Listrik 0.3s' },
            { count: 1, damage: 30, desc: '+1 Drone, Radius Putaran +30%' }
        ]
    },
    {
        id: 'singularity',
        name: 'Void Singularity',
        icon: '🌀',
        desc: 'Menciptakan titik gravitasi mini yang menghisap dan meremukkan musuh di sekitar.',
        type: 'vortex_aoe',
        baseDamage: 22,
        cooldown: 2.8,
        range: 220,
        radius: 80,
        level: 1,
        maxLevel: 5,
        evolutionPair: 'thrusters',
        evolutionName: 'Black Hole Event Horizon',
        evolutionDesc: 'Lubang hitam kolosal yang menyedot seluruh medan tempur dan meledak dahsyat!',
        upgrades: [
            { desc: 'Membuka Void Singularity' },
            { radius: 25, damage: 10, desc: 'Radius Hisap +25, Damage +10' },
            { cooldown: -0.5, desc: 'Cooldown -0.5s' },
            { radius: 35, damage: 20, desc: 'Radius +35, Damage +20' },
            { damage: 35, cooldown: -0.5, desc: 'Damage +35, Durasi Hisap +1s' }
        ]
    },
    {
        id: 'tesla',
        name: 'Tesla Forcefield',
        icon: '⚡',
        desc: 'Medan aura listrik di sekeliling tubuh yang menyengat musuh yang mendekat secara konstan.',
        type: 'aura_shock',
        baseDamage: 14,
        cooldown: 0.5,
        radius: 95,
        level: 1,
        maxLevel: 5,
        evolutionPair: 'nanite',
        evolutionName: 'Thunder God Aegis',
        evolutionDesc: 'Perisai listrik petir suci yang memblokir serangan musuh dan membakar area!',
        upgrades: [
            { desc: 'Membuka Tesla Forcefield' },
            { radius: 20, damage: 6, desc: 'Radius Aura +20, Damage +6' },
            { damage: 10, desc: 'Damage +10 per tick' },
            { radius: 30, damage: 14, desc: 'Radius +30, Damage +14' },
            { radius: 40, damage: 25, desc: 'Radius +40, Knockback Musuh' }
        ]
    }
];

const CYBER_PASSIVES = [
    {
        id: 'reactor',
        name: 'Quantum Reactor',
        icon: '🔋',
        desc: 'Meningkatkan seluruh Damage output senjata sebesar +10%.',
        level: 1,
        maxLevel: 5,
        stat: 'damageMultiplier',
        valPerLevel: 0.10
    },
    {
        id: 'overclock',
        name: 'Overclock Chip',
        icon: '💾',
        desc: 'Mengurangi Cooldown semua senjata sebesar -8% per level.',
        level: 1,
        maxLevel: 5,
        stat: 'cooldownReduction',
        valPerLevel: 0.08
    },
    {
        id: 'exoskeleton',
        name: 'Titanium Exoskeleton',
        icon: '🛡️',
        desc: 'Meningkatkan Max HP +30 dan memulihkan HP secara berkala.',
        level: 1,
        maxLevel: 5,
        stat: 'maxHp',
        valPerLevel: 30
    },
    {
        id: 'magnet',
        name: 'Magnetic Scavenger',
        icon: '🧲',
        desc: 'Memperluas jangkauan magnet menarik XP Gem & Gold +40%.',
        level: 1,
        maxLevel: 5,
        stat: 'magnetRange',
        valPerLevel: 45
    },
    {
        id: 'thrusters',
        name: 'Cyber Thrusters',
        icon: '👟',
        desc: 'Meningkatkan Kecepatan Gerak karakter sebesar +8%.',
        level: 1,
        maxLevel: 5,
        stat: 'moveSpeed',
        valPerLevel: 0.35
    },
    {
        id: 'nanite',
        name: 'Nanite Repair Armor',
        icon: '🧬',
        desc: 'Menambah Armor pertahanan +6 dan Damage Reduction.',
        level: 1,
        maxLevel: 5,
        stat: 'armor',
        valPerLevel: 6
    }
];

window.CYBER_HEROES = CYBER_HEROES;
window.CYBER_WEAPONS = CYBER_WEAPONS;
window.CYBER_PASSIVES = CYBER_PASSIVES;
