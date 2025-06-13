import { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">我的应用</h1>
          <ThemeToggle />
        </div>
        {/* 导航菜单 */}
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="/main" className="block py-2 px-4 rounded hover:bg-gray-700">
                首页
              </a>
            </li>
            <li>
              <a href="/main/codegen" className="block py-2 px-4 rounded hover:bg-gray-700">
                代码生成器
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      
      <main className="flex-1 p-6 overflow-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </main>
    </div>
  )
}