# API 整合實現文檔

## 概述

本文檔詳細說明了 TCG Assistant 應用程式中真實 API 整合的實現，包括架構設計、服務整合、錯誤處理和測試策略。

## 架構設計

### 1. API 整合管理器 (ApiIntegrationManager)

API 整合管理器是整個 API 整合系統的核心組件，負責：

- **統一 API 調用接口**：提供標準化的 API 調用方法
- **真實/模擬 API 切換**：根據環境配置自動選擇使用真實或模擬 API
- **錯誤處理和重試**：提供統一的錯誤處理和重試機制
- **快取管理**：實現 API 響應的快取功能
- **配置管理**：動態配置 API 行為

#### 核心功能

```javascript
// 通用 API 調用方法
async callApi(apiType, method, params = {}, options = {})

// 配置管理
setRealApiEnabled(enabled)
setFallbackToMock(enabled)
setRetryConfig(config)
setCacheConfig(config)

// 狀態查詢
getApiStatus()
clearCache()
```

### 2. 真實 API 服務 (RealApiService)

真實 API 服務包含所有外部 API 的整合實現：

#### 卡牌辨識 API
- **Google Cloud Vision API**：圖像識別和文字檢測
- **AWS Rekognition**：圖像分析和標籤檢測
- **Azure Computer Vision**：圖像分析和描述
- **自定義 AI 模型**：專門的卡牌識別模型

#### 價格查詢 API
- **TCGPlayer API**：TCG 卡牌價格數據
- **eBay API**：拍賣和銷售價格
- **Cardmarket API**：歐洲卡牌市場價格
- **PriceCharting API**：價格圖表數據
- **Mercari API**：日本二手市場價格
- **SNKRDUNK API**：日本球鞋和卡牌價格

#### AI 分析 API
- **OpenAI GPT-4**：自然語言處理和分析
- **Google PaLM**：文本生成和分析
- **Azure OpenAI**：企業級 AI 服務

## 服務整合

### 1. 卡牌服務 (CardService)

更新後的卡牌服務使用 API 整合管理器：

```javascript
// 卡牌辨識
async recognizeCard(imageFile, options = {})

// 價格查詢
async getCardPrices(cardInfo, options = {})

// 批量處理
async recognizeCardsBatch(imageFiles, options = {})
```

### 2. AI 服務 (AIService)

AI 服務提供多種分析功能：

```javascript
// AI 聊天
async chat(message, context = {}, options = {})

// 卡牌分析
async analyzeCard(cardInfo, analysisType = 'general', options = {})

// 投資建議
async getInvestmentAdvice(cardInfo, userProfile = {}, options = {})

// 批量分析
async analyzeBatch(cards, analysisType = 'general', options = {})
```

### 3. 分析服務 (AnalysisService)

分析服務提供卡牌品質評估：

```javascript
// 居中度評估
async evaluateCentering(imageFile, options = {})

// 真偽鑑定
async checkAuthenticity(imageFile, options = {})

// 品質評估
async evaluateQuality(imageFile, options = {})

// 綜合分析
async comprehensiveAnalysis(imageFile, options = {})
```

## 環境配置

### 1. 環境變數

應用程式使用以下環境變數來配置 API：

```bash
# 卡牌辨識 API
REACT_APP_GOOGLE_VISION_API_KEY=your_google_vision_api_key
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=your_aws_access_key_id
REACT_APP_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
REACT_APP_AZURE_VISION_API_KEY=your_azure_vision_api_key
REACT_APP_CUSTOM_AI_API_KEY=your_custom_ai_api_key

# 價格 API
REACT_APP_TCGPLAYER_API_KEY=your_tcgplayer_api_key
REACT_APP_EBAY_APP_ID=your_ebay_app_id
REACT_APP_CARDMARKET_APP_TOKEN=your_cardmarket_app_token
REACT_APP_PRICECHARTING_API_KEY=your_pricecharting_api_key
REACT_APP_MERCARI_API_KEY=your_mercari_api_key
REACT_APP_SNKRDUNK_API_KEY=your_snkrdunk_api_key

# AI 分析 API
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_GOOGLE_PALM_API_KEY=your_google_palm_api_key
REACT_APP_AZURE_OPENAI_API_KEY=your_azure_openai_api_key

# 應用程式配置
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=info
```

### 2. API 可用性檢測

系統會自動檢測可用的 API：

```javascript
checkRealApiAvailability() {
  const requiredApis = [
    'REACT_APP_GOOGLE_VISION_API_KEY',
    'REACT_APP_TCGPLAYER_API_KEY',
    'REACT_APP_OPENAI_API_KEY',
  ];

  const hasRequiredApis = requiredApis.some(apiKey => 
    process.env[apiKey] && process.env[apiKey] !== 'your_api_key_here'
  );

  return hasRequiredApis;
}
```

## 錯誤處理

### 1. 統一錯誤處理

所有 API 調用都使用統一的錯誤處理機制：

```javascript
function handleApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new Error(data.message || '請求參數錯誤');
      case 401:
        return new Error('未授權，請重新登入');
      case 403:
        return new Error('權限不足，可能需要升級會員');
      case 404:
        return new Error('請求的資源不存在');
      case 429:
        return new Error('請求過於頻繁，請稍後再試');
      case 500:
        return new Error('服務器內部錯誤');
      default:
        return new Error(data.message || '未知錯誤');
    }
  } else if (error.request) {
    return new Error('網路連接失敗，請檢查網路設置');
  } else {
    return new Error(error.message || '未知錯誤');
  }
}
```

### 2. 重試機制

提供可配置的重試機制：

```javascript
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};
```

### 3. 備用機制

當真實 API 失敗時，系統會自動切換到模擬 API：

```javascript
// 如果啟用了真實API，嘗試調用
if (this.isRealApiEnabled) {
  try {
    const result = await this.callRealApi(apiType, method, params, options);
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.warn(`真實API調用失敗 (${apiType}.${method}):`, error.message);
  }
}

// 如果真實API失敗或未啟用，使用模擬API
if (fallbackToMock) {
  console.log(`使用模擬API: ${apiType}.${method}`);
  return await this.callMockApi(apiType, method, params, options);
}
```

## 快取機制

### 1. 快取實現

使用內存快取來提高性能：

```javascript
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分鐘

export const cachedRequest = async (key, requestFn, duration = CACHE_DURATION) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data;
  }
  
  const data = await requestFn();
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  
  return data;
};
```

### 2. 快取管理

提供快取清理功能：

```javascript
export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
```

## 測試策略

### 1. 單元測試

為每個服務組件提供完整的單元測試：

- **API 整合管理器測試**：測試配置管理、API 調用、錯誤處理
- **服務整合測試**：測試各個服務與 API 整合管理器的整合
- **工具函數測試**：測試輔助函數和計算邏輯

### 2. 模擬測試

使用模擬 API 進行測試，確保：

- 功能正確性
- 錯誤處理
- 性能表現
- 用戶體驗

### 3. 集成測試

測試真實 API 整合：

- API 響應處理
- 數據轉換
- 錯誤恢復
- 性能監控

## 性能優化

### 1. 圖片預處理

所有圖片在上傳前都會進行預處理：

```javascript
const processedImage = await imageUtils.compressImage(imageFile, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.9,
});
```

### 2. 並行處理

支持批量操作和並行處理：

```javascript
// 並行執行多個分析
const analysisPromises = [
  this.evaluateCentering(processedImage, options),
  this.checkAuthenticity(processedImage, options),
  this.evaluateQuality(processedImage, options),
];

const results = await Promise.allSettled(analysisPromises);
```

### 3. 進度回調

提供進度回調功能：

```javascript
if (options.onProgress) {
  options.onProgress({
    current: i + 1,
    total: totalFiles,
    percentage: ((i + 1) / totalFiles) * 100,
  });
}
```

## 安全考慮

### 1. API 密鑰管理

- 使用環境變數存儲敏感信息
- 不在代碼中硬編碼 API 密鑰
- 提供範例配置文件

### 2. 請求驗證

- 驗證所有輸入參數
- 檢查圖片格式和大小
- 防止惡意請求

### 3. 錯誤信息

- 不暴露內部錯誤信息
- 提供用戶友好的錯誤消息
- 記錄詳細錯誤日誌

## 監控和日誌

### 1. 請求日誌

記錄所有 API 請求：

```javascript
console.log('API Request:', config.method?.toUpperCase(), config.url);
console.log('API Response:', response.status, response.config.url);
```

### 2. 錯誤日誌

記錄詳細的錯誤信息：

```javascript
console.error('API Response Error:', error.response?.status, error.response?.data);
```

### 3. 性能監控

監控 API 響應時間和成功率：

```javascript
const startTime = Date.now();
const result = await apiCall();
const duration = Date.now() - startTime;
console.log(`API call completed in ${duration}ms`);
```

## 未來改進

### 1. 功能擴展

- 支持更多 API 提供商
- 添加更多分析功能
- 實現實時數據更新

### 2. 性能優化

- 實現更智能的快取策略
- 優化圖片處理算法
- 添加 CDN 支持

### 3. 用戶體驗

- 改進錯誤提示
- 添加操作指南
- 實現離線功能

### 4. 安全性

- 實現 API 密鑰輪換
- 添加請求簽名驗證
- 實現速率限制

## 結論

API 整合實現為 TCG Assistant 提供了強大的功能基礎，通過統一的接口、智能的錯誤處理和靈活的配置管理，確保了應用程式的穩定性和可擴展性。該實現為未來的功能擴展和性能優化奠定了堅實的基礎。
