# @terryliyongjie/mcp-tools [中文]

[English](./README.md)

一个将 API 转换为 MCP (Model Context Protocol) 工具的 Node.js 包。

## 安装

### 方式一：使用 npx 快速开始（推荐）
```bash
set CONFIG_JSON_PATH=example.json
npx @terryliyongjie/api2mcptools
```

### 方式二：传统安装方式
```bash
# 在项目中本地安装
npm install @terryliyongjie/mcp-tools

# 或全局安装以使用命令行工具
npm install -g @terryliyongjie/mcp-tools
```

## 配置

### 环境变量

```bash
# 必需：配置文件的路径
CONFIG_JSON_PATH=example.json
```

配置文件示例 (`example.json`):
```js
// 单个工具配置
{
    "name": "tool_name",
    "description": "工具描述",
    "inputSchema": {
        "type": "object",
        "properties": {
            "param1": {
                "type": "string",
                "description": "参数描述"
            }
        },
        "required": ["param1"]
    },
    "axiosConfig": {
        "url": "https://api.example.com/endpoint",
        "method": "get",
        "params": {
            "key": "your_api_key"
        }
    }
}

// 或多个工具配置
[
    {
        "name": "baidu_place_search",
        "description": "使用百度地图API进行地点检索服务",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "检索关键字"
                },
                "region": {
                    "type": "string",
                    "description": "检索行政区划区域"
                }
            },
            "required": ["query", "region"]
        },
        "axiosConfig": {
            "url": "https://api.map.baidu.com/place/v2/search",
            "method": "get",
            "params": {
                "ak": "your_baidu_map_key"
            }
        }
    },
    // 更多工具...
]
```

## 特性

- 将 JSON API 转换为 MCP 工具
- 易于与 MCP 生态系统集成
- 支持多种 API 类型
- 支持命令行界面 (CLI)

## 使用方法

### 作为命令行工具
全局安装后，您可以直接在终端中使用以下命令：

```bash
mcp-tools [options]
```

### 作为模块使用
```typescript
// 示例代码即将推出
```

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式运行
npm run dev

# 开发时监听模式
npm run watch

# 运行 MCP 检查器
npm run inspector
```

## 许可证

MIT 