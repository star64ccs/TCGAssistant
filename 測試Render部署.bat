@echo off
chcp 65001 >nul
echo ========================================
echo    TCG助手後端 - Render部署測試工具
echo ========================================
echo.

echo 🌐 請輸入您的Render服務URL（例如：https://tcg-assistant-backend.onrender.com）
set /p service_url=

echo.
echo 🔍 開始測試部署...
echo.

echo 📊 測試1：健康檢查端點
echo 訪問：%service_url%/health
curl -s "%service_url%/health"
echo.
echo.

echo 📊 測試2：API端點
echo 訪問：%service_url%/api/v1
curl -s "%service_url%/api/v1"
echo.
echo.

echo 📊 測試3：用戶資料端點
echo 訪問：%service_url%/api/v1/user/profile
curl -s "%service_url%/api/v1/user/profile"
echo.
echo.

echo 📊 測試4：卡牌資料端點
echo 訪問：%service_url%/api/v1/cardData/pokemon
curl -s "%service_url%/api/v1/cardData/pokemon"
echo.
echo.

echo ========================================
echo    測試結果說明：
echo ========================================
echo.
echo ✅ 如果看到JSON響應，表示部署成功
echo ❌ 如果看到錯誤信息，請檢查：
echo    1. URL是否正確
echo    2. 服務是否已部署完成
echo    3. 環境變數是否正確設置
echo.
echo 🔗 您也可以直接在瀏覽器中訪問這些URL進行測試
echo.
echo 📋 接下來請更新前端的API配置：
echo    將 localhost:3000 替換為 %service_url%
echo.
pause
