import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPut } from "@/api/cliente"

// Reactiva un producto inactivo (RF-07, RN-17).
export function useActivarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiPut<void>(`/api/producto/${id}/activar`, {}),
    onSettled: (_datos, _error, id) => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] })
      void queryClient.invalidateQueries({ queryKey: ["producto", id] })
      void queryClient.invalidateQueries({ queryKey: ["producto-codigo"] })
    },
  })
}