import axios from 'axios';
import { log } from './index.js';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

type Tool = {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
  };
  axiosConfig?: any;
};

export class ToolManager {
  private tools: Map<string, Tool> = new Map();

  async loadTools(config: Tool | Tool[]): Promise<void> {
    try {
      // 清除现有工具
      this.tools.clear();
      
      // 加载新工具
      const toolsArray = Array.isArray(config) ? config : [config];
      console.log(toolsArray);
      for (const tool of toolsArray) {
        if (this.tools.has(tool.name)) {
          throw new McpError(ErrorCode.InvalidRequest, `重复的工具名称: ${tool.name}`);
        }
        this.tools.set(tool.name, tool);
      }
      
      log.info(`成功加载 ${this.tools.size} 个工具`);
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.ParseError,
        `工具配置验证失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `未找到工具: ${name}`);
    }

    try {
      const response = await axios({
        ...tool.axiosConfig,
        params: {
          ...tool.axiosConfig.params,
          ...args
        }
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data)
        }]
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `API 请求失败: ${error.message}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
} 