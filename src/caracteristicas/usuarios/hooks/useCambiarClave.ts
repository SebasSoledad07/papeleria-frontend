import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPut } from "@/api/cliente"
import { claveUsuarios } from "./useUsuarios"

interface Params {
  id: number
  clave: string
}

export function useCambiarClave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, clave }: Params) =>
      apiPut<void>(`/api/usuario/${id}/clave`, { clave }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveUsuarios })
    },
  })
}