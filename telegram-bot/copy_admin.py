# -*- coding: utf-8 -*-
import shutil
import os
import sys

print("开始复制...")
print(f"Python版本: {sys.version}")

src_base = r'E:\eth-master'
dst_base = r'E:\eth-new'

print(f"源目录: {src_base}")
print(f"目标目录: {dst_base}")
print(f"源目录存在: {os.path.exists(src_base)}")

# 要复制的目录列表
dirs_to_copy = [
    ('src\\app\\admin', 'src\\app\\admin'),
    ('src\\app\\api\\admin', 'src\\app\\api\\admin'),
    ('src\\components\\admin', 'src\\components\\admin'),
    ('src\\components\\ui', 'src\\components\\ui'),
    ('src\\lib', 'src\\lib'),
    ('src\\config', 'src\\config'),
    ('src\\hooks', 'src\\hooks'),
    ('src\\styles', 'src\\styles'),
    ('src\\types', 'src\\types'),
]

try:
    for src_dir, dst_dir in dirs_to_copy:
        src_path = os.path.join(src_base, src_dir)
        dst_path = os.path.join(dst_base, dst_dir)
        print(f"检查: {src_path} -> 存在: {os.path.exists(src_path)}")
        if os.path.exists(src_path):
            if os.path.exists(dst_path):
                print(f"删除已存在目录: {dst_path}")
                shutil.rmtree(dst_path)
            print(f"复制: {src_path} -> {dst_path}")
            shutil.copytree(src_path, dst_path)
            print(f"已复制: {src_dir}")
        else:
            print(f"源目录不存在: {src_dir}")
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()

print("复制完成!")
