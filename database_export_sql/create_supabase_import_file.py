#!/usr/bin/env python3
"""
创建可以直接导入 Supabase 的数据库文件

这个脚本会：
1. 读取所有单独的 SQL 文件
2. 合并成一个完整的 SQL 文件
3. 添加必要的注释和优化
4. 确保格式符合 Supabase 要求
"""

import os
import json
import glob
from datetime import datetime
from pathlib import Path


def get_latest_export_dir(base_dir="database_export_sql"):
    """获取最新的导出目录"""
    export_dirs = [
        d for d in os.listdir(base_dir)
        if os.path.isdir(os.path.join(base_dir, d)) and d.startswith("20")
    ]
    if not export_dirs:
        raise FileNotFoundError("未找到导出目录")
    
    # 按时间排序，获取最新的
    export_dirs.sort(reverse=True)
    return os.path.join(base_dir, export_dirs[0])


def read_export_summary(export_dir):
    """读取导出摘要信息"""
    summary_file = os.path.join(export_dir, "export_summary.json")
    if os.path.exists(summary_file):
        with open(summary_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def create_supabase_import_file(export_dir, output_file=None):
    """创建 Supabase 导入文件"""
    
    # 读取摘要信息
    summary = read_export_summary(export_dir)
    
    # 确定输出文件名
    if output_file is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(export_dir, f"supabase_import_{timestamp}.sql")
    
    # 获取所有 SQL 文件（排除 all_tables_data.sql 和 supabase_import_*.sql）
    sql_files = [
        f for f in glob.glob(os.path.join(export_dir, "*.sql"))
        if not f.endswith("all_tables_data.sql") 
        and not os.path.basename(f).startswith("supabase_import_")
        and not os.path.basename(f).startswith("add_missing_columns")
    ]
    
    # 按文件名排序，确保一致的顺序
    sql_files.sort()
    
    print(f"找到 {len(sql_files)} 个 SQL 文件")
    
    # 创建输出文件
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # 写入文件头
        outfile.write("-- ============================================\n")
        outfile.write("-- Supabase 数据库导入文件\n")
        if summary:
            outfile.write(f"-- 源数据库: {summary.get('source_url', 'N/A')}\n")
            outfile.write(f"-- 导出时间: {summary.get('export_time', 'N/A')}\n")
            outfile.write(f"-- 总表数: {summary.get('total_tables', 'N/A')}\n")
            outfile.write(f"-- 总记录数: {summary.get('total_records', 'N/A')}\n")
        outfile.write(f"-- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        outfile.write("-- ============================================\n")
        outfile.write("\n")
        outfile.write("-- 使用说明:\n")
        outfile.write("-- 1. 在 Supabase Dashboard 中打开 SQL Editor\n")
        outfile.write("-- 2. 复制此文件的所有内容\n")
        outfile.write("-- 3. 粘贴到 SQL Editor 并执行\n")
        outfile.write("-- 或者使用: psql -h db.xxx.supabase.co -U postgres -d postgres -f this_file.sql\n")
        outfile.write("\n")
        outfile.write("-- 注意: 此文件使用 ON CONFLICT DO NOTHING，不会覆盖现有数据\n")
        outfile.write("\n")
        outfile.write("BEGIN;\n")
        outfile.write("\n")
        
        # 合并所有 SQL 文件
        total_files = len(sql_files)
        for idx, sql_file in enumerate(sql_files, 1):
            filename = os.path.basename(sql_file)
            table_name = filename.replace('.sql', '')
            
            print(f"处理 [{idx}/{total_files}]: {filename}")
            
            try:
                with open(sql_file, 'r', encoding='utf-8') as infile:
                    content = infile.read().strip()
                    
                    # 跳过空文件
                    if not content:
                        print(f"  警告: {filename} 为空，跳过")
                        continue
                    
                    # 添加表注释
                    outfile.write(f"\n-- ============================================\n")
                    outfile.write(f"-- 表: {table_name}\n")
                    outfile.write(f"-- 文件: {filename}\n")
                    outfile.write(f"-- ============================================\n")
                    
                    # 移除文件中的 BEGIN/COMMIT（如果有）
                    content = content.replace('BEGIN;', '').replace('COMMIT;', '')
                    content = content.strip()
                    
                    # 确保每个 INSERT 语句都有 ON CONFLICT
                    if 'INSERT INTO' in content and 'ON CONFLICT' not in content:
                        # 在最后一个 VALUES 后添加 ON CONFLICT
                        lines = content.split('\n')
                        last_line = lines[-1]
                        if last_line.endswith(';'):
                            lines[-1] = last_line.rstrip(';') + '\nON CONFLICT DO NOTHING;'
                            content = '\n'.join(lines)
                    
                    outfile.write(content)
                    outfile.write("\n\n")
                    
            except Exception as e:
                print(f"  错误: 处理 {filename} 时出错: {e}")
                outfile.write(f"\n-- 错误: 无法处理 {filename}: {e}\n\n")
        
        # 写入文件尾
        outfile.write("\n")
        outfile.write("-- ============================================\n")
        outfile.write("-- 导入完成\n")
        outfile.write("-- ============================================\n")
        outfile.write("\n")
        outfile.write("COMMIT;\n")
    
    # 获取文件大小
    file_size = os.path.getsize(output_file)
    file_size_mb = file_size / (1024 * 1024)
    
    print(f"\n完成！")
    print(f"输出文件: {output_file}")
    print(f"文件大小: {file_size_mb:.2f} MB ({file_size:,} 字节)")
    
    return output_file


def main():
    """主函数"""
    try:
        # 获取最新的导出目录
        export_dir = get_latest_export_dir()
        print(f"使用导出目录: {export_dir}\n")
        
        # 创建 Supabase 导入文件
        output_file = create_supabase_import_file(export_dir)
        
        print(f"\n✅ 成功创建 Supabase 导入文件: {output_file}")
        print("\n下一步:")
        print("1. 在 Supabase Dashboard 中打开 SQL Editor")
        print("2. 复制文件内容并执行")
        print("3. 或使用 psql 命令行工具导入")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())





