# 為Node.js程序添加防火牆規則
# 需要以管理員身份運行

Write-Host "正在為Node.js程序添加防火牆規則..." -ForegroundColor Green

# 獲取Node.js路徑
$nodePath = (Get-Command node).Source
Write-Host "Node.js路徑: $nodePath" -ForegroundColor Yellow

# 為Node.js添加入站規則
Write-Host "為Node.js添加入站規則..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="Node.js TCG Assistant (Inbound)" dir=in action=allow program="$nodePath"

# 為Node.js添加出站規則
Write-Host "為Node.js添加出站規則..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="Node.js TCG Assistant (Outbound)" dir=out action=allow program="$nodePath"

# 驗證規則
Write-Host "驗證防火牆規則..." -ForegroundColor Yellow
netsh advfirewall firewall show rule name="Node.js TCG Assistant*"

Write-Host "程序防火牆規則設定完成！" -ForegroundColor Green
