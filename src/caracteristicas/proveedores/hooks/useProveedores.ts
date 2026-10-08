import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Proveedor } from "@/api/tipos"

export const claveProveedores = ["proveedores"] as const

export function useProveedores() {
  return useQuery({
    queryKey: claveProveedores,
    queryFn: () => apiGet<Proveedor[]>("/api/proveedor"),
  })
}