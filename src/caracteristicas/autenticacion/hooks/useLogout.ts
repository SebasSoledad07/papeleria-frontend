import { useMutation, useQueryClient } from "@tanstack/react-query"
import { peticionApi } from "@/api/cliente"

export function useCerrarSesion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => peticionApi<void>("/api/auth/logout", { method: "POST" }),
    retry: false,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}