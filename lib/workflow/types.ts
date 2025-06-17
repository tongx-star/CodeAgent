export interface WorkflowContext {
  stream: {
    write: (message: string) => void;
    close: () => void;
  };
  // 用户输入
  input: {
    prompt: string;
    options?: Record<string, string | number | boolean>;
  };
  // 中间状态
  state?: {
    analysis?: string;
    code?: string;
    review?: string;
  };
}

// 工作流步骤函数类型
export type WorkflowStep<TInput, TOutput> = (
  context: TInput
) => Promise<TOutput>;

// 管道函数类型
export type Pipeline<T, R> = (value: T) => Promise<R>;
