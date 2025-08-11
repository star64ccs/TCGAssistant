@echo off
chcp 65001 >nul
echo ========================================
echo    TCG助手 - GitHub倉庫創建工具
echo ========================================
echo.

echo 🔍 檢查Git狀態...
git status

echo.
echo 📝 請先在GitHub上創建倉庫：
echo 1. 訪問 https://github.com/new
echo 2. 倉庫名稱：TCGAssistant
echo 3. 描述：TCG助手 - 集卡牌識別、價格查詢、投資建議於一體的智能應用
echo 4. 選擇：Public（公開）
echo 5. 不要勾選 "Add a README file"
echo 6. 點擊 "Create repository"
echo.

echo 🌐 創建完成後，請輸入您的GitHub用戶名：
set /p github_username=

echo.
echo 📤 開始準備推送代碼...

echo.
echo 📝 添加所有文件到Git...
git add .

echo.
echo 📝 提交更改...
git commit -m "初始提交 - TCG助手完整項目"

echo.
echo 🔗 添加GitHub遠程倉庫...
git remote add origin https://github.com/%github_username%/TCGAssistant.git

echo.
echo 📤 推送到GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ 代碼已成功推送到GitHub！
echo.
echo 🎯 現在您可以：
echo 1. 回到Render.com
echo 2. 重新進入Web Service創建流程
echo 3. 應該能看到您的TCGAssistant倉庫了
echo.
pause
