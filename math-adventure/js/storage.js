/**
 * Math Quest - Storage System
 * Manages player profile, progression, inventory, stars, and achievements in LocalStorage.
 */

const STORAGE_KEY = 'MATH_QUEST_SAVE_V1';

class StorageManager {
    constructor() {
        this.defaultData = {
            playerName: 'Pahlawan Angka',
            avatarId: 'knight',
            level: 1,
            xp: 0,
            gold: 50,
            unlockedStages: ['1-1'],
            stageStars: {}, // { '1-1': 3, '1-2': 2 }
            equipment: {
                weapon: null,
                armor: null
            },
            inventory: [
                { id: 'potion_hp', name: 'Ramuan HP Instan', count: 2, icon: '🍷' }
            ],
            achievements: [],
            stats: {
                totalBattles: 0,
                totalWins: 0,
                correctAnswers: 0,
                highestCombo: 0
            },
            settings: {
                muted: false,
                useKeypad: true
            }
        };
    }

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return JSON.parse(JSON.stringify(this.defaultData));
            }
            const parsed = JSON.parse(raw);
            return Object.assign({}, this.defaultData, parsed);
        } catch (e) {
            console.error('Error loading save data:', e);
            return JSON.parse(JSON.stringify(this.defaultData));
        }
    }

    save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    reset() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Error resetting data:', e);
        }
    }
}

window.storageManager = new StorageManager();
