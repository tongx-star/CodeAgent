"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Component } from "@/lib/services/components";

interface ComponentsListProps {
  data: {
    data: Component[];
    total: number;
    page: number;
    limit: number;
  };
}

export function ComponentsList({ data }: ComponentsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // 搜索时重置到第一页
    router.push(`/components?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/components?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* 搜索表单 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* 组件列表 */}
      <div className="grid gap-4">
        {data.data.map((component) => (
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
            <div className="mt-2 text-sm text-gray-500">
              创建时间: {new Date(component.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* 分页 */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 rounded ${
              data.page === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
