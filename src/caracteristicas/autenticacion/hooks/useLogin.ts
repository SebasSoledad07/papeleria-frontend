import { useMutation, useQueryClient } from "@tanstack/react-query"
import { peticionApi } from "@/api/cliente"
import type { Sesion } from "@/api/tipos"
import { claveSesion } from "./useSesion"

export interface Credenciales {
  usuario: string
  clave: string
}

export function useIniciarSesion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credenciales: Credenciales) =>
      peticionApi<Sesion>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credenciales),
      }),
    onSuccess: (sesion) => {
      queryClient.setQueryData(claveSesion, sesion)
    },
  })
}