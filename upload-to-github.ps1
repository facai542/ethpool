# 上传代码到 GitHub 仓库的脚本
# 仓库地址: https://github.com/cursor2b-collab/ethpool.git

$ErrorActionPreference = "Stop"

Write-Host "正在检查 Git 安装..." -ForegroundColor Cyan

# 尝试找到 git 命令
$gitCmd = $null
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitCmd = "git"
} elseif (Test-Path "C:\Program Files\Git\cmd\git.exe") {
    $gitCmd = "C:\Program Files\Git\cmd\git.exe"
} elseif (Test-Path "C:\Program Files (x86)\Git\cmd\git.exe") {
    $gitCmd = "C:\Program Files (x86)\Git\cmd\git.exe"
} else {
    Write-Host "错误: 未找到 Git。请先安装 Git for Windows。" -ForegroundColor Red
    Write-Host "下载地址: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "Git 找到: $gitCmd" -ForegroundColor Green

$repoUrl = "https://github.com/cursor2b-collab/ethpool.git"
$currentDir = Get-Location

Write-Host "`n当前目录: $currentDir" -ForegroundColor Cyan
Write-Host "目标仓库: $repoUrl" -ForegroundColor Cyan

# 检查是否已经是 git 仓库
if (Test-Path .git) {
    Write-Host "`n检测到现有的 Git 仓库" -ForegroundColor Yellow
    
    # 检查远程仓库
    $remote = & $gitCmd remote get-url origin 2>$null
    if ($remote) {
        Write-Host "当前远程仓库: $remote" -ForegroundColor Yellow
        Write-Host "是否要更改远程仓库? (y/n)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -eq 'y' -or $response -eq 'Y') {
            & $gitCmd remote set-url origin $repoUrl
            Write-Host "已更新远程仓库地址" -ForegroundColor Green
        }
    } else {
        & $gitCmd remote add origin $repoUrl
        Write-Host "已添加远程仓库" -ForegroundColor Green
    }
} else {
    Write-Host "`n初始化 Git 仓库..." -ForegroundColor Cyan
    & $gitCmd init
    & $gitCmd remote add origin $repoUrl
    Write-Host "Git 仓库已初始化" -ForegroundColor Green
}

Write-Host "`n添加所有文件到暂存区..." -ForegroundColor Cyan
& $gitCmd add .

Write-Host "检查是否有更改需要提交..." -ForegroundColor Cyan
$status = & $gitCmd status --porcelain
if ($status) {
    Write-Host "提交更改..." -ForegroundColor Cyan
    $commitMessage = "Initial commit"
    if (& $gitCmd log --oneline -1 2>$null) {
        $commitMessage = "Update code"
    }
    & $gitCmd commit -m $commitMessage
    Write-Host "更改已提交" -ForegroundColor Green
} else {
    Write-Host "没有需要提交的更改" -ForegroundColor Yellow
}

Write-Host "`n推送到远程仓库 (main 分支)..." -ForegroundColor Cyan
try {
    & $gitCmd push -u origin main
    Write-Host "`n成功推送到 GitHub!" -ForegroundColor Green
} catch {
    # 如果 main 分支不存在，尝试 master
    Write-Host "尝试推送到 master 分支..." -ForegroundColor Yellow
    try {
        & $gitCmd branch -M master 2>$null
        & $gitCmd push -u origin master
        Write-Host "`n成功推送到 GitHub (master 分支)!" -ForegroundColor Green
    } catch {
        Write-Host "`n推送失败。请检查:" -ForegroundColor Red
        Write-Host "1. 是否有 GitHub 访问权限" -ForegroundColor Yellow
        Write-Host "2. 是否需要身份验证" -ForegroundColor Yellow
        Write-Host "3. 可以手动运行: git push -u origin main" -ForegroundColor Yellow
    }
}

Write-Host "`n完成!" -ForegroundColor Green


