# 暫時關閉防火牆進行測試
# 需要以管理員身份運行

Write-Host "警告：這將暫時關閉Windows防火牆！" -ForegroundColor Red
Write-Host "僅用於測試，測試完成後請重新啟用防火牆。" -ForegroundColor Yellow

$response = Read-Host "是否繼續？(y/N)"
if ($response -ne "y" -and $response -ne "Y") {
    Write-Host "操作已取消。" -ForegroundColor Yellow
    exit
}

Write-Host "正在關閉防火牆..." -ForegroundColor Yellow
netsh advfirewall set allprofiles state off

Write-Host "防火牆已關閉。現在可以測試後端服務器了。" -ForegroundColor Green
Write-Host "測試完成後，請運行以下命令重新啟用防火牆：" -ForegroundColor Cyan
Write-Host "netsh advfirewall set allprofiles state on" -ForegroundColor White
