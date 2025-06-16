'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { modelConfigs, getModelsByProvider, type AIProvider } from '@/lib/ai-client'
import { Send, Bot, User, Code, MessageCircle, Zap, AlertCircle } from 'lucide-react'

export function AIChat() {
  // 状态管理
  const [provider, setProvider] = useState<AIProvider>('deepseek')
  const [model, setModel] = useState('deepseek-chat')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4000)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 聊天Hook
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    error,
    setMessages,
    reload
  } = useChat({
    api: '/api/ai/chat',
    body: {
      provider,
      model,
      temperature,
      maxTokens
    },
    onError: (error) => {
      console.error('聊天错误:', error)
    },
    onFinish: (message) => {
      console.log('AI回复完成:', message.content.slice(0, 100) + '...')
    }
  })

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 获取当前提供商的模型列表
  const currentModels = getModelsByProvider(provider)

  // 切换提供商时自动选择默认模型
  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider)
    const providerModels = getModelsByProvider(newProvider)
    if (providerModels.length > 0) {
      setModel(providerModels[0].model)
    }
  }

  // 获取当前模型配置
  const currentModelConfig = modelConfigs.find(
    config => config.provider === provider && config.model === model
  )

  // 清空对话
  const handleClearChat = () => {
    setMessages([])
  }

  // 获取提供商图标
  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'deepseek':
        return <Zap className="w-4 h-4" />
      case 'openai':
        return <Bot className="w-4 h-4" />
      case 'anthropic':
        return <MessageCircle className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  // 获取模型图标
  const getModelIcon = (model: string) => {
    if (model.includes('coder')) {
      return <Code className="w-4 h-4" />
    }
    return <MessageCircle className="w-4 h-4" />
  }

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      {/* 标题栏 */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            {getProviderIcon(provider)}
            AI 聊天助手 - {currentModelConfig?.displayName || model}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 配置面板 */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 提供商选择 */}
            <div>
              <label className="text-sm font-medium mb-2 block">AI 提供商</label>
              <select 
                value={provider} 
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="deepseek">🚀 DeepSeek</option>
                <option value="openai">🤖 OpenAI</option>
                <option value="anthropic">🧠 Anthropic</option>
              </select>
            </div>

            {/* 模型选择 */}
            <div>
              <label className="text-sm font-medium mb-2 block">模型</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {currentModels.map(modelConfig => (
                  <option key={modelConfig.model} value={modelConfig.model}>
                    {modelConfig.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* 温度设置 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                温度 ({temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 最大令牌数 */}
            <div>
              <label className="text-sm font-medium mb-2 block">最大令牌数</label>
              <input
                type="number"
                min="100"
                max="8000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* 当前模型信息 */}
          {currentModelConfig && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                {getModelIcon(currentModelConfig.model)}
                <span className="font-medium">{currentModelConfig.displayName}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{currentModelConfig.description}</p>
              <div className="flex flex-wrap gap-1">
                {currentModelConfig.features.map(feature => (
                  <span 
                    key={feature}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 错误显示 */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">错误:</span>
              <span>{error.message}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => reload()} 
              className="mt-2"
            >
              重试
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 消息列表 */}
      <Card className="flex-1 mb-4 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">开始对话</h3>
                <p className="text-sm">
                  试试问我一些问题，比如代码生成、技术解释或创意写作
                </p>
                {provider === 'deepseek' && (
                  <div className="mt-4 space-y-1 text-xs text-gray-400">
                    <p>💡 DeepSeek 特别擅长:</p>
                    <p>• 代码生成和优化</p>
                    <p>• 中文对话和写作</p>
                    <p>• 技术问题解答</p>
                  </div>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* 头像 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-100 text-blue-600' 
                    : provider === 'deepseek'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-green-100 text-green-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    getProviderIcon(provider)
                  )}
                </div>

                {/* 消息内容 */}
                <div className={`flex-1 max-w-3xl ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}>
                    {message.role === 'user' ? '你' : 
                     provider === 'deepseek' ? 'DeepSeek' :
                     provider === 'openai' ? 'GPT' : 'Claude'}
                  </div>
                </div>
              </div>
            ))}
            
            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  provider === 'deepseek'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {getProviderIcon(provider)}
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      {provider === 'deepseek' ? 'DeepSeek' : 'AI'} 正在思考...
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* 输入区域 */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={`向 ${currentModelConfig?.displayName || 'AI'} 提问...`}
              disabled={isLoading}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClearChat}
              disabled={isLoading || messages.length === 0}
            >
              清空
            </Button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500">
            按 Enter 发送，Shift + Enter 换行
          </div>
        </CardContent>
      </Card>
    </div>
  )
}