import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Producto } from "@/api/tipos"
import { claveProductoCodigo } from "./claves"

// Busca un producto por codigo leido (RN-14). El precio y el stock deben ser
// los vigentes (RN-08), por eso no se reutiliza la lista en cache.
export function useProductoPorCodigo(codigo: string | null) {
  return useQuery({
    queryKey: claveProductoCodigo(codigo ?? ""),
    queryFn: () =>
      apiGet<Producto>(
        `/api/producto/codigo/${encodeURIComponent(codigo ?? "")}`,
      ),
    enabled: Boolean(codigo),
    retry: false,
  })
}
