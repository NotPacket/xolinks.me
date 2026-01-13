@echo off
echo ================================================
echo Deploying xolinks.me Databases to Proxmox LXC
echo ================================================
echo.
echo Target: 192.168.1.222 (xolinks.me LXC container)
echo.

echo Step 1: Uploading docker-compose file to Proxmox LXC...
scp docker\docker-compose.proxmox.yml root@192.168.1.222:/root/xolinks-databases/docker-compose.yml

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to upload file
    pause
    exit /b 1
)

echo.
echo Step 2: Starting containers on Proxmox LXC...
ssh root@192.168.1.222 "cd /root/xolinks-databases && docker compose up -d"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start containers
    pause
    exit /b 1
)

echo.
echo Step 3: Checking container status...
ssh root@192.168.1.222 "docker ps | grep xolinks"

echo.
echo ================================================
echo Databases deployed successfully!
echo ================================================
echo.
echo PostgreSQL: 192.168.1.222:5432
echo Redis: 192.168.1.222:6379
echo.
echo Next steps:
echo 1. Run: npx prisma migrate dev --name init
echo 2. Run: npm run dev
echo.
pause
