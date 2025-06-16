// 定义类型
export interface Component {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
}

export interface ComponentsResponse {
  data: Component[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateComponentRequest {
  name: string;
  description: string;
  code?: string;
}

export const componentsService = {
  async getComponents(page: number, limit: number, search: string) {
    const searchParams = new URLSearchParams();
    searchParams.set("page", page.toString());
    searchParams.set("limit", limit.toString());
    searchParams.set("search", search);

    const response = await fetch(`/api/components?${searchParams.toString()}`);
    return response.json();
  },

  async createComponent(data: CreateComponentRequest) {
    const response = await fetch("/api/components", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getComponent(id: string) {
    const response = await fetch(`/api/components/${id}`);
    return response.json();
  },
};
