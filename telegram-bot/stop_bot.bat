@echo off
chcp 65001 >nul
echo ========================================
echo 停止 Telegram Admin Bot
echo ========================================
echo.

REM 查找占用端口 8080 的进程
echo [信息] 查找占用端口 8080 的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    set PID=%%a
    echo [信息] 找到进程 ID: %%a
    echo [信息] 正在停止进程...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo [错误] 无法停止进程，可能需要管理员权限
    ) else (
        echo [成功] 进程已停止
    )
)

REM 查找所有 Python 进程（可选）
echo.
echo [信息] 检查是否还有 Python 进程运行...
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /I "python.exe" >nul
if errorlevel 1 (
    echo [信息] 没有找到 Python 进程
) else (
    echo [警告] 仍有 Python 进程在运行
    echo 如果这些进程不是机器人，请手动停止
)

echo.
echo [完成] 操作完成
pause


