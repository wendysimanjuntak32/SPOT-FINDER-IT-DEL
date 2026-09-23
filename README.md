# 🚀 Ekosistem Web & Game Apps Interaktif

Pusat portal terintegrasi dan repositori lengkap dari **10 Aplikasi Web Mandiri** yang mencakup: Pemantauan Meteorologi & Cuaca Cerdas, Gamifikasi Produktivitas RPG, Manajemen Layanan Kampus, Akselerator Karir Magang, dan Game Edukasi Interaktif.

---

## 🌟 Daftar Aplikasi Web

| No | Aplikasi | Kategori | Fitur Utama | Jalur Berkas |
| :---: | :--- | :--- | :--- | :--- |
| **-** | **Portal Utama (*Master Hub*)** | Master Directory | Pencarian cepat, filter kategori, direktori interaktif | [`index.html`](index.html) |
| **1** | **CuacaSmart (AI Companion)** | Meteorologi & Utilitas | Termometer visual dinamis, peringatan bawa payung, indeks UV, audio synth & voice assistant | [`cuaca-smart/`](cuaca-smart/index.html) |
| **2** | **LifeQuest: RPG Rutinitas** | Produktivitas & RPG | Gamifikasi habit & belajar, leveling XP, pertarungan bos UTS/UAS, reward koin | [`life-quest/`](life-quest/index.html) |
| **3** | **InternReady** | Karir & Magang | CV ATS Builder, simulator wawancara metode STAR, roadmap keahlian industri | [`intern-ready/`](intern-ready/index.html) |
| **4** | **RoomCheck IT Del** | Layanan Asrama | Pelaporan kerusakan fasilitas kamar (air, listrik, kunci, kebersihan) | [`room-check/`](room-check/index.html) |
| **5** | **Teman Seperjalanan** | Mobilitas Kampus | Radar GPS pulang bareng asrama malam hari, tebengan, kalkulator split bill bensin | [`teman-seperjalanan/`](teman-seperjalanan/index.html) |
| **6** | **SpotFinder IT Del** | Layanan Kampus | Pemantau okupansi meja/kursi kosong di Perpustakaan & Kantin secara live | [`spot-finder/`](spot-finder/index.html) |
| **7** | **LeaveCheck** | Utilitas Asrama | Asisten pengingat cerdas barang bawaan sebelum keluar kamar & peringatan payung | [`leave-check/`](leave-check/index.html) |
| **8** | **KataMaster** | Game & Edukasi | Pembelajaran kosa kata Duolingo-style, audio Text-to-Speech, streak harian | [`kata-master/`](kata-master/index.html) |
| **9** | **Math Adventure** | Game RPG Edukasi | Pertarungan RPG sihir matematika turn-based melawan monster angka | [`math-adventure/`](math-adventure/index.html) |
| **10** | **PolaMatika** | Game Logika & IQ | Puzzle deret aritmatika, geometri, barisan Fibonacci, matriks IQ 3x3 | [`polamatika/`](polamatika/index.html) |

---

## 🛠️ Teknologi yang Digunakan

- **Front-End**: HTML5 Semantik, Vanilla CSS3 (*Glassmorphism Design System*), Vanilla JavaScript (ES6+).
- **Eksternal API**: [Open-Meteo API](https://open-meteo.com/) (Data cuaca global tanpa API key) & W3C Geolocation API.
- **Grafis & Audio**: HTML5 Canvas (60 FPS particle weather system), Web Audio API Oscillator (Sound synthesizer), Web Speech API (Text-to-Speech bahasa Indonesia).
- **Tipografi & Ikon**: Google Fonts (*Plus Jakarta Sans*, *Outfit*, *Fredoka*) & FontAwesome 6.5.

---

## 💻 Cara Menjalankan Secara Lokal

### Opsi 1: Menjalankan dengan Local Server
Jalankan file server bawaan PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Buka browser dan akses: `http://localhost:5000/index.html`

### Opsi 2: Membuka Langsung di Browser
Cukup buka berkas `index.html` langsung dengan klik dua kali (*double-click*) pada browser pilihan Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, dll).

---

## 🌐 Menghosting Gratis di GitHub Pages

Repositori ini telah diatur agar dapat langsung di-deploy ke **GitHub Pages**:
1. Masuk ke repositori Anda di GitHub.
2. Buka tab **Settings** $\rightarrow$ **Pages**.
3. Pada bagian **Branch**, pilih `main` dan folder `/ (root)`, lalu klik **Save**.
4. Aplikasi Anda akan langsung aktif secara publik pada URL: `https://<username>.github.io/<nama-repo>/`

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan edukasi, produktivitas, dan portofolio pengembangan web. Bebas digunakan dan dikembangkan lebih lanjut.
