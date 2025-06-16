import { streamText } from 'ai'
import { getAIClient } from '@/lib/ai-client'
import { WorkflowContext } from '../types'

// 生成代码的步骤
export const generateCode = async (
  context: WorkflowContext
): Promise<WorkflowContext> => {
  if (!context.state?.analysis) {
    throw new Error('需要先执行需求分析步骤')
  }

  context.stream.write("💻 开始生成代码...\n")
  
  const aiModel = getAIClient('deepseek', 'deepseek-coder')
  
  const systemPrompt = `你是一个资深的前端开发工程师。根据需求分析结果，生成高质量的代码。

要求：
1. 代码要完整且可运行
2. 使用 TypeScript 和现代 React 语法
3. 添加详细的注释
4. 遵循最佳实践
5. 包含必要的类型定义

请直接输出代码，不要添加额外说明。`

  const result = await streamText({
    model: aiModel,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `
根据以下需求分析结果生成代码：

## 原始需求
${context.input.prompt}

## 需求分析
${context.state.analysis}

请生成完整的实现代码。
        `
      }
    ],
    temperature: 0.1, // 代码生成用较低温度
  })

  let code = ''
  for await (const chunk of result.textStream) {
    code += chunk
    context.stream.write(chunk)
  }

  context.stream.write("\n\n")

  return {
    ...context,
    state: {
      ...context.state,
      code
    }
  }
}