@echo off
set VPS_IP=72.62.148.112
set USER=root
set PASSWORD=nUtMjSEtjC3pvkg.

echo 1. Temizlik yapiliyor...
if exist server.zip del server.zip
if exist temp_server rmdir /s /q temp_server

echo 2. Dosyalar kopyalaniyor...
xcopy server temp_server /E /I /Q
if exist temp_server\node_modules rmdir /s /q temp_server\node_modules

echo 3. Zip olusturuluyor...
powershell Compress-Archive -Path "temp_server\*" -DestinationPath "server.zip" -Force
rmdir /s /q temp_server

echo.
echo ==========================================
echo VPS: %VPS_IP%
echo Sifre: %PASSWORD%
echo ==========================================
echo.
echo Lutfen sifre soruldugunda yukaridaki sifreyi girin.
echo.

echo 4. Dosyalar yukleniyor (scp)...
scp server.zip install.sh %USER%@%VPS_IP%:/root/

echo.
echo 5. Kurulum baslatiliyor (ssh)...
ssh -t %USER%@%VPS_IP% "chmod +x install.sh && ./install.sh"

echo.
echo Deployment tamamlandi!
pause
