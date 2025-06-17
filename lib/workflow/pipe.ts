/* eslint-disable @typescript-eslint/no-explicit-any */

// 管道函数 - 将多个步骤串联执行
export const pipe =
  <T>(...fns: Array<(arg: T) => Promise<T>>) =>
  async (value: T): Promise<T> => {
    return fns.reduce<Promise<T>>(
      async (promise, fn) => fn(await promise),
      Promise.resolve(value),
    )
  }

// 定义具有 stream 属性的上下文类型
interface StreamContext {
  stream: {
    write: (message: string) => void;
  };
}

// 类型守卫函数
function hasStream(context: unknown): context is StreamContext {
  return (
    typeof context === 'object' && 
    context !== null && 
    'stream' in context &&
    typeof (context as StreamContext).stream?.write === 'function'
  )
}

// 错误处理包装器 - 使用更宽松的类型
export const withErrorHandling = <T>(
  step: (context: T) => Promise<T>
) => {
  return async (context: T): Promise<T> => {
    try {
      return await step(context)
    } catch (error) {
      console.error(`工作流步骤失败:`, error)
      // 如果context有stream，写入错误信息
      if (hasStream(context)) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        context.stream.write(`❌ 错误: ${errorMessage}\n`)
      }
      throw error
    }
  }
}

// 步骤计时器 - 使用更宽松的类型
export const withTiming = <T>(
  stepName: string,
  step: (context: T) => Promise<T>
) => {
  return async (context: T): Promise<T> => {
    const startTime = Date.now()
    
    // 写入开始信息
    if (hasStream(context)) {
      context.stream.write(`⏳ 开始执行: ${stepName}\n`)
    }
    
    try {
      const result = await step(context)
      const duration = Date.now() - startTime
      
      // 写入完成信息
      if (hasStream(context)) {
        context.stream.write(`✅ 完成: ${stepName} (${duration}ms)\n\n`)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      // 写入错误信息
      if (hasStream(context)) {
        context.stream.write(`❌ 失败: ${stepName} (${duration}ms)\n`)
      }
      
      throw error
    }
  }
}