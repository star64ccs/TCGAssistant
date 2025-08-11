# PostgreSQL 密碼重置腳本
# 使用方法: .\reset-postgres-password.ps1

Write-Host "🔧 PostgreSQL 密碼重置工具" -ForegroundColor Green
Write-Host ""

# 檢查PostgreSQL是否安裝
try {
    $version = & "C:\Program Files\PostgreSQL\17\bin\psql.exe" --version 2>$null
    Write-Host "✅ PostgreSQL 已安裝: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL 未安裝或路徑不正確" -ForegroundColor Red
    exit 1
}

# 檢查PostgreSQL服務狀態
try {
    $service = Get-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue
    if ($service.Status -eq "Running") {
        Write-Host "✅ PostgreSQL 服務正在運行" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL 服務未運行，正在啟動..." -ForegroundColor Yellow
        Start-Service -Name "postgresql-x64-17"
        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "❌ 無法檢查PostgreSQL服務狀態" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 請選擇操作:" -ForegroundColor Cyan
Write-Host "1. 重置 postgres 用戶密碼"
Write-Host "2. 創建 tcg_assistant 數據庫"
Write-Host "3. 測試數據庫連接"
Write-Host "4. 執行所有操作"
Write-Host ""

$choice = Read-Host "請輸入選項 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🔐 重置 postgres 用戶密碼..." -ForegroundColor Yellow
        Write-Host "請在彈出的窗口中輸入當前密碼，然後設置新密碼為: tcg_assistant_2024" -ForegroundColor Cyan
        
        $sql = "ALTER USER postgres PASSWORD 'tcg_assistant_2024';"
        & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c $sql
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 密碼重置成功" -ForegroundColor Green
        } else {
            Write-Host "❌ 密碼重置失敗" -ForegroundColor Red
        }
    }
    "2" {
        Write-Host "🗄️  創建 tcg_assistant 數據庫..." -ForegroundColor Yellow
        
        & "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres tcg_assistant
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 數據庫創建成功" -ForegroundColor Green
        } else {
            Write-Host "❌ 數據庫創建失敗" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "🔍 測試數據庫連接..." -ForegroundColor Yellow
        
        $env:PGPASSWORD = "tcg_assistant_2024"
        & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d tcg_assistant -c "SELECT version();"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 數據庫連接成功" -ForegroundColor Green
        } else {
            Write-Host "❌ 數據庫連接失敗" -ForegroundColor Red
        }
    }
    "4" {
        Write-Host "🚀 執行所有操作..." -ForegroundColor Yellow
        
        # 重置密碼
        Write-Host "1. 重置密碼..." -ForegroundColor Cyan
        $sql = "ALTER USER postgres PASSWORD 'tcg_assistant_2024';"
        & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c $sql
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 密碼重置成功" -ForegroundColor Green
        } else {
            Write-Host "❌ 密碼重置失敗" -ForegroundColor Red
        }
        
        # 創建數據庫
        Write-Host "2. 創建數據庫..." -ForegroundColor Cyan
        & "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres tcg_assistant
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 數據庫創建成功" -ForegroundColor Green
        } else {
            Write-Host "❌ 數據庫創建失敗" -ForegroundColor Red
        }
        
        # 測試連接
        Write-Host "3. 測試連接..." -ForegroundColor Cyan
        $env:PGPASSWORD = "tcg_assistant_2024"
        & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d tcg_assistant -c "SELECT version();"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 數據庫連接成功" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 所有操作完成！" -ForegroundColor Green
            Write-Host "現在可以運行: npm run seed" -ForegroundColor Cyan
        } else {
            Write-Host "❌ 數據庫連接失敗" -ForegroundColor Red
        }
    }
    default {
        Write-Host "❌ 無效選項" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 詳細指南請查看: POSTGRESQL_SETUP_GUIDE.md" -ForegroundColor Cyan
