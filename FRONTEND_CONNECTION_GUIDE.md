# 前端連接指南

本指南將幫助您配置前端應用程序以連接到後端API服務器。

## 目錄

1. [環境配置](#環境配置)
2. [API配置](#api配置)
3. [連接測試](#連接測試)
4. [故障排除](#故障排除)
5. [部署配置](#部署配置)

## 環境配置

### 1. 複製環境配置文件

```bash
cp env.example .env
```

### 2. 修改環境變數

編輯 `.env` 文件，根據您的環境設置以下變數：

```env
# 開發環境
REACT_APP_ENVIRONMENT=development
REACT_APP_API_URL=http://localhost:3000

# 測試環境
REACT_APP_ENVIRONMENT=staging
REACT_APP_API_URL=https://staging-api.tcgassistant.com

# 生產環境
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=https://api.tcgassistant.com
```

## API配置

### 1. 基礎配置

前端應用程序使用以下配置文件：

- `src/config/api.js` - 基礎API配置
- `src/config/apiConfig.js` - 詳細API配置
- `src/services/api.js` - API服務

### 2. 配置檢查

應用程序啟動時會自動檢查以下配置：

- API服務器連接狀態
- 可用API端點
- 認證系統
- 功能開關

### 3. 環境檢測

應用程序會根據以下條件自動檢測環境：

- `__DEV__` 標誌（開發環境）
- `REACT_APP_ENVIRONMENT` 環境變數
- 默認回退到開發環境

## 連接測試

### 1. 自動測試

應用程序啟動時會自動執行連接測試：

```javascript
// 在 App.js 中
const apiResult = await apiIntegrationManager.initialize();
```

### 2. 手動測試

您可以使用連接測試工具進行手動測試：

```javascript
import connectionTest from './utils/connectionTest';

// 執行完整測試
const result = await connectionTest.runFullTest();
console.log('測試結果:', result);
```

### 3. 測試內容

連接測試包括：

- **基礎連接測試**: 檢查API服務器是否可達
- **API端點測試**: 驗證各個API端點是否可訪問
- **認證測試**: 測試認證系統是否正常
- **功能測試**: 檢查API功能是否可用

## 故障排除

### 1. 常見問題

#### 問題：無法連接到後端服務器

**解決方案：**
1. 確認後端服務器正在運行
2. 檢查端口配置（默認3000）
3. 確認防火牆設置
4. 檢查網絡連接

#### 問題：CORS錯誤

**解決方案：**
1. 確認後端CORS配置
2. 檢查請求來源是否在允許列表中
3. 確認憑證設置

#### 問題：API端點404錯誤

**解決方案：**
1. 確認API版本路徑正確（/api/v1）
2. 檢查後端路由配置
3. 確認端點名稱正確

### 2. 調試工具

#### API狀態監控

應用程序包含內建的API狀態監控組件，顯示：

- 連接狀態
- 環境信息
- 服務器URL
- 最後檢查時間
- 重試次數

#### 連接測試工具

使用連接測試工具進行詳細診斷：

```javascript
// 獲取測試結果
const results = connectionTest.getTestResults();

// 導出測試報告
const report = connectionTest.exportReport();
```

### 3. 日誌檢查

啟用詳細日誌記錄：

```env
REACT_APP_ENABLE_LOGGING=true
REACT_APP_LOG_LEVEL=debug
REACT_APP_DEBUG=true
```

## 部署配置

### 1. 開發環境

```env
REACT_APP_ENVIRONMENT=development
REACT_APP_API_URL=http://localhost:3000
REACT_APP_DEBUG=true
```

### 2. 測試環境

```env
REACT_APP_ENVIRONMENT=staging
REACT_APP_API_URL=https://staging-api.tcgassistant.com
REACT_APP_DEBUG=false
```

### 3. 生產環境

```env
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=https://api.tcgassistant.com
REACT_APP_DEBUG=false
REACT_APP_ENABLE_SSL_PINNING=true
```

## 安全配置

### 1. SSL證書固定

在生產環境中啟用SSL證書固定：

```env
REACT_APP_ENABLE_SSL_PINNING=true
REACT_APP_ENABLE_CERT_PINNING=true
```

### 2. API密鑰管理

確保所有API密鑰都通過環境變數管理，不要硬編碼在代碼中。

### 3. 請求限制

配置適當的請求限制和重試策略：

```env
REACT_APP_MAX_RETRIES=3
REACT_APP_RETRY_DELAY=1000
REACT_APP_API_TIMEOUT=30000
```

## 性能優化

### 1. 快取配置

```env
REACT_APP_FEATURE_CACHE=true
REACT_APP_CACHE_DURATION=300000
REACT_APP_MAX_CACHE_SIZE=50
```

### 2. 圖片處理

```env
REACT_APP_MAX_IMAGE_SIZE=10485760
REACT_APP_IMAGE_QUALITY=0.9
```

### 3. 監控配置

```env
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
```

## 更新日誌

### v1.0.0
- 初始版本
- 基礎API連接配置
- 連接測試工具
- API狀態監控

### 待實現功能
- 自動重連機制
- 離線模式支持
- 實時連接狀態更新
- 更詳細的錯誤報告

## 支持

如果您遇到連接問題，請：

1. 檢查本指南的故障排除部分
2. 查看應用程序日誌
3. 使用連接測試工具進行診斷
4. 聯繫開發團隊

---

**注意**: 請確保在修改配置後重新啟動應用程序以使更改生效。
