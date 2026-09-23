/**
 * LeaveCheck Core Rules Engine & Interactive State Controller
 */

class LeaveCheckApp {
    constructor() {
        this.selectedDestination = 'gd';
        this.selectedTime = 'morning';
        this.selectedWeather = 'cloudy';
        this.selectedActivity = 'study';

        this.customItems = [];
        this.checkedItemIds = new Set();
        this.currentActiveItems = [];

        this.init();
    }

    init() {
        this.loadState();
        this.detectCurrentTimeOfDay();
        this.evaluateSmartChecklist();
        this.setupEventListeners();
    }

    // Auto-detect system time (pagi, siang, malam)
    detectCurrentTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            this.selectedTime = 'morning';
        } else if (hour >= 12 && hour < 17) {
            this.selectedTime = 'afternoon';
        } else {
            this.selectedTime = 'night';
        }

        const timeSelect = document.getElementById('select-time');
        if (timeSelect) timeSelect.value = this.selectedTime;
    }

    loadState() {
        try {
            const savedChecked = localStorage.getItem('leavecheck_checked_items_v1');
            const savedCustom = localStorage.getItem('leavecheck_custom_items_v1');
            if (savedChecked) this.checkedItemIds = new Set(JSON.parse(savedChecked));
            if (savedCustom) this.customItems = JSON.parse(savedCustom);
        } catch (e) {
            console.error("Gagal memuat state LeaveCheck:", e);
        }
    }

    saveState() {
        try {
            localStorage.setItem('leavecheck_checked_items_v1', JSON.stringify(Array.from(this.checkedItemIds)));
            localStorage.setItem('leavecheck_custom_items_v1', JSON.stringify(this.customItems));
        } catch (e) {
            console.error("Gagal menyimpan state LeaveCheck:", e);
        }
    }

    // ==========================================
    // Smart Rules Evaluation Engine
    // ==========================================
    evaluateSmartChecklist() {
        const activeTriggers = new Set(['always']);

        // Destination triggers
        activeTriggers.add(`dest_${this.selectedDestination}`);

        // Time triggers (If night -> trigger night thermos & jacket)
        activeTriggers.add(`time_${this.selectedTime}`);
        if (this.selectedTime === 'night') {
            activeTriggers.add('time_night');
        }

        // Weather triggers (If rainy/cloudy -> trigger umbrella)
        activeTriggers.add(`weather_${this.selectedWeather}`);
        if (this.selectedWeather === 'rainy' || this.selectedWeather === 'cloudy') {
            activeTriggers.add('weather_rainy');
        }
        if (this.selectedWeather === 'cold') {
            activeTriggers.add('weather_cold');
        }

        // Activity triggers (If canteen -> trigger spoon & fork)
        activeTriggers.add(`activity_${this.selectedActivity}`);
        if (this.selectedDestination === 'canteen') {
            activeTriggers.add('activity_canteen');
        }

        // Filter catalog items
        const matchedItems = ITEM_CATALOG.filter(item => {
            return item.triggerRules.some(rule => activeTriggers.has(rule));
        });

        // Combine with custom items
        this.currentActiveItems = [...matchedItems, ...this.customItems];

        this.renderChecklist();
        this.renderGatekeeperStatus();
    }

    // ==========================================
    // Render Functions
    // ==========================================
    renderChecklist() {
        const container = document.getElementById('checklist-container');
        if (!container) return;

        container.innerHTML = '';

        if (this.currentActiveItems.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-lg);">
                    <p style="color: var(--text-muted);">Tidak ada barang yang perlu dibawa untuk pengaturan ini.</p>
                </div>
            `;
            return;
        }

        this.currentActiveItems.forEach(item => {
            const isChecked = this.checkedItemIds.has(item.id);
            const card = document.createElement('div');
            card.className = `item-card ${isChecked ? 'checked' : ''}`;
            card.onclick = () => this.toggleItemCheck(item.id);

            card.innerHTML = `
                <div class="custom-checkbox">
                    ${isChecked ? '✓' : ''}
                </div>

                <div class="item-icon">${item.icon}</div>

                <div class="item-details">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <h3 class="item-name">${item.name}</h3>
                        <span class="importance-tag ${item.importance || 'medium'}">
                            ${item.importance === 'critical' ? 'WAJIB' : item.importance === 'high' ? 'PENTING' : 'SARAN'}
                        </span>
                    </div>
                    <p class="item-desc">${item.desc}</p>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderGatekeeperStatus() {
        const total = this.currentActiveItems.length;
        const checkedCount = this.currentActiveItems.filter(i => this.checkedItemIds.has(i.id)).length;
        const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
        const isAllReady = total > 0 && checkedCount === total;

        const gatekeeperCard = document.getElementById('gatekeeper-card');
        const titleEl = document.getElementById('gatekeeper-title');
        const countEl = document.getElementById('gatekeeper-count');
        const fillEl = document.getElementById('gatekeeper-progress-fill');
        const btnVoice = document.getElementById('btn-voice-check');

        if (gatekeeperCard) {
            if (isAllReady) gatekeeperCard.classList.add('all-ready');
            else gatekeeperCard.classList.remove('all-ready');
        }

        if (titleEl) {
            titleEl.textContent = isAllReady 
                ? '🎉 100% LENGKAP! Aman Melangkah Keluar Kamar!' 
                : 'Pengecekan Barang Sebelum Keluar Kamar';
        }

        if (countEl) {
            countEl.textContent = `${checkedCount} / ${total} Barang Siap (${percent}%)`;
        }

        if (fillEl) {
            fillEl.style.width = `${percent}%`;
        }

        if (btnVoice) {
            btnVoice.textContent = isAllReady ? '🔊 Dengarkan Konfirmasi Lengkap' : '🔊 Bacakan Barang yang Belum Dibawa';
        }
    }

    // ==========================================
    // Interaction Handlers
    // ==========================================
    toggleItemCheck(itemId) {
        if (this.checkedItemIds.has(itemId)) {
            this.checkedItemIds.delete(itemId);
            window.leaveAudio.playUncheck();
        } else {
            this.checkedItemIds.add(itemId);
            window.leaveAudio.playCheck();
        }

        this.saveState();
        this.renderChecklist();
        this.renderGatekeeperStatus();

        // If completed all
        const total = this.currentActiveItems.length;
        const checkedCount = this.currentActiveItems.filter(i => this.checkedItemIds.has(i.id)).length;
        if (total > 0 && checkedCount === total) {
            window.leaveAudio.playReadyFanfare();
            this.showToast("Luar biasa! Semua barang telah lengkap dan aman di dalam tas!");
        }
    }

    applyPreset(presetId) {
        const preset = PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        this.selectedDestination = preset.destination;
        this.selectedTime = preset.timeOfDay;
        this.selectedWeather = preset.weather;
        this.selectedActivity = preset.activity;

        // Update form selects
        document.getElementById('select-dest').value = this.selectedDestination;
        document.getElementById('select-time').value = this.selectedTime;
        document.getElementById('select-weather').value = this.selectedWeather;
        document.getElementById('select-activity').value = this.selectedActivity;

        // Update chip active classes
        document.querySelectorAll('.preset-chip').forEach(chip => {
            if (chip.getAttribute('data-preset') === presetId) chip.classList.add('active');
            else chip.classList.remove('active');
        });

        this.evaluateSmartChecklist();
        window.leaveAudio.playCheck();
        this.showToast(`Preset diaktifkan: ${preset.name}`);
    }

    voiceCheckMissing() {
        const missingItems = this.currentActiveItems
            .filter(i => !this.checkedItemIds.has(i.id))
            .map(i => i.name);

        window.leaveAudio.speakMissingItems(missingItems);
    }

    resetChecklist() {
        this.checkedItemIds.clear();
        this.saveState();
        this.renderChecklist();
        this.renderGatekeeperStatus();
        window.leaveAudio.playUncheck();
        this.showToast("Semua centang barang telah direset.");
    }

    addCustomItem(name, icon, desc, importance) {
        const newItem = {
            id: 'custom-' + Date.now(),
            name,
            icon: icon || '📦',
            category: 'custom',
            desc: desc || 'Barang pribadi tambahan.',
            importance: importance || 'medium',
            triggerRules: ['always']
        };

        this.customItems.push(newItem);
        this.saveState();
        this.evaluateSmartChecklist();
        this.showToast(`Barang baru "${name}" berhasil ditambahkan ke daftar!`);
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    setupEventListeners() {
        // Select change handlers
        const selectDest = document.getElementById('select-dest');
        const selectTime = document.getElementById('select-time');
        const selectWeather = document.getElementById('select-weather');
        const selectActivity = document.getElementById('select-activity');

        if (selectDest) selectDest.onchange = (e) => { this.selectedDestination = e.target.value; this.evaluateSmartChecklist(); };
        if (selectTime) selectTime.onchange = (e) => { this.selectedTime = e.target.value; this.evaluateSmartChecklist(); };
        if (selectWeather) selectWeather.onchange = (e) => { this.selectedWeather = e.target.value; this.evaluateSmartChecklist(); };
        if (selectActivity) selectActivity.onchange = (e) => { this.selectedActivity = e.target.value; this.evaluateSmartChecklist(); };

        // Presets click
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.onclick = () => {
                const pId = chip.getAttribute('data-preset');
                this.applyPreset(pId);
            };
        });

        // Voice button
        const btnVoice = document.getElementById('btn-voice-check');
        if (btnVoice) btnVoice.onclick = () => this.voiceCheckMissing();

        // Reset button
        const btnReset = document.getElementById('btn-reset-checklist');
        if (btnReset) btnReset.onclick = () => this.resetChecklist();

        // Custom Item Modal
        const btnOpenAdd = document.getElementById('btn-open-add-item');
        const modalAdd = document.getElementById('modal-add-item');
        const formAdd = document.getElementById('form-add-item');

        if (btnOpenAdd && modalAdd) {
            btnOpenAdd.onclick = () => modalAdd.classList.add('active');
        }

        if (formAdd) {
            formAdd.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('new-item-name').value;
                const icon = document.getElementById('new-item-icon').value;
                const desc = document.getElementById('new-item-desc').value;
                const imp = document.getElementById('new-item-imp').value;

                this.addCustomItem(name, icon, desc, imp);
                formAdd.reset();
                modalAdd.classList.remove('active');
            };
        }

        // Close modal
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            };
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new LeaveCheckApp();
});
