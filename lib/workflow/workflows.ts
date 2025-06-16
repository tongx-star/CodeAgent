import { pipe, withErrorHandling, withTiming } from './pipe'
import { analyzeRequirement } from './steps/anaylze'
import { generateCode } from './steps/generate'
import { reviewCode } from './steps/review'
import { WorkflowContext } from './types'

// 完整的代码生成工作流
export const codeGenerationWorkflow = pipe<WorkflowContext, WorkflowContext>(
  withTiming('需求分析', withErrorHandling(analyzeRequirement)),
  withTiming('代码生成', withErrorHandling(generateCode)),
  withTiming('代码审查', withErrorHandling(reviewCode))
)

// 简化的代码生成工作流（不包含审查）
export const simpleCodeGenWorkflow = pipe<WorkflowContext, WorkflowContext>(
  withTiming('需求分析', withErrorHandling(analyzeRequirement)),
  withTiming('代码生成', withErrorHandling(generateCode))
)

// 只分析需求的工作流
export const requirementAnalysisWorkflow = pipe<WorkflowContext, WorkflowContext>(
  withTiming('需求分析', withErrorHandling(analyzeRequirement))
)

// 工作流运行器
export async function runWorkflow(
  workflow: (context: WorkflowContext) => Promise<WorkflowContext>,
  context: WorkflowContext
) {
  try {
    context.stream.write("🚀 开始执行工作流...\n\n")
    
    const result = await workflow(context)
    
    context.stream.write("🎉 工作流执行完成！\n")
    context.stream.close()
    
    return {
      success: true,
      data: result.state,
    }
  } catch (error: unknown) {
    console.error("工作流执行失败:", error)
    context.stream.write(`\n❌ 工作流执行失败: ${error instanceof Error ? error.message : String(error)}\n`)
    context.stream.close()
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}