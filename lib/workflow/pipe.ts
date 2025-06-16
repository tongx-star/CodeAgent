/* eslint-disable @typescript-eslint/no-explicit-any */

// 管道函数 - 将多个步骤串联执行
export const pipe =
  <T, R>(...fns: Array<(arg: any) => Promise<any>>) =>
  async (value: T): Promise<R> => {
    return fns.reduce<Promise<any>>(
      async (promise, fn) => fn(await promise),
      Promise.resolve(value),
    )
  }

// 错误处理包装器
export const withErrorHandling = <T, R>(
  step: (context: T) => Promise<R>
) => {
  return async (context: T): Promise<R> => {
    try {
      return await step(context)
    } catch (error) {
      console.error(`工作流步骤失败:`, error)
      // 如果context有stream，写入错误信息
      if ('stream' in context && typeof (context as any).stream?.write === 'function') {
        (context as any).stream.write(`❌ 错误: ${error.message}\n`)
      }
      throw error
    }
  }
}

// 步骤计时器
export const withTiming = <T, R>(
  stepName: string,
  step: (context: T) => Promise<R>
) => {
  return async (context: T): Promise<R> => {
    const startTime = Date.now()
    
    // 写入开始信息
    if ('stream' in context && typeof (context as any).stream?.write === 'function') {
      (context as any).stream.write(`⏳ 开始执行: ${stepName}\n`)
    }
    
    try {
      const result = await step(context)
      const duration = Date.now() - startTime
      
      // 写入完成信息
      if ('stream' in context && typeof (context as any).stream?.write === 'function') {
        (context as any).stream.write(`✅ 完成: ${stepName} (${duration}ms)\n\n`)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      // 写入错误信息
      if ('stream' in context && typeof (context as any).stream?.write === 'function') {
        (context as any).stream.write(`❌ 失败: ${stepName} (${duration}ms)\n`)
      }
      
      throw error
    }
  }
}