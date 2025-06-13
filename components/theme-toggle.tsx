'use client'

import { useTheme } from '@/components/providers/theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
      aria-label="切换主题"
    >
      <span className="text-xl transition-transform duration-200 hover:scale-110">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  )
}