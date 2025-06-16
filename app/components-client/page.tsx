"use client";

import { useState } from "react";
import { useComponents, useCreateComponent } from "@/hooks/use-components";

export default function ComponentsClientPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // 使用React Query获取数据
  const { data, isLoading, error } = useComponents({ search, page });
  const createMutation = useCreateComponent();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // 重置页码
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const code = formData.get("code") as string;

    try {
      await createMutation.mutateAsync({ name, description, code });
      setShowCreateForm(false);
    } catch (error) {
      console.error("创建失败:", error);
    }
  };

  if (error) {
    return <div className="text-red-600">加载失败: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">组件库 (客户端版本)</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          创建组件
        </button>
      </div>

      {/* 搜索表单 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索组件..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          搜索
        </button>
      </form>

      {/* 创建表单 */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">创建新组件</h3>
          <input
            name="name"
            placeholder="组件名称"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="description"
            placeholder="组件描述"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <textarea
            name="code"
            placeholder="组件代码"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "创建中..." : "创建"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 组件列表 */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.data.map(
            (component: {
              id: string;
              name: string;
              description: string;
              code: string;
            }) => (
              <div
                key={component.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold">{component.name}</h3>
                <p className="text-gray-600 mt-2">{component.description}</p>
                <div className="mt-4">
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    <code>{component.code}</code>
                  </pre>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* 分页 */}
      {data && (
        <div className="flex justify-center gap-2">
          {Array.from(
            { length: Math.ceil(data.total / data.limit) },
            (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
