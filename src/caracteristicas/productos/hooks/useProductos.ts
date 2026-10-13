import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Producto } from "@/api/tipos"
import { claveProductos } from "./claves"

// Lista los productos activos o los busca por nombre/marca (RF-06, RN-17).
export function useProductos(texto: string) {
  const q = texto.trim()
  return useQuery({
    queryKey: claveProductos(q),
    queryFn: () =>
      q
        ? apiGet<Producto[]>(
            `/api/producto/buscar?q=${encodeURIComponent(q)}`,
          )
        : apiGet<Producto[]>("/api/producto"),
  })
}
