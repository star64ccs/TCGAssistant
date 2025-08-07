# 社交登入設置指南

## 概述

TCG助手應用程式支援Google、Facebook和Apple三種社交登入方式。本文檔將指導您如何配置這些社交登入服務。

## 環境變數配置

在項目根目錄創建 `.env` 文件，並添加以下配置：

### Google OAuth 2.0 配置

```bash
# Google OAuth 2.0
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
REACT_APP_GOOGLE_REDIRECT_URI=com.tcgassistant://oauth2redirect
```

### Facebook OAuth 2.0 配置

```bash
# Facebook OAuth 2.0
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
REACT_APP_FACEBOOK_APP_SECRET=your-facebook-app-secret
REACT_APP_FACEBOOK_REDIRECT_URI=com.tcgassistant://oauth2redirect
```

### Apple Sign In 配置

```bash
# Apple Sign In
REACT_APP_APPLE_CLIENT_ID=com.tcgassistant.signin
REACT_APP_APPLE_TEAM_ID=your-apple-team-id
REACT_APP_APPLE_KEY_ID=your-apple-key-id
REACT_APP_APPLE_PRIVATE_KEY=your-apple-private-key
REACT_APP_APPLE_REDIRECT_URI=com.tcgassistant://oauth2redirect
```

## 設置步驟

### 1. Google OAuth 2.0 設置

1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新項目或選擇現有項目
3. 啟用 Google+ API
4. 在「憑證」頁面創建 OAuth 2.0 客戶端 ID
5. 設置授權的重定向 URI：`com.tcgassistant://oauth2redirect`
6. 複製客戶端 ID 和客戶端密鑰到環境變數

### 2. Facebook OAuth 2.0 設置

1. 訪問 [Facebook Developers](https://developers.facebook.com/)
2. 創建新應用程式
3. 添加 Facebook 登入產品
4. 設置 OAuth 重定向 URI：`com.tcgassistant://oauth2redirect`
5. 複製應用程式 ID 和應用程式密鑰到環境變數

### 3. Apple Sign In 設置

1. 訪問 [Apple Developer](https://developer.apple.com/)
2. 在「Certificates, Identifiers & Profiles」中創建 App ID
3. 啟用 Sign In with Apple 功能
4. 創建私鑰並下載 .p8 文件
5. 複製相關信息到環境變數

## 開發模式

如果沒有配置真實的API密鑰，應用程式會自動切換到模擬模式：

- 社交登入按鈕仍然可用
- 使用模擬數據進行測試
- 不會發送真實的API請求
- 適合開發和測試階段

## 生產環境配置

在生產環境中，請確保：

1. 所有API密鑰都已正確配置
2. 重定向URI與應用程式包名匹配
3. 啟用了適當的安全設置
4. 監控API使用量和錯誤率

## 故障排除

### 常見問題

1. **配置驗證失敗**
   - 檢查環境變數是否正確設置
   - 確認API密鑰是否有效
   - 驗證重定向URI是否匹配

2. **授權失敗**
   - 檢查OAuth配置是否正確
   - 確認應用程式已通過審核（生產環境）
   - 驗證用戶權限設置

3. **令牌刷新失敗**
   - 檢查刷新令牌是否有效
   - 確認API密鑰權限
   - 驗證網絡連接

### 調試模式

在開發模式下，可以啟用詳細日誌：

```bash
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

## 安全注意事項

1. **保護API密鑰**
   - 永遠不要將API密鑰提交到版本控制
   - 使用環境變數管理敏感信息
   - 定期輪換API密鑰

2. **用戶數據保護**
   - 只請求必要的權限
   - 安全存儲用戶令牌
   - 實現適當的登出機制

3. **網絡安全**
   - 使用HTTPS進行所有API通信
   - 實現適當的錯誤處理
   - 監控異常活動

## 測試

### 單元測試

```bash
npm test -- --testPathPattern=socialAuth
```

### 整合測試

```bash
npm run test:integration
```

### 手動測試

1. 啟動應用程式
2. 嘗試使用不同的社交登入方式
3. 驗證用戶信息是否正確獲取
4. 測試登出功能

## 更新日誌

### v1.0.0
- 初始版本
- 支援Google、Facebook、Apple登入
- 模擬模式支援
- 完整的錯誤處理

## 支援

如有問題，請聯繫開發團隊或查看相關文檔。
