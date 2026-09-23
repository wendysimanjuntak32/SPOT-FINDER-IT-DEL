/*
 * ======================================================================================
 * PROYEK: WIRELESS PEOPLE COUNTER GAZEBO IT DEL (MQTT TRANSMITTER)
 * MIKROKONTROLER: ESP32-C3 SuperMini (Stand-alone Wireless Button / Clicker)
 * TANPA LCD - HANYA TOMBOL FISIK BOOT & INDIKATOR LED ON-BOARD
 * BROKER MQTT: 76.13.19.250:1883
 * TOPIK MQTT: itdel/gazebo/status
 * ======================================================================================
 * 
 * CARA KERJA ALAT:
 * 1. ESP32-C3 terhubung ke WiFi ("PELATIHAN_AI2") dan MQTT ("76.13.19.250").
 * 2. Lampu LED Onboard (GPIO 8) akan menyala solid jika terhubung WiFi & MQTT.
 * 3. Setiap kali Anda MENEKAN TOMBOL BOOT (GPIO 9):
 *    - LED akan berkedip cepat (Flash Feedback).
 *    - Mengirim paket MQTT data event (+1 Orang Masuk) ke broker 76.13.19.250.
 *    - Website SpotFinder IT Del langsung meng-update kursi kosong & keterisian secara live.
 * 
 * LIBRARY YANG DIBUTUHKAN (Arduino Library Manager):
 * 1. PubSubClient (oleh Nick O'Leary)
 * 2. ArduinoJson (oleh Benoit Blanchon)
 * ======================================================================================
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ==========================================
// 1. PIN TOMBOL BOOT & LED INDIKATOR ESP32-C3
// ==========================================
#define BUTTON_BOOT_PIN 9   // Tombol BOOT pada ESP32-C3 SuperMini (Active LOW)
#define LED_INDICATOR_PIN 8 // LED Biru On-board ESP32-C3 SuperMini (Active LOW)

// ==========================================
// 2. KONFIGURASI WIFI & MQTT BROKER
// ==========================================
const char *ssid        = "iPhone";              // Hotspot / WiFi yang sedang tersambung
const char *password    = "Akubisa2026!";        // Password WiFi
const char *mqtt_server = "76.13.19.250";        // IP Broker MQTT
const int   mqtt_port   = 1883;                  // Port MQTT Standar
const char *mqtt_topic  = "itdel/gazebo/status"; // Topik MQTT Gazebo

WiFiClient espClient;
PubSubClient client(espClient);

// Data Counter Gazebo IT Del
const char *roomName = "Gazebo View Danau Toba (Taman Del)";
int totalCapacity = 20;
int availableSeats = 12; // Kursi kosong
int peopleInside = 8;    // Orang yang berada di Gazebo

// Variabel Debouncing Tombol
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 200; // 200ms anti-bouncing

// ==========================================
// 3. FUNGSI INDIKATOR LED FEEDBACK
// ==========================================
void ledBlink(int count, int delayMs) {
  for (int i = 0; i < count; i++) {
    digitalWrite(LED_INDICATOR_PIN, LOW);  // LED ON (Active LOW pada ESP32-C3)
    delay(delayMs);
    digitalWrite(LED_INDICATOR_PIN, HIGH); // LED OFF
    delay(delayMs);
  }
}

// ==========================================
// 4. PUBLISH EVENT KE MQTT BROKER
// ==========================================
void publishCounterEvent() {
  // Update perhitungan orang
  if (availableSeats > 0) {
    availableSeats--;
  } else {
    Serial.println(">> Gazebo sudah penuh maksimal!");
  }
  
  peopleInside = totalCapacity - availableSeats;
  int fillPercent = (int)(((float)peopleInside / totalCapacity) * 100);

  // Buat Payload JSON
  StaticJsonDocument<300> doc;
  doc["ruangan"] = roomName;
  doc["kosong"] = availableSeats;
  doc["total"] = totalCapacity;
  doc["terisi"] = peopleInside;
  doc["persen"] = fillPercent;
  doc["source"] = "ESP32_BOOT_BUTTON";
  doc["action"] = "PERSON_ENTERED";
  doc["timestamp"] = millis();

  char jsonBuffer[300];
  serializeJson(doc, jsonBuffer);

  if (client.connected()) {
    client.publish(mqtt_topic, jsonBuffer, true); // Retain = true
    Serial.println("\n==========================================");
    Serial.println(">> [SUKSES TRANSMIT MQTT KE 76.13.19.250]");
    Serial.print(">> Jumlah Orang di Gazebo : "); Serial.print(peopleInside); Serial.println(" Orang");
    Serial.print(">> Sisa Kursi Kosong     : "); Serial.print(availableSeats); Serial.println(" Kursi");
    Serial.print(">> Payload               : "); Serial.println(jsonBuffer);
    Serial.println("==========================================");

    // Kedipkan LED 2 kali tanda transmisi berhasil
    ledBlink(2, 60);
    digitalWrite(LED_INDICATOR_PIN, LOW); // Tetap menyala standby
  } else {
    Serial.println(">> [GAGAL MQTT] Klien belum terhubung ke 76.13.19.250");
  }
}

// ==========================================
// 5. KONEKSI KE WIFI
// ==========================================
void setup_wifi() {
  Serial.print("\nMenghubungkan ke WiFi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_INDICATOR_PIN, !digitalRead(LED_INDICATOR_PIN)); // Kedip cepat mencari WiFi
    delay(300);
    Serial.print(".");
  }

  Serial.println("\nWiFi Terhubung!");
  Serial.print("IP ESP32-C3: ");
  Serial.println(WiFi.localIP());

  digitalWrite(LED_INDICATOR_PIN, HIGH); // Matikan sementara
}

// ==========================================
// 6. CALLBACK PENERIMA MQTT (Sinkronisasi Web)
// ==========================================
void mqttCallback(char *topic, byte *payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) message += (char)payload[i];

  StaticJsonDocument<300> doc;
  if (!deserializeJson(doc, message)) {
    const char *source = doc["source"] | "";
    if (String(source) == "ESP32_BOOT_BUTTON") return; // Abaikan pesan dari tombol sendiri

    if (doc.containsKey("kosong")) {
      availableSeats = doc["kosong"];
      totalCapacity = doc["total"] | 20;
      peopleInside = totalCapacity - availableSeats;
      Serial.print(">> [SYNC DARI WEB] Kursi Kosong saat ini: ");
      Serial.println(availableSeats);
    }
  }
}

// ==========================================
// 7. RECONNECT MQTT BROKER
// ==========================================
void reconnectMqtt() {
  while (!client.connected()) {
    Serial.print("Menghubungkan ke MQTT Broker 76.13.19.250:1883...");
    String clientId = "ESP32C3_WirelessCounter-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println(" TERHUBUNG!");
      client.subscribe(mqtt_topic);
      digitalWrite(LED_INDICATOR_PIN, LOW); // LED Solid ON = Siap Pakai
    } else {
      Serial.print(" Gagal, rc=");
      Serial.print(client.state());
      Serial.println(" Coba lagi dalam 3 detik...");
      digitalWrite(LED_INDICATOR_PIN, HIGH); // LED OFF jika gagal
      delay(3000);
    }
  }
}

// ==========================================
// 8. CEK TOMBOL BOOT DITEKAN (WIRELESS COUNTER)
// ==========================================
void checkButton() {
  int reading = digitalRead(BUTTON_BOOT_PIN);

  // Deteksi transisi tombol saat ditekan (Active LOW)
  if (reading == LOW && lastButtonState == HIGH) {
    if ((millis() - lastDebounceTime) > debounceDelay) {
      lastDebounceTime = millis();
      Serial.println("\n[KLIK TOMBOL BOOT TERDETEKSI] Menambah +1 Orang...");
      publishCounterEvent();
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

  Serial.println("\n==================================================");
  Serial.println("  ESP32-C3 WIRELESS PEOPLE COUNTER GAZEBO IT DEL  ");
  Serial.println("  Stand-alone Button Clicker via MQTT 76.13.19.250");
  Serial.println("==================================================");

  // Inisialisasi Pin Tombol BOOT & LED
  pinMode(BUTTON_BOOT_PIN, INPUT_PULLUP);
  pinMode(LED_INDICATOR_PIN, OUTPUT);
  digitalWrite(LED_INDICATOR_PIN, HIGH); // Default OFF

  // Hubungkan WiFi
  setup_wifi();

  // Konfigurasi MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  // Sinyal Siap: LED Blink 3x
  ledBlink(3, 100);
  digitalWrite(LED_INDICATOR_PIN, LOW); // Solid ON = Ready Clicker
  Serial.println(">> ALAT WIRELESS COUNTER SIAP DIGUNAKAN! TEKAN TOMBOL BOOT UNTUK MENAMBAH ORANG.");
}

// ==========================================
// 10. LOOP UTAMA
// ==========================================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setup_wifi();
  }

  if (!client.connected()) {
    reconnectMqtt();
  }

  client.loop();

  // Cek tombol fisik BOOT
  checkButton();
}
