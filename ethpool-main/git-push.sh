#!/bin/bash
# 配置 Git 并推送到 GitHub 的脚本（使用默认配置）

echo "配置 Git 用户信息（使用默认值）..."
git config user.name "ethpool-user"
git config user.email "ethpool-user@example.com"

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
    echo "2. 是否需要身份验证（Personal Access Token）"
    echo "3. 可以手动运行: git push -u origin main"
fi

