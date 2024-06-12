---
title: トップページ
layout: home
---

![IoP Workshop](sawachi_logo.png)

2024 年 6 月 12 日に開催される IoP ワークショップのための資料です。

## 事前配布資料

IoP ワークショップの事前配布資料です。当日のハンズオンに必要な環境構築の方法が記載されています。

- [事前配布資料](https://ptk-y-nakahira.github.io/iop-lec-preparation/)

## 当日資料

本日使うスライドを置いています

- [当日資料](https://share.1password.com/s#jQ-LmexAohspvhsRDgA8-COaa1P96SwYjBeeoS0T-_Q)

## 個人配布資料

参加者ごとに配布される資料です。当日番号を配布するので、指定されたフォルダを使用してください

- [個人配布資料](https://share.1password.com/s#3ywoKWNS_TePjkih8Ms8JGCrEhn3AR31hxBzovMZZhI)

## SAWACHI 詳細分析画面

- [SAWACHI 詳細分析画面 (Model Method)](https://testbed-tech-mm.sawachi.com/)

## Arduino IDE インストール時の注意点

**Windows のユーザー名に日本語（マルチバイト文字）が使われている場合、Arduino IDE の実行時にエラーが発生することがあります。**

### 対処法

1. 可能な場合は、Windows の**ユーザー名を英数字**に変更してください。
2. 旧バージョンの Arduino IDE の**zip 版**(arduino-1.8.19) を使用し、**C:\直下**に「すべて展開」します
3. C:\直下への展開が権限がなく不可の場合は PC をお貸しします

## Arduino IDE

### 1. LED の点灯

[01. LED の点灯](0001_led)

### 2. 温湿度センサーの値の取得

[02. 温湿度センサーの値の取得](0002_sht31)

### 3. HTTP のテスト

[03. HTTP のテスト](0003_http)

### 4. MQTT の送信テスト

[04. MQTT の送信テスト](0004_mqtt_pub)

### 5. MQTT の受信テスト

[05. MQTT の受信テスト](0005_mqtt_sub)

### 6. ボタンを使った MQTT の送信デモ

[06. ボタンを使った MQTT の送信デモ](0006_button)

### 7. Qsu プロトコルにしたがったデータ送信

[07. Qsu プロトコルにしたがったデータ送信](0007_qsu)

### 8. SAWACHI へのデータ送信

[08. SAWACHI へのデータ送信](0008_sawachi)
