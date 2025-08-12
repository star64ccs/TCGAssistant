# TCG Assistant 部署腳本 (PowerShell版本)
# 支持多環境部署：staging, production
# 支持多平台部署：vercel, netlify, heroku, railway, render

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("staging", "production")]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("vercel", "netlify", "heroku", "railway", "render", "docker", "firebase", "aws")]
    [string]$Platform,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("frontend", "backend", "mobile", "all")]
    [string]$Type = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# 設置錯誤處理
$ErrorActionPreference = "Stop"

# 顏色定義
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# 日誌函數
function Write-LogInfo {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-LogWarning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-LogError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# 顯示幫助信息
function Show-Help {
    Write-Host "TCG Assistant 部署腳本 (PowerShell版本)"
    Write-Host ""
    Write-Host "用法: .\deploy.ps1 -Environment <environment> -Platform <platform> [選項]"
    Write-Host ""
    Write-Host "參數:"
    Write-Host "  -Environment ENV    部署環境 (staging|production)"
    Write-Host "  -Platform PLATFORM  部署平台 (vercel|netlify|heroku|railway|render|docker)"
    Write-Host "  -Type TYPE          部署類型 (frontend|backend|mobile|all)"
    Write-Host "  -Force              強制部署，跳過確認"
    Write-Host "  -Verbose            詳細輸出"
    Write-Host ""
    Write-Host "示例:"
    Write-Host "  .\deploy.ps1 -Environment staging -Platform vercel -Type frontend"
    Write-Host "  .\deploy.ps1 -Environment production -Platform heroku -Type all"
}

# 檢查是否在正確的目錄
if (-not (Test-Path "package.json")) {
    Write-LogError "找不到 package.json 文件，請確保在專案根目錄執行此腳本"
    exit 1
}

# 顯示部署信息
Write-LogInfo "開始部署 TCG Assistant"
Write-LogInfo "環境: $Environment"
Write-LogInfo "平台: $Platform"
Write-LogInfo "類型: $Type"

# 確認部署
if (-not $Force) {
    $confirmation = Read-Host "確認部署到 $Environment 環境的 $Platform 平台？(y/N)"
    if ($confirmation -ne "y" -and $confirmation -ne "Y") {
        Write-LogWarning "部署已取消"
        exit 0
    }
}

# 檢查 Node.js 版本
Write-LogInfo "檢查 Node.js 版本"
try {
    $nodeVersion = node --version
    Write-LogInfo "Node.js 版本: $nodeVersion"
} catch {
    Write-LogError "Node.js 未安裝或不在 PATH 中"
    exit 1
}

# 檢查 npm 版本
Write-LogInfo "檢查 npm 版本"
try {
    $npmVersion = npm --version
    Write-LogInfo "npm 版本: $npmVersion"
} catch {
    Write-LogError "npm 未安裝或不在 PATH 中"
    exit 1
}

# 安裝依賴項
Write-LogInfo "安裝前端依賴項"
npm ci

if ($Type -eq "backend" -or $Type -eq "all") {
    Write-LogInfo "安裝後端依賴項"
    Set-Location backend
    npm ci
    Set-Location ..
}

# 設置環境變量
Write-LogInfo "設置環境變量"
Copy-Item env.example .env

# 根據環境設置不同的 API URL
if ($Environment -eq "production") {
    Add-Content .env "EXPO_PUBLIC_API_URL=https://api.tcg-assistant.com"
    Add-Content .env "NODE_ENV=production"
} else {
    Add-Content .env "EXPO_PUBLIC_API_URL=https://api-staging.tcg-assistant.com"
    Add-Content .env "NODE_ENV=staging"
}

# 運行測試
Write-LogInfo "運行測試"
npm test -- --coverage --watchAll=false

# 代碼質量檢查
Write-LogInfo "運行代碼質量檢查"
npm run lint:check
npm run format:check

# 部署函數
function Deploy-Frontend {
    Write-LogInfo "開始部署前端到 $Platform"
    
    # 構建前端
    Write-LogInfo "構建前端應用"
    npx expo export --platform web
    
    switch ($Platform) {
        "vercel" { Deploy-ToVercel }
        "netlify" { Deploy-ToNetlify }
        "firebase" { Deploy-ToFirebase }
        default {
            Write-LogError "不支持的前端部署平台: $Platform"
            exit 1
        }
    }
}

function Deploy-Backend {
    Write-LogInfo "開始部署後端到 $Platform"
    
    switch ($Platform) {
        "heroku" { Deploy-ToHeroku }
        "railway" { Deploy-ToRailway }
        "render" { Deploy-ToRender }
        "docker" { Deploy-ToDocker }
        default {
            Write-LogError "不支持的後端部署平台: $Platform"
            exit 1
        }
    }
}

function Deploy-Mobile {
    Write-LogInfo "開始部署移動應用"
    
    # 檢查 EAS CLI
    try {
        $easVersion = eas --version
        Write-LogInfo "EAS CLI 版本: $easVersion"
    } catch {
        Write-LogInfo "安裝 EAS CLI"
        npm install -g @expo/eas-cli
    }
    
    # 登錄 Expo
    Write-LogInfo "登錄 Expo"
    eas login --non-interactive
    
    # 構建移動應用
    Write-LogInfo "構建 Android 應用"
    eas build --platform android --profile $Environment
    
    Write-LogInfo "構建 iOS 應用"
    eas build --platform ios --profile $Environment
    
    # 如果是生產環境，提交到應用商店
    if ($Environment -eq "production") {
        Write-LogInfo "提交到應用商店"
        eas submit --platform android
        eas submit --platform ios
    }
}

# 平台特定部署函數
function Deploy-ToVercel {
    Write-LogInfo "部署到 Vercel"
    
    if (-not $env:VERCEL_TOKEN) {
        Write-LogError "缺少 VERCEL_TOKEN 環境變量"
        exit 1
    }
    
    npx vercel --prod --token $env:VERCEL_TOKEN
}

function Deploy-ToNetlify {
    Write-LogInfo "部署到 Netlify"
    
    if (-not $env:NETLIFY_AUTH_TOKEN) {
        Write-LogError "缺少 NETLIFY_AUTH_TOKEN 環境變量"
        exit 1
    }
    
    npx netlify deploy --prod --dir=web-build --auth=$env:NETLIFY_AUTH_TOKEN
}

function Deploy-ToFirebase {
    Write-LogInfo "部署到 Firebase"
    
    if (-not $env:FIREBASE_TOKEN) {
        Write-LogError "缺少 FIREBASE_TOKEN 環境變量"
        exit 1
    }
    
    npx firebase deploy --token $env:FIREBASE_TOKEN
}

function Deploy-ToHeroku {
    Write-LogInfo "部署到 Heroku"
    
    if (-not $env:HEROKU_API_KEY) {
        Write-LogError "缺少 HEROKU_API_KEY 環境變量"
        exit 1
    }
    
    Set-Location backend
    npx heroku builds:create --app $env:HEROKU_APP_NAME
    Set-Location ..
}

function Deploy-ToRailway {
    Write-LogInfo "部署到 Railway"
    
    if (-not $env:RAILWAY_TOKEN) {
        Write-LogError "缺少 RAILWAY_TOKEN 環境變量"
        exit 1
    }
    
    Set-Location backend
    npx railway login --token $env:RAILWAY_TOKEN
    npx railway up
    Set-Location ..
}

function Deploy-ToRender {
    Write-LogInfo "部署到 Render"
    Write-LogInfo "Render 部署通常通過 Git 集成自動完成"
    Write-LogInfo "請確保已配置 Render 的 Git 集成"
}

function Deploy-ToDocker {
    Write-LogInfo "部署到 Docker"
    
    # 構建 Docker 鏡像
    Write-LogInfo "構建 Docker 鏡像"
    docker build -t tcg-assistant-backend ./backend
    
    # 推送到 Docker Hub
    if ($env:DOCKER_USERNAME -and $env:DOCKER_PASSWORD) {
        Write-LogInfo "推送到 Docker Hub"
        echo $env:DOCKER_PASSWORD | docker login -u $env:DOCKER_USERNAME --password-stdin
        docker tag tcg-assistant-backend $env:DOCKER_USERNAME/tcg-assistant-backend:latest
        docker push $env:DOCKER_USERNAME/tcg-assistant-backend:latest
    }
}

# 健康檢查
function Test-Health {
    Write-LogInfo "執行健康檢查"
    
    # 等待部署完成
    Start-Sleep -Seconds 30
    
    # 檢查前端健康狀態
    if ($Type -eq "frontend" -or $Type -eq "all") {
        Write-LogInfo "檢查前端健康狀態"
        # 這裡可以添加實際的健康檢查邏輯
    }
    
    # 檢查後端健康狀態
    if ($Type -eq "backend" -or $Type -eq "all") {
        Write-LogInfo "檢查後端健康狀態"
        # 這裡可以添加實際的健康檢查邏輯
    }
}

# 清理
function Clear-TempFiles {
    Write-LogInfo "清理臨時文件"
    if (Test-Path .env) { Remove-Item .env }
    if (Test-Path web-build) { Remove-Item web-build -Recurse -Force }
    if (Test-Path dist) { Remove-Item dist -Recurse -Force }
}

# 主執行邏輯
try {
    # 根據部署類型執行不同的部署流程
    switch ($Type) {
        "frontend" { Deploy-Frontend }
        "backend" { Deploy-Backend }
        "mobile" { Deploy-Mobile }
        "all" {
            Deploy-Frontend
            Deploy-Backend
            Deploy-Mobile
        }
    }
    
    # 健康檢查
    Test-Health
    
    # 清理
    Clear-TempFiles
    
    Write-LogSuccess "部署成功完成！"
} catch {
    Write-LogError "部署過程中發生錯誤: $($_.Exception.Message)"
    Clear-TempFiles
    exit 1
}
