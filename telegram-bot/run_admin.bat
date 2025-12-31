@echo off
chcp 65001 >nul
echo ========================================
echo 启动 Telegram Admin Bot...
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [错误] .env 文件不存在！
    echo 请复制 .env.example 到 .env 并填写配置值。
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment if exists
if exist venv\Scripts\activate.bat (
    echo [信息] 激活虚拟环境...
    call venv\Scripts\activate.bat
)

REM Check if requirements are installed
echo [信息] 检查依赖...
python -c "import supabase" 2>nul
if errorlevel 1 (
    echo [信息] 安装依赖包...
    pip install -r requirements_admin.txt
    if errorlevel 1 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
)

REM Run the admin bot
echo.
echo [信息] 启动 Admin Bot...
echo.
python bot_admin.py

pause


