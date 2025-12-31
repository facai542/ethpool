# DNS 解析问题修复指南

## 问题描述

当运行 `export_complete_schema.ps1` 时，可能会遇到以下错误：

```
pg_dump: 错误: could not translate host name "db.xxx.supabase.co" to address: Name or service not known
```

这表示系统无法将 Supabase 数据库主机名解析为 IP 地址。

## 快速解决方案

### 1. 运行诊断脚本

首先运行诊断脚本来确定问题：

```powershell
.\test_connection.ps1
```

这个脚本会检查：
- DNS 解析
- 端口连接
- Ping 测试
- PostgreSQL 连接

### 2. 刷新 DNS 缓存

在 PowerShell 中运行（需要管理员权限）：

```powershell
ipconfig /flushdns
```

然后重新运行导出脚本。

### 3. 检查网络连接

- 确保网络连接正常
- 检查是否使用 VPN 或代理
- 尝试访问 Supabase Dashboard 确认项目状态

### 4. 检查防火墙设置

确保防火墙允许：
- DNS 查询（UDP 53）
- PostgreSQL 连接（TCP 5432）

### 5. 使用备用 DNS 服务器

如果问题持续，可以尝试更改 DNS 服务器：

**使用 Google DNS：**
```powershell
# 查看当前 DNS
Get-DnsClientServerAddress

# 设置 Google DNS（需要管理员权限）
Set-DnsClientServerAddress -InterfaceAlias "以太网" -ServerAddresses "8.8.8.8","8.8.4.4"
```

**使用 Cloudflare DNS：**
```powershell
Set-DnsClientServerAddress -InterfaceAlias "以太网" -ServerAddresses "1.1.1.1","1.0.0.1"
```

### 6. 手动解析并测试

如果 DNS 解析失败，可以尝试手动获取 IP 地址：

```powershell
# 使用 nslookup
nslookup db.bfcpimnfgidhgigtgehs.supabase.co

# 或使用 Resolve-DnsName
Resolve-DnsName db.bfcpimnfgidhgigtgehs.supabase.co
```

如果能够获取 IP 地址，可以临时修改脚本使用 IP 地址连接。

### 7. 检查代理设置

如果使用代理，可能需要配置：

```powershell
# 查看代理设置
netsh winhttp show proxy

# 如果需要，设置代理
netsh winhttp set proxy proxy-server="http=proxy.example.com:8080"
```

### 8. 使用 MCP 工具作为替代方案

如果网络问题无法解决，可以考虑使用 Supabase MCP 工具直接导出：

```bash
# 使用 MCP 工具导出数据库结构
# 这不需要直接连接到数据库主机
```

## 更新的导出脚本功能

新版本的 `export_complete_schema.ps1` 已经包含以下改进：

1. **自动 DNS 测试** - 在连接前测试 DNS 解析
2. **自动刷新 DNS** - 如果 DNS 失败，自动尝试刷新缓存
3. **备用 IP 连接** - 如果主机名连接失败，自动尝试使用 IP 地址
4. **详细错误信息** - 提供更清晰的错误提示和解决建议

## 常见问题

### Q: 为什么会出现 DNS 解析失败？

A: 可能的原因包括：
- 网络连接问题
- DNS 服务器故障
- 防火墙阻止 DNS 查询
- 代理配置问题
- ISP DNS 服务器问题

### Q: 使用 IP 地址连接安全吗？

A: 使用 IP 地址连接功能相同，但：
- IP 地址可能会变化
- 主机名更易于维护
- 建议优先使用主机名，IP 作为备用方案

### Q: 如何验证 Supabase 项目是否正常？

A: 
1. 访问 Supabase Dashboard
2. 检查项目状态
3. 尝试在 Dashboard 中执行 SQL 查询
4. 检查项目设置中的数据库连接信息

## 联系支持

如果以上方法都无法解决问题，可能需要：
1. 联系网络管理员检查网络配置
2. 联系 Supabase 支持检查项目状态
3. 考虑使用 Supabase CLI 或其他导出方法

## 相关文件

- `export_complete_schema.ps1` - 更新的导出脚本（包含 DNS 测试和备用连接）
- `test_connection.ps1` - 详细的连接诊断脚本




