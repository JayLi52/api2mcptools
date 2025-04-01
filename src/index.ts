#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import { ToolManager } from './tool-manager.js';
import path from "path";



// 全局日志函数，确保所有日志都通过stderr输出
export const log = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.DEBUG === 'true') {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    console.error(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.error(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};

const toolManager = new ToolManager();

// 创建服务器
export function createServer() {
  const server = new Server(
    {
      name: "remote-ops-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolManager.getTools()
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const toolName = request.params.name;
      const args = request.params.arguments || {};
      return await toolManager.executeTool(toolName, args);
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  return server;
}

async function main() {
  try {
    if (!process.env.CONFIG_JSON_PATH) {
      throw new McpError(ErrorCode.InvalidParams, `未设置配置文件路径: CONFIG_JSON_PATH 环境变量未定义`);
    }

    const configPath = path.join(process.env.CONFIG_JSON_PATH!);

    // 加载工具配置
    try {
      const configData = await fs.promises.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      await toolManager.loadTools(config);
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new McpError(ErrorCode.ParseError, `配置文件 JSON 解析失败: ${error.message}`);
      }
      throw new McpError(
        ErrorCode.InternalError,
        `加载工具配置失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // 使用标准输入输出
    const server = createServer();
    
    // 设置MCP错误处理程序
    server.onerror = (error) => {
      log.error(`MCP Error: ${error.message}`);
    };
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    log.info("Remote Ops MCP server running on stdio");

    // 处理进程退出
    process.on('SIGINT', () => {
      log.info("Shutting down server...");
      process.exit(0);
    });
  } catch (error) {
    if (error instanceof McpError) {
      log.error(`MCP Error: ${error.message}`);
    } else {
      log.error("Server error:", error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  if (error instanceof McpError) {
    log.error(`MCP Error: ${error.message}`);
  } else {
    log.error("Server error:", error);
  }
  process.exit(1);
});
