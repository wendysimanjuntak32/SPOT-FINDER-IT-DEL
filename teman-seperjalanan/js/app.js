/**
 * TemanSeperjalanan IT Del - Controller dengan Geolocation & Live Walk Requests ke Asrama
 */

class TemanSeperjalananApp {
    constructor() {
        this.rides = JSON.parse(JSON.stringify(INITIAL_RIDES));
        this.selectedFilter = 'asrama';
        this.searchQuery = '';
        this.currentRideToJoin = null;

        // User GPS Location State
        this.userLocation = {
            name: "Perpustakaan IT Del (Lantai 2)",
            zone: "Zona Akademik Tengah",
            coords: { lat: 2.3833, lng: 99.1486 },
            detected: false
        };

        // Live Real-time Broadcasts for Walking to Dorm
        this.liveWalkRequests = [
            {
                id: "req-1",
                studentName: "Bona Sitompul",
                prodi: "S1 IF '22",
                avatar: "🚶‍♂️",
                currentLocation: "Lobi Perpustakaan IT Del",
                targetDorm: "Asrama Silo & Kapernaum",
                timeRemainingSeconds: 280, // ~4.5 mins
                joinedCount: 3,
                maxPeople: 6
            },
            {
                id: "req-2",
                studentName: "Grace Nainggolan",
                prodi: "S1 SI '23",
                avatar: "🚶‍♀️",
                currentLocation: "Gedung 9 (Lab Komputer)",
                targetDorm: "Asrama Anthiokia (Khusus Mahasiswi)",
                timeRemainingSeconds: 420, // 7 mins
                joinedCount: 2,
                maxPeople: 5
            }
        ];

        this.init();
    }

    init() {
        this.renderLiveRequests();
        this.renderRides();
        this.setupEventListeners();
        this.setupSplitCalculator();
        this.initGame();
        this.startCountdownTimer();
    }

    // ==========================================
    // Geolocation Detection
    // ==========================================
    detectUserGPS() {
        const statusEl = document.getElementById('user-gps-status');
        const detailEl = document.getElementById('user-gps-detail');

        if (statusEl) statusEl.innerHTML = '🔄 Mengakses GPS Kampus...';

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    this.userLocation.detected = true;
                    this.userLocation.coords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };

                    // Lokasi kampus IT Del
                    this.userLocation.name = "Perpustakaan IT Del (Area GD 5)";
                    this.userLocation.zone = "Kampus Institut Teknologi Del (Sitoluama)";

                    if (statusEl) statusEl.innerHTML = '📍 Lokasi: <strong>Perpustakaan IT Del (Lt. 2)</strong>';
                    if (detailEl) detailEl.innerHTML = '✅ GPS Aktif • Terhubung ke Wi-Fi <strong>Del-Student</strong>';

                    this.playPingSound();
                    this.showToast('📍 Lokasi berhasil dideteksi di Kampus IT Del!');
                },
                (err) => {
                    // Fallback to campus Wi-Fi network location
                    this.userLocation.detected = true;
                    this.userLocation.name = "Perpustakaan IT Del (Lantai 2)";
                    this.userLocation.zone = "Zona Tengah IT Del";

                    if (statusEl) statusEl.innerHTML = '📍 Lokasi: <strong>Perpustakaan IT Del (Lt. 2)</strong>';
                    if (detailEl) detailEl.innerHTML = '📶 Terdeteksi via Jaringan Kampus Del-Student';

                    this.showToast('📍 Terhubung via Jaringan Kampus IT Del (Laguboti)!');
                },
                { timeout: 5000 }
            );
        } else {
            if (statusEl) statusEl.innerHTML = '📍 Lokasi: <strong>Perpustakaan IT Del</strong>';
            if (detailEl) detailEl.innerHTML = '📶 Jaringan Kampus IT Del';
        }
    }

    // ==========================================
    // Render Live Walking Requests (Permintaan Jalan)
    // ==========================================
    renderLiveRequests() {
        const container = document.getElementById('live-requests-list');
        if (!container) return;

        container.innerHTML = '';

        if (this.liveWalkRequests.length === 0) {
            container.innerHTML = `
                <div style="background: var(--border-subtle); padding: 16px; border-radius: var(--radius-md); text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                    Belum ada permintaan jalan bareng aktif. Klik <strong>'📢 Buat Panggilan Jalan'</strong> untuk mengajak teman sekarang!
                </div>
            `;
            return;
        }

        this.liveWalkRequests.forEach(req => {
            const mins = Math.floor(req.timeRemainingSeconds / 60);
            const secs = req.timeRemainingSeconds % 60;
            const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

            const item = document.createElement('div');
            item.className = 'live-request-pill';

            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="font-size: 2rem;">${req.avatar}</div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <strong style="font-size: 1.05rem;">${req.studentName}</strong>
                            <span style="font-size: 0.75rem; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 9999px;">${req.prodi}</span>
                            <span class="countdown-badge">⏰ Berangkat dalam ${timeFormatted}</span>
                        </div>
                        <div style="font-size: 0.88rem; opacity: 0.95; margin-top: 4px;">
                            📍 Dari: <strong>${req.currentLocation}</strong> ➔ Tujuan: <strong>${req.targetDorm}</strong>
                        </div>
                        <div style="font-size: 0.78rem; opacity: 0.85; margin-top: 2px;">
                            👥 ${req.joinedCount} dari ${req.maxPeople} mahasiswa sudah bergabung
                        </div>
                    </div>
                </div>

                <button class="btn-primary" onclick="app.joinLiveWalkRequest('${req.id}')" style="background: #ffffff; color: #065f46; font-weight: 800; white-space: nowrap; padding: 10px 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                    👋 Aku Ikut Jalan!
                </button>
            `;

            container.appendChild(item);
        });
    }

    startCountdownTimer() {
        setInterval(() => {
            let changed = false;
            for (let i = this.liveWalkRequests.length - 1; i >= 0; i--) {
                const req = this.liveWalkRequests[i];
                if (req.timeRemainingSeconds > 0) {
                    req.timeRemainingSeconds--;
                    changed = true;
                } else {
                    this.liveWalkRequests.splice(i, 1);
                    changed = true;
                }
            }
            if (changed) {
                this.renderLiveRequests();
            }
        }, 1000);
    }

    joinLiveWalkRequest(reqId) {
        const req = this.liveWalkRequests.find(r => r.id === reqId);
        if (!req) return;

        if (req.joinedCount < req.maxPeople) {
            req.joinedCount++;
            this.playPingSound();
            this.renderLiveRequests();
            this.showToast(`🎉 Kamu bergabung dengan rombongan ${req.studentName} ke ${req.targetDorm}! Silakan menuju ke ${req.currentLocation}.`);
        }
    }

    // ==========================================
    // Send New Live Walk Broadcast
    // ==========================================
    openBroadcastModal() {
        const modal = document.getElementById('broadcast-modal');
        const locInput = document.getElementById('bcast-origin');
        if (locInput) locInput.value = this.userLocation.name;
        if (modal) modal.classList.add('active');
    }

    submitLiveBroadcast(e) {
        e.preventDefault();

        const origin = document.getElementById('bcast-origin').value;
        const targetDorm = document.getElementById('bcast-dorm').value;
        const waitMins = parseInt(document.getElementById('bcast-wait').value) || 5;
        const maxPeople = parseInt(document.getElementById('bcast-max').value) || 6;
        const note = document.getElementById('bcast-note').value;

        const newReq = {
            id: `req-${Date.now()}`,
            studentName: "Kamu (Mahasiswa Del)",
            prodi: "S1 Informatika",
            avatar: "🚶‍♂️",
            currentLocation: origin,
            targetDorm: targetDorm,
            timeRemainingSeconds: waitMins * 60,
            joinedCount: 1,
            maxPeople: maxPeople
        };

        this.liveWalkRequests.unshift(newReq);
        this.renderLiveRequests();
        this.closeAllModals();
        this.playPingSound();

        this.showToast(`📢 Panggilan jalan bareng ke ${targetDorm} berhasil disiarkan ke mahasiswa IT Del sekitar!`);
    }

    // Sound ping
    playPingSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.26);
        } catch (e) {
            // Audio context not allowed without gesture
        }
    }

    // ==========================================
    // Render Rides Feed
    // ==========================================
    renderRides() {
        const grid = document.getElementById('rides-container');
        if (!grid) return;

        grid.innerHTML = '';

        let filtered = this.rides.filter(ride => {
            const matchesSearch = ride.origin.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  ride.destination.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  ride.driver.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  ride.tags.some(t => t.toLowerCase().includes(this.searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            if (this.selectedFilter === 'all') return true;
            if (this.selectedFilter === 'asrama') return ride.isDormRoute || ride.destination.toLowerCase().includes('asrama');
            if (this.selectedFilter === 'walk') return ride.vehicleType === 'walk';
            if (this.selectedFilter === 'car') return ride.vehicleType === 'car';
            if (this.selectedFilter === 'motorcycle') return ride.vehicleType === 'motorcycle';
            if (this.selectedFilter === 'silangit') return ride.destination.toLowerCase().includes('silangit');
            if (this.selectedFilter === 'balige') return ride.destination.toLowerCase().includes('balige');

            return true;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 12px;">🏠</div>
                    <h3>Belum ada jadwal lain untuk rute ini</h3>
                    <p style="margin-top: 6px;">Kamu bisa membuat panggilan jalan pulang bareng dengan tombol di atas!</p>
                </div>
            `;
            return;
        }

        filtered.forEach(ride => {
            const card = document.createElement('div');
            card.className = `ride-card ${ride.isDormRoute ? 'dorm-card' : ''}`;

            let vehicleIcon = '🚗';
            if (ride.vehicleType === 'motorcycle') vehicleIcon = '🛵';
            else if (ride.vehicleType === 'walk') vehicleIcon = '🚶‍♂️';

            const costLabel = ride.costPerPerson === 0 ? 
                '<span style="color: var(--emerald); font-weight: 800; font-size: 1.15rem;">GRATIS (Teman Jalan) ✨</span>' : 
                `Rp ${ride.costPerPerson.toLocaleString('id-ID')}`;

            card.innerHTML = `
                <div class="ride-card-header">
                    <div class="driver-info">
                        <div class="driver-avatar">${ride.driver.avatar}</div>
                        <div>
                            <div class="driver-name">${ride.driver.name} <span class="verified-badge" title="Mahasiswa Terverifikasi Del">✓ IT Del</span></div>
                            <div class="driver-meta">${ride.driver.prodi} • ${ride.isDormRoute ? '🏠 Rute Asrama' : '⭐ ' + ride.driver.rating}</div>
                        </div>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 700; background: ${ride.isDormRoute ? 'var(--emerald-light)' : 'var(--primary-light)'}; color: ${ride.isDormRoute ? 'var(--emerald)' : 'var(--primary)'}; padding: 4px 10px; border-radius: 9999px;">
                        ${ride.date} • ${ride.time}
                    </span>
                </div>

                <div class="route-visualizer">
                    <div class="route-point">
                        <div class="route-dot origin"></div>
                        <span>${ride.origin}</span>
                    </div>
                    <div class="route-connector"></div>
                    <div class="route-point">
                        <div class="route-dot dest"></div>
                        <span style="color: ${ride.isDormRoute ? 'var(--emerald)' : 'inherit'};">${ride.destination}</span>
                    </div>
                </div>

                <div class="ride-specs">
                    <div>
                        <div style="font-weight: 700;">${vehicleIcon} ${ride.vehicleName}</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">
                            ${ride.vehicleType === 'walk' ? 'Kapasitas Rombongan: ' : 'Sisa Kursi: '} <strong style="color: var(--primary);">${ride.availableSeats}</strong> / ${ride.totalSeats}
                        </div>
                    </div>
                    <div class="fare-box">
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${ride.costPerPerson === 0 ? 'Biaya:' : 'Patungan:'}</div>
                        <div class="fare-amount">${costLabel}</div>
                    </div>
                </div>

                <div style="padding: 0 20px 14px; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                    "${ride.notes}"
                </div>

                <div class="card-actions">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">
                        👥 ${ride.passengers.length} Mahasiswa Ikut
                    </span>
                    <button class="btn-primary" onclick="app.openJoinModal('${ride.id}')" ${ride.availableSeats === 0 ? 'disabled style="opacity:0.6;"' : ''} style="${ride.isDormRoute ? 'background: var(--emerald);' : ''}">
                        ${ride.availableSeats > 0 ? (ride.vehicleType === 'walk' ? '🚶 Ikut Jalan Bareng' : '🤝 Gabung Tebengan') : 'Penuh'}
                    </button>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    // ==========================================
    // Join Ride Modal
    // ==========================================
    openJoinModal(rideId) {
        const ride = this.rides.find(r => r.id === rideId);
        if (!ride) return;

        this.currentRideToJoin = ride;

        const modal = document.getElementById('join-modal');
        const driverName = document.getElementById('join-driver-name');
        const routeText = document.getElementById('join-route-text');
        const fareText = document.getElementById('join-fare-text');
        const timeText = document.getElementById('join-time-text');

        if (driverName) driverName.textContent = ride.driver.name;
        if (routeText) routeText.textContent = `${ride.origin} ➔ ${ride.destination}`;
        if (fareText) fareText.textContent = ride.costPerPerson === 0 ? 'GRATIS (Teman Pulang Asrama)' : `Rp ${ride.costPerPerson.toLocaleString('id-ID')} / orang`;
        if (timeText) timeText.textContent = `${ride.date} pukul ${ride.time}`;

        if (modal) modal.classList.add('active');
    }

    confirmJoinRide() {
        if (!this.currentRideToJoin) return;
        const ride = this.currentRideToJoin;

        if (ride.availableSeats > 0) {
            ride.availableSeats--;
            ride.passengers.push("Kamu (Mahasiswa Del)");
            this.renderRides();
            this.closeAllModals();

            this.showToast(`🎉 Berhasil bergabung dengan rombongan ${ride.driver.name} pulang ke ${ride.destination}!`);
        }
    }

    // ==========================================
    // Post New Ride / Walk
    // ==========================================
    postNewRide(e) {
        e.preventDefault();

        const origin = document.getElementById('post-origin').value;
        const dest = document.getElementById('post-dest').value;
        const date = document.getElementById('post-date').value;
        const time = document.getElementById('post-time').value;
        const vType = document.getElementById('post-vtype').value;
        const vName = document.getElementById('post-vname').value;
        const seats = parseInt(document.getElementById('post-seats').value);
        const fare = parseInt(document.getElementById('post-fare').value) || 0;
        const notes = document.getElementById('post-notes').value;

        const isDorm = dest.toLowerCase().includes('asrama') || vType === 'walk';

        const newRide = {
            id: `ride-${Date.now()}`,
            driver: {
                name: "Kamu (Mahasiswa Del)",
                nim: "11S220xx",
                prodi: "S1 Informatika",
                rating: 5.0,
                tripsCount: 1,
                avatar: vType === 'walk' ? "🚶" : "🚗",
                phone: "+6281234567890",
                verifiedCampus: true
            },
            origin: origin,
            destination: dest,
            date: date,
            time: time,
            vehicleType: vType,
            vehicleName: vName,
            totalSeats: seats,
            availableSeats: seats,
            costPerPerson: fare,
            totalEstimatedCost: fare * (seats + 1),
            notes: notes || "Pulang bareng ke asrama biar ramai dan aman.",
            passengers: ["Kamu"],
            tags: ["Pulang Asrama", "Mahasiswa Del"],
            status: "available",
            isDormRoute: isDorm
        };

        this.rides.unshift(newRide);
        this.renderRides();
        this.switchTab('tab-rides');
        this.showToast('🚀 Ajakan pulang bareng ke asrama berhasil dipublikasikan!');
    }

    // ==========================================
    // Split Bill Calculator
    // ==========================================
    setupSplitCalculator() {
        const totalInput = document.getElementById('calc-total');
        const peopleInput = document.getElementById('calc-people');
        const splitVal = document.getElementById('calc-split-val');
        const carbonVal = document.getElementById('calc-carbon-val');
        const savingVal = document.getElementById('calc-saving-val');

        const calculate = () => {
            const total = parseFloat(totalInput.value) || 0;
            const people = parseInt(peopleInput.value) || 1;

            const split = Math.round(total / people);
            const savings = total - split;
            const carbonSaved = (people - 1) * 3.8;

            if (splitVal) splitVal.textContent = `Rp ${split.toLocaleString('id-ID')}`;
            if (carbonVal) carbonVal.textContent = `${carbonSaved.toFixed(1)} kg CO2`;
            if (savingVal) savingVal.textContent = `Hemat Rp ${savings.toLocaleString('id-ID')} / orang`;
        };

        if (totalInput && peopleInput) {
            totalInput.addEventListener('input', calculate);
            peopleInput.addEventListener('input', calculate);
            calculate();
        }
    }

    // ==========================================
    // Mini Game Tab
    // ==========================================
    initGame() {
        if (window.ecoGame) {
            window.ecoGame.initCanvas('eco-game-canvas');
        }

        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (window.ecoGame) {
                    window.ecoGame.startGame();
                    startBtn.textContent = '🔄 Mulai Ulang Game';
                }
            });
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
        const activePanel = document.getElementById(tabId);

        if (activeBtn) activeBtn.classList.add('active');
        if (activePanel) activePanel.classList.add('active');

        if (tabId !== 'tab-game' && window.ecoGame) {
            window.ecoGame.stopGame();
        }
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `<span>🏠</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // GPS Button
        const btnGPS = document.getElementById('btn-detect-gps');
        if (btnGPS) {
            btnGPS.addEventListener('click', () => this.detectUserGPS());
        }

        // Live Broadcast Modal Button
        const btnOpenBcast = document.getElementById('btn-open-broadcast-modal');
        if (btnOpenBcast) {
            btnOpenBcast.addEventListener('click', () => this.openBroadcastModal());
        }

        // Form Submit Broadcast
        const bcastForm = document.getElementById('form-live-broadcast');
        if (bcastForm) {
            bcastForm.addEventListener('submit', (e) => this.submitLiveBroadcast(e));
        }

        const searchInput = document.getElementById('ride-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderRides();
            });
        }

        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedFilter = btn.dataset.filter;
                this.renderRides();
            });
        });

        const postForm = document.getElementById('form-post-ride');
        if (postForm) {
            postForm.addEventListener('submit', (e) => this.postNewRide(e));
        }

        const confirmJoinBtn = document.getElementById('btn-confirm-join');
        if (confirmJoinBtn) {
            confirmJoinBtn.addEventListener('click', () => this.confirmJoinRide());
        }

        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TemanSeperjalananApp();
});
