#!/data/data/com.termux/files/usr/bin/bash

echo "==[ SHCHAKIM AUTO-UPDATE ]=="
echo "Start: $(date)"
echo "--------------------------------"

REPO_URL="https://github.com/nihug-rabaz/shchakim-3-rpi.git"
PROJECT_DIR="~/shk-rpi"

# אם התיקייה לא קיימת – מבצע קלונינג
if [ ! -d "$PROJECT_DIR" ]; then
    echo "[INIT] Project folder not found. Cloning repository..."
    git clone "$REPO_URL" "$PROJECT_DIR" || {
        echo "[ERROR] Failed to clone repository"
        exit 1
    }
    echo "[INIT] Clone completed."
fi

# מעבר לתיקיית הפרויקט
cd ~/shk-rpi || {
    echo "[ERROR] Cannot enter project directory"
    exit 1
}

echo "[GIT] Fetching updates..."
git fetch origin master

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[UPDATE] New version found! Pulling..."
    git pull origin master || { echo "[ERROR] Git pull failed"; exit 1; }

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
