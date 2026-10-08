import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPut } from "@/api/cliente"
import type { Categoria } from "@/api/tipos"
import { claveCategorias } from "./useCategorias"

interface Params {
  id: number
  nombre: string
}

export function useEditarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nombre }: Params) =>
      apiPut<Categoria>(`/api/categoria/${id}`, { nombre }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveCategorias })
    },
  })
}