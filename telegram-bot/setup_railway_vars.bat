@echo off
echo ========================================
echo Railway 环境变量设置（Supabase）
echo ========================================
echo.

echo 方法 1: 通过 Railway Dashboard（推荐）
echo ----------------------------------------
echo 1. 访问 https://railway.com/dashboard
echo 2. 选择你的项目
echo 3. 点击 Variables 标签
echo 4. 添加以下环境变量:
echo.
echo    NEXT_PUBLIC_SUPABASE_URL = https://bfcpimnfgidhgigtgehs.supabase.co
echo    SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM
echo.
echo.

echo 方法 2: 使用 Railway CLI
echo ----------------------------------------
echo 请使用以下命令之一:
echo.
echo 方式 A (如果支持):
echo   railway variables NEXT_PUBLIC_SUPABASE_URL=https://bfcpimnfgidhgigtgehs.supabase.co
echo   railway variables SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
echo.
echo 方式 B (交互式):
echo   railway variables
echo   然后按提示输入变量
echo.
echo 方式 C (使用环境文件):
echo   创建 .env 文件，然后运行:
echo   railway variables --file .env
echo.

pause

