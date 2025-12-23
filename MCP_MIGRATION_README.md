# MCP 数据库迁移说明

## 概述

从源数据库 `bfcpimnfgidhgigtgehs` 迁移数据到目标数据库 `xybhjgbgusdyokrrfqst`

## MCP 服务配置

### 源数据库 (supabases)
- URL: https://mcp.supabase.com/mcp?project_ref=bfcpimnfgidhgigtgehs
- 已在 mcp.json 中配置

### 目标数据库 (supabase)
- 使用 access token 配置
- 项目ID: xybhjgbgusdyokrrfqst

## 迁移步骤

由于 MCP 工具需要 project_id 参数，建议使用以下方法：

### 方法 1: 使用 Python 脚本（推荐）

运行 `migrate_data_direct.py`:

```bash
# 设置目标数据库的 service_role_key
export TARGET_SERVICE_ROLE_KEY="your_service_role_key"

# 运行迁移
python migrate_data_direct.py
```

### 方法 2: 手动使用 MCP 工具

由于 `mcp_supabases_*` 工具需要 project_id，但 URL 中已配置项目，
可能需要直接使用 Supabase Dashboard 或 Python 客户端。

### 方法 3: 使用 Supabase Dashboard

1. 在源数据库 Dashboard 中导出数据
2. 在目标数据库 Dashboard 中导入数据

## 表列表

共 107 个表需要迁移。

详细列表请查看 `mcp_export_queries.sql` 文件。
