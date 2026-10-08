import { useQuery } from "@tanstack/react-query"
import { peticionApi } from "@/api/cliente"
import type { Sesion } from "@/api/tipos"

export const claveSesion = ["usuario"] as const

export function useSesion() {
  return useQuery({
    queryKey: claveSesion,
    queryFn: () => peticionApi<Sesion>("/api/auth/sesion"),
    staleTime: 5 * 60_000,
    retry: false,
  })
}