import { Suspense } from "react";
import { ComponentsList } from "./components-list";
import { ComponentsLoading } from "./loading";

// 这是一个 Server Component
async function ComponentsData({ searchParams }: {
  searchParams: { search?: string; page?: string }
}) {
  // 在 Server Component 中直接 fetch 数据
  const search = searchParams.search || ''
  const page = parseInt(searchParams.page || '1')
  
  // 直接在服务器端获取数据
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/components?search=${search}&page=${page}`, {
    // 缓存策略
    cache: 'no-store', // 每次都重新获取
    // 或者使用：
    // next: { revalidate: 60 }, // 60秒后重新验证
  })

  if (!response.ok) {
    throw new Error("获取数据失败");
  }

  const data = await response.json()

  return <ComponentsList data={data} />
}

// 主页面组件
export default function ComponentsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">组件库</h1>
      
      <Suspense fallback={<ComponentsLoading />}>
        <ComponentsData searchParams={searchParams} />
      </Suspense>
    </div>
  )
}