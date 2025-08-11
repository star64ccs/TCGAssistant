@echo off
chcp 65001 >nul
echo ========================================
echo    TCG助手後端 - Render部署準備工具
echo ========================================
echo.

echo 🔍 檢查Git狀態...
git status

echo.
echo 📝 是否要提交當前更改？(Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    echo.
    echo 📤 提交更改...
    git add .
    git commit -m "準備部署到Render - %date% %time%"
    
    echo.
    echo 📤 推送到GitHub...
    git push origin main
    
    echo.
    echo ✅ 代碼已推送到GitHub！
) else (
    echo.
    echo ⚠️  跳過提交步驟
)

echo.
echo ========================================
echo    接下來請在Render.com上操作：
echo ========================================
echo.
echo 1. 🌐 訪問 https://render.com
echo 2. 📝 註冊/登錄帳戶
echo 3. ➕ 點擊 "New +" → "Web Service"
echo 4. 🔗 連接您的GitHub倉庫
echo 5. ⚙️  配置服務：
echo    - Name: tcg-assistant-backend
echo    - Environment: Node
echo    - Build Command: npm install
echo    - Start Command: npm start
echo    - Root Directory: backend
echo 6. 🔧 設置環境變數：
echo    - NODE_ENV=production
echo    - PORT=10000
echo    - API_VERSION=v1
echo    - CORS_ORIGIN=*
echo 7. 🚀 點擊 "Create Web Service"
echo.
echo 📋 詳細教學請查看：Render部署詳細教學.md
echo.
echo 🎯 部署完成後，您將獲得一個URL
echo    例如：https://tcg-assistant-backend.onrender.com
echo.
echo 🔗 然後更新前端的API配置即可！
echo.
pause
