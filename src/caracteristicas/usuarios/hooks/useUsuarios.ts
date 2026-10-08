import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/api/cliente"
import type { Usuario } from "@/api/tipos"

export const claveUsuarios = ["usuarios"] as const

export function useUsuarios() {
  return useQuery({
    queryKey: claveUsuarios,
    queryFn: () => apiGet<Usuario[]>("/api/usuario"),
  })
}