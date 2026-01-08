#!/bin/bash
set +e

echo "=========================================="
echo "   MARMARA PMS FORCE CLEAN INSTALLER"
echo "   [$(date)]"
echo "=========================================="

export DEBIAN_FRONTEND=noninteractive

# 1. RAKIP SERVISLERI DURDUR
echo ">>> [1/7] Eski servisler ve port çakışmaları temizleniyor..."
systemctl stop apache2 || true
systemctl disable apache2 || true
systemctl stop nginx || true
pm2 stop all || true
pm2 delete all || true

# 2. DOSYA TEMIZLIGI (AGRESIF)
echo ">>> [2/7] Eski site dosyalari siliniyor..."
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/default
rm -rf /var/www/html
rm -rf /var/www/marmara-pms
rm -rf /root/marmara-pms-server
# /var/www altında başka ne varsa sil (tehlikeli ama istenen bu)
# rm -rf /var/www/* 

# 3. SISTEM GUNCELLEME
echo ">>> [3/7] Paketler guncelleniyor..."
apt-get update > /dev/null
apt-get install -y curl unzip nginx nodejs npm postgresql postgresql-contrib > /dev/null

# 4. FRONTEND KURULUM
echo ">>> [4/7] Frontend kuruluyor..."
mkdir -p /var/www/marmara-pms
unzip -o /root/frontend.zip -d /var/www/marmara-pms > /dev/null

if [ -d "/var/www/marmara-pms/dist" ]; then
    mv /var/www/marmara-pms/dist/* /var/www/marmara-pms/
    rmdir /var/www/marmara-pms/dist
fi

# Index.html kontrolü
if [ ! -f "/var/www/marmara-pms/index.html" ]; then
    echo "HATA: Frontend zip acilmadi veya index.html yok!"
    # Basit bir index.html olustur (Test icin)
    echo "<h1>Marmara PMS Yukleniyor...</h1><p>Frontend dosyalari eksik. Lutfen deploy işlemini kontrol edin.</p>" > /var/www/marmara-pms/index.html
fi

# 5. NGINX CONFIG
echo ">>> [5/7] Nginx ayarlaniyor..."
cat > /etc/nginx/sites-available/marmara <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/marmara-pms;
    index index.html;
    server_name _;

    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/marmara /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 6. BACKEND KURULUM
echo ">>> [6/7] Backend kuruluyor..."
systemctl start postgresql
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres123';" > /dev/null 2>&1
sudo -u postgres psql -c "CREATE DATABASE marmara_pms;" > /dev/null 2>&1

mkdir -p /root/marmara-pms-server
unzip -o /root/server.zip -d /root/marmara-pms-server > /dev/null
cd /root/marmara-pms-server

echo "   - NPM Install..."
npm install --omit=dev > /dev/null 2>&1

echo "   - DB Sync/Seed..."
if [ -f "src/scripts/syncDb.js" ]; then
    node src/scripts/syncDb.js
fi
npm run db:seed > /dev/null 2>&1

echo "   - PM2 Start..."
npm install -g pm2 > /dev/null 2>&1
pm2 start src/index.js --name marmara-server
pm2 save > /dev/null 2>&1

echo ">>> [7/7] ISLEM TAMAMLANDI!"
echo "---------------------------------------------------"
echo "Lutfen kontrol edin: http://72.62.148.112"
echo "---------------------------------------------------"
