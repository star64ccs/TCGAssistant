# 使用PowerShell原生防火牆命令
# 需要以管理員身份運行

Write-Host "使用PowerShell原生命令設定防火牆..." -ForegroundColor Green

# 檢查模組是否可用
if (-not (Get-Module -ListAvailable -Name NetSecurity)) {
    Write-Host "錯誤：NetSecurity模組不可用" -ForegroundColor Red
    exit 1
}

# 刪除舊規則
Write-Host "刪除舊規則..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "TCG*" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Node.js*" -ErrorAction SilentlyContinue

# 添加新規則
Write-Host "添加新規則..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "TCG-Backend-In" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
New-NetFirewallRule -DisplayName "TCG-Backend-Out" -Direction Outbound -Protocol TCP -LocalPort 3001 -Action Allow

# 驗證規則
Write-Host "驗證規則..." -ForegroundColor Yellow
Get-NetFirewallRule -DisplayName "TCG*"

Write-Host "完成！" -ForegroundColor Green
