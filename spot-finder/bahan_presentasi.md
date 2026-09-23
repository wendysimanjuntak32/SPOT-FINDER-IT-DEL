# 🎤 BAHAN PRESENTASI PROYEK: SPOTFINDER IT DEL (IoT SMART COUNTER)

---

## 📌 SLIDE 1: JUDUL & IDENTITAS
* **Nama Aplikasi**: **SpotFinder IT Del** *(Smart Campus Space & Gazebo Counter)*
* **Pengembang**: Mahasiswa Institut Teknologi Del
* **Platform**: Web App Responsif + Hardware Mikrokontroler IoT (ESP8266 / ESP32 + Layar OLED)

> *"Solusi Cerdas Pemantau Ketersediaan Kursi dan Spot Belajar di Kampus IT Del Berbasis Internet of Things (IoT)."*

---

## 🎯 SLIDE 2: MENGAPA APLIKASI INI DIBUAT? (LATAR BELAKANG & MASALAH)

### ❓ Masalah Nyata yang Sering Dihadapi:
1. **Buang Waktu dan Tenaga**: Mahasiswa sering berjalan jauh ke Gazebo tepi Danau Toba atau Perpustakaan hanya untuk mendapati tempat tersebut sudah penuh.
2. **Informasi Tidak Real-Time**: Tidak ada papan informasi jarak jauh untuk mengetahui sisa kursi kosong di area terbuka kampus.
3. **Penumpukan Orang**: Tidak adanya sistem penghitung kapasitas membuat ruangan/gazebo sering melebihi batas kenyamanan belajar.

### 💡 Solusi yang Dihadirkan:
Sistem pintar yang menggabungkan **tombol fisik di lokasi (Mikrokontroler)** dengan **dashboard web di smartphone/laptop**, sehingga mahasiswa dapat mengecek sisa kursi kosong secara langsung dari mana saja tanpa harus mendatangi tempatnya terlebih dahulu.

---

## ⚙️ SLIDE 3: FUNGSI UTAMA APLIKASI
1. **Live Monitoring Keterisian**: Menampilkan jumlah orang di dalam dan sisa kursi kosong secara akurat.
2. **Dual-Button Smart Counter (Hardware)**: 
   - Tombol Masuk (Pin 14) untuk menambah hitungan orang (+1).
   - Tombol Keluar (Pin 12) untuk mengurangi hitungan orang (-1).
3. **Layar OLED di Lokasi**: Menampilkan angka keterisian langsung di gazebo/ruangan agar pengunjung setempat bisa melihatnya.
4. **Denah Kursi Interaktif (Seat Map)**: Mahasiswa dapat memilih dan mengamankan kursi langsung dari web.
5. **Sinkronisasi Otomatis Multi-Device**: Sinkronisasi instan berkecepatan milidetik menggunakan protokol **MQTT**.

---

## 🛠️ SLIDE 4: BAGAIMANA CARA APLIKASI INI DIBUAT? (ARSITEKTUR & CARA KERJA)

Sistem ini bekerja melalui 3 lapisan utama:

```
[ 🔘 Tombol Masuk/Keluar ] 
          ⬇️
[ 🧠 Mikrokontroler ESP8266 / ESP32 ] ──> [ 📺 Layar OLED Lokal (I2C) ]
          ⬇️ (WiFi)
[ ☁️ Broker MQTT (76.13.19.250) ]
          ⬇️ (WebSockets)
[ 📱 Dashboard Web SpotFinder di HP / Laptop ]
```

1. **Hardware (Perangkat Keras)**:
   - **ESP8266 / ESP32**: Otak pemroses data dan pengirim data via WiFi.
   - **Push Button (Pin 14 & 12)**: Sensor input manual untuk orang masuk dan keluar.
   - **Layar OLED I2C**: Menampilkan angka secara lokal di lokasi spot.
2. **Jalur Komunikasi (Protokol MQTT)**:
   - Menggunakan protokol IoT ringan **MQTT** yang sangat cepat dan hemat kuota data.
3. **Software Frontend (Aplikasi Web)**:
   - Dibangun dengan **HTML5, Modern CSS (Warna Resmi Navy IT Del & Aksen Danau Toba), dan JavaScript**.
   - Terhubung langsung ke Broker MQTT via WebSocket.

---

## 🚀 SLIDE 5: POTENSI PENGEMBANGAN DI MASA DEPAN (SCALABILITY)

Aplikasi ini tidak hanya untuk gazebo kampus, konsep dasarnya (**Smart Capacity & Flow Counter**) sangat fleksibel dan dapat dikembangkan untuk berbagai tempat umum:

1. **🅿️ Smart Parking System (Tempat Parkir)**:
   - Dihubungkan dengan sensor palang pintu mobil/motor. Pengendara bisa mengecek sisa slot parkir kosong lewat HP sebelum masuk.
2. **🏥 Rumah Sakit & Puskesmas**:
   - Menghitung antrean pasien di poli rawat jalan atau ketersediaan bed kamar rawat inap yang bisa dipantau keluarga dari smartphone.
3. **🚶 Antrean & Tempat Umum (Bank, Samsat, Kafe, Restoran)**:
   - Menghindari antrean berkerumun dengan memberikan tiket digital dan live status kuota antrean ke HP pengunjung.
4. **🤖 Otomatisasi dengan Sensor Modern**:
   - Mengganti push button manual dengan **Sensor Ultrasonic, Infrared (IR Break-beam), atau Kamera AI Penghitung Orang Otomatis**.

---

## 📝 SLIDE 6: KESIMPULAN

* Proyek **SpotFinder IT Del** membuktikan bahwa kombinasi **Mikrokontroler IoT murah (ESP8266/ESP32)** dan **Aplikasi Web Modern** dapat memecahkan masalah efisiensi waktu mahasiswa di kampus.
* Sistem ini andal, mudah digunakan, berbiaya terjangkau, dan sangat mudah diperluas ke berbagai kebutuhan industri modern.

---
*(Selesai - Buka Sesi Tanya Jawab)*
