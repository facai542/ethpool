# 推送到 GitHub 仓库

## 执行以下命令：

```powershell
# 1. 进入项目目录
cd E:\eth-new\telegram-bot

# 2. 初始化 Git（如果还没有）
git init

# 3. 添加远程仓库
git remote remove origin
git remote add origin https://github.com/cursor2b-collab/telegrambott.git

# 4. 添加所有文件
git add -A

# 5. 提交
git commit -m "Initial commit: Telegram Bot Admin Python version"

# 6. 切换到 main 分支
git branch -M main

# 7. 推送到 GitHub
git push -u origin main --force
```

## 如果需要身份验证

如果推送时要求身份验证，请使用以下方式之一：

### 方法 1: 使用 Personal Access Token

1. 访问 GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. 生成新 token，勾选 `repo` 权限
3. 推送时使用 token 作为密码：

```powershell
git push -u origin main --force
# Username: 你的GitHub用户名
# Password: 你的Personal Access Token
```

### 方法 2: 使用 SSH（推荐）

```powershell
# 1. 更改远程仓库URL为SSH
git remote set-url origin git@github.com:cursor2b-collab/telegrambott.git

# 2. 推送
git push -u origin main --force
```

## 如果遇到问题

如果 `git push` 失败，尝试：

```powershell
# 查看远程仓库配置
git remote -v

# 查看当前分支
git branch

# 查看提交历史
git log --oneline

# 强制推送（会覆盖远程仓库）
git push -u origin main --force
```



