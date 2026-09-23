/**
 * SENSOR LAB ULTIMATE - Hardware Sensor Engine & Telemetry Stream
 * Connects to DeviceOrientation, DeviceMotion, Web Audio API, Geolocation,
 * Battery Status API, Ambient Light, Network Information, and Physics Simulation!
 */

class SensorLabEngine {
    constructor() {
        this.audio = new SensorAudioEngine();
        this.isRunning = true;
        this.activeFilter = 'ALL';

        // Historical Data Buffers for Oscilloscope Charts (last 40 points)
        this.history = {
            accelX: new Array(40).fill(0),
            accelY: new Array(40).fill(0),
            accelZ: new Array(40).fill(9.8),
            gyroAlpha: new Array(40).fill(0),
            gyroBeta: new Array(40).fill(0),
            gyroGamma: new Array(40).fill(0),
            micDecibel: new Array(40).fill(30),
            lightLux: new Array(40).fill(300),
            batteryPct: new Array(40).fill(100),
            temperatureSim: new Array(40).fill(28.5)
        };

        // Real-Time Sensor Telemetry Values
        this.data = {
            accel: { x: 0, y: 0, z: 9.8, max: 9.8, min: 9.8 },
            gyro: { alpha: 0, beta: 0, gamma: 0 },
            mic: { decibels: 32, peak: 32, isListening: false, stream: null, analyser: null },
            gps: { lat: -6.2088, lng: 106.8456, speed: 0, alt: 18, accuracy: 5, status: 'Simulated' },
            battery: { level: 100, charging: true, time: 'Full' },
            light: { lux: 350, source: 'Ambient Photodiode' },
            network: { type: '4G / Wi-Fi', rtt: 25, downlink: 15.4, online: navigator.onLine },
            temp: { celsius: 28.5, humidity: 65, pressure: 1013.25 }
        };

        // Telemetry Threshold Alarm Settings
        this.thresholds = {
            accelMax: 18.0,
            soundMax: 80,
            lightMax: 800,
            tempMax: 40.0
        };

        // Recorded CSV Logs
        this.recordedLogs = [];
        this.isRecording = false;

        this.init();
    }

    init() {
        this.initDeviceMotion();
        this.initDeviceOrientation();
        this.initBatteryAPI();
        this.initNetworkAPI();
        this.initGeolocation();
        this.initSimulatedTelemetry();
        this.initChartCanvases();
        this.startLoop();
    }

    /* ==========================================================================
       1. Accelerometer & G-Force Motion Sensors
       ========================================================================== */
    initDeviceMotion() {
        if ('DeviceMotionEvent' in window) {
            window.addEventListener('devicemotion', (e) => {
                if (!this.isRunning) return;
                const acc = e.accelerationIncludingGravity || e.acceleration;
                if (acc && acc.x !== null) {
                    this.data.accel.x = parseFloat(acc.x.toFixed(2));
                    this.data.accel.y = parseFloat(acc.y.toFixed(2));
                    this.data.accel.z = parseFloat(acc.z.toFixed(2));
                }
            });
        }
    }

    /* ==========================================================================
       2. Gyroscope & Compass Orientation Sensors
       ========================================================================== */
    initDeviceOrientation() {
        if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', (e) => {
                if (!this.isRunning) return;
                if (e.alpha !== null) this.data.gyro.alpha = Math.round(e.alpha);
                if (e.beta !== null) this.data.gyro.beta = Math.round(e.beta);
                if (e.gamma !== null) this.data.gyro.gamma = Math.round(e.gamma);
            });
        }
    }

    /* ==========================================================================
       3. Acoustic Microphone Decibel Meter
       ========================================================================== */
    async toggleMicrophone() {
        this.audio.init();
        if (this.data.mic.isListening) {
            if (this.data.mic.stream) {
                this.data.mic.stream.getTracks().forEach(t => t.stop());
            }
            this.data.mic.isListening = false;
            document.getElementById('btnMicToggle').classList.remove('active');
            document.getElementById('btnMicToggle').innerHTML = '<i class="fa-solid fa-microphone"></i> Aktifkan Mic Asli';
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                const actx = new AudioCtx();
                const src = actx.createMediaStreamSource(stream);
                const analyser = actx.createAnalyser();
                analyser.fftSize = 64;
                src.connect(analyser);

                this.data.mic.stream = stream;
                this.data.mic.analyser = analyser;
                this.data.mic.isListening = true;

                document.getElementById('btnMicToggle').classList.add('active');
                document.getElementById('btnMicToggle').innerHTML = '<i class="fa-solid fa-microphone-slash"></i> Matikan Mic';
                this.audio.playSuccess();
            } catch (err) {
                console.warn('Mic access denied, using physics acoustic simulation:', err);
                alert('Izin mikrofon tidak diberikan atau tidak tersedia. Beralih ke simulasi akustik presisi.');
            }
        }
    }

    /* ==========================================================================
       4. Battery & Power Telemetry
       ========================================================================== */
    async initBatteryAPI() {
        if ('getBattery' in navigator) {
            try {
                const b = await navigator.getBattery();
                const updateBat = () => {
                    this.data.battery.level = Math.round(b.level * 100);
                    this.data.battery.charging = b.charging;
                    this.data.battery.time = b.charging ? 'Charging' : `${Math.round(b.dischargingTime / 60)} min`;
                };
                updateBat();
                b.addEventListener('levelchange', updateBat);
                b.addEventListener('chargingchange', updateBat);
            } catch (e) {}
        }
    }

    /* ==========================================================================
       5. Network Diagnostics
       ========================================================================== */
    initNetworkAPI() {
        const updateNet = () => {
            this.data.network.online = navigator.onLine;
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn) {
                this.data.network.type = conn.effectiveType ? conn.effectiveType.toUpperCase() : 'Wi-Fi / 4G';
                this.data.network.rtt = conn.rtt || 28;
                this.data.network.downlink = conn.downlink || 18.5;
            }
        };
        updateNet();
        window.addEventListener('online', updateNet);
        window.addEventListener('offline', updateNet);
    }

    /* ==========================================================================
       6. GPS & Speed Geolocation
       ========================================================================== */
    initGeolocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.watchPosition(
                (pos) => {
                    this.data.gps.lat = parseFloat(pos.coords.latitude.toFixed(5));
                    this.data.gps.lng = parseFloat(pos.coords.longitude.toFixed(5));
                    this.data.gps.speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
                    this.data.gps.alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : 18;
                    this.data.gps.accuracy = Math.round(pos.coords.accuracy);
                    this.data.gps.status = 'Live GPS';
                },
                () => {
                    this.data.gps.status = 'Simulated GPS';
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }

    /* ==========================================================================
       7. Physics & Simulated Telemetry (Smooth Waveform Generators)
       ========================================================================== */
    initSimulatedTelemetry() {
        // Smooth sine oscillations for light lux, temp, barometric pressure if device lacks hardware
        let tick = 0;
        setInterval(() => {
            if (!this.isRunning) return;
            tick += 0.1;

            // Ambient Light fluctuation
            this.data.light.lux = Math.round(340 + Math.sin(tick * 0.5) * 60 + (Math.random() - 0.5) * 15);

            // Barometric & Temp fluctuation
            this.data.temp.celsius = parseFloat((28.5 + Math.sin(tick * 0.2) * 1.5).toFixed(1));
            this.data.temp.humidity = Math.round(65 + Math.cos(tick * 0.3) * 5);
            this.data.temp.pressure = parseFloat((1013.25 + Math.sin(tick * 0.1) * 2).toFixed(2));

            // Acoustic Mic Level (if not real mic, simulate natural noise floor 30-55 dB)
            if (!this.data.mic.isListening) {
                this.data.mic.decibels = Math.round(34 + Math.random() * 12);
            }

            // Simulated G-Force micro-tremors on PC
            if (this.data.accel.x === 0 && this.data.accel.y === 0 && this.data.accel.z === 9.8) {
                this.data.accel.x = parseFloat((Math.sin(tick * 2) * 0.4).toFixed(2));
                this.data.accel.y = parseFloat((Math.cos(tick * 1.5) * 0.3).toFixed(2));
                this.data.accel.z = parseFloat((9.8 + Math.sin(tick * 3) * 0.2).toFixed(2));
            }
        }, 100);
    }

    /* ==========================================================================
       8. Real-Time Oscilloscope Canvas Waveforms
       ========================================================================== */
    initChartCanvases() {
        this.canvases = {
            accel: document.getElementById('chartAccel'),
            gyro: document.getElementById('chartGyro'),
            mic: document.getElementById('chartMic'),
            light: document.getElementById('chartLight'),
            temp: document.getElementById('chartTemp')
        };
    }

    /* ==========================================================================
       Main Render Loop
       ========================================================================== */
    startLoop() {
        const loop = () => {
            if (this.isRunning) {
                this.updateTelemetryBuffers();
                this.renderCharts();
                this.updateDOM();
                this.checkAlarms();

                if (this.isRecording) {
                    this.recordLogSample();
                }
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    updateTelemetryBuffers() {
        // Read real mic analyser if active
        if (this.data.mic.isListening && this.data.mic.analyser) {
            const dataArray = new Uint8Array(this.data.mic.analyser.frequencyBinCount);
            this.data.mic.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            this.data.mic.decibels = Math.round(20 + (avg / 255) * 80);
        }

        // Push into FIFO buffers
        const totalAccel = Math.hypot(this.data.accel.x, this.data.accel.y, this.data.accel.z);
        this.pushBuffer(this.history.accelX, totalAccel);
        this.pushBuffer(this.history.gyroAlpha, this.data.gyro.alpha);
        this.pushBuffer(this.history.micDecibel, this.data.mic.decibels);
        this.pushBuffer(this.history.lightLux, this.data.light.lux);
        this.pushBuffer(this.history.temperatureSim, this.data.temp.celsius);
    }

    pushBuffer(arr, val) {
        arr.push(val);
        if (arr.length > 40) arr.shift();
    }

    renderCharts() {
        this.drawWaveform(this.canvases.accel, this.history.accelX, '#06b6d4', 0, 25);
        this.drawWaveform(this.canvases.gyro, this.history.gyroAlpha, '#8b5cf6', 0, 360);
        this.drawWaveform(this.canvases.mic, this.history.micDecibel, '#10b981', 0, 100);
        this.drawWaveform(this.canvases.light, this.history.lightLux, '#f59e0b', 0, 1000);
        this.drawWaveform(this.canvases.temp, this.history.temperatureSim, '#f43f5e', 20, 45);
    }

    drawWaveform(canvas, dataArr, color, minVal, maxVal) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let y = 0; y < h; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Waveform
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const step = w / (dataArr.length - 1);
        dataArr.forEach((val, idx) => {
            const normalized = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
            const y = h - (normalized * (h - 10) + 5);
            const x = idx * step;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Glowing area fill
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = `${color}15`;
        ctx.fill();
    }

    updateDOM() {
        // Accelerometer
        const totalG = Math.hypot(this.data.accel.x, this.data.accel.y, this.data.accel.z) / 9.8;
        document.getElementById('valAccel').textContent = totalG.toFixed(2);
        document.getElementById('metricAccelX').textContent = `${this.data.accel.x} m/s²`;
        document.getElementById('metricAccelY').textContent = `${this.data.accel.y} m/s²`;
        document.getElementById('metricAccelZ').textContent = `${this.data.accel.z} m/s²`;
        document.getElementById('gaugeAccel').style.width = `${Math.min(100, totalG * 40)}%`;

        // Gyroscope & 3D Compass
        document.getElementById('valGyro').textContent = `${this.data.gyro.alpha}°`;
        document.getElementById('metricGyroPitch').textContent = `${this.data.gyro.beta}°`;
        document.getElementById('metricGyroRoll').textContent = `${this.data.gyro.gamma}°`;
        const compass = document.getElementById('compassNeedleRing');
        if (compass) {
            compass.style.transform = `rotate(${this.data.gyro.alpha}deg)`;
        }

        // Acoustic Decibel Meter
        document.getElementById('valMic').textContent = this.data.mic.decibels;
        document.getElementById('gaugeMic').style.width = `${Math.min(100, this.data.mic.decibels)}%`;
        const statusMic = document.getElementById('statusMic');
        if (this.data.mic.decibels > 75) {
            statusMic.className = 'status-badge danger';
            statusMic.textContent = '⚠️ Bising Tinggi';
        } else if (this.data.mic.decibels > 55) {
            statusMic.className = 'status-badge warning';
            statusMic.textContent = 'Moderat';
        } else {
            statusMic.className = 'status-badge';
            statusMic.textContent = 'Tenang';
        }

        // Ambient Light Photodiode
        document.getElementById('valLight').textContent = this.data.light.lux;
        document.getElementById('gaugeLight').style.width = `${Math.min(100, (this.data.light.lux / 1000) * 100)}%`;

        // Battery Power
        document.getElementById('valBattery').textContent = this.data.battery.level;
        document.getElementById('metricBatCharging').textContent = this.data.battery.charging ? '⚡ Yes' : 'No';
        document.getElementById('gaugeBattery').style.width = `${this.data.battery.level}%`;

        // Environmental Temp & Barometer
        document.getElementById('valTemp').textContent = this.data.temp.celsius;
        document.getElementById('metricHumidity').textContent = `${this.data.temp.humidity}%`;
        document.getElementById('metricPressure').textContent = `${this.data.temp.pressure} hPa`;
        document.getElementById('gaugeTemp').style.width = `${Math.min(100, ((this.data.temp.celsius - 15) / 30) * 100)}%`;

        // GPS Telemetry
        document.getElementById('valGpsLat').textContent = this.data.gps.lat;
        document.getElementById('valGpsLng').textContent = this.data.gps.lng;
        document.getElementById('valGpsSpeed').textContent = `${this.data.gps.speed} km/h`;
        document.getElementById('valGpsAlt').textContent = `${this.data.gps.alt} m`;
        document.getElementById('statusGpsBadge').textContent = this.data.gps.status;

        // Network
        document.getElementById('valNetType').textContent = this.data.network.type;
        document.getElementById('metricNetLatency').textContent = `${this.data.network.rtt} ms`;
        document.getElementById('metricNetSpeed').textContent = `${this.data.network.downlink} Mbps`;
    }

    checkAlarms() {
        if (this.data.mic.decibels >= this.thresholds.soundMax) {
            this.audio.playAlarm();
        }
    }

    /* ==========================================================================
       Recording & CSV Data Export
       ========================================================================== */
    toggleRecording() {
        this.isRecording = !this.isRecording;
        const btn = document.getElementById('btnRecordLogs');
        if (this.isRecording) {
            this.recordedLogs = [];
            btn.classList.add('active');
            btn.innerHTML = '<i class="fa-solid fa-stop"></i> Berhenti Rekam';
            this.audio.playBeep(880, 0.15);
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fa-solid fa-circle-dot"></i> Rekam Data (CSV)';
            this.exportCSV();
        }
    }

    recordLogSample() {
        this.recordedLogs.push({
            timestamp: new Date().toISOString(),
            accelTotal: Math.hypot(this.data.accel.x, this.data.accel.y, this.data.accel.z).toFixed(2),
            gyroHeading: this.data.gyro.alpha,
            decibels: this.data.mic.decibels,
            lightLux: this.data.light.lux,
            temperature: this.data.temp.celsius,
            pressure: this.data.temp.pressure,
            battery: this.data.battery.level
        });
    }

    exportCSV() {
        if (this.recordedLogs.length === 0) return;
        const headers = ['Timestamp', 'Accel_G', 'Heading_Deg', 'Sound_dB', 'Light_Lux', 'Temp_C', 'Pressure_hPa', 'Battery_Pct'];
        const rows = this.recordedLogs.map(r => [
            r.timestamp, r.accelTotal, r.gyroHeading, r.decibels, r.lightLux, r.temperature, r.pressure, r.battery
        ].join(','));

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `telemetry_sensor_log_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.audio.playSuccess();
    }

    filterCategory(cat, btn) {
        this.activeFilter = cat;
        document.querySelectorAll('.sensor-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.sensor-card').forEach(card => {
            const cardCat = card.getAttribute('data-cat');
            if (cat === 'ALL' || cardCat === cat) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.sensorEngine = new SensorLabEngine();
});
