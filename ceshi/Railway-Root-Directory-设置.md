# Railway Root Directory 设置指南

## 问题
Railway 正在构建整个项目根目录（使用 Bun），而不是 `approval-monitor` 子目录（应该使用 npm）。

## 解决方案 1：通过 Railway Dashboard（推荐）

### 步骤
1. 访问 Railway Dashboard
2. 选择您的项目
3. 点击服务
4. 点击 **Settings** 标签
5. 向下滚动到 **"Source"** 部分
6. 找到 **"Root Directory"** 字段
7. 输入：`approval-monitor`
8. 点击保存
9. Railway 会自动重新部署

### 设置位置
```
Project → Service → Settings → Source → Root Directory
```

## 解决方案 2：删除并重新创建服务

如果找不到 Root Directory 设置：

### 步骤
1. **删除当前服务**
   - Service → Settings → Danger Zone → Delete Service

2. **重新创建服务**
   - New → GitHub Repo
   - 选择仓库：`facai1422/eth`
   - **在创建时设置 Root Directory**：`approval-monitor`

3. **添加环境变量**
   ```
   INFURA_API_KEY = 1ee77a16f5f34cc099549ff3b116ccba
   API_ENDPOINT = https://ethmax.vercel.app
   ```

## 解决方案 3：使用 Monorepo 配置

如果以上都不行，可以在项目根目录创建配置：

### 创建 `railway.toml`（在项目根目录）
```toml
[deploy]
startCommand = "cd approval-monitor && npm start"

[build]
builder = "nixpacks"
buildCommand = "cd approval-monitor && npm ci"
```

## 验证构建成功

### 正确的构建日志应该显示：
```
✓ Building in: /approval-monitor
✓ Running: npm ci
✓ Starting: npm start
✅ Infura WebSocket Provider 初始化成功
✅ 服务启动完成！
```

### 错误的构建日志会显示：
```
✗ Running: bun install --frozen-lockfile
✗ lockfile had changes, but lockfile is frozen
ERROR: exit code: 1
```

## 预期效果

设置 Root Directory 后：
- ✅ Railway 只构建 `approval-monitor` 目录
- ✅ 使用 npm（而不是 Bun）
- ✅ 正确安装依赖
- ✅ 服务正常启动

## 如果仍然失败

请提供以下信息：
1. Railway 完整的构建日志
2. Railway 项目 URL
3. 是否看到 Root Directory 设置选项

我可以提供更具体的解决方案。

