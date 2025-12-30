# Vercel 环境变量配置清单

本文档列出了在 Vercel 部署时需要配置的所有环境变量。

## 🔐 必需环境变量（必须配置）

### Supabase 数据库配置

```bash
# Supabase 项目 URL（公开）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key（公开，客户端使用）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key（私有，服务器端使用）
# ⚠️ 重要：这是敏感信息，必须保密！
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**获取方式：**
- 登录 Supabase 控制台
- 进入 Settings > API
- `NEXT_PUBLIC_SUPABASE_URL`: 在 Project URL 中
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 在 anon/public key 中
- `SUPABASE_SERVICE_ROLE_KEY`: 在 service_role key 中（⚠️ 保密）

---

### 管理员私钥配置

```bash
# 管理员私钥（用于签名交易，如归集操作）
# ⚠️ 重要：这是敏感信息，必须保密！
ADMIN_PRIVATE_KEY=your_admin_private_key_here
```

**说明：**
- 用于执行链上操作（如余额归集）
- 必须与合约中的管理员地址对应
- 如果不设置，系统会尝试从数据库配置中读取

---

### CRON 任务安全令牌

```bash
# CRON 任务访问令牌（用于保护定时任务端点）
CRON_SECRET_TOKEN=your_random_secret_token_here
```

**说明：**
- 用于保护 `/api/cron/*` 路由
- 建议使用强随机字符串
- 可以通过 Vercel Cron Jobs 的 Authorization header 传递

---

## 🔧 可选环境变量（有默认值）

### 以太坊网络配置

```bash
# 以太坊主网 RPC URL（可选，有默认值）
ETH_RPC_URL=https://eth.llamarpc.com
```

**说明：**
- 如果不设置，将使用默认的公共 RPC 节点
- 建议使用自己的 RPC 节点（如 Alchemy、Infura）以获得更好的性能和可靠性

**推荐的 RPC 提供商：**

#### 1. Alchemy（推荐）

**获取步骤：**

1. **注册账户**
   - 访问 [Alchemy 官网](https://www.alchemy.com/)
   - 点击 "Sign Up" 注册账户（可以使用 Google/GitHub 登录）

2. **创建应用**
   - 登录后进入 [Dashboard](https://dashboard.alchemy.com/)
   - 点击右上角 **"Create App"** 按钮
   - 填写应用信息：
     - **Name**: 应用名称（如：My DApp）
     - **Chain**: 选择 **Ethereum**
     - **Network**: 选择 **Mainnet**
   - 点击 **"Create App"** 完成创建

3. **获取 API Key**
   - 在 Dashboard 中找到刚创建的应用
   - 点击应用名称进入详情页
   - 在 **"API Key"** 部分，点击 **"View Key"** 或 **"Show Key"**
   - 复制 **HTTP** 格式的 URL，格式如下：
     ```
     https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
     ```
   - 或者只复制 API Key 部分，然后拼接：
     ```
     https://eth-mainnet.g.alchemy.com/v2/你的API_KEY
     ```

4. **配置环境变量**
   ```bash
   ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/你的实际API_KEY
   ```

**注意事项：**
- Alchemy 免费套餐提供每月 300M 计算单元（Compute Units）
- 对于大多数应用来说，免费套餐已经足够
- API Key 是敏感信息，不要泄露给他人

#### 2. Infura（备选方案）

**获取步骤：**

1. 访问 [Infura 官网](https://www.infura.io/)
2. 注册并登录账户
3. 创建新项目（Create New Key）
4. 选择网络：Ethereum Mainnet
5. 获取 Project ID
6. 配置格式：
   ```bash
   ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
   ```

#### 3. QuickNode（备选方案）

1. 访问 [QuickNode 官网](https://www.quicknode.com/)
2. 注册并创建端点
3. 选择 Ethereum Mainnet
4. 获取端点 URL
5. 配置格式：
   ```bash
   ETH_RPC_URL=https://YOUR_ENDPOINT.quiknode.pro/YOUR_TOKEN/
   ```

#### 4. 使用公共节点（不推荐，仅用于测试）

如果暂时不想注册服务，可以使用公共节点（性能较差，可能有速率限制）：

```bash
ETH_RPC_URL=https://eth.llamarpc.com
# 或
ETH_RPC_URL=https://ethereum.publicnode.com
# 或
ETH_RPC_URL=https://rpc.ankr.com/eth
```

---

## 📋 环境变量配置步骤

### 在 Vercel 控制台配置：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **Environment Variables**
4. 添加上述所有环境变量
5. 确保为以下环境设置变量：
   - **Production**（生产环境）
   - **Preview**（预览环境，可选）
   - **Development**（开发环境，可选）

### 批量导入（使用 Vercel CLI）：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_PRIVATE_KEY production
vercel env add CRON_SECRET_TOKEN production
vercel env add ETH_RPC_URL production
```

---

## 🔒 安全注意事项

### ⚠️ 敏感信息保护

以下环境变量包含敏感信息，**绝对不能**提交到 Git 仓库：

- `SUPABASE_SERVICE_ROLE_KEY` - 拥有完整数据库访问权限
- `ADMIN_PRIVATE_KEY` - 可以控制合约资金
- `CRON_SECRET_TOKEN` - 可以访问定时任务端点

### ✅ 安全最佳实践

1. **使用 Vercel 的环境变量功能**，不要硬编码在代码中
2. **定期轮换密钥**，特别是私钥和令牌
3. **使用不同的密钥**用于生产、预览和开发环境
4. **限制访问权限**，只有必要的人员可以访问 Vercel 控制台
5. **启用 Vercel 的审计日志**，监控环境变量的变更

---

## 🧪 验证配置

部署后，可以通过以下方式验证环境变量是否正确配置：

1. **检查系统状态端点**（如果已实现）：
   ```
   GET /api/debug/system-status
   ```

2. **查看 Vercel 构建日志**：
   - 在 Vercel Dashboard > Deployments > 选择部署 > View Build Logs
   - 检查是否有环境变量缺失的警告

3. **测试功能**：
   - 测试数据库连接（登录功能）
   - 测试链上操作（查询余额）
   - 测试 CRON 任务（如果已配置）

---

## 📝 环境变量检查清单

在部署前，请确认以下所有变量都已配置：

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ADMIN_PRIVATE_KEY`
- [ ] `CRON_SECRET_TOKEN`
- [ ] `ETH_RPC_URL`（可选，但推荐）

---

## 🔄 更新环境变量

如果需要更新环境变量：

1. 在 Vercel Dashboard 中修改
2. 重新部署应用（Vercel 会自动触发）
3. 或者手动触发部署：`vercel --prod`

---

## 📞 获取帮助

如果遇到环境变量相关问题：

1. 检查 Vercel 构建日志中的错误信息
2. 确认所有必需变量都已设置
3. 验证变量值格式是否正确（特别是 JWT token）
4. 检查变量是否在正确的环境中设置（Production/Preview/Development）

---

## 🔗 相关文档

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase 文档](https://supabase.com/docs)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)

