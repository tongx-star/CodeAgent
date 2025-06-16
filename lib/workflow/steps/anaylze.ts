import { streamText } from 'ai'
import { getAIClient } from '@/lib/ai-client'
import { WorkflowContext } from '../types'

// 分析用户需求的步骤
export const analyzeRequirement = async (
  context: WorkflowContext
): Promise<WorkflowContext> => {
  context.stream.write("🔍 开始分析用户需求...\n")
  
  const aiModel = getAIClient('deepseek', 'deepseek-chat')
  
  const systemPrompt = `你是一个需求分析专家。请分析用户的需求并输出以下信息：

1. 需求类型（网页组件、API接口、数据处理等）
2. 技术栈建议
3. 实现难度评估
4. 关键功能点
5. 可能的挑战

请用简洁明了的中文回答，每个部分用标题分隔。`

  const result = await streamText({
    model: aiModel,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `请分析这个需求: ${context.input.prompt}`
      }
    ],
    temperature: 0.3,
  })

  let analysis = ''
  for await (const chunk of result.textStream) {
    analysis += chunk
    context.stream.write(chunk)
  }

  context.stream.write("\n\n")

  return {
    ...context,
    state: {
      ...context.state,
      analysis
    }
  }
}