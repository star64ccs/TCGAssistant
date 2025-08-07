# TCG Assistant 後端API

這是TCG Assistant應用程序的後端API服務，提供完整的卡牌管理、用戶認證、收藏管理等功能。

## 功能特性

### 🔐 認證系統
- 用戶註冊/登入
- JWT令牌認證
- 令牌刷新機制
- 密碼加密存儲

### 🃏 卡牌數據管理
- Pokemon卡牌數據
- One Piece卡牌數據
- 卡牌搜索和篩選
- 卡牌詳情查詢

### 📚 收藏管理
- 添加/移除收藏
- 收藏列表查詢
- 收藏統計信息
- 收藏更新功能

### 📊 用戶歷史記錄
- 操作歷史追蹤
- 最近記錄查詢
- 統計分析
- 歷史記錄清理

## 技術棧

- **Node.js** - 運行時環境
- **Express.js** - Web框架
- **PostgreSQL** - 主數據庫
- **Sequelize** - ORM
- **JWT** - 認證令牌
- **bcryptjs** - 密碼加密
- **Joi** - 數據驗證
- **Winston** - 日誌記錄

## 快速開始

### 環境要求

- Node.js 18.0+
- PostgreSQL 12.0+
- Redis (可選，用於快取)

### 安裝步驟

1. **克隆項目**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **配置環境變數**
   ```bash
   cp env.example .env
   # 編輯 .env 文件，設置數據庫連接等配置
   ```

4. **設置數據庫**
   ```bash
   # 創建PostgreSQL數據庫
   createdb tcg_assistant
   
   # 運行數據庫遷移和種子數據
   npm run migrate
   npm run seed
   ```

5. **啟動服務器**
   ```bash
   # 開發模式
   npm run dev
   
   # 生產模式
   npm start
   ```

## API端點

### 認證端點
- `POST /api/v1/auth/login` - 用戶登入
- `POST /api/v1/auth/register` - 用戶註冊
- `POST /api/v1/auth/logout` - 用戶登出
- `POST /api/v1/auth/refresh` - 刷新令牌
- `POST /api/v1/auth/verify` - 驗證令牌

### 卡牌數據端點
- `GET /api/v1/cardData/pokemon` - 獲取Pokemon卡牌
- `GET /api/v1/cardData/onepiece` - 獲取One Piece卡牌
- `GET /api/v1/cardData/available` - 獲取可用卡牌
- `GET /api/v1/cardData/:id` - 獲取卡牌詳情

### 收藏管理端點
- `GET /api/v1/collection` - 獲取用戶收藏
- `POST /api/v1/collection/add` - 添加到收藏
- `DELETE /api/v1/collection/remove` - 從收藏移除
- `PUT /api/v1/collection/update` - 更新收藏
- `GET /api/v1/collection/stats` - 收藏統計

### 用戶歷史端點
- `GET /api/v1/userHistory/recent` - 獲取最近記錄
- `GET /api/v1/userHistory` - 獲取完整歷史
- `GET /api/v1/userHistory/stats` - 歷史統計
- `DELETE /api/v1/userHistory/clear` - 清除歷史

## 數據庫結構

### 用戶表 (users)
- id (UUID, 主鍵)
- email (字符串, 唯一)
- password (字符串, 加密)
- name (字符串)
- membership (枚舉: FREE, VIP, PREMIUM)
- membershipExpiry (日期)
- isActive (布爾值)
- lastLogin (日期)
- preferences (JSONB)

### 卡牌表 (cards)
- id (UUID, 主鍵)
- cardId (字符串, 唯一)
- name (字符串)
- series (字符串)
- setCode (字符串)
- cardNumber (字符串)
- rarity (字符串)
- cardType (字符串)
- hp (整數)
- attack (整數)
- defense (整數)
- description (文本)
- imageUrl (字符串)
- thumbnailUrl (字符串)
- gameType (枚舉: pokemon, onepiece, yugioh, magic)
- releaseDate (日期)
- isPromo (布爾值)
- isSecretRare (布爾值)
- currentPrice (小數)
- priceUpdatedAt (日期)

### 收藏表 (collections)
- id (UUID, 主鍵)
- userId (UUID, 外鍵)
- cardId (UUID, 外鍵)
- purchaseDate (日期)
- purchasePrice (小數)
- currentPrice (小數)
- isFavorite (布爾值)
- condition (枚舉)
- quantity (整數)
- notes (文本)

### 用戶歷史表 (user_histories)
- id (UUID, 主鍵)
- userId (UUID, 外鍵)
- cardId (UUID, 外鍵)
- actionType (枚舉)
- actionData (JSONB)
- result (JSONB)
- confidence (小數)
- ipAddress (字符串)
- userAgent (字符串)

## 環境變數配置

```env
# 服務器配置
NODE_ENV=development
PORT=3000
API_VERSION=v1

# 數據庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tcg_assistant
DB_USER=postgres
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 速率限制
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# 安全配置
CORS_ORIGIN=http://localhost:3000
ENABLE_SSL_PINNING=false
```

## 開發指南

### 項目結構
```
backend/
├── config/          # 配置文件
├── middleware/      # 中間件
├── models/          # 數據模型
├── routes/          # 路由
├── scripts/         # 腳本
├── utils/           # 工具函數
├── logs/            # 日誌文件
├── server.js        # 主服務器文件
├── package.json     # 依賴配置
└── README.md        # 說明文檔
```

### 添加新端點

1. 在 `routes/` 目錄下創建新的路由文件
2. 在 `server.js` 中註冊路由
3. 添加相應的數據模型（如需要）
4. 更新API文檔

### 數據庫遷移

```bash
# 創建新的遷移文件
npx sequelize-cli migration:generate --name migration-name

# 運行遷移
npm run migrate
```

### 測試

```bash
# 運行測試
npm test

# 運行測試並生成覆蓋率報告
npm run test:coverage
```

## 部署

### Docker部署

```bash
# 構建Docker鏡像
docker build -t tcg-assistant-backend .

# 運行容器
docker run -p 3000:3000 tcg-assistant-backend
```

### 生產環境配置

1. 設置 `NODE_ENV=production`
2. 配置生產數據庫
3. 設置強密碼和JWT密鑰
4. 配置HTTPS
5. 設置日誌輪轉
6. 配置監控和警報

## 安全考慮

- 所有密碼使用bcrypt加密
- JWT令牌有過期時間
- 實現速率限制防止濫用
- 輸入驗證和清理
- SQL注入防護
- CORS配置
- 安全頭部設置

## 性能優化

- 數據庫連接池
- 查詢優化和索引
- 響應快取
- 壓縮響應
- 日誌輪轉
- 錯誤處理

## 監控和日誌

- 使用Winston進行日誌記錄
- 錯誤追蹤和報告
- 性能監控
- 健康檢查端點

## 貢獻指南

1. Fork項目
2. 創建功能分支
3. 提交更改
4. 創建Pull Request

## 許可證

MIT License

## 支持

如有問題，請創建Issue或聯繫開發團隊。
