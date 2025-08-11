# 修正的Windows防火牆設定腳本
# 需要以管理員身份運行

Write-Host "正在設定Windows防火牆規則..." -ForegroundColor Green

# 先刪除可能存在的舊規則
Write-Host "清理舊規則..." -ForegroundColor Yellow
netsh advfirewall firewall delete rule name="TCG Assistant Backend (Inbound)" 2>$null
netsh advfirewall firewall delete rule name="TCG Assistant Backend (Outbound)" 2>$null
netsh advfirewall firewall delete rule name="TCGAssistant-Inbound" 2>$null
netsh advfirewall firewall delete rule name="TCGAssistant-Outbound" 2>$null

# 使用簡化的規則名稱添加入站規則
Write-Host "添加入站規則..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="TCGAssistant-Inbound" dir=in action=allow protocol=TCP localport=3001

# 使用簡化的規則名稱添加出站規則
Write-Host "添加出站規則..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="TCGAssistant-Outbound" dir=out action=allow protocol=TCP localport=3001

# 驗證規則
Write-Host "驗證防火牆規則..." -ForegroundColor Yellow
netsh advfirewall firewall show rule name="TCGAssistant*"

Write-Host "防火牆規則設定完成！" -ForegroundColor Green
Write-Host "現在可以啟動後端服務器了。" -ForegroundColor Cyan
