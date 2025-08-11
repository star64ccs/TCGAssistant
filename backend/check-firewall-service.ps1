# 檢查防火牆服務狀態
Write-Host "檢查Windows防火牆服務狀態..." -ForegroundColor Green

# 檢查防火牆服務
$service = Get-Service -Name "MpsSvc"
Write-Host "防火牆服務狀態: $($service.Status)" -ForegroundColor Yellow
Write-Host "防火牆服務啟動類型: $($service.StartType)" -ForegroundColor Yellow

# 檢查防火牆策略
Write-Host "`n檢查防火牆策略..." -ForegroundColor Green
netsh advfirewall show allprofiles state

# 檢查是否有權限問題
Write-Host "`n檢查當前用戶權限..." -ForegroundColor Green
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Write-Host "當前用戶是管理員: $isAdmin" -ForegroundColor Yellow

if (-not $isAdmin) {
    Write-Host "警告：需要管理員權限來設定防火牆規則！" -ForegroundColor Red
}
