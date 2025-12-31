#!/bin/bash
# 配置 Git 并推送到 GitHub 的脚本
# 仓库地址: https://github.com/cursor2b-collab/ethpool.git

echo "配置 Git 用户信息..."
echo ""
echo "请输入你的 Git 用户名（或按回车使用默认值 'ethpool-user'）:"
read -r git_user
git_user=${git_user:-ethpool-user}

echo "请输入你的 Git 邮箱（或按回车使用默认值 'ethpool-user@example.com'）:"
read -r git_email
git_email=${git_email:-ethpool-user@example.com}

echo ""
echo "设置 Git 用户信息: $git_user <$git_email>"
git config user.name "$git_user"
git config user.email "$git_email"

echo ""
echo "提交更改..."
git commit -m "Initial commit"

echo ""
echo "推送到 GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 成功推送到 GitHub!"
else
    echo ""
    echo "推送失败。请检查:"
    echo "1. 是否有 GitHub 访问权限"
    echo "2. 是否需要身份验证"
    echo "3. 可以手动运行: git push -u origin main"
fi

