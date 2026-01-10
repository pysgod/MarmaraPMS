@echo off
title Marmara PMS Launcher
echo Marmara PMS Baslatiliyor...

echo 1. Veritabani Baslatiliyor (Local PGSQL)...
pgsql\bin\pg_ctl.exe -D pgsql\data -l pgsql\logfile.log start
if %errorlevel% neq 0 (
    echo Veritabani zaten calisiyor olabilir veya hata olustu. Devam ediliyor...
) else (
    echo Veritabani baslatildi.
)

timeout /t 3

echo 2. Backend Sunucusu Baslatiliyor...
start "Marmara PMS Backend" /D "server" cmd /k "npm run dev"

timeout /t 3

echo 3. Frontend Uygulamasi Baslatiliyor...
start "Marmara PMS Frontend" cmd /k "npm run dev"

echo.
echo Tum servisler baslatildi!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
pause
