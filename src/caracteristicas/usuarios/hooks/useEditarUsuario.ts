import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiPut } from "@/api/cliente"
import type { EdicionUsuario, Usuario } from "@/api/tipos"
import { claveUsuarios } from "./useUsuarios"

interface Params {
  id: number
  edicion: EdicionUsuario
}

export function useEditarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, edicion }: Params) =>
      apiPut<Usuario>(`/api/usuario/${id}`, edicion),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: claveUsuarios })
    },
  })
}