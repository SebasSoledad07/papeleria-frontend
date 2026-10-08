import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPost } from "@/api/cliente"
import type { Categoria } from "@/api/tipos"
import { claveCategorias } from "./useCategorias"

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string) =>
      apiPost<Categoria>("/api/categoria", { nombre }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveCategorias })
    },
  })
}