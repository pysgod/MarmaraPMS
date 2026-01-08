@echo off
set VPS_IP=72.62.148.112
set USER=root
set PASSWORD=nUtMjSEtjC3pvkg.

echo ==========================================
echo      MARMARA PMS ASYNC DEPLOYMENT
echo      (FORCE REBUILD & CLEAN)
echo ==========================================
echo.

REM 1. Backend Paketleme
echo [1/4] Backend paketleniyor...
if exist server.zip del server.zip
cd server
if not exist src\scripts\syncDb.js (
    echo syncDb.js eksik!
)
tar -a -c -f ..\server.zip --exclude "node_modules" *
cd ..

REM 2. Frontend Paketleme (HER ZAMAN YENI BUILD)
echo [2/4] Frontend build aliniyor...
if exist dist rmdir /s /q dist
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Frontend build hatasi!
    pause
    exit /b %ERRORLEVEL%
)

echo Frontend zipleniyor...
if exist frontend.zip del frontend.zip
cd dist
tar -a -c -f ..\frontend.zip *
cd ..

echo.
echo ==========================================
echo VPS: %VPS_IP%
echo Sifre: %PASSWORD%
echo ==========================================
echo.
echo Lutfen sifre soruldugunda yukaridaki sifreyi girin.
echo.

REM 3. Upload
echo [3/4] Dosyalar yukleniyor...
scp server.zip frontend.zip install_full.sh %USER%@%VPS_IP%:/root/

REM 4. Install (Async)
echo [4/4] Kurulum arka planda baslatiliyor...
echo.
echo "Sifrenizi tekrar girmeniz gerekebilir:"
ssh %USER%@%VPS_IP% "chmod +x install_full.sh && nohup ./install_full.sh > install.log 2>&1 &"

echo.
echo ==========================================
echo Kurulum sunucuda basladi! 
echo Yaklasik 2-3 dakika sonra siteye erisebilirsiniz.
echo.
echo Loglari izlemek isterseniz yeni terminalde:
echo ssh %USER%@%VPS_IP% "tail -f install.log"
echo ==========================================
pause
