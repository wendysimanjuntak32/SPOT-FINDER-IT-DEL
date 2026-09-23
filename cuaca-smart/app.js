/**
 * CuacaSmart - Aplikasi Pengukur Suhu & Pengingat Cuaca Pintar
 * Main Logic, API Integration, Smart Reminder Engine, Audio & Visual Effects
 */

// Global State
const state = {
    currentCity: 'Jakarta',
    lat: -6.2088,
    lon: 106.8456,
    isCelsius: true,
    rawData: null,
    isSimulated: false,
    settings: {
        rainThreshold: 40,
        hotThreshold: 32,
        coldThreshold: 20,
        soundEnabled: true,
        ttsEnabled: true
    }
};

// Weather particle manager instance
let weatherFX = null;

// Audio Context for synthetic sound effects
let audioCtx = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initWeatherEffects();
    initEventListeners();
    fetchWeatherData(state.lat, state.lon, state.currentCity);
    updateDateTime();
    setInterval(updateDateTime, 30000);
});

/* ==========================================================================
   Settings Management
   ========================================================================== */
function loadSettings() {
    try {
        const saved = localStorage.getItem('cuaca_smart_settings');
        if (saved) {
            state.settings = { ...state.settings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Could not load settings:', e);
    }

    // Update UI controls
    document.getElementById('rainThresholdSlider').value = state.settings.rainThreshold;
    document.getElementById('rainThresholdVal').textContent = `${state.settings.rainThreshold}%`;
    document.getElementById('hotThresholdSlider').value = state.settings.hotThreshold;
    document.getElementById('hotThresholdVal').textContent = `${state.settings.hotThreshold}°C`;
    document.getElementById('coldThresholdSlider').value = state.settings.coldThreshold;
    document.getElementById('coldThresholdVal').textContent = `${state.settings.coldThreshold}°C`;
    document.getElementById('toggleSoundEffects').checked = state.settings.soundEnabled;
    document.getElementById('toggleTTS').checked = state.settings.ttsEnabled;
}

function saveSettings() {
    state.settings.rainThreshold = parseInt(document.getElementById('rainThresholdSlider').value, 10);
    state.settings.hotThreshold = parseInt(document.getElementById('hotThresholdSlider').value, 10);
    state.settings.coldThreshold = parseInt(document.getElementById('coldThresholdSlider').value, 10);
    state.settings.soundEnabled = document.getElementById('toggleSoundEffects').checked;
    state.settings.ttsEnabled = document.getElementById('toggleTTS').checked;

    try {
        localStorage.setItem('cuaca_smart_settings', JSON.stringify(state.settings));
        showToast('Pengaturan berhasil disimpan!', 'success');
    } catch (e) {
        console.warn('Could not save settings:', e);
    }

    closeModal('settingsModal');
    if (state.rawData) {
        processAndRenderWeather(state.rawData);
    }
}

/* ==========================================================================
   Weather FX Initialization
   ========================================================================== */
function initWeatherEffects() {
    if (window.WeatherEffectsManager) {
        weatherFX = new window.WeatherEffectsManager('weatherCanvas');
    }
}

/* ==========================================================================
   Event Listeners Setup
   ========================================================================== */
function initEventListeners() {
    // City Search Input
    const searchInput = document.getElementById('citySearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    let searchDebounce = null;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';

        clearTimeout(searchDebounce);
        if (query.length >= 2) {
            searchDebounce = setTimeout(() => searchCities(query), 350);
        } else {
            hideSearchResults();
        }
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        hideSearchResults();
        searchInput.focus();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            hideSearchResults();
        }
    });

    // Geolocation Button
    document.getElementById('btnGeolocation').addEventListener('click', getUserLocation);

    // Voice Assistant Button
    document.getElementById('btnVoiceAlert').addEventListener('click', triggerVoiceSummary);

    // Browser Notification Button
    document.getElementById('btnNotificationToggle').addEventListener('click', requestNotificationPermission);

    // Modal Triggers
    document.getElementById('btnSettingsModal').addEventListener('click', () => openModal('settingsModal'));
    document.getElementById('btnCloseSettings').addEventListener('click', () => closeModal('settingsModal'));
    document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);

    document.getElementById('btnSimulateModal').addEventListener('click', () => openModal('simulatorModal'));
    document.getElementById('btnCloseSimulator').addEventListener('click', () => closeModal('simulatorModal'));

    // Chime Sound Test Button
    document.getElementById('btnPlayAlertChime').addEventListener('click', () => {
        playAlertChime();
        triggerVoiceSummary();
    });

    // Sliders Realtime Output
    document.getElementById('rainThresholdSlider').addEventListener('input', (e) => {
        document.getElementById('rainThresholdVal').textContent = `${e.target.value}%`;
    });
    document.getElementById('hotThresholdSlider').addEventListener('input', (e) => {
        document.getElementById('hotThresholdVal').textContent = `${e.target.value}°C`;
    });
    document.getElementById('coldThresholdSlider').addEventListener('input', (e) => {
        document.getElementById('coldThresholdVal').textContent = `${e.target.value}°C`;
    });

    // Temperature Unit Buttons
    document.getElementById('btnCelsius').addEventListener('click', () => setTemperatureUnit(true));
    document.getElementById('btnFahrenheit').addEventListener('click', () => setTemperatureUnit(false));

    // Preset Location Chips
    document.querySelectorAll('.location-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.location-chips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            const city = chip.getAttribute('data-city');
            const lat = parseFloat(chip.getAttribute('data-lat'));
            const lon = parseFloat(chip.getAttribute('data-lon'));
            state.isSimulated = false;
            fetchWeatherData(lat, lon, city);
        });
    });

    // Simulator Buttons
    document.getElementById('simHeavyRain').addEventListener('click', () => runSimulation('heavy_rain'));
    document.getElementById('simHeatwave').addEventListener('click', () => runSimulation('heatwave'));
    document.getElementById('simCold').addEventListener('click', () => runSimulation('cold'));
    document.getElementById('simClearDay').addEventListener('click', () => runSimulation('clear_day'));
    document.getElementById('simResetLive').addEventListener('click', () => {
        state.isSimulated = false;
        closeModal('simulatorModal');
        fetchWeatherData(state.lat, state.lon, state.currentCity);
        showToast('Kembali ke data cuaca aktual!', 'info');
    });
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

/* ==========================================================================
   Temperature Conversion & Unit Toggle
   ========================================================================== */
function setTemperatureUnit(isC) {
    if (state.isCelsius === isC) return;
    state.isCelsius = isC;
    document.getElementById('btnCelsius').classList.toggle('active', isC);
    document.getElementById('btnFahrenheit').classList.toggle('active', !isC);
    if (state.rawData) {
        processAndRenderWeather(state.rawData);
    }
}

function formatTemp(tempC) {
    if (tempC === null || tempC === undefined) return '--';
    if (!state.isCelsius) {
        const f = (tempC * 9/5) + 32;
        return `${Math.round(f)}°F`;
    }
    return `${Math.round(tempC)}°C`;
}

function formatTempNum(tempC) {
    if (tempC === null || tempC === undefined) return '--';
    if (!state.isCelsius) {
        return Math.round((tempC * 9/5) + 32);
    }
    return Math.round(tempC);
}

/* ==========================================================================
   Date & Time Display
   ========================================================================== */
function updateDateTime() {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const dtElement = document.getElementById('currentDateTime');
    if (dtElement) {
        dtElement.textContent = `${dayName}, ${dateNum} ${monthName} ${year} • ${hours}:${minutes} WIB`;
    }
}

/* ==========================================================================
   City Geocoding Search & GPS
   ========================================================================== */
async function searchCities(query) {
    const dropdown = document.getElementById('searchResultsDropdown');
    dropdown.innerHTML = '<div class="search-result-item"><i class="fa-solid fa-spinner fa-spin"></i> Mencari kota...</div>';
    dropdown.style.display = 'block';

    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=id&format=json`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            dropdown.innerHTML = '<div class="search-result-item">Kota tidak ditemukan</div>';
            return;
        }

        dropdown.innerHTML = '';
        data.results.forEach(item => {
            const row = document.createElement('div');
            row.className = 'search-result-item';
            const locationDetail = [item.admin1, item.country].filter(Boolean).join(', ');
            row.innerHTML = `<i class="fa-solid fa-location-dot"></i> <div><strong>${item.name}</strong> <small style="color: var(--text-secondary); display: block;">${locationDetail}</small></div>`;
            
            row.addEventListener('click', () => {
                const displayName = `${item.name}, ${item.country || ''}`;
                document.getElementById('citySearchInput').value = displayName;
                hideSearchResults();
                state.isSimulated = false;
                fetchWeatherData(item.latitude, item.longitude, displayName);
            });
            dropdown.appendChild(row);
        });
    } catch (err) {
        dropdown.innerHTML = '<div class="search-result-item">Gagal memuat data kota</div>';
    }
}

function hideSearchResults() {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (dropdown) dropdown.style.display = 'none';
}

function getUserLocation() {
    if (!navigator.geolocation) {
        showToast('Browser Anda tidak mendukung Geolocation', 'warning');
        return;
    }

    showToast('Mendeteksi koordinat GPS Anda...', 'info');
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            state.isSimulated = false;
            fetchWeatherData(lat, lon, 'Lokasi GPS Anda');
            showToast('Lokasi berhasil dideteksi!', 'success');
        },
        (err) => {
            showToast('Izin lokasi ditolak atau gagal mendeteksi', 'warning');
        },
        { timeout: 10000 }
    );
}

/* ==========================================================================
   Fetch Real-Time Open-Meteo Weather Data
   ========================================================================== */
async function fetchWeatherData(lat, lon, cityName) {
    state.lat = lat;
    state.lon = lon;
    state.currentCity = cityName;

    document.getElementById('currentCityName').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${cityName}`;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,dew_point_2m,uv_index&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,precipitation_sum&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        state.rawData = data;
        processAndRenderWeather(data);
    } catch (error) {
        console.error('Weather fetch error:', error);
        showToast('Koneksi lambat, memuat data cadangan...', 'warning');
        loadFallbackWeatherData();
    }
}

/* ==========================================================================
   WMO Weather Code Definitions & Indonesian Translations
   ========================================================================== */
function getWeatherInfo(code, isDay = 1) {
    switch (code) {
        case 0:
            return {
                desc: 'Cerah',
                icon: isDay ? 'fa-sun' : 'fa-moon',
                theme: isDay ? 'weather-clear-day' : 'weather-night',
                fx: 'clear',
                iconColor: isDay ? '#f59e0b' : '#c7d2fe'
            };
        case 1:
        case 2:
            return {
                desc: 'Cerah Berawan',
                icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon',
                theme: isDay ? 'weather-clear-day' : 'weather-night',
                fx: 'clear',
                iconColor: '#38bdf8'
            };
        case 3:
            return {
                desc: 'Berawan Mendung',
                icon: 'fa-cloud',
                theme: 'weather-cold',
                fx: 'clear',
                iconColor: '#94a3b8'
            };
        case 45:
        case 48:
            return {
                desc: 'Berkabut',
                icon: 'fa-smog',
                theme: 'weather-cold',
                fx: 'clear',
                iconColor: '#cbd5e1'
            };
        case 51:
        case 53:
        case 55:
            return {
                desc: 'Gerimis Ringan',
                icon: 'fa-cloud-rain',
                theme: 'weather-rain',
                fx: 'rain',
                iconColor: '#06b6d4'
            };
        case 61:
        case 63:
            return {
                desc: 'Hujan Sedang',
                icon: 'fa-cloud-showers-heavy',
                theme: 'weather-rain',
                fx: 'rain',
                iconColor: '#0ea5e9'
            };
        case 65:
            return {
                desc: 'Hujan Deras / Lebat',
                icon: 'fa-cloud-showers-water',
                theme: 'weather-rain',
                fx: 'rain',
                iconColor: '#0284c7'
            };
        case 71:
        case 73:
        case 75:
        case 77:
            return {
                desc: 'Hujan Salju',
                icon: 'fa-snowflake',
                theme: 'weather-cold',
                fx: 'snow',
                iconColor: '#e0f2fe'
            };
        case 80:
        case 81:
        case 82:
            return {
                desc: 'Hujan Lokal Deras',
                icon: 'fa-cloud-showers-heavy',
                theme: 'weather-rain',
                fx: 'rain',
                iconColor: '#0ea5e9'
            };
        case 95:
        case 96:
        case 99:
            return {
                desc: 'Badai Petir & Kilat',
                icon: 'fa-bolt-lightning',
                theme: 'weather-thunderstorm',
                fx: 'thunderstorm',
                iconColor: '#fbbf24'
            };
        default:
            return {
                desc: 'Berawan Sebagian',
                icon: 'fa-cloud-sun',
                theme: 'weather-clear-day',
                fx: 'clear',
                iconColor: '#38bdf8'
            };
    }
}

/* ==========================================================================
   Process & Render Weather Dashboard
   ========================================================================== */
function processAndRenderWeather(data) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    const weatherCode = current.weather_code || 0;
    const weatherInfo = getWeatherInfo(weatherCode);

    // 1. Update Theme & Canvas FX
    document.body.className = weatherInfo.theme;
    if (current.temperature_2m >= state.settings.hotThreshold && weatherInfo.fx !== 'rain' && weatherInfo.fx !== 'thunderstorm') {
        document.body.className = 'weather-hot';
        if (weatherFX) weatherFX.setWeatherMode('hot');
    } else if (current.temperature_2m <= state.settings.coldThreshold && weatherInfo.fx !== 'rain') {
        document.body.className = 'weather-cold';
        if (weatherFX) weatherFX.setWeatherMode('cold');
    } else {
        if (weatherFX) weatherFX.setWeatherMode(weatherInfo.fx);
    }

    // 2. Main Temperature Card
    const currentTemp = current.temperature_2m;
    const feelsLike = current.apparent_temperature;
    const tempMaxToday = daily.temperature_2m_max[0];
    const tempMinToday = daily.temperature_2m_min[0];

    document.getElementById('currentTemp').textContent = formatTempNum(currentTemp);
    document.getElementById('currentWeatherDesc').textContent = weatherInfo.desc;
    document.getElementById('currentFeelsLike').innerHTML = `<i class="fa-solid fa-temperature-half"></i> Terasa seperti: <strong>${formatTemp(feelsLike)}</strong>`;
    document.getElementById('tempMax').textContent = formatTemp(tempMaxToday);
    document.getElementById('tempMin').textContent = formatTemp(tempMinToday);

    const weatherIconElem = document.getElementById('mainWeatherIcon');
    weatherIconElem.innerHTML = `<i class="fa-solid ${weatherInfo.icon}"></i>`;
    weatherIconElem.style.color = weatherInfo.iconColor;

    // 3. Update Visual Thermometer Gauge
    updateThermometerGauge(currentTemp);

    // 4. Calculate Rain Probabilities in the Next 12 Hours
    let maxRainProbNextHours = 0;
    let rainExpectedHour = null;
    const currentHourIndex = new Date().getHours();

    for (let i = 0; i < 12; i++) {
        const hourIdx = currentHourIndex + i;
        if (hourly && hourly.precipitation_probability && hourly.precipitation_probability[hourIdx] !== undefined) {
            const prob = hourly.precipitation_probability[hourIdx];
            if (prob > maxRainProbNextHours) {
                maxRainProbNextHours = prob;
                if (!rainExpectedHour && prob >= state.settings.rainThreshold) {
                    rainExpectedHour = (hourIdx % 24);
                }
            }
        }
    }

    // If API returned 0 or no hourly prob, check current precipitation / daily max
    if (maxRainProbNextHours === 0 && daily.precipitation_probability_max && daily.precipitation_probability_max[0]) {
        maxRainProbNextHours = daily.precipitation_probability_max[0];
    }
    if (current.precipitation > 0 && maxRainProbNextHours < 70) {
        maxRainProbNextHours = 85;
    }

    // 5. Environmental Metrics
    const humidity = current.relative_humidity_2m || 0;
    const windSpeed = Math.round(current.wind_speed_10m || 0);
    const windDir = getWindDirectionName(current.wind_direction_10m || 0);
    const pressure = Math.round(current.surface_pressure || 1013);
    const uvIndex = current.uv_index !== undefined ? current.uv_index : (daily.uv_index_max ? daily.uv_index_max[0] : 4.5);
    const rainSum = daily.precipitation_sum ? daily.precipitation_sum[0].toFixed(1) : '0.0';
    const dewPoint = current.dew_point_2m !== undefined ? Math.round(current.dew_point_2m) : 22;

    document.getElementById('metricHumidity').textContent = `${humidity}%`;
    document.getElementById('metricHumiditySub').textContent = humidity > 80 ? 'Sangat lembap' : humidity < 40 ? 'Udara kering' : 'Kelembapan normal';
    document.getElementById('metricWind').textContent = `${windSpeed} km/h`;
    document.getElementById('metricWindDir').textContent = `Arah ${windDir}`;
    document.getElementById('metricPressure').textContent = `${pressure} hPa`;
    document.getElementById('metricUV').textContent = uvIndex.toFixed(1);
    document.getElementById('metricRainAmt').textContent = `${rainSum} mm`;
    document.getElementById('metricDew').textContent = formatTemp(dewPoint);

    // 6. Execute Smart Reminder Engine (Payung, UV, Pakaian, Jemuran, Olahraga)
    evaluateSmartReminders({
        currentTemp,
        feelsLike,
        humidity,
        windSpeed,
        uvIndex,
        maxRainProb: maxRainProbNextHours,
        rainExpectedHour,
        weatherCode,
        weatherDesc: weatherInfo.desc
    });

    // 7. Render 24-Hour Hourly Forecast
    renderHourlyForecast(hourly, currentHourIndex);

    // 8. Render 7-Day Extended Forecast
    renderWeeklyForecast(daily);
}

/* ==========================================================================
   Thermometer Visual Animation Engine
   ========================================================================== */
function updateThermometerGauge(tempC) {
    // Mapping temp -10°C to 50°C into 0% to 100% height
    let percent = ((tempC - (-10)) / (50 - (-10))) * 100;
    percent = Math.max(8, Math.min(95, percent));

    const mercury = document.getElementById('thermometerMercury');
    const bulb = document.getElementById('bulbCore');
    const bulbWrap = document.querySelector('.thermometer-bulb');

    if (mercury) {
        mercury.style.height = `${percent}%`;
        
        let color1, color2;
        if (tempC <= 15) {
            // Cold Blue
            color1 = '#0284c7';
            color2 = '#38bdf8';
            if (bulbWrap) bulbWrap.style.background = '#0284c7';
        } else if (tempC <= 26) {
            // Pleasant Emerald / Aqua
            color1 = '#059669';
            color2 = '#10b981';
            if (bulbWrap) bulbWrap.style.background = '#059669';
        } else if (tempC <= 33) {
            // Warm Amber
            color1 = '#d97706';
            color2 = '#f59e0b';
            if (bulbWrap) bulbWrap.style.background = '#d97706';
        } else {
            // Hot Crimson
            color1 = '#e11d48';
            color2 = '#f43f5e';
            if (bulbWrap) bulbWrap.style.background = '#e11d48';
        }
        mercury.style.background = `linear-gradient(0deg, ${color1} 0%, ${color2} 100%)`;
        if (bulbWrap) bulbWrap.style.boxShadow = `0 0 20px ${color1}`;
    }
}

/* ==========================================================================
   SMART REMINDER & ALERT ENGINE (Core Intelligence)
   ========================================================================== */
function evaluateSmartReminders(ctx) {
    const banner = document.getElementById('mainAlertBanner');
    const bannerBadge = document.getElementById('alertBadge');
    const bannerTime = document.getElementById('alertTime');
    const bannerMsg = document.getElementById('alertMessage');
    const bannerIcon = document.getElementById('alertIcon');

    // 1. UMBRELLA & RAIN REMINDER EVALUATION
    const isRainAlert = ctx.maxRainProb >= state.settings.rainThreshold || ctx.weatherCode >= 51;
    const cardUmbrella = document.getElementById('cardReminderUmbrella');
    const tagUmbrella = document.getElementById('tagUmbrella');
    const descUmbrella = document.getElementById('descUmbrella');
    const rainBar = document.getElementById('rainProbabilityBar');
    const rainValText = document.getElementById('rainProbValue');
    const umbrellaPill = document.getElementById('umbrellaStatusPill');

    rainBar.style.width = `${ctx.maxRainProb}%`;
    rainValText.textContent = `Peluang Hujan: ${ctx.maxRainProb}%`;

    let aiSpeechText = '';

    if (isRainAlert) {
        banner.className = 'alert-banner warning';
        bannerBadge.textContent = 'PERINGATAN HUJAN';
        bannerBadge.style.background = 'var(--warning-amber)';
        bannerIcon.className = 'fa-solid fa-umbrella';
        
        let timeDesc = ctx.rainExpectedHour !== null ? `Diperkirakan sekitar pukul ${String(ctx.rainExpectedHour).padStart(2, '0')}:00` : 'Dalam beberapa jam ke depan';
        bannerTime.textContent = timeDesc;
        bannerMsg.innerHTML = `Peluang hujan tinggi <strong>${ctx.maxRainProb}%</strong>. Jangan lupa siapkan dan <strong>bawa Payung atau Jas Hujan</strong> sebelum bepergian!`;

        tagUmbrella.textContent = 'Wajib Bawa Payung';
        tagUmbrella.className = 'reminder-tag tag-warning';
        descUmbrella.textContent = `Potensi hujan mencapai ${ctx.maxRainProb}%. ${timeDesc}. Lindungi diri Anda dengan payung atau jas hujan.`;
        cardUmbrella.classList.add('alert-pulse');
        
        umbrellaPill.className = 'status-pill status-active';
        umbrellaPill.innerHTML = '<i class="fa-solid fa-umbrella"></i> Wajib Bawa Payung';

        aiSpeechText = `Peringatan cuaca! Peluang hujan di wilayah Anda mencapai ${ctx.maxRainProb} persen. Jangan lupa membawa payung atau jas hujan sebelum keluar rumah.`;
        
        // Auto-trigger browser notification if permitted
        sendBrowserNotification('☔ Pengingat Hujan: Wajib Bawa Payung!', `Peluang hujan ${ctx.maxRainProb}%. Pastikan Anda membawa payung sebelum bepergian.`);
    } else if (ctx.currentTemp >= state.settings.hotThreshold) {
        banner.className = 'alert-banner danger';
        bannerBadge.textContent = 'PERINGATAN SUHU PANAS';
        bannerBadge.style.background = 'var(--danger-red)';
        bannerIcon.className = 'fa-solid fa-temperature-arrow-up';
        bannerTime.textContent = 'Indeks Panas Tinggi';
        bannerMsg.innerHTML = `Suhu mencapai <strong>${formatTemp(ctx.currentTemp)}</strong> (Terasa seperti ${formatTemp(ctx.feelsLike)}). Perbanyak <strong>minum air putih</strong> dan hindari dehidrasi!`;

        tagUmbrella.textContent = 'Aman dari Hujan';
        tagUmbrella.className = 'reminder-tag tag-safe';
        descUmbrella.textContent = `Peluang hujan rendah (${ctx.maxRainProb}%). Cuaca cerah dan panas.`;
        cardUmbrella.classList.remove('alert-pulse');

        umbrellaPill.className = 'status-pill status-safe';
        umbrellaPill.innerHTML = '<i class="fa-solid fa-circle-check"></i> Bebas Hujan';

        aiSpeechText = `Peringatan suhu panas! Suhu saat ini mencapai ${formatTemp(ctx.currentTemp)}. Jangan lupa cukupi hidrasi tubuh dan minum air putih.`;
    } else {
        banner.className = 'alert-banner safe';
        bannerBadge.textContent = 'CUACA KONDUSIF';
        bannerBadge.style.background = 'var(--success-green)';
        bannerIcon.className = 'fa-solid fa-circle-check';
        bannerTime.textContent = 'Kondisi Nyaman';
        bannerMsg.innerHTML = `Cuaca hari ini cukup bersahabat dengan suhu <strong>${formatTemp(ctx.currentTemp)}</strong>. Selamat beraktivitas!`;

        tagUmbrella.textContent = 'Tidak Perlu Payung';
        tagUmbrella.className = 'reminder-tag tag-safe';
        descUmbrella.textContent = `Peluang hujan hanya ${ctx.maxRainProb}%. Cuaca bersahabat untuk beraktivitas.`;
        cardUmbrella.classList.remove('alert-pulse');

        umbrellaPill.className = 'status-pill status-safe';
        umbrellaPill.innerHTML = '<i class="fa-solid fa-circle-check"></i> Aman';

        aiSpeechText = `Kondisi cuaca hari ini cerah bersahabat dengan suhu ${formatTemp(ctx.currentTemp)}. Nikmati hari Anda!`;
    }

    // 2. UV PROTECTION REMINDER
    const tagUV = document.getElementById('tagUV');
    const descUV = document.getElementById('descUV');
    const uvBar = document.getElementById('uvIndexBar');
    const uvValText = document.getElementById('uvIndexValue');
    const uvScore = ctx.uvIndex;

    const uvPercent = Math.min(100, (uvScore / 11) * 100);
    uvBar.style.width = `${uvPercent}%`;

    if (uvScore >= 8) {
        tagUV.textContent = 'Sangat Tinggi (SPF 50+)';
        tagUV.className = 'reminder-tag tag-danger';
        descUV.textContent = `Indeks UV sangat kuat (${uvScore.toFixed(1)}). Wajib pakai tabir surya SPF 50+, topi, dan kacamata hitam.`;
        uvValText.textContent = `Indeks UV: ${uvScore.toFixed(1)} (Sangat Ekstrem)`;
    } else if (uvScore >= 5) {
        tagUV.textContent = 'Sedang (SPF 30)';
        tagUV.className = 'reminder-tag tag-warning';
        descUV.textContent = `Indeks UV moderat (${uvScore.toFixed(1)}). Dianjurkan mengoleskan tabir surya saat berada di luar ruangan.`;
        uvValText.textContent = `Indeks UV: ${uvScore.toFixed(1)} (Moderat)`;
    } else {
        tagUV.textContent = 'Rendah (Aman)';
        tagUV.className = 'reminder-tag tag-safe';
        descUV.textContent = `Indeks UV rendah (${uvScore.toFixed(1)}). Paparan sinar matahari aman bagi kulit.`;
        uvValText.textContent = `Indeks UV: ${uvScore.toFixed(1)} (Rendah)`;
    }

    // 3. CLOTHES & JACKET RECOMMENDATION
    const tagClothes = document.getElementById('tagClothes');
    const descClothes = document.getElementById('descClothes');

    if (ctx.currentTemp <= state.settings.coldThreshold) {
        tagClothes.textContent = 'Kenakan Jaket Tebal';
        tagClothes.className = 'reminder-tag tag-info';
        descClothes.textContent = `Suhu sejuk/dingin (${formatTemp(ctx.currentTemp)}). Disarankan memakai jaket, sweater, atau pakaian hangat.`;
    } else if (ctx.currentTemp >= state.settings.hotThreshold) {
        tagClothes.textContent = 'Pakaian Katun Ringan';
        tagClothes.className = 'reminder-tag tag-danger';
        descClothes.textContent = `Suhu panas (${formatTemp(ctx.currentTemp)}). Kenakan pakaian berbahan katun tipis yang adem dan menyerap keringat.`;
    } else {
        tagClothes.textContent = 'Pakaian Santai / Sehari-hari';
        tagClothes.className = 'reminder-tag tag-safe';
        descClothes.textContent = `Suhu seimbang (${formatTemp(ctx.currentTemp)}). Pakaian kasual nyaman dipakai seharian.`;
    }

    // 4. LAUNDRY / JEMURAN
    const tagLaundry = document.getElementById('tagLaundry');
    const descLaundry = document.getElementById('descLaundry');

    if (isRainAlert) {
        tagLaundry.textContent = 'Waspada Basah';
        tagLaundry.className = 'reminder-tag tag-warning';
        descLaundry.textContent = 'Potensi hujan tinggi. Sebaiknya jemur pakaian di teras beratap atau gunakan pengering.';
    } else if (ctx.humidity > 82) {
        tagLaundry.textContent = 'Lambat Kering';
        tagLaundry.className = 'reminder-tag tag-info';
        descLaundry.textContent = 'Kelembapan udara tinggi. Pakaian butuh waktu lebih lama untuk benar-benar kering.';
    } else {
        tagLaundry.textContent = 'Sangat Bagus Jemur';
        tagLaundry.className = 'reminder-tag tag-success';
        descLaundry.textContent = 'Sinar matahari cukup dan udara kering. Pakaian akan cepat kering sempurna.';
    }

    // 5. OUTDOOR & HYDRATION
    const tagOutdoor = document.getElementById('tagOutdoor');
    const descOutdoor = document.getElementById('descOutdoor');

    if (isRainAlert) {
        tagOutdoor.textContent = 'Disarankan Indoor';
        tagOutdoor.className = 'reminder-tag tag-warning';
        descOutdoor.textContent = 'Hindari olahraga luar ruangan tanpa perlindungan saat langit mendung berpotensi hujan.';
    } else if (ctx.currentTemp >= state.settings.hotThreshold) {
        tagOutdoor.textContent = 'Ekstra Hidrasi';
        tagOutdoor.className = 'reminder-tag tag-danger';
        descOutdoor.textContent = 'Suhu terik menguras cairan tubuh. Disarankan minum minimal 2.5 liter air putih hari ini.';
    } else {
        tagOutdoor.textContent = 'Sangat Nyaman';
        tagOutdoor.className = 'reminder-tag tag-success';
        descOutdoor.textContent = 'Waktu ideal untuk jogging, bersepeda, atau jalan santai di luar ruangan.';
    }

    // 6. AI Summary Box Text
    const aiSummaryText = document.getElementById('aiSummaryText');
    if (aiSummaryText) {
        aiSummaryText.textContent = `${ctx.weatherDesc} (${formatTemp(ctx.currentTemp)}). ${isRainAlert ? '⚠️ Jangan lupa membawa PAYUNG karena ada potensi hujan.' : 'Kondisi cuaca bersahabat untuk aktivitas Anda.'}`;
    }

    // Store summary for speech
    state.lastAiSummary = aiSpeechText;
}

/* ==========================================================================
   24-Hour Forecast Horizontal Bar Chart & Scroller
   ========================================================================== */
function renderHourlyForecast(hourly, currentHourIndex) {
    const container = document.getElementById('hourlyForecastContainer');
    if (!container || !hourly || !hourly.time) return;

    container.innerHTML = '';

    // Next 24 hours starting from current hour
    for (let i = 0; i < 24; i++) {
        const idx = currentHourIndex + i;
        if (idx >= hourly.time.length) break;

        const timeStr = hourly.time[idx];
        const dateObj = new Date(timeStr);
        const hour = dateObj.getHours();
        const displayTime = i === 0 ? 'Sekarang' : `${String(hour).padStart(2, '0')}:00`;

        const temp = hourly.temperature_2m[idx];
        const rainProb = hourly.precipitation_probability ? (hourly.precipitation_probability[idx] || 0) : 0;
        const code = hourly.weather_code ? hourly.weather_code[idx] : 0;
        const info = getWeatherInfo(code, hour >= 6 && hour < 18 ? 1 : 0);

        const card = document.createElement('div');
        card.className = `hourly-item ${i === 0 ? 'now' : ''}`;
        card.innerHTML = `
            <span class="hourly-time">${displayTime}</span>
            <div class="hourly-icon" style="color: ${info.iconColor}">
                <i class="fa-solid ${info.icon}"></i>
            </div>
            <span class="hourly-temp">${formatTemp(temp)}</span>
            <span class="hourly-rain-badge ${rainProb >= state.settings.rainThreshold ? 'rain-alert' : ''}">
                <i class="fa-solid fa-droplet"></i> ${rainProb}%
            </span>
        `;
        container.appendChild(card);
    }
}

/* ==========================================================================
   7-Day Extended Forecast Render
   ========================================================================== */
function renderWeeklyForecast(daily) {
    const container = document.getElementById('weeklyForecastList');
    if (!container || !daily || !daily.time) return;

    container.innerHTML = '';
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 0; i < daily.time.length && i < 7; i++) {
        const dateObj = new Date(daily.time[i]);
        const dayLabel = i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()}`;

        const code = daily.weather_code[i];
        const info = getWeatherInfo(code);
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

        const row = document.createElement('div');
        row.className = 'weekly-row';
        row.innerHTML = `
            <span class="weekly-day">${dayLabel}</span>
            <div class="weekly-condition">
                <i class="fa-solid ${info.icon} weekly-icon" style="color: ${info.iconColor}"></i>
                <span>${info.desc}</span>
            </div>
            <span class="weekly-rain-chance">
                <i class="fa-solid fa-umbrella"></i> ${rainProb}%
            </span>
            <div class="weekly-temp-bar">
                <span class="temp-min">${formatTemp(minTemp)}</span>
                <div class="temp-bar-bg">
                    <div class="temp-bar-fill" style="left: 20%; width: 60%;"></div>
                </div>
                <span class="temp-max">${formatTemp(maxTemp)}</span>
            </div>
        `;
        container.appendChild(row);
    }
}

/* ==========================================================================
   Simulations for Testing Alerts (Heavy Rain, Heatwave, Cold, Clear)
   ========================================================================== */
function runSimulation(type) {
    state.isSimulated = true;
    closeModal('simulatorModal');

    const simulatedData = {
        current: {
            temperature_2m: 29,
            apparent_temperature: 33,
            relative_humidity_2m: 75,
            precipitation: 0,
            weather_code: 1,
            surface_pressure: 1012,
            wind_speed_10m: 14,
            wind_direction_10m: 220,
            dew_point_2m: 23,
            uv_index: 5.5
        },
        hourly: {
            time: [],
            temperature_2m: [],
            precipitation_probability: [],
            weather_code: []
        },
        daily: {
            time: [],
            weather_code: [],
            temperature_2m_max: [],
            temperature_2m_min: [],
            precipitation_probability_max: [],
            uv_index_max: [],
            precipitation_sum: []
        }
    };

    const currentHour = new Date().getHours();
    for (let i = 0; i < 24; i++) {
        simulatedData.hourly.time.push(new Date(Date.now() + i * 3600000).toISOString());
    }
    for (let i = 0; i < 7; i++) {
        simulatedData.daily.time.push(new Date(Date.now() + i * 86400000).toISOString());
    }

    if (type === 'heavy_rain') {
        state.currentCity = 'Simulasi: Hujan Badai ☔';
        simulatedData.current.temperature_2m = 24;
        simulatedData.current.apparent_temperature = 25;
        simulatedData.current.relative_humidity_2m = 92;
        simulatedData.current.precipitation = 18.5;
        simulatedData.current.weather_code = 95; // Thunderstorm
        simulatedData.current.wind_speed_10m = 28;
        simulatedData.current.uv_index = 1.2;

        simulatedData.hourly.temperature_2m = Array(24).fill(24);
        simulatedData.hourly.precipitation_probability = Array(24).fill(85);
        simulatedData.hourly.weather_code = Array(24).fill(95);

        simulatedData.daily.weather_code = Array(7).fill(65);
        simulatedData.daily.temperature_2m_max = Array(7).fill(27);
        simulatedData.daily.temperature_2m_min = Array(7).fill(22);
        simulatedData.daily.precipitation_probability_max = Array(7).fill(90);
        simulatedData.daily.uv_index_max = Array(7).fill(2.0);
        simulatedData.daily.precipitation_sum = Array(7).fill(25.0);

        showToast('Mode Uji: Hujan Lebat & Badai Petir diaktifkan!', 'warning');
        playAlertChime();
    } else if (type === 'heatwave') {
        state.currentCity = 'Simulasi: Panas Terik Ekstrem 🔥';
        simulatedData.current.temperature_2m = 37;
        simulatedData.current.apparent_temperature = 42;
        simulatedData.current.relative_humidity_2m = 48;
        simulatedData.current.precipitation = 0;
        simulatedData.current.weather_code = 0; // Clear
        simulatedData.current.wind_speed_10m = 8;
        simulatedData.current.uv_index = 9.8; // Ekstrem

        simulatedData.hourly.temperature_2m = Array(24).fill(36);
        simulatedData.hourly.precipitation_probability = Array(24).fill(5);
        simulatedData.hourly.weather_code = Array(24).fill(0);

        simulatedData.daily.weather_code = Array(7).fill(0);
        simulatedData.daily.temperature_2m_max = Array(7).fill(38);
        simulatedData.daily.temperature_2m_min = Array(7).fill(26);
        simulatedData.daily.precipitation_probability_max = Array(7).fill(10);
        simulatedData.daily.uv_index_max = Array(7).fill(10.0);
        simulatedData.daily.precipitation_sum = Array(7).fill(0.0);

        showToast('Mode Uji: Panas Ekstrem 37°C diaktifkan!', 'warning');
    } else if (type === 'cold') {
        state.currentCity = 'Simulasi: Dingin Sejuk ❄️';
        simulatedData.current.temperature_2m = 12;
        simulatedData.current.apparent_temperature = 10;
        simulatedData.current.relative_humidity_2m = 65;
        simulatedData.current.precipitation = 0;
        simulatedData.current.weather_code = 71; // Snow / Frost
        simulatedData.current.wind_speed_10m = 18;
        simulatedData.current.uv_index = 1.5;

        simulatedData.hourly.temperature_2m = Array(24).fill(12);
        simulatedData.hourly.precipitation_probability = Array(24).fill(15);
        simulatedData.hourly.weather_code = Array(24).fill(71);

        simulatedData.daily.weather_code = Array(7).fill(71);
        simulatedData.daily.temperature_2m_max = Array(7).fill(14);
        simulatedData.daily.temperature_2m_min = Array(7).fill(7);
        simulatedData.daily.precipitation_probability_max = Array(7).fill(20);
        simulatedData.daily.uv_index_max = Array(7).fill(2.0);
        simulatedData.daily.precipitation_sum = Array(7).fill(0.0);

        showToast('Mode Uji: Suhu Dingin 12°C diaktifkan!', 'info');
    } else if (type === 'clear_day') {
        state.currentCity = 'Simulasi: Cerah Nyaman ☀️';
        simulatedData.current.temperature_2m = 27;
        simulatedData.current.apparent_temperature = 28;
        simulatedData.current.relative_humidity_2m = 60;
        simulatedData.current.precipitation = 0;
        simulatedData.current.weather_code = 1;
        simulatedData.current.wind_speed_10m = 10;
        simulatedData.current.uv_index = 4.2;

        simulatedData.hourly.temperature_2m = Array(24).fill(27);
        simulatedData.hourly.precipitation_probability = Array(24).fill(10);
        simulatedData.hourly.weather_code = Array(24).fill(1);

        simulatedData.daily.weather_code = Array(7).fill(1);
        simulatedData.daily.temperature_2m_max = Array(7).fill(29);
        simulatedData.daily.temperature_2m_min = Array(7).fill(22);
        simulatedData.daily.precipitation_probability_max = Array(7).fill(15);
        simulatedData.daily.uv_index_max = Array(7).fill(5.0);
        simulatedData.daily.precipitation_sum = Array(7).fill(0.0);

        showToast('Mode Uji: Cuaca Cerah Nyaman diaktifkan!', 'success');
    }

    state.rawData = simulatedData;
    document.getElementById('currentCityName').innerHTML = `<i class="fa-solid fa-flask"></i> ${state.currentCity}`;
    processAndRenderWeather(simulatedData);
}

/* ==========================================================================
   Fallback Offline Weather Data
   ========================================================================== */
function loadFallbackWeatherData() {
    runSimulation('clear_day');
}

/* ==========================================================================
   Web Audio API Synthesizer (Realistic Chimes & Weather Alerts)
   ========================================================================== */
function playAlertChime() {
    if (!state.settings.soundEnabled) return;

    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!audioCtx) audioCtx = new AudioContext();

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // Pleasant 3-note harmonic chime (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);

            gain.gain.setValueAtTime(0, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.85);
        });
    } catch (e) {
        console.warn('Audio chime failed:', e);
    }
}

/* ==========================================================================
   Text-to-Speech (TTS) Voice Assistant in Indonesian
   ========================================================================== */
function triggerVoiceSummary() {
    if (!('speechSynthesis' in window)) {
        showToast('Browser Anda tidak mendukung Text-to-Speech', 'warning');
        return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = state.lastAiSummary || 'Memuat informasi cuaca terkini...';
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Try to pick an Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) {
        utterance.voice = idVoice;
    }

    showToast('Asisten Cuaca sedang berbicara...', 'info');
    window.speechSynthesis.speak(utterance);
}

/* ==========================================================================
   Browser Notification API
   ========================================================================== */
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showToast('Browser tidak mendukung notifikasi sistem', 'warning');
        return;
    }

    if (Notification.permission === 'granted') {
        showToast('Izin notifikasi sudah aktif!', 'success');
        sendBrowserNotification('CuacaSmart Aktif', 'Anda akan menerima pengingat otomatis saat cuaca ekstrem atau hujan terdeteksi.');
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showToast('Notifikasi berhasil diaktifkan!', 'success');
                sendBrowserNotification('CuacaSmart Aktif', 'Pengingat payung & cuaca cerdas kini siap mengingatkan Anda.');
            } else {
                showToast('Izin notifikasi belum diberikan', 'warning');
            }
        });
    }
}

function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body: body,
                icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png'
            });
        } catch (e) {
            console.warn('Notification error:', e);
        }
    }
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */
function getWindDirectionName(deg) {
    const directions = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
    const idx = Math.round((deg % 360) / 45) % 8;
    return directions[idx];
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}
