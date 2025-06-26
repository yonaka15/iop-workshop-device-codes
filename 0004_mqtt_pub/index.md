---
title: 04. MQTT の送信テスト
layout: page
---

```cpp
/*  MQTT通信をするための拡張機能 PubSubClientを使います。
    Arduino IDEのライブラリマネージャから `PubSubClient` をインストールしてください。
 */

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

  //------------------//
  // --- MQTT通信 --- //
  //------------------//

  mqtt_publish_test("iopworkshop/test", "PromptX-Nakahira", "ありがとう");// トピック名、クライアントID、メッセージ を指定します
  // クライアントID、メッセージは自由に指定してください
  // ただし、クライアントIDが重複すると接続できません
  // クライアントIDは23文字以内の半角英数字で指定します

  // 10秒待機
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
