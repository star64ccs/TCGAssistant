# BGC 爬蟲功能實作說明

## 概述

本專案實作了遵守 robots.txt 的 BGC (Beckett Grading Company) 鑑定卡牌公司評級數量爬蟲功能。該功能能夠安全、合法地抓取 BGC 網站上的卡牌評級資料，並將其整合到卡牌辨識系統中。

## 功能特色

### 🔒 遵守 robots.txt
- 自動檢查並解析目標網站的 robots.txt
- 嚴格遵守爬取延遲規則 (Crawl-delay)
- 尊重網站的使用者代理 (User-Agent) 限制
- 避免爬取被禁止的路徑

### 📊 評級資料抓取
- 抓取卡牌總評級數量
- 解析評級分佈 (PSA、BGS、CGC 等)
- 計算平均評級分數
- 支援多種評級標準

### 💾 資料庫整合
- 自動儲存評級資料到本地資料庫
- 支援資料更新和快取機制
- 提供評級統計和分析功能
- 定期清理過期資料

### 🔄 批量處理
- 支援批量卡牌評級資料抓取
- 可配置的延遲時間
- 錯誤處理和重試機制
- 進度追蹤和狀態回報

## 技術架構

### 核心服務

#### 1. BGCCrawlerService (`src/services/bgcCrawlerService.js`)
主要的爬蟲服務，負責：
- robots.txt 檢查和解析
- 網頁內容抓取和解析
- 評級資料提取
- 請求延遲控制

#### 2. DatabaseService (`src/services/databaseService.js`)
資料庫服務擴展，新增：
- `bgc_grading_data` 表：儲存評級資料
- `card_recognition_info` 表：增強卡牌辨識資訊
- 相關的 CRUD 操作方法

#### 3. CardService (`src/services/cardService.js`)
卡牌服務整合，新增：
- 評級資料獲取方法
- 批量處理功能
- 資料快取管理
- 統計分析功能

### 資料庫結構

#### BGC 評級資料表 (`bgc_grading_data`)
```sql
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
```

#### 卡牌辨識資訊增強表 (`card_recognition_info`)
```sql
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

## 使用方法

### 基本使用

#### 1. 單一卡牌評級資料抓取
```javascript
import cardService from './services/cardService';

// 獲取單一卡牌的評級資訊
const gradingData = await cardService.getCardGradingInfo('Charizard', 'Base Set');

console.log('評級資料:', gradingData);
// 輸出:
// {
//   cardName: 'Charizard',
//   totalGraded: 1234,
//   averageGrade: 9.2,
//   gradeDistribution: { PSA: { '10': 45, '9': 123 }, BGS: { '9.5': 67 } },
//   lastUpdated: '2024-01-15T10:30:00Z',
//   source: 'BGC'
// }
```

#### 2. 批量卡牌評級資料抓取
```javascript
const cards = [
  { name: 'Charizard', series: 'Base Set' },
  { name: 'Blastoise', series: 'Base Set' },
  { name: 'Venusaur', series: 'Base Set' }
];

const results = await cardService.batchGetGradingInfo(cards, {
  delayBetweenCards: 3000 // 3秒延遲
});

results.forEach(result => {
  if (result.success) {
    console.log(`${result.card.name}: ${result.gradingData.totalGraded} 張評級`);
  }
});
```

#### 3. 更新卡牌辨識資訊
```javascript
const result = await cardService.updateCardRecognitionWithGrading(
  'pokemon_base_004', // 卡牌 ID
  'Charizard',        // 卡牌名稱
  'Base Set'          // 卡牌系列
);
```

### 進階功能

#### 1. 搜索評級資料
```javascript
const searchResults = await cardService.searchGradingData('Charizard', 10);
```

#### 2. 獲取評級統計
```javascript
const stats = await cardService.getGradingStats();
console.log('總評級數量:', stats.total_graded_cards);
```

#### 3. 檢查服務狀態
```javascript
const status = await cardService.checkBGCCrawlerStatus();
console.log('服務狀態:', status.status);
```

#### 4. 清理過期資料
```javascript
const result = await cardService.cleanupExpiredGradingData(30); // 30天前
console.log('刪除筆數:', result.deletedCount);
```

## 配置選項

### 爬蟲配置
```javascript
// 在 bgcCrawlerService.js 中可以調整以下配置
{
  baseUrl: 'https://www.bgccards.com',
  userAgent: 'TCGAssistant/1.0 (https://github.com/your-repo/tcg-assistant)',
  requestDelay: 1000, // 預設延遲時間 (毫秒)
  timeout: 15000      // 請求超時時間 (毫秒)
}
```

### 資料快取配置
```javascript
// 資料新鮮度檢查 (預設 7 天)
const isDataFresh = (lastUpdated) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(lastUpdated) > sevenDaysAgo;
};
```

## 錯誤處理

### 常見錯誤及解決方案

#### 1. robots.txt 禁止爬取
```javascript
// 錯誤: robots.txt 不允許爬取此網站
// 解決: 檢查 robots.txt 規則，調整爬取策略
```

#### 2. 網路連接失敗
```javascript
// 錯誤: Network error
// 解決: 檢查網路連接，增加重試機制
```

#### 3. 解析失敗
```javascript
// 錯誤: 解析失敗
// 解決: 檢查網站結構是否變更，更新解析邏輯
```

### 錯誤處理機制
- 自動重試機制
- 錯誤日誌記錄
- 優雅降級處理
- 使用者友善的錯誤訊息

## 測試

### 執行測試
```bash
npm test src/tests/bgcCrawler.test.js
```

### 測試覆蓋範圍
- robots.txt 解析和檢查
- 評級資料搜索和解析
- 資料庫操作
- 批量處理功能
- 錯誤處理機制
- 服務狀態檢查

## 範例程式碼

### 完整使用範例
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

## 注意事項

### 法律和道德考量
1. **遵守 robots.txt**: 嚴格遵守目標網站的爬取規則
2. **合理使用**: 避免過度頻繁的請求
3. **資料使用**: 僅用於個人或教育目的
4. **版權尊重**: 尊重原始資料的版權

### 技術注意事項
1. **延遲控制**: 確保請求間有足夠的延遲
2. **錯誤處理**: 妥善處理網路錯誤和解析錯誤
3. **資料驗證**: 驗證抓取資料的正確性
4. **資源管理**: 合理管理記憶體和網路資源

### 維護建議
1. **定期更新**: 定期檢查網站結構變更
2. **監控日誌**: 監控爬蟲運行狀態
3. **資料備份**: 定期備份評級資料
4. **性能優化**: 根據使用情況優化性能

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

## 貢獻指南

歡迎貢獻程式碼和改進建議！請確保：
1. 遵守現有的程式碼風格
2. 添加適當的測試
3. 更新相關文件
4. 遵循 robots.txt 規範

## 授權

本專案採用 MIT 授權條款。使用時請遵守相關法律法規和網站使用條款。
