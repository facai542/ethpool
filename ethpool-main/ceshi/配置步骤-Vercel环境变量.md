# Vercel 环境变量配置步骤

## 📍 **访问 Vercel Dashboard**

### 方法 1: 直接访问链接

**项目设置页面**:
```
https://vercel.com/your-username/newdapp-master/settings/environment-variables
```

### 方法 2: 通过 Dashboard 导航

1. 访问 https://vercel.com/dashboard
2. 点击您的项目：`newdapp-master` 或 `ethmax`
3. 点击顶部菜单的 **Settings** 标签
4. 在左侧菜单选择 **Environment Variables**

---

## ➕ **添加环境变量**

### 变量 1: TOKENVIEW_API_KEY

| 字段 | 值 |
|------|-----|
| **Name** | `TOKENVIEW_API_KEY` |
| **Value** | `fSpkcrSkEMrMOxY65gr0` |
| **Environments** | ✅ Production ✅ Preview ✅ Development |

**步骤**:
1. 点击 **Add New** 按钮
2. 在 **Name** 框输入: `TOKENVIEW_API_KEY`
3. 在 **Value** 框输入: `fSpkcrSkEMrMOxY65gr0`
4. 勾选所有环境: **Production**, **Preview**, **Development**
5. 点击 **Save** 按钮

---

### 变量 2: CRON_SECRET

| 字段 | 值 |
|------|-----|
| **Name** | `CRON_SECRET` |
| **Value** | `eb904580cc0abe1d53f08f24773311a29d4141e845058c01f4d86c553cd925cf` |
| **Environments** | ✅ Production |

**步骤**:
1. 点击 **Add New** 按钮
2. 在 **Name** 框输入: `CRON_SECRET`
3. 在 **Value** 框输入: `eb904580cc0abe1d53f08f24773311a29d4141e845058c01f4d86c553cd925cf`
4. **只勾选 Production**（安全考虑）
5. 点击 **Save** 按钮

---

## ✅ **验证配置**

配置完成后，您应该看到：

```
Environment Variables (2)

Production:
✓ TOKENVIEW_API_KEY
✓ CRON_SECRET

Preview:
✓ TOKENVIEW_API_KEY

Development:
✓ TOKENVIEW_API_KEY
```

---

## 🔄 **重新部署（重要！）**

⚠️ **环境变量只对新部署生效！**

### 方法 1: 触发新部署

1. 在 Vercel Dashboard 点击 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 **⋮** (三个点)
4. 选择 **Redeploy**
5. 点击 **Redeploy** 确认

### 方法 2: 推送新提交

```bash
# 在本地项目目录执行
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

---

## 🧪 **测试环境变量**

等待部署完成后（约 2 分钟），测试环境变量是否生效：

```bash
# 测试清理端点（应返回 401 如果没有正确的 token）
curl https://ethmax.vercel.app/api/cron/cleanup-tokenview

# 正确的调用（使用您的 CRON_SECRET）
curl -X POST https://ethmax.vercel.app/api/cron/cleanup-tokenview \
  -H "Authorization: Bearer eb904580cc0abe1d53f08f24773311a29d4141e845058c01f4d86c553cd925cf"
```

**预期响应**:
```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "stats": {
    "total": 10,
    "active": 8,
    "removed": 2
  }
}
```

---

## ⚠️ **常见问题**

### Q: 环境变量没有生效？

**原因**: 没有重新部署

**解决**: 
```bash
git commit --allow-empty -m "Update env vars"
git push
```

### Q: 忘记了 CRON_SECRET？

**解决**: 
```bash
# 重新生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 在 Vercel 中更新变量
# 然后重新部署
```

### Q: TOKENVIEW_API_KEY 无效？

**检查**:
- API Key 是否完整（无多余空格）
- 在 Tokenview Dashboard 查看 API Key 状态
- 确认 API Key 配额是否用尽

---

## 📝 **下一步**

✅ 环境变量配置完成后，继续配置定时任务：
- 查看文档：`配置步骤-定时任务.md`

