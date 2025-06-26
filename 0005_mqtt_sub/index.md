---
title: 05. MQTT の受信テスト
layout: page
---

```cpp
/*  MQTT通信をするための拡張機能 PubSubClientを使います。
    下記URLからダウンロードして、Ardino IDEの
    スケッチ -> ライブラリをインクルード -> ライブラリを管理
    からpubsubclientをインストールしてください。

 */
// https://www.arduino.cc/reference/en/libraries/pubsubclient/


#include <WiFi.h>
#include <PubSubClient.h>


// WiFi settings
const char* ssid = "iopworkshop20250627";
const char* password = "iopworkshop";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  // 通信状態を確認するためにシリアルモニタを使います
  Serial.begin(115200);

  // Wi-Fiに接続します(下に処理が定義されています)
  setup_wifi();

  // MQTT Brokerを設定します
  client.setServer("192.168.254.254", 1883); //IPアドレスとポート番号
  client.setCallback(callback); // コールバック=受信後に実行する処理

  // LED用ピンの設定(0001_blinkのコードを参照してください)
  pinMode(32, OUTPUT); // 32番ピンを出力に設定
}

void loop() {
  // Wi-Fiの接続が切れている場合は何もせずに1秒待機します
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected");
    delay(1000);
    return;
  }

  //------------------//
  // --- MQTT通信 --- //
  //------------------//

  const char* topic = "iopworkshop/test";
  const char* device_id = "PromptK-Nakahira-button";
  mqtt_subscribe_test(topic, device_id); // トピック名を指定
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

void mqtt_subscribe_test(const char* topic, const char* client_id) {
  // MQTT ブローカーとの接続が切れている場合は5秒ごとに再接続を試みます
  if (!client.connected()) {
    while (!client.connected()) {
      Serial.print("Attempting MQTT connection...");
      // クライアントIDを決めて接続します
      if (client.connect(client_id)) {
        Serial.println("connected");
        // トピックを指定してサブスクライブします
        client.subscribe(topic);
      } else {
        Serial.print("failed, rc=");
        Serial.print(client.state());
        Serial.println(" try again in 5 seconds");
        delay(5000);
      }
    }
  }

  client.loop(); // MQTT通信の維持
                 // HTTPが非持続的な通信プロトコルであるのに対し
                 // MQTTは持続的な通信プロトコルです。

}

/** MQTT通信でメッセージ受信後の処理 */
void callback(char* topic, byte* payload, unsigned int length) {
  // トピックと受信したメッセージをシリアルモニタに表示します
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  // 0.1秒間LEDを点滅させます(デモ)
  digitalWrite(32, HIGH); // LEDを点灯
  delay(100); // 0.1秒待機
  digitalWrite(32, LOW); // LEDを消灯
}
```

[戻る](../)
