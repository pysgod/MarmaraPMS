@echo off
set VPS_IP=72.62.148.112
set USER=root
set PASSWORD=nUtMjSEtjC3pvkg.

echo ==========================================
echo      MARMARA PMS FULL DEPLOYMENT
echo ==========================================
echo.

REM 1. Backend Paketleme
echo [1/5] Backend paketleniyor...
if exist server.zip del server.zip

echo Zip olusturuluyor (tar)...
cd server
tar -a -c -f ..\server.zip --exclude "node_modules" *
cd ..

REM 2. Frontend Build ve Paketleme
echo [2/5] Frontend build aliniyor...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Frontend build hatasi!
    pause
    exit /b %ERRORLEVEL%
)

echo Frontend paketleniyor...
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
echo [3/5] Dosyalar yukleniyor (backend + frontend)...
scp server.zip frontend.zip install_full.sh %USER%@%VPS_IP%:/root/

REM 4. Install
echo [4/5] Kurulum baslatiliyor (ssh)...
ssh -t %USER%@%VPS_IP% "chmod +x install_full.sh && ./install_full.sh"

echo.
echo [5/5] Deployment tamamlandi!
echo Tarayicidan kontrol edin: http://%VPS_IP%
pause
