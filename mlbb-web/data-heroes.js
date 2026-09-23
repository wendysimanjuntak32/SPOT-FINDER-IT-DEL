/**
 * MLBB WEB - 6 Hero Roster & Skill Database
 * Authentic Mobile Legends archetypes (Zilong, Saber, Eudora, Layla, Tigreal, Estes)
 */

const MLBB_HEROES = [
    {
        id: 'zilong',
        name: 'Zilong',
        title: 'Son of the Dragon',
        role: 'Fighter',
        icon: '⚔️',
        avatarColor: '#f43f5e',
        avatarBg: 'linear-gradient(135deg, #f43f5e, #be123c)',
        baseHp: 2680,
        hpPerLevel: 195,
        baseMana: 450,
        manaPerLevel: 40,
        baseAttack: 125,
        attackPerLevel: 11.5,
        attackSpeed: 1.15,
        attackRange: 80,
        baseArmor: 25,
        moveSpeed: 3.4,
        passive: {
            name: 'Dragon Flurry',
            desc: 'Setiap 3 serangan dasar, serangan berikutnya melakukan multi-thrust damage masif dan memulihkan HP.'
        },
        skills: [
            {
                key: '1',
                name: 'Spear Flip',
                desc: 'Menusuk dan mengangkat musuh ke belakang tubuhnya, memberikan 250 (+80% ATK) Physical Damage.',
                cooldown: 8.0,
                manaCost: 65,
                range: 120,
                type: 'flip'
            },
            {
                key: '2',
                name: 'Spear Strike',
                desc: 'Menerjang ke arah target musuh, memberikan 200 (+60% ATK) Physical Damage dan mengurangi 15 Armor musuh.',
                cooldown: 5.5,
                manaCost: 50,
                range: 220,
                type: 'dash_target'
            },
            {
                key: '3',
                name: 'Supreme Warrior (Ult)',
                desc: 'Mendapatkan +45% Movement Speed, +50% Attack Speed, dan IMUN terhadap semua efek Slow selama 6 detik!',
                cooldown: 28.0,
                manaCost: 100,
                type: 'buff_ultimate'
            }
        ]
    },
    {
        id: 'saber',
        name: 'Saber',
        title: 'Spacetime Swordmaster',
        role: 'Assassin',
        icon: '🗡️',
        avatarColor: '#8b5cf6',
        avatarBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        baseHp: 2450,
        hpPerLevel: 180,
        baseMana: 480,
        manaPerLevel: 45,
        baseAttack: 132,
        attackPerLevel: 12.8,
        attackSpeed: 1.1,
        attackRange: 80,
        baseArmor: 22,
        moveSpeed: 3.5,
        passive: {
            name: 'Enemy's Bane',
            desc: 'Setiap serangan mengurangi 5 Physical Defense musuh (dapat di-stack hingga 5 kali).'
        },
        skills: [
            {
                key: '1',
                name: 'Orbiting Swords',
                desc: 'Memancarkan 5 pedang berputar di sekitarnya. Saat menyerang musuh, pedang meluncur menusuk target.',
                cooldown: 8.0,
                manaCost: 75,
                range: 160,
                type: 'orbit_swords'
            },
            {
                key: '2',
                name: 'Charge',
                desc: 'Melesat ke depan memberikan 180 (+50% ATK) Physical Damage dan memperkuat basic attack berikutnya.',
                cooldown: 6.0,
                manaCost: 55,
                range: 200,
                type: 'dash_straight'
            },
            {
                key: '3',
                name: 'Triple Sweep (Ult)',
                desc: 'Menerjang dan mengangkat target ke udara, menebas 3 kali berturut-turut dengan total 540 (+200% ATK) Burst Damage!',
                cooldown: 26.0,
                manaCost: 110,
                range: 220,
                type: 'airborne_lock'
            }
        ]
    },
    {
        id: 'eudora',
        name: 'Eudora',
        title: 'Lightning Sorceress',
        role: 'Mage',
        icon: '🧙‍♂️',
        avatarColor: '#3b82f6',
        avatarBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        baseHp: 2320,
        hpPerLevel: 165,
        baseMana: 550,
        manaPerLevel: 60,
        baseAttack: 110,
        attackPerLevel: 8.0,
        magicPower: 140,
        attackSpeed: 1.0,
        attackRange: 240,
        baseArmor: 18,
        moveSpeed: 3.1,
        passive: {
            name: 'Superconductor',
            desc: 'Skill memberikan efek konduktor pada musuh, meningkatkan damage dan efek skill berikutnya.'
        },
        skills: [
            {
                key: '1',
                name: 'Forked Lightning',
                desc: 'Melepaskan sambaran petir berbentuk kipas yang memberikan 350 (+130% Magic) Magic Damage.',
                cooldown: 5.5,
                manaCost: 70,
                range: 260,
                type: 'fan_lightning'
            },
            {
                key: '2',
                name: 'Electric Arrow (Stun)',
                desc: 'Menembakkan bola listrik yang mengunci target, memberikan 280 Magic Damage dan Stun selama 1.2 detik.',
                cooldown: 7.5,
                manaCost: 80,
                range: 240,
                type: 'stun_bolt'
            },
            {
                key: '3',
                name: 'Thunder's Wrath (Ult)',
                desc: 'Memanggil badai halilintar dahsyat dari langit yang menghantam target dengan 700 (+250% Magic) Burst Damage!',
                cooldown: 24.0,
                manaCost: 120,
                range: 280,
                type: 'thunder_smite'
            }
        ]
    },
    {
        id: 'layla',
        name: 'Layla',
        title: 'Malefic Gunner',
        role: 'Marksman',
        icon: '🏹',
        avatarColor: '#06b6d4',
        avatarBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        baseHp: 2380,
        hpPerLevel: 170,
        baseMana: 420,
        manaPerLevel: 35,
        baseAttack: 130,
        attackPerLevel: 13.0,
        attackSpeed: 1.35,
        attackRange: 270, // Increases with levels
        baseArmor: 18,
        moveSpeed: 3.25,
        passive: {
            name: 'Malefic Gun',
            desc: 'Semakin jauh jarak musuh dari Layla, damage serangannya meningkat hingga +135%!'
        },
        skills: [
            {
                key: '1',
                name: 'Malefic Bomb',
                desc: 'Menembakkan bom energi lurus jarak jauh. Jika mengenai musuh, movement speed Layla bertambah +40%.',
                cooldown: 4.5,
                manaCost: 45,
                range: 360,
                type: 'straight_bomb'
            },
            {
                key: '2',
                name: 'Void Projectile',
                desc: 'Melepaskan bola energi bola hampa yang meledak, memberikan 240 Physical Damage dan efek Slow 60%.',
                cooldown: 6.5,
                manaCost: 60,
                range: 280,
                type: 'aoe_slow'
            },
            {
                key: '3',
                name: 'Destruction Rush (Ult)',
                desc: 'Menembakkan meriam laser raksasa berjarak ultra jauh yang membakar seluruh barisan musuh!',
                cooldown: 22.0,
                manaCost: 95,
                range: 650,
                type: 'global_laser'
            }
        ]
    },
    {
        id: 'tigreal',
        name: 'Tigreal',
        title: 'Warrior of Dawn',
        role: 'Tank',
        icon: '🛡️',
        avatarColor: '#eab308',
        avatarBg: 'linear-gradient(135deg, #eab308, #ca8a04)',
        baseHp: 3200,
        hpPerLevel: 250,
        baseMana: 460,
        manaPerLevel: 45,
        baseAttack: 115,
        attackPerLevel: 9.0,
        attackSpeed: 0.95,
        attackRange: 75,
        baseArmor: 42,
        moveSpeed: 3.0,
        passive: {
            name: 'Fearless Shield',
            desc: 'Mendapatkan 1 lapisan perisai setiap menyerang atau terkena skill. Memblokir 1 basic attack musuh sepenuhnya.'
        },
        skills: [
            {
                key: '1',
                name: 'Attack Wave',
                desc: 'Menghentakkan palu ke tanah melepaskan 3 gelombang api yang memperlambat musuh 40%.',
                cooldown: 5.5,
                manaCost: 50,
                range: 220,
                type: 'shockwave'
            },
            {
                key: '2',
                name: 'Sacred Hammer',
                desc: 'Mendorong musuh ke depan sejauh 200 unit lalu menghempaskan mereka ke udara (Knock Up).',
                cooldown: 7.5,
                manaCost: 70,
                range: 200,
                type: 'push_knockup'
            },
            {
                key: '3',
                name: 'Implosion (Ult)',
                desc: 'Menghujamkan pedang ke tanah, menyedot seluruh musuh di sekitarnya dan memberikan stun selama 1.5 detik!',
                cooldown: 32.0,
                manaCost: 110,
                range: 240,
                type: 'pull_stun_aoe'
            }
        ]
    },
    {
        id: 'estes',
        name: 'Estes',
        title: 'Moon Elf King',
        role: 'Support',
        icon: '💚',
        avatarColor: '#10b981',
        avatarBg: 'linear-gradient(135deg, #10b981, #059669)',
        baseHp: 2500,
        hpPerLevel: 175,
        baseMana: 600,
        manaPerLevel: 70,
        baseAttack: 110,
        attackPerLevel: 8.5,
        magicPower: 120,
        attackSpeed: 1.0,
        attackRange: 210,
        baseArmor: 20,
        moveSpeed: 3.15,
        passive: {
            name: 'Code of Moon Elves',
            desc: 'Mengumpulkan energi cahaya bulan. Basic attack berikutnya memantul ke musuh sekitar dan memperlambat mereka.'
        },
        skills: [
            {
                key: '1',
                name: 'Moonlight Immersion',
                desc: 'Menghubungkan tali cahaya ke rekan tim terdekat, memulihkan 320 (+100% Magic) HP secara instan dan berkelanjutan.',
                cooldown: 6.0,
                manaCost: 80,
                range: 260,
                type: 'heal_link'
            },
            {
                key: '2',
                name: 'Domain of Moon God',
                desc: 'Menciptakan lingkaran banjir cahaya bulan di area target, memberikan 250 Magic Damage dan Slow parah 75%.',
                cooldown: 7.0,
                manaCost: 75,
                range: 240,
                type: 'aoe_slow_zone'
            },
            {
                key: '3',
                name: 'Blessing of Moon (Ult)',
                desc: 'Memancarkan cahaya bulan suci yang memulihkan HP seluruh rekan tim di sekitarnya secara masif!',
                cooldown: 30.0,
                manaCost: 130,
                range: 300,
                type: 'mass_heal'
            }
        ]
    }
];

const MLBB_BATTLE_SPELLS = [
    {
        id: 'flicker',
        name: 'Flicker',
        desc: 'Teleportasi instan jarak pendek ke arah kursor/gerak.',
        cooldown: 40.0,
        icon: '⚡'
    },
    {
        id: 'execute',
        name: 'Execute',
        desc: 'Serangan pamungkas True Damage (200 + 10% HP hilang musuh).',
        cooldown: 35.0,
        icon: '⚔️'
    },
    {
        id: 'retribution',
        name: 'Retribution',
        desc: 'Memberikan 600 True Damage instan ke monster hutan / minion.',
        cooldown: 25.0,
        icon: '🗡️'
    },
    {
        id: 'flameshot',
        name: 'Flameshot',
        desc: 'Tembakan api jarak jauh yang memberikan knockback musuh dekat dan damage tinggi.',
        cooldown: 30.0,
        icon: '🔥'
    },
    {
        id: 'sprint',
        name: 'Sprint',
        desc: 'Meningkatkan movement speed +50% dan imun slow selama 6 detik.',
        cooldown: 45.0,
        icon: '👟'
    }
];

window.MLBB_HEROES = MLBB_HEROES;
window.MLBB_BATTLE_SPELLS = MLBB_BATTLE_SPELLS;
