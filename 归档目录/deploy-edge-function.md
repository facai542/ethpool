# 部署 Edge Function 到 Supabase

## 使用 CLI 部署

### 1. 安装 Supabase CLI
```bash
npm install -g supabase
```

### 2. 登录
```bash
npx supabase login
```

### 3. 部署函数
```bash
npx supabase functions deploy telegram-notifier --project-ref zeokudhrigfxfefqpcnz
```

## 或者使用 Dashboard

1. 访问：https://supabase.com/dashboard/project/zeokudhrigfxfefqpcnz/functions
2. 点击 `telegram-notifier` 函数
3. 点击 **Edit** 或 **Deploy new version**
4. 复制 `supabase/functions/telegram-notifier/index.ts` 的内容
5. 粘贴替换
6. 点击 **Deploy**

## 更新内容

新版本包含：
- ✅ 硬编码新群组ID: `-1003149735777`
- ✅ 授权通知消息模板（是否活动: 否）
- ✅ 参与活动通知消息模板（是否活动: 是）
- ✅ 内联键盘按钮："添加到链上实时监听"


