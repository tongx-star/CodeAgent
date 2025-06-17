#!/bin/bash

# Next.js AI 工作流项目快速设置脚本

echo "🚀 欢迎使用 Next.js AI 工作流项目！"
echo "📦 开始设置项目..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js (推荐版本 18+)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  警告: 建议使用 Node.js 18+ 版本，当前版本: $(node -v)"
fi

# 安装依赖
echo "📥 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败！"
    exit 1
fi

# 创建环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚙️  创建环境变量文件..."
    cp env.example .env.local
    echo "✅ 已创建 .env.local 文件"
    echo "📝 请编辑 .env.local 文件并添加您的 DEEPSEEK_API_KEY"
else
    echo "ℹ️  环境变量文件已存在"
fi

# 检查是否已配置 API Key
if ! grep -q "sk-" .env.local 2>/dev/null; then
    echo ""
    echo "🔑 环境配置提醒:"
    echo "   请在 .env.local 文件中设置您的 DEEPSEEK_API_KEY"
    echo "   格式: DEEPSEEK_API_KEY=your_api_key_here"
    echo ""
    echo "   获取 API Key: https://platform.deepseek.com/api_keys"
    echo ""
fi

# 构建项目以验证配置
echo "🔨 验证项目配置..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 项目设置完成！"
    echo ""
    echo "🎉 快速开始:"
    echo "   npm run dev          # 启动开发服务器"
    echo "   npm run build        # 构建生产版本"
    echo "   ./test-docker.sh     # 测试 Docker 构建"
    echo ""
    echo "🌐 访问地址:"
    echo "   主页:       http://localhost:3000"
    echo "   AI 聊天:    http://localhost:3000/ai-chat"
    echo "   AI 工作流:  http://localhost:3000/ai-workflow"
    echo "   组件管理:   http://localhost:3000/components"
    echo ""
    echo "📖 更多信息请查看 README.md"
else
    echo "❌ 项目构建失败，请检查配置或依赖"
    exit 1
fi 