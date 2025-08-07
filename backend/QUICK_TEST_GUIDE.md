# TCG Assistant API 快速測試指南

## 🚀 快速開始

### 1. 安裝依賴
```bash
cd backend
npm install
```

### 2. 設置環境
```bash
# 複製環境變數文件
cp .env.example .env

# 編輯 .env 文件，設置資料庫連接等
```

### 3. 初始化資料庫
```bash
npm run setup
npm run seed
```

### 4. 啟動服務器
```bash
npm start
```

### 5. 運行API測試
```bash
# 運行所有API測試
npm run test:api

# 或運行特定類別的測試
npm run test:auth      # 認證API測試
npm run test:cards     # 卡牌資料API測試
npm run test:collection # 收藏管理API測試
npm run test:history   # 用戶歷史API測試
```

## 📋 手動測試命令

### 認證API測試
```bash
# 1. 用戶註冊
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"測試用戶"}'

# 2. 用戶登入
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 卡牌資料API測試
```bash
# 獲取Pokemon卡牌
curl -X GET "http://localhost:3000/api/card-data/pokemon?limit=5"

# 獲取One Piece卡牌
curl -X GET "http://localhost:3000/api/card-data/onepiece?limit=5"

# 獲取可用卡牌
curl -X GET "http://localhost:3000/api/card-data/available?limit=10"
```

### 收藏管理API測試
```bash
# 獲取用戶收藏 (需要先登入獲取token)
curl -X GET "http://localhost:3000/api/collection" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 添加卡牌到收藏
curl -X POST http://localhost:3000/api/collection/add \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cardId":1,"purchaseDate":"2024-01-01","purchasePrice":25.50,"condition":"mint"}'
```

### 用戶歷史API測試
```bash
# 獲取最近記錄
curl -X GET "http://localhost:3000/api/user-history/recent?limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 獲取歷史統計
curl -X GET "http://localhost:3000/api/user-history/stats" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 Postman測試

1. 下載Postman
2. 導入集合文件: `postman/TCG_Assistant_API.postman_collection.json`
3. 設置環境變數:
   - `baseUrl`: `http://localhost:3000/api`
   - `accessToken`: (登入後自動設置)
   - `refreshToken`: (登入後自動設置)

## 📊 測試結果

測試完成後，您會看到類似以下的結果：

```
============================================================
🚀 TCG Assistant API 完整測試開始
============================================================
[2024-01-01T00:00:00.000Z] ✅ 後端服務器正在運行
[2024-01-01T00:00:00.001Z] ℹ️  開始測試認證API...
[2024-01-01T00:00:00.002Z] ✅ 測試通過: 用戶註冊
[2024-01-01T00:00:00.003Z] ✅ 測試通過: 用戶登入
...

============================================================
📊 測試結果摘要
============================================================
總測試數: 15
通過: 15
失敗: 0
成功率: 100.00%

🎉 所有測試都通過了！
============================================================
```

## 🐛 常見問題

### 1. 服務器無法啟動
- 檢查端口3000是否被佔用
- 確認PostgreSQL服務正在運行
- 檢查.env文件配置

### 2. 資料庫連接錯誤
- 確認PostgreSQL安裝並運行
- 檢查資料庫連接字符串
- 運行 `npm run setup` 初始化資料庫

### 3. 認證失敗
- 確認JWT_SECRET已設置
- 檢查token格式是否正確
- 確認token未過期

### 4. 測試失敗
- 檢查服務器是否正在運行
- 確認所有依賴已安裝
- 查看錯誤日誌獲取詳細信息

## 📝 測試報告

測試完成後，您可以查看詳細的測試報告：

- **API_TESTING_GUIDE.md**: 完整的API測試指南
- **postman/TCG_Assistant_API.postman_collection.json**: Postman集合
- **tests/scripts/test_all_apis.js**: 自動化測試腳本

## 🎯 下一步

1. 根據測試結果修復任何失敗的API
2. 添加更多測試用例
3. 實現剩餘的API端點
4. 進行性能測試
5. 部署到生產環境
