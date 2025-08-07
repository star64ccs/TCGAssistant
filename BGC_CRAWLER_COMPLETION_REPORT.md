# BGC 爬蟲功能完成報告

## 專案概述

已成功實作遵守 robots.txt 的 BGC (Beckett Grading Company) 鑑定卡牌公司評級數量爬蟲功能。該功能能夠安全、合法地抓取 BGC 網站上的卡牌評級資料，並將其整合到卡牌辨識系統中。

## 實作功能

### ✅ 核心功能
1. **robots.txt 檢查與解析**
   - 自動檢查目標網站的 robots.txt
   - 解析 User-Agent、Disallow、Allow、Crawl-delay 規則
   - 嚴格遵守爬取延遲規則

2. **評級資料抓取**
   - 抓取卡牌總評級數量
   - 解析評級分佈 (PSA、BGS、CGC 等)
   - 計算平均評級分數
   - 支援多種評級標準

3. **資料庫整合**
   - 新增 `bgc_grading_data` 表儲存評級資料
   - 新增 `card_recognition_info` 表增強卡牌辨識資訊
   - 支援資料更新和快取機制

4. **批量處理**
   - 支援批量卡牌評級資料抓取
   - 可配置的延遲時間
   - 錯誤處理和重試機制

### ✅ 進階功能
1. **資料快取管理**
   - 7天資料新鮮度檢查
   - 自動更新過期資料
   - 減少重複請求

2. **統計分析**
   - 評級統計資料
   - 搜索評級資料
   - 資料清理功能

3. **服務狀態監控**
   - 爬蟲服務狀態檢查
   - 錯誤日誌記錄
   - 性能監控

## 檔案結構

### 新增檔案
```
src/
├── services/
│   └── bgcCrawlerService.js          # BGC 爬蟲核心服務
├── tests/
│   └── bgcCrawler.test.js            # 爬蟲功能測試
├── examples/
│   └── bgcCrawlerExample.js          # 使用範例
└── docs/
    └── BGC_CRAWLER_IMPLEMENTATION.md # 詳細實作說明
```

### 修改檔案
```
src/
├── services/
│   ├── databaseService.js            # 新增評級資料表和方法
│   └── cardService.js                # 整合 BGC 爬蟲功能
└── tests/
    └── __tests__/
        └── platformUtils.test.js     # 現有測試檔案
```

## 技術實作

### 1. BGCCrawlerService 核心服務
- **robots.txt 解析**: 使用正則表達式解析 robots.txt 規則
- **請求控制**: 實現延遲機制和 User-Agent 管理
- **資料解析**: 使用正則表達式解析 HTML 內容
- **錯誤處理**: 完善的錯誤處理和重試機制

### 2. 資料庫設計
```sql
-- BGC 評級資料表
CREATE TABLE bgc_grading_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_name VARCHAR(200) NOT NULL,
  card_series VARCHAR(100),
  total_graded INTEGER DEFAULT 0,
  average_grade DECIMAL(4,2) DEFAULT 0,
  grade_distribution TEXT,
  source VARCHAR(50) DEFAULT 'BGC',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(card_name, card_series)
);

-- 卡牌辨識資訊增強表
CREATE TABLE card_recognition_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id VARCHAR(50) NOT NULL,
  bgc_grading_count INTEGER DEFAULT 0,
  bgc_average_grade DECIMAL(4,2) DEFAULT 0,
  bgc_grade_distribution TEXT,
  bgc_last_updated TIMESTAMP,
  recognition_accuracy FLOAT DEFAULT 0,
  total_recognitions INTEGER DEFAULT 0,
  successful_recognitions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(card_id)
);
```

### 3. API 整合
- **單一卡牌評級**: `cardService.getCardGradingInfo(cardName, series)`
- **批量處理**: `cardService.batchGetGradingInfo(cards, options)`
- **資料更新**: `cardService.updateCardRecognitionWithGrading(cardId, cardName, series)`
- **統計查詢**: `cardService.getGradingStats()`
- **資料搜索**: `cardService.searchGradingData(query, limit)`

## 使用方法

### 基本使用
```javascript
import cardService from './services/cardService';

// 獲取單一卡牌評級資訊
const gradingData = await cardService.getCardGradingInfo('Charizard', 'Base Set');

// 批量獲取評級資訊
const cards = [
  { name: 'Charizard', series: 'Base Set' },
  { name: 'Blastoise', series: 'Base Set' }
];
const results = await cardService.batchGetGradingInfo(cards, {
  delayBetweenCards: 3000
});

// 更新卡牌辨識資訊
const result = await cardService.updateCardRecognitionWithGrading(
  'pokemon_base_004',
  'Charizard',
  'Base Set'
);
```

### 進階功能
```javascript
// 搜索評級資料
const searchResults = await cardService.searchGradingData('Charizard', 10);

// 獲取評級統計
const stats = await cardService.getGradingStats();

// 檢查服務狀態
const status = await cardService.checkBGCCrawlerStatus();

// 清理過期資料
const result = await cardService.cleanupExpiredGradingData(30);
```

## 測試覆蓋

### 測試檔案
- **bgcCrawler.test.js**: 完整的爬蟲功能測試
- **測試範圍**:
  - robots.txt 解析和檢查
  - 評級資料搜索和解析
  - 資料庫操作
  - 批量處理功能
  - 錯誤處理機制
  - 服務狀態檢查

### 測試執行
```bash
npm test src/tests/bgcCrawler.test.js
```

## 範例程式碼

### 完整範例
```javascript
import BGCCrawlerExample from './examples/bgcCrawlerExample';

const example = new BGCCrawlerExample();

// 執行完整範例
await example.runAllExamples();

// 執行自定義範例
await example.customExampleForSeries('Base Set', [
  'Charizard',
  'Blastoise',
  'Venusaur'
]);
```

## 安全與合規

### robots.txt 遵守
- ✅ 自動檢查 robots.txt
- ✅ 遵守 Crawl-delay 規則
- ✅ 尊重 User-Agent 限制
- ✅ 避免爬取禁止路徑

### 法律合規
- ✅ 合理使用原則
- ✅ 延遲控制機制
- ✅ 錯誤處理和降級
- ✅ 資料使用限制

## 性能優化

### 快取機制
- 7天資料新鮮度檢查
- 自動更新過期資料
- 減少重複網路請求

### 批量處理
- 可配置的延遲時間
- 錯誤隔離和重試
- 進度追蹤和狀態回報

### 資源管理
- 記憶體使用優化
- 網路請求控制
- 資料庫連接管理

## 錯誤處理

### 常見錯誤
1. **robots.txt 禁止**: 檢查規則並調整策略
2. **網路連接失敗**: 重試機制和錯誤日誌
3. **解析失敗**: 優雅降級和錯誤報告

### 錯誤處理機制
- 自動重試機制
- 錯誤日誌記錄
- 優雅降級處理
- 使用者友善的錯誤訊息

## 未來改進

### 功能擴展
- [ ] 支援更多評級公司 (PSA、CGC 等)
- [ ] 實時評級資料更新
- [ ] 評級趨勢分析
- [ ] 價格與評級關聯分析

### 技術優化
- [ ] 分散式爬蟲架構
- [ ] 智能延遲調整
- [ ] 更精確的資料解析
- [ ] 更好的錯誤恢復機制

### 使用者體驗
- [ ] 圖形化進度顯示
- [ ] 評級資料視覺化
- [ ] 自定義爬取規則
- [ ] 批量操作介面

## 總結

### 完成項目
✅ **BGC 爬蟲服務**: 完整的爬蟲功能實作
✅ **資料庫整合**: 新增評級資料表和相關方法
✅ **API 整合**: 與現有卡牌服務整合
✅ **測試覆蓋**: 完整的測試套件
✅ **使用範例**: 詳細的使用範例和文件
✅ **安全合規**: 遵守 robots.txt 和法律規範

### 技術特色
- 🔒 **安全合規**: 嚴格遵守 robots.txt 規範
- 📊 **資料完整**: 支援多種評級標準和統計分析
- 💾 **資料持久**: 完整的資料庫整合和快取機制
- 🔄 **批量處理**: 高效的批量資料抓取功能
- 🛡️ **錯誤處理**: 完善的錯誤處理和恢復機制

### 使用建議
1. **定期更新**: 定期檢查網站結構變更
2. **監控日誌**: 監控爬蟲運行狀態
3. **資料備份**: 定期備份評級資料
4. **性能優化**: 根據使用情況調整配置

BGC 爬蟲功能已完全實作並整合到 TCG Assistant 專案中，提供了安全、合法、高效的卡牌評級資料抓取能力。
