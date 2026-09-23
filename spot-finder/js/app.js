/**
 * SpotFinder IT Del - Controller Aplikasi Kampus Institut Teknologi Del
 */

class SpotFinderApp {
    constructor() {
        this.spots = JSON.parse(JSON.stringify(IT_DEL_SPOTS));
        this.selectedFilter = 'all';
        this.searchQuery = '';
        this.currentSelectedSpot = null;
        this.currentSelectedSeat = null;
        this.darkMode = false;

        // MQTT Broker Configuration (IP: 76.13.19.250)
        this.mqttConfig = {
            brokerIp: "76.13.19.250",
            wsPort: 9001, // WebSocket Port for Web Browser
            tcpPort: 1883, // TCP Port for ESP32
            topicGazebo: "itdel/gazebo/status",
            topicAll: "itdel/spots/all",
            client: null,
            isConnected: false
        };

        this.init();
    }

    init() {
        this.renderSummaryStats();
        this.renderSpots();
        this.setupEventListeners();
        this.initMqttConnection();
        this.startLiveSimulation();
    }

    // ==========================================
    // Render Summary Stats
    // ==========================================
    renderSummaryStats() {
        const totalEmpty = this.spots.reduce((acc, s) => acc + s.availableSeats, 0);
        const quietest = this.spots.filter(s => s.availableSeats > 0).sort((a, b) => a.noiseScore - b.noiseScore)[0];
        const withOutlets = this.spots.filter(s => s.powerOutlets && s.availableSeats > 0).reduce((acc, s) => acc + s.availableSeats, 0);

        const statTotalEl = document.getElementById('stat-total-empty');
        const statQuietEl = document.getElementById('stat-quiet-spot');
        const statOutletEl = document.getElementById('stat-outlet-empty');

        if (statTotalEl) statTotalEl.textContent = `${totalEmpty} Kursi`;
        if (statQuietEl) statQuietEl.textContent = quietest ? quietest.name.split('(')[0].trim() : 'Penuh';
        if (statOutletEl) statOutletEl.textContent = `${withOutlets} Kursi`;
    }

    // ==========================================
    // Render Spots Grid
    // ==========================================
    renderSpots() {
        const grid = document.getElementById('spots-container');
        if (!grid) return;

        grid.innerHTML = '';

        let filtered = this.spots.filter(spot => {
            const matchesSearch = spot.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  spot.building.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  spot.campusZone.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  spot.tags.some(t => t.toLowerCase().includes(this.searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            if (this.selectedFilter === 'all') return true;
            if (this.selectedFilter === 'empty-only') return spot.availableSeats > 0;
            if (this.selectedFilter === 'perpus') return spot.category === 'library';
            if (this.selectedFilter === 'silent') return spot.noiseScore === 1;
            if (this.selectedFilter === 'outlets') return spot.powerOutlets;
            if (this.selectedFilter === 'group') return spot.category === 'study-room';
            if (this.selectedFilter === 'outdoor') return spot.outdoor;

            return true;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
                    <h3>Tidak ditemukan spot di Kampus IT Del yang cocok</h3>
                    <p style="margin-top: 6px;">Coba gunakan kata kunci seperti 'Perpus', 'GD 7', 'GD 9', atau 'Colokan'.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(spot => {
            const card = document.createElement('div');
            card.className = 'spot-card';

            let statusClass = 'available';
            let statusText = `${spot.availableSeats} Tempat Kosong`;

            if (spot.availableSeats === 0) {
                statusClass = 'crowded';
                statusText = 'Penuh / Ramai';
            } else if (spot.availableSeats <= 3) {
                statusClass = 'almost-full';
                statusText = `Sisa ${spot.availableSeats} Kursi!`;
            }

            const occupied = spot.totalCapacity - spot.availableSeats;
            const percent = Math.min(100, Math.round((occupied / spot.totalCapacity) * 100));

            let barColor = 'green';
            if (percent > 85) barColor = 'red';
            else if (percent > 65) barColor = 'amber';

            card.innerHTML = `
                <div class="spot-header">
                    <div class="spot-identity">
                        <div class="spot-avatar">${spot.imageIcon}</div>
                        <div>
                            <h3 class="spot-name">${spot.name}</h3>
                            <p class="spot-location">📍 ${spot.floor} • ${spot.building}</p>
                            <span style="font-size: 0.78rem; font-weight: 700; color: var(--accent); background: var(--accent-light); padding: 2px 8px; border-radius: 9999px; display: inline-block; margin-top: 4px;">
                                🚶 ${spot.distance} (${spot.campusZone})
                            </span>
                        </div>
                    </div>
                    <span class="status-pill ${statusClass}">
                        ${statusClass === 'available' ? '🟢' : statusClass === 'almost-full' ? '🟡' : '🔴'} ${statusText}
                    </span>
                </div>

                <div class="spot-body">
                    <div class="capacity-meter-box">
                        <div class="capacity-labels">
                            <span>Keterisian: <strong>${percent}%</strong></span>
                            <span>Tersedia: <strong class="available-count">${spot.availableSeats}</strong> / ${spot.totalCapacity}</span>
                        </div>
                        <div class="capacity-bar-track">
                            <div class="capacity-bar-fill ${barColor}" style="width: ${percent}%"></div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                        <span>🔊 ${spot.noiseLevel}</span>
                        <span>📶 ${spot.wifiSpeed}</span>
                    </div>

                    <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.4;">
                        ${spot.description}
                    </p>

                    <div class="facility-chips">
                        ${spot.powerOutlets ? '<span class="facility-chip">🔌 Colokan Ada</span>' : ''}
                        ${spot.ac ? '<span class="facility-chip">❄️ AC Dingin</span>' : ''}
                        ${spot.whiteboard ? '<span class="facility-chip">📋 Papan Tulis</span>' : ''}
                        ${spot.outdoor ? '<span class="facility-chip">🍃 Outdoor / View Danau</span>' : ''}
                        <span class="facility-chip">⏰ ${spot.openHours}</span>
                    </div>
                </div>

                <div class="spot-footer">
                    <button class="btn-secondary" onclick="app.openReportModal('${spot.id}')">
                        📢 Lapor Kondisi
                    </button>
                    <button class="btn-primary" onclick="app.openSeatMapModal('${spot.id}')" ${spot.availableSeats === 0 ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>
                        🪑 Lihat & Amankan Kursi
                    </button>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    // ==========================================
    // Interactive Seat Map Modal
    // ==========================================
    openSeatMapModal(spotId) {
        const spot = this.spots.find(s => s.id === spotId);
        if (!spot) return;

        this.currentSelectedSpot = spot;
        this.currentSelectedSeat = null;

        const modal = document.getElementById('seat-modal');
        const titleEl = document.getElementById('seat-modal-title');
        const locationEl = document.getElementById('seat-modal-location');
        const gridEl = document.getElementById('seat-grid');
        const confirmBtn = document.getElementById('btn-confirm-seat');

        if (titleEl) titleEl.textContent = `Denah Kursi: ${spot.name}`;
        if (locationEl) locationEl.textContent = `${spot.floor} • Tersedia ${spot.availableSeats} kursi kosong`;

        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Pilih Kursi Terlebih Dahulu';
        }

        if (gridEl) {
            gridEl.innerHTML = '';
            spot.seats.forEach(seat => {
                const seatBtn = document.createElement('div');
                seatBtn.className = `seat-item ${seat.status}`;
                seatBtn.innerHTML = `
                    <span>${seat.id}</span>
                    <span style="font-size: 0.62rem; opacity: 0.85;">${seat.status === 'available' ? 'KOSONG' : (seat.user ? seat.user.split(' ')[0] : 'TERISI')}</span>
                `;

                if (seat.status === 'available') {
                    seatBtn.addEventListener('click', () => {
                        gridEl.querySelectorAll('.seat-item.selected').forEach(s => {
                            s.classList.remove('selected');
                            s.classList.add('available');
                        });

                        seatBtn.classList.remove('available');
                        seatBtn.classList.add('selected');
                        this.currentSelectedSeat = seat;

                        if (confirmBtn) {
                            confirmBtn.disabled = false;
                            confirmBtn.textContent = `Amankan Kursi ${seat.id} Sekarang ✨`;
                        }
                    });
                }

                gridEl.appendChild(seatBtn);
            });
        }

        if (modal) modal.classList.add('active');
    }

    confirmSeatBooking() {
        if (!this.currentSelectedSpot || !this.currentSelectedSeat) return;

        const spot = this.currentSelectedSpot;
        const seat = this.currentSelectedSeat;

        seat.status = 'occupied';
        seat.user = 'Kamu (Sedang Belajar)';
        spot.availableSeats = Math.max(0, spot.availableSeats - 1);

        this.renderSummaryStats();
        this.renderSpots();
        this.closeAllModals();

        this.showToast(`🎉 Berhasil mengamankan kursi ${seat.id} di ${spot.name}! Kamu punya waktu 15 menit untuk check-in di lokasi.`);
    }

    // ==========================================
    // Lapor Kondisi Keramaian
    // ==========================================
    openReportModal(spotId) {
        const spot = this.spots.find(s => s.id === spotId);
        if (!spot) return;

        const modal = document.getElementById('report-modal');
        const title = document.getElementById('report-modal-spot-name');
        if (title) title.textContent = spot.name;

        this.currentSelectedSpot = spot;
        if (modal) modal.classList.add('active');
    }

    submitCrowdReport(type) {
        if (!this.currentSelectedSpot) return;
        const spot = this.currentSelectedSpot;

        if (type === 'more-empty') {
            spot.availableSeats = Math.min(spot.totalCapacity, spot.availableSeats + 2);
            this.showToast(`Terima kasih! Kamu melaporkan ada kursi kosong di ${spot.name}.`);
        } else if (type === 'more-crowded') {
            spot.availableSeats = Math.max(0, spot.availableSeats - 2);
            this.showToast(`Laporan diterima: ${spot.name} bertambah ramai.`);
        }

        this.renderSummaryStats();
        this.renderSpots();
        this.closeAllModals();
    }

    // ==========================================
    // Live Ticker & Simulation
    // ==========================================
    startLiveSimulation() {
        let reportIdx = 0;
        setInterval(() => {
            if (IT_DEL_LIVE_UPDATES.length > 0) {
                const rep = IT_DEL_LIVE_UPDATES[reportIdx % IT_DEL_LIVE_UPDATES.length];
                const tickerEl = document.getElementById('live-ticker-text');
                if (tickerEl) {
                    tickerEl.innerHTML = `📢 <strong>Live Kampus IT Del:</strong> ${rep.text} <span style="opacity:0.7;">(${rep.time})</span>`;
                }
                reportIdx++;
            }
        }, 5500);
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    // ==========================================
    // MQTT Protocol & ESP32 LCD Sync Engine
    // ==========================================
    initMqttConnection() {
        // Update Virtual LCD initially
        this.updateVirtualLcd();

        if (typeof mqtt === 'undefined') {
            console.warn('MQTT.js library not loaded yet.');
            return;
        }

        try {
            // Connect to broker via WebSocket (Port 9001 on 76.13.19.250)
            const brokerUrl = `ws://${this.mqttConfig.brokerIp}:${this.mqttConfig.wsPort}`;
            console.log(`Connecting to MQTT Broker at ${brokerUrl}...`);
            
            const client = mqtt.connect(brokerUrl, {
                clientId: 'SpotFinderWeb_' + Math.random().toString(16).substr(2, 8),
                connectTimeout: 4000,
                reconnectPeriod: 5000
            });

            this.mqttConfig.client = client;

            client.on('connect', () => {
                this.mqttConfig.isConnected = true;
                this.updateMqttBadge(true);
                console.log('Connected to MQTT Broker 76.13.19.250');
                
                // Subscribe to Gazebo Status topic
                client.subscribe(this.mqttConfig.topicGazebo);
                
                // Send Initial Broadcast
                this.broadcastGazeboStatus();
            });

            client.on('error', (err) => {
                console.warn('MQTT Broker connection error, falling back to simulated broker mode:', err);
                this.mqttConfig.isConnected = false;
                this.updateMqttBadge(false);
            });

            client.on('close', () => {
                this.mqttConfig.isConnected = false;
                this.updateMqttBadge(false);
            });

            client.on('message', (topic, message) => {
                console.log(`MQTT Received [${topic}]:`, message.toString());
            });

        } catch (e) {
            console.warn('Could not initialize MQTT connection directly:', e);
            this.updateMqttBadge(false);
        }
    }

    updateMqttBadge(connected) {
        const dot = document.getElementById('mqtt-dot');
        const text = document.getElementById('mqtt-status-text');
        if (dot && text) {
            if (connected) {
                dot.style.background = '#10b981';
                text.textContent = 'MQTT: 76.13.19.250 (Connected)';
            } else {
                dot.style.background = '#f59e0b';
                text.textContent = 'MQTT: 76.13.19.250 (Ready)';
            }
        }
    }

    broadcastGazeboStatus() {
        const gazebo = this.spots.find(s => s.id === 'spot-gazebo-danau') || {
            name: "Gazebo View Danau Toba",
            availableSeats: 12,
            totalCapacity: 20
        };

        const percent = Math.round(((gazebo.totalCapacity - gazebo.availableSeats) / gazebo.totalCapacity) * 100);

        const payloadObj = {
            ruangan: "Gazebo Danau Toba",
            kosong: gazebo.availableSeats,
            total: gazebo.totalCapacity,
            persen: percent,
            timestamp: new Date().toLocaleTimeString('id-ID'),
            update: "Live-Sync"
        };

        const payloadStr = JSON.stringify(payloadObj);

        // Update Live Payload Monitor in UI
        const payloadEl = document.getElementById('mqtt-live-payload');
        const timeEl = document.getElementById('mqtt-last-time');
        if (payloadEl) payloadEl.textContent = JSON.stringify(payloadObj, null, 2);
        if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('id-ID');

        // Update Virtual LCD 16x2
        this.updateVirtualLcd(payloadObj);

        // Publish to MQTT Client if connected
        if (this.mqttConfig.client && this.mqttConfig.client.connected) {
            this.mqttConfig.client.publish(this.mqttConfig.topicGazebo, payloadStr, { qos: 0, retain: true });
            console.log("MQTT Broadcasted to 76.13.19.250:", payloadStr);
        }
    }

    updateVirtualLcd(data) {
        const gazebo = data || this.spots.find(s => s.id === 'spot-gazebo-danau') || {
            ruangan: "Gazebo Danau Toba",
            kosong: 12,
            total: 20
        };

        const line1El = document.getElementById('virtual-lcd-line1');
        const line2El = document.getElementById('virtual-lcd-line2');

        const name = (gazebo.ruangan || gazebo.name || "Gazebo Danau Tob").substring(0, 16).padEnd(16, ' ');
        const kosong = gazebo.kosong !== undefined ? gazebo.kosong : gazebo.availableSeats;
        const total = gazebo.total !== undefined ? gazebo.total : gazebo.totalCapacity;
        const statusLine = `Kosong: ${kosong}/${total}`.padEnd(16, ' ');

        if (line1El) line1El.textContent = name;
        if (line2El) line2El.textContent = statusLine;
    }

    sendTestMqttBroadcast() {
        this.broadcastGazeboStatus();
        this.showToast('⚡ Data Gazebo berhasil di-publish ke MQTT Broker (76.13.19.250)!');
    }

    openEsp32Modal() {
        this.broadcastGazeboStatus();
        const modal = document.getElementById('esp32-modal');
        if (modal) modal.classList.add('active');
    }

    copyEsp32Code() {
        const code = document.getElementById('esp32-code-snippet');
        if (code) {
            navigator.clipboard.writeText(code.textContent).then(() => {
                this.showToast('📋 Kode Arduino ESP32 berhasil disalin ke clipboard!');
            }).catch(() => {
                this.showToast('Silakan salin manual kode tersebut.');
            });
        }
    }

    // ==========================================
    // Event Listeners
    // ==========================================
    setupEventListeners() {
        const searchInput = document.getElementById('spot-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderSpots();
            });
        }

        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedFilter = btn.dataset.filter;
                this.renderSpots();
            });
        });

        const confirmBtn = document.getElementById('btn-confirm-seat');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmSeatBooking();
                this.broadcastGazeboStatus(); // Broadcast MQTT when booking changes
            });
        }

        const themeBtn = document.getElementById('btn-toggle-theme');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.darkMode = !this.darkMode;
                if (this.darkMode) {
                    document.body.classList.add('dark-mode');
                    themeBtn.textContent = '☀️';
                } else {
                    document.body.classList.remove('dark-mode');
                    themeBtn.textContent = '🌙';
                }
            });
        }

        // Tombol Kode ESP32 Modal
        const btnEsp32 = document.getElementById('btn-open-esp32-code');
        if (btnEsp32) {
            btnEsp32.addEventListener('click', () => this.openEsp32Modal());
        }

        // Tombol Deteksi Lokasi
        const gpsBtn = document.getElementById('btn-detect-location');
        if (gpsBtn) {
            gpsBtn.addEventListener('click', () => {
                gpsBtn.innerHTML = '🔄 Mendeteksi...';
                setTimeout(() => {
                    gpsBtn.innerHTML = '📍 Lokasi: Kampus IT Del (Sitoluama, Laguboti)';
                    this.showToast('📍 Lokasi berhasil disinkronkan dengan Jaringan Kampus IT Del!');
                }, 800);
            });
        }

        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new SpotFinderApp();
});
