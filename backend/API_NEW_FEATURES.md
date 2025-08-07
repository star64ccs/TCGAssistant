# TCG Assistant 新功能 API 文檔

## 概述

本文檔描述了TCG Assistant後端新增的三個核心功能模組：
- 價格預測 (Price Prediction)
- 真偽檢查 (Authenticity Check)
- AI聊天 (AI Chat)

## 基礎信息

- **基礎URL**: `http://localhost:3000/api/v1`
- **認證**: 所有端點都需要JWT認證（除了健康檢查）
- **內容類型**: `application/json` (除了文件上傳端點使用 `multipart/form-data`)

## 1. 價格預測 API

### 1.1 單張卡片價格預測

**端點**: `GET /pricePrediction/predict/:cardId`

**參數**:
- `cardId` (路徑): 卡片ID
- `timeframe` (查詢): 預測時間範圍 (7d, 30d, 90d, 1y) - 默認: 30d
- `confidence` (查詢): 置信度 (0.1-1.0) - 默認: 0.8

**請求示例**:
```bash
GET /api/v1/pricePrediction/predict/pokemon_001?timeframe=30d&confidence=0.8
```

**響應示例**:
```json
{
  "success": true,
  "data": {
    "cardId": "pokemon_001",
    "currentPrice": 150.50,
    "predictedPrice": 165.75,
    "confidence": 0.85,
    "timeframe": "30d",
    "factors": [
      "市場需求趨勢",
      "供應量變化",
      "競賽環境影響",
      "收藏價值評估"
    ],
    "trend": "up",
    "volatility": 0.25,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 1.2 歷史價格查詢

**端點**: `GET /pricePrediction/history/:cardId`

**參數**:
- `cardId` (路徑): 卡片ID
- `limit` (查詢): 查詢天數 (1-365) - 默認: 30

**響應示例**:
```json
{
  "success": true,
  "data": {
    "cardId": "pokemon_001",
    "history": [
      {
        "date": "2024-01-15",
        "price": 150.50,
        "volume": 25,
        "change": 2.5
      }
    ],
    "summary": {
      "averagePrice": 145.30,
      "highestPrice": 165.75,
      "lowestPrice": 125.20,
      "totalVolume": 750,
      "priceChange": 25.30,
      "priceChangePercent": 20.15
    }
  }
}
```

### 1.3 市場趨勢分析

**端點**: `GET /pricePrediction/trends`

**參數**:
- `category` (查詢): 卡片類別 (all, pokemon, yugioh, magic) - 默認: all
- `timeframe` (查詢): 時間範圍 (7d, 30d, 90d, 1y) - 默認: 7d

**響應示例**:
```json
{
  "success": true,
  "data": {
    "overall": {
      "direction": "bullish",
      "strength": 0.75,
      "confidence": 0.85
    },
    "categories": {
      "pokemon": {
        "direction": "bullish",
        "change": 12.5
      },
      "yugioh": {
        "direction": "bearish",
        "change": -5.2
      },
      "magic": {
        "direction": "bullish",
        "change": 8.7
      }
    },
    "topGainers": [
      {
        "cardId": "pokemon_001",
        "name": "皮卡丘",
        "change": 25.5
      }
    ],
    "topLosers": [
      {
        "cardId": "pokemon_002",
        "name": "妙蛙種子",
        "change": -15.3
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 1.4 批量價格預測

**端點**: `POST /pricePrediction/batch-predict`

**請求體**:
```json
{
  "cardIds": ["pokemon_001", "yugioh_001", "magic_001"],
  "timeframe": "30d"
}
```

**響應示例**:
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "cardId": "pokemon_001",
        "currentPrice": 150.50,
        "predictedPrice": 165.75,
        "confidence": 0.85,
        "timeframe": "30d",
        "trend": "up",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "summary": {
      "totalCards": 3,
      "averageConfidence": 0.82,
      "bullishCount": 2,
      "bearishCount": 1,
      "averagePriceChange": 12.5
    }
  }
}
```

## 2. 真偽檢查 API

### 2.1 真偽檢查

**端點**: `POST /authenticityCheck/check`

**請求體** (multipart/form-data):
- `cardId`: 卡片ID
- `cardType`: 卡片類型 (pokemon, yugioh, magic, onepiece)
- `images`: 卡片圖片文件 (最多5個)

**響應示例**:
```json
{
  "success": true,
  "data": {
    "cardId": "pokemon_001",
    "cardType": "pokemon",
    "authenticityScore": 85.5,
    "isAuthentic": true,
    "confidence": 0.88,
    "analysis": {
      "imageQuality": 90.2,
      "printQuality": 85.7,
      "colorAccuracy": 88.3,
      "textureAnalysis": 82.1,
      "edgeAnalysis": 87.9,
      "hologramCheck": 91.5,
      "watermarkDetection": 89.2
    },
    "issues": [],
    "recommendations": [
      "建議在專業光線下檢查",
      "對比官方參考圖片",
      "檢查卡片編號和防偽標記"
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2.2 詳細真偽分析

**端點**: `POST /authenticityCheck/detailed-analysis`

**請求體** (multipart/form-data):
- `cardId`: 卡片ID
- `cardType`: 卡片類型
- `analysisType`: 分析類型 (basic, comprehensive, detailed)
- `images`: 卡片圖片文件 (最多10個)

**響應示例**:
```json
{
  "success": true,
  "data": {
    "cardId": "pokemon_001",
    "cardType": "pokemon",
    "analysisType": "comprehensive",
    "overallScore": 87.3,
    "detailedResults": {
      "frontAnalysis": {
        "score": 88.5,
        "issues": ["印刷模糊"],
        "recommendations": ["檢查印刷質量"]
      },
      "backAnalysis": {
        "score": 85.2,
        "issues": [],
        "recommendations": ["背面狀態良好"]
      },
      "edgeAnalysis": {
        "score": 89.1,
        "issues": [],
        "recommendations": ["邊緣狀態良好"]
      },
      "textureAnalysis": {
        "score": 86.7,
        "issues": ["表面異常"],
        "recommendations": ["檢查表面質地"]
      }
    },
    "comparisonData": {
      "officialReference": {
        "colorValues": [255, 128, 64],
        "texturePattern": "standard",
        "printQuality": "high"
      },
      "analyzedCard": {
        "colorValues": [250, 125, 62],
        "texturePattern": "standard",
        "printQuality": "medium"
      }
    },
    "riskFactors": [
      {
        "factor": "印刷質量",
        "risk": "medium",
        "description": "印刷清晰度略低於標準"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2.3 批量真偽檢查

**端點**: `POST /authenticityCheck/batch-check`

**請求體** (multipart/form-data):
- `cards`: 卡片信息數組
- `images`: 卡片圖片文件

**響應示例**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "cardId": "pokemon_001",
        "cardType": "pokemon",
        "authenticityScore": 85.5,
        "isAuthentic": true,
        "confidence": 0.88,
        "imageIndex": 0,
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "summary": {
      "totalCards": 3,
      "authenticCount": 2,
      "suspiciousCount": 1,
      "averageScore": 82.3,
      "highRiskCards": ["pokemon_002"]
    }
  }
}
```

### 2.4 真偽檢查歷史

**端點**: `GET /authenticityCheck/history/:userId`

**參數**:
- `userId` (路徑): 用戶ID
- `limit` (查詢): 限制數量 (1-100) - 默認: 20
- `offset` (查詢): 偏移量 - 默認: 0

### 2.5 真偽檢查統計

**端點**: `GET /authenticityCheck/stats/:userId`

**參數**:
- `userId` (路徑): 用戶ID

## 3. AI聊天 API

### 3.1 AI聊天對話

**端點**: `POST /aiChat/chat`

**請求體**:
```json
{
  "message": "這張卡片的價格如何？",
  "userId": "user_001",
  "context": [],
  "chatType": "general"
}
```

**響應示例**:
```json
{
  "success": true,
  "data": {
    "messageId": "msg_1705312200000",
    "response": "關於價格預測，我建議您查看最近的市場趨勢。",
    "confidence": 0.85,
    "suggestions": [
      "查看歷史價格",
      "進行價格預測",
      "真偽檢查",
      "投資建議"
    ],
    "intent": "price_inquiry",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3.2 智能建議

**端點**: `POST /aiChat/suggestions`

**請求體**:
```json
{
  "userId": "user_001",
  "context": {},
  "userBehavior": {}
}
```

**響應示例**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "price_alert",
        "title": "價格提醒",
        "description": "您關注的卡片價格有變化",
        "priority": "high"
      },
      {
        "type": "investment_opportunity",
        "title": "投資機會",
        "description": "發現潛在的投資機會",
        "priority": "medium"
      }
    ],
    "userProfile": {
      "userId": "user_001",
      "interests": ["pokemon", "price_analysis"],
      "activityLevel": "high",
      "expertise": "intermediate"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3.3 知識庫查詢

**端點**: `GET /aiChat/knowledge`

**參數**:
- `query` (查詢): 查詢詞
- `category` (查詢): 類別 (all, authenticity, price, investment, maintenance) - 默認: all
- `limit` (查詢): 限制數量 (1-50) - 默認: 10

**響應示例**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "kb_001",
        "title": "如何識別假卡",
        "content": "假卡通常具有以下特徵：印刷模糊、顏色偏差、邊緣處理不當等。",
        "category": "authenticity",
        "tags": ["真偽檢查", "假卡識別", "安全"],
        "relevance": 0.95
      }
    ],
    "total": 1,
    "query": "假卡",
    "category": "authenticity",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3.4 聊天歷史

**端點**: `GET /aiChat/history/:userId`

**參數**:
- `userId` (路徑): 用戶ID
- `limit` (查詢): 限制數量 (1-100) - 默認: 20
- `offset` (查詢): 偏移量 - 默認: 0

### 3.5 聊天統計

**端點**: `GET /aiChat/stats/:userId`

**參數**:
- `userId` (路徑): 用戶ID

### 3.6 反饋評價

**端點**: `POST /aiChat/feedback`

**請求體**:
```json
{
  "userId": "user_001",
  "messageId": "msg_1705312200000",
  "rating": 5,
  "feedback": "很好的服務！"
}
```

## 錯誤處理

所有API端點都遵循統一的錯誤響應格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤描述"
  }
}
```

常見錯誤代碼：
- `VALIDATION_ERROR`: 請求參數驗證失敗
- `AUTHENTICATION_ERROR`: 認證失敗
- `RATE_LIMIT_EXCEEDED`: 請求頻率過高
- `INVALID_INPUT`: 無效的輸入數據
- `SERVICE_UNAVAILABLE`: 服務暫時不可用

## 測試

### 運行所有新功能測試
```bash
npm run test:new
```

### 運行特定功能測試
```bash
npm run test:price        # 測試價格預測
npm run test:authenticity # 測試真偽檢查
npm run test:chat         # 測試AI聊天
```

## 注意事項

1. 所有端點都需要有效的JWT認證令牌
2. 文件上傳端點有大小限制（10MB）和數量限制（5-10個文件）
3. 價格預測和真偽檢查結果僅供參考，不構成投資建議
4. AI聊天功能會保存對話歷史以提供更好的服務
5. 所有時間戳都使用ISO 8601格式
