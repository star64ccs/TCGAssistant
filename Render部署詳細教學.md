# Render.com 詳細部署教學

## 📋 前置準備

### 1. 確保代碼已推送到GitHub
```bash
# 檢查Git狀態
git status

# 如果有未提交的更改，先提交
git add .
git commit -m "準備部署到Render - $(date)"
git push origin main
```

### 2. 確認後端文件結構
```
backend/
├── simple-test-server.js    # 主服務器文件
├── package.json             # 依賴配置
├── Procfile                 # Heroku部署文件
└── node_modules/            # 依賴包（會被忽略）
```

## 🌐 步驟1：註冊和登錄 Render.com

### 1.1 訪問網站
- 打開瀏覽器，訪問：https://render.com
- 點擊右上角的 "Sign Up" 或 "Get Started"

### 1.2 選擇註冊方式
**推薦方式：使用GitHub帳戶**
- 點擊 "Continue with GitHub"
- 授權Render訪問您的GitHub帳戶
- 這樣可以直接連接您的代碼倉庫

**替代方式：使用電子郵件**
- 輸入您的電子郵件地址
- 設置密碼
- 驗證電子郵件

### 1.3 完成註冊
- 填寫基本信息（姓名、公司等）
- 選擇免費計劃（Free Plan）
- 完成註冊流程

## 🔗 步驟2：連接GitHub倉庫

### 2.1 創建新服務
- 登錄後，點擊 "New +" 按鈕
- 選擇 "Web Service"
- 系統會顯示 "Connect a repository" 頁面

### 2.2 連接GitHub
- 如果還沒有連接GitHub，點擊 "Connect account"
- 選擇您的GitHub帳戶
- 授權Render訪問您的倉庫

### 2.3 選擇倉庫
- 在倉庫列表中，找到您的TCG助手項目
- 點擊 "Connect" 按鈕
- 確認連接成功

## ⚙️ 步驟3：配置Node.js服務

### 3.1 基本配置
```
Name: tcg-assistant-backend
Environment: Node
Region: 選擇離您最近的區域（如：Oregon (US West)）
Branch: main
Root Directory: backend
```

### 3.2 構建和啟動配置
```
Build Command: npm install
Start Command: npm start
```

### 3.3 實例類型
```
Instance Type: Free
```

## 🔧 步驟4：設置環境變數

### 4.1 添加環境變數
點擊 "Environment" 標籤，添加以下變數：

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `NODE_ENV` | `production` | 生產環境 |
| `PORT` | `10000` | 服務器端口 |
| `API_VERSION` | `v1` | API版本 |
| `CORS_ORIGIN` | `*` | 允許所有來源 |

### 4.2 添加步驟
1. 點擊 "Add Environment Variable"
2. 輸入變數名稱（如：NODE_ENV）
3. 輸入變數值（如：production）
4. 點擊 "Save Changes"

## 🚀 步驟5：部署服務

### 5.1 創建服務
- 檢查所有配置是否正確
- 點擊 "Create Web Service"
- 系統開始自動部署

### 5.2 監控部署過程
部署過程中會顯示：
```
Building...
Installing dependencies...
Starting service...
```

### 5.3 部署完成
- 當狀態變為 "Live" 時，部署完成
- 您會看到一個URL，例如：`https://tcg-assistant-backend.onrender.com`

## ✅ 步驟6：驗證部署

### 6.1 測試健康檢查
在瀏覽器中訪問：
```
https://your-service-name.onrender.com/health
```

預期響應：
```json
{
  "success": true,
  "message": "服務器運行正常",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy",
  "uptime": 123.456
}
```

### 6.2 測試API端點
```
https://your-service-name.onrender.com/api/v1
```

預期響應：
```json
{
  "success": true,
  "message": "API v1 端點正常",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 6.3 測試用戶資料端點
```
https://your-service-name.onrender.com/api/v1/user/profile
```

## 🔄 步驟7：更新前端配置

### 7.1 更新API基礎URL
在您的前端項目中，更新API配置：

```javascript
// src/config/unifiedConfig.js 或相關配置文件
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-service-name.onrender.com'
  : 'http://localhost:3000';
```

### 7.2 更新環境變數
```bash
# .env
REACT_APP_API_URL=https://your-service-name.onrender.com
REACT_APP_FEATURE_REAL_API=true
```

### 7.3 更新測試組件
```javascript
// src/examples/FrontendBackendConnectionTest.js
const API_BASE_URL = 'https://your-service-name.onrender.com';

// 更新所有fetch調用
const response = await fetch(`${API_BASE_URL}/health`);
```

## 📊 步驟8：監控和管理

### 8.1 查看日誌
- 在Render控制台點擊您的服務
- 點擊 "Logs" 標籤
- 查看實時日誌和錯誤信息

### 8.2 性能監控
- 點擊 "Metrics" 標籤
- 查看響應時間、請求數量等指標

### 8.3 自動部署
- 每次推送到GitHub的main分支
- Render會自動重新部署
- 無需手動操作

## 🔍 常見問題解決

### 問題1：部署失敗
**症狀：** 部署狀態顯示 "Failed"

**解決方案：**
1. 檢查日誌中的錯誤信息
2. 確認package.json中的start腳本正確
3. 確認所有依賴都已安裝

### 問題2：服務無法啟動
**症狀：** 部署成功但服務無法訪問

**解決方案：**
1. 檢查環境變數是否正確設置
2. 確認PORT變數已設置
3. 查看日誌中的錯誤信息

### 問題3：CORS錯誤
**症狀：** 前端無法訪問後端API

**解決方案：**
1. 確認CORS_ORIGIN環境變數設置為 `*`
2. 檢查後端CORS配置
3. 確認前端URL在允許列表中

### 問題4：服務休眠
**症狀：** 免費服務在15分鐘無請求後休眠

**解決方案：**
1. 這是免費服務的正常行為
2. 首次請求會喚醒服務（可能需要幾秒鐘）
3. 考慮升級到付費計劃以獲得更好的性能

## 💡 最佳實踐

### 1. 環境變數管理
- 不要在代碼中硬編碼敏感信息
- 使用環境變數管理配置
- 定期檢查和更新環境變數

### 2. 日誌管理
- 定期檢查日誌
- 設置日誌警報
- 記錄重要的業務邏輯

### 3. 性能優化
- 監控響應時間
- 優化數據庫查詢
- 使用緩存減少請求

### 4. 安全考慮
- 定期更新依賴
- 使用HTTPS
- 實施適當的認證和授權

## 🎯 部署檢查清單

- [ ] 代碼已推送到GitHub
- [ ] 註冊並登錄Render.com
- [ ] 連接GitHub倉庫
- [ ] 配置Node.js服務
- [ ] 設置環境變數
- [ ] 部署服務
- [ ] 測試健康檢查端點
- [ ] 測試API端點
- [ ] 更新前端配置
- [ ] 測試前端連接

## 📞 需要幫助？

如果遇到問題：
1. 查看Render文檔：https://render.com/docs
2. 檢查服務日誌
3. 聯繫Render支持
4. 查看GitHub Issues

---

**恭喜！您已成功部署TCG助手後端到Render！** 🎉

現在您可以享受穩定的後端服務和無縫的前後端連接體驗。
