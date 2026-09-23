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
            temp: { celsius: 28.5, humidity: 65, pressure: 1013.25 },
            camera: {
                isActive: false,
                stream: null,
                mode: 'COLOR', // COLOR, MOTION, LUX, PPG, SOBEL, THERMAL
                color: { r: 16, g: 185, b: 129, hex: '#10B981', name: 'Emerald Green', hsv: 'HSV(160°, 91%, 73%)' },
                motionScore: 0,
                opticalLux: 350,
                ppgBuffer: [],
                ppgBpm: 72,
                prevFrameData: null,
                fps: 30,
                lastFrameTime: performance.now()
            }
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
        this.initCameraElements();
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
                this.processCameraFrame();
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

        // Camera Optical Sensor Telemetry DOM
        if (this.data.camera) {
            const c = this.data.camera.color;
            const cube = document.getElementById('camColorCube');
            if (cube) cube.style.backgroundColor = c.hex;
            
            const nameEl = document.getElementById('camColorName');
            if (nameEl) nameEl.textContent = c.name;

            const hexEl = document.getElementById('camColorHex');
            if (hexEl) hexEl.textContent = c.hex;

            const rgbEl = document.getElementById('camColorRgb');
            if (rgbEl) rgbEl.textContent = `RGB(${c.r}, ${c.g}, ${c.b}) • ${c.hsv}`;

            const motionEl = document.getElementById('camMotionVal');
            if (motionEl) {
                const m = this.data.camera.motionScore;
                motionEl.textContent = `${m}% ${m > 15 ? '(Gerak Cepat)' : m > 3 ? '(Gerak Halus)' : '(Diam)'}`;
            }

            const luxEl = document.getElementById('camLuxVal');
            if (luxEl) luxEl.textContent = `${this.data.camera.opticalLux} Lux`;

            const pulseEl = document.getElementById('camPulseVal');
            if (pulseEl) {
                pulseEl.textContent = `${this.data.camera.ppgBpm} BPM ${this.data.camera.isActive ? '💓 Live' : '(Siap)'}`;
            }

            const fpsEl = document.getElementById('camFpsVal');
            if (fpsEl) fpsEl.textContent = `640x480 @ ${this.data.camera.fps} FPS`;
        }
    }

    /* ==========================================================================
       9. Camera Optical Sensor & Computer Vision Engine
       ========================================================================== */
    initCameraElements() {
        this.camVideo = document.getElementById('cameraVideo');
        this.camCanvas = document.getElementById('cameraCanvas');
        if (this.camCanvas) {
            this.camCtx = this.camCanvas.getContext('2d', { willReadFrequently: true });
        }
    }

    async toggleCamera() {
        this.audio.init();
        if (this.data.camera.isActive) {
            this.stopCamera();
        } else {
            await this.startCamera();
        }
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.data.camera.stream = stream;
            this.data.camera.isActive = true;

            if (this.camVideo) {
                this.camVideo.srcObject = stream;
                this.camVideo.play();
            }

            document.getElementById('cameraPlaceholder').style.display = 'none';
            document.getElementById('statusCameraBadge').className = 'status-badge';
            document.getElementById('statusCameraBadge').innerHTML = '<i class="fa-solid fa-circle"></i> Live Optical Scan';
            document.getElementById('btnCameraToggle').classList.add('active');
            document.getElementById('btnCameraToggle').innerHTML = '<i class="fa-solid fa-power-off"></i> Matikan Kamera';

            this.audio.playSuccess();
        } catch (err) {
            console.warn('Camera sensor access failed or simulated:', err);
            alert('Tidak dapat mengakses kamera perangkat (izin ditolak atau kamera sedang digunakan). Mengaktifkan simulasi citra optik.');
            this.startSimulatedCamera();
        }
    }

    stopCamera() {
        if (this.data.camera.stream) {
            this.data.camera.stream.getTracks().forEach(track => track.stop());
            this.data.camera.stream = null;
        }
        this.data.camera.isActive = false;

        document.getElementById('cameraPlaceholder').style.display = 'flex';
        document.getElementById('statusCameraBadge').className = 'status-badge warning';
        document.getElementById('statusCameraBadge').innerHTML = '<i class="fa-solid fa-video-slash"></i> Standby';
        document.getElementById('btnCameraToggle').classList.remove('active');
        document.getElementById('btnCameraToggle').innerHTML = '<i class="fa-solid fa-power-off"></i> Nyalakan Kamera';

        if (this.camCtx && this.camCanvas) {
            this.camCtx.clearRect(0, 0, this.camCanvas.width, this.camCanvas.height);
        }
        this.audio.playBeep(440, 0.1);
    }

    startSimulatedCamera() {
        this.data.camera.isActive = true;
        document.getElementById('cameraPlaceholder').style.display = 'none';
        document.getElementById('statusCameraBadge').className = 'status-badge';
        document.getElementById('statusCameraBadge').innerHTML = '<i class="fa-solid fa-circle"></i> Live Sim Optik';
        document.getElementById('btnCameraToggle').classList.add('active');
        document.getElementById('btnCameraToggle').innerHTML = '<i class="fa-solid fa-power-off"></i> Matikan Sensor';
    }

    setCameraMode(mode, btn) {
        this.audio.init();
        this.data.camera.mode = mode;
        document.querySelectorAll('.btn-cam-mode').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        this.audio.playBeep(650, 0.08);
    }

    processCameraFrame() {
        if (!this.data.camera.isActive || !this.camCtx || !this.camCanvas) return;

        const w = this.camCanvas.width;
        const h = this.camCanvas.height;

        // Calculate Frame FPS
        const now = performance.now();
        const delta = now - this.data.camera.lastFrameTime;
        this.data.camera.fps = Math.round(1000 / (delta || 33));
        this.data.camera.lastFrameTime = now;

        if (this.camVideo && this.camVideo.readyState >= 2) {
            // Draw real video stream to processing canvas
            this.camCtx.drawImage(this.camVideo, 0, 0, w, h);
        } else {
            // Draw simulated animated optical specimen pattern if no real hardware
            this.renderSimulatedVisionPattern(w, h, now);
        }

        // Get pixel frame data for Computer Vision extraction
        const frame = this.camCtx.getImageData(0, 0, w, h);
        const data = frame.data;

        // 1. Center Pixel Color Detection (Colorimeter)
        this.detectColorAtCenter(data, w, h);

        // 2. Optical Lux & Luma Estimation
        this.calculateOpticalLux(data, w, h);

        // 3. Optical Motion Velocity & Frame Differencing
        this.detectOpticalMotion(data, w, h);

        // 4. PPG Capillary Pulse Reading
        this.detectPPGHeartRate(data, w, h);

        // 5. Apply Active Computer Vision Filter Mode onto Canvas
        this.applyVisionFilterMode(frame, w, h);

        // 6. Draw HUD Reticle & Crosshair Overlays
        this.drawCameraHUD(w, h);
    }

    renderSimulatedVisionPattern(w, h, now) {
        const time = now * 0.002;
        const grad = this.camCtx.createRadialGradient(
            w / 2 + Math.sin(time) * 120, h / 2 + Math.cos(time * 0.8) * 80, 20,
            w / 2, h / 2, Math.max(w, h) / 1.5
        );
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(0.3, '#10b981');
        grad.addColorStop(0.7, '#8b5cf6');
        grad.addColorStop(1, '#070c18');

        this.camCtx.fillStyle = grad;
        this.camCtx.fillRect(0, 0, w, h);

        // Moving object specimen for motion detection
        const objX = (Math.sin(time * 1.5) * 0.4 + 0.5) * w;
        const objY = (Math.cos(time * 1.2) * 0.35 + 0.5) * h;
        this.camCtx.fillStyle = '#f59e0b';
        this.camCtx.beginPath();
        this.camCtx.arc(objX, objY, 35, 0, Math.PI * 2);
        this.camCtx.fill();
    }

    detectColorAtCenter(data, w, h) {
        const cx = Math.floor(w / 2);
        const cy = Math.floor(h / 2);
        const sampleRadius = 3;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;

        for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
            for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
                const px = cx + dx;
                const py = cy + dy;
                if (px >= 0 && px < w && py >= 0 && py < h) {
                    const idx = (py * w + px) * 4;
                    rSum += data[idx];
                    gSum += data[idx + 1];
                    bSum += data[idx + 2];
                    count++;
                }
            }
        }

        const r = Math.round(rSum / count);
        const g = Math.round(gSum / count);
        const b = Math.round(bSum / count);

        const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        const hsv = this.rgbToHsv(r, g, b);
        const name = this.classifyColorName(r, g, b, hsv);

        this.data.camera.color = { r, g, b, hex, name, hsv };
    }

    rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return `HSV(${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
    }

    classifyColorName(r, g, b, hsvStr) {
        // Find nearest matching color category
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        if (max < 45) return 'Hitam Pekat (Obsidian Black)';
        if (min > 220 && (max - min) < 20) return 'Putih Terang (Bright White)';
        if ((max - min) < 18) return 'Abu-abu Netral (Neutral Gray)';

        if (r > g + 40 && r > b + 40) {
            if (g > 140) return 'Oranye / Kuning Hangat';
            return 'Merah Murni (Ruby Red)';
        }
        if (g > r + 30 && g > b + 30) {
            return 'Hijau Emerald (Emerald Green)';
        }
        if (b > r + 30 && b > g + 20) {
            if (r > 120) return 'Ungu / Violet Elektrik';
            return 'Biru Laut Dalam (Deep Cyan/Blue)';
        }
        if (r > 180 && g > 180 && b < 100) return 'Kuning Emas (Gold Amber)';
        if (g > 160 && b > 160 && r < 100) return 'Cyan Neon (Electric Cyan)';
        if (r > 180 && b > 150 && g < 120) return 'Magenta / Pink Fuchsia';

        return 'Komposit Spektrum Warna';
    }

    calculateOpticalLux(data, w, h) {
        // ITU-R BT.601 Luma formula: Y = 0.299R + 0.587G + 0.114B
        let totalLuma = 0;
        const step = 8; // Downsample for 60 FPS performance
        let samples = 0;

        for (let i = 0; i < data.length; i += 4 * step) {
            const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            totalLuma += y;
            samples++;
        }

        const avgLuma = totalLuma / samples;
        // Scale 0-255 luma to calibrated 0-1200 Lux
        const opticalLux = Math.round((avgLuma / 255) * 1000);
        this.data.camera.opticalLux = opticalLux;
        this.data.light.lux = opticalLux; // Feed camera optical lux into general lux sensor
    }

    detectOpticalMotion(data, w, h) {
        if (!this.data.camera.prevFrameData) {
            this.data.camera.prevFrameData = new Uint8ClampedArray(data);
            return;
        }

        const prev = this.data.camera.prevFrameData;
        let diffSum = 0;
        const step = 12;
        let count = 0;

        for (let i = 0; i < data.length; i += 4 * step) {
            const dr = Math.abs(data[i] - prev[i]);
            const dg = Math.abs(data[i + 1] - prev[i + 1]);
            const db = Math.abs(data[i + 2] - prev[i + 2]);
            const delta = (dr + dg + db) / 3;
            if (delta > 18) {
                diffSum += delta;
            }
            count++;
        }

        const motionRatio = (diffSum / (count * 255)) * 100;
        this.data.camera.motionScore = parseFloat(motionRatio.toFixed(1));

        // Update previous frame buffer
        this.data.camera.prevFrameData.set(data);
    }

    detectPPGHeartRate(data, w, h) {
        // Average red channel across center region (for fingertip pulse reading)
        let redSum = 0;
        let count = 0;
        const startY = Math.floor(h * 0.3);
        const endY = Math.floor(h * 0.7);
        const startX = Math.floor(w * 0.3);
        const endX = Math.floor(w * 0.7);

        for (let y = startY; y < endY; y += 4) {
            for (let x = startX; x < endX; x += 4) {
                const idx = (y * w + x) * 4;
                redSum += data[idx];
                count++;
            }
        }

        const avgRed = redSum / count;
        const buf = this.data.camera.ppgBuffer;
        buf.push(avgRed);
        if (buf.length > 90) buf.shift(); // 3 seconds window at 30 FPS

        // Simple peak detector over waveform
        if (buf.length >= 60) {
            let peaks = 0;
            const mean = buf.reduce((a, b) => a + b, 0) / buf.length;
            for (let i = 1; i < buf.length - 1; i++) {
                if (buf[i] > mean + 0.8 && buf[i] > buf[i - 1] && buf[i] > buf[i + 1]) {
                    peaks++;
                }
            }
            if (peaks >= 2) {
                const bpm = Math.round((peaks / (buf.length / 30)) * 60);
                if (bpm >= 45 && bpm <= 160) {
                    this.data.camera.ppgBpm = bpm;
                }
            }
        }
    }

    applyVisionFilterMode(frame, w, h) {
        const mode = this.data.camera.mode;
        if (mode === 'COLOR') return; // Normal stream with HUD

        const data = frame.data;

        if (mode === 'THERMAL') {
            // Pseudo-thermal infrared heat map
            for (let i = 0; i < data.length; i += 4) {
                const luma = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
                if (luma < 0.25) {
                    data[i] = 0; data[i + 1] = Math.round(luma * 4 * 255); data[i + 2] = 255;
                } else if (luma < 0.5) {
                    data[i] = 0; data[i + 1] = 255; data[i + 2] = Math.round((0.5 - luma) * 4 * 255);
                } else if (luma < 0.75) {
                    data[i] = Math.round((luma - 0.5) * 4 * 255); data[i + 1] = 255; data[i + 2] = 0;
                } else {
                    data[i] = 255; data[i + 1] = Math.round((1 - luma) * 4 * 255); data[i + 2] = Math.round((luma - 0.75) * 4 * 255);
                }
            }
            this.camCtx.putImageData(frame, 0, 0);
        } else if (mode === 'SOBEL') {
            // Sobel Edge Detection
            const grayscale = new Float32Array(w * h);
            for (let i = 0; i < data.length; i += 4) {
                grayscale[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
            }

            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const idx = y * w + x;
                    const gx = 
                        -grayscale[idx - w - 1] + grayscale[idx - w + 1] +
                        -2 * grayscale[idx - 1] + 2 * grayscale[idx + 1] +
                        -grayscale[idx + w - 1] + grayscale[idx + w + 1];

                    const gy = 
                        -grayscale[idx - w - 1] - 2 * grayscale[idx - w] - grayscale[idx - w + 1] +
                        grayscale[idx + w - 1] + 2 * grayscale[idx + w] + grayscale[idx + w + 1];

                    const mag = Math.min(255, Math.hypot(gx, gy));
                    const pIdx = idx * 4;
                    data[pIdx] = 6;
                    data[pIdx + 1] = mag > 45 ? 182 : 12;
                    data[pIdx + 2] = mag > 45 ? 212 : 24;
                }
            }
            this.camCtx.putImageData(frame, 0, 0);
        }
    }

    drawCameraHUD(w, h) {
        const ctx = this.camCtx;
        const cx = w / 2;
        const cy = h / 2;

        // Cyber Reticle Center Target
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
        ctx.lineWidth = 1.5;

        // Center crosshair ring
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.data.camera.color.hex;
        ctx.fill();

        // Corner cross lines
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy); ctx.lineTo(cx - 10, cy);
        ctx.moveTo(cx + 10, cy); ctx.lineTo(cx + 30, cy);
        ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy - 10);
        ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, cy + 30);
        ctx.stroke();

        // Frame corners
        const cr = 24;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath(); ctx.moveTo(20, 20 + cr); ctx.lineTo(20, 20); ctx.lineTo(20 + cr, 20); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(w - 20 - cr, 20); ctx.lineTo(w - 20, 20); ctx.lineTo(w - 20, 20 + cr); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(20, h - 20 - cr); ctx.lineTo(20, h - 20); ctx.lineTo(20 + cr, h - 20); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(w - 20 - cr, h - 20); ctx.lineTo(w - 20, h - 20); ctx.lineTo(w - 20, h - 20 - cr); ctx.stroke();

        // Mode Overlay Banner
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(20, 20, 180, 26);
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(`MODE: ${this.data.camera.mode} [${this.data.camera.fps} FPS]`, 28, 37);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.sensorEngine = new SensorLabEngine();
});
