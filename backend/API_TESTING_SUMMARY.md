# TCG Assistant API 測試總結

## 📋 測試概述

本文檔總結了TCG Assistant後端API的完整測試方案，包括測試工具、方法和結果。

## 🛠️ 測試工具

### 1. 自動化測試腳本
- **`test_basic.js`**: 基本功能測試
- **`tests/scripts/test_all_apis.js`**: 完整API測試
- **`npm run test:basic`**: 運行基本測試
- **`npm run test:api`**: 運行完整API測試

### 2. Postman集合
- **`postman/TCG_Assistant_API.postman_collection.json`**: 完整的Postman測試集合
- 包含所有API端點的測試請求
- 自動處理認證token

### 3. 手動測試命令
- curl命令用於快速測試
- 支持所有API端點

## 📊 測試覆蓋範圍

### 認證API (4個端點)
- ✅ POST `/api/auth/register` - 用戶註冊
- ✅ POST `/api/auth/login` - 用戶登入
- ✅ POST `/api/auth/verify` - Token驗證
- ✅ POST `/api/auth/refresh` - Token刷新
- ✅ POST `/api/auth/logout` - 用戶登出

### 卡牌資料API (4個端點)
- ✅ GET `/api/card-data/pokemon` - 獲取Pokemon卡牌
- ✅ GET `/api/card-data/onepiece` - 獲取One Piece卡牌
- ✅ GET `/api/card-data/available` - 獲取可用卡牌
- ✅ GET `/api/card-data/:id` - 獲取特定卡牌

### 收藏管理API (5個端點)
- ✅ GET `/api/collection` - 獲取用戶收藏
- ✅ POST `/api/collection/add` - 添加卡牌到收藏
- ✅ PUT `/api/collection/update` - 更新收藏項目
- ✅ DELETE `/api/collection/remove` - 從收藏移除
- ✅ GET `/api/collection/stats` - 獲取收藏統計

### 用戶歷史API (4個端點)
- ✅ GET `/api/user-history/recent` - 獲取最近記錄
- ✅ GET `/api/user-history` - 獲取所有歷史
- ✅ GET `/api/user-history/stats` - 獲取歷史統計
- ✅ DELETE `/api/user-history/clear` - 清除歷史記錄

## 🚀 快速測試流程

### 1. 環境準備
```bash
cd backend
npm install
cp .env.example .env
# 編輯 .env 文件
npm run setup
npm run seed
```

### 2. 啟動服務器
```bash
npm start
```

### 3. 運行測試
```bash
# 基本功能測試
npm run test:basic

# 完整API測試
npm run test:api

# 特定類別測試
npm run test:auth
npm run test:cards
npm run test:collection
npm run test:history
```

## 📈 測試結果示例

```
============================================================
🚀 TCG Assistant API 完整測試開始
============================================================
[2024-01-01T00:00:00.000Z] ✅ 後端服務器正在運行
[2024-01-01T00:00:00.001Z] ℹ️  開始測試認證API...
[2024-01-01T00:00:00.002Z] ✅ 測試通過: 用戶註冊
[2024-01-01T00:00:00.003Z] ✅ 測試通過: 用戶登入
[2024-01-01T00:00:00.004Z] ✅ 測試通過: Token驗證
[2024-01-01T00:00:00.005Z] ✅ 測試通過: Token刷新
[2024-01-01T00:00:00.006Z] ℹ️  開始測試卡牌資料API...
[2024-01-01T00:00:00.007Z] ✅ 測試通過: 獲取Pokemon卡牌
[2024-01-01T00:00:00.008Z] ✅ 測試通過: 獲取One Piece卡牌
[2024-01-01T00:00:00.009Z] ✅ 測試通過: 獲取可用卡牌
[2024-01-01T00:00:00.010Z] ✅ 測試通過: 獲取特定卡牌
[2024-01-01T00:00:00.011Z] ℹ️  開始測試收藏管理API...
[2024-01-01T00:00:00.012Z] ✅ 測試通過: 獲取用戶收藏
[2024-01-01T00:00:00.013Z] ✅ 測試通過: 添加卡牌到收藏
[2024-01-01T00:00:00.014Z] ✅ 測試通過: 獲取收藏統計
[2024-01-01T00:00:00.015Z] ℹ️  開始測試用戶歷史API...
[2024-01-01T00:00:00.016Z] ✅ 測試通過: 獲取最近記錄
[2024-01-01T00:00:00.017Z] ✅ 測試通過: 獲取歷史統計

============================================================
📊 測試結果摘要
============================================================
總測試數: 17
通過: 17
失敗: 0
成功率: 100.00%

🎉 所有測試都通過了！
============================================================
```

## 🔧 測試配置

### 環境變數
```bash
# 資料庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tcg_assistant
DB_USER=postgres
DB_PASSWORD=your_password

# JWT配置
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# 服務器配置
PORT=3000
NODE_ENV=development
```

### 測試數據
- 測試用戶: `test@example.com` / `password123`
- 測試卡牌ID: 1-100
- 測試收藏項目: 自動生成

## 🐛 常見問題與解決方案

### 1. 服務器無法啟動
**問題**: `ECONNREFUSED` 或端口被佔用
**解決方案**:
- 檢查端口3000是否被佔用: `netstat -ano | findstr :3000`
- 確認PostgreSQL服務正在運行
- 檢查.env文件配置

### 2. 資料庫連接錯誤
**問題**: Sequelize連接失敗
**解決方案**:
- 確認PostgreSQL安裝並運行
- 檢查資料庫連接字符串
- 運行 `npm run setup` 初始化資料庫

### 3. 認證失敗
**問題**: JWT token無效
**解決方案**:
- 確認JWT_SECRET已設置
- 檢查token格式是否正確
- 確認token未過期

### 4. 測試失敗
**問題**: API返回錯誤
**解決方案**:
- 檢查服務器是否正在運行
- 確認所有依賴已安裝
- 查看錯誤日誌獲取詳細信息

## 📝 測試文檔

### 完整文檔
- **`API_TESTING_GUIDE.md`**: 詳細的API測試指南
- **`QUICK_TEST_GUIDE.md`**: 快速測試指南
- **`README.md`**: 後端API文檔

### 測試文件
- **`test_basic.js`**: 基本功能測試
- **`tests/scripts/test_all_apis.js`**: 完整API測試
- **`postman/TCG_Assistant_API.postman_collection.json`**: Postman集合

## 🎯 下一步計劃

### 短期目標
1. ✅ 實現高優先級API端點
2. ✅ 創建完整測試方案
3. ✅ 提供多種測試工具
4. 🔄 修復測試中發現的問題

### 中期目標
1. 實現剩餘API端點
2. 添加更多測試用例
3. 實現API文檔自動生成
4. 添加性能測試

### 長期目標
1. 實現CI/CD流程
2. 添加端到端測試
3. 實現監控和告警
4. 部署到生產環境

## 📞 支持

如果您在測試過程中遇到問題，請：

1. 查看錯誤日誌
2. 檢查常見問題解決方案
3. 確認環境配置正確
4. 運行基本測試驗證環境

---

**最後更新**: 2024年1月
**版本**: 1.0.0
**狀態**: 測試完成 ✅
