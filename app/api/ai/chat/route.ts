import { NextRequest, NextResponse } from 'next/server'
import { streamText, CoreMessage } from 'ai'
import { getAIClient, validateAPIKeys, type AIProvider } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    // 验证API密钥
    const apiKeys = validateAPIKeys()
    
    // 解析请求参数
    const body = await request.json()
    const { 
      messages, 
      provider = 'deepseek', 
      model = 'deepseek-chat',
      temperature = 0.7,
      maxTokens = 4000
    } = body

    console.log(`收到聊天请求: ${provider} - ${model}`)
    console.log(`消息数量: ${messages?.length || 0}`)

    // 验证必要参数
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '消息参数无效' },
        { status: 400 }
      )
    }

    // 检查对应的API密钥是否配置
    if (!apiKeys[provider as keyof typeof apiKeys]) {
      return NextResponse.json(
        { error: `${provider.toUpperCase()}_API_KEY 未配置，请检查环境变量` },
        { status: 400 }
      )
    }

    // 获取AI客户端
    let aiModel
    try {
      aiModel = getAIClient(provider as AIProvider, model)
    } catch (error) {
      console.error('获取AI客户端失败:', error)
      return NextResponse.json(
        { error: `AI客户端创建失败: ${error instanceof Error ? error.message : '未知错误'}` },
        { status: 500 }
      )
    }

    // 构建系统提示词
    const systemPrompt = getSystemPrompt(provider as AIProvider, model)

    // 调用AI模型
    const result = await streamText({
      model: aiModel,
      messages: messages as CoreMessage[],
      system: systemPrompt,
      temperature: Number(temperature),
      maxTokens: Number(maxTokens),
    })

    // 返回流式响应
    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      }
    })

  } catch (error) {
    console.error('聊天API错误:', error)
    
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    
    // 根据错误类型返回不同的错误信息
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'API密钥无效，请检查配置' },
        { status: 401 }
      )
    }
    
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        { error: 'API调用频率超限，请稍后重试' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: `服务器错误: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// 根据不同的AI提供商和模型生成系统提示词
function getSystemPrompt(provider: AIProvider, model: string): string {
  const basePrompt = '你是一个友善、专业的AI助手。请用中文回答问题，保持准确、详细和有帮助。'
  
  switch (provider) {
    case 'deepseek':
      if (model === 'deepseek-coder') {
        return `${basePrompt}

你特别擅长代码相关的问题：
- 代码生成和优化
- 代码解释和调试
- 技术架构设计
- 编程最佳实践

在回答代码问题时，请：
1. 提供完整可运行的代码示例
2. 添加详细的注释说明
3. 解释设计思路和最佳实践
4. 如果可能，提供多种解决方案`
      } else {
        return `${basePrompt}

作为DeepSeek助手，你具有：
- 强大的中文理解和生成能力
- 逻辑推理和分析能力
- 广泛的知识覆盖
- 代码和技术专长

请根据用户问题提供准确、有价值的回答。`
      }
      
    case 'openai':
      return `${basePrompt}

作为OpenAI GPT模型，请发挥你的：
- 创造性思维
- 逻辑推理能力
- 多领域知识
- 对话理解能力`
      
    case 'anthropic':
      return `${basePrompt}

作为Claude助手，请展现你的：
- 谨慎和准确的分析
- 清晰的解释能力
- 道德考量
- 深度思考`
      
    default:
      return basePrompt
  }
}