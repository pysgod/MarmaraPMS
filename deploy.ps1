$ErrorActionPreference = "Stop"

$VPS_IP = "72.62.148.112"
$USER = "root"
$PASSWORD = "nUtMjSEtjC3pvkg."

Write-Host "📦 Backend paketleniyor..."
# Temizle
if (Test-Path "server.zip") { Remove-Item "server.zip" }
if (Test-Path "temp_server") { Remove-Item "temp_server" -Recurse -Force }

# Kopyala ve node_modules temizle
Copy-Item -Path "server" -Destination "temp_server" -Recurse
if (Test-Path "temp_server/node_modules") { Remove-Item "temp_server/node_modules" -Recurse -Force }

# Zip
Compress-Archive -Path "temp_server\*" -DestinationPath "server.zip"
Remove-Item "temp_server" -Recurse -Force

Write-Host "🚀 VPS'e bağlanılıyor ($VPS_IP)..."
Write-Host "⚠️  Şifre: $PASSWORD"
Write-Host "⚠️  Şifre sorulduğunda lütfen giriniz (iki kez sorulabilir)."

# Dosyaları yükle
Write-Host "📤 Dosyalar yükleniyor (server.zip, install.sh)..."
scp server.zip install.sh ${USER}@${VPS_IP}:/root/

# Kurulum scriptini çalıştır
Write-Host "🔧 Uzaktan kurulum başlatılıyor..."
ssh -t ${USER}@${VPS_IP} "chmod +x install.sh && ./install.sh"

Write-Host ""
Write-Host "🎉 Deployment tamamlandı!"
Write-Host "API Durumu: http://${VPS_IP}:3001/api/health"
