#!/bin/bash

# TCG助手後端快速部署腳本
# 部署到 Render.com

echo "🚀 開始部署TCG助手後端到Render..."

# 檢查Git狀態
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  發現未提交的更改，正在提交..."
    git add .
    git commit -m "準備部署到Render - $(date)"
fi

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin main

echo "✅ 代碼已推送到GitHub"
echo ""
echo "📋 接下來請在Render.com上："
echo "1. 訪問 https://render.com"
echo "2. 註冊/登錄帳戶"
echo "3. 點擊 'New +' → 'Web Service'"
echo "4. 連接您的GitHub倉庫"
echo "5. 配置服務："
echo "   - Name: tcg-assistant-backend"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Root Directory: backend"
echo "6. 設置環境變數："
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - API_VERSION=v1"
echo "   - CORS_ORIGIN=*"
echo "7. 點擊 'Create Web Service'"
echo ""
echo "🎉 部署完成後，您將獲得一個URL，例如："
echo "   https://tcg-assistant-backend.onrender.com"
echo ""
echo "🔗 然後更新前端的API配置即可！"
