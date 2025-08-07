# 多源自動更新功能實作文件

## 📋 概述

多源自動更新功能是一個擴展的自動更新系統，支援從多個資料來源自動更新卡牌資料。相比原本只支援BGC評級資料的單一來源更新，新系統可以同時管理多種類型的資料來源，包括評級資料、價格資料、卡牌基本資料和市場資料。

## 🏗️ 架構設計

### 核心組件

```
MultiSourceAutoUpdateService
├── 資料來源管理
│   ├── 評級資料 (BGC, PSA)
│   ├── 價格資料 (TCGPlayer, eBay, Cardmarket, Price Charting)
│   ├── 卡牌資料 (Pokemon API, One Piece API)
│   └── 市場資料 (Market Analytics)
├── 背景任務排程
├── 更新邏輯處理
├── 狀態管理
└── 歷史記錄
```

### 資料來源類型

```javascript
export const DATA_SOURCE_TYPES = {
  GRADING: 'grading',           // 評級資料
  PRICING: 'pricing',           // 價格資料
  CARD_DATA: 'card_data',       // 卡牌基本資料
  MARKET_DATA: 'market_data',   // 市場趨勢資料
  NEWS: 'news',                 // 新聞和公告
  ANALYTICS: 'analytics',       // 分析資料
};
```

### 預設資料來源配置

```javascript
const DEFAULT_DATA_SOURCES = {
  [DATA_SOURCE_TYPES.GRADING]: {
    bgc: { name: 'BGC Grading', enabled: true, updateInterval: 24, priority: 'high' },
    psa: { name: 'PSA Grading', enabled: false, updateInterval: 24, priority: 'medium' },
  },
  [DATA_SOURCE_TYPES.PRICING]: {
    tcgplayer: { name: 'TCGPlayer', enabled: true, updateInterval: 6, priority: 'high' },
    ebay: { name: 'eBay', enabled: true, updateInterval: 6, priority: 'medium' },
    cardmarket: { name: 'Cardmarket', enabled: true, updateInterval: 6, priority: 'medium' },
    pricecharting: { name: 'Price Charting', enabled: true, updateInterval: 12, priority: 'low' },
  },
  [DATA_SOURCE_TYPES.CARD_DATA]: {
    pokemonApi: { name: 'Pokemon API', enabled: true, updateInterval: 168, priority: 'low' },
    onePieceApi: { name: 'One Piece API', enabled: true, updateInterval: 168, priority: 'low' },
  },
  [DATA_SOURCE_TYPES.MARKET_DATA]: {
    marketAnalytics: { name: 'Market Analytics', enabled: true, updateInterval: 24, priority: 'medium' },
  },
};
```

## 🔧 功能特性

### 1. 多資料來源支援
- **評級資料**: BGC、PSA等評級公司的資料
- **價格資料**: TCGPlayer、eBay、Cardmarket、Price Charting等平台
- **卡牌資料**: Pokemon API、One Piece API等官方資料
- **市場資料**: 市場分析和趨勢資料

### 2. 優先級管理
- **高優先級**: 重要且頻繁變化的資料（如價格資料）
- **中優先級**: 一般重要性的資料（如評級資料）
- **低優先級**: 較少變化的資料（如卡牌基本資料）

### 3. 智能更新策略
- 根據資料類型設定不同的更新間隔
- 自動檢查資料新鮮度，避免重複更新
- 批次處理，提高更新效率
- 錯誤重試機制

### 4. 靈活的配置
- 可獨立啟用/停用每個資料來源
- 可自訂每個來源的更新間隔
- 支援手動觸發特定來源更新
- 完整的更新歷史記錄

## 📱 使用者介面

### MultiSourceAutoUpdateSettingsScreen

新的設定畫面提供以下功能：

1. **一般設定區域**
   - 啟用/停用自動更新
   - 設定每日更新時間
   - 顯示最後更新時間

2. **資料來源管理**
   - 顯示所有可用的資料來源
   - 獨立控制每個來源的啟用狀態
   - 顯示來源狀態、最後更新時間、更新間隔
   - 支援手動觸發單一來源更新

3. **更新歷史**
   - 顯示最近的更新記錄
   - 詳細的成功/失敗統計
   - 支援查看完整歷史記錄

4. **進階設定**
   - 設定個別資料來源的更新間隔
   - 查看詳細的服務狀態

## 🚀 使用方法

### 基本使用

```javascript
import multiSourceAutoUpdateService from '../services/multiSourceAutoUpdateService';

// 初始化服務
await multiSourceAutoUpdateService.init();

// 啟用自動更新
await multiSourceAutoUpdateService.enableAutoUpdate('02:00');

// 手動觸發更新
await multiSourceAutoUpdateService.triggerManualUpdate();
```

### 管理資料來源

```javascript
// 啟用特定資料來源
await multiSourceAutoUpdateService.toggleDataSource('grading.bgc', true);

// 設定更新間隔
await multiSourceAutoUpdateService.setSourceUpdateInterval('pricing.tcgplayer', 4);

// 獲取資料來源狀態
const status = await multiSourceAutoUpdateService.getDataSourceStatus();
```

### 查看更新歷史

```javascript
// 獲取最近20條更新記錄
const history = await multiSourceAutoUpdateService.getUpdateHistory(20);

// 獲取服務狀態
const serviceStatus = await multiSourceAutoUpdateService.getServiceStatus();
```

## 🔄 更新流程

### 自動更新流程

1. **背景任務觸發**
   - 根據設定的時間自動觸發更新
   - 檢查網路連線狀態

2. **優先級分組**
   - 按高、中、低優先級分組資料來源
   - 按優先級順序執行更新

3. **單一來源更新**
   - 檢查是否需要更新（基於更新間隔）
   - 根據資料類型執行對應的更新邏輯
   - 記錄更新結果和統計資訊

4. **清理和記錄**
   - 清理過期資料
   - 記錄更新歷史
   - 更新最後更新時間

### 手動更新流程

1. **選擇更新範圍**
   - 完整更新：所有啟用的資料來源
   - 特定更新：指定的資料來源

2. **執行更新**
   - 執行與自動更新相同的邏輯
   - 即時回傳結果

3. **結果處理**
   - 顯示更新進度和結果
   - 更新UI狀態

## 📊 資料來源詳細說明

### 評級資料 (Grading)

#### BGC Grading
- **更新間隔**: 24小時
- **優先級**: 高
- **功能**: 爬取BGC網站獲取卡牌評級數量
- **資料**: 各評級等級的數量統計

#### PSA Grading
- **更新間隔**: 24小時
- **優先級**: 中
- **功能**: 獲取PSA評級資料（待實作）
- **資料**: PSA評級統計資訊

### 價格資料 (Pricing)

#### TCGPlayer
- **更新間隔**: 6小時
- **優先級**: 高
- **功能**: 獲取TCGPlayer平台價格
- **資料**: 即時市場價格

#### eBay
- **更新間隔**: 6小時
- **優先級**: 中
- **功能**: 獲取eBay拍賣價格
- **資料**: 拍賣價格和成交記錄

#### Cardmarket
- **更新間隔**: 6小時
- **優先級**: 中
- **功能**: 獲取Cardmarket歐洲價格
- **資料**: 歐洲市場價格

#### Price Charting
- **更新間隔**: 12小時
- **優先級**: 低
- **功能**: 獲取價格趨勢資料
- **資料**: 歷史價格和趨勢分析

### 卡牌資料 (Card Data)

#### Pokemon API
- **更新間隔**: 168小時（1週）
- **優先級**: 低
- **功能**: 更新Pokemon卡牌基本資料
- **資料**: 卡牌資訊、系列資料

#### One Piece API
- **更新間隔**: 168小時（1週）
- **優先級**: 低
- **功能**: 更新One Piece卡牌基本資料
- **資料**: 卡牌資訊、系列資料

### 市場資料 (Market Data)

#### Market Analytics
- **更新間隔**: 24小時
- **優先級**: 中
- **功能**: 市場分析和趨勢預測（待實作）
- **資料**: 市場趨勢、投資建議

## 🛠️ 技術實作

### 核心服務類

```javascript
class MultiSourceAutoUpdateService {
  // 初始化服務
  async init()
  
  // 自動更新控制
  async enableAutoUpdate(updateTime)
  async disableAutoUpdate()
  async isAutoUpdateEnabled()
  
  // 資料來源管理
  async toggleDataSource(sourceKey, enabled)
  async setSourceUpdateInterval(sourceKey, interval)
  async getDataSourceStatus()
  
  // 更新執行
  async triggerManualUpdate(sources)
  async performMultiSourceUpdate()
  
  // 歷史記錄
  async getUpdateHistory(limit)
  async recordUpdateResult(results)
}
```

### 背景任務

使用 `react-native-background-job` 實現可靠的背景任務排程：

```javascript
await BackgroundJob.register({
  jobKey: 'multi_source_auto_update',
  job: () => this.performMultiSourceUpdate(),
});

await BackgroundJob.schedule({
  jobKey: 'multi_source_auto_update',
  delay,
  period: 24 * 60 * 60 * 1000, // 24小時
});
```

### 資料持久化

使用 `AsyncStorage` 儲存設定和歷史記錄：

```javascript
const STORAGE_KEYS = {
  AUTO_UPDATE_SETTINGS: 'multi_source_auto_update_settings',
  AUTO_UPDATE_HISTORY: 'multi_source_auto_update_history',
  LAST_UPDATE_TIME: 'multi_source_last_update_time',
  SOURCE_STATUS: 'multi_source_status',
};
```

## 🧪 測試

### 單元測試

完整的測試覆蓋包括：

- 服務初始化
- 自動更新開關
- 資料來源管理
- 手動更新觸發
- 更新邏輯執行
- 錯誤處理
- 歷史記錄管理

### 測試檔案

- `src/tests/multiSourceAutoUpdateService.test.js`

## 📈 效能考量

### 更新策略

1. **批次處理**: 避免單一卡牌更新，採用批次處理
2. **延遲控制**: 在請求之間加入適當延遲，避免過度頻繁
3. **優先級排序**: 按重要性順序執行更新
4. **智能跳過**: 檢查資料新鮮度，避免不必要的更新

### 資源管理

1. **記憶體使用**: 限制歷史記錄數量（最多100條）
2. **網路使用**: 檢查網路連線，避免在無網路時執行
3. **電池優化**: 在適當時間執行更新（預設凌晨2點）

## 🔮 未來擴展

### 計劃中的功能

1. **更多資料來源**
   - 其他評級公司（CGC、SGC等）
   - 更多價格平台
   - 新聞和公告來源

2. **進階功能**
   - 自訂更新規則
   - 條件觸發更新
   - 更新通知系統
   - 資料品質監控

3. **分析功能**
   - 更新效能分析
   - 資料來源可靠性評分
   - 自動優化更新策略

### 擴展性設計

系統設計時考慮了良好的擴展性：

- 模組化的資料來源架構
- 可配置的更新策略
- 標準化的資料格式
- 可插拔的更新邏輯

## 📝 使用範例

### 完整設定範例

```javascript
import multiSourceAutoUpdateExample from '../examples/multiSourceAutoUpdateExample';

// 執行完整設定
await multiSourceAutoUpdateExample.completeMultiSourceAutoUpdateSetup();

// 查看詳細狀態
await multiSourceAutoUpdateExample.getDetailedStatus();

// 觸發特定來源更新
await multiSourceAutoUpdateExample.triggerSpecificSourceUpdate('grading.bgc');
```

### 自訂配置範例

```javascript
// 自訂資料來源配置
await multiSourceAutoUpdateService.toggleDataSource('pricing.ebay', false);
await multiSourceAutoUpdateService.setSourceUpdateInterval('grading.bgc', 12);

// 設定更新時間為下午3點
await multiSourceAutoUpdateService.setUpdateTime('15:00');
```

## 🚨 注意事項

### 使用限制

1. **網路依賴**: 需要穩定的網路連線
2. **API限制**: 某些資料來源可能有API呼叫限制
3. **電池消耗**: 背景更新可能增加電池消耗
4. **儲存空間**: 歷史記錄會佔用本地儲存空間

### 最佳實踐

1. **合理設定更新間隔**: 避免過於頻繁的更新
2. **監控更新狀態**: 定期檢查更新歷史和錯誤記錄
3. **網路環境**: 建議在WiFi環境下執行大規模更新
4. **錯誤處理**: 注意處理更新失敗的情況

## 📞 支援

如有問題或建議，請參考：

- 測試檔案: `src/tests/multiSourceAutoUpdateService.test.js`
- 使用範例: `src/examples/multiSourceAutoUpdateExample.js`
- 設定畫面: `src/screens/MultiSourceAutoUpdateSettingsScreen.js`
- 翻譯檔案: `src/i18n/locales/zh-TW.json`
