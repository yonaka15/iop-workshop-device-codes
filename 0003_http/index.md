---
title: 03. HTTP のテスト
layout: page
---

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid     = "iopworkshop20240612";
const char* password = "iopworkshop";

void setup()
{
  // 通信状態を確認するためにシリアルモニタを使います
  Serial.begin(115200);

  // Wi-Fiに接続します(下に関数が定義されています)
  setup_wifi();
}

void loop() {
  // Wi-Fiの接続が切れている場合は何もせずに1秒待機します
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected");
    delay(1000);
    return;
  }

  //------------------//
  // --- HTTP通信 --- //
  //------------------//

  // "ありがとう"というメッセージをHTTP通信で送信します
  http_test("ありがとう");

  // 10秒待機します
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

void http_test(String message) {
  HTTPClient http; // HTTP通信を行います

  http.begin("http://192.168.254.254:1880/api"); // URLに接続します

  // こんにちわというメッセージを送信します
  int httpResponseCode = http.POST(message); // "POST"メソッドでリクエストを送信します

  if (httpResponseCode == 200) { // 正常に受信できた場合
    String payload = http.getString(); // 受信内容（ペイロード）を取得します
    Serial.println(payload); // ペイロードをシリアルモニタに表示します
  } else {
    Serial.print("Error on sending GET request: ");
    Serial.println(httpResponseCode);
  }

  http.end(); // 通信を終了します
}

```

[戻る](../)
