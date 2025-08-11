# 驗證防火牆設定
Write-Host "檢查防火牆規則..." -ForegroundColor Green

# 檢查入站規則
Write-Host "入站規則:" -ForegroundColor Yellow
netsh advfirewall firewall show rule name="TCG Assistant Backend*" | findstr "Rule Name\|Enabled\|Direction\|Action\|Protocol\|LocalPort"

# 檢查端口是否被監聽
Write-Host "`n檢查端口3001狀態:" -ForegroundColor Yellow
netstat -ano | findstr :3001

# 測試連接
Write-Host "`n測試本地連接:" -ForegroundColor Yellow
Test-NetConnection -ComputerName localhost -Port 3001

Write-Host "`n驗證完成！" -ForegroundColor Green
