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
echo "[2/4] Setting file permissions..."
chown -R www-data:www-data "$REPO_DIR"
chmod -R 755 "$REPO_DIR"

# Test nginx config
echo "[3/4] Testing Nginx config..."
nginx -t

# Restart nginx
echo "[4/4] Restarting Nginx..."
systemctl restart nginx

echo "=============================="
echo "  Deployment Complete!"
echo "  Repo: $REPO_URL"
echo "  Branch: $BRANCH"
echo "=============================="
