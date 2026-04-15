@echo off
echo ===================================
echo CAR-Bot - Starting Backend Server
echo ===================================
echo.

cd backend

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
call venv\Scripts\activate
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Copy .env.example to .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo WARNING: Please update the .env file with your configuration before running the server.
    echo Press any key to continue anyway, or Ctrl+C to cancel...
    pause >nul
)

REM Initialize database
echo.
echo Initializing database...
python -c "import asyncio; from app.db.init_db import init_database; asyncio.run(init_database())"
if errorlevel 1 (
    echo ERROR: Failed to initialize database
    pause
    exit /b 1
)

REM Start server
echo.
echo Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo API docs at: http://localhost:8000/docs
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
