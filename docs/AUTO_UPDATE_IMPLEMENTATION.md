# 自動更新功能實作文檔

## 📋 功能概述

自動更新功能允許應用程式在背景自動更新BGC（Beckett Grading Company）的評級資料，確保卡牌辨識資訊始終保持最新狀態。

## 🎯 主要功能

### 1. 自動排程更新
- **每日自動更新**: 在指定時間自動執行資料更新
- **可自訂時間**: 用戶可設定每日更新的時間（預設凌晨2點）
- **背景執行**: 使用 `react-native-background-job` 在背景執行

### 2. 手動更新
- **立即更新**: 用戶可手動觸發立即更新
- **進度監控**: 即時顯示更新進度
- **結果回饋**: 顯示更新成功/失敗統計

### 3. 更新管理
- **更新歷史**: 記錄所有更新操作和結果
- **狀態監控**: 即時查看服務狀態
- **錯誤處理**: 完善的錯誤處理和重試機制

### 4. 智能更新
- **增量更新**: 只更新超過7天未更新的卡牌
- **網路檢查**: 自動檢查網路連接狀態
- **服務檢查**: 驗證BGC爬蟲服務可用性

## 🏗️ 技術架構

### 核心組件

#### 1. AutoUpdateService (`src/services/autoUpdateService.js`)
```javascript
class AutoUpdateService {
  // 初始化服務
  async init()
  
  // 啟用/停用自動更新
  async enableAutoUpdate(updateTime)
  async disableAutoUpdate()
  
  // 手動更新
  async triggerManualUpdate()
  
  // 設定管理
  async setUpdateTime(time)
  async getUpdateTime()
  
  // 狀態查詢
  async getServiceStatus()
  async isAutoUpdateEnabled()
  
  // 歷史記錄
  async getUpdateHistory(limit)
  async addUpdateHistory(record)
}
```

#### 2. 背景任務配置
```javascript
BackgroundJob.register({
  jobKey: 'bgc_auto_update',
  job: async () => {
    await autoUpdateService.performAutoUpdate();
  },
});
```

#### 3. 設定頁面 (`src/screens/AutoUpdateSettingsScreen.js`)
- 自動更新開關
- 更新時間設定
- 手動更新按鈕
- 更新歷史顯示

### 資料儲存

#### AsyncStorage 鍵值
```javascript
const STORAGE_KEYS = {
  AUTO_UPDATE_ENABLED: 'auto_update_enabled',
  AUTO_UPDATE_TIME: 'auto_update_time',
  LAST_UPDATE_TIME: 'last_update_time',
  UPDATE_HISTORY: 'update_history',
  UPDATE_SETTINGS: 'update_settings',
};
```

#### 更新歷史記錄結構
```javascript
{
  timestamp: '2024-01-01T00:00:00Z',
  type: 'automatic' | 'manual',
  status: 'success' | 'error',
  results: {
    total: 10,
    successful: 8,
    failed: 2,
    errors: ['Error message 1', 'Error message 2']
  },
  error: 'Error message' // 僅在 status 為 error 時存在
}
```

## 🔧 實作細節

### 1. 背景任務註冊
```javascript
async registerBackgroundJob() {
  try {
    BackgroundJob.register({
      jobKey: BACKGROUND_JOB_KEY,
      job: async () => {
        console.log('Background job started: BGC auto update');
        await this.performAutoUpdate();
      },
    });
  } catch (error) {
    console.error('Failed to register background job:', error);
    throw error;
  }
}
```

### 2. 自動更新排程
```javascript
async scheduleAutoUpdate() {
  const updateTime = await this.getUpdateTime();
  const [hours, minutes] = updateTime.split(':').map(Number);
  
  // 計算下次更新時間
  const now = new Date();
  const nextUpdate = new Date();
  nextUpdate.setHours(hours, minutes, 0, 0);
  
  // 如果今天的時間已過，設定為明天
  if (nextUpdate <= now) {
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }
  
  const delay = nextUpdate.getTime() - now.getTime();
  
  await BackgroundJob.schedule({
    jobKey: BACKGROUND_JOB_KEY,
    delay: delay,
    period: 24 * 60 * 60 * 1000, // 24小時重複
    networkType: BackgroundJob.NETWORK_TYPE_ANY,
    requiresCharging: false,
    requiresDeviceIdle: false,
    persist: true,
  });
}
```

### 3. 智能更新邏輯
```javascript
async getCardsToUpdate() {
  // 獲取所有收藏的卡牌
  const collection = await databaseService.getCollection();
  
  // 過濾出需要更新的卡牌（超過7天未更新）
  const cardsToUpdate = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  for (const card of collection) {
    const lastUpdated = new Date(card.bgc_last_updated || 0);
    if (lastUpdated < sevenDaysAgo) {
      cardsToUpdate.push({
        cardId: card.card_id,
        cardName: card.card_name,
        cardSeries: card.card_series,
      });
    }
  }
  
  return cardsToUpdate;
}
```

### 4. 批量更新處理
```javascript
async batchUpdateCards(cards) {
  const results = {
    total: cards.length,
    successful: 0,
    failed: 0,
    errors: [],
  };

  for (const card of cards) {
    try {
      // 獲取評級資訊
      const gradingInfo = await cardService.getCardGradingInfo(
        card.cardName,
        card.cardSeries
      );
      
      if (gradingInfo) {
        // 更新卡牌辨識資訊
        await cardService.updateCardRecognitionWithGrading(
          card.cardId,
          card.cardName,
          card.cardSeries
        );
        results.successful++;
      } else {
        results.failed++;
        results.errors.push(`No grading info for ${card.cardName}`);
      }
      
      // 延遲避免過度請求
      await this.delay(2000);
      
    } catch (error) {
      results.failed++;
      results.errors.push(`Error updating ${card.cardName}: ${error.message}`);
    }
  }

  return results;
}
```

## 📱 用戶介面

### 設定頁面功能

#### 1. 自動更新開關
- 啟用/停用自動更新功能
- 即時狀態反饋

#### 2. 更新時間設定
- 時間選擇器（HH:MM 格式）
- 預設時間：02:00（凌晨2點）

#### 3. 手動更新
- 立即執行更新按鈕
- 更新進度指示器
- 完成狀態通知

#### 4. 更新歷史
- 最近20條更新記錄
- 成功/失敗狀態顯示
- 詳細結果統計

## 🔄 更新流程

### 自動更新流程
1. **背景任務觸發** → 檢查網路連接
2. **服務狀態檢查** → 驗證BGC爬蟲服務
3. **卡牌篩選** → 找出需要更新的卡牌
4. **批量更新** → 逐一更新卡牌資料
5. **結果記錄** → 儲存更新歷史
6. **清理作業** → 清理過期資料

### 手動更新流程
1. **用戶觸發** → 點擊手動更新按鈕
2. **進度顯示** → 顯示更新進度
3. **執行更新** → 執行與自動更新相同的邏輯
4. **結果回饋** → 顯示更新結果

## ⚙️ 配置選項

### 預設設定
```javascript
{
  enabled: false,
  updateTime: '02:00',
  maxRetries: 3,
  retryDelay: 5000,
  batchSize: 10,
}
```

### 可自訂參數
- **更新時間**: 24小時制時間格式
- **重試次數**: 更新失敗時的重試次數
- **重試延遲**: 重試間隔時間（毫秒）
- **批次大小**: 每次處理的卡牌數量

## 🛡️ 錯誤處理

### 1. 網路錯誤
- 自動檢查網路連接
- 網路不可用時跳過更新
- 記錄網路錯誤到歷史

### 2. 服務錯誤
- 檢查BGC爬蟲服務狀態
- 服務不可用時跳過更新
- 記錄服務錯誤到歷史

### 3. 更新錯誤
- 個別卡牌更新失敗不影響其他卡牌
- 詳細錯誤訊息記錄
- 失敗統計和報告

### 4. 重試機制
```javascript
export const robustUpdateWithRetry = async (maxRetries = 3) => {
  let retryCount = 0;
  let success = false;
  
  while (retryCount < maxRetries && !success) {
    try {
      await autoUpdateService.triggerManualUpdate();
      success = true;
    } catch (error) {
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }
};
```

## 📊 監控和分析

### 1. 更新統計
- 總更新次數
- 成功/失敗比例
- 平均更新時間
- 錯誤類型分析

### 2. 效能監控
- 更新執行時間
- 記憶體使用情況
- 網路請求統計
- 背景任務執行狀態

### 3. 用戶行為分析
- 自動更新啟用率
- 手動更新使用頻率
- 更新時間偏好
- 錯誤處理行為

## 🧪 測試

### 單元測試 (`src/tests/autoUpdateService.test.js`)
- 服務初始化測試
- 自動更新開關測試
- 更新時間管理測試
- 服務狀態查詢測試
- 更新歷史管理測試
- 手動更新測試
- 網路連接檢查測試

### 整合測試
- 與BGC爬蟲服務整合測試
- 與卡牌服務整合測試
- 與資料庫服務整合測試
- 背景任務執行測試

## 🚀 部署和維護

### 1. 初始化
```javascript
// 在應用程式啟動時初始化
import autoUpdateService from './services/autoUpdateService';

// App.js 或 index.js
useEffect(() => {
  autoUpdateService.init();
}, []);
```

### 2. 權限設定
```xml
<!-- Android Manifest -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 3. 背景任務配置
```javascript
// 確保背景任務在應用程式重啟後仍能執行
BackgroundJob.start();
```

## 🔮 未來改進

### 1. 智能排程
- 根據用戶使用習慣調整更新時間
- 網路狀況感知的更新策略
- 電池優化的更新時機

### 2. 增量同步
- 只同步變更的資料
- 差異化更新策略
- 更高效的資料傳輸

### 3. 多來源支援
- 支援多個評級公司
- 資料來源自動切換
- 資料一致性檢查

### 4. 進階分析
- 更新效果分析
- 資料品質評估
- 用戶滿意度追蹤

## 📝 使用範例

### 基本使用
```javascript
import autoUpdateService from './services/autoUpdateService';

// 初始化
await autoUpdateService.init();

// 啟用自動更新
await autoUpdateService.enableAutoUpdate('03:00');

// 手動更新
await autoUpdateService.triggerManualUpdate();

// 查看狀態
const status = await autoUpdateService.getServiceStatus();
console.log(status);
```

### 進階使用
```javascript
import { runExamples } from './examples/autoUpdateExample';

// 執行完整範例
await runExamples();

// 批量更新特定卡牌
const cardList = [
  { cardId: '1', cardName: 'Pikachu', cardSeries: 'Base Set' },
  { cardId: '2', cardName: 'Charizard', cardSeries: 'Base Set' }
];
await batchUpdateSpecificCards(cardList);
```

---

**版本**: 1.0.0  
**最後更新**: 2024年12月  
**維護者**: TCG Assistant Development Team
