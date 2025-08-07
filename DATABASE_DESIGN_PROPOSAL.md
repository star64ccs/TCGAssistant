# TCG Assistant 資料庫設計提案

## 概述

TCG Assistant應用程式需要建立一個完整的資料庫系統來支援卡牌辨識、價格分析、收藏管理等功能。這個資料庫將包含本地資料庫和雲端資料庫兩個部分。

## 資料庫架構

### 1. 本地資料庫 (SQLite)

#### 1.1 卡牌基礎資料表 (cards)
```sql
CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id VARCHAR(50) UNIQUE NOT NULL,           -- 卡牌唯一識別碼
    name VARCHAR(200) NOT NULL,                    -- 卡牌名稱
    series VARCHAR(100) NOT NULL,                  -- 系列名稱
    set_code VARCHAR(20),                          -- 系列代碼
    card_number VARCHAR(20),                       -- 卡牌編號
    rarity VARCHAR(50),                            -- 稀有度
    card_type VARCHAR(50),                         -- 卡牌類型
    hp VARCHAR(10),                                -- HP值
    attack VARCHAR(10),                            -- 攻擊力
    defense VARCHAR(10),                           -- 防禦力
    description TEXT,                              -- 卡牌描述
    image_url VARCHAR(500),                        -- 卡牌圖片URL
    thumbnail_url VARCHAR(500),                    -- 縮圖URL
    game_type VARCHAR(20) DEFAULT 'pokemon',       -- 遊戲類型 (pokemon, yugioh, magic, onepiece)
    release_date DATE,                             -- 發行日期
    is_promo BOOLEAN DEFAULT FALSE,                -- 是否為促銷卡
    is_secret_rare BOOLEAN DEFAULT FALSE,          -- 是否為秘密稀有
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 卡牌圖片特徵表 (card_features)
```sql
CREATE TABLE card_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id VARCHAR(50) NOT NULL,                  -- 關聯到cards表
    feature_type VARCHAR(50) NOT NULL,             -- 特徵類型 (color_histogram, edge_detection, text_regions)
    feature_data TEXT NOT NULL,                    -- 特徵資料 (JSON格式)
    confidence_score FLOAT,                        -- 信心度分數
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
);
```

#### 1.3 價格歷史表 (price_history)
```sql
CREATE TABLE price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id VARCHAR(50) NOT NULL,                  -- 關聯到cards表
    platform VARCHAR(50) NOT NULL,                 -- 平台名稱
    price DECIMAL(10,2) NOT NULL,                  -- 價格
    currency VARCHAR(3) DEFAULT 'USD',             -- 貨幣
    condition VARCHAR(20),                         -- 狀況 (mint, nm, lp, mp, hp)
    date_recorded DATE NOT NULL,                   -- 記錄日期
    source VARCHAR(100),                           -- 資料來源
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
);
```

#### 1.4 用戶收藏表 (user_collection)
```sql
CREATE TABLE user_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) NOT NULL,                  -- 用戶ID
    card_id VARCHAR(50) NOT NULL,                  -- 關聯到cards表
    quantity INTEGER DEFAULT 1,                    -- 數量
    condition VARCHAR(20),                         -- 狀況
    purchase_price DECIMAL(10,2),                  -- 購買價格
    purchase_date DATE,                            -- 購買日期
    notes TEXT,                                    -- 備註
    is_favorite BOOLEAN DEFAULT FALSE,             -- 是否收藏
    folder_id INTEGER,                             -- 資料夾ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
);
```

#### 1.5 辨識歷史表 (recognition_history)
```sql
CREATE TABLE recognition_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) NOT NULL,                  -- 用戶ID
    image_hash VARCHAR(64),                        -- 圖片雜湊值
    recognized_card_id VARCHAR(50),                -- 辨識出的卡牌ID
    confidence_score FLOAT,                        -- 辨識信心度
    recognition_time TIMESTAMP,                    -- 辨識時間
    api_used VARCHAR(50),                          -- 使用的API
    processing_time INTEGER,                       -- 處理時間(毫秒)
    image_path VARCHAR(500),                       -- 圖片路徑
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 雲端資料庫 (Firebase/PostgreSQL)

#### 2.1 卡牌資料同步表 (card_sync)
```sql
CREATE TABLE card_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id VARCHAR(50) UNIQUE NOT NULL,
    last_sync TIMESTAMP,                           -- 最後同步時間
    sync_status VARCHAR(20) DEFAULT 'pending',     -- 同步狀態
    version INTEGER DEFAULT 1,                     -- 版本號
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2 市場價格表 (market_prices)
```sql
CREATE TABLE market_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    current_price DECIMAL(10,2),
    average_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    price_trend VARCHAR(10),                       -- up, down, stable
    volume_sold INTEGER,                           -- 銷售量
    last_updated TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 資料庫服務層設計

### 1. 本地資料庫服務 (LocalDatabaseService)

```javascript
class LocalDatabaseService {
  // 初始化資料庫
  async initDatabase() {
    // 建立資料表
    // 載入初始資料
  }

  // 卡牌相關操作
  async searchCards(query, filters = {}) {
    // 搜尋卡牌
  }

  async getCardById(cardId) {
    // 根據ID獲取卡牌
  }

  async getCardFeatures(cardId) {
    // 獲取卡牌特徵
  }

  // 辨識相關操作
  async findSimilarCards(imageFeatures) {
    // 根據圖片特徵找相似卡牌
  }

  async saveRecognitionResult(result) {
    // 儲存辨識結果
  }

  // 價格相關操作
  async getPriceHistory(cardId, platform) {
    // 獲取價格歷史
  }

  async updatePrices(cardId, prices) {
    // 更新價格資料
  }
}
```

### 2. 雲端資料庫服務 (CloudDatabaseService)

```javascript
class CloudDatabaseService {
  // 同步操作
  async syncCardData() {
    // 同步卡牌資料
  }

  async syncPrices() {
    // 同步價格資料
  }

  // 備份操作
  async backupUserData(userId) {
    // 備份用戶資料
  }

  async restoreUserData(userId) {
    // 還原用戶資料
  }
}
```

## 卡牌辨識流程

### 1. 離線辨識流程
```
1. 用戶拍照/上傳圖片
2. 提取圖片特徵 (顏色直方圖、邊緣檢測、文字區域)
3. 在本地資料庫中搜尋相似卡牌
4. 計算相似度分數
5. 返回最匹配的卡牌資訊
```

### 2. 線上辨識流程
```
1. 用戶拍照/上傳圖片
2. 嘗試離線辨識
3. 如果離線辨識失敗或信心度低，使用線上API
4. 將辨識結果儲存到本地資料庫
5. 同步到雲端資料庫
```

## 資料庫初始化

### 1. 初始資料載入
- **Pokemon卡牌資料**: 約15,000張卡牌
- **One Piece卡牌資料**: 約5,000張卡牌
- **Yu-Gi-Oh卡牌資料**: 約10,000張卡牌
- **Magic卡牌資料**: 約20,000張卡牌

### 2. 資料來源
- TCGPlayer API
- Pokemon API
- 官方卡牌資料庫
- 用戶貢獻的資料

## 效能優化

### 1. 索引設計
```sql
-- 卡牌搜尋索引
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_series ON cards(series);
CREATE INDEX idx_cards_game_type ON cards(game_type);

-- 價格查詢索引
CREATE INDEX idx_price_history_card_date ON price_history(card_id, date_recorded);
CREATE INDEX idx_price_history_platform ON price_history(platform);

-- 辨識歷史索引
CREATE INDEX idx_recognition_user_date ON recognition_history(user_id, recognition_time);
```

### 2. 快取策略
- 熱門卡牌資料快取
- 價格資料快取 (15分鐘更新)
- 圖片特徵快取

## 資料安全

### 1. 加密
- 敏感資料加密儲存
- 傳輸資料加密
- API金鑰安全儲存

### 2. 備份
- 本地資料自動備份
- 雲端資料定期備份
- 用戶資料匯出功能

## 實施計劃

### 第一階段 (1-2週)
1. 建立本地SQLite資料庫
2. 實作基本CRUD操作
3. 載入初始卡牌資料

### 第二階段 (2-3週)
1. 實作卡牌辨識演算法
2. 整合圖片特徵提取
3. 優化搜尋效能

### 第三階段 (1-2週)
1. 建立雲端資料庫
2. 實作資料同步機制
3. 測試和除錯

## 結論

建立完整的資料庫系統對於TCG Assistant的卡牌辨識功能是必要的。這個系統將提供：

1. **離線辨識能力**: 減少對網路連接的依賴
2. **更快的回應速度**: 本地搜尋比API調用更快
3. **更好的準確性**: 結合多種特徵進行辨識
4. **資料持久化**: 保存用戶的辨識歷史和收藏
5. **可擴展性**: 支援多種卡牌遊戲類型

這個資料庫設計將大大提升應用程式的用戶體驗和功能完整性。
