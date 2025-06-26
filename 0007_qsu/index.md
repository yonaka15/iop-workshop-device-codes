---
title: 07. Qsu プロトコルにしたがったデータ送信
layout: page
---

```cpp
// JSON形式でデータをMQTTブローカーに送信するサンプルスケッチ
// "ArduinoJson"ライブラリを使用します
// スケッチ > ライブラリを使用 > ライブラリを管理 から
// "ArduinoJson" を検索してインストールしてください

#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

#define SDA 21 // SDAピンの設定 配線と一致していれば何番でも可
#define SCL 22 // SCLピンの設定 配線と一致していれば何番でも可

#define SHT31_ADDRESS 0x45
#define SHT31_SOFT_RESET_MSB 0x30
#define SHT31_SOFT_RESET_LSB 0xA2
#define SHT31_CLEAR_STATUS_REGISTER_MSB 0x30
#define SHT31_CLEAR_STATUS_REGISTER_LSB 0x41
#define SHT31_ON_BUILTIN_HEATER_MSB 0x30
#define SHT31_ON_BUILTIN_HEATER_LSB 0x6D
#define SHT31_OFF_BUILTIN_HEATER_MSB 0x30
#define SHT31_OFF_BUILTIN_HEATER_LSB 0x66
#define SHT31_SINGLE_MEASUREMENT_MSB 0x24
#define SHT31_SINGLE_MEASUREMENT_LSB 0x00

// WiFi settings
const char* ssid = "iopworkshop20250627";
const char* password = "iopworkshop";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {

  Serial.begin(115200); // シリアル通信の速度(baud rate: ボーレート)を設定
                        // Arduino IDEの「シリアルモニタ」の速度を
                        // この数値に合わせてください

  setup_sht31(SDA, SCL); // SHT31の初期設定
                         // SDA: 27番ピン, SCL: 14番ピンを指定します

  // Wi-Fiに接続します(下に関数が定義されています)
  setup_wifi();

  // MQTT Brokerを設定します
  client.setServer("192.168.254.254", 1883); //IPアドレスとポート番号

}

void loop() {
  // Wi-Fiの接続が切れている場合は再接続を試みます
  if (!is_wifi_connected()) {
    delay(1000);
    return;
  }

  float temp, hum; // 温湿度データを格納する変数
  read_sht31(&temp, &hum); // 温湿度データを取得


  char* topic = "iopworkshop/test";
  char* client_id = "PromptK_Nakahira";
  char* device_id = "some_device_id";
  char* message_id = "P00000001";
  mqtt_publish_data(topic, client_id, message_id, device_id, temp, hum); // データをMQTTブローカーに送信
  // トピック, クライアントID, デバイスID, 温度, 湿度


  // 10秒ごとにデータを取得
  delay(10000);
}

void setup_wifi() {
  delay(10); // 接続を安定させるための遅延
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  // WiFi接続が完了するまで待機
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

bool is_wifi_connected() {
  // WiFi接続が切れている場合は再接続を試みます
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected");
    setup_wifi();
    return false;
  }
  return true;
}

void setup_sht31(uint8_t sda, uint8_t scl) {
  // 使用するピンを設定
  Wire.begin(sda, scl); // SDA: 27番ピン, SCL: 14番ピン
                        // WireはI2C通信を行うためのライブラリです


                        // SHT31のリセット
  Wire.beginTransmission(SHT31_ADDRESS); // 送信を開始するための準備
  Wire.write(SHT31_SOFT_RESET_MSB); // リセットコマンドを送信 MSB: Most Significant Bit（上位ビット）
  Wire.write(SHT31_SOFT_RESET_LSB); // リセットコマンドを送信 LSB: Least Significant Bit（下位ビット）
  Wire.endTransmission();
  /* MSB （上位ビット）、LSB （下位ビット）の順で送信します
     ここでは0x30をMSB、0xA2をLSBとして送信することで機器のリセットを行っています
     (データシート参照)
   */
  delay(500); // リセット後に500ms待機


  // レジスタ（記憶領域）のクリア
  Wire.beginTransmission(SHT31_ADDRESS);
  Wire.write(SHT31_CLEAR_STATUS_REGISTER_MSB);
  Wire.write(SHT31_CLEAR_STATUS_REGISTER_LSB);
  Wire.endTransmission();
  delay(500);

  // 内蔵ヒータOFF
  Wire.beginTransmission(SHT31_ADDRESS);
  Wire.write(SHT31_OFF_BUILTIN_HEATER_MSB);
  Wire.write(SHT31_OFF_BUILTIN_HEATER_LSB);
  Wire.endTransmission();
  delay(500);

  // シリアル文字出力
  Serial.println("SHT31 Tempreture&Humidity Measurement start!!");

}

void read_sht31(float *temp, float *hum) {
  unsigned int data[6]; // データ格納場所"data"の確保
  const unsigned int size = 6; // データサイズの設定

  // SHT31から温湿度データ取得
  Wire.beginTransmission(SHT31_ADDRESS);
  Wire.write(SHT31_SINGLE_MEASUREMENT_MSB);
  Wire.write(SHT31_SINGLE_MEASUREMENT_LSB);
  Wire.endTransmission();
  delay(300);

  // SHT31からsize=6byte=6文字のデータを受信する
  Wire.requestFrom(SHT31_ADDRESS, size);

  // データが6byte用意されるのを待つ
  while (Wire.available() != size);

  // データを読み込む
  for (unsigned int i = 0; i < size; i++) {
    data[i] = Wire.read();
  }

  // データをシリアルモニタに出力（確認用）
  // for (unsigned int i = 0; i < size; i++) {
  //   Serial.print(data[i], HEX); // データを16進数で表示
  //   Serial.print(" ");
  // }
  // Serial.println();
  // return;

  /* データは
     1. 2バイトの温度データ
     2. 1バイトのCRC（Cyclic Redundancy Check）チェックサム=データの誤り検出符号
     3. 2バイトの湿度データ
     4. 1バイトのCRCチェックサム
     のように格納されています
   */


  /* --- CRC計算と検証(今回は省略) --- */
  // uint8_t tempData[2] = {data[0], data[1]};
  // uint8_t humidityData[2] = {data[3], data[4]};

  // if (calculateCRC(tempData, 2) != data[2] || calculateCRC(humidityData, 2) != data[5]) {
  //   Serial.println("CRC error!");
  //   return;
  // }
  /* -------------------------------- */


  /* --------------------------------------------- */
  // データを可読な形に変換
  // データシートの「測定データの物理量値への換算」
  /* --------------------------------------------- */

  // 温度データを計算
  unsigned int t = (data[0] << 8) | data[1];
  *temp = -45 + (175.0 * (float)t) / 65535.0;

  // 湿度データを計算
  unsigned int h = (data[3] << 8) | data[4];
  *hum = 100.0 * (float)h / 65535.0;
}

// CRC-8計算関数
// 今回は説明を省略しますが、CRCはデータの誤り検出符号です
// 詳しくはデータシートの「CRC計算」を参照してください
uint8_t calculateCRC(uint8_t data[], uint8_t length) {
  uint8_t crc = 0xFF; // CRC初期値

  for (uint8_t i = 0; i < length; i++) {
    crc ^= data[i]; // 現在のバイトをCRCにXORする

    for (uint8_t j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = (crc << 1) ^ 0x31; // ポリノミアル多項式 x^8 + x^5 + x^4 + 1 = 0x31
      } else {
        crc <<= 1;
      }
    }
  }

  return crc;
}

void mqtt_publish_data(const char* topic, const char* client_id, const char* message_id, const char* device_id, float temp, float humd) {
  // MQTT ブローカーとの接続が切れている場合は0.1秒ごとに再接続を試みます
  if (!client.connected()) {
    while (!client.connected()) {
      Serial.print("Attempting MQTT connection...");
      // クライアントIDを決めて接続します
      if (client.connect(client_id)) {
        Serial.println("connected");
      } else {
        Serial.print("failed, rc=");
        Serial.print(client.state());
        Serial.println(" try again in 0.1 seconds");
        delay(100);
      }
    }
  }

  /* --- ペイロードの作成 --- */
  // JSON形式でデータを格納します
  // JSONとは…
  // JavaScript Object Notationの略で、Web上でデータをやり取りする際に頻繁に使われます
  StaticJsonDocument<300> payload; // 300バイト=文字のメモリを確保

  // データ形式（Qsuプロトコル）の例
  // {
  //  "msgId" : "P00000000",
  //  "deviceId" : "SomeDevice001",
  //  "timestamp" : "2024-06-12T14:00:00.000+09:00",
  //  "data" : {
  //    "1000" : "12.3",
  //    "1001” : "200000",
  //    "1002" : "0.5"
  //  }
  // }
  // Qsuとは...
  // センサーデータをクラウドに送信するためのIoP独自のプロトコルです
  // 詳しくは配布の仕様書を参照してください

  // msgId...
  // ・接頭辞 + カウンタ
  //   9桁固定長文字列 : 接頭辞 [1文字 ]+カウンタ文字列 [8文字 ]
  // ・接頭辞の内容は以下の通り
  //   計測値（上り）   : P
  //   機器設定（下り） : C

  // deviceId...
  // ・任意の文字列

  // timestamp...
  // ・ISO8601形式で記述 : YYYY-MM-DDTHH:MM:SS.sss+09:00
  // ・+09:00は日本標準時を表します
  // ・指定がない場合はクラウド側で受信時刻を記録します

  // data...
  // ・形式は以下の通り
  // {
  //   "{Qsuアドレス }" : "{データ値 }",
  //   "{Qsuアドレス }" : "{データ値 }",
  //   ...
  // }
  // {Qsuアドレス}：10進数文字列（0~2147483647)
  // {データ値}: 文字列に変換して格納
  // ・計測データの場合、アドレスには1000〜の使用が推奨されます

  // ペイロードの作成
  payload["msgId"] = message_id;
  payload["deviceId"] = device_id;
  payload["data"]["400"] = String(1); // センサーのステータス: 1=正常, 0=異常
  payload["data"]["1000"] = String(temp);
  payload["data"]["1001"] = String(humd);

  // ペイロードを文字列に変換
  String payload_str;
  serializeJson(payload, payload_str);

  // メッセージをパブリッシュ
  Serial.print("Publishing message: ");
  Serial.println(payload_str);
  client.publish(topic, payload_str.c_str());
}
```

## Qsu プロトコルについて

Qsu プロトコルは、センサーデータをクラウドに送信するための IoP 独自のプロトコルです。以下に Qsu プロトコルのデータ形式の例を示します。

```json
{
  "msgId": "P00000000",
  "deviceId": "SomeDevice001",
  "timestamp": "2024-06-12T14:00:00.000+09:00",
  "data": {
    "1000": "12.3",
    "1001": "200000",
    "1002": "0.5"
  }
}
```

Qsu プロトコルのデータ形式は以下の通りです。

- `msgId` : メッセージ ID
  - 接頭辞 + カウンタ
  - 9 桁固定長文字列
  - 接頭辞の内容は以下の通り
    - 計測値（上り） : P
    - 機器設定（下り） : C
- `timestamp` : タイムスタンプ
  - ISO8601 形式で記述
  - `YYYY-MM-DDTHH:MM:SS.sss+09:00`
  - `+09:00` は日本標準時を表します
  - 指定がない場合はクラウド側で受信時刻を記録します
- `data` : データ
  - `{Qsu アドレス}` : `{データ値}`
  - `{Qsu アドレス}` : 10 進数文字列（0~2147483647)
  - `{データ値}` : 文字列に変換して格納
  - 計測データの場合、アドレスには 1000 〜 の使用が推奨されます

[戻る](../)
