import subprocess
import os
import sys

os.chdir(r"E:\eth-new\telegram-bot")

print("=" * 60)
print("推送到 GitHub 仓库")
print("=" * 60)

# 1. 初始化 git（如果还没有）
print("\n1. 检查 Git 仓库...")
try:
    result = subprocess.run(["git", "status"], check=True, capture_output=True, text=True)
    print("   ✓ Git 仓库已存在")
except:
    print("   → 初始化 Git 仓库...")
    subprocess.run(["git", "init"], check=True)
    print("   ✓ Git 仓库初始化完成")

# 2. 添加远程仓库
print("\n2. 配置远程仓库...")
subprocess.run(["git", "remote", "remove", "origin"], capture_output=True)
result = subprocess.run(["git", "remote", "add", "origin", "https://github.com/cursor2b-collab/telegrambott.git"], 
                       capture_output=True, text=True)
if result.returncode == 0:
    print("   ✓ 远程仓库已添加")
else:
    print(f"   ⚠ {result.stderr}")

# 验证远程仓库
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True)
print(f"   远程仓库: {result.stdout.strip()}")

# 3. 添加所有文件
print("\n3. 添加文件...")
result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True)
if result.returncode == 0:
    print("   ✓ 文件已添加到暂存区")

# 检查状态
result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True)
files_count = len([l for l in result.stdout.strip().split('\n') if l.strip()])
print(f"   → {files_count} 个文件已暂存")

# 4. 提交
print("\n4. 提交更改...")
result = subprocess.run(["git", "commit", "-m", "Initial commit: Telegram Bot Admin Python version"], 
                       capture_output=True, text=True)
if result.returncode == 0:
    print("   ✓ 提交成功")
    if result.stdout:
        print(f"   {result.stdout.strip()}")
elif "nothing to commit" in result.stdout.lower():
    print("   → 没有需要提交的更改")
else:
    print(f"   ⚠ {result.stderr}")

# 5. 切换到 main 分支
print("\n5. 切换到 main 分支...")
subprocess.run(["git", "branch", "-M", "main"], capture_output=True)
print("   ✓ 已切换到 main 分支")

# 6. 推送
print("\n6. 推送到 GitHub...")
print("   → 正在推送，请稍候...")
result = subprocess.run(["git", "push", "-u", "origin", "main", "--force"], 
                       capture_output=True, text=True)

if result.returncode == 0:
    print("   ✓ 推送成功！")
    print("\n" + "=" * 60)
    print("代码已成功推送到 GitHub!")
    print("仓库地址: https://github.com/cursor2b-collab/telegrambott.git")
    print("=" * 60)
else:
    print("   ✗ 推送失败")
    print(f"\n错误信息:\n{result.stderr}")
    print("\n可能的解决方案:")
    print("1. 检查 GitHub 身份验证")
    print("2. 确保有仓库的写入权限")
    print("3. 尝试使用 Personal Access Token")
    print("\n详细说明请查看: PUSH_TO_GITHUB.md")
    sys.exit(1)

