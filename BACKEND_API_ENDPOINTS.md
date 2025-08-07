# TCG Assistant 後端API端點清單

## 概述
本文檔列出了TCG Assistant應用程序需要實現的所有後端API端點。這些端點基於前端代碼中的實際API調用需求。

## 基礎配置
- **基礎URL**: `https://api.tcg-assistant.com/api/v1`
- **認證方式**: Bearer Token (JWT)
- **內容類型**: `application/json`
- **響應格式**: JSON

## 1. 認證相關端點 (Authentication)

### 1.1 用戶登入
- **端點**: `POST /auth/login`
- **描述**: 用戶登入認證
- **請求體**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "socialLogin": false,
    "socialData": null
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "用戶名稱",
      "membership": "FREE"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
  ```

### 1.2 用戶註冊
- **端點**: `POST /auth/register`
- **描述**: 新用戶註冊
- **請求體**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "name": "新用戶"
  }
  ```
- **響應**: 同登入響應

### 1.3 登出
- **端點**: `POST /auth/logout`
- **描述**: 用戶登出
- **請求體**: 空
- **響應**:
  ```json
  {
    "success": true,
    "message": "登出成功"
  }
  ```

### 1.4 Token刷新
- **端點**: `POST /auth/refresh`
- **描述**: 刷新訪問令牌
- **請求體**:
  ```json
  {
    "refreshToken": "refresh_token_here"
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
  ```

### 1.5 驗證令牌
- **端點**: `POST /auth/verify`
- **描述**: 驗證當前令牌有效性
- **請求體**: 空
- **響應**:
  ```json
  {
    "success": true,
    "valid": true
  }
  ```

## 2. 卡牌數據相關端點 (Card Data)

### 2.1 獲取Pokemon卡牌
- **端點**: `GET /cardData/pokemon`
- **描述**: 獲取Pokemon卡牌數據
- **查詢參數**:
  - `limit`: 限制返回數量 (預設: 1000)
  - `offset`: 偏移量
  - `series`: 系列篩選
  - `rarity`: 稀有度篩選
- **響應**:
  ```json
  {
    "success": true,
    "cards": [
      {
        "id": "pokemon_001",
        "name": "皮卡丘 V",
        "series": "Sword & Shield",
        "setCode": "SWSH",
        "number": "043/185",
        "rarity": "Ultra Rare",
        "type": "Lightning",
        "hp": 200,
        "attack": 120,
        "defense": 80,
        "description": "卡牌描述",
        "imageUrl": "https://example.com/image.jpg",
        "thumbnailUrl": "https://example.com/thumb.jpg",
        "releaseDate": "2020-02-07",
        "isPromo": false,
        "isSecretRare": false
      }
    ],
    "total": 1000,
    "hasMore": true
  }
  ```

### 2.2 獲取One Piece卡牌
- **端點**: `GET /cardData/onepiece`
- **描述**: 獲取One Piece卡牌數據
- **查詢參數**: 同Pokemon卡牌
- **響應格式**: 同Pokemon卡牌

### 2.3 獲取可用卡牌
- **端點**: `GET /cardData/available`
- **描述**: 獲取所有可用的卡牌數據
- **查詢參數**:
  - `limit`: 限制返回數量 (預設: 100)
  - `gameType`: 遊戲類型 (pokemon, onepiece, yugioh, magic)
  - `search`: 搜尋關鍵字
- **響應**:
  ```json
  {
    "success": true,
    "cards": [
      {
        "id": "card_001",
        "name": "卡牌名稱",
        "gameType": "pokemon",
        "series": "系列名稱",
        "number": "001/100",
        "rarity": "稀有度",
        "imageUrl": "https://example.com/image.jpg"
      }
    ]
  }
  ```

## 3. 用戶歷史記錄端點 (User History)

### 3.1 獲取最近記錄
- **端點**: `GET /userHistory/recent`
- **描述**: 獲取用戶最近的操作記錄
- **查詢參數**:
  - `userId`: 用戶ID
  - `limit`: 限制返回數量 (預設: 5)
  - `type`: 記錄類型 (recognition, prediction, check)
- **響應**:
  ```json
  {
    "success": true,
    "records": [
      {
        "id": "record_001",
        "type": "recognition",
        "cardName": "皮卡丘 V",
        "cardImage": "https://example.com/image.jpg",
        "price": 42.87,
        "rarity": "Ultra Rare",
        "number": "043/185",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
  ```

## 4. 收藏管理端點 (Collection)

### 4.1 獲取用戶收藏
- **端點**: `GET /collection`
- **描述**: 獲取用戶的收藏列表
- **查詢參數**:
  - `userId`: 用戶ID
  - `limit`: 限制返回數量
  - `offset`: 偏移量
- **響應**:
  ```json
  {
    "success": true,
    "collection": [
      {
        "id": "collection_001",
        "cardId": "card_001",
        "cardName": "皮卡丘 V",
        "set": "Sword & Shield",
        "number": "043/185",
        "rarity": "Ultra Rare",
        "purchaseDate": "2024-01-15",
        "purchasePrice": 35.00,
        "currentPrice": 42.87,
        "profitLoss": 7.87,
        "profitLossPercentage": 22.5,
        "isFavorite": false,
        "imageUrl": "https://example.com/image.jpg"
      }
    ],
    "totalValue": 1500.00,
    "totalCards": 25
  }
  ```

### 4.2 添加到收藏
- **端點**: `POST /collection/add`
- **描述**: 將卡牌添加到用戶收藏
- **請求體**:
  ```json
  {
    "userId": "user_123",
    "cardData": {
      "cardId": "card_001",
      "cardName": "皮卡丘 V",
      "set": "Sword & Shield",
      "number": "043/185",
      "rarity": "Ultra Rare",
      "purchaseDate": "2024-01-15",
      "purchasePrice": 35.00,
      "isFavorite": false
    }
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "message": "卡牌已成功添加到收藏",
    "cardId": "collection_001"
  }
  ```

### 4.3 從收藏移除
- **端點**: `DELETE /collection/remove`
- **描述**: 從收藏中移除卡牌
- **請求體**:
  ```json
  {
    "userId": "user_123",
    "cardId": "collection_001"
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "message": "卡牌已從收藏中移除"
  }
  ```

### 4.4 更新收藏
- **端點**: `PUT /collection/update`
- **描述**: 更新收藏中的卡牌信息
- **請求體**:
  ```json
  {
    "userId": "user_123",
    "cardId": "collection_001",
    "updates": {
      "purchasePrice": 40.00,
      "isFavorite": true
    }
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "message": "收藏已更新"
  }
  ```

### 4.5 收藏統計
- **端點**: `GET /collection/stats`
- **描述**: 獲取收藏統計信息
- **查詢參數**:
  - `userId`: 用戶ID
- **響應**:
  ```json
  {
    "success": true,
    "stats": {
      "totalCards": 25,
      "totalValue": 1500.00,
      "averageValue": 60.00,
      "mostValuable": "皮卡丘 V",
      "recentAdditions": 3
    }
  }
  ```

## 5. 價格預測端點 (Price Prediction)

### 5.1 價格預測
- **端點**: `POST /pricePrediction/predict`
- **描述**: 預測卡牌未來價格
- **請求體**:
  ```json
  {
    "cardId": "card_001",
    "cardName": "皮卡丘 V",
    "period": "1_month"
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "prediction": {
      "currentPrice": 42.87,
      "predictedPrice": 48.50,
      "changePercentage": 13.1,
      "confidence": 85.5,
      "factors": [
        "市場需求上升",
        "新系列發布",
        "競技環境變化"
      ],
      "trend": "up",
      "timeframe": "1_month"
    }
  }
  ```

## 6. 真偽檢查端點 (Authenticity Check)

### 6.1 真偽檢查
- **端點**: `POST /authenticityCheck/check`
- **描述**: 檢查卡牌真偽
- **請求體**:
  ```json
  {
    "imageFile": "base64_encoded_image_or_file_data",
    "userId": "user_123"
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "checkResult": {
      "authentic": true,
      "confidence": 95.5,
      "cardInfo": {
        "name": "皮卡丘 V",
        "series": "Sword & Shield",
        "number": "043/185",
        "rarity": "Ultra Rare"
      },
      "checkPoints": [
        {
          "feature": "hologram",
          "result": "pass",
          "confidence": 98.0
        },
        {
          "feature": "watermark",
          "result": "pass",
          "confidence": 92.0
        }
      ],
      "overallScore": 95.5
    }
  }
  ```

## 7. AI聊天機器人端點 (AI Chatbot)

### 7.1 生成AI回應
- **端點**: `POST /aiChatbot/generate`
- **描述**: 生成AI聊天回應
- **請求體**:
  ```json
  {
    "userInput": "這張卡牌值得投資嗎？",
    "userId": "user_123",
    "conversationHistory": [
      {
        "role": "user",
        "content": "你好"
      },
      {
        "role": "assistant",
        "content": "您好！我是TCG助手，有什麼可以幫助您的嗎？"
      }
    ]
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "response": "根據市場分析，這張皮卡丘 V 卡牌目前處於上升趨勢...",
    "model": "gpt-4",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 200,
      "total_tokens": 350
    }
  }
  ```

## 8. 卡牌辨識端點 (Card Recognition)

### 8.1 卡牌辨識
- **端點**: `POST /cardRecognition/recognize`
- **描述**: 辨識上傳的卡牌圖片
- **請求體**:
  ```json
  {
    "imageFile": "base64_encoded_image_or_file_data",
    "gameType": "pokemon",
    "options": {
      "confidence": 0.7,
      "maxResults": 5
    }
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "data": {
      "cardInfo": {
        "name": "皮卡丘 V",
        "series": "Sword & Shield",
        "number": "043/185",
        "rarity": "Ultra Rare",
        "type": "Lightning",
        "hp": 200,
        "confidence": 0.95
      },
      "rawData": {
        "textAnnotations": ["皮卡丘 V", "Sword & Shield", "043/185"],
        "labelAnnotations": ["Pokemon", "card", "electric"]
      }
    },
    "apiUsed": "GOOGLE_VISION",
    "timestamp": "2024-01-15T10:30:00Z"
  }
  ```

## 9. 價格查詢端點 (Price Query)

### 9.1 獲取卡牌價格
- **端點**: `POST /priceQuery/prices`
- **描述**: 查詢卡牌在各平台的價格
- **請求體**:
  ```json
  {
    "cardInfo": {
      "name": "皮卡丘 V",
      "series": "Sword & Shield",
      "number": "043/185"
    },
    "platforms": ["TCGPLAYER", "EBAY", "CARDMARKET"]
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "data": {
      "platforms": {
        "TCGPLAYER": 45.99,
        "EBAY": 42.50,
        "CARDMARKET": 38.75
      },
      "average": 42.87,
      "median": 43.12,
      "min": 38.75,
      "max": 45.99,
      "count": 3
    },
    "platformsUsed": ["TCGPLAYER", "EBAY", "CARDMARKET"],
    "timestamp": "2024-01-15T10:30:00Z"
  }
  ```

### 9.2 獲取價格歷史
- **端點**: `GET /priceQuery/history/:cardId`
- **描述**: 獲取卡牌價格歷史
- **查詢參數**:
  - `period`: 時間週期 (1m, 3m, 6m, 1y)
  - `platform`: 平台篩選
- **響應**:
  ```json
  {
    "success": true,
    "data": {
      "history": [
        { "date": "2024-01-01", "price": 35.00 },
        { "date": "2024-02-01", "price": 38.50 },
        { "date": "2024-03-01", "price": 42.00 }
      ],
      "trend": "up",
      "changePercent": 22.5
    }
  }
  ```

### 9.3 獲取市場趨勢
- **端點**: `GET /priceQuery/trends`
- **描述**: 獲取市場趨勢信息
- **查詢參數**:
  - `gameType`: 遊戲類型
  - `limit`: 限制返回數量
- **響應**:
  ```json
  {
    "success": true,
    "data": {
      "trends": [
        {
          "card": "皮卡丘 V",
          "change": 22.5,
          "trend": "up"
        }
      ],
      "marketSentiment": "bullish"
    }
  }
  ```

## 10. AI分析端點 (AI Analysis)

### 10.1 AI分析
- **端點**: `POST /aiAnalysis/analyze`
- **描述**: 使用AI分析卡牌
- **請求體**:
  ```json
  {
    "prompt": "分析這張卡牌的投資價值",
    "context": {
      "cardName": "皮卡丘 V",
      "currentPrice": 42.87,
      "marketTrend": "up"
    },
    "options": {
      "model": "gpt-4",
      "maxTokens": 1000
    }
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "data": {
      "response": "根據市場分析，這張皮卡丘 V 卡牌目前處於上升趨勢...",
      "model": "gpt-4",
      "usage": {
        "prompt_tokens": 150,
        "completion_tokens": 200,
        "total_tokens": 350
      }
    },
    "modelUsed": "OPENAI",
    "timestamp": "2024-01-15T10:30:00Z"
  }
  ```

### 10.2 獲取AI建議
- **端點**: `GET /aiAnalysis/suggestions`
- **描述**: 獲取AI建議
- **查詢參數**:
  - `cardId`: 卡牌ID
  - `context`: 上下文信息
- **響應**:
  ```json
  {
    "success": true,
    "data": {
      "suggestions": [
        "考慮在價格回調時買入",
        "關注相關卡牌的價格變動",
        "設置價格提醒"
      ]
    }
  }
  ```

## 11. 用戶資料端點 (User Profile)

### 11.1 獲取用戶資料
- **端點**: `GET /user/profile`
- **描述**: 獲取用戶個人資料
- **響應**:
  ```json
  {
    "success": true,
    "profile": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "用戶名稱",
      "membership": "FREE",
      "joinDate": "2024-01-01",
      "preferences": {
        "language": "zh-TW",
        "currency": "TWD",
        "notifications": true
      }
    }
  }
  ```

### 11.2 更新用戶資料
- **端點**: `PUT /user/profile`
- **描述**: 更新用戶個人資料
- **請求體**:
  ```json
  {
    "name": "新用戶名稱",
    "preferences": {
      "language": "zh-TW",
      "currency": "TWD"
    }
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "message": "資料更新成功"
  }
  ```

## 12. 會員相關端點 (Membership)

### 12.1 獲取會員信息
- **端點**: `GET /membership/info`
- **描述**: 獲取用戶會員信息
- **響應**:
  ```json
  {
    "success": true,
    "membership": {
      "type": "FREE",
      "level": "FREE",
      "expiryDate": null,
      "features": ["basic_recognition", "basic_pricing"],
      "usage": {
        "daily": 3,
        "monthly": 45,
        "limit": 5
      }
    }
  }
  ```

### 12.2 升級會員
- **端點**: `POST /membership/upgrade`
- **描述**: 升級會員等級
- **請求體**:
  ```json
  {
    "plan": "VIP",
    "paymentMethod": "credit_card",
    "paymentData": {
      "cardNumber": "****",
      "expiryDate": "12/25"
    }
  }
  ```
- **響應**:
  ```json
  {
    "success": true,
    "message": "會員升級成功",
    "newMembership": {
      "type": "VIP",
      "expiryDate": "2025-01-15"
    }
  }
  ```

## 13. 文件上傳端點 (File Upload)

### 13.1 上傳圖片
- **端點**: `POST /upload/image`
- **描述**: 上傳卡牌圖片
- **請求體**: Multipart form data
- **響應**:
  ```json
  {
    "success": true,
    "file": {
      "id": "file_123",
      "url": "https://example.com/uploads/image.jpg",
      "size": 1024000,
      "type": "image/jpeg"
    }
  }
  ```

## 14. 錯誤處理

### 標準錯誤響應格式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤描述",
    "details": "詳細錯誤信息"
  }
}
```

### 常見錯誤代碼
- `AUTH_REQUIRED`: 需要認證
- `INVALID_TOKEN`: 無效令牌
- `PERMISSION_DENIED`: 權限不足
- `RATE_LIMIT_EXCEEDED`: 請求頻率超限
- `INVALID_REQUEST`: 無效請求
- `RESOURCE_NOT_FOUND`: 資源不存在
- `INTERNAL_ERROR`: 內部服務錯誤

## 15. 速率限制

- **免費用戶**: 5次/分鐘
- **VIP用戶**: 50次/分鐘
- **Premium用戶**: 1000次/分鐘

## 16. 實現優先級

### 高優先級 (必須實現)
1. 認證相關端點 (auth)
2. 卡牌數據端點 (cardData)
3. 收藏管理端點 (collection)
4. 用戶歷史端點 (userHistory)

### 中優先級 (重要功能)
1. 價格預測端點 (pricePrediction)
2. 真偽檢查端點 (authenticityCheck)
3. AI聊天端點 (aiChatbot)
4. 卡牌辨識端點 (cardRecognition)

### 低優先級 (增強功能)
1. 價格查詢端點 (priceQuery)
2. AI分析端點 (aiAnalysis)
3. 會員管理端點 (membership)
4. 文件上傳端點 (upload)

## 17. 技術要求

### 後端技術棧建議
- **框架**: Node.js + Express.js 或 Python + FastAPI
- **數據庫**: PostgreSQL 或 MongoDB
- **認證**: JWT
- **文件存儲**: AWS S3 或 Google Cloud Storage
- **AI服務**: OpenAI API, Google Vision API
- **價格數據**: TCGPlayer API, eBay API

### 安全要求
- HTTPS 強制
- API 密鑰驗證
- 請求速率限制
- 輸入驗證和清理
- SQL 注入防護
- XSS 防護

### 性能要求
- 響應時間 < 2秒
- 99.9% 可用性
- 支持並發請求
- 數據庫連接池
- 響應快取
