---
title: 02. 温湿度センサーの値の取得
layout: page
---

```cpp
// 温湿度センサSHT31から温湿度データを取得するプログラムです
// SHT31はI2C (Inter-Integrated Circuit) 通信でデータを取得します
// SDA (Serial Data Line) と
// SCL (Serial Clock Line) という2本の信号線を使用します

// 準備するもの
// - ESP32
// - SHT31 温湿度センサ
// - ジャンパーワイヤー
// - ブレッドボード
// - USBケーブル

// 1. SHT31をブレッドボードに差し込む
// 2. SHT31のVCCをESP32の3.3Vに、GNDをGNDに、SCLを22番ピンに、SDAを21番ピンに接続

// SHT31の仕様
// https://akizukidenshi.com/catalog/g/g112125/
// 上記に詳細な仕様=データシートが記載されています

#include <Wire.h>

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

void setup() {

  // ESP32とPCをUSBでつないだシリアル通信で接続します
  // ESP32のデータがPCで確認できます(Arduino IDEの「シリアルモニタ」を使用)
  Serial.begin(115200); // シリアル通信の速度(baud rate: ボーレート)を設定
                        // Arduino IDEの「シリアルモニタ」の速度を
                        // この数値に合わせてください

  setup_sht32(SDA, SCL); // SHT31の初期設定
                         // SDA: 21番ピン, SCL: 22番ピンを指定します

}

void loop() {
  float temp, hum; // 温湿度データを格納する変数
  read_sht31(&temp, &hum); // 温湿度データを取得
                           // NOTE: 変数について…
                           // temp, humという"ハコ"を先に用意して
                           // そのハコに温湿度データを入れるイメージです


  // 温湿度データをシリアルモニタに表示
  // eg.) 温度：25.00℃  湿度：50.00％
  Serial.print("温度：");
  Serial.print(temp);
  Serial.print("℃  湿度：");
  Serial.print(hum);
  Serial.println("％");

  // 1秒ごとにデータを取得
  delay(1000);
}

void setup_sht32(uint8_t sda, uint8_t scl) {
  // 使用するピンを設定
  Wire.begin(sda, scl); // SDA: 21番ピン, SCL: 22番ピン
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
```

[戻る](../)
