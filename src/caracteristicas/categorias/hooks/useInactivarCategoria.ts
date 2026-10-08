import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiDelete } from "@/api/cliente"
import { claveCategorias } from "./useCategorias"

export function useInactivarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiDelete(`/api/categoria/${id}`),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveCategorias })
    },
  })
}