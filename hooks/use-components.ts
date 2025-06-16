"use client";

import {
  componentsService,
  CreateComponentRequest,
} from "@/lib/services/components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 获取组件列表
export function useComponents(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["components", params],
    queryFn: () =>
      componentsService.getComponents(
        params?.page || 1,
        params?.limit || 10,
        params?.search || ""
      ),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateComponentRequest) =>
      componentsService.createComponent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
    },
  });
}

export function useGetComponent(id: string) {
  return useQuery({
    queryKey: ["components", id],
    queryFn: () => componentsService.getComponent(id),
  });
}
