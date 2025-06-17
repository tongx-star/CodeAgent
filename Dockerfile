# Next.js + AI 工作流项目 Dockerfile
# 基于项目特征优化的多阶段构建

# ===== 构建阶段 =====
FROM node:18-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 复制包管理文件（利用 Docker 缓存层）
COPY package.json package-lock.json* ./

# 安装所有依赖（包括 devDependencies，构建需要）
RUN npm ci

# 复制源代码
COPY . .

# 确保 public 目录存在
RUN mkdir -p ./public

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建项目（会生成 .next/standalone）
RUN npm run build

# ===== 生产运行阶段 =====
FROM node:18-alpine AS runner

WORKDIR /app

# 创建系统用户（安全）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# 定义构建参数
ARG DEEPSEEK_API_KEY=sk-fbbf18ae109d4513a1c7b9399a81eb9c
ARG DEEPSEEK_BASE_URL=https://api.deepseek.com

# 设置生产环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 将构建参数转换为环境变量
ENV DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY
ENV DEEPSEEK_BASE_URL=$DEEPSEEK_BASE_URL


# 复制 Next.js 构建产物
# standalone 模式会创建一个自包含的应用
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 public 目录
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 切换到非特权用户
USER nextjs

# 启动应用
CMD ["node", "server.js"]
