import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiDelete } from "@/api/cliente"

// Inactiva el producto en lugar de eliminarlo (RF-07, RN-17).
export function useInactivarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/api/producto/${id}`),
    onSettled: (_datos, _error, id) => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] })
      void queryClient.invalidateQueries({ queryKey: ["producto", id] })
      void queryClient.invalidateQueries({ queryKey: ["producto-codigo"] })
    },
  })
}