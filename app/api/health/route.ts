import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 简单的健康检查
    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed'
      },
      { status: 500 }
    )
  }
} 