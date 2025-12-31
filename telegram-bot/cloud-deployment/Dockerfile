# 多阶段构建的生产环境Dockerfile
FROM node:18-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache \
    tini \
    curl \
    bash

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 复制package文件
COPY package*.json ./

# 构建阶段
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# 生产阶段
FROM base AS runner
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# 复制源代码
COPY . .

# 创建必要的目录
RUN mkdir -p logs data && \
    chown -R nodejs:nodejs /app

USER nodejs

# 健康检查端点
EXPOSE 3001

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# 使用tini作为init进程
ENTRYPOINT ["/sbin/tini", "--"]

# 启动应用
CMD ["node", "index.js"]

