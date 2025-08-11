# 使用最簡單的防火牆規則設定
# 需要以管理員身份運行

Write-Host "使用簡單規則名稱設定防火牆..." -ForegroundColor Green

# 清理所有可能的舊規則
Write-Host "清理舊規則..." -ForegroundColor Yellow
netsh advfirewall firewall delete rule name="TCG*" 2>$null
netsh advfirewall firewall delete rule name="Node.js*" 2>$null

# 使用最簡單的名稱添加規則
Write-Host "添加簡單規則..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="TCG-In" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="TCG-Out" dir=out action=allow protocol=TCP localport=3001

# 驗證規則
Write-Host "驗證規則..." -ForegroundColor Yellow
netsh advfirewall firewall show rule name="TCG*"

Write-Host "完成！" -ForegroundColor Green
