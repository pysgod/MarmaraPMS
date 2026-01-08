#!/bin/bash
set -e

echo "🔧 Sistem güncelleniyor..."
apt-get update
# Remove conflicting interactive prompts
export DEBIAN_FRONTEND=noninteractive
apt-get install -y curl unzip nginx

# Install Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Node.js kuruluyor..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "📦 PostgreSQL kuruluyor..."
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# Setup Database
echo "🔧 Veritabanı hazırlanıyor..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres123';" || true
sudo -u postgres psql -c "CREATE DATABASE marmara_pms;" || true

# Setup Application
echo "🔧 Uygulama kuruluyor..."
rm -rf /root/marmara-pms-server
mkdir -p /root/marmara-pms-server
unzip -o /root/server.zip -d /root/marmara-pms-server
cd /root/marmara-pms-server

# Install dependencies
echo "📦 Bağımlılıklar yükleniyor..."
npm install

# Seed Database
echo "🌱 Veritabanı dolduruluyor..."
npm run db:sync
npm run db:seed

# Configure Nginx
echo "🔧 Nginx ayarlanıyor..."
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name _;

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
nginx -t
systemctl restart nginx

# Start Server
echo "🚀 Sunucu başlatılıyor..."
npm install -g pm2
pm2 delete marmara-server || true
pm2 start src/index.js --name marmara-server
pm2 save

echo "✅ Kurulum başarıyla tamamlandı!"
