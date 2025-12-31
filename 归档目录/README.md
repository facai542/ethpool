# Eth Max - 专业ETH挖矿平台

## 🌟 项目简介

Eth Max是一个专业的以太坊挖矿平台，集成了流动性挖矿、质押、邀请奖励等核心功能。采用现代化技术栈构建，支持多语言界面和完整的管理后台。

## ✨ 核心功能

### 🎯 用户端功能
- **🏠 首页** - 现代化币安风格设计，响应式布局
- **⛏️ 挖矿页面** - 流动性挖矿和质押功能
- **🎁 邀请系统** - 完整的邀请奖励机制
- **👤 用户中心** - 钱包管理和资产查看
- **💰 钱包集成** - 支持MetaMask、WalletConnect等主流钱包

### 🛠️ 管理后台
- **📊 数据统计** - 实时用户和交易数据
- **👥 用户管理** - 用户信息和状态管理
- **💸 财务管理** - 资金流水和提现审核
- **📢 公告系统** - 系统公告和通知管理
- **🔧 系统配置** - 应用参数和合约配置

### 🌐 国际化支持
支持14种语言：
- 🇨🇳 中文简体/繁体
- 🇺🇸 English
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇪🇸 Español
- 🇮🇹 Italiano
- 🇷🇺 Русский
- 🇸🇦 العربية
- 🇳🇱 Nederlands
- 🇵🇭 Filipino
- 🇲🇾 Bahasa Melayu
- 🇮🇳 हिंदी

## 🚀 技术栈

### 前端技术
- **⚡ Next.js 15** - React全栈框架
- **📘 TypeScript** - 类型安全的JavaScript
- **🎨 Tailwind CSS** - 原子化CSS框架
- **🎭 Framer Motion** - 动画库
- **🧩 Shadcn/ui** - 现代化组件库
- **🌙 next-themes** - 主题切换支持

### 区块链集成
- **🔗 wagmi** - React Hooks for Ethereum
- **🦊 Reown AppKit** - 钱包连接解决方案
- **⚡ viem** - TypeScript Ethereum接口
- **🌐 web3.js** - 以太坊JavaScript API

### 后端技术
- **🗄️ Supabase** - 开源Firebase替代方案
- **🔒 bcryptjs** - 密码加密
- **🍪 js-cookie** - Cookie管理
- **⏰ node-cron** - 定时任务

### 开发工具
- **🔧 Hardhat** - 以太坊开发环境
- **📏 Biome** - 代码格式化和检查
- **🔍 ESLint** - 代码质量检查
- **🎯 TypeScript** - 静态类型检查

## 📦 安装和运行

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 1. 克隆项目
\`\`\`bash
git clone https://github.com/facai1422/newdapp.git
cd newdapp
\`\`\`

### 2. 安装依赖
\`\`\`bash
npm install
# 或
yarn install
\`\`\`

### 3. 环境配置
复制环境变量模板：
\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 \`.env.local\` 文件，配置以下重要参数：
\`\`\`env
# Supabase 数据库配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# WalletConnect 项目ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# 区块链网络配置
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed1.binance.org/

# 应用域名
NEXT_PUBLIC_APP_URL=https://your-domain.com
\`\`\`

### 4. 启动开发服务器
\`\`\`bash
npm run dev
# 或
yarn dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🏗️ 构建和部署

### 本地构建
\`\`\`bash


npm start
\`\`\`

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### Netlify 部署
\`\`\`bash
npm run deploy:netlify
\`\`\`

## 🔧 智能合约

### 合约编译
\`\`\`bash
npm run contract:compile
\`\`\`

### 部署到BSC主网
\`\`\`bash
npm run contract:deploy:bsc
\`\`\`

### 部署到BSC测试网
\`\`\`bash
npm run contract:deploy:testnet
\`\`\`

### 合约验证
\`\`\`bash
npm run contract:verify
\`\`\`

## 📁 项目结构

\`\`\`
src/
├── app/                    # Next.js App Router页面
│   ├── admin/             # 管理后台页面
│   ├── agent/             # 代理商页面
│   ├── api/               # API路由
│   ├── invite/            # 邀请页面
│   ├── mining/            # 挖矿页面
│   ├── user/              # 用户中心
│   └── wallet/            # 钱包页面
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   └── ...               # 业务组件
├── contexts/             # React Context
├── hooks/                # 自定义Hooks
├── lib/                  # 工具库和配置
└── styles/              # 样式文件

contracts/                # 智能合约
public/                  # 静态资源
scripts/                 # 部署脚本
\`\`\`

## 🛡️ 安全特性

- **🔐 钱包安全** - 私钥本地存储，never exposed
- **🚫 XSS防护** - Content Security Policy
- **🛡️ CSRF防护** - Token验证
- **🔒 数据加密** - 敏感数据加密存储
- **🔍 输入验证** - 严格的参数校验

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 ISC 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 📞 支持和联系

- **GitHub Issues**: [问题反馈](https://github.com/facai1422/newdapp/issues)
- **项目主页**: [https://github.com/facai1422/newdapp](https://github.com/facai1422/newdapp)

## 🙏 致谢

感谢所有开源项目和社区的贡献，使这个项目成为可能。

---

⭐ 如果这个项目对您有帮助，请给个星标支持！