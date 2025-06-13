'use client'

import { useState } from 'react'

export default function CodegenPage() {
  const [prompt, setPrompt] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    // 模拟 AI 代码生成
    setTimeout(() => {
      setGeneratedCode(`// 根据提示生成的代码：${prompt}
function GeneratedComponent() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>这是根据 "${prompt}" 生成的组件</p>
    </div>
  )
}

export default GeneratedComponent`)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI 代码生成器</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            输入提示词：
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md"
            placeholder="描述你想要生成的组件..."
          />
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '生成中...' : '生成代码'}
        </button>
        
        {generatedCode && (
          <div>
            <label className="block text-sm font-medium mb-2">
              生成的代码：
            </label>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}