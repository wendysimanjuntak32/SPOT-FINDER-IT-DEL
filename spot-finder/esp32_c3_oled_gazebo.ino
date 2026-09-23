/*
 * ======================================================================================
 * PROYEK: SPOTFINDER IT DEL - GAZEBO STATUS OLED MONITOR
 * MIKROKONTROLER: ESP32-C3 SuperMini
 * DISPLAY: OLED I2C 0.96 Inch SSD1306 (128x64 Pixel)
 * PROTOKOL: MQTT (Broker IP: 76.13.19.250, Port: 1883)
 * TOPIK: itdel/gazebo/status
 * ======================================================================================
 *
 * WIRING PINOUT ESP32-C3 SuperMini ke OLED I2C:
 * ------------------------------------------------
 * OLED GND  -----> ESP32-C3 GND
 * OLED VCC  -----> ESP32-C3 3V3 atau 5V
 * OLED SCL  -----> ESP32-C3 GPIO 9 (Pin 9)
 * OLED SDA  -----> ESP32-C3 GPIO 8 (Pin 8)
 * ------------------------------------------------
 *
 * LIBRARY YANG DIBUTUHKAN (Install via Arduino Library Manager):
 * 1. Adafruit SSD1306 (oleh Adafruit)
 * 2. Adafruit GFX Library (oleh Adafruit)
 * 3. PubSubClient (oleh Nick O'Leary)
 * 4. ArduinoJson (oleh Benoit Blanchon)
 * ======================================================================================
 */

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <Wire.h>

// ==========================================
// 1. KONFIGURASI LAYAR OLED & TOMBOL BOOT
// ==========================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C // Alamat I2C umum OLED SSD1306 (0x3C atau 0x3D)

// Pin I2C Hardware ESP32-C3 SuperMini (SDA: 8, SCL: 9 atau 5)
#define I2C_SDA 8
#define I2C_SCL 9

// Tombol BOOT pada ESP32-C3 SuperMini terhubung ke GPIO 9 (Active LOW)
#define BUTTON_BOOT_PIN 9

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==========================================
// 2. KONFIGURASI WIFI & MQTT BROKER
// ==========================================
const char *ssid = "iPhone";           // Hotspot / WiFi yang sedang tersambung
const char *password = "Akubisa2026!"; // Password WiFi
const char *mqtt_server = "76.13.19.250";       // IP Broker MQTT
const int mqtt_port = 1883;                     // Port MQTT Standar
const char *mqtt_topic = "itdel/gazebo/status"; // Topik MQTT Gazebo IT Del

WiFiClient espClient;
PubSubClient client(espClient);

// Variabel data terkini
String currentRoom = "Gazebo Toba";
int currentEmpty = 12;   // Jumlah kursi kosong
int currentTotal = 20;   // Total kapasitas
int currentOccupied = 8; // Jumlah orang saat ini di Gazebo (Total - Empty)
int currentPercent = 40;

// Variabel Debouncing Tombol BOOT
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 250; // Delay debouncing 250ms

// ==========================================
// 3. FUNGSI RENDER TAMPILAN OLED 128x64
// ==========================================
void renderOledDisplay(String roomName, int emptySeats, int totalSeats,
                       int fillPercent, String statusMsg) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // --- Header Bar ---
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print(F("SPOTFINDER IT DEL"));

  // Ikon / Indikator WiFi di pojok kanan atas
  display.setCursor(108, 0);
  display.print(WiFi.status() == WL_CONNECTED ? F("OK") : F("NO"));
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  // --- Nama Ruangan / Gazebo ---
  display.setCursor(0, 13);
  display.setTextSize(1);
  display.print(roomName.substring(0, 20));

  // --- Angka Ketersediaan Besar & Jumlah Orang ---
  display.setCursor(0, 25);
  display.setTextSize(2);
  display.print(emptySeats);
  display.setTextSize(1);
  display.print(F("/"));
  display.print(totalSeats);
  display.print(F(" KOSONG"));

  // Subtitle: Orang yang ada di Gazebo
  display.setCursor(0, 42);
  display.setTextSize(1);
  int terisi = totalSeats - emptySeats;
  display.print(F("Ada: "));
  display.print(terisi);
  display.print(F(" org ("));
  display.print(fillPercent);
  display.print(F("%)"));

  // --- Progress Bar Visual ---
  display.drawRect(0, 52, 128, 4, SSD1306_WHITE);
  int barWidth = map(fillPercent, 0, 100, 0, 124);
  display.fillRect(2, 53, barWidth, 2, SSD1306_WHITE);

  // --- Status Footer Bar ---
  display.setCursor(0, 57);
  display.setTextSize(1);
  display.print(F("[BOOT:+1 Org] "));
  display.print(statusMsg);

  display.display();
}

// ==========================================
// 4. PUBLISH UPDATE KE MQTT BROKER (76.13.19.250)
// ==========================================
void publishGazeboStatus(String actionSource) {
  StaticJsonDocument<300> doc;
  doc["ruangan"] = currentRoom;
  doc["kosong"] = currentEmpty;
  doc["total"] = currentTotal;
  doc["terisi"] = currentTotal - currentEmpty;
  doc["persen"] = currentPercent;
  doc["source"] = actionSource;

  char jsonBuffer[300];
  serializeJson(doc, jsonBuffer);

  if (client.connected()) {
    client.publish(mqtt_topic, jsonBuffer, true); // Retain = true
    Serial.println(">> [MQTT PUBLISH BERHASIL ke 76.13.19.250]");
    Serial.println(jsonBuffer);
  } else {
    Serial.println(">> [MQTT GAGAL] Klien belum terhubung.");
  }
}

// ==========================================
// 5. KONEKSI KE WIFI
// ==========================================
void setup_wifi() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println(F("Koneksi WiFi:"));
  display.println(ssid);
  display.display();

  Serial.print("Menghubungkan ke ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 30) {
    delay(500);
    Serial.print(".");
    display.print(F("."));
    display.display();
    retry++;
  }

  display.clearDisplay();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Terhubung!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    display.setCursor(0, 10);
    display.println(F("WiFi Terhubung!"));
    display.println(WiFi.localIP());
    display.display();
  } else {
    display.setCursor(0, 10);
    display.println(F("WiFi Gagal!"));
    display.display();
  }
  delay(1200);
}

// ==========================================
// 6. CALLBACK PENERIMA PESAN MQTT DARI WEB
// ==========================================
void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("----------------------------------------");
  Serial.print("Pesan diterima [Topik: ");
  Serial.print(topic);
  Serial.println("]");
  Serial.println("Payload: " + message);

  // Parsing JSON dari Web
  StaticJsonDocument<300> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error) {
    // Hindari looping jika pesan berasal dari tombol ESP32 sendiri
    const char *source = doc["source"] | "";
    if (String(source) == "ESP32_BOOT_BUTTON") {
      return;
    }

    currentRoom = doc["ruangan"] | "Gazebo Danau Toba";
    currentEmpty = doc["kosong"] | 0;
    currentTotal = doc["total"] | 20;
    currentOccupied = currentTotal - currentEmpty;
    currentPercent =
        doc["persen"] | (int)(((float)currentOccupied / currentTotal) * 100);

    // Render ke Layar OLED secara Real-Time
    renderOledDisplay(currentRoom, currentEmpty, currentTotal, currentPercent,
                      "SYNC:WEB");
  } else {
    Serial.println("Gagal parsing JSON!");
  }
}

// ==========================================
// 7. RECONNECT MQTT JIKA TERPUTUS
// ==========================================
void reconnectMqtt() {
  while (!client.connected()) {
    Serial.print("Menghubungi MQTT Broker 76.13.19.250...");

    String clientId = "ESP32C3_GazeboClient-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println(" Terhubung!");
      client.subscribe(mqtt_topic);

      // Update status tampilan OLED
      renderOledDisplay(currentRoom, currentEmpty, currentTotal, currentPercent,
                        "MQTT:OK");
    } else {
      Serial.print(" Gagal, rc=");
      Serial.print(client.state());
      Serial.println(" Coba lagi dalam 3 detik...");

      renderOledDisplay(currentRoom, currentEmpty, currentTotal, currentPercent,
                        "MQTT:RETRY");
      delay(3000);
    }
  }
}

// ==========================================
// 8. FUNGSI CEK TOMBOL BOOT DITEKAN (+1 ORANG)
// ==========================================
void checkBootButton() {
  int reading = digitalRead(BUTTON_BOOT_PIN);

  // Cek apakah tombol ditekan (Active LOW: LOW saat ditekan)
  if (reading == LOW && lastButtonState == HIGH) {
    if ((millis() - lastDebounceTime) > debounceDelay) {
      lastDebounceTime = millis();

      Serial.println(
          "\n[TOMBOL BOOT DITEKAN!] Menambahkan 1 orang di Gazebo IT Del...");

      // Jika masih ada kursi kosong, kurangi 1 kursi kosong (artinya orang
      // bertambah 1)
      if (currentEmpty > 0) {
        currentEmpty--;
      } else {
        Serial.println("Gazebo sudah penuh kapasitas maksimal!");
      }

      currentOccupied = currentTotal - currentEmpty;
      currentPercent = (int)(((float)currentOccupied / currentTotal) * 100);

      // Tampilkan notifikasi di OLED
      renderOledDisplay(currentRoom, currentEmpty, currentTotal, currentPercent,
                        "+1 ORANG!");

      // Publish update ke MQTT Broker 76.13.19.250 agar Web langsung ter-update
      publishGazeboStatus("ESP32_BOOT_BUTTON");
    }
  }

  lastButtonState = reading;
}

// ==========================================
// 9. SETUP UTAMA
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(500);

  // Konfigurasi Pin Tombol BOOT sebagai Input Pullup
  pinMode(BUTTON_BOOT_PIN, INPUT_PULLUP);

  // Inisialisasi I2C Wire untuk ESP32-C3 SuperMini (SDA=8, SCL=9)
  Wire.begin(I2C_SDA, I2C_SCL);

  // Inisialisasi Display OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("Gagal menemukan layar OLED SSD1306!"));
    for (;;)
      ;
  }

  // Tampilan Booting Awal
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println(F("ESP32-C3 SUPERMINI"));
  display.println(F("SpotFinder IT Del"));
  display.println(F("Broker: 76.13.19.250"));
  display.setCursor(0, 45);
  display.println(F("Tombol BOOT: +1 Org"));
  display.display();
  delay(1500);

  // Hubungkan WiFi
  setup_wifi();

  // Konfigurasi Server MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  // Hitung initial persen
  currentOccupied = currentTotal - currentEmpty;
  currentPercent = (int)(((float)currentOccupied / currentTotal) * 100);

  // Render Display Pertama
  renderOledDisplay(currentRoom, currentEmpty, currentTotal, currentPercent,
                    "READY");
}

// ==========================================
// 10. LOOP UTAMA
// ==========================================
void loop() {
  // Pastikan koneksi WiFi tetap aktif
  if (WiFi.status() != WL_CONNECTED) {
    setup_wifi();
  }

  // Pastikan koneksi MQTT tetap aktif
  if (!client.connected()) {
    reconnectMqtt();
  }

  client.loop();

  // Pantau penekanan tombol BOOT ESP32-C3
  checkBootButton();
}
