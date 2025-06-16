import { NextRequest, NextResponse } from 'next/server'
import { 
  codeGenerationWorkflow, 
  simpleCodeGenWorkflow,
  requirementAnalysisWorkflow,
  runWorkflow 
} from '@/lib/workflow/workflows'
import { WorkflowContext } from '@/lib/workflow/types'

export async function POST(request: NextRequest) {
  try {
    const { prompt, workflowType = 'full' } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: '请求参数无效' },
        { status: 400 }
      )
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // 创建工作流上下文
    const context: WorkflowContext = {
      stream: {
        write: (chunk: string) => writer.write(encoder.encode(chunk)),
        close: () => writer.close(),
      },
      input: {
        prompt,
      },
    }

    // 根据类型选择工作流
    let selectedWorkflow
    switch (workflowType) {
      case 'analysis':
        selectedWorkflow = requirementAnalysisWorkflow
        break
      case 'simple':
        selectedWorkflow = simpleCodeGenWorkflow
        break
      case 'full':
      default:
        selectedWorkflow = codeGenerationWorkflow
        break
    }

    // 异步执行工作流
    runWorkflow(selectedWorkflow, context).catch(error => {
      console.error('工作流执行错误:', error)
    })

    // 返回流式响应
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('工作流API错误:', error)
    return NextResponse.json(
      { error: `服务器错误: ${error.message}` },
      { status: 500 }
    )
  }
}