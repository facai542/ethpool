#!/bin/bash

# Git 推送脚本
# 使用方法：在 Git Bash 中运行此脚本

echo "开始推送代码到 GitHub 仓库..."

# 检查是否在 Git 仓库中
if [ ! -d .git ]; then
    echo "错误：当前目录不是 Git 仓库"
    echo "正在初始化 Git 仓库..."
    git init
fi

# 检查远程仓库配置
if ! git remote | grep -q origin; then
    echo "添加远程仓库..."
    git remote add origin https://github.com/cursor2b-collab/ethpool.git
else
    echo "远程仓库已配置"
    git remote set-url origin https://github.com/cursor2b-collab/ethpool.git
fi

# 添加所有更改
echo "添加所有更改的文件..."
git add .

# 检查是否有更改需要提交
if git diff --cached --quiet; then
    echo "没有需要提交的更改"
else
    # 提交更改
    echo "提交更改..."
    git commit -m "Fix component spacing issues and update styles

- Reduced spacing between My Account card and Exchange/Withdraw/Records tabs
- Adjusted padding and margins for better component layout
- Removed fixed min-height constraints to allow flexible component sizing
- Improved responsive spacing for mobile and desktop views"
fi

# 获取当前分支名
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# 推送到远程仓库
echo "推送到远程仓库 (分支: $BRANCH)..."
git push -u origin $BRANCH || git push origin main || git push origin master

echo "完成！代码已成功推送到仓库。"
