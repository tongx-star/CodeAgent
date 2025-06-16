import { streamText } from 'ai'
import { getAIClient } from '@/lib/ai-client'
import { WorkflowContext } from '../types'

// 代码审查的步骤
export const reviewCode = async (
  context: WorkflowContext
): Promise<WorkflowContext> => {
  if (!context.state?.code) {
    throw new Error('需要先生成代码')
  }

  context.stream.write("🔍 开始代码审查...\n")
  
  const aiModel = getAIClient('deepseek', 'deepseek-chat')
  
  const systemPrompt = `你是一个代码审查专家。请对提供的代码进行全面审查，包括：

1. 代码质量和最佳实践
2. 性能优化建议
3. 安全性检查
4. 可维护性评估
5. 类型安全检查
6. 改进建议

请用中文输出详细的审查报告。`

  const result = await streamText({
    model: aiModel,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `请审查以下代码：

\`\`\`typescript
${context.state.code}
\`\`\`

请提供详细的审查报告和改进建议。`
      }
    ],
    temperature: 0.4,
  })

  let review = ''
  for await (const chunk of result.textStream) {
    review += chunk
    context.stream.write(chunk)
  }

  context.stream.write("\n\n")

  return {
    ...context,
    state: {
      ...context.state,
      review
    }
  }
}