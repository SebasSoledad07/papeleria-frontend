import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { SugerenciaProducto } from "@/api/tipos"

export const claveSugerencia = (codigo: string) => ["catalogo", codigo] as const

// Sugerencia del catálogo externo al escanear un código nuevo (RF-02, RN-16).
// El backend responde 200 con campos null cuando no hay datos externos.
export function useSugerencia(codigo: string | null, habilitado: boolean) {
  return useQuery({
    queryKey: claveSugerencia(codigo ?? ""),
    queryFn: () =>
      apiGet<SugerenciaProducto>(
        `/api/catalogo/codigo/${encodeURIComponent(codigo ?? "")}`,
      ),
    enabled: habilitado && Boolean(codigo),
    retry: false,
  })
}