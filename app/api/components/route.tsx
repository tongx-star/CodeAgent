import { NextRequest, NextResponse } from "next/server";

// 模拟数据库数据
const mockComponents = [
  {
    id: "1",
    name: "Button Component",
    description: "一个可重用的按钮组件",
    code: `export default function Button({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {children}
    </button>
  )
}`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Card Component",
    description: "一个卡片布局组件",
    code: `export default function Card({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}`,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const filteredComponents = mockComponents.filter((component) =>
    component.name.toLowerCase().includes(search?.toLowerCase() || "")
  );

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedComponents = filteredComponents.slice(startIndex, endIndex);

  return NextResponse.json({
    data: paginatedComponents,
    total: filteredComponents.length,
    page,
    limit,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, code } = body;

  const newComponent = {
    id: (mockComponents.length + 1).toString(),
    name,
    description,
    code,
    createdAt: new Date().toISOString(),
  };

  mockComponents.push(newComponent);

  return NextResponse.json({
    message: "组件创建成功",
    data: newComponent,
  });
}
