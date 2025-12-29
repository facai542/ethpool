  # Dockerfile for Telegram Bot
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖（包括构建工具和图像处理库）
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements_admin.txt .

# 升级 pip 并安装 Python 依赖
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --default-timeout=300 -r requirements_admin.txt

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN useradd -m -u 1000 botuser && chown -R botuser:botuser /app
USER botuser

# 健康检查（Railway 使用 railway.json 中的配置，这里作为备用）
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request; import os; port = os.getenv('PORT', '8080'); urllib.request.urlopen(f'http://localhost:{port}/health', timeout=5)" || exit 1

# 启动应用
CMD ["python", "bot_admin.py"]


