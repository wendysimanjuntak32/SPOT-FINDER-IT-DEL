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
// 1. KONFIGURASI LAYAR OLED SSD1306
// ==========================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C // Alamat I2C umum OLED SSD1306 (0x3C atau 0x3D)

// Pin I2C Hardware ESP32-C3 SuperMini
#define I2C_SDA 8
#define I2C_SCL 9

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==========================================
// 2. KONFIGURASI WIFI & MQTT BROKER
// ==========================================
const char *ssid = "PELATIHAN_AI2";       // Ganti dengan Nama WiFi Anda
const char *password = "AI23456";         // Ganti dengan Password WiFi Anda
const char *mqtt_server = "76.13.19.250"; // IP Broker MQTT
const int mqtt_port = 1883;               // Port MQTT Standar
const char *mqtt_topic = "itdel/gazebo/status"; // Topik MQTT Gazebo IT Del

WiFiClient espClient;
PubSubClient client(espClient);

// Variabel data terkini
String currentRoom = "Gazebo Toba";
int currentEmpty = 12;
int currentTotal = 20;
int currentPercent = 40;

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

  // --- Angka Ketersediaan Besar ---
  display.setCursor(0, 26);
  display.setTextSize(2);
  display.print(emptySeats);
  display.setTextSize(1);
  display.print(F("/"));
  display.print(totalSeats);
  display.print(F(" KOSONG"));

  // --- Progress Bar Visual ---
  display.drawRect(0, 44, 128, 5, SSD1306_WHITE);
  int barWidth = map(fillPercent, 0, 100, 0, 124);
  display.fillRect(2, 46, barWidth, 1, SSD1306_WHITE);

  // --- Status Footer Bar ---
  display.setCursor(0, 53);
  display.setTextSize(1);
  display.print(F("Isi:"));
  display.print(fillPercent);
  display.print(F("% ["));
  display.print(statusMsg);
  display.print(F("]"));

  display.display();
}

// ==========================================
// 4. KONEKSI KE WIFI
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
// 5. CALLBACK PENERIMA PESAN MQTT
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
    currentRoom = doc["ruangan"] | "Gazebo Toba";
    currentEmpty = doc["kosong"] | 0;
    currentTotal = doc["total"] | 20;
    currentPercent = doc["persen"] | 0;

    // Render ke Layar OLED secara Real-Time
    renderOledDisplay(currentRoom, currentEmpty, currentTotal, currentPercent,
                      "MQTT:OK");
  } else {
    Serial.println("Gagal parsing JSON!");
  }
}

// ==========================================
// 6. RECONNECT MQTT JIKA TERPUTUS
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
// 7. SETUP UTAMA
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(500);

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
  display.display();
  delay(1500);

  // Hubungkan WiFi
  setup_wifi();

  // Konfigurasi Server MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  // Render Display Pertama
  renderOledDisplay(currentRoom, currentEmpty, currentTotal, currentPercent,
                    "READY");
}

// ==========================================
// 8. LOOP UTAMA
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
}
