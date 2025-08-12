#!/bin/bash

# TCG Assistant 部署腳本
# 支持多環境部署：staging, production
# 支持多平台部署：vercel, netlify, heroku, railway, render

set -e  # 遇到錯誤時退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 顯示幫助信息
show_help() {
    echo "TCG Assistant 部署腳本"
    echo ""
    echo "用法: $0 [選項]"
    echo ""
    echo "選項:"
    echo "  -e, --environment ENV    部署環境 (staging|production)"
    echo "  -p, --platform PLATFORM  部署平台 (vercel|netlify|heroku|railway|render|docker)"
    echo "  -t, --type TYPE          部署類型 (frontend|backend|mobile|all)"
    echo "  -f, --force              強制部署，跳過確認"
    echo "  -v, --verbose            詳細輸出"
    echo "  -h, --help               顯示此幫助信息"
    echo ""
    echo "示例:"
    echo "  $0 -e staging -p vercel -t frontend"
    echo "  $0 -e production -p heroku -t all"
    echo "  $0 --environment production --platform docker --type backend"
}

# 解析命令行參數
ENVIRONMENT=""
PLATFORM=""
DEPLOY_TYPE="all"
FORCE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -t|--type)
            DEPLOY_TYPE="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知選項: $1"
            show_help
            exit 1
            ;;
    esac
done

# 驗證必需參數
if [[ -z "$ENVIRONMENT" ]]; then
    log_error "請指定部署環境 (-e 或 --environment)"
    exit 1
fi

if [[ -z "$PLATFORM" ]]; then
    log_error "請指定部署平台 (-p 或 --platform)"
    exit 1
fi

# 驗證環境參數
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "無效的環境參數: $ENVIRONMENT (支持: staging, production)"
    exit 1
fi

# 驗證平台參數
VALID_PLATFORMS=("vercel" "netlify" "heroku" "railway" "render" "docker" "firebase" "aws")
if [[ ! " ${VALID_PLATFORMS[@]} " =~ " ${PLATFORM} " ]]; then
    log_error "無效的平台參數: $PLATFORM (支持: ${VALID_PLATFORMS[*]})"
    exit 1
fi

# 驗證部署類型
if [[ "$DEPLOY_TYPE" != "frontend" && "$DEPLOY_TYPE" != "backend" && "$DEPLOY_TYPE" != "mobile" && "$DEPLOY_TYPE" != "all" ]]; then
    log_error "無效的部署類型: $DEPLOY_TYPE (支持: frontend, backend, mobile, all)"
    exit 1
fi

# 顯示部署信息
log_info "開始部署 TCG Assistant"
log_info "環境: $ENVIRONMENT"
log_info "平台: $PLATFORM"
log_info "類型: $DEPLOY_TYPE"

# 確認部署
if [[ "$FORCE" != true ]]; then
    echo ""
    read -p "確認部署到 $ENVIRONMENT 環境的 $PLATFORM 平台？(y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "部署已取消"
        exit 0
    fi
fi

# 檢查 Node.js 版本
log_info "檢查 Node.js 版本"
NODE_VERSION=$(node --version)
log_info "Node.js 版本: $NODE_VERSION"

# 檢查依賴項
log_info "檢查依賴項"
if [[ ! -f "package.json" ]]; then
    log_error "找不到 package.json 文件"
    exit 1
fi

# 安裝依賴項
log_info "安裝前端依賴項"
npm ci

if [[ "$DEPLOY_TYPE" == "backend" || "$DEPLOY_TYPE" == "all" ]]; then
    log_info "安裝後端依賴項"
    cd backend
    npm ci
    cd ..
fi

# 設置環境變量
log_info "設置環境變量"
cp env.example .env

# 根據環境設置不同的 API URL
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "EXPO_PUBLIC_API_URL=https://api.tcg-assistant.com" >> .env
    echo "NODE_ENV=production" >> .env
else
    echo "EXPO_PUBLIC_API_URL=https://api-staging.tcg-assistant.com" >> .env
    echo "NODE_ENV=staging" >> .env
fi

# 運行測試
log_info "運行測試"
npm test -- --coverage --watchAll=false

# 代碼質量檢查
log_info "運行代碼質量檢查"
npm run lint:check
npm run format:check

# 根據部署類型執行不同的部署流程
case $DEPLOY_TYPE in
    "frontend")
        deploy_frontend
        ;;
    "backend")
        deploy_backend
        ;;
    "mobile")
        deploy_mobile
        ;;
    "all")
        deploy_frontend
        deploy_backend
        deploy_mobile
        ;;
esac

log_success "部署完成！"

# 部署前端函數
deploy_frontend() {
    log_info "開始部署前端到 $PLATFORM"
    
    # 構建前端
    log_info "構建前端應用"
    npx expo export --platform web
    
    case $PLATFORM in
        "vercel")
            deploy_to_vercel
            ;;
        "netlify")
            deploy_to_netlify
            ;;
        "firebase")
            deploy_to_firebase
            ;;
        *)
            log_error "不支持的前端部署平台: $PLATFORM"
            exit 1
            ;;
    esac
}

# 部署後端函數
deploy_backend() {
    log_info "開始部署後端到 $PLATFORM"
    
    case $PLATFORM in
        "heroku")
            deploy_to_heroku
            ;;
        "railway")
            deploy_to_railway
            ;;
        "render")
            deploy_to_render
            ;;
        "docker")
            deploy_to_docker
            ;;
        *)
            log_error "不支持的後端部署平台: $PLATFORM"
            exit 1
            ;;
    esac
}

# 部署移動應用函數
deploy_mobile() {
    log_info "開始部署移動應用"
    
    # 檢查 EAS CLI
    if ! command -v eas &> /dev/null; then
        log_info "安裝 EAS CLI"
        npm install -g @expo/eas-cli
    fi
    
    # 登錄 Expo
    log_info "登錄 Expo"
    eas login --non-interactive
    
    # 構建移動應用
    log_info "構建 Android 應用"
    eas build --platform android --profile $ENVIRONMENT
    
    log_info "構建 iOS 應用"
    eas build --platform ios --profile $ENVIRONMENT
    
    # 如果是生產環境，提交到應用商店
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "提交到應用商店"
        eas submit --platform android
        eas submit --platform ios
    fi
}

# Vercel 部署
deploy_to_vercel() {
    log_info "部署到 Vercel"
    
    if [[ -z "$VERCEL_TOKEN" ]]; then
        log_error "缺少 VERCEL_TOKEN 環境變量"
        exit 1
    fi
    
    # 使用 Vercel CLI 部署
    npx vercel --prod --token $VERCEL_TOKEN
}

# Netlify 部署
deploy_to_netlify() {
    log_info "部署到 Netlify"
    
    if [[ -z "$NETLIFY_AUTH_TOKEN" ]]; then
        log_error "缺少 NETLIFY_AUTH_TOKEN 環境變量"
        exit 1
    fi
    
    # 使用 Netlify CLI 部署
    npx netlify deploy --prod --dir=web-build --auth=$NETLIFY_AUTH_TOKEN
}

# Firebase 部署
deploy_to_firebase() {
    log_info "部署到 Firebase"
    
    if [[ -z "$FIREBASE_TOKEN" ]]; then
        log_error "缺少 FIREBASE_TOKEN 環境變量"
        exit 1
    fi
    
    # 使用 Firebase CLI 部署
    npx firebase deploy --token $FIREBASE_TOKEN
}

# Heroku 部署
deploy_to_heroku() {
    log_info "部署到 Heroku"
    
    if [[ -z "$HEROKU_API_KEY" ]]; then
        log_error "缺少 HEROKU_API_KEY 環境變量"
        exit 1
    fi
    
    # 使用 Heroku CLI 部署
    cd backend
    npx heroku builds:create --app $HEROKU_APP_NAME
    cd ..
}

# Railway 部署
deploy_to_railway() {
    log_info "部署到 Railway"
    
    if [[ -z "$RAILWAY_TOKEN" ]]; then
        log_error "缺少 RAILWAY_TOKEN 環境變量"
        exit 1
    fi
    
    # 使用 Railway CLI 部署
    cd backend
    npx railway login --token $RAILWAY_TOKEN
    npx railway up
    cd ..
}

# Render 部署
deploy_to_render() {
    log_info "部署到 Render"
    
    # Render 通常通過 Git 集成自動部署
    log_info "Render 部署通常通過 Git 集成自動完成"
    log_info "請確保已配置 Render 的 Git 集成"
}

# Docker 部署
deploy_to_docker() {
    log_info "部署到 Docker"
    
    # 構建 Docker 鏡像
    log_info "構建 Docker 鏡像"
    docker build -t tcg-assistant-backend ./backend
    
    # 推送到 Docker Hub
    if [[ -n "$DOCKER_USERNAME" && -n "$DOCKER_PASSWORD" ]]; then
        log_info "推送到 Docker Hub"
        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
        docker tag tcg-assistant-backend $DOCKER_USERNAME/tcg-assistant-backend:latest
        docker push $DOCKER_USERNAME/tcg-assistant-backend:latest
    fi
}

# 健康檢查
health_check() {
    log_info "執行健康檢查"
    
    # 等待部署完成
    sleep 30
    
    # 檢查前端健康狀態
    if [[ "$DEPLOY_TYPE" == "frontend" || "$DEPLOY_TYPE" == "all" ]]; then
        log_info "檢查前端健康狀態"
        # 這裡可以添加實際的健康檢查邏輯
    fi
    
    # 檢查後端健康狀態
    if [[ "$DEPLOY_TYPE" == "backend" || "$DEPLOY_TYPE" == "all" ]]; then
        log_info "檢查後端健康狀態"
        # 這裡可以添加實際的健康檢查邏輯
    fi
}

# 清理
cleanup() {
    log_info "清理臨時文件"
    rm -f .env
    rm -rf web-build
    rm -rf dist
}

# 主函數
main() {
    # 設置錯誤處理
    trap 'log_error "部署過程中發生錯誤"; cleanup; exit 1' ERR
    
    # 執行部署
    case $DEPLOY_TYPE in
        "frontend")
            deploy_frontend
            ;;
        "backend")
            deploy_backend
            ;;
        "mobile")
            deploy_mobile
            ;;
        "all")
            deploy_frontend
            deploy_backend
            deploy_mobile
            ;;
    esac
    
    # 健康檢查
    health_check
    
    # 清理
    cleanup
    
    log_success "部署成功完成！"
}

# 執行主函數
main "$@"
