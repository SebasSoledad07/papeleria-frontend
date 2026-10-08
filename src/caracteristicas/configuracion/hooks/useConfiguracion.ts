import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Configuracion } from "@/api/tipos"

export const claveConfiguracion = ["configuracion"] as const

export function useConfiguracion() {
  return useQuery({
    queryKey: claveConfiguracion,
    queryFn: () => apiGet<Configuracion[]>("/api/configuracion"),
  })
}