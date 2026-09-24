/*
 * ======================================================================================
 * PROYEK: SPOTFINDER IT DEL - ESP8266 TWO-WAY COUNTER + OLED DISPLAY I2C
 * MIKROKONTROLER: ESP8266 (NodeMCU v2/v3, Wemos D1 Mini, atau ESP-12F)
 * DISPLAY: OLED I2C 0.96 Inch SSD1306 (128x64 Pixel)
 * INPUT:
 *   - Tombol MASUK (Orang Masuk / +1)  : GPIO 14 (Pin D5 di NodeMCU)
 *   - Tombol KELUAR (Orang Keluar / -1): GPIO 12 (Pin D6 di NodeMCU)
 * PROTOKOL: MQTT (Broker IP: 76.13.19.250, Port: 1883)
 * TOPIK: itdel/gazebo/status
 * KAPASITAS MAKSIMUM: 10 ORANG
 * ======================================================================================
 *
 * 🔌 SKEMA WIRING / PINOUT ESP8266 (NodeMCU / Wemos D1 Mini):
 * --------------------------------------------------------------------------------------
 * 1. OLED Display I2C (SSD1306):
 *    - OLED VCC  -----> ESP8266 3V3 (atau 5V/VIN)
 *    - OLED GND  -----> ESP8266 GND
 *    - OLED SCL  -----> ESP8266 GPIO 5 (Pin D1 di NodeMCU / Wemos D1 Mini)
 *    - OLED SDA  -----> ESP8266 GPIO 4 (Pin D2 di NodeMCU / Wemos D1 Mini)
 *
 * 2. Push Button MASUK (+1 Orang):
 *    - Kaki 1 Push Button -----> GPIO 14 (Pin D5 di NodeMCU)
 *    - Kaki 2 Push Button -----> GND (Internal PULLUP, Active LOW)
 *
 * 3. Push Button KELUAR (-1 Orang):
 *    - Kaki 1 Push Button -----> GPIO 12 (Pin D6 di NodeMCU)
 *    - Kaki 2 Push Button -----> GND (Internal PULLUP, Active LOW)
 * --------------------------------------------------------------------------------------
 *
 * 📦 LIBRARY YANG DIBUTUHKAN (Install via Arduino Library Manager):
 * 1. ESP8266WiFi (Bawaan Board Package ESP8266)
 * 2. Adafruit SSD1306 (oleh Adafruit)
 * 3. Adafruit GFX Library (oleh Adafruit)
 * 4. PubSubClient (oleh Nick O'Leary)
 * 5. ArduinoJson (v6.x atau v7.x oleh Benoit Blanchon)
 * ======================================================================================
 */

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>

// ==========================================
// 1. KONFIGURASI PIN DAN OLED DISPLAY
// ==========================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C // Alamat default I2C OLED SSD1306 (0x3C / 0x3D)

// Pin Hardware I2C ESP8266 default (D2=SDA, D1=SCL)
#define PIN_OLED_SDA 4 // GPIO 4 (D2)
#define PIN_OLED_SCL 5 // GPIO 5 (D1)

// Definisi Pin Tombol Masuk & Keluar
#define PIN_BTN_MASUK 14  // GPIO 14 (Pin D5 pada NodeMCU)
#define PIN_BTN_KELUAR 12 // GPIO 12 (Pin D6 pada NodeMCU)

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==========================================
// 2. KONFIGURASI WIFI & MQTT BROKER
// ==========================================
// Ganti ssid dan password sesuai WiFi / Hotspot yang digunakan:
const char *ssid = "STUDIO";                    // Nama WiFi / Hotspot HP
const char *password = "Bait695mash215";        // Password WiFi
const char *mqtt_server = "76.13.19.250";       // IP Broker MQTT Kampus IT Del
const int mqtt_port = 1883;                     // Port MQTT TCP
const char *mqtt_topic = "itdel/gazebo/status"; // Topik Gazebo IT Del

WiFiClient espClient;
PubSubClient client(espClient);

// ==========================================
// 3. VARIABEL DATA KAPASITAS GAZEBO & NOTIFIKASI
// ==========================================
const String roomName = "Gazebo IT Del";
const int TOTAL_CAPACITY =
    10; // Kapasitas maksimal Gazebo Danau Toba (10 Orang)

int orangDiDalam = 4; // Jumlah orang saat ini
int kursiKosong = 6;  // Kursi kosong = TOTAL_CAPACITY - orangDiDalam

// Debouncing Tombol Masuk & Keluar
int lastBtnMasukState = HIGH;
int lastBtnKeluarState = HIGH;
unsigned long lastDebounceMasuk = 0;
unsigned long lastDebounceKeluar = 0;
const unsigned long debounceDelay = 220; // 220ms debounce anti-double-click

// Status & Variabel Notifikasi Text Dinamis
String notifTitle = "SIAP DIGUNAKAN";
String notifAction = "Ready";
String notifSub = "Gazebo Danau Toba";
unsigned long lastNotifTime = 0;
const unsigned long NOTIF_DURATION =
    3500; // 3.5 detik durasi highlight notifikasi di OLED
bool isNotifActive = false;

// ==========================================
// 4. FUNGSI RENDER TAMPILAN OLED 128x64
// ==========================================
void renderOled() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // --- 1. HEADER IT DEL & STATUS KONEKSI ---
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("SPOTFINDER DEL"));

  // Status WiFi & MQTT di pojok kanan atas
  display.setCursor(80, 0);
  if (WiFi.status() == WL_CONNECTED && client.connected()) {
    display.print(F("[MQTT]"));
  } else if (WiFi.status() == WL_CONNECTED) {
    display.print(F("[WIFI]"));
  } else {
    display.print(F("[OFF]"));
  }
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  // --- 2. BANNER NOTIFIKASI TEKS (HIGHLIGHT) ---
  bool showingNotif =
      (millis() - lastNotifTime < NOTIF_DURATION) && isNotifActive;

  if (showingNotif) {
    // Kotak Invert Putih untuk Sorotan Notifikasi Teks
    display.fillRect(0, 11, 128, 11, SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK,
                         SSD1306_WHITE); // Teks Hitam di latar Putih
    display.setTextSize(1);

    if (notifAction == "+1 MASUK") {
      display.setCursor(4, 13);
      display.print(F(">> ADA ORANG MASUK <<"));
    } else if (notifAction == "-1 KELUAR") {
      display.setCursor(2, 13);
      display.print(F(">> ADA ORANG KELUAR<<"));
    } else if (notifAction == "FULL 10/10") {
      display.setCursor(4, 13);
      display.print(F("! GAZEBO PENUH 10/10 !"));
    } else if (notifAction == "KOSONG 0/10") {
      display.setCursor(4, 13);
      display.print(F("! GAZEBO KOSONG 0/10 !"));
    } else {
      display.setCursor(4, 13);
      display.print(notifTitle.substring(0, 20));
    }
  } else {
    // Tampilan Normal Standby
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(0, 13);
    display.print(F("Lokasi: Gazebo Toba"));
  }

  // Kembalikan warna teks normal putih
  display.setTextColor(SSD1306_WHITE);

  // --- 3. DISPLAY ANGKA KAPASITAS BESAR & JELAS ---
  // Sisi Kiri (X: 0-56): Jumlah Orang di Dalam (TERISI)
  display.setTextSize(1);
  display.setCursor(2, 25);
  display.print(F("TERISI"));
  display.setTextSize(2);
  display.setCursor(6, 35);
  display.print(orangDiDalam);
  display.setTextSize(1);
  display.setCursor(34, 40);
  display.print(F("Org"));

  // Garis Pemisah Vertikal di Tengah
  display.drawLine(58, 24, 58, 51, SSD1306_WHITE);

  // Sisi Kanan (X: 64-127): Kursi Kosong (KOSONG)
  display.setTextSize(1);
  display.setCursor(64, 25);
  display.print(F("SISA KOSONG"));
  display.setTextSize(2);
  display.setCursor(68, 35);
  display.print(kursiKosong);
  display.setTextSize(1);
  display.setCursor(96, 40);
  display.print(F("/10"));

  // --- 4. FOOTER BAR (STATUS NOTIFIKASI & PETUNJUK TOMBOL) ---
  display.drawLine(0, 53, 128, 53, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 56);

  if (showingNotif) {
    if (notifAction == "+1 MASUK") {
      display.print(F("[+1] In:"));
      display.print(orangDiDalam);
      display.print(F(" | Sisa:"));
      display.print(kursiKosong);
      display.print(F(""));
    } else if (notifAction == "-1 KELUAR") {
      display.print(F("[-1] Out:"));
      display.print(orangDiDalam);
      display.print(F(" | Sisa:"));
      display.print(kursiKosong);
      display.print(F(""));
    } else {
      display.print(notifTitle.substring(0, 21));
    }
  } else {
    display.print(F("D5:+1 In  | D6:-1 Out"));
  }

  display.display();
}

// ==========================================
// 5. FUNGSI PUBLISH DATA KE MQTT BROKER
// ==========================================
void publishStatus() {
  int percent = (orangDiDalam * 100) / TOTAL_CAPACITY;

  // Format JSON payload lengkap
  StaticJsonDocument<384> doc;
  doc["id"] = "gazebo-1";
  doc["room"] = "Gazebo View Danau Toba";
  doc["empty"] = kursiKosong;
  doc["kosong"] = kursiKosong;
  doc["occupied"] = orangDiDalam;
  doc["terisi"] = orangDiDalam;
  doc["total"] = TOTAL_CAPACITY;
  doc["percent"] = percent;
  doc["lastAction"] = notifAction;
  doc["notifTitle"] = notifTitle;
  doc["notification"] = notifTitle + " | Terisi: " + String(orangDiDalam) +
                        " Orang, Sisa: " + String(kursiKosong) + " Kursi";
  doc["device"] = "ESP8266-Counter-OLED";
  doc["timestamp"] = millis() / 1000;

  char buffer[384];
  serializeJson(doc, buffer);

  if (client.connected()) {
    bool success = client.publish(mqtt_topic, buffer, true); // Retain = true
    if (success) {
      Serial.print(F("✅ [MQTT PUBLISH SUKSES] -> "));
      Serial.println(buffer);
    } else {
      Serial.println(F("❌ [MQTT PUBLISH GAGAL] Periksa ukuran paket buffer!"));
    }
  } else {
    Serial.println(
        F("⚠️ [MQTT OFFLINE] Terhubung ke WiFi namun MQTT belum siap."));
  }
}

// ==========================================
// 6. MQTT CALLBACK (Sinkronisasi dari Web / Eksternal)
// ==========================================
void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print(F("📡 [MQTT Recv] Topik: "));
  Serial.println(topic);

  StaticJsonDocument<384> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error) {
    const char *dev = doc["device"] | "";
    // Abaikan jika pesan berasal dari ESP8266 ini sendiri
    if (strcmp(dev, "ESP8266-Counter-OLED") != 0) {
      if (doc.containsKey("empty") || doc.containsKey("kosong") ||
          doc.containsKey("occupied") || doc.containsKey("terisi")) {
        if (doc.containsKey("occupied")) {
          orangDiDalam =
              constrain(doc["occupied"].as<int>(), 0, TOTAL_CAPACITY);
          kursiKosong = TOTAL_CAPACITY - orangDiDalam;
        } else if (doc.containsKey("terisi")) {
          orangDiDalam = constrain(doc["terisi"].as<int>(), 0, TOTAL_CAPACITY);
          kursiKosong = TOTAL_CAPACITY - orangDiDalam;
        } else if (doc.containsKey("empty")) {
          kursiKosong = constrain(doc["empty"].as<int>(), 0, TOTAL_CAPACITY);
          orangDiDalam = TOTAL_CAPACITY - kursiKosong;
        } else if (doc.containsKey("kosong")) {
          kursiKosong = constrain(doc["kosong"].as<int>(), 0, TOTAL_CAPACITY);
          orangDiDalam = TOTAL_CAPACITY - kursiKosong;
        }

        notifAction = "SyncWeb";
        notifTitle = "SINKRON DARI WEB";
        lastNotifTime = millis();
        isNotifActive = true;

        Serial.println(
            F("\n========================================================"));
        Serial.println(
            F("🔄 [SINKRONISASI] DATA DIPERBARUI DARI WEB DASHBOARD"));
        Serial.print(F("👥 Jumlah Terisi : "));
        Serial.print(orangDiDalam);
        Serial.println(F(" Orang"));
        Serial.print(F("🪑 Sisa Kosong   : "));
        Serial.print(kursiKosong);
        Serial.println(F(" Kursi"));
        Serial.println(
            F("========================================================"));

        renderOled();
      }
    }
  }
}

// Variabel Non-Blocking MQTT Reconnect
unsigned long lastMqttReconnectAttempt = 0;

// ==========================================
// 7. KONEKSI KE MQTT BROKER (NON-BLOCKING)
// ==========================================
void reconnectMQTT() {
  if (WiFi.status() != WL_CONNECTED)
    return;
  if (client.connected())
    return;

  unsigned long now = millis();
  if (now - lastMqttReconnectAttempt > 3500) {
    lastMqttReconnectAttempt = now;
    Serial.print(F(" [MQTT] Menghubungkan ke Broker 76.13.19.250:1883... "));

    String clientId = "ESP8266-Gazebo-" + String(ESP.getChipId(), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println(F("BERHASIL!"));
      client.subscribe(mqtt_topic);
      client.subscribe("itdel/gazebo/#");
      notifAction = "Online";
      notifTitle = "TERHUBUNG MQTT";
      lastNotifTime = millis();
      isNotifActive = true;
      renderOled();
      publishStatus();
    } else {
      Serial.print(F("Gagal! rc="));
      Serial.print(client.state());
      Serial.println(F(" (Coba lagi dalam 3.5 detik)"));
    }
  }
}

// ==========================================
// 8. SETUP UTAMA
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println(
      F("\n========================================================"));
  Serial.println(F("  SPOTFINDER IT DEL - ESP8266 TWO-WAY SMART COUNTER     "));
  Serial.println(F("  Sistem Monitoring Orang Masuk/Keluar & OLED Display   "));
  Serial.println(F("========================================================"));

  // Inisialisasi Pin Tombol dengan PULLUP Internal
  pinMode(PIN_BTN_MASUK, INPUT_PULLUP);  // Pin D5 (GPIO 14)
  pinMode(PIN_BTN_KELUAR, INPUT_PULLUP); // Pin D6 (GPIO 12)

  // Inisialisasi I2C Wire untuk ESP8266 (SDA = GPIO 4 / Pin D2, SCL = GPIO 5 /
  // Pin D1)
  Wire.begin(PIN_OLED_SDA, PIN_OLED_SCL);
  Wire.setClock(100000); // 100kHz standard I2C clock

  // Inisialisasi Display OLED
  bool oledFound = false;
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledFound = true;
    Serial.println(F(" [OK] OLED SSD1306 Ditemukan pada Alamat: 0x3C"));
  } else if (display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
    oledFound = true;
    Serial.println(F(" [OK] OLED SSD1306 Ditemukan pada Alamat: 0x3D"));
  } else {
    Serial.println(
        F(" [WARN] OLED SSD1306 Tidak Ditemukan! Periksa kabel SDA/SCL."));
  }

  // Inisialisasi Angka Awal
  kursiKosong = TOTAL_CAPACITY - orangDiDalam;
  notifTitle = "SISTEM SIAP";
  notifAction = "Ready";
  lastNotifTime = millis();
  isNotifActive = false;

  // LANGSUNG TAMPILKAN ANGKA PADA LAYAR OLED TANPA TUNGGU WIFI
  renderOled();

  // Koneksi WiFi ke Hotspot
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  WiFi.begin(ssid, password);
  Serial.print(F(" Menghubungkan ke WiFi: "));
  Serial.println(ssid);

  // Setup MQTT & Perbesar Buffer PubSubClient ke 512 Byte
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
  client.setBufferSize(
      512); // PENTING: Wajib 512 byte agar payload JSON tidak terpotong
  client.setKeepAlive(15);
  client.setSocketTimeout(5);
}

// ==========================================
// 9. LOOP UTAMA
// ==========================================
void loop() {
  // 1. Cek dan Jaga Koneksi WiFi & MQTT
  static unsigned long lastWifiAttempt = 0;
  static bool lastWifiStatus = false;

  if (WiFi.status() == WL_CONNECTED) {
    if (!lastWifiStatus) {
      lastWifiStatus = true;
      Serial.println(
          F("\n========================================================"));
      Serial.println(F("✅ [WIFI] BERHASIL TERHUBUNG KE JARINGAN!"));
      Serial.print(F("📍 IP ESP8266 : "));
      Serial.println(WiFi.localIP());
      Serial.print(F("📶 Sinyal RSSI: "));
      Serial.print(WiFi.RSSI());
      Serial.println(F(" dBm"));
      Serial.println(
          F("========================================================"));
      renderOled();
    }

    if (!client.connected()) {
      reconnectMQTT();
    } else {
      client.loop();
    }
  } else {
    lastWifiStatus = false;
    if (millis() - lastWifiAttempt > 6000) {
      lastWifiAttempt = millis();
      Serial.print(F(" [WIFI] Menghubungkan ke SSID: "));
      Serial.print(ssid);
      Serial.print(F(" (Status: "));
      Serial.print(WiFi.status());
      Serial.println(F(")..."));
      WiFi.begin(ssid, password);
    }
  }

  // 2. Baca Tombol MASUK (Pin 14 / D5 - Active LOW)
  int readingMasuk = digitalRead(PIN_BTN_MASUK);
  if (readingMasuk == LOW && lastBtnMasukState == HIGH) {
    if ((millis() - lastDebounceMasuk) > debounceDelay) {
      lastDebounceMasuk = millis();

      if (orangDiDalam < TOTAL_CAPACITY) {
        orangDiDalam++;
        kursiKosong = TOTAL_CAPACITY - orangDiDalam;

        notifAction = "+1 MASUK";
        notifTitle = "ADA ORANG MASUK (+1)";
        lastNotifTime = millis();
        isNotifActive = true;

        // Cetak Tulisan Pemberitahuan dan Jumlah Angka ke Serial Monitor
        Serial.println(
            F("\n========================================================"));
        Serial.println(
            F("📢 [PEMBERITAHUAN TULISAN] ADA ORANG MASUK (+1 ORANG)"));
        Serial.print(F("👥 Jumlah Terisi      : "));
        Serial.print(orangDiDalam);
        Serial.println(F(" Orang"));
        Serial.print(F("🪑 Sisa Kursi Kosong  : "));
        Serial.print(kursiKosong);
        Serial.println(F(" Kursi"));
        Serial.print(F("🏛️ Total Kapasitas    : "));
        Serial.print(TOTAL_CAPACITY);
        Serial.println(F(" Orang"));
        Serial.print(F("📊 Persentase Terisi  : "));
        Serial.print((orangDiDalam * 100) / TOTAL_CAPACITY);
        Serial.println(F("%"));
        Serial.println(
            F("========================================================"));

        renderOled();
        publishStatus();
      } else {
        notifAction = "FULL 10/10";
        notifTitle = "GAZEBO SUDAH PENUH!";
        lastNotifTime = millis();
        isNotifActive = true;

        Serial.println(
            F("\n========================================================"));
        Serial.println(
            F("⚠️ [PEMBERITAHUAN] GAZEBO PENUH! Kuota 10/10 tercapai!"));
        Serial.println(
            F("========================================================"));

        renderOled();
      }
    }
  }
  lastBtnMasukState = readingMasuk;

  // 3. Baca Tombol KELUAR (Pin 12 / D6 - Active LOW)
  int readingKeluar = digitalRead(PIN_BTN_KELUAR);
  if (readingKeluar == LOW && lastBtnKeluarState == HIGH) {
    if ((millis() - lastDebounceKeluar) > debounceDelay) {
      lastDebounceKeluar = millis();

      if (orangDiDalam > 0) {
        orangDiDalam--;
        kursiKosong = TOTAL_CAPACITY - orangDiDalam;

        notifAction = "-1 KELUAR";
        notifTitle = "ADA ORANG KELUAR (-1)";
        lastNotifTime = millis();
        isNotifActive = true;

        // Cetak Tulisan Pemberitahuan dan Jumlah Angka ke Serial Monitor
        Serial.println(
            F("\n========================================================"));
        Serial.println(
            F("📢 [PEMBERITAHUAN TULISAN] ADA ORANG KELUAR (-1 ORANG)"));
        Serial.print(F("👥 Jumlah Terisi      : "));
        Serial.print(orangDiDalam);
        Serial.println(F(" Orang"));
        Serial.print(F("🪑 Sisa Kursi Kosong  : "));
        Serial.print(kursiKosong);
        Serial.println(F(" Kursi"));
        Serial.print(F("🏛️ Total Kapasitas    : "));
        Serial.print(TOTAL_CAPACITY);
        Serial.println(F(" Orang"));
        Serial.print(F("📊 Persentase Terisi  : "));
        Serial.print((orangDiDalam * 100) / TOTAL_CAPACITY);
        Serial.println(F("%"));
        Serial.println(
            F("========================================================"));

        renderOled();
        publishStatus();
      } else {
        notifAction = "KOSONG 0/10";
        notifTitle = "GAZEBO SUDAH KOSONG!";
        lastNotifTime = millis();
        isNotifActive = true;

        Serial.println(
            F("\n========================================================"));
        Serial.println(F("ℹ️ [PEMBERITAHUAN] GAZEBO KOSONG! (0/10 Orang)"));
        Serial.println(
            F("========================================================"));

        renderOled();
      }
    }
  }
  lastBtnKeluarState = readingKeluar;

  // 4. Auto-Reset Highlight Notifikasi setelah durasi selesai agar layar
  // kembali bersih
  static unsigned long lastResetCheck = 0;
  if (millis() - lastResetCheck > 500) {
    lastResetCheck = millis();
    if (isNotifActive && (millis() - lastNotifTime >= NOTIF_DURATION)) {
      isNotifActive = false;
      renderOled();
    }
  }

  // Jeda kecil loop agar hemat daya
  delay(15);
  yield();
}
