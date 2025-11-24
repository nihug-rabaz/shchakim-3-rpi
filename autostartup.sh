
echo "==[ SHCHAKIM AUTO-UPDATE ]=="
echo "Start: $(date)"
echo "--------------------------------"

# מעבר לתיקיית הפרויקט
cd ~/shk-rpi || {
    echo "[ERROR] Project folder not found: ~/shk-rpi"
    exit 1
}

echo "[GIT] Fetching updates..."
git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[UPDATE] New version found! Pulling..."
    git pull origin main || { echo "[ERROR] Git pull failed"; exit 1; }

    echo "[NPM] Installing packages..."
    npm install || { echo "[ERROR] npm install failed"; exit 1; }

    echo "[BUILD] Building project..."
    npm run build || { echo "[ERROR] build failed"; exit 1; }
else
    echo "[INFO] No updates found."
fi

echo "[START] Starting app..."
npm run start || { echo "[ERROR] App failed to start"; exit 1; }

echo "--------------------------------"
echo "Done: $(date)"
