import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiDelete } from "@/api/cliente"
import { claveProveedores } from "./useProveedores"

export function useInactivarProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/api/proveedor/${id}`),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveProveedores })
    },
  })
}