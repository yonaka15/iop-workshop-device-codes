---
title: 06. ボタンを使った MQTT の送信デモ
layout: page
---

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const int buttonPin = 13;    // ボタンスイッチの接続ピン
int buttonState = 0;        // ボタンの状態を保存する変数

// WiFi settings
const char* ssid = "iopworkshop20250627";
const char* password = "iopworkshop";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  // ボタンスイッチのピンを入力に設定
  pinMode(buttonPin, INPUT);

  // シリアル通信を開始
  Serial.begin(115200);

  // Wi-Fiに接続します(下に関数が定義されています)
  setup_wifi();

  // MQTT Brokerを設定します
  client.setServer("192.168.254.254", 1883); //IPアドレスとポート番号
}

void loop() {
  // Wi-Fiの接続が切れている場合は何もせずに0.1秒待機します
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected");
    delay(100);
    return;
  }

  // ボタンスイッチの状態を読み取る
  buttonState = digitalRead(buttonPin);  // ピンよりデータ取得

  if (buttonState == HIGH) {
    // ボタンが押されている場合
    Serial.println("ボタンが押されました");
    mqtt_publish_test("iopworkshop/test", "テスト用ボタン", "押されました"); // トピック名、クライアントID、メッセージ
  } else {
    // ボタンが押されていない場合
    Serial.println("ボタンが押されていません");
  }

  // 状態を確認する間隔を設定
  delay(100); // 0.1秒ごとにチェック
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

void mqtt_publish_test(char* topic, char* client_id, char* message) {
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

  // "client_id > message" の形式でメッセージを送信することとします
  String payload = String(client_id) + " > " + String(message);

  // メッセージをパブリッシュ
  Serial.print("Publishing message: ");
  Serial.println(payload);
  client.publish(topic, payload.c_str());
  // HTTPがリクエスト-レスポンス型の通信プロトコルであるのに対し
  // MQTTはパブリッシュ-サブスクライブ型の通信プロトコルです。
  // リアルタイムな通信を行う際に適しています。
}
```

[戻る](../)
