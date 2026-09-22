@echo off
title DriveCare PRO - Starting Full-Stack Server & Public URL
color 0b

echo ====================================================================
echo           🚗 DriveCare PRO - Automotive Self-Service
echo      Database Systems Engineering ^& Backend (25CS1302E)
echo   Team: P. Bhavan (2520090146), M. Shiva (2520090135), N. Sainathreddy
echo ====================================================================
echo.

cd /d "D:\2nd yr Odd_sem\DBMS\Project_DBMS\backend"

echo [1/2] Launching Backend Server on port 5000...
start "DriveCare Backend" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Cloudflare Public Internet Tunnel...
start "DriveCare Cloudflare Tunnel" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5000"

echo.
echo ====================================================================
echo  System is RUNNING!
echo  Local URL:        http://localhost:5000
echo  Same Wi-Fi URL:   http://10.250.2.144:5000
echo  Public URL:       Check the Cloudflare Tunnel terminal window!
echo ====================================================================
echo.
pause
