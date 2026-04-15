@echo off
echo ===================================
echo CAR-Bot - Starting Frontend Server
echo ===================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Start development server
echo.
echo Starting Next.js development server...
echo Frontend will be available at: http://localhost:3000
echo.
npm run dev
