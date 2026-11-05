import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Caja } from "@/api/tipos"

export function useCajaAbierta() {
  return useQuery({
    queryKey: ["caja-abierta"],
    queryFn: () => apiGet<Caja>("/api/caja/abierta"),
    retry: false,
  })
}