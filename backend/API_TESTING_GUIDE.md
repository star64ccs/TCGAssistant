# TCG Assistant API 測試指南

## 目錄
1. [環境設置](#環境設置)
2. [測試工具](#測試工具)
3. [認證API測試](#認證api測試)
4. [卡牌資料API測試](#卡牌資料api測試)
5. [收藏管理API測試](#收藏管理api測試)
6. [用戶歷史API測試](#用戶歷史api測試)
7. [批量測試腳本](#批量測試腳本)

## 環境設置

### 1. 啟動後端服務器
```bash
cd backend
npm start
```

### 2. 設置環境變數
複製 `.env.example` 到 `.env` 並配置：
```bash
cp .env.example .env
```

### 3. 初始化資料庫
```bash
npm run setup
npm run seed
```

## 測試工具

### Postman 集合
下載並導入以下Postman集合：
- [TCG Assistant API Collection](./postman/TCG_Assistant_API.postman_collection.json)

### curl 命令
所有API都可以使用curl進行測試

## 認證API測試

### 1. 用戶註冊
**POST** `/api/auth/register`

#### curl 命令：
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "測試用戶"
  }'
```

#### 預期回應：
```json
{
  "success": true,
  "message": "用戶註冊成功",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "測試用戶",
      "membership": "free",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 用戶登入
**POST** `/api/auth/login`

#### curl 命令：
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 預期回應：
```json
{
  "success": true,
  "message": "登入成功",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "測試用戶",
      "membership": "free"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 驗證Token
**POST** `/api/auth/verify`

#### curl 命令：
```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. 刷新Token
**POST** `/api/auth/refresh`

#### curl 命令：
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. 登出
**POST** `/api/auth/logout`

#### curl 命令：
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## 卡牌資料API測試

### 1. 獲取Pokemon卡牌
**GET** `/api/card-data/pokemon`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/card-data/pokemon?limit=10&page=1&search=pikachu" \
  -H "Content-Type: application/json"
```

#### 查詢參數：
- `limit`: 每頁數量 (預設: 20)
- `page`: 頁碼 (預設: 1)
- `search`: 搜尋關鍵字
- `rarity`: 稀有度篩選
- `set`: 系列篩選

### 2. 獲取One Piece卡牌
**GET** `/api/card-data/onepiece`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/card-data/onepiece?limit=10&page=1" \
  -H "Content-Type: application/json"
```

### 3. 獲取可用卡牌
**GET** `/api/card-data/available`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/card-data/available?limit=50&game=all" \
  -H "Content-Type: application/json"
```

### 4. 獲取特定卡牌
**GET** `/api/card-data/:id`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/card-data/1" \
  -H "Content-Type: application/json"
```

## 收藏管理API測試

### 1. 獲取用戶收藏
**GET** `/api/collection`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/collection?limit=20&page=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. 添加卡牌到收藏
**POST** `/api/collection/add`

#### curl 命令：
```bash
curl -X POST http://localhost:3000/api/collection/add \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cardId": 1,
    "purchaseDate": "2024-01-01",
    "purchasePrice": 25.50,
    "condition": "mint",
    "notes": "從本地卡店購買"
  }'
```

### 3. 更新收藏項目
**PUT** `/api/collection/update`

#### curl 命令：
```bash
curl -X PUT http://localhost:3000/api/collection/update \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": 1,
    "purchasePrice": 30.00,
    "condition": "near-mint",
    "notes": "價格上漲了"
  }'
```

### 4. 從收藏移除
**DELETE** `/api/collection/remove`

#### curl 命令：
```bash
curl -X DELETE http://localhost:3000/api/collection/remove \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": 1
  }'
```

### 5. 獲取收藏統計
**GET** `/api/collection/stats`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/collection/stats" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## 用戶歷史API測試

### 1. 獲取最近記錄
**GET** `/api/user-history/recent`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/user-history/recent?limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. 獲取所有歷史
**GET** `/api/user-history`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/user-history?limit=50&page=1&actionType=collection" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. 獲取歷史統計
**GET** `/api/user-history/stats`

#### curl 命令：
```bash
curl -X GET "http://localhost:3000/api/user-history/stats" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. 清除歷史記錄
**DELETE** `/api/user-history/clear`

#### curl 命令：
```bash
curl -X DELETE http://localhost:3000/api/user-history/clear \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## 批量測試腳本

### 創建測試腳本
```bash
# 創建測試腳本目錄
mkdir -p backend/tests/scripts
```

### 完整測試流程
```bash
#!/bin/bash
# test_all_apis.sh

BASE_URL="http://localhost:3000/api"
ACCESS_TOKEN=""

echo "=== TCG Assistant API 完整測試 ==="

# 1. 註冊新用戶
echo "1. 測試用戶註冊..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "測試用戶"
  }')

echo "註冊回應: $REGISTER_RESPONSE"

# 2. 登入
echo "2. 測試用戶登入..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "登入回應: $LOGIN_RESPONSE"

# 提取access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "錯誤: 無法獲取access token"
    exit 1
fi

echo "Access Token: $ACCESS_TOKEN"

# 3. 測試卡牌資料API
echo "3. 測試卡牌資料API..."
curl -s -X GET "$BASE_URL/card-data/pokemon?limit=5" | jq '.'

# 4. 測試收藏API
echo "4. 測試收藏API..."
curl -s -X GET "$BASE_URL/collection" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

# 5. 測試用戶歷史API
echo "5. 測試用戶歷史API..."
curl -s -X GET "$BASE_URL/user-history/recent" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo "=== 測試完成 ==="
```

### 運行測試
```bash
chmod +x backend/tests/scripts/test_all_apis.sh
./backend/tests/scripts/test_all_apis.sh
```

## 常見問題

### 1. 連接錯誤
- 確保後端服務器正在運行 (`npm start`)
- 檢查端口是否被佔用
- 確認防火牆設置

### 2. 認證錯誤
- 檢查JWT token是否有效
- 確認token格式正確 (Bearer + token)
- 檢查token是否過期

### 3. 資料庫錯誤
- 確保PostgreSQL正在運行
- 檢查資料庫連接設定
- 運行資料庫遷移和種子腳本

### 4. 驗證錯誤
- 檢查請求體格式是否正確
- 確認必填欄位都已提供
- 檢查資料類型是否正確

## 性能測試

### 使用Apache Bench進行負載測試
```bash
# 測試卡牌資料API
ab -n 1000 -c 10 http://localhost:3000/api/card-data/pokemon

# 測試認證API
ab -n 100 -c 5 -p login_data.json -T application/json http://localhost:3000/api/auth/login
```

### 監控API響應時間
```bash
# 使用curl測試響應時間
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/card-data/pokemon"
```

## 安全測試

### 1. 測試未授權訪問
```bash
# 嘗試訪問需要認證的端點而不提供token
curl -X GET "http://localhost:3000/api/collection"
```

### 2. 測試無效token
```bash
# 使用無效token
curl -X GET "http://localhost:3000/api/collection" \
  -H "Authorization: Bearer invalid_token"
```

### 3. 測試SQL注入防護
```bash
# 測試搜尋參數
curl -X GET "http://localhost:3000/api/card-data/pokemon?search='; DROP TABLE users; --"
```

## 測試報告模板

創建測試報告：
```bash
# 生成測試報告
echo "=== API測試報告 ===" > test_report.txt
echo "測試時間: $(date)" >> test_report.txt
echo "測試環境: $NODE_ENV" >> test_report.txt
echo "" >> test_report.txt

# 添加各項測試結果
echo "認證API: PASSED" >> test_report.txt
echo "卡牌資料API: PASSED" >> test_report.txt
echo "收藏API: PASSED" >> test_report.txt
echo "用戶歷史API: PASSED" >> test_report.txt
```

這個測試指南涵蓋了所有高優先級API端點的測試方法，包括Postman和curl兩種方式。您可以根據需要選擇合適的測試方法。
