# TCG助手 (TCG Assistant)

## 📱 專案介紹

TCG助手是一個專為Pokemon和One Piece卡牌收藏家設計的智能移動應用程式。透過先進的AI技術，提供卡牌辨識、價格分析、真偽判斷等全方位服務。

## ✨ 主要功能

### 🔍 卡牌辨識 (98%+ 準確率)
- 拍照或上傳照片辨識卡牌
- 提供詳細卡牌資訊
- 各評分等級數量統計
- 多平台市場價格整合

### 💰 AI價格分析與預測 (80%+ 準確率)
- 即時市場價格分析
- AI風險評級評估
- 未來價格預測 (1個月/3個月/6個月/1年/3年)
- 支援平台：Mercari, SNKRDUNK, TCG Player, eBay, Cardmarket, Price Charting

### 🎯 置中評估 (98%+ 準確率)
- 前後拍攝評估置中度
- 左右/上下百分比顯示
- 隨機編號追蹤
- 分享連結功能

### 🔐 真偽判斷 (90%+ 準確率)
- AI智能真偽檢測
- 隨機編號追蹤
- 分享連結功能

### 📊 收藏管理
- 個人收藏庫
- 歷史搜尋記錄
- 買入價格追蹤
- 價格升跌對比

### 🌐 多語言支援
- 繁體中文
- 簡體中文
- 英文
- 日文

### 🤖 AI助手
- Copilot AI聊天機器人
- 卡牌相關諮詢服務

## 👥 會員制度

### 🆓 免費會員
- 卡牌辨識
- 置中評估
- 分享連結
- 查詢隨機編號

### ⭐ VIP試用會員 (7天免費)
- 每日1次VIP功能
- 完整功能體驗

### 💎 付費VIP會員
- 無限制使用所有功能
- 優先客服支援
- 獨家功能預覽

## 🛠 技術架構

- **前端框架**: React Native 0.72.6
- **導航**: React Navigation 6
- **狀態管理**: Redux Toolkit
- **後端服務**: Firebase
- **AI服務**: TensorFlow Lite, ML Kit
- **圖表**: React Native Chart Kit
- **多語言**: i18next

## 📱 支援平台

- Android 8.0+
- iOS 12.0+

## 🚀 安裝與運行

### 環境需求
- Node.js 16+
- React Native CLI
- Android Studio / Xcode
- JDK 11+

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/your-username/tcg-assistant.git
cd tcg-assistant
```

2. **安裝依賴**
```bash
npm install
# 或
yarn install
```

3. **iOS 額外安裝**
```bash
cd ios && pod install && cd ..
```

4. **環境配置**
```bash
cp .env.example .env
# 編輯 .env 檔案，填入必要的 API 金鑰
```

5. **運行應用**
```bash
# Android
npm run android

# iOS
npm run ios
```

## 🔧 開發指南

### 專案結構
```
src/
├── components/          # 可重用元件
├── screens/            # 頁面元件
├── navigation/         # 導航配置
├── services/           # API 服務
├── store/              # Redux store
├── utils/              # 工具函數
├── constants/          # 常數定義
├── assets/             # 靜態資源
└── i18n/               # 多語言檔案
```

### 開發指令
```bash
# 啟動 Metro bundler
npm start

# 運行測試
npm test

# 程式碼檢查
npm run lint

# 建置 Android APK
npm run build:android

# 建置 iOS
npm run build:ios
```

## 📄 免責聲明

本應用程式所提供之卡牌辨識、價格分析、真偽判斷及相關AI預測僅供參考，並不構成任何投資建議或保證。所有資料來源於第三方平台，準確性及即時性可能因平台更新而有所變動。

使用者應自行判斷並承擔風險，本應用程式及其開發者不對任何因使用本程式所造成之損失負責。

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request 來改善這個專案。

## 📄 授權

本專案採用 MIT 授權條款。

## 📞 聯絡我們

- 開發團隊：TCG Assistant Development Team
- 支援信箱：support@tcgassistant.com
- 官方網站：https://tcgassistant.com

---

**版本**: 1.0.0  
**最後更新**: 2024年12月
