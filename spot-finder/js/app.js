/**
 * SpotFinder IT Del - Controller Aplikasi Kampus Institut Teknologi Del
 */

class SpotFinderApp {
    constructor() {
        // Initialize spots from IT_DEL_SPOTS database
        this.spots = (typeof IT_DEL_SPOTS !== 'undefined') ? JSON.parse(JSON.stringify(IT_DEL_SPOTS)) : [];

        // Load Lost & Found Items
        let storedLf = null;
        try {
            storedLf = JSON.parse(localStorage.getItem('itdel_lost_found'));
        } catch(e) {}

        if (!storedLf || !Array.isArray(storedLf) || storedLf.length < 5) {
            this.lostFoundItems = (typeof IT_DEL_LOST_FOUND !== 'undefined') ? JSON.parse(JSON.stringify(IT_DEL_LOST_FOUND)) : [];
            localStorage.setItem('itdel_lost_found', JSON.stringify(this.lostFoundItems));
        } else {
            this.lostFoundItems = storedLf;
        }

        this.selectedFilter = 'all';
        this.selectedLfFilter = 'all';
        this.lfSearchQuery = '';
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

        const gazeboInit = this.spots.find(s => s.id === 'spot-gazebo-danau');
        this._previousOccupiedNum = gazeboInit ? (gazeboInit.totalCapacity - gazeboInit.availableSeats) : 8;

        this.init();
    }

    init() {
        this.renderSummaryStats();
        this.renderSpots();
        this.setupEventListeners();
        this.initMqttConnection();
        this.startLiveSimulation();
        this.updateLostFoundBadges();
    }

    // ==========================================
    // Render Summary Stats
    // ==========================================
    renderSummaryStats() {
        const totalEmpty = this.spots.reduce((acc, s) => acc + s.availableSeats, 0);
        const quietest = this.spots.filter(s => s.availableSeats > 0).sort((a, b) => a.noiseScore - b.noiseScore)[0];
        const withOutlets = this.spots.filter(s => s.powerOutlets && s.availableSeats > 0).reduce((acc, s) => acc + s.availableSeats, 0);

        const gazeboSpot = this.spots.find(s => s.id === 'spot-gazebo-danau');
        const statGazeboEl = document.getElementById('stat-gazebo-empty');
        if (statGazeboEl && gazeboSpot) {
            statGazeboEl.textContent = `${gazeboSpot.availableSeats} Kursi Kosong`;
        }

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
            card.dataset.spotId = spot.id;

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
                    <div class="spot-top-bar">
                        <div class="spot-avatar-box">${spot.imageIcon}</div>
                        <span class="status-pill ${statusClass}">
                            ${statusClass === 'available' ? '🟢' : statusClass === 'almost-full' ? '🟡' : '🔴'} ${statusText}
                        </span>
                    </div>
                    <div class="spot-title-block">
                        <h3 class="spot-name">${spot.name}</h3>
                        <p class="spot-location">📍 ${spot.floor} • ${spot.building}</p>
                        <span class="spot-zone-badge">🚶 ${spot.distance} (${spot.campusZone})</span>
                    </div>
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

                    ${spot.id === 'spot-gazebo-danau' ? `
                        <div class="spot-photo-preview" style="width: 100%; height: 140px; border-radius: 10px; overflow: hidden; position: relative; margin: 2px 0 4px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
                            <img src="assets/gazebo-danau-toba.jpg" alt="Foto Asli Gazebo Danau Toba IT Del" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                            <span class="photo-badge" style="position: absolute; bottom: 6px; left: 8px; background: rgba(3, 15, 38, 0.85); color: #38bdf8; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; backdrop-filter: blur(6px); border: 1px solid rgba(56, 189, 248, 0.35);">📸 Foto Asli Gazebo IT Del</span>
                        </div>
                    ` : (spot.id === 'spot-perpus-itdel' || spot.id === 'spot-perpus-lt2') ? `
                        <div class="spot-photo-preview" style="width: 100%; height: 140px; border-radius: 10px; overflow: hidden; position: relative; margin: 2px 0 4px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
                            <img src="assets/perpus-itdel.jpg" alt="Foto Asli Perpustakaan IT Del" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                            <span class="photo-badge" style="position: absolute; bottom: 6px; left: 8px; background: rgba(3, 15, 38, 0.85); color: #38bdf8; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; backdrop-filter: blur(6px); border: 1px solid rgba(56, 189, 248, 0.35);">📚 Foto Perpustakaan IT Del</span>
                        </div>
                    ` : (spot.id === 'spot-gd7-study' || spot.id.includes('gd7')) ? `
                        <div class="spot-photo-preview" style="width: 100%; height: 140px; border-radius: 10px; overflow: hidden; position: relative; margin: 2px 0 4px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
                            <img src="assets/gedung-del.jpg" alt="Foto Gedung Kuliah IT Del" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                            <span class="photo-badge" style="position: absolute; bottom: 6px; left: 8px; background: rgba(3, 15, 38, 0.85); color: #38bdf8; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; backdrop-filter: blur(6px); border: 1px solid rgba(56, 189, 248, 0.35);">🏛️ Gedung 7 IT Del (GD 712)</span>
                        </div>
                    ` : ''}

                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">
                        <span>🔊 ${spot.noiseLevel}</span>
                        <span>📶 ${spot.wifiSpeed}</span>
                    </div>

                    <p style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
                        ${spot.description}
                    </p>

                    <div class="facility-chips">
                        ${spot.powerOutlets ? '<span class="facility-chip">🔌 Colokan Ada</span>' : ''}
                        ${spot.ac ? '<span class="facility-chip">❄️ AC Dingin</span>' : ''}
                        ${spot.whiteboard ? '<span class="facility-chip">📋 Papan Tulis</span>' : ''}
                        ${spot.outdoor ? '<span class="facility-chip">🍃 Outdoor / View Danau</span>' : ''}
                        <span class="facility-chip">⏰ ${spot.openHours}</span>
                    </div>

                    ${(() => {
                        const lostItems = this.lostFoundItems.filter(item => item.spotId === spot.id && item.status === 'unclaimed');
                        if (lostItems.length > 0) {
                            return `
                                <div class="spot-lost-alert" onclick="app.openLostFoundModal('${spot.id}', 'list')" title="Klik untuk melihat detail barang tertinggal di ${spot.name}">
                                    <span class="spot-lost-alert-text">📦 <strong>${lostItems.length} Barang Tertinggal:</strong> ${lostItems[0].item.split('(')[0].trim()}${lostItems.length > 1 ? ', +' + (lostItems.length - 1) : ''}</span>
                                    <span class="spot-lost-alert-link">Lihat Detail ➔</span>
                                </div>
                            `;
                        }
                        return '';
                    })()}
                </div>

                <div class="spot-footer">
                    <div style="display: flex; gap: 8px; width: 100%;">
                        <button class="btn-secondary" onclick="app.openReportModal('${spot.id}')" style="flex: 1; padding: 8px 10px; font-size: 0.82rem;">
                            📢 Lapor Kondisi
                        </button>
                        <button class="btn-primary" onclick="app.openSeatMapModal('${spot.id}')" ${spot.availableSeats === 0 ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} style="flex: 1.2; padding: 8px 10px; font-size: 0.82rem;">
                            🪑 Lihat Kursi
                        </button>
                    </div>
                    <button class="spot-card-lf-btn" onclick="app.openLostFoundModal('${spot.id}', 'form')" title="Lapor barang tertinggal atau barang temuan di spot ini">
                        📦 Lapor Barang Tertinggal di ${spot.name.split('(')[0].trim()}
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
        const photoContainer = document.getElementById('seat-modal-photo-container');

        if (titleEl) titleEl.textContent = `Denah Kursi: ${spot.name}`;
        if (locationEl) locationEl.textContent = `${spot.floor} • Tersedia ${spot.availableSeats} kursi kosong`;

        if (photoContainer) {
            if (spot.id === 'spot-gazebo-danau') {
                photoContainer.innerHTML = `
                    <div style="position: relative; width: 100%; height: 160px; border-radius: 12px; overflow: hidden; margin: 4px 0 12px; border: 1px solid rgba(56, 189, 248, 0.35); box-shadow: 0 4px 14px rgba(0,0,0,0.2);">
                        <img src="assets/gazebo-danau-toba.jpg" alt="Foto Asli Gazebo Danau Toba IT Del" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 12px; background: linear-gradient(transparent, rgba(3, 15, 38, 0.95)); display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffffff; font-weight: 700; font-size: 0.82rem;">📍 Gazebo View Danau Toba (Taman Kampus IT Del)</span>
                            <span style="color: #38bdf8; font-size: 0.72rem; font-weight: 800; background: rgba(56, 189, 248, 0.18); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4);">Kapasitas: 10 Kursi</span>
                        </div>
                    </div>
                `;
                photoContainer.style.display = 'block';
            } else if (spot.id === 'spot-perpus-itdel' || spot.id === 'spot-perpus-lt2') {
                photoContainer.innerHTML = `
                    <div style="position: relative; width: 100%; height: 160px; border-radius: 12px; overflow: hidden; margin: 4px 0 12px; border: 1px solid rgba(56, 189, 248, 0.35); box-shadow: 0 4px 14px rgba(0,0,0,0.2);">
                        <img src="assets/perpus-itdel.jpg" alt="Foto Perpustakaan Institut Teknologi Del" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 12px; background: linear-gradient(transparent, rgba(3, 15, 38, 0.95)); display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffffff; font-weight: 700; font-size: 0.82rem;">📚 Perpustakaan IT Del (Lantai 2 - Zona Hening & Mandiri)</span>
                            <span style="color: #38bdf8; font-size: 0.72rem; font-weight: 800; background: rgba(56, 189, 248, 0.18); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4);">Kapasitas: 45 Kursi</span>
                        </div>
                    </div>
                `;
                photoContainer.style.display = 'block';
            } else if (spot.id === 'spot-gd7-study' || spot.id.includes('gd7')) {
                photoContainer.innerHTML = `
                    <div style="position: relative; width: 100%; height: 160px; border-radius: 12px; overflow: hidden; margin: 4px 0 12px; border: 1px solid rgba(56, 189, 248, 0.35); box-shadow: 0 4px 14px rgba(0,0,0,0.2);">
                        <img src="assets/gedung-del.jpg" alt="Foto Gedung Perkuliahan IT Del" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 12px; background: linear-gradient(transparent, rgba(3, 15, 38, 0.95)); display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffffff; font-weight: 700; font-size: 0.82rem;">🏛️ Ruang Belajar Bersama Gedung 7 (GD 712)</span>
                            <span style="color: #38bdf8; font-size: 0.72rem; font-weight: 800; background: rgba(56, 189, 248, 0.18); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4);">Kapasitas: 26 Kursi</span>
                        </div>
                    </div>
                `;
                photoContainer.style.display = 'block';
            } else {
                photoContainer.innerHTML = '';
                photoContainer.style.display = 'none';
            }
        }

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

        // Konfigurasi Khusus Broker Kampus IT Del (76.13.19.250)
        const brokerPorts = [9001, 8083, 1884]; // Port WebSocket yang umum untuk Mosquitto/MQTT broker di 76.13.19.250
        let currentPortIndex = 0;

        const attemptConnect = () => {
            if (currentPortIndex >= brokerPorts.length) {
                console.log("Menunggu koneksi WebSocket broker 76.13.19.250...");
                this.updateMqttBadge(false);
                return;
            }

            const port = brokerPorts[currentPortIndex];
            const brokerUrl = `ws://${this.mqttConfig.brokerIp}:${port}`;
            console.log(`Menghubungkan ke Broker Kampus IT Del: ${brokerUrl}...`);

            try {
                const client = mqtt.connect(brokerUrl, {
                    clientId: 'SpotFinderWeb_' + Math.random().toString(16).substr(2, 8),
                    connectTimeout: 4000,
                    reconnectPeriod: 5000
                });

                this.mqttConfig.client = client;

                client.on('connect', () => {
                    this.mqttConfig.isConnected = true;
                    this.mqttConfig.activeBroker = brokerUrl;
                    this.updateMqttBadge(true, "76.13.19.250");
                    console.log(`✅ Berhasil terhubung ke Broker 76.13.19.250 (Port ${port})`);
                    this.showToast(`🟢 Terhubung ke Broker Kampus IT Del (76.13.19.250)!`);
                    
                    // Subscribe to Gazebo Status topic & wildcards
                    client.subscribe(this.mqttConfig.topicGazebo);
                    client.subscribe("itdel/gazebo/status");
                    client.subscribe("itdel/gazebo/#");
                    client.subscribe("itdel/#");
                    client.subscribe("#"); // Global wildcard catch-all

                    // Broadcast status terkini dengan kapasitas 10 agar menimpa retained message lama di broker
                    setTimeout(() => {
                        this.broadcastGazeboStatus();
                    }, 800);
                });

                client.on('error', (err) => {
                    console.warn(`Gagal konek ke ${brokerUrl}:`, err);
                    if (!this.mqttConfig.isConnected) {
                        try { client.end(true); } catch(e){}
                        currentPortIndex++;
                        attemptConnect();
                    }
                });

                client.on('close', () => {
                    if (this.mqttConfig.isConnected) {
                        this.mqttConfig.isConnected = false;
                        this.updateMqttBadge(false);
                    }
                });

                client.on('message', (topic, message) => {
                    const msgStr = message.toString();
                    console.log(`📡 [76.13.19.250] MQTT Received [${topic}]:`, msgStr);
                    try {
                        let parsed = msgStr;
                        try { parsed = JSON.parse(msgStr); } catch(e) {}
                        this.handleIncomingMqttData(parsed, topic);
                    } catch (err) {
                        console.warn('Error parsing incoming MQTT message:', err);
                    }
                });

            } catch (e) {
                console.warn('MQTT connect exception:', e);
                currentPortIndex++;
                attemptConnect();
            }
        };

        attemptConnect();
    }

    connectCustomBroker() {
        const input = document.getElementById('input-mqtt-broker-url');
        const brokerInput = (input && input.value.trim()) ? input.value.trim() : "76.13.19.250";
        
        let finalBrokerUrl = brokerInput;
        if (!brokerInput.startsWith('ws://') && !brokerInput.startsWith('wss://')) {
            finalBrokerUrl = `ws://${brokerInput}:9001`;
        }

        if (this.mqttConfig.client) {
            try { this.mqttConfig.client.end(true); } catch(e){}
        }

        this.showToast(`🔄 Menghubungkan ke broker: 76.13.19.250...`);
        const statusBadge = document.getElementById('modal-mqtt-status-badge');
        if (statusBadge) statusBadge.textContent = 'Menghubungkan ke 76.13.19.250...';

        try {
            const client = mqtt.connect(finalBrokerUrl, {
                clientId: 'SpotFinderWeb_' + Math.random().toString(16).substr(2, 8),
                connectTimeout: 5000,
                reconnectPeriod: 5000
            });

            this.mqttConfig.client = client;

            client.on('connect', () => {
                this.mqttConfig.isConnected = true;
                this.mqttConfig.activeBroker = finalBrokerUrl;
                this.updateMqttBadge(true, "76.13.19.250");
                client.subscribe(this.mqttConfig.topicGazebo);
                client.subscribe("itdel/gazebo/status");
                client.subscribe("itdel/#");
                client.subscribe("#");
                this.showToast(`✅ Berhasil terhubung ke Broker 76.13.19.250!`);
            });

            client.on('error', (err) => {
                this.showToast(`⚠️ Menunggu respon broker 76.13.19.250`);
                this.updateMqttBadge(false);
            });

            client.on('message', (topic, message) => {
                try {
                    let parsed = message.toString();
                    try { parsed = JSON.parse(parsed); } catch(e){}
                    this.handleIncomingMqttData(parsed, topic);
                } catch(e){}
            });
        } catch(e) {
            this.showToast(`❌ Error: ${e.message}`);
        }
    }

    handleIncomingMqttData(data, topic = '') {
        // Filter: Hanya proses topik Gazebo IT Del / SpotFinder atau data bertopik relevan
        if (topic && !topic.startsWith('itdel') && !topic.includes('gazebo') && topic !== '') {
            return; // Abaikan topik lain dari broker publik kampus (seperti pltgu, crypto, dll)
        }

        let parsedData = data;
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch(e) {
                const num = parseInt(data.trim());
                if (!isNaN(num)) {
                    parsedData = { empty: num };
                } else {
                    parsedData = { raw: data };
                }
            }
        }

        const gazebo = this.spots.find(s => s.id === 'spot-gazebo-danau');
        if (gazebo) {
            gazebo.totalCapacity = 10; // Kunci tetap 10 kapasitas maksimum Gazebo
        }

        // Support both Bahasa and English key formats (kosong / empty, terisi / occupied)
        let emptySeats = undefined;
        let occupiedSeats = undefined;

        if (parsedData.occupied !== undefined) occupiedSeats = parseInt(parsedData.occupied);
        else if (parsedData.terisi !== undefined) occupiedSeats = parseInt(parsedData.terisi);

        if (parsedData.empty !== undefined) emptySeats = parseInt(parsedData.empty);
        else if (parsedData.kosong !== undefined) emptySeats = parseInt(parsedData.kosong);
        else if (occupiedSeats !== undefined) emptySeats = 10 - occupiedSeats;
        else if (typeof parsedData === 'number') emptySeats = parsedData;

        // Normalisasi agar kapasitas Gazebo tidak melebihi 10 dan tidak negatif
        if (emptySeats !== undefined && !isNaN(emptySeats)) {
            if (occupiedSeats !== undefined && !isNaN(occupiedSeats)) {
                emptySeats = Math.max(0, Math.min(10, 10 - occupiedSeats));
            } else {
                emptySeats = Math.max(0, Math.min(10, emptySeats));
            }
        }

        // Cek perubahan data agar tidak echo berulang dari broadcast lokal
        const peopleCount = (occupiedSeats !== undefined) ? Math.min(10, occupiedSeats) : (gazebo ? Math.max(0, 10 - (emptySeats !== undefined ? emptySeats : gazebo.availableSeats)) : 4);
        const currentDataKey = `${emptySeats}_${peopleCount}_${parsedData.lastAction || parsedData.action || ''}_${parsedData.timestamp || ''}`;
        
        if (this._lastDataKey === currentDataKey) {
            return; // Data sama persis, abaikan
        }
        this._lastDataKey = currentDataKey;

        console.log("📡 [SPOTFINDER MQTT RECEIVED - NEW EVENT]", parsedData, "Topik:", topic);

        let remainingKosong = "--";

        if (gazebo) {
            gazebo.totalCapacity = 10;
            if (emptySeats !== undefined && !isNaN(emptySeats)) {
                gazebo.availableSeats = Math.max(0, Math.min(10, emptySeats));
                
                // Synchronize individual seats in seat map (10 kursi)
                if (gazebo.seats && gazebo.seats.length > 0) {
                    let seatsToOccupy = 10 - gazebo.availableSeats;
                    gazebo.seats.forEach((st, idx) => {
                        if (idx < seatsToOccupy) {
                            st.status = 'occupied';
                            if (!st.user) st.user = 'Mahasiswa (ESP Counter)';
                        } else {
                            st.status = 'available';
                            delete st.user;
                        }
                    });
                }
            }

            remainingKosong = gazebo.availableSeats;

            // Update summary stat header
            const statGazeboEl = document.getElementById('stat-gazebo-empty');
            if (statGazeboEl) statGazeboEl.textContent = `${gazebo.availableSeats} Kursi Kosong`;

            // Re-render UI & Summary Stats
            this.renderSummaryStats();
            this.renderSpots();
            this.updateVirtualLcd({
                ruangan: parsedData.room || parsedData.ruangan || "Gazebo View Danau Toba",
                kosong: gazebo.availableSeats,
                total: 10,
                persen: Math.round(((10 - gazebo.availableSeats) / 10) * 100)
            });
        }

        const nowTime = new Date().toLocaleTimeString('id-ID');
        const payloadEl = document.getElementById('mqtt-live-payload');
        const rawAction = parsedData.lastAction || parsedData.action || (parsedData.source ? parsedData.source : (topic ? "Topik: " + topic : "Update Counter ESP"));
        const deviceName = parsedData.device || "ESP8266-Counter";

        // Deteksi secara presisi apakah data BERTAMBAH (+1) atau BERKURANG (-1)
        const currentOccupiedNum = (typeof peopleCount === 'number') ? peopleCount : parseInt(peopleCount) || 0;
        const previousOccupiedNum = this._previousOccupiedNum;
        this._previousOccupiedNum = currentOccupiedNum;

        let changeType = 'sync';
        let bubbleTitle = '📡 DATA DI-UPDATE';
        let bubbleSub = `Terisi: ${peopleCount} Orang • Sisa: ${remainingKosong} Kursi`;
        let eventColor = '#38bdf8';
        const actionLower = String(rawAction).toLowerCase();

        if (actionLower.includes('masuk') || actionLower.includes('+1') || actionLower.includes('in') || actionLower.includes('enter') || (previousOccupiedNum !== undefined && currentOccupiedNum > previousOccupiedNum)) {
            changeType = 'bertambah';
            bubbleTitle = '🟢 UPDATE DATA: ORANG MASUK (+1)';
            bubbleSub = `Terisi BERTAMBAH jadi ${peopleCount} Orang • Sisa: ${remainingKosong} Kursi`;
            eventColor = '#10b981';
        } else if (actionLower.includes('keluar') || actionLower.includes('-1') || actionLower.includes('out') || actionLower.includes('exit') || (previousOccupiedNum !== undefined && currentOccupiedNum < previousOccupiedNum)) {
            changeType = 'berkurang';
            bubbleTitle = '🔴 UPDATE DATA: ORANG KELUAR (-1)';
            bubbleSub = `Terisi BERKURANG jadi ${peopleCount} Orang • Sisa: ${remainingKosong} Kursi`;
            eventColor = '#ef4444';
        } else if (actionLower.includes('full') || actionLower.includes('penuh') || currentOccupiedNum >= 10) {
            changeType = 'full';
            bubbleTitle = '⚠️ UPDATE DATA: GAZEBO PENUH (10/10)';
            bubbleSub = 'Kapasitas maksimal 10 orang telah tercapai!';
            eventColor = '#f59e0b';
        } else if (actionLower.includes('empty') || actionLower.includes('kosong') || currentOccupiedNum <= 0) {
            changeType = 'empty';
            bubbleTitle = 'ℹ️ UPDATE DATA: GAZEBO KOSONG (0/10)';
            bubbleSub = 'Semua 10 kursi kini tersedia kosong';
            eventColor = '#06b6d4';
        }

        // 💬 1. Tampilkan BUBBLE TEXT FLOATING langsung melayang di atas Kartu Gazebo
        this.showCardFloatingBubble('spot-gazebo-danau', changeType, bubbleTitle, bubbleSub);

        // 💬 2. Tampilkan Box Tulisan Pemberitahuan Visual di Layar (Tanpa Suara)
        this.showMqttFloatingPopup({
            nowTime: nowTime + " WIB",
            deviceName: deviceName,
            eventType: changeType,
            eventTitle: bubbleTitle,
            eventBadge: changeType.toUpperCase(),
            eventColor: eventColor,
            actionLabel: rawAction,
            peopleCount: peopleCount,
            remainingKosong: remainingKosong,
            totalCapacity: (gazebo ? gazebo.totalCapacity : 10),
            parsedData: parsedData
        });

        // ✨ 3. Tambahkan Animasi Flash Visual pada Kartu Gazebo
        const gazeboCard = document.querySelector(`[data-spot-id="spot-gazebo-danau"]`) || document.querySelector('.spot-card');
        if (gazeboCard) {
            gazeboCard.classList.remove('spot-card-mqtt-flash');
            void gazeboCard.offsetWidth; // Trigger reflow
            gazeboCard.classList.add('spot-card-mqtt-flash');
        }
        
        // 📢 4. Tampilkan Toast Banner Tulisan Pemberitahuan (Murni Visual)
        this.showToast(`📢 [PEMBERITAHUAN] ${bubbleTitle} • ${bubbleSub}`);
    }

    showCardFloatingBubble(spotId, changeType, title, subtitle) {
        const card = document.querySelector(`[data-spot-id="${spotId}"]`);
        if (!card) return;

        // Hapus bubble sebelumnya jika ada
        const existingBubble = card.querySelector('.card-floating-bubble');
        if (existingBubble) existingBubble.remove();

        // Buat elemen bubble melayang baru dengan panah indikator
        const bubble = document.createElement('div');
        bubble.className = `card-floating-bubble ${changeType}`;
        const icon = changeType === 'bertambah' ? '🟢' : changeType === 'berkurang' ? '🔴' : changeType === 'full' ? '⚠️' : 'ℹ️';
        const badgeText = changeType === 'bertambah' ? '+1 MASUK' : changeType === 'berkurang' ? '-1 KELUAR' : changeType === 'full' ? 'PENUH' : 'UPDATE';
        const badgeBg = changeType === 'bertambah' ? '#10b981' : changeType === 'berkurang' ? '#ef4444' : changeType === 'full' ? '#f59e0b' : '#0284c7';

        bubble.innerHTML = `
            <div style="font-size: 1.3rem; line-height: 1; flex-shrink: 0; filter: drop-shadow(0 0 6px rgba(255,255,255,0.4));">${icon}</div>
            <div style="display: flex; flex-direction: column; gap: 2px; text-align: left;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 0.88rem; font-weight: 900; letter-spacing: -0.2px; color: #ffffff;">${title}</span>
                    <span style="background: ${badgeBg}; color: #ffffff; font-size: 0.68rem; font-weight: 900; padding: 1px 6px; border-radius: 4px; letter-spacing: 0.4px;">${badgeText}</span>
                </div>
                <div style="font-size: 0.76rem; font-weight: 700; color: rgba(255,255,255,0.94);">${subtitle}</div>
            </div>
        `;

        card.appendChild(bubble);

        // Hapus otomatis setelah animasi selesai (6 detik)
        setTimeout(() => {
            if (bubble.parentElement) bubble.remove();
        }, 6000);
    }

    showMqttFloatingPopup(info) {
        let popup = document.getElementById('mqtt-incoming-popup');
        if (!popup) return;

        const popTime = document.getElementById('mqtt-pop-time');
        const popAction = document.getElementById('mqtt-pop-action');
        const popStats = document.getElementById('mqtt-pop-stats');
        const popRaw = document.getElementById('mqtt-pop-raw');
        const progressBar = document.getElementById('mqtt-pop-progress-bar');

        if (popTime) popTime.textContent = info.nowTime;
        
        if (popAction) {
            popAction.innerHTML = `<span style="color:${info.eventColor || '#38bdf8'}; font-weight:800; font-size:0.98rem;">${info.eventTitle}</span> <span style="font-size:0.75rem; background:rgba(255,255,255,0.12); padding:2px 6px; border-radius:4px; margin-left:6px; color:#ffffff;">${info.deviceName}</span>`;
        }
        
        if (popStats) {
            popStats.innerHTML = `
                <div style="margin-top: 3px; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 6px; border-left: 3px solid ${info.eventColor || '#38bdf8'};">
                    <div>👥 Terisi: <strong style="color:#f59e0b; font-size:1.02rem;">${info.peopleCount} Orang</strong></div>
                    <div>🪑 Sisa: <strong style="color:#10b981; font-size:1.02rem;">${info.remainingKosong} Kursi</strong> <span style="color:rgba(255,255,255,0.6); font-size:0.8rem;">/ ${info.totalCapacity || 10}</span></div>
                </div>
            `;
        }
        
        if (popRaw) {
            popRaw.textContent = typeof info.parsedData === 'object' ? JSON.stringify(info.parsedData) : String(info.parsedData);
        }

        // Terapkan border highlight sesuai event
        popup.style.borderColor = info.eventColor || '#38bdf8';
        popup.style.boxShadow = `0 16px 40px rgba(0, 0, 0, 0.75), 0 0 25px ${info.eventColor ? info.eventColor + '55' : 'rgba(56, 189, 248, 0.55)'}`;

        // Pastikan popup tampil di paling atas layar
        popup.style.display = 'flex';
        popup.style.visibility = 'visible';
        popup.style.opacity = '1';
        popup.style.zIndex = '9999999';
        popup.classList.remove('hiding');
        popup.classList.add('show');

        // Reset & jalankan animasi progress bar
        if (progressBar) {
            progressBar.style.animation = 'none';
            progressBar.style.background = info.eventColor ? `linear-gradient(90deg, ${info.eventColor}, #38bdf8)` : 'linear-gradient(90deg, #10b981, #38bdf8)';
            void progressBar.offsetWidth;
            progressBar.style.animation = 'progressCountdown 5s linear forwards';
        }

        if (this.mqttPopupTimeout) clearTimeout(this.mqttPopupTimeout);
        this.mqttPopupTimeout = setTimeout(() => {
            this.dismissMqttPopup();
        }, 5000);
    }

    dismissMqttPopup() {
        const popup = document.getElementById('mqtt-incoming-popup');
        if (!popup) return;

        popup.classList.add('hiding');
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(-20px) scale(0.92)';

        setTimeout(() => {
            popup.classList.remove('show');
            popup.classList.remove('hiding');
            popup.style.display = 'none';
        }, 380);
    }

    playMqttChime() {
        // Notifikasi murni berupa tulisan/visual (tanpa suara)
        return;
    }

    // Manual / Testing Counter Action from Web
    simulateEspCounter(action) {
        const gazebo = this.spots.find(s => s.id === 'spot-gazebo-danau');
        if (!gazebo) return;

        let occupied = gazebo.totalCapacity - gazebo.availableSeats;

        if (action === 'masuk') {
            if (occupied < gazebo.totalCapacity) {
                occupied++;
                gazebo.availableSeats--;
            } else {
                this.showToast('⚠️ Gazebo sudah penuh (10/10 orang)!');
                return;
            }
        } else if (action === 'keluar') {
            if (occupied > 0) {
                occupied--;
                gazebo.availableSeats++;
            } else {
                this.showToast('⚠️ Gazebo sudah kosong (0 orang)!');
                return;
            }
        }

        const payloadObj = {
            id: "gazebo-1",
            room: "Gazebo View Danau Toba",
            empty: gazebo.availableSeats,
            occupied: occupied,
            total: gazebo.totalCapacity,
            percent: Math.round((occupied / gazebo.totalCapacity) * 100),
            lastAction: action === 'masuk' ? "Tombol Masuk (+1)" : "Tombol Keluar (-1)",
            device: "Simulasi-ESP8266-Web",
            timestamp: Math.floor(Date.now() / 1000)
        };

        this.handleIncomingMqttData(payloadObj);

        // Publish to MQTT Broker if connected
        if (this.mqttConfig.client && this.mqttConfig.client.connected) {
            this.mqttConfig.client.publish(this.mqttConfig.topicGazebo, JSON.stringify(payloadObj), { qos: 0, retain: true });
        }
    }

    updateMqttBadge(connected, brokerUrl = '') {
        const dot = document.getElementById('mqtt-dot');
        const text = document.getElementById('mqtt-status-text');
        const modalDot = document.getElementById('modal-mqtt-dot');
        const modalBadge = document.getElementById('modal-mqtt-status-badge');

        let label = '76.13.19.250';
        if (typeof brokerUrl === 'string' && brokerUrl.trim()) {
            if (brokerUrl.includes('//')) {
                const parts = brokerUrl.split('//');
                if (parts.length > 1 && parts[1]) {
                    label = parts[1].split('/')[0];
                }
            } else {
                label = brokerUrl.trim();
            }
        }

        if (dot && text) {
            if (connected) {
                dot.style.background = '#10b981';
                text.textContent = `MQTT: ${label}`;
            } else {
                dot.style.background = '#f59e0b';
                text.textContent = 'MQTT: 76.13.19.250';
            }
        }

        if (modalDot && modalBadge) {
            if (connected) {
                modalDot.style.background = '#10b981';
                modalBadge.style.color = '#10b981';
                modalBadge.style.background = 'rgba(16, 185, 129, 0.15)';
                modalBadge.textContent = `🟢 Terhubung ke ${label}`;
            } else {
                modalDot.style.background = '#ef4444';
                modalBadge.style.color = '#ef4444';
                modalBadge.style.background = 'rgba(239, 68, 68, 0.15)';
                modalBadge.textContent = `🔴 Menunggu Respon 76.13.19.250`;
            }
        }
    }

    broadcastGazeboStatus() {
        const gazebo = this.spots.find(s => s.id === 'spot-gazebo-danau') || {
            name: "Gazebo View Danau Toba",
            availableSeats: 6,
            totalCapacity: 10
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
            kosong: 6,
            total: 10,
            persen: 40
        };

        const kosong = gazebo.kosong !== undefined ? gazebo.kosong : gazebo.availableSeats;
        const total = gazebo.total !== undefined ? gazebo.total : gazebo.totalCapacity;
        const persen = gazebo.persen !== undefined ? gazebo.persen : Math.round(((total - kosong) / total) * 100);
        const name = (gazebo.ruangan || gazebo.name || "GAZEBO TOBA").toUpperCase();

        const titleEl = document.getElementById('virtual-oled-title');
        const statusEl = document.getElementById('virtual-oled-status');
        const percentEl = document.getElementById('virtual-oled-percent');

        if (titleEl) titleEl.textContent = name;
        if (statusEl) statusEl.textContent = `${kosong} / ${total} KOSONG`;
        if (percentEl) percentEl.textContent = `Keterisian: ${persen}%`;
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
    // Portal Barang Tertinggal (Lost & Found)
    // ==========================================
    openLostFoundModal(filterSpotId = null, tab = 'list') {
        this.currentLfSpotFilter = filterSpotId;
        this.lfSearchQuery = '';
        const searchInput = document.getElementById('lf-modal-search');
        if (searchInput) searchInput.value = '';

        if (filterSpotId) {
            const spotSelect = document.getElementById('lf-input-spot');
            if (spotSelect) spotSelect.value = filterSpotId;
        }

        this.renderLostFoundItems(filterSpotId);
        this.switchLostFoundTab(tab);
        const modal = document.getElementById('lost-found-modal');
        if (modal) modal.classList.add('active');
    }

    closeLostFoundModal() {
        const modal = document.getElementById('lost-found-modal');
        if (modal) modal.classList.remove('active');
    }

    switchLostFoundTab(tab) {
        const listView = document.getElementById('lf-tab-list-view');
        const formView = document.getElementById('lf-tab-form-view');
        const listBtn = document.getElementById('lf-tab-btn-list');
        const formBtn = document.getElementById('lf-tab-btn-form');

        if (tab === 'list') {
            if (listView) listView.style.display = 'block';
            if (formView) formView.style.display = 'none';
            if (listBtn) { listBtn.className = 'btn-primary'; }
            if (formBtn) { formBtn.className = 'btn-secondary'; }
            this.renderLostFoundItems(this.currentLfSpotFilter);
        } else {
            if (listView) listView.style.display = 'none';
            if (formView) formView.style.display = 'block';
            if (listBtn) { listBtn.className = 'btn-secondary'; }
            if (formBtn) { formBtn.className = 'btn-primary'; }
        }
    }

    searchLostFound(query) {
        this.lfSearchQuery = (query || '').toLowerCase().trim();
        this.renderLostFoundItems(this.currentLfSpotFilter);
    }

    filterLostFound(category, btnEl) {
        this.selectedLfFilter = category;
        document.querySelectorAll('.lf-filter-pill').forEach(b => b.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');
        this.renderLostFoundItems(this.currentLfSpotFilter);
    }

    renderLostFoundItems(filterSpotId = null) {
        const grid = document.getElementById('lf-items-grid');
        const countEl = document.getElementById('lf-tab-count');
        if (!grid) return;

        let items = this.lostFoundItems;
        if (filterSpotId) {
            items = items.filter(i => i.spotId === filterSpotId);
        }

        if (this.selectedLfFilter && this.selectedLfFilter !== 'all') {
            items = items.filter(i => i.category === this.selectedLfFilter);
        }

        if (this.lfSearchQuery) {
            items = items.filter(i => 
                (i.item && i.item.toLowerCase().includes(this.lfSearchQuery)) ||
                (i.spotName && i.spotName.toLowerCase().includes(this.lfSearchQuery)) ||
                (i.locationDetail && i.locationDetail.toLowerCase().includes(this.lfSearchQuery)) ||
                (i.keptAt && i.keptAt.toLowerCase().includes(this.lfSearchQuery)) ||
                (i.finder && i.finder.toLowerCase().includes(this.lfSearchQuery))
            );
        }

        const unclaimedTotal = this.lostFoundItems.filter(i => i.status === 'unclaimed').length;
        if (countEl) countEl.textContent = unclaimedTotal;

        if (items.length === 0) {
            grid.innerHTML = `
                <div style="text-align:center; padding:36px 16px; color:var(--text-muted); background:var(--bg-surface); border-radius:12px; border:1px dashed var(--border);">
                    <div style="font-size:2.5rem; margin-bottom:8px;">🔍</div>
                    <h4 style="color:var(--text-main); margin-bottom:4px;">Tidak ada barang tertinggal yang cocok</h4>
                    <p style="font-size:0.85rem;">Coba ubah kata kunci pencarian atau kategori filter.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="lf-item-card">
                <div class="lf-card-header">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size: 1.7rem; background:var(--border-subtle); width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; border:1px solid var(--border);">
                            ${item.icon || '📦'}
                        </span>
                        <div>
                            <h4 class="lf-item-title">${item.item}</h4>
                            <span style="font-size: 0.78rem; color: var(--del-cyan); font-weight:700;">${item.categoryLabel || item.category}</span>
                        </div>
                    </div>
                    <span class="lf-badge ${item.status}">
                        ${item.status === 'unclaimed' ? '🟡 Belum Diambil' : '🟢 Sudah Diklaim'}
                    </span>
                </div>

                <div class="lf-info-row">
                    <div>📍 <strong>Lokasi Ditemukan:</strong> ${item.spotName} (${item.locationDetail})</div>
                    <div>🕒 <strong>Waktu Lapor:</strong> ${item.timeFound} • Oleh: <em>${item.finder}</em></div>
                    <div>🏢 <strong>Dititipkan di:</strong> <span style="color:#f59e0b; font-weight:800;">${item.keptAt}</span></div>
                    ${item.contactNote ? `<div style="font-size:0.82rem; color:var(--del-cyan); margin-top:2px;">ℹ️ ${item.contactNote}</div>` : ''}
                </div>

                <div class="lf-card-footer">
                    ${item.status === 'unclaimed' ? `
                        <button class="btn-primary" onclick="app.claimLostFoundItem('${item.id}')" style="font-size:0.82rem; padding:6px 14px;">
                            ✅ Konfirmasi Sudah Diambil / Diklaim
                        </button>
                    ` : `
                        <span style="font-size:0.82rem; color:var(--emerald); font-weight:700; display:flex; align-items:center; gap:4px;">
                            ✨ Barang ini telah berhasil dikembalikan ke pemiliknya
                        </span>
                    `}
                    <button class="btn-secondary" onclick="app.showToast('ℹ️ Silakan langsung temui petugas/satpam di: ' + '${item.keptAt}')" style="font-size:0.82rem; padding:6px 12px;">
                        🏢 Info Lokasi Penitipan
                    </button>
                </div>
            </div>
        `).join('');
    }

    handleLostFoundSubmit(event) {
        event.preventDefault();
        const nameInput = document.getElementById('lf-input-item');
        const catInput = document.getElementById('lf-input-category');
        const spotInput = document.getElementById('lf-input-spot');
        const locInput = document.getElementById('lf-input-location');
        const keptInput = document.getElementById('lf-input-kept');
        const finderInput = document.getElementById('lf-input-finder');
        const verifInput = document.getElementById('lf-input-verification');

        if (!nameInput || !nameInput.value.trim()) return;

        const selectedSpot = this.spots.find(s => s.id === spotInput.value) || { name: spotInput.options[spotInput.selectedIndex].text };

        const iconMap = {
            laptop: "💻",
            smartphone: "📱",
            elektronik: "🔌",
            ktm: "🪪",
            tumbler: "🥤",
            tas: "🎒",
            pakaian: "🧥",
            buku: "📖",
            lainnya: "📦"
        };

        const newItem = {
            id: 'lf-' + Date.now(),
            item: nameInput.value.trim(),
            category: catInput.value,
            categoryLabel: catInput.options[catInput.selectedIndex].text,
            spotId: spotInput.value,
            spotName: selectedSpot.name,
            locationDetail: locInput.value.trim(),
            timeFound: "Baru saja (" + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB)",
            status: "unclaimed",
            keptAt: keptInput.value.trim(),
            finder: finderInput.value.trim(),
            icon: iconMap[catInput.value] || "📦",
            contactNote: verifInput && verifInput.value.trim() ? verifInput.value.trim() : "Ditemukan oleh civitas Del. Silakan hubungi tempat penitipan dengan menunjukkan identitas."
        };

        this.lostFoundItems.unshift(newItem);
        localStorage.setItem('itdel_lost_found', JSON.stringify(this.lostFoundItems));

        this.updateLostFoundBadges();
        this.renderSpots();
        this.switchLostFoundTab('list');

        this.showToast(`📢 Laporan temuan "${newItem.item}" berhasil dipublikasikan!`);
        document.getElementById('lf-report-form').reset();
    }

    claimLostFoundItem(itemId) {
        const item = this.lostFoundItems.find(i => i.id === itemId);
        if (!item) return;

        item.status = 'claimed';
        localStorage.setItem('itdel_lost_found', JSON.stringify(this.lostFoundItems));

        this.updateLostFoundBadges();
        this.renderLostFoundItems(this.currentLfSpotFilter);
        this.renderSpots();
        this.showToast(`🎉 Status barang "${item.item}" berhasil diubah menjadi Sudah Diklaim!`);
    }

    updateLostFoundBadges() {
        const unclaimedCount = this.lostFoundItems.filter(i => i.status === 'unclaimed').length;
        const badgeEl = document.getElementById('lost-found-count-badge');
        const tabCountEl = document.getElementById('lf-tab-count');
        const heroCountEl = document.getElementById('lf-hero-count');

        if (badgeEl) badgeEl.textContent = unclaimedCount;
        if (tabCountEl) tabCountEl.textContent = unclaimedCount;
        if (heroCountEl) heroCountEl.textContent = unclaimedCount;
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

        // Tombol Barang Tertinggal (Lost & Found)
        const btnLostFound = document.getElementById('btn-open-lost-found');
        if (btnLostFound) {
            btnLostFound.addEventListener('click', () => this.openLostFoundModal());
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

        // Unlock Web Audio Context on first user interaction anywhere
        const unlockAudio = () => {
            if (!this.audioCtx) {
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (AudioContext) this.audioCtx = new AudioContext();
                } catch(e) {}
            }
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new SpotFinderApp();
});
