#!/bin/bash

# IFT Deployment Script
# Usage: bash /var/www/ift/deploy.sh

set -e

REPO_URL="https://github.com/Shravani-Todankar/ift.git"
REPO_DIR="/var/www/ift"
BRANCH="main"

echo "=============================="
echo "  IFT Deployment Started"
echo "=============================="

# Check if repo exists, if not clone it
if [ ! -d "$REPO_DIR/.git" ]; then
    echo "[0/4] Repo not found. Cloning..."
    git clone "$REPO_URL" "$REPO_DIR"
fi

# Navigate to repo
cd "$REPO_DIR"

# Set remote URL (in case it changed)
git remote set-url origin "$REPO_URL"

# Pull latest code
echo "[1/4] Pulling latest code from $BRANCH..."
git fetch origin
git reset --hard origin/$BRANCH

# Set correct permissions
echo "[2/6] Setting file permissions..."
chown -R www-data:www-data "$REPO_DIR"
chmod -R 755 "$REPO_DIR"

# Install API dependencies
echo "[3/6] Installing API dependencies..."
cd "$REPO_DIR/api"
npm install --production
cd "$REPO_DIR"

# Restart Node.js API via PM2
echo "[4/6] Restarting IFT API (PM2)..."
pm2 restart ift-api 2>/dev/null || pm2 start "$REPO_DIR/api/send-email.js" --name ift-api
pm2 save

# Test nginx config
echo "[5/6] Testing Nginx config..."
nginx -t

# Restart nginx
echo "[6/6] Restarting Nginx..."
systemctl restart nginx

echo "=============================="
echo "  Deployment Complete!"
echo "  Repo: $REPO_URL"
echo "  Branch: $BRANCH"
echo "=============================="
