#!/bin/bash
# 推送到 GitHub 仓库的脚本

echo "=== 检查 Git 状态 ==="
git status

echo ""
echo "=== 配置 Git 用户信息（如果需要）==="
# 如果还没有配置，使用默认值
if [ -z "$(git config user.name)" ]; then
    git config user.name "ethpool-user"
    echo "已设置 Git 用户名: ethpool-user"
fi

if [ -z "$(git config user.email)" ]; then
    git config user.email "ethpool-user@example.com"
    echo "已设置 Git 邮箱: ethpool-user@example.com"
fi

echo ""
echo "=== 添加所有更改的文件 ==="
git add .

echo ""
echo "=== 提交更改 ==="
git commit -m "Update Next.js to 15.5.9 to fix CVE-2025-66478 security vulnerability"

echo ""
echo "=== 推送到 GitHub ==="
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
    echo "3. 远程仓库地址是否正确"
    echo ""
    echo "当前远程仓库:"
    git remote -v
fi

