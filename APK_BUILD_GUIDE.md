# TCG助手APK構建指南

## 📱 概述

本指南將幫助您將TCG助手應用程序打包成APK文件，以便在Android設備上安裝和測試。

## 🔧 構建要求

### 必要工具
- **Node.js** 16.0 或更高版本
- **npm** 8.0 或更高版本
- **Expo CLI** 最新版本
- **EAS CLI** 最新版本

### 可選工具（本地構建）
- **Android Studio** 4.0 或更高版本
- **Java Development Kit (JDK)** 11 或更高版本
- **Android SDK** API 21 或更高版本

## 🚀 快速開始

### 方法1：使用預設腳本（推薦）

```bash
# 本地構建APK
npm run build:apk:local

# 預覽版本構建
npm run build:apk:preview

# 生產版本構建
npm run build:apk:production

# 清理構建（包含node_modules清理）
npm run build:apk:clean
```

### 方法2：使用EAS CLI

```bash
# 本地構建
npm run eas:build:android:local

# 雲端構建（預覽）
npm run eas:build:android:preview

# 雲端構建（生產）
npm run eas:build:android:production
```

## 📋 詳細步驟

### 步驟1：安裝依賴

```bash
# 安裝項目依賴
npm install

# 安裝全局工具
npm install -g @expo/cli eas-cli
```

### 步驟2：配置環境

```bash
# 登入Expo帳戶（如果使用雲端構建）
expo login

# 配置EAS
eas build:configure
```

### 步驟3：構建APK

#### 本地構建（推薦用於測試）

```bash
# 使用本地構建
eas build --platform android --local --profile local
```

#### 雲端構建（推薦用於發布）

```bash
# 預覽版本
eas build --platform android --profile preview

# 生產版本
eas build --platform android --profile production
```

## 🔍 構建配置

### app.json 配置

```json
{
  "expo": {
    "android": {
      "package": "com.tcgassistant.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### eas.json 配置

```json
{
  "build": {
    "local": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

## 📁 APK文件位置

### 本地構建
- **APK文件**: `./android/app/build/outputs/apk/debug/app-debug.apk`
- **簽名APK**: `./android/app/build/outputs/apk/release/app-release.apk`

### 雲端構建
- **下載鏈接**: 構建完成後會提供下載鏈接
- **構建歷史**: 可在EAS控制台查看

## 🔐 簽名配置

### 自動簽名（推薦）

EAS會自動處理簽名，無需額外配置。

### 手動簽名

如果需要手動簽名，請參考Android開發文檔。

## 🧪 測試APK

### 安裝到設備

```bash
# 使用ADB安裝
adb install app-debug.apk

# 或直接傳輸到設備並安裝
```

### 測試檢查清單

- [ ] 應用程序正常啟動
- [ ] 所有功能頁面可訪問
- [ ] 相機權限正常工作
- [ ] 網絡請求正常
- [ ] 數據庫操作正常
- [ ] 多語言切換正常

## ⚠️ 常見問題

### 1. 構建失敗

**問題**: Metro bundler錯誤
**解決方案**:
```bash
# 清理緩存
npm run build:apk:clean
# 或
expo r -c
```

### 2. 權限問題

**問題**: 缺少必要權限
**解決方案**: 檢查app.json中的permissions配置

### 3. 依賴衝突

**問題**: 包版本衝突
**解決方案**:
```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 4. 本地構建失敗

**問題**: Android SDK未配置
**解決方案**: 使用雲端構建或配置Android開發環境

## 📊 構建優化

### 性能優化

1. **啟用ProGuard**（生產版本）
2. **啟用R8**（代碼壓縮）
3. **優化圖片資源**
4. **移除未使用的代碼**

### 大小優化

1. **使用AAB格式**（生產版本）
2. **分離架構**（arm64-v8a, armeabi-v7a）
3. **壓縮資源文件**
4. **移除調試信息**

## 🔄 持續集成

### GitHub Actions

```yaml
name: Build APK
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:apk:preview
```

## 📞 支持

如果遇到構建問題，請：

1. 檢查錯誤日誌
2. 確認環境配置
3. 嘗試清理緩存
4. 聯繫開發團隊

---

**最後更新**: 2025年8月8日  
**版本**: 1.0.0
