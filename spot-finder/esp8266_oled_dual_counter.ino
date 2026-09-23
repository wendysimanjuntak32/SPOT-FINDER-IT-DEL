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
 *    - Kaki 2 Push Button -----> GND (Menggunakan Internal PULLUP, Active LOW)
 *
 * 3. Push Button KELUAR (-1 Orang):
 *    - Kaki 1 Push Button -----> GPIO 12 (Pin D6 di NodeMCU)
 *    - Kaki 2 Push Button -----> GND (Menggunakan Internal PULLUP, Active LOW)
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

#include <ESP8266WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

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
#define PIN_BTN_MASUK  14 // GPIO 14 (D5 pada NodeMCU)
#define PIN_BTN_KELUAR 12 // GPIO 12 (D6 pada NodeMCU)

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==========================================
// 2. KONFIGURASI WIFI & MQTT BROKER
// ==========================================
const char* ssid        = "iPhone";           // Nama WiFi / Hotspot
const char* password    = "Akubisa2026!";     // Password WiFi
const char* mqtt_server = "76.13.19.250";     // IP Broker MQTT Kampus IT Del
const int   mqtt_port   = 1883;               // Port MQTT Standar
const char* mqtt_topic  = "itdel/gazebo/status"; // Topik Gazebo IT Del

WiFiClient espClient;
PubSubClient client(espClient);

// ==========================================
// 3. VARIABEL DATA KAPASITAS GAZEBO
// ==========================================
const String roomName = "Gazebo IT Del";
const int TOTAL_CAPACITY = 10; // Kapasitas maksimal Gazebo Danau Toba (10 Orang)

int orangDiDalam = 4;          // Jumlah orang saat ini
int kursiKosong  = 6;          // Kursi kosong = TOTAL_CAPACITY - orangDiDalam

// Debouncing Tombol Masuk & Keluar
int lastBtnMasukState  = HIGH;
int lastBtnKeluarState = HIGH;
unsigned long lastDebounceMasuk  = 0;
unsigned long lastDebounceKeluar = 0;
const unsigned long debounceDelay = 220; // 220ms debounce anti-double-click

// Status feedback pada OLED
String notifAction = "Ready";

// ==========================================
// 4. FUNGSI RENDER TAMPILAN OLED 128x64
// ==========================================
void renderOled() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // --- 1. HEADER IT DEL ---
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("SPOTFINDER IT DEL"));

  // Status WiFi & MQTT di pojok kanan atas
  display.setCursor(102, 0);
  if (WiFi.status() == WL_CONNECTED && client.connected()) {
    display.print(F("MQTT"));
  } else if (WiFi.status() == WL_CONNECTED) {
    display.print(F("WIFI"));
  } else {
    display.print(F("DISC"));
  }
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  // --- 2. NAMA SPOT / GAZEBO ---
  display.setTextSize(1);
  display.setCursor(0, 12);
  display.print(F("Lokasi: Gazebo Toba"));

  // --- 3. DISPLAY ANGKA KAPASITAS BESAR ---
  // Sisi Kiri: Jumlah Orang di dalam
  display.setTextSize(1);
  display.setCursor(0, 24);
  display.print(F("TERISI"));
  display.setTextSize(2);
  display.setCursor(4, 34);
  display.print(orangDiDalam);

  // Garis pemisah vertikal
  display.drawLine(52, 23, 52, 52, SSD1306_WHITE);

  // Sisi Kanan: Kursi Kosong
  display.setTextSize(1);
  display.setCursor(62, 24);
  display.print(F("KOSONG:"));
  display.setTextSize(2);
  display.setCursor(62, 34);
  display.print(kursiKosong);
  display.setTextSize(1);
  display.print(F("/"));
  display.print(TOTAL_CAPACITY);

  // --- 4. STATUS NOTIFIKASI & TOMBOL ---
  display.drawLine(0, 53, 128, 53, SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 56);
  display.print(F("Pin14:+1 | Pin12:-1 ["));
  display.print(notifAction.substring(0, 4));
  display.print(F("]"));

  display.display();
}

// ==========================================
// 5. FUNGSI PUBLISH DATA KE MQTT BROKER
// ==========================================
void publishStatus() {
  if (!client.connected()) return;

  // Hitung persentase terisi
  int percent = (orangDiDalam * 100) / TOTAL_CAPACITY;

  // Format JSON payload sesuai standar SpotFinder Web
  StaticJsonDocument<256> doc;
  doc["id"]          = "gazebo-1";
  doc["room"]        = "Gazebo View Danau Toba";
  doc["empty"]       = kursiKosong;
  doc["occupied"]    = orangDiDalam;
  doc["total"]       = TOTAL_CAPACITY;
  doc["percent"]     = percent;
  doc["lastAction"]  = notifAction;
  doc["device"]      = "ESP8266-Counter-OLED";
  doc["timestamp"]   = millis() / 1000;

  char buffer[256];
  serializeJson(doc, buffer);

  bool success = client.publish(mqtt_topic, buffer, true); // Retain = true
  if (success) {
    Serial.print(F(" [MQTT] Terkirim -> "));
    Serial.println(buffer);
  } else {
    Serial.println(F(" [MQTT] Gagal mengirim paket"));
  }
}

// ==========================================
// 6. MQTT CALLBACK (Jika ada update eksternal)
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print(F(" [MQTT Recv] Topik: "));
  Serial.println(topic);

  StaticJsonDocument<384> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error) {
    // Hindari echo loop jika pesan dari device ini sendiri
    const char* dev = doc["device"] | "";
    if (strcmp(dev, "ESP8266-Counter-OLED") != 0) {
      if (doc.containsKey("empty")) {
        kursiKosong = doc["empty"].as<int>();
        orangDiDalam = TOTAL_CAPACITY - kursiKosong;
        if (orangDiDalam < 0) orangDiDalam = 0;
        if (orangDiDalam > TOTAL_CAPACITY) orangDiDalam = TOTAL_CAPACITY;
        notifAction = "SyncWeb";
        renderOled();
      }
    }
  }
}

// ==========================================
// 7. KONEKSI KE MQTT BROKER
// ==========================================
void reconnectMQTT() {
  if (WiFi.status() != WL_CONNECTED) return;

  while (!client.connected()) {
    Serial.print(F(" Menghubungkan ke MQTT Broker ("));
    Serial.print(mqtt_server);
    Serial.print(F(")..."));

    String clientId = "ESP8266-SpotFinder-" + String(ESP.getChipId(), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println(F(" BERHASIL!"));
      client.subscribe(mqtt_topic);
      notifAction = "Online";
      renderOled();
      publishStatus();
    } else {
      Serial.print(F(" Gagal, rc="));
      Serial.print(client.state());
      Serial.println(F(" coba lagi dalam 3 detik..."));
      delay(3000);
      yield();
    }
  }
}

// ==========================================
// 8. SETUP UTAMA
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println(F("\n=============================================="));
  Serial.println(F("  SPOTFINDER IT DEL - ESP8266 DUAL COUNTER    "));
  Serial.println(F("=============================================="));

  // Inisialisasi Pin Tombol dengan PULLUP Internal
  pinMode(PIN_BTN_MASUK, INPUT_PULLUP);  // Pin 14
  pinMode(PIN_BTN_KELUAR, INPUT_PULLUP); // Pin 12

  // Inisialisasi I2C Wire untuk ESP8266 (SDA=4, SCL=5)
  Wire.begin(PIN_OLED_SDA, PIN_OLED_SCL);

  // Inisialisasi Display OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F(" [ERROR] OLED SSD1306 tidak ditemukan! Periksa wiring!"));
  } else {
    Serial.println(F(" [OK] OLED SSD1306 Siap."));
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 16);
    display.print(F("INSTITUT TEKNOLOGI"));
    display.setCursor(38, 28);
    display.print(F("DEL"));
    display.setCursor(18, 44);
    display.print(F("Menghubungkan WiFi.."));
    display.display();
  }

  // Koneksi WiFi ke Hotspot
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print(F(" Menghubungkan ke WiFi: "));
  Serial.println(ssid);

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 25) {
    delay(500);
    Serial.print(F("."));
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\n [OK] WiFi Tersambung!"));
    Serial.print(F(" IP Address: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("\n [WARN] WiFi gagal tersambung, tetap berjalan mode offline"));
  }

  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  // Tampilkan layar awal
  kursiKosong = TOTAL_CAPACITY - orangDiDalam;
  renderOled();
}

// ==========================================
// 9. LOOP UTAMA
// ==========================================
void loop() {
  // 1. Jaga koneksi MQTT
  if (WiFi.status() == WL_CONNECTED) {
    if (!client.connected()) {
      reconnectMQTT();
    }
    client.loop();
  }

  // 2. Baca Tombol MASUK (Pin 14 - Active LOW)
  int readingMasuk = digitalRead(PIN_BTN_MASUK);
  if (readingMasuk == LOW && lastBtnMasukState == HIGH) {
    if ((millis() - lastDebounceMasuk) > debounceDelay) {
      lastDebounceMasuk = millis();

      if (orangDiDalam < TOTAL_CAPACITY) {
        orangDiDalam++;
        kursiKosong = TOTAL_CAPACITY - orangDiDalam;
        notifAction = "+1 IN";
        Serial.println(F(" [ACTION] Tombol Pin 14 Ditekan -> Orang Masuk (+1)"));
        Serial.print(F("  -> Orang Terisi: "));
        Serial.print(orangDiDalam);
        Serial.print(F(" | Kursi Kosong: "));
        Serial.println(kursiKosong);

        renderOled();
        publishStatus();
      } else {
        notifAction = "FULL!";
        Serial.println(F(" [WARN] Gazebo sudah PENUH (10/10)!"));
        renderOled();
      }
    }
  }
  lastBtnMasukState = readingMasuk;

  // 3. Baca Tombol KELUAR (Pin 12 - Active LOW)
  int readingKeluar = digitalRead(PIN_BTN_KELUAR);
  if (readingKeluar == LOW && lastBtnKeluarState == HIGH) {
    if ((millis() - lastDebounceKeluar) > debounceDelay) {
      lastDebounceKeluar = millis();

      if (orangDiDalam > 0) {
        orangDiDalam--;
        kursiKosong = TOTAL_CAPACITY - orangDiDalam;
        notifAction = "-1 OUT";
        Serial.println(F(" [ACTION] Tombol Pin 12 Ditekan -> Orang Keluar (-1)"));
        Serial.print(F("  -> Orang Terisi: "));
        Serial.print(orangDiDalam);
        Serial.print(F(" | Kursi Kosong: "));
        Serial.println(kursiKosong);

        renderOled();
        publishStatus();
      } else {
        notifAction = "EMPTY";
        Serial.println(F(" [WARN] Gazebo sudah KOSONG (0/10)!"));
        renderOled();
      }
    }
  }
  lastBtnKeluarState = readingKeluar;

  // Jeda kecil loop agar hemat daya
  delay(15);
  yield();
}
