import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { MovimientoKardex } from "@/api/tipos"

// Kárdex del producto (RF-17).
export function useKardex(productoId: number | null) {
  return useQuery({
    queryKey: ["kardex", productoId],
    queryFn: () =>
      apiGet<MovimientoKardex[]>(
        `/api/inventario/productos/${productoId}/kardex`,
      ),
    enabled: productoId != null,
  })
}