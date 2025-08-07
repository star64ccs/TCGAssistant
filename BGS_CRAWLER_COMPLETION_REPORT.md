# BGS 爬蟲功能完成報告

## 📋 專案概述

已成功將 BGC (Beckett Grading Company) 爬蟲更換為 BGS (Beckett Grading Service) 爬蟲，並確保完全遵守 robots.txt 規範。該功能能夠安全、合法地抓取 BGS 網站上的卡牌評級資料，並將其整合到卡牌辨識系統中。

## 🎯 主要目標

- ✅ **更換爬蟲來源**: 從 BGC 更換為 BGS
- ✅ **遵守 robots.txt**: 完全遵守網站爬取規範
- ✅ **支援 .5 評級**: 處理 BGS 特有的 .5 評級格式
- ✅ **資料庫整合**: 更新資料庫結構支援 BGS 資料
- ✅ **向後兼容**: 保持與現有系統的兼容性

## 📁 實作檔案結構

```
src/
├── services/
│   ├── bgsCrawlerService.js          # BGS 爬蟲核心服務
│   ├── databaseService.js            # 更新資料庫服務
│   └── cardService.js                # 更新卡牌服務
├── tests/
│   └── bgsCrawler.test.js            # BGS 爬蟲功能測試
├── examples/
│   └── bgsCrawlerExample.js          # 使用範例
└── docs/
    └── BGS_CRAWLER_IMPLEMENTATION.md # 詳細實作說明
```

## 🗄️ 資料庫更新

### 新增 BGS 評級資料表
```sql
CREATE TABLE IF NOT EXISTS bgs_grading_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_name VARCHAR(200) NOT NULL,
  card_series VARCHAR(100),
  total_graded INTEGER DEFAULT 0,
  average_grade DECIMAL(4,2) DEFAULT 0,
  grade_distribution TEXT,
  source VARCHAR(50) DEFAULT 'BGS',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(card_name, card_series)
);
```

### 更新卡牌辨識資訊表
```sql
ALTER TABLE card_recognition_info ADD COLUMN bgs_grading_count INTEGER DEFAULT 0;
ALTER TABLE card_recognition_info ADD COLUMN bgs_average_grade DECIMAL(4,2) DEFAULT 0;
ALTER TABLE card_recognition_info ADD COLUMN bgs_grade_distribution TEXT;
ALTER TABLE card_recognition_info ADD COLUMN bgs_last_updated TIMESTAMP;
```

## 🔧 核心功能實作

### 1. BGSCrawlerService 核心服務

#### 主要功能
- **robots.txt 檢查**: 自動檢查並遵守網站爬取規範
- **評級資料抓取**: 支援 BGS 特有的 .5 評級格式
- **資料解析**: 智能解析 HTML 內容中的評級資訊
- **快取機制**: 避免重複請求，提高效能
- **錯誤處理**: 完善的錯誤處理和重試機制

#### 關鍵方法
```javascript
// 搜索卡牌評級數量
async searchCardGradingCount(cardName, cardSeries = null)

// 批量搜索
async batchSearchGrading(cards, delayBetweenCards = 2000)

// 獲取快取資料
async getCachedGradingData(cardName, cardSeries)

// 檢查服務狀態
async checkServiceStatus()
```

### 2. 資料庫服務更新

#### 新增 BGS 專用方法
```javascript
// BGS 評級資料操作
async insertBGSCardGradingData(cardName, cardSeries, gradingData)
async updateBGSCardGradingData(cardName, cardSeries, gradingData)
async getBGSCardGradingData(cardName, cardSeries)
```

#### 更新卡牌辨識資訊
```javascript
// 支援 BGS 和 BGC 雙重評級資訊
async updateCardRecognitionInfo(cardId, recognitionInfo)
```

### 3. 卡牌服務整合

#### 更新評級資訊獲取
```javascript
// 支援指定評級來源
async getCardGradingInfo(cardName, cardSeries = null, source = 'BGS')
```

## 🧪 測試覆蓋

### 測試項目
- ✅ **robots.txt 檢查**: 驗證 robots.txt 解析和遵守
- ✅ **評級資料搜索**: 測試單一卡牌評級搜索
- ✅ **BGS 特定格式**: 測試 .5 評級格式處理
- ✅ **資料庫整合**: 測試資料儲存和更新
- ✅ **批量處理**: 測試批量卡牌處理
- ✅ **服務狀態**: 測試服務健康檢查
- ✅ **卡牌服務整合**: 測試與現有系統整合
- ✅ **資料清理**: 測試過期資料清理
- ✅ **BGS 特定功能**: 測試 BGS 特有功能

### 測試結果
```
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        7.989 s
```

## 🔒 robots.txt 遵守

### 實作細節
- **自動檢查**: 每次初始化時自動檢查 robots.txt
- **延遲遵守**: 根據 robots.txt 設定調整請求延遲
- **路徑檢查**: 檢查特定路徑是否允許爬取
- **用戶代理**: 使用標準用戶代理字串

### 配置範例
```javascript
// robots.txt 檢查
await bgsCrawlerService.checkRobotsTxt();

// 檢查是否允許爬取
const isAllowed = bgsCrawlerService.isAllowedToCrawl('/search');

// 獲取服務狀態
const status = await bgsCrawlerService.checkServiceStatus();
```

## 📊 BGS 特定功能

### .5 評級支援
BGS 使用 .5 評級系統，實作包含：
- **評級解析**: 支援 9.5, 8.5 等格式
- **平均計算**: 正確計算包含 .5 評級的平均值
- **分佈統計**: 完整統計各評級數量

### 評級格式範例
```javascript
// BGS 評級分佈
{
  "BGS": {
    "10": 45,
    "9.5": 123,
    "9": 67,
    "8.5": 89
  }
}
```

## 🚀 使用範例

### 基本使用
```javascript
import bgsCrawlerService from './services/bgsCrawlerService';

// 搜索單一卡牌
const result = await bgsCrawlerService.searchCardGradingCount('Charizard', 'Base Set');

// 批量搜索
const cards = [
  { name: 'Charizard', series: 'Base Set' },
  { name: 'Blastoise', series: 'Base Set' }
];
const results = await bgsCrawlerService.batchSearchGrading(cards);
```

### 卡牌服務整合
```javascript
import cardService from './services/cardService';

// 獲取 BGS 評級資訊
const gradingInfo = await cardService.getCardGradingInfo('Charizard', 'Base Set', 'BGS');

// 更新卡牌辨識資訊
await cardService.updateCardRecognitionWithGrading('card123', 'Charizard', 'Base Set', 'BGS');
```

## 🔄 向後兼容性

### 保持兼容
- **API 介面**: 保持與現有 API 的兼容性
- **資料格式**: 保持資料格式一致性
- **錯誤處理**: 保持錯誤處理機制
- **配置選項**: 支援來源選擇參數

### 遷移指南
```javascript
// 舊版本 (BGC)
const result = await cardService.getCardGradingInfo('Charizard', 'Base Set');

// 新版本 (BGS)
const result = await cardService.getCardGradingInfo('Charizard', 'Base Set', 'BGS');

// 或保持預設 BGS
const result = await cardService.getCardGradingInfo('Charizard', 'Base Set');
```

## 📈 效能優化

### 快取機制
- **記憶體快取**: 30分鐘快取過期
- **資料庫快取**: 持久化快取資料
- **智能更新**: 僅在資料過期時更新

### 請求優化
- **批量處理**: 支援批量卡牌處理
- **延遲控制**: 遵守 robots.txt 延遲要求
- **錯誤重試**: 自動重試失敗請求

## 🔍 監控與維護

### 服務監控
```javascript
// 檢查服務狀態
const status = await bgsCrawlerService.checkServiceStatus();
console.log('服務狀態:', status.status);
console.log('robots.txt 遵守:', status.robotsTxtRespected);
```

### 資料清理
```javascript
// 清理過期資料
const deletedCount = await bgsCrawlerService.cleanupExpiredData(30);
console.log(`清理了 ${deletedCount} 條過期資料`);
```

## ✅ 完成清單

### 核心功能
- ✅ **BGS 爬蟲服務**: 完整的爬蟲功能實作
- ✅ **資料庫更新**: 新增 BGS 資料表和欄位
- ✅ **robots.txt 遵守**: 完整的 robots.txt 檢查和遵守
- ✅ **.5 評級支援**: 支援 BGS 特有的評級格式
- ✅ **測試覆蓋**: 完整的單元測試
- ✅ **使用範例**: 詳細的使用範例和文檔

### 整合功能
- ✅ **卡牌服務整合**: 更新卡牌服務支援 BGS
- ✅ **向後兼容**: 保持與現有系統的兼容性
- ✅ **錯誤處理**: 完善的錯誤處理機制
- ✅ **效能優化**: 快取和批量處理優化
- ✅ **監控功能**: 服務狀態監控和資料清理

## 🎉 總結

BGS 爬蟲功能已完全實作並整合到 TCG Assistant 專案中，提供了安全、合法、高效的卡牌評級資料抓取能力。新系統具有以下特點：

### 主要優勢
1. **完全遵守 robots.txt**: 確保合法合規的網站爬取
2. **支援 BGS 特色**: 完整支援 .5 評級系統
3. **高效能**: 快取機制和批量處理優化
4. **穩定可靠**: 完善的錯誤處理和重試機制
5. **易於維護**: 完整的測試覆蓋和監控功能

### 技術特色
- **模組化設計**: 清晰的服務分離和職責劃分
- **可擴展性**: 支援多種評級來源
- **資料完整性**: 完整的資料庫結構和資料驗證
- **用戶友好**: 簡潔的 API 介面和詳細文檔

BGS 爬蟲功能已成功替換原有的 BGC 爬蟲，為 TCG Assistant 應用程式提供了更準確、更完整的卡牌評級資料服務。
