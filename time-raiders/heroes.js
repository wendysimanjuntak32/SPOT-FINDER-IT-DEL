/**
 * TIME RAIDERS 5v5 - Hero Classes & Skill Definitions
 */

const HERO_ROLES = {
    FIGHTER: {
        id: 'fighter',
        name: 'Vael',
        title: 'Chrono Blade',
        role: 'Fighter (Damage Besar & Lincah)',
        icon: '⚔️',
        color: '#f43f5e',
        baseHp: 650,
        hpPerLevel: 75,
        baseSpeed: 3.4,
        attackRange: 75,
        attackDamage: 55,
        attackSpeed: 1.1,
        defense: 18,
        description: 'Petarung jarak dekat dengan tebasan energi waktu ber-damage masif dan mobilitas tinggi.',
        skills: [
            {
                key: 'Q',
                name: 'Time Slash',
                desc: 'Tebasan sabit waktu berbentuk kipas dengan burst damage besar.',
                cooldown: 4.5,
                damage: 130,
                range: 160,
                type: 'cone'
            },
            {
                key: 'W',
                name: 'Leap Dash',
                desc: 'Menerjang ke depan menembus musuh dan memberikan efek stun 1 detik.',
                cooldown: 7.0,
                damage: 90,
                range: 220,
                type: 'dash'
            },
            {
                key: 'E',
                name: 'Temporal Shield',
                desc: 'Mendapatkan perisai pelindung yang menyerap 220 damage selama 3 detik.',
                cooldown: 8.0,
                shield: 220,
                type: 'buff'
            },
            {
                key: 'R',
                name: 'Chrono Storm (Ultimate)',
                desc: 'Badai tebasan waktu berputar 360° yang menghancurkan seluruh musuh di sekitarnya.',
                cooldown: 24.0,
                damage: 320,
                range: 240,
                type: 'aoe'
            }
        ]
    },
    TANK: {
        id: 'tank',
        name: 'Titan',
        title: 'Chronos Bastion',
        role: 'Tank (Pertahanan Tebal & Pelindung)',
        icon: '🛡️',
        color: '#eab308',
        baseHp: 950,
        hpPerLevel: 110,
        baseSpeed: 2.8,
        attackRange: 70,
        attackDamage: 38,
        attackSpeed: 0.9,
        defense: 35,
        description: 'Pelindung tim terkuat yang mampu menyerap damage masif, menarik musuh, dan membuat benteng waktu.',
        skills: [
            {
                key: 'Q',
                name: 'Graviton Pull',
                desc: 'Menarik seluruh musuh di depan ke arah tubuhnya dan memperlambat mereka.',
                cooldown: 6.0,
                damage: 70,
                range: 200,
                type: 'pull'
            },
            {
                key: 'W',
                name: 'Kinetic Bastion',
                desc: 'Mendirikan perisai kinetik yang mengurangi 60% semua serangan yang masuk.',
                cooldown: 8.5,
                damageReduction: 0.6,
                duration: 4.0,
                type: 'buff'
            },
            {
                key: 'E',
                name: 'Ground Slam',
                desc: 'Menghantam tanah dengan keras, melumpuhkan musuh selama 1.5 detik.',
                cooldown: 7.5,
                damage: 100,
                range: 150,
                type: 'aoe_stun'
            },
            {
                key: 'R',
                name: 'Temporal Fortress (Ultimate)',
                desc: 'Menciptakan zona kubah pelindung raksasa yang memberikan imunitas bagi rekan tim.',
                cooldown: 28.0,
                duration: 4.5,
                range: 280,
                type: 'fortress'
            }
        ]
    },
    MARKSMAN: {
        id: 'marksman',
        name: 'Lyra',
        title: 'Chrono Ranger',
        role: 'Marksman (Penembak Jarak Jauh)',
        icon: '🏹',
        color: '#06b6d4',
        baseHp: 520,
        hpPerLevel: 55,
        baseSpeed: 3.3,
        attackRange: 260,
        attackDamage: 62,
        attackSpeed: 1.4,
        defense: 12,
        description: 'Penembak jitu jarak jauh dengan panah laser waktu berkecepatan tinggi dan tembakan pemusnah.',
        skills: [
            {
                key: 'Q',
                name: 'Piercing Arrow',
                desc: 'Tembakan panah laser berkecepatan tinggi yang menembus banyak musuh sekaligus.',
                cooldown: 3.8,
                damage: 140,
                range: 380,
                type: 'laser'
            },
            {
                key: 'W',
                name: 'Temporal Vault',
                desc: 'Melompat mundur dengan cepat sambil melepaskan ranjau pelambat waktu.',
                cooldown: 6.5,
                damage: 60,
                range: 180,
                type: 'backdash'
            },
            {
                key: 'E',
                name: 'Hyper Velocity',
                desc: 'Meningkatkan attack speed sebesar 80% dan movement speed selama 4 detik.',
                cooldown: 9.0,
                type: 'buff_speed'
            },
            {
                key: 'R',
                name: 'Paradox Railgun (Ultimate)',
                desc: 'Menembakkan sinar laser kosmik raksasa sejauh peta arena yang menghabisi musuh sekarat.',
                cooldown: 22.0,
                damage: 380,
                range: 650,
                type: 'beam'
            }
        ]
    },
    SUPPORT: {
        id: 'support',
        name: 'Aelia',
        title: 'Chrono Weaver',
        role: 'Support (Penyembuh & Akselerator)',
        icon: '💚',
        color: '#10b981',
        baseHp: 580,
        hpPerLevel: 65,
        baseSpeed: 3.2,
        attackRange: 200,
        attackDamage: 40,
        attackSpeed: 1.0,
        defense: 16,
        description: 'Penyokong tim yang mampu meregenerasi HP rekan, memberikan kecepatan kilat, dan stasis waktu.',
        skills: [
            {
                key: 'Q',
                name: 'Temporal Heal',
                desc: 'Memulihkan 180 HP rekan tim terdekat dan diri sendiri.',
                cooldown: 5.0,
                heal: 180,
                range: 250,
                type: 'heal'
            },
            {
                key: 'W',
                name: 'Haste Surge',
                desc: 'Memberikan akselerasi kecepatan gerak +50% untuk seluruh rekan tim di sekitar.',
                cooldown: 7.0,
                range: 220,
                type: 'aoe_buff'
            },
            {
                key: 'E',
                name: 'Time Snare',
                desc: 'Menembakkan jaring waktu yang menghentikan langkah musuh selama 1.8 detik.',
                cooldown: 6.5,
                damage: 80,
                range: 230,
                type: 'root'
            },
            {
                key: 'R',
                name: 'Chrono Stasis (Ultimate)',
                desc: 'Membekukan rekan tim yang sekarat ke dalam stasis emas, memulihkan 50% HP dan kebal serangan.',
                cooldown: 25.0,
                range: 260,
                type: 'stasis'
            }
        ]
    },
    TIMEMAGE: {
        id: 'timemage',
        name: 'Zeno',
        title: 'Chrono Archmage',
        role: 'Time Mage (Master Manipulasi Waktu & CC)',
        icon: '🌀',
        color: '#a855f7',
        baseHp: 540,
        hpPerLevel: 60,
        baseSpeed: 3.1,
        attackRange: 220,
        attackDamage: 48,
        attackSpeed: 1.0,
        defense: 14,
        description: 'Penyihir pengendali waktu yang mampu menciptakan kubah pelambat waktu (Chrono Freeze) dan memundurkan realitas.',
        skills: [
            {
                key: 'Q',
                name: 'Paradox Orb',
                desc: 'Meluncurkan bola energi waktu yang meledak dan memantul ke target terdekat.',
                cooldown: 4.0,
                damage: 150,
                range: 280,
                type: 'projectile_aoe'
            },
            {
                key: 'W',
                name: 'Chrono Freeze Dome',
                desc: 'Menciptakan kubah waktu di mana musuh dan proyektil melambat 80% selama 4 detik.',
                cooldown: 8.0,
                range: 300,
                radius: 140,
                type: 'freeze_dome'
            },
            {
                key: 'E',
                name: 'Blink Paradox',
                desc: 'Teleportasi instan jarak pendek meninggalkan gelombang kejut waktu.',
                cooldown: 6.0,
                damage: 80,
                range: 200,
                type: 'teleport'
            },
            {
                key: 'R',
                name: 'Reality Collapse (Ultimate)',
                desc: 'Memutarbalikkan dimensi waktu, menarik dan meledakkan seluruh musuh di area luas.',
                cooldown: 26.0,
                damage: 360,
                range: 320,
                type: 'collapse'
            }
        ]
    }
};

// Universal Time Rewind Ability
const TIME_REWIND_CONFIG = {
    name: 'Flashback Rewind',
    desc: 'Mundur ke posisi dan mengembalikan HP Anda seperti 3 detik yang lalu!',
    key: 'SPACE',
    cooldown: 10.0,
    historySeconds: 3.0,
    fpsHistory: 60,
    maxFrames: 180
};

window.HERO_ROLES = HERO_ROLES;
window.TIME_REWIND_CONFIG = TIME_REWIND_CONFIG;
