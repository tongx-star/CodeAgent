#!/bin/bash

# Docker 构建和测试脚本

echo "🐳 开始构建 Docker 镜像..."

# 构建 Docker 镜像
docker build -t nextjs-ai-workflow .

if [ $? -eq 0 ]; then
    echo "✅ Docker 镜像构建成功！"
    
    echo "🚀 启动容器测试..."
    
    # 检查环境变量文件
    if [ ! -f ".env.local" ]; then
        echo "⚠️  警告: .env.local 文件不存在，将使用示例配置"
        cp env.example .env.local
        echo "📝 请编辑 .env.local 文件并添加您的 DEEPSEEK_API_KEY"
    fi
    
    # 运行容器（后台模式，传入环境变量）
    docker run -d --name nextjs-test -p 3001:3000 --env-file .env.local nextjs-ai-workflow
    
    if [ $? -eq 0 ]; then
        echo "✅ 容器启动成功！"
        
        # 等待应用启动
        echo "⏳ 等待应用启动..."
        sleep 10
        
        # 测试健康检查
        echo "🔍 测试健康检查..."
        health_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
        
        if [ "$health_status" = "200" ]; then
            echo "✅ 健康检查通过！应用运行正常"
            echo "🌐 应用地址: http://localhost:3001"
            
            # 测试AI功能（简单测试）
            echo "🤖 测试AI功能..."
            ai_test=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ai-workflow)
            if [ "$ai_test" = "200" ]; then
                echo "✅ AI工作流页面可访问"
            else
                echo "⚠️  AI工作流页面状态码: $ai_test"
            fi
            
        else
            echo "❌ 健康检查失败，HTTP状态码: $health_status"
            echo "📋 容器日志:"
            docker logs nextjs-test
        fi
        
        # 清理测试容器
        echo "🧹 清理测试容器..."
        docker stop nextjs-test
        docker rm nextjs-test
        
    else
        echo "❌ 容器启动失败！"
        exit 1
    fi
    
else
    echo "❌ Docker 镜像构建失败！"
    exit 1
fi

echo "🎉 Docker 测试完成！" 