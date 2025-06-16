import { createDeepSeek } from "@ai-sdk/deepseek";

// AI提供商类型定义
export type AIProvider = "openai" | "anthropic" | "deepseek";

// 模型配置类型
export interface ModelConfig {
  provider: AIProvider;
  model: string;
  displayName: string;
  description: string;
  features: string[];
}

// DeepSeek客户端
export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

// 支持的模型配置
export const modelConfigs: ModelConfig[] = [
  {
    provider: "deepseek",
    model: "deepseek-chat",
    displayName: "DeepSeek Chat",
    description: "通用对话模型，中文能力强",
    features: ["对话", "推理", "中文"],
  },
  {
    provider: "deepseek",
    model: "deepseek-coder",
    displayName: "DeepSeek Coder",
    description: "专业代码生成模型",
    features: ["代码生成", "代码解释", "代码重构"],
  },
];

// 根据提供商获取模型列表
export const getModelsByProvider = (provider: AIProvider) => {
  return modelConfigs.filter((config) => config.provider === provider);
};

// 获取AI客户端的工厂函数
export const getAIClient = (provider: AIProvider, model: string) => {
  console.log(`创建AI客户端: ${provider} - ${model}`);

  switch (provider) {
    case "deepseek":
      if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
      }
      return deepseek(model);

    default:
      throw new Error(`不支持的AI提供商: ${provider}`);
  }
};

// 验证API密钥是否配置
export const validateAPIKeys = () => {
  const keys = {
    deepseek: !!process.env.DEEPSEEK_API_KEY,
  };

  console.log("API密钥配置状态:", keys);
  return keys;
};
