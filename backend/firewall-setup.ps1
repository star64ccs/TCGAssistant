# Windows防火牆設定腳本
# 需要以管理員身份運行

Write-Host "正在設定Windows防火牆規則..." -ForegroundColor Green

# 添加入站規則
Write-Host "添加入站規則..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="TCG Assistant Backend (Inbound)" dir=in action=allow protocol=TCP localport=3001

# 添加出站規則
Write-Host "添加出站規則..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="TCG Assistant Backend (Outbound)" dir=out action=allow protocol=TCP localport=3001

# 驗證規則
Write-Host "驗證防火牆規則..." -ForegroundColor Yellow
netsh advfirewall firewall show rule name="TCG Assistant Backend*"

Write-Host "防火牆規則設定完成！" -ForegroundColor Green
Write-Host "現在可以啟動後端服務器了。" -ForegroundColor Cyan
