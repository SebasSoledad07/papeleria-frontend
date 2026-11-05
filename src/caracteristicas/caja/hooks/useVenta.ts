import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Venta } from "@/api/tipos"

export function useVenta(id: number | null) {
  return useQuery({
    queryKey: ["venta", id],
    queryFn: () => apiGet<Venta>(`/api/venta/${id}`),
    enabled: id != null,
  })
}