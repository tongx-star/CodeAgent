# Next.js AI 工作流项目

这是一个基于 Next.js 的 AI 工作流项目，集成了 DeepSeek AI 模型，提供智能代码分析、生成和审查功能。

## 🚀 主要功能

### 1. AI 聊天功能 (`/ai-chat`)
- 基于 DeepSeek Chat 模型的智能对话
- 实时流式响应
- 支持上下文对话

### 2. AI 工作流 (`/ai-workflow`)
- **分析模式**: 仅分析需求和提供建议
- **简单模式**: 分析 + 代码生成
- **完整模式**: 分析 + 代码生成 + 代码审查
- 实时进度显示和流式输出
- 支持取消操作

### 3. 组件管理系统
- 组件列表展示 (`/components`)
- 组件创建和管理
- React Query 缓存优化
- 分页和搜索功能

## 🛠️ 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI集成**: DeepSeek AI SDK (`@ai-sdk/deepseek`)
- **状态管理**: React Query (`@tanstack/react-query`)
- **UI组件**: Radix UI, Lucide React
- **部署**: Docker 支持

## 📦 安装和运行

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp env.example .env.local
# 编辑 .env.local 添加你的 DEEPSEEK_API_KEY

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### Docker 部署

首先确保已配置环境变量：

```bash
# 创建环境变量文件
cp env.example .env.local
# 编辑 .env.local 添加你的 DEEPSEEK_API_KEY
```

然后构建和运行容器：

```bash
# 构建镜像
docker build -t nextjs-ai-workflow .

# 运行容器（传入环境变量）
docker run -p 3000:3000 --env-file .env.local nextjs-ai-workflow
```

或者使用测试脚本：

```bash
./test-docker.sh
```

**重要**: Docker容器必须使用 `--env-file .env.local` 参数来传入环境变量，否则AI功能将无法正常工作。

## 🏗️ 项目架构

### 工作流引擎 (`lib/workflow/`)

```
lib/workflow/
├── types.ts          # 工作流上下文类型定义
├── pipe.ts           # 管道函数和装饰器
├── workflows.ts      # 预定义工作流
└── steps/            # 工作流步骤
    ├── analyze.ts    # AI 需求分析
    ├── generate.ts   # AI 代码生成
    └── review.ts     # AI 代码审查
```

### API 端点

- `GET /api/health` - 健康检查
- `POST /api/ai/chat` - AI 聊天接口
- `POST /api/ai/workflow` - AI 工作流接口
- `GET|POST /api/components` - 组件管理接口

### 组件结构

```
components/
├── ai-chat.tsx       # AI 聊天组件
├── ai-workflow.tsx   # AI 工作流组件
├── loading.tsx       # 加载组件
└── ui/              # UI 基础组件
```

## 🔧 环境变量

创建 `.env.local` 文件并添加以下环境变量：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## 📝 使用示例

### AI 工作流使用

1. 访问 `/ai-workflow` 页面
2. 选择工作流类型：
   - **分析**: 仅分析需求
   - **简单**: 分析 + 生成代码
   - **完整**: 分析 + 生成 + 审查
3. 输入需求描述
4. 点击开始，实时查看处理进度

### API 调用示例

```typescript
// 调用工作流 API
const response = await fetch('/api/ai/workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: '创建一个用户登录组件',
    workflowType: 'full'
  })
})

// 处理流式响应
const reader = response.body?.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const text = new TextDecoder().decode(value)
  console.log(text)
}
```

## 🐳 Docker 信息

项目包含优化的 Dockerfile：
- 多阶段构建减少镜像大小
- standalone 模式自包含部署
- 非特权用户运行（安全）
- 健康检查支持

## 📈 性能优化

- React Query 缓存策略
- Next.js 静态生成优化
- 代码分割和懒加载
- 流式响应减少延迟

## 🔍 监控和调试

- 内置健康检查端点
- 工作流执行时间监控
- 错误处理和重试机制
- TypeScript 严格类型检查

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

更多 Next.js 信息：
- [Next.js 文档](https://nextjs.org/docs)
- [学习 Next.js](https://nextjs.org/learn)
