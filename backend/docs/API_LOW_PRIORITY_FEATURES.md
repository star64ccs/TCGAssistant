# TCG Assistant 低優先級功能 API 文檔

本文檔描述了TCG Assistant後端的低優先級功能API，包括通知系統、反饋系統、備份系統、分析系統和文件管理系統。

## 基礎信息

- **基礎URL**: `http://localhost:3000/api/v1`
- **認證方式**: Bearer Token (JWT)
- **內容類型**: `application/json`

## 認證

所有API端點都需要有效的JWT令牌。在請求頭中包含：

```
Authorization: Bearer <your-jwt-token>
```

## 1. 通知系統 API

### 1.1 獲取通知列表

**GET** `/notification`

**查詢參數:**
- `page` (可選): 頁碼，默認1
- `limit` (可選): 每頁數量，默認20
- `type` (可選): 通知類型 (system, price, security, marketing, update)
- `isRead` (可選): 是否已讀 (true/false)

**響應示例:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "userId": "user123",
        "type": "system",
        "title": "系統更新",
        "message": "系統已更新到最新版本",
        "priority": "normal",
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 1.2 標記通知為已讀

**PUT** `/notification/:notificationId/read`

**響應示例:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "notification": {
      "id": "uuid",
      "isRead": true
    }
  }
}
```

### 1.3 批量標記通知為已讀

**PUT** `/notification/batch-read`

**請求體:**
```json
{
  "notificationIds": ["uuid1", "uuid2", "uuid3"]
}
```

### 1.4 獲取通知統計

**GET** `/notification/stats`

**響應示例:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "unread": 3,
    "read": 7,
    "byType": {
      "system": 5,
      "price": 3,
      "security": 2
    },
    "byPriority": {
      "high": 1,
      "normal": 8,
      "low": 1
    }
  }
}
```

### 1.5 更新通知設置

**PUT** `/notification/settings`

**請求體:**
```json
{
  "settings": {
    "pushEnabled": true,
    "emailEnabled": false,
    "inAppEnabled": true,
    "types": {
      "system": { "push": true, "email": false, "inApp": true },
      "price": { "push": true, "email": true, "inApp": true }
    },
    "quietHours": {
      "enabled": false,
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

## 2. 反饋系統 API

### 2.1 提交反饋

**POST** `/feedback`

**請求體:**
```json
{
  "type": "feature_request",
  "title": "功能建議",
  "description": "希望添加新功能",
  "rating": 4,
  "category": "enhancement",
  "attachments": []
}
```

### 2.2 獲取反饋列表

**GET** `/feedback`

**查詢參數:**
- `page` (可選): 頁碼，默認1
- `limit` (可選): 每頁數量，默認20
- `type` (可選): 反饋類型 (bug, feature_request, general, complaint, suggestion)
- `status` (可選): 狀態 (pending, in_progress, replied, resolved, closed)
- `category` (可選): 分類 (technical, enhancement, feedback, security, other)

### 2.3 獲取反饋詳情

**GET** `/feedback/:feedbackId`

### 2.4 添加反饋回覆

**POST** `/feedback/:feedbackId/reply`

**請求體:**
```json
{
  "message": "感謝您的反饋",
  "isInternal": false
}
```

### 2.5 獲取反饋統計

**GET** `/feedback/stats/overview`

**響應示例:**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "byStatus": {
      "pending": 5,
      "in_progress": 3,
      "replied": 4,
      "resolved": 2,
      "closed": 1
    },
    "byType": {
      "bug": 8,
      "feature_request": 5,
      "general": 2
    },
    "averageRating": 4.2
  }
}
```

## 3. 備份系統 API

### 3.1 創建備份

**POST** `/backup/create`

**請求體:**
```json
{
  "type": "full",
  "description": "完整備份",
  "includeSettings": true,
  "includeHistory": true,
  "includeCollection": true
}
```

### 3.2 獲取備份列表

**GET** `/backup`

**查詢參數:**
- `page` (可選): 頁碼，默認1
- `limit` (可選): 每頁數量，默認20
- `type` (可選): 備份類型 (full, partial, incremental)
- `status` (可選): 狀態 (completed, failed, in_progress)

### 3.3 下載備份

**GET** `/backup/:backupId/download`

### 3.4 恢復備份

**POST** `/backup/:backupId/restore`

**請求體:**
```json
{
  "options": {
    "overwrite": false,
    "merge": true
  },
  "conflictResolution": "skip"
}
```

### 3.5 驗證備份完整性

**POST** `/backup/:backupId/verify`

### 3.6 設置自動備份

**PUT** `/backup/auto-backup`

**請求體:**
```json
{
  "enabled": true,
  "frequency": "weekly",
  "retention": 30,
  "includeSettings": true,
  "includeHistory": true,
  "includeCollection": true
}
```

## 4. 分析系統 API

### 4.1 記錄用戶行為

**POST** `/analytics/track`

**請求體:**
```json
{
  "event": "page_view",
  "category": "navigation",
  "action": "visit_home",
  "label": "home_page",
  "value": 1,
  "properties": {
    "page": "home"
  }
}
```

### 4.2 獲取使用統計

**GET** `/analytics/usage`

**查詢參數:**
- `period` (可選): 時間段 (7d, 30d, 90d, 1y)，默認30d
- `feature` (可選): 功能名稱
- `groupBy` (可選): 分組方式 (day, week, month)，默認day

### 4.3 獲取使用趨勢

**GET** `/analytics/trends`

**查詢參數:**
- `period` (可選): 時間段，默認30d
- `feature` (可選): 功能名稱
- `interval` (可選): 間隔 (hour, day, week, month)，默認day

### 4.4 獲取性能指標

**GET** `/analytics/performance`

**查詢參數:**
- `period` (可選): 時間段 (1h, 24h, 7d, 30d)，默認7d
- `metric` (可選): 指標類型 (response_time, error_rate, throughput)
- `endpoint` (可選): 端點名稱

### 4.5 獲取錯誤統計

**GET** `/analytics/errors`

**查詢參數:**
- `period` (可選): 時間段，默認7d
- `severity` (可選): 嚴重程度 (low, medium, high, critical)
- `type` (可選): 錯誤類型

### 4.6 獲取系統健康狀態

**GET** `/analytics/health`

**響應示例:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "activeUsers": 150,
    "eventsPerMinute": 25,
    "errorRate": 0.02,
    "responseTime": 150,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4.7 獲取實時監控數據

**GET** `/analytics/realtime`

**查詢參數:**
- `metric` (可選): 指標類型 (users, requests, errors)
- `duration` (可選): 持續時間 (1h, 6h, 24h)，默認1h

## 5. 文件管理系統 API

### 5.1 上傳文件

**POST** `/fileManager/upload`

**請求體:** (multipart/form-data)
- `files`: 文件數組
- `category`: 分類
- `description`: 描述
- `tags`: 標籤數組

### 5.2 獲取文件列表

**GET** `/fileManager`

**查詢參數:**
- `page` (可選): 頁碼，默認1
- `limit` (可選): 每頁數量，默認20
- `category` (可選): 分類
- `type` (可選): 文件類型
- `search` (可選): 搜索關鍵詞
- `sortBy` (可選): 排序字段 (name, size, createdAt, updatedAt)
- `sortOrder` (可選): 排序順序 (asc, desc)

### 5.3 下載文件

**GET** `/fileManager/:fileId/download`

### 5.4 預覽文件

**GET** `/fileManager/:fileId/preview`

### 5.5 更新文件信息

**PUT** `/fileManager/:fileId`

**請求體:**
```json
{
  "name": "新文件名",
  "description": "新描述",
  "category": "新分類",
  "tags": ["標籤1", "標籤2"]
}
```

### 5.6 圖片處理

**POST** `/fileManager/:fileId/process`

**請求體:**
```json
{
  "operations": [
    {
      "type": "resize",
      "params": {
        "width": 800,
        "height": 600
      }
    },
    {
      "type": "compress",
      "params": {
        "quality": 80
      }
    }
  ]
}
```

### 5.7 創建文件夾

**POST** `/fileManager/folder`

**請求體:**
```json
{
  "name": "文件夾名稱",
  "parentId": "父文件夾ID",
  "description": "文件夾描述"
}
```

### 5.8 獲取文件夾結構

**GET** `/fileManager/folder/structure`

### 5.9 搜索文件

**GET** `/fileManager/search`

**查詢參數:**
- `query`: 搜索關鍵詞
- `type` (可選): 文件類型
- `category` (可選): 分類
- `dateRange` (可選): 日期範圍
- `sizeRange` (可選): 大小範圍

### 5.10 獲取文件統計

**GET** `/fileManager/stats/overview`

**響應示例:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "byType": {
      "image": 30,
      "document": 15,
      "other": 5
    },
    "byCategory": {
      "general": 25,
      "work": 15,
      "personal": 10
    },
    "totalSize": 104857600,
    "averageSize": 2097152
  }
}
```

## 錯誤處理

所有API都使用統一的錯誤響應格式：

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
- `AUTHORIZATION_ERROR`: 權限不足
- `NOT_FOUND`: 資源不存在
- `INTERNAL_SERVER_ERROR`: 服務器內部錯誤

## 測試

使用以下命令測試各個功能模組：

```bash
# 測試所有低優先級功能
npm run test:low-priority

# 測試特定功能
npm run test:notification
npm run test:feedback
npm run test:backup
npm run test:analytics
npm run test:filemanager
```

## 注意事項

1. 所有API都需要有效的JWT認證令牌
2. 文件上傳大小限制為10MB
3. 支持的圖片格式：JPEG, PNG, GIF, WebP
4. 支持的文件格式：PDF, DOC, DOCX, XLS, XLSX, TXT
5. 備份文件會自動壓縮為ZIP格式
6. 分析數據會自動清理，默認保留90天
7. 通知系統支持靜默時間設置
8. 反饋系統支持內部回覆功能
9. 文件管理支持圖片處理和批量操作
10. 所有統計數據都是實時計算的
