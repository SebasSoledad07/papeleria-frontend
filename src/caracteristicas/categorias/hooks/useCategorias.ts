import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Categoria } from "@/api/tipos"

export const claveCategorias = ["categorias"] as const

export function useCategorias() {
  return useQuery({
    queryKey: claveCategorias,
    queryFn: () => apiGet<Categoria[]>("/api/categoria"),
  })
}