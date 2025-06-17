'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { 
  Play, 
  Square, 
  Code, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react'

type WorkflowType = 'analysis' | 'simple' | 'full'

interface WorkflowStatus {
  isRunning: boolean
  currentStep?: string
  output: string
  error?: string
}

export function AIWorkflow() {
  const [prompt, setPrompt] = useState('')
  const [workflowType, setWorkflowType] = useState<WorkflowType>('full')
  const [status, setStatus] = useState<WorkflowStatus>({
    isRunning: false,
    output: ''
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [status.output])

  // 运行工作流
  const runWorkflow = async () => {
    if (!prompt.trim()) return

    // 创建新的AbortController
    abortControllerRef.current = new AbortController()

    setStatus({
      isRunning: true,
      output: '',
      error: undefined
    })

    try {
      const response = await fetch('/api/ai/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          workflowType
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法读取响应流')
      }

      let output = ''
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        output += chunk
        
        setStatus(prev => ({
          ...prev,
          output
        }))
      }

      setStatus(prev => ({
        ...prev,
        isRunning: false
      }))

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        setStatus(prev => ({
          ...prev,
          isRunning: false,
          output: prev.output + '\n\n⏹️ 工作流已停止\n'
        }))
      } else {
        setStatus(prev => ({
          ...prev,
          isRunning: false,
          error: error instanceof Error ? error.message : '未知错误'
        }))
      }
    }
  }

  // 停止工作流
  const stopWorkflow = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  // 清空输出
  const clearOutput = () => {
    setStatus({
      isRunning: false,
      output: ''
    })
  }

  // 获取工作流类型的描述
  const getWorkflowDescription = (type: WorkflowType) => {
    switch (type) {
      case 'analysis':
        return '只分析需求，不生成代码'
      case 'simple':
        return '需求分析 + 代码生成'
      case 'full':
        return '需求分析 + 代码生成 + 代码审查'
    }
  }

  // 获取工作流类型的图标
  const getWorkflowIcon = (type: WorkflowType) => {
    switch (type) {
      case 'analysis':
        return <Search className="w-4 h-4" />
      case 'simple':
        return <Code className="w-4 h-4" />
      case 'full':
        return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* 标题 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            AI 工作流演示
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 配置区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">工作流配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 工作流类型选择 */}
          <div>
            <label className="text-sm font-medium mb-2 block">工作流类型</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['analysis', 'simple', 'full'] as WorkflowType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setWorkflowType(type)}
                  disabled={status.isRunning}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    workflowType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getWorkflowIcon(type)}
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {getWorkflowDescription(type)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 需求输入 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              需求描述
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要实现的功能，比如：创建一个任务管理组件，支持添加、删除、标记完成等功能"
              disabled={status.isRunning}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={runWorkflow}
              disabled={status.isRunning || !prompt.trim()}
              className="flex items-center gap-2"
            >
              {status.isRunning ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  执行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  开始执行
                </>
              )}
            </Button>
            
            {status.isRunning && (
              <Button
                onClick={stopWorkflow}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                停止
              </Button>
            )}
            
            <Button
              onClick={clearOutput}
              variant="outline"
              disabled={status.isRunning}
            >
              清空输出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 输出区域 */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">工作流输出</CardTitle>
            <div className="flex items-center gap-2">
              {status.isRunning && (
                <Button variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-spin" />
                  执行中
                </Button>
              )}
              {status.error && (
                <Button variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  错误
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={outputRef}
            className="bg-gray-50 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap"
          >
            {status.output || '等待工作流开始执行...'}
            {status.error && (
              <div className="text-red-600 mt-4">
                ❌ 错误: {status.error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 说明信息 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-gray-600">
            <h3 className="font-medium text-gray-900">工作流说明：</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>需求分析：</strong> AI分析用户需求，确定技术方案</li>
              <li><strong>代码生成：</strong> 基于分析结果生成具体实现代码</li>
              <li><strong>代码审查：</strong> 对生成的代码进行质量检查和优化建议</li>
              <li><strong>流式输出：</strong> 实时显示每个步骤的执行过程</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}