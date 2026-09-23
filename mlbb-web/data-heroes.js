/**
 * CHRONO MATIKA: 5v5 Legends of Numeria
 * 6 Hero Roster & Mathematical Skill Database
 * Authentic MOBA Archetypes fused with Math & Chrono Magic
 */

const MLBB_HEROES = [
    {
        id: 'zilong',
        name: 'Zilong',
        title: 'The Vector Dragoon',
        role: 'Fighter / Assassin',
        icon: '⚔️',
        avatarColor: '#f43f5e',
        avatarBg: 'linear-gradient(135deg, #f43f5e, #be123c)',
        baseHp: 2750,
        hpPerLevel: 210,
        baseMana: 460,
        manaPerLevel: 42,
        baseAttack: 130,
        attackPerLevel: 12.5,
        attackSpeed: 1.2,
        attackRange: 85,
        baseArmor: 28,
        moveSpeed: 3.5,
        passive: {
            name: 'Calculus Thrust (dx/dt)',
            desc: 'Setiap 3 serangan dasar berurutan, Zilong melipatgandakan kecepatan serangan (+100%) dan memberikan tusukan multi-vektor bertubi-tubi dengan lifesteal 40%.'
        },
        skills: [
            {
                key: '1',
                name: 'Vector Flip [180°]',
                desc: 'Menusuk target musuh dan membalikkan koordinat posisi mereka 180° ke belakang Zilong, memberikan 280 (+90% ATK) Physical Damage.',
                cooldown: 7.5,
                manaCost: 60,
                range: 130,
                type: 'flip'
            },
            {
                key: '2',
                name: 'Linear Velocity Dash',
                desc: 'Melesat dengan percepatan konstan ke arah musuh, memberikan 220 (+70% ATK) Damage dan mengurangi 20 Armor musuh selama 4 detik.',
                cooldown: 5.0,
                manaCost: 45,
                range: 240,
                type: 'dash_target'
            },
            {
                key: '3',
                name: 'Exponential Surge (Ult)',
                desc: 'Mengaktifkan mode eksponensial: +50% Movement Speed, +60% Attack Speed, dan IMUN mutlak terhadap semua efek Slow/CC selama 7 detik!',
                cooldown: 25.0,
                manaCost: 90,
                type: 'buff_ultimate'
            }
        ]
    },
    {
        id: 'saber',
        name: 'Saber',
        title: 'Spacetime Matrix Blade',
        role: 'Assassin',
        icon: '🗡️',
        avatarColor: '#8b5cf6',
        avatarBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        baseHp: 2480,
        hpPerLevel: 185,
        baseMana: 490,
        manaPerLevel: 45,
        baseAttack: 138,
        attackPerLevel: 13.5,
        attackSpeed: 1.15,
        attackRange: 80,
        baseArmor: 22,
        moveSpeed: 3.6,
        passive: {
            name: 'Subtractive Matrix',
            desc: 'Setiap kali serangan atau pedang mengenai musuh, mereduksi Physical Defense musuh sebesar 7 poin per hit (stack hingga 5x = -35 Armor).'
        },
        skills: [
            {
                key: '1',
                name: 'Orbiting Geometric Daggers',
                desc: 'Menerbangkan 5 pedang berputar membentuk polygon simetris. Saat menyerang, pedang meluncur menusuk target dengan burst damage.',
                cooldown: 7.5,
                manaCost: 70,
                range: 170,
                type: 'orbit_swords'
            },
            {
                key: '2',
                name: 'Matrix Warp Dash',
                desc: 'Menerobos matriks ruang ke depan, memberikan 200 (+60% ATK) Damage dan memperkuat basic attack berikutnya dengan slow 60%.',
                cooldown: 5.5,
                manaCost: 50,
                range: 210,
                type: 'dash_straight'
            },
            {
                key: '3',
                name: 'Triple Vector Strike (Ult)',
                desc: 'Mengunci target musuh ke udara dalam bidang 3D, menebas 3 kali secara presisi menghasilkan 600 (+220% ATK) Burst Damage!',
                cooldown: 24.0,
                manaCost: 100,
                range: 230,
                type: 'airborne_lock'
            }
        ]
    },
    {
        id: 'eudora',
        name: 'Eudora',
        title: 'Quantum Resonance Sorceress',
        role: 'Mage',
        icon: '🧙‍♂️',
        avatarColor: '#3b82f6',
        avatarBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        baseHp: 2350,
        hpPerLevel: 170,
        baseMana: 580,
        manaPerLevel: 65,
        baseAttack: 112,
        attackPerLevel: 8.5,
        magicPower: 160,
        attackSpeed: 1.0,
        attackRange: 250,
        baseArmor: 19,
        moveSpeed: 3.2,
        passive: {
            name: 'Superconducting Resonance',
            desc: 'Memberikan tanda muatan Superkonduktor pada musuh. Skill berikutnya akan mengalami amplifikasi damage +40% dan area ledakan lebih luas.'
        },
        skills: [
            {
                key: '1',
                name: 'Forked Arc Lightning',
                desc: 'Melepaskan gelombang petir bercabang berbentuk kurva parabola yang menyengat barisan musuh dengan 380 (+140% Magic) Damage.',
                cooldown: 5.0,
                manaCost: 65,
                range: 270,
                type: 'fan_lightning'
            },
            {
                key: '2',
                name: 'Polarizing Ion Bolt (Stun)',
                desc: 'Menembakkan bola muatan listrik terpolarisasi yang mengunci lawan, menghasilkan Stun selama 1.3 detik dan 300 Magic Damage.',
                cooldown: 7.0,
                manaCost: 75,
                range: 250,
                type: 'stun_bolt'
            },
            {
                key: '3',
                name: 'Thunder of Pythagoras (Ult)',
                desc: 'Memanggil badai halilintar kuantum raksasa dari langit, menghantam titik fokus target dengan 780 (+280% Magic) True Burst Damage!',
                cooldown: 22.0,
                manaCost: 115,
                range: 290,
                type: 'thunder_smite'
            }
        ]
    },
    {
        id: 'layla',
        name: 'Layla',
        title: 'Malefic Trigonometric Gunner',
        role: 'Marksman',
        icon: '🏹',
        avatarColor: '#06b6d4',
        avatarBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        baseHp: 2400,
        hpPerLevel: 175,
        baseMana: 440,
        manaPerLevel: 38,
        baseAttack: 135,
        attackPerLevel: 13.8,
        attackSpeed: 1.4,
        attackRange: 280,
        baseArmor: 18,
        moveSpeed: 3.3,
        passive: {
            name: 'Trigonometric Distance Scaling',
            desc: 'Semakin jauh jarak tembakan Layla ke target (fungsi hipotenusa), damage meningkat hingga +140% dari base damage!'
        },
        skills: [
            {
                key: '1',
                name: 'Sine Wave Laser Cannon',
                desc: 'Menembakkan berkas laser berenergi lurus jarak jauh. Jika mengenai target, Layla mendapat +45% Movement Speed selama 3 detik.',
                cooldown: 4.0,
                manaCost: 40,
                range: 380,
                type: 'straight_bomb'
            },
            {
                key: '2',
                name: 'Cosine Void Flare',
                desc: 'Meledakkan granat foton bergeometri lingkaran yang memperlambat musuh 65% dan memberikan 260 Physical Damage.',
                cooldown: 6.0,
                manaCost: 55,
                range: 290,
                type: 'aoe_slow'
            },
            {
                key: '3',
                name: 'Destruction Vector Beam (Ult)',
                desc: 'Menembakkan meriam laser raksasa berdaya hancur global menembus seluruh medan tempur dengan damage 650 (+180% ATK)!',
                cooldown: 20.0,
                manaCost: 90,
                range: 750,
                type: 'global_laser'
            }
        ]
    },
    {
        id: 'tigreal',
        name: 'Tigreal',
        title: 'Guardian of Sacred Geometry',
        role: 'Tank / Initiator',
        icon: '🛡️',
        avatarColor: '#eab308',
        avatarBg: 'linear-gradient(135deg, #eab308, #ca8a04)',
        baseHp: 3300,
        hpPerLevel: 270,
        baseMana: 480,
        manaPerLevel: 48,
        baseAttack: 120,
        attackPerLevel: 9.5,
        attackSpeed: 0.95,
        attackRange: 75,
        baseArmor: 45,
        moveSpeed: 3.05,
        passive: {
            name: 'Tessellation Shield',
            desc: 'Membentuk perisai heksagonal yang menyerap serangan. Saat 4 lapisan terkumpul, serangan musuh berikutnya diblokir 100% secara total.'
        },
        skills: [
            {
                key: '1',
                name: 'Seismic Shockwave',
                desc: 'Menghantamkan palu suci memicu 3 riak gelombang kejut tanah yang memperlambat musuh 50% dan memberikan 250 Damage.',
                cooldown: 5.0,
                manaCost: 45,
                range: 230,
                type: 'shockwave'
            },
            {
                key: '2',
                name: 'Geometric Displacement',
                desc: 'Mendorong musuh ke depan sejauh 220 unit lalu menghempaskan mereka ke udara dalam gravitasi nol (Knock-Up 1s).',
                cooldown: 7.0,
                manaCost: 65,
                range: 210,
                type: 'push_knockup'
            },
            {
                key: '3',
                name: 'Singularity Implosion (Ult)',
                desc: 'Menciptakan titik gravitasi singularitas di tanah, menarik paksa seluruh musuh di sekitar dan men-stun mereka selama 1.6 detik!',
                cooldown: 30.0,
                manaCost: 100,
                range: 260,
                type: 'pull_stun_aoe'
            }
        ]
    },
    {
        id: 'estes',
        name: 'Estes',
        title: 'Fibonacci Life Sage',
        role: 'Support / Healer',
        icon: '💚',
        avatarColor: '#10b981',
        avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
        baseHp: 2550,
        hpPerLevel: 180,
        baseMana: 620,
        manaPerLevel: 75,
        baseAttack: 112,
        attackPerLevel: 8.8,
        magicPower: 135,
        attackSpeed: 1.0,
        attackRange: 220,
        baseArmor: 22,
        moveSpeed: 3.2,
        passive: {
            name: 'Golden Ratio Resonance (Phi)',
            desc: 'Mengumpulkan rasio emas cahaya alam. Setiap 5 detik, basic attack memantul ke 3 target musuh terdekat dan memberikan efek slow 40%.'
        },
        skills: [
            {
                key: '1',
                name: 'Fibonacci Beam Link',
                desc: 'Menghubungkan untaian berkas cahaya matematis ke kawan, memulihkan 380 (+110% Magic) HP seketika + regenerasi berkelanjutan.',
                cooldown: 5.5,
                manaCost: 75,
                range: 280,
                type: 'heal_link'
            },
            {
                key: '2',
                name: 'Domain of Euler [e^(iπ)]',
                desc: 'Memanggil lingkaran domain geometris yang melambatkan musuh hingga 80% dan memberikan 280 Magic Damage.',
                cooldown: 6.5,
                manaCost: 70,
                range: 250,
                type: 'aoe_slow_zone'
            },
            {
                key: '3',
                name: 'Infinite Blessing of Numeria (Ult)',
                desc: 'Memancarkan pancaran kosmik yang meregenerasi HP seluruh rekan tim di area luas sebesar 800 (+200% Magic) HP!',
                cooldown: 28.0,
                manaCost: 120,
                range: 320,
                type: 'mass_heal'
            }
        ]
    }
];

const MLBB_BATTLE_SPELLS = [
    {
        id: 'flicker',
        name: 'Quantum Flicker',
        desc: 'Teleportasi instan melintasi dimensi sejauh 200 unit ke arah bidikan.',
        cooldown: 35.0,
        icon: '⚡'
    },
    {
        id: 'execute',
        name: 'Calculated Execute',
        desc: 'Eksekusi True Damage matematis: 250 + (12% dari total HP musuh yang hilang).',
        cooldown: 30.0,
        icon: '⚔️'
    },
    {
        id: 'retribution',
        name: 'Singularity Retribution',
        desc: 'Memberikan 850 True Damage instan ke monster jungle atau minion.',
        cooldown: 22.0,
        icon: '🗡️'
    },
    {
        id: 'flameshot',
        name: 'Plasma Flameshot',
        desc: 'Tembakan plasma jarak jauh yang memukul mundur musuh dekat dan membakar musuh jauh.',
        cooldown: 28.0,
        icon: '🔥'
    },
    {
        id: 'sprint',
        name: 'Velocity Sprint',
        desc: 'Meningkatkan movement speed +55% dan kebal efek slow selama 6 detik.',
        cooldown: 40.0,
        icon: '👟'
    }
];

window.MLBB_HEROES = MLBB_HEROES;
window.MLBB_BATTLE_SPELLS = MLBB_BATTLE_SPELLS;
