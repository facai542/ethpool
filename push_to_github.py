import subprocess
import os

os.chdir(r"E:\eth-new")

# 设置远程仓库
subprocess.run(["git", "remote", "remove", "origin"], capture_output=True)
result = subprocess.run(["git", "remote", "add", "origin", "https://github.com/cursor2b-collab/newdapp.git"], capture_output=True, text=True)
print(f"Add remote: {result.stdout}{result.stderr}")

# 检查远程仓库
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True)
print(f"Remote: {result.stdout}{result.stderr}")

# 添加所有文件
result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True)
print(f"Add files: {result.stdout}{result.stderr}")

# 提交
result = subprocess.run(["git", "commit", "-m", "Deploy to Vercel - fix Turbopack and useSearchParams issues"], capture_output=True, text=True)
print(f"Commit: {result.stdout}{result.stderr}")

# 切换到 main 分支
result = subprocess.run(["git", "branch", "-M", "main"], capture_output=True, text=True)
print(f"Branch: {result.stdout}{result.stderr}")

# 推送
result = subprocess.run(["git", "push", "-u", "origin", "main", "--force"], capture_output=True, text=True)
print(f"Push: {result.stdout}{result.stderr}")

