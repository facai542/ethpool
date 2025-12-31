@echo off
echo Starting ETH Mining Telegram Bot...
echo.

REM Check if .env exists
if not exist .env (
    echo Error: .env file not found!
    echo Please copy .env.example to .env and fill in the values.
    pause
    exit /b 1
)

REM Activate virtual environment if exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt -q

REM Run the bot
echo.
echo Starting bot...
python bot.py

pause



