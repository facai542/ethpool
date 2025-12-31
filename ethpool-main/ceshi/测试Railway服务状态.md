# 测试 Railway 服务状态

## 方法 1：检查部署状态

在 Railway Dashboard 中：

1. **Service → Deployments**
2. 查看最新部署的状态：
   - ✅ **Active** = 正在运行
   - ❌ **Failed** = 部署失败
   - 🔄 **Building** = 正在构建

## 方法 2：查看服务概览

在 **Service → Overview** 页面：
- 应该显示服务状态为 "Running" 或 "Active"
- 显示 CPU 和内存使用情况

## 方法 3：查看 Metrics

在 **Service → Metrics** 页面：
- 如果有 CPU/内存使用图表 = 服务在运行
- 如果图表为空或无数据 = 服务可能未启动

## 如果服务确实在运行但看不到日志

### 可能是日志输出问题

Railway 可能没有正确捕获 console.log 输出。

### 解决方案：

检查 `approval-monitor/index.js` 中的日志输出是否使用：
- ✅ `console.log()` - Railway 可以捕获
- ✅ `console.error()` - Railway 可以捕获
- ❌ 自定义日志库可能需要配置

## 快速验证

执行一次授权操作：
1. 访问网站授权
2. 立即刷新 Railway 日志页面
3. 应该看到新的日志输出

如果授权后出现新的日志，说明服务正常工作！

