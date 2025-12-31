# MCP 数据库迁移测试总结

## 测试结果

### 1. MCP 服务配置

**源数据库 (supabases)**:
- 配置位置: `mcp.json` 第 98-101 行
- URL: `https://mcp.supabase.com/mcp?project_ref=bfcpimnfgidhgigtgehs`
- 项目ID: `bfcpimnfgidhgigtgehs`

**目标数据库 (supabase)**:
- 配置位置: `mcp.json` 第 3-13 行
- 使用 access token 认证
- 项目ID: `xybhjgbgusdyokrrfqst`

### 2. 权限测试结果

#### 使用 `mcp_supabase_*` 工具（目标数据库）
- ✅ **可以访问** - 成功列出所有表
- ✅ **可以执行 SQL** - 可以查询和修改数据
- ✅ **可以创建表** - 已成功创建所有需要的表

#### 使用 `mcp_supabases_*` 工具（源数据库）
- ❌ **需要 project_id 参数** - 即使 URL 中已配置项目
- ❌ **可能权限不足** - 工具调用时仍需要显式传入 project_id

### 3. 解决方案

由于 MCP 工具的限制，推荐使用以下方法：

#### 方法 1: 使用 Python 脚本（最推荐）

**优点**:
- 完全自动化
- 可以处理大量数据
- 支持批量导入
- 显示详细进度

**步骤**:
```bash
# 1. 安装依赖
pip install supabase

# 2. 设置目标数据库的 service_role_key
# Windows PowerShell:
$env:TARGET_SERVICE_ROLE_KEY="your_service_role_key"

# Linux/Mac:
export TARGET_SERVICE_ROLE_KEY="your_service_role_key"

# 3. 运行迁移脚本
python migrate_data_direct.py
```

**脚本功能**:
- 从源数据库 (bfcpimnfgidhgigtgehs) 导出所有表数据
- 自动导入到目标数据库 (xybhjgbgusdyokrrfqst)
- 处理分页和批量插入
- 显示迁移进度和统计

#### 方法 2: 使用 Supabase Dashboard（手动）

**步骤**:
1. 登录源数据库 Dashboard: https://bfcpimnfgidhgigtgehs.supabase.co
2. 打开 SQL Editor
3. 对每个表执行查询并导出为 CSV/JSON
4. 登录目标数据库 Dashboard: https://xybhjgbgusdyokrrfqst.supabase.co
5. 使用 Table Editor 的 Import 功能导入数据

#### 方法 3: 使用 Supabase CLI

```bash
# 安装
npm install -g supabase

# 登录
supabase login

# 导出源数据库
supabase link --project-ref bfcpimnfgidhgigtgehs
supabase db dump --data-only -f source_data.sql

# 导入到目标数据库
supabase link --project-ref xybhjgbgusdyokrrfqst
# 需要数据库连接信息进行导入
```

## 已创建的文件

1. **`migrate_data_direct.py`** - 自动化迁移脚本（推荐使用）
2. **`migrate_database.py`** - 备用迁移脚本
3. **`mcp_export_queries.sql`** - SQL 导出查询脚本
4. **`mcp_import_template.sql`** - SQL 导入模板
5. **`MCP_MIGRATION_README.md`** - 详细迁移指南
6. **`README_MIGRATION.md`** - 快速开始指南

## 注意事项

1. **权限要求**:
   - 源数据库: 可以使用 anon key 读取数据
   - 目标数据库: 需要 service_role_key 才能插入数据

2. **数据量**:
   - 脚本会自动处理分页（每批 1000 条）
   - 大数据量表会自动分批导入

3. **错误处理**:
   - 如果某个表迁移失败，会继续处理其他表
   - 迁移完成后会显示详细的统计信息

4. **数据完整性**:
   - 使用 `upsert` 避免重复数据
   - 保留原始 UUID 和时间戳

## 下一步

1. 获取目标数据库的 `service_role_key`:
   - 登录 https://xybhjgbgusdyokrrfqst.supabase.co
   - Settings > API > service_role key

2. 运行迁移脚本:
   ```bash
   python migrate_data_direct.py
   ```

3. 验证迁移结果:
   - 检查目标数据库中的表和数据
   - 对比源数据库和目标数据库的记录数

## 结论

虽然 MCP 服务配置了源数据库，但由于工具限制，**推荐使用 Python 脚本 (`migrate_data_direct.py`) 进行数据迁移**，这是最可靠和高效的方法。










